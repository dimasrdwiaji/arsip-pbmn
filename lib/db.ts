import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "arsip.db");
  const db = new Database(dbPath);

  // Optimasi performa SQLite
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Inisialisasi Skema Tabel
  db.exec(`
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

  // Seed default users jika belum ada
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (username, password, nama_lengkap, role)
      VALUES (?, ?, ?, ?)
    `);
    insertUser.run("admin", "admin123", "Administrator PBMN", "ADMIN");
    insertUser.run("petugas", "petugas123", "Arsiparis PMH", "OPERATOR");
  }

  dbInstance = db;
  return dbInstance;
}
