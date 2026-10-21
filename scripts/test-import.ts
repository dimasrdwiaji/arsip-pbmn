import { importExcelToDatabase } from "../lib/importer";
import { getDatabase, ensureDbInitialized } from "../lib/db";

async function run() {
  console.log("Memulai import data Excel...");
  const result = await importExcelToDatabase();
  console.log("Hasil Import:", result);

  const db = getDatabase();
  const total = await db.execute("SELECT COUNT(*) as count FROM archives");
  console.log("Total baris tersimpan:", total.rows[0]);

  const samples = await db.execute("SELECT id, no_berkas, kode, judul, tahun, box, skkaad FROM archives LIMIT 5");
  console.log("Contoh 5 data teratas:", samples.rows);
}

run().catch(console.error);
