import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";
import { getDatabase, ensureDbInitialized, normalizeBox } from "./db";

export function detectPencipta(uraian: string = "", judul: string = ""): { pencipta: string; kategori_pencipta: "INTERNAL" | "EKSTERNAL" } {
  const text = (uraian + " " + judul).toLowerCase();

  if (text.includes("kementerian agama") || text.includes("kemenag")) return { pencipta: "Kementerian Agama RI", kategori_pencipta: "EKSTERNAL" };
  if (text.includes("kementerian keuangan") || text.includes("kemenkeu")) return { pencipta: "Kementerian Keuangan RI", kategori_pencipta: "EKSTERNAL" };
  if (text.includes("pertanahan") || text.includes("bpn")) return { pencipta: "Kantor Pertanahan / BPN", kategori_pencipta: "EKSTERNAL" };
  if (text.includes("polda") || text.includes("kepolisian") || text.includes("polres")) return { pencipta: "Kepolisian RI", kategori_pencipta: "EKSTERNAL" };
  if (text.includes("pengadilan") || text.includes("mahkamah konstitusi") || text.includes("kejaksaan")) return { pencipta: "Lembaga Peradilan / MK", kategori_pencipta: "EKSTERNAL" };
  if (text.includes("walikota") || text.includes("bupati") || text.includes("pemerintah kota") || text.includes("pemda") || text.includes("provinsi")) return { pencipta: "Pemerintah Daerah", kategori_pencipta: "EKSTERNAL" };
  if (text.includes("pjt ii") || text.includes("pt ") || text.includes("lsm") || text.includes("warga")) return { pencipta: "Mitra / Pihak Ketiga", kategori_pencipta: "EKSTERNAL" };
  if (text.includes("bnpp") || text.includes("badan nasional")) return { pencipta: "BNPP RI", kategori_pencipta: "EKSTERNAL" };
  if (text.includes("setneg") || text.includes("sekretariat negara")) return { pencipta: "Kemensetneg RI", kategori_pencipta: "EKSTERNAL" };
  if (text.includes("bpk ")) return { pencipta: "BPK RI", kategori_pencipta: "EKSTERNAL" };

  if (text.includes("bu karo") || text.includes("kepala biro")) return { pencipta: "Biro PBMN (Pimpinan)", kategori_pencipta: "INTERNAL" };
  if (text.includes("cipta karya")) return { pencipta: "Ditjen Cipta Karya PUPR", kategori_pencipta: "INTERNAL" };
  if (text.includes("sumber daya air") || text.includes("ditjen sda")) return { pencipta: "Ditjen SDA PUPR", kategori_pencipta: "INTERNAL" };
  if (text.includes("bina marga")) return { pencipta: "Ditjen Bina Marga PUPR", kategori_pencipta: "INTERNAL" };
  if (text.includes("sekretariat jenderal") || text.includes("sekjen")) return { pencipta: "Sekretariat Jenderal PUPR", kategori_pencipta: "INTERNAL" };
  if (text.includes("biro pbmn") || text.includes("pmh bmn")) return { pencipta: "Bagian PMH Biro PBMN", kategori_pencipta: "INTERNAL" };
  if (text.includes("kementerian pu") || text.includes("pupr") || text.includes("departemen pu")) return { pencipta: "Kementerian PUPR", kategori_pencipta: "INTERNAL" };

  return { pencipta: "Internal PUPR", kategori_pencipta: "INTERNAL" };
}

