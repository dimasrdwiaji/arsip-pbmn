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
             status_fisik, box, skkaad, lokasi, rubrik, jenis_arsip, status_siklus
      FROM archives
      ORDER BY tahun DESC, id ASC
    `);
    const rows = res.rows as any[];

    const exportData = rows.map((r, idx) => {
      const jra = hitungJra(r.tahun, r.kode, r.rubrik, r.judul);
      return {
        "No": idx + 1,
        "No Berkas": r.no_berkas,
        "No Urut": r.no_urut,
        "Kode Klasifikasi": r.kode,
        "Indeks / Judul": r.judul,
        "Uraian Masalah / Kegiatan": r.uraian,
        "Tahun": r.tahun,
        "Jumlah": r.jumlah,
        "Asli / Copy": r.status_fisik,
        "Box": r.box,
        "SKKAAD": r.skkaad,
        "Lokasi Simpan": r.lokasi,
        "Rubrik / Kategori": r.rubrik,
        "Status JRA (Permen PUPR 26/2021)": jra.badgeLabel,
        "Nasib Akhir": jra.nasibAkhir,
        "Masa Retensi (Tahun)": jra.tahunHabisRetensi,
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
