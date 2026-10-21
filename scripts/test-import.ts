import { getDatabase } from "../lib/db";
import { importExcelToDatabase } from "../lib/importer";

console.log("Memulai import data Excel...");
const result = importExcelToDatabase();
console.log("Hasil Import:", result);

const db = getDatabase();
const total = db.prepare("SELECT COUNT(*) as count FROM archives").get() as { count: number };
console.log("Total baris tersimpan di SQLite:", total.count);

const samples = db.prepare("SELECT id, no_berkas, kode, judul, tahun, box, skkaad FROM archives LIMIT 5").all();
console.log("Contoh 5 data teratas:", samples);
