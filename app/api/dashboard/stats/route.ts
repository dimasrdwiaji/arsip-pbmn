import { NextResponse } from "next/server";
import { getDatabase, ensureDbInitialized, normalizeBox } from "@/lib/db";
import { hitungJra } from "@/lib/jra";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDatabase();

    const res = await db.execute(`
      SELECT id, no_berkas, kode, judul, uraian, tahun, box, skkaad, rubrik, file_url, status_siklus,
             COALESCE(pencipta, 'Internal PUPR') as pencipta,
             COALESCE(kategori_pencipta, 'INTERNAL') as kategori_pencipta,
             COALESCE(jenis_arsip, 'INAKTIF') as jenis_arsip
      FROM archives
    `);
    const allArchives = res.rows as any[];

    let siapMusnahCount = 0;
    let usulPermanenCount = 0;
    let dalamRetensiCount = 0;
    let perluPenilaianCount = 0;
    let pdfCount = 0;
    let aktifCount = 0;
    let inaktifCount = 0;
    let internalCount = 0;
    let eksternalCount = 0;

    const boxCounts: Record<string, number> = {};
    const rubrikCounts: Record<string, number> = {};
    const jraMusnahList: any[] = [];

    for (const item of allArchives) {
      if (item.file_url) pdfCount++;

      if (item.jenis_arsip === "AKTIF") aktifCount++;
      else inaktifCount++;

      if (item.kategori_pencipta === "EKSTERNAL") eksternalCount++;
      else internalCount++;

      // Standardize box
      const b = normalizeBox(item.box);
      boxCounts[b] = (boxCounts[b] || 0) + 1;

      // Rubrik breakdown
      const r = item.rubrik || "Umum";
      rubrikCounts[r] = (rubrikCounts[r] || 0) + 1;

      // JRA evaluation
      const jra = hitungJra(item.tahun, item.kode, item.rubrik, item.judul);
      if (jra.statusJra === "SIAP_MUSNAH") {
        siapMusnahCount++;
        if (jraMusnahList.length < 20) {
          jraMusnahList.push({
            ...item,
            box: b,
            jra,
          });
        }
      } else if (jra.statusJra === "USUL_PERMANEN") {
        usulPermanenCount++;
      } else if (jra.statusJra === "DALAM_RETENSI") {
        dalamRetensiCount++;
      } else {
        perluPenilaianCount++;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalArchives: allArchives.length,
        pdfCount,
        aktifCount,
        inaktifCount,
        internalCount,
        eksternalCount,
        siapMusnahCount,
        usulPermanenCount,
        dalamRetensiCount,
        perluPenilaianCount,
        totalBoxes: Object.keys(boxCounts).length,
        boxCounts,
        rubrikCounts,
        jraMusnahList,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
