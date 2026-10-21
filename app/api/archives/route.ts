import { NextRequest, NextResponse } from "next/server";
import { getDatabase, ensureDbInitialized } from "@/lib/db";
import { hitungJra } from "@/lib/jra";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDatabase();
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const rubrik = searchParams.get("rubrik") || "";
    const skkaad = searchParams.get("skkaad") || "";
    const jraStatus = searchParams.get("jra") || "";
    const box = searchParams.get("box") || "";
    const tahun = searchParams.get("tahun") || "";

    let query = "SELECT * FROM archives WHERE 1=1";
    const params: any[] = [];

    if (q) {
      query += ` AND (
        LOWER(judul) LIKE ? OR
        LOWER(uraian) LIKE ? OR
        LOWER(kode) LIKE ? OR
        LOWER(no_berkas) LIKE ? OR
        LOWER(box) LIKE ?
      )`;
      const qLike = `%${q}%`;
      params.push(qLike, qLike, qLike, qLike, qLike);
    }

    if (rubrik && rubrik !== "ALL") {
      query += " AND rubrik = ?";
      params.push(rubrik);
    }

    if (skkaad && skkaad !== "ALL") {
      query += " AND skkaad = ?";
      params.push(skkaad);
    }

    if (box && box !== "ALL") {
      query += " AND box = ?";
      params.push(box);
    }

    if (tahun) {
      query += " AND tahun = ?";
      params.push(parseInt(tahun, 10));
    }

    query += " ORDER BY tahun DESC, id ASC";

    const res = await db.execute({ sql: query, args: params });
    const rows = res.rows as any[];

    // Hitung JRA untuk setiap baris
    const results = rows.map((r) => {
      const jra = hitungJra(r.tahun, r.kode, r.rubrik, r.judul);
      return {
        ...r,
        jra,
      };
    });

    // Filter JRA di memory jika ada parameter jra
    const filtered = jraStatus && jraStatus !== "ALL"
      ? results.filter((item) => item.jra.statusJra === jraStatus)
      : results;

    return NextResponse.json({
      success: true,
      total: filtered.length,
      data: filtered,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDatabase();
    const body = await req.json();

    const insertSql = `
      INSERT INTO archives (
        no_berkas, no_urut, kode, judul, uraian, tahun, jumlah,
        status_fisik, box, skkaad, lokasi, rubrik, jenis_arsip, file_url, status_siklus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DALAM_RETENSI')
    `;

    const res = await db.execute({
      sql: insertSql,
      args: [
        body.no_berkas || "1",
        body.no_urut || "1",
        body.kode || "-",
        body.judul || "-",
        body.uraian || "-",
        parseInt(body.tahun, 10) || new Date().getFullYear(),
        body.jumlah || "1 berkas",
        body.status_fisik || "ASLI",
        body.box || "BOX 1",
        body.skkaad || "Terbuka",
        body.lokasi || "Lt.4 Gedung Menteri PU, Bagian PMH BMN",
        body.rubrik || "UMUM",
        body.jenis_arsip || "INAKTIF",
        body.file_url || null,
      ],
    });

    const newId = Number(res.lastInsertRowid || 0);

    // Log audit
    await db.execute({
      sql: "INSERT INTO audit_logs (username, action, target_id, details) VALUES (?, 'CREATE', ?, ?)",
      args: [body.operator || "Operator", newId, `Menambahkan berkas: ${body.judul}`],
    });

    return NextResponse.json({ success: true, id: newId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
