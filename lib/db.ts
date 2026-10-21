import { createClient, Client } from "@libsql/client";
import path from "path";
import fs from "fs";

let dbInstance: Client | null = null;
let isInitialized = false;

export function getDatabase(): Client {
  if (dbInstance) {
    return dbInstance;
  }

  // Jika di Vercel atau produksi menggunakan Turso Cloud URL, pakai itu.
  // Jika tidak ada TURSO_DATABASE_URL, fallback ke file lokal data/arsip.db
  const url = process.env.TURSO_DATABASE_URL || "file:data/arsip.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url.startsWith("file:")) {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
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

  isInitialized = true;
}
