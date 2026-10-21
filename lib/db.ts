import { createClient, Client } from "@libsql/client";
import path from "path";
import fs from "fs";
import os from "os";
import seedArchives from "@/data/seed-archives.json";

let dbInstance: Client | null = null;
let isInitialized = false;

export function getDatabase(): Client {
  if (dbInstance) {
    return dbInstance;
  }

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  let url = tursoUrl;

  if (!url) {
    // Deteksi lingkungan Vercel serverless / AWS Lambda
    const isServerless = process.env.VERCEL === "1" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isServerless) {
      // Di Vercel Serverless, hanya direktori /tmp yang diizinkan untuk read/write
      const dbPath = path.join(os.tmpdir(), "arsip.db");
      url = `file:${dbPath}`;
    } else {
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      url = `file:${path.join(dataDir, "arsip.db")}`;
    }
  }

  const client = createClient({
    url,
    authToken,
  });

  dbInstance = client;
  return dbInstance;
}

export async function ensureDbInitialized(): Promise<void> {
  if (isInitialized) return;
  const db = getDatabase();

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS archives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no_berkas TEXT,
      no_urut TEXT,
      kode TEXT,
      judul TEXT,
      uraian TEXT,
      tahun INTEGER,
      jumlah TEXT,
      status_fisik TEXT,
      box TEXT,
      skkaad TEXT DEFAULT 'Terbuka',
      lokasi TEXT,
      rubrik TEXT,
      jenis_arsip TEXT DEFAULT 'INAKTIF',
      file_url TEXT,
      status_siklus TEXT DEFAULT 'DALAM_RETENSI',
      no_ba_musnah TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nama_lengkap TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'OPERATOR',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      target_id INTEGER,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_archives_tahun ON archives(tahun);
    CREATE INDEX IF NOT EXISTS idx_archives_box ON archives(box);
    CREATE INDEX IF NOT EXISTS idx_archives_kode ON archives(kode);
    CREATE INDEX IF NOT EXISTS idx_archives_skkaad ON archives(skkaad);
  `);

  // Pastikan user admin dan petugas ada
  const userCount = await db.execute("SELECT COUNT(*) as count FROM users");
  if (Number(userCount.rows[0]?.count || 0) === 0) {
    await db.execute({
      sql: "INSERT INTO users (username, password, nama_lengkap, role) VALUES (?, ?, ?, ?)",
      args: ["admin", "admin123", "Administrator PBMN", "ADMIN"],
    });
    await db.execute({
      sql: "INSERT INTO users (username, password, nama_lengkap, role) VALUES (?, ?, ?, ?)",
      args: ["petugas", "petugas123", "Arsiparis PMH", "OPERATOR"],
    });
  }

  // Auto-seeding arsip jika tabel kosong (misal pertama kali deploy di Vercel / serverless / Turso)
  const archiveCount = await db.execute("SELECT COUNT(*) as count FROM archives");
  if (Number(archiveCount.rows[0]?.count || 0) === 0 && Array.isArray(seedArchives) && seedArchives.length > 0) {
    console.log(`Auto-seeding ${seedArchives.length} rekaman arsip ke database...`);
    
    const batchStatements = seedArchives.map((item: any) => ({
      sql: `INSERT INTO archives (
        id, no_berkas, no_urut, kode, judul, uraian, tahun, jumlah,
        status_fisik, box, skkaad, lokasi, rubrik, jenis_arsip, file_url, status_siklus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.id,
        item.no_berkas || "1",
        item.no_urut || "1",
        item.kode || "-",
        item.judul || "-",
        item.uraian || "-",
        item.tahun || 2020,
        item.jumlah || "1 berkas",
        item.status_fisik || "ASLI",
        item.box || "BOX 1",
        item.skkaad || "Terbuka",
        item.lokasi || "Lt.4 Gedung Menteri PU, Bagian PMH BMN",
        item.rubrik || "UMUM",
        item.jenis_arsip || "INAKTIF",
        item.file_url || null,
        item.status_siklus || "DALAM_RETENSI",
      ],
    }));

    const chunkSize = 100;
    for (let i = 0; i < batchStatements.length; i += chunkSize) {
      const chunk = batchStatements.slice(i, i + chunkSize);
      await db.batch(chunk, "write");
    }

    await db.execute({
      sql: "INSERT INTO audit_logs (username, action, details) VALUES ('SYSTEM', 'AUTO_SEED', ?)",
      args: [`Berhasil menginisialisasi ${seedArchives.length} arsip awal`],
    });

    console.log(`Auto-seeding selesai: ${seedArchives.length} arsip terdaftar.`);
  }

  isInitialized = true;
}
