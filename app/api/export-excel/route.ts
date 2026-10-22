import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getDatabase, ensureDbInitialized } from "@/lib/db";
import { hitungJra } from "@/lib/jra";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDatabase();
    const res = await db.execute(`
      SELECT id, no_berkas, no_urut, kode, judul, uraian, tahun, jumlah,
             status_fisik, box, skkaad, lokasi, rubrik, jenis_arsip, status_siklus,
             pencipta, kategori_pencipta_3, file_url
      FROM archives
      ORDER BY CAST(no_berkas AS INTEGER) ASC, id ASC
    `);
    const rows = res.rows as any[];

    const exportData = rows.map((r, idx) => {
      const jra = hitungJra(r.tahun, r.kode, r.rubrik, r.judul);
      return {
        "No Berkas": r.no_berkas,
        "No Urut": r.no_urut,
        "Kode": r.kode,
        "Indeks / Judul": r.judul,
        "Uraian Masalah / Kegiatan": r.uraian,
        "Tahun": r.tahun,
        "Jumlah": r.jumlah || "1 berkas",
        "Asli / Copy": r.status_fisik || "ASLI",
        "Boks": r.box,
        "SKKAAD": r.skkaad || "Terbuka",
        "Lokasi Simpan": r.lokasi || "Lt.4 Gedung Menteri PU, Bagian PMH BMN",
        "Pencipta": r.pencipta || "Biro Pengelolaan BMN",
        "Kategori Pencipta": r.kategori_pencipta_3 || "Biro PBMN",
        "Masa Retensi": jra.tahunHabisRetensi,
        "Status JRA": jra.badgeLabel,
        "Dokumen Online": r.file_url || "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DAFTAR ARSIP BMN");

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="DAFTAR_ARSIP_PBMN_JRA.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
