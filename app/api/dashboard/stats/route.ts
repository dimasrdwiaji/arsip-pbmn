import { NextResponse } from "next/server";
import { getDatabase, ensureDbInitialized } from "@/lib/db";
import { hitungJra } from "@/lib/jra";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDatabase();

    const res = await db.execute(`
      SELECT id, no_berkas, kode, judul, uraian, tahun, box, skkaad, rubrik, file_url, status_siklus
      FROM archives
    `);
    const allArchives = res.rows as any[];

    let siapMusnahCount = 0;
    let usulPermanenCount = 0;
    let dalamRetensiCount = 0;
    let perluPenilaianCount = 0;
    let pdfCount = 0;

    const boxCounts: Record<string, number> = {};
    const rubrikCounts: Record<string, number> = {};
    const jraMusnahList: any[] = [];

    for (const item of allArchives) {
      if (item.file_url) pdfCount++;

      // Box breakdown
      const b = item.box || "BOX Lainnya";
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