export async function importExcelToDatabase(filePath?: string): Promise<{ success: boolean; totalImported: number; message: string }> {
  await ensureDbInitialized();
  const db = getDatabase();
  const targetFile = filePath || path.join(process.cwd(), "DAFTAR ARSIP INAKTIF_PMH BMN.xlsx");

  if (!fs.existsSync(targetFile)) {
    return { success: false, totalImported: 0, message: `File tidak ditemukan di ${targetFile}` };
  }

  const workbook = XLSX.readFile(targetFile, { cellDates: true });
  const sheetsToImport = [
    { name: "DAFTAR ARSIP INAKTIF (RUBRIK)", jenis: "INAKTIF", defaultRubrik: "RUBRIK" },
    { name: "DAFTAR ARSIP INAKTIF_UMUM", jenis: "INAKTIF", defaultRubrik: "UMUM" },
    { name: "DAFTAR ARSIP BU KARO", jenis: "AKTIF", defaultRubrik: "TATA KELOLA & PIMPINAN" },
  ];

  const batchStatements: any[] = [];
  batchStatements.push({ sql: "DELETE FROM archives", args: [] });

  let totalImported = 0;

  for (const sheetInfo of sheetsToImport) {
    const sheet = workbook.Sheets[sheetInfo.name];
    if (!sheet) continue;

    const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    let currentSection = sheetInfo.defaultRubrik;
    let lastKnownBox = "BOX 1";
    let lastKnownLokasi = "Lt.4 Gedung Menteri PU, Ruang Kerja Bagian PMH BMN";

    for (let r = 0; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length === 0) continue;

      const col0 = String(row[0] || "").trim();
      const col1 = String(row[1] || "").trim();
      const col2 = String(row[2] || "").trim();
      const col3 = String(row[3] || "").trim();
      const col4 = String(row[4] || "").trim();
      const col5 = String(row[5] || "").trim();
      const col6 = String(row[6] || "").trim();
      const col7 = String(row[7] || "").trim();
      const col8 = String(row[8] || "").trim();
      const col9 = String(row[9] || "").trim();
      const col10 = String(row[10] || "").trim();

      if (
        col0.startsWith("DAFTAR ARSIP") ||
        col0.startsWith("UNIT KERJA") ||
        col0.startsWith("TAHUN ..") ||
        col0 === "NO BERKAS" ||
        col7 === "ASLI/COPY"
      ) {
        continue;
      }

      const isSectionHeader =
        col0 &&
        !col1 &&
        !col2 &&
        !col4 &&
        (isNaN(Number(col0)) || col0.toUpperCase().includes("TAHUN") || col0.toUpperCase().includes("SURAT"));

      if (isSectionHeader) {
        currentSection = col0;
        continue;
      }

      if (!col3 && !col4) continue;

      let tahunVal = parseInt(col5, 10);
      if (isNaN(tahunVal) || tahunVal < 1950 || tahunVal > 2099) {
        const matchYear = (col4 + " " + col3).match(/\b(19\d\d|20\d\d)\b/);
        tahunVal = matchYear ? parseInt(matchYear[1], 10) : 2020;
      }

      const boxVal = col8 || lastKnownBox;
      if (col8) lastKnownBox = col8;

      const lokasiVal = col10 || lastKnownLokasi;
      if (col10) lastKnownLokasi = col10;

      let skkaadVal = col9 || "Terbuka";
      if (skkaadVal.toUpperCase().includes("BATAS")) skkaadVal = "Terbatas";
      else if (skkaadVal.toUpperCase().includes("RAHASIA")) skkaadVal = "Rahasia";
      else skkaadVal = "Terbuka";

      let statusFisik = col7.toUpperCase().includes("COPY") ? "COPY" : "ASLI";
      const pInfo = detectPencipta(col4, col3);

      batchStatements.push({
        sql: `INSERT INTO archives (
          no_berkas, no_urut, kode, judul, uraian, tahun, jumlah,
          status_fisik, box, skkaad, lokasi, rubrik, jenis_arsip, status_siklus,
          pencipta, kategori_pencipta
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DALAM_RETENSI', ?, ?)`,
        args: [
          col0 || "1",
          col1 || "1",
          col2 || "-",
          col3 || col4.substring(0, 80),
          col4 || col3,
          tahunVal,
          col6 || "1 berkas",
          statusFisik,
          normalizeBox(boxVal),
          skkaadVal,
          lokasiVal,
          currentSection,
          sheetInfo.jenis,
          pInfo.pencipta,
          pInfo.kategori_pencipta,
        ],
      });

      totalImported++;
    }
  }

  // Jalankan dalam potongan batch (chunks) 100 statements agar aman di semua protokol
  const chunkSize = 100;
  for (let i = 0; i < batchStatements.length; i += chunkSize) {
    const chunk = batchStatements.slice(i, i + chunkSize);
    await db.batch(chunk, "write");
  }

  await db.execute({
    sql: "INSERT INTO audit_logs (username, action, details) VALUES ('SYSTEM', 'IMPORT_EXCEL', ?)",
    args: [`Berhasil mengimpor ${totalImported} berkas arsip dari spreadsheet`],
  });

  return {
    success: true,
    totalImported,
    message: `Berhasil mengimpor ${totalImported} berkas arsip ke database.`,
  };
}
