import { getDatabase } from "../lib/db";
import { hitungJra } from "../lib/jra";

const db = getDatabase();
const rows = db.prepare("SELECT id, kode, judul, tahun, rubrik FROM archives").all() as any[];

const counts: Record<string, number> = {};
const sampleMusnah: any[] = [];

for (const r of rows) {
  const evalJra = hitungJra(r.tahun, r.kode, r.rubrik, r.judul);
  counts[evalJra.statusJra] = (counts[evalJra.statusJra] || 0) + 1;
  if (evalJra.statusJra === "SIAP_MUSNAH" && sampleMusnah.length < 5) {
    sampleMusnah.push({ ...r, habis: evalJra.tahunHabisRetensi, catatan: evalJra.catatanRetensi });
  }
}

console.log("Distribusi JRA Permen PUPR 26/2021:", counts);
console.log("Contoh 5 arsip yang siap dimusnahkan:", sampleMusnah);
