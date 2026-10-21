import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { hitungJra } from "@/lib/jra";

export async function GET(req: NextRequest) {
  try {
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

    const rows = db.prepare(query).all(...params) as any[];

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
    const db = getDatabase();
    const body = await req.json();

    const stmt = db.prepare(`
      INSERT INTO archives (
        no_berkas, no_urut, kode, judul, uraian, tahun, jumlah,
        status_fisik, box, skkaad, lokasi, rubrik, jenis_arsip, file_url, status_siklus
      ) VALUES (
        @no_berkas, @no_urut, @kode, @judul, @uraian, @tahun, @jumlah,
        @status_fisik, @box, @skkaad, @lokasi, @rubrik, @jenis_arsip, @file_url, 'DALAM_RETENSI'
      )
    `);

    const info = stmt.run({
      no_berkas: body.no_berkas || "1",
      no_urut: body.no_urut || "1",
      kode: body.kode || "-",
      judul: body.judul || "-",
      uraian: body.uraian || "-",
      tahun: parseInt(body.tahun, 10) || new Date().getFullYear(),
      jumlah: body.jumlah || "1 berkas",
      status_fisik: body.status_fisik || "ASLI",
      box: body.box || "BOX 1",
      skkaad: body.skkaad || "Terbuka",
      lokasi: body.lokasi || "Lt.4 Gedung Menteri PU, Bagian PMH BMN",
      rubrik: body.rubrik || "UMUM",
      jenis_arsip: body.jenis_arsip || "INAKTIF",
      file_url: body.file_url || null,
    });

    // Log audit
    db.prepare(`
      INSERT INTO audit_logs (username, action, target_id, details)
      VALUES (?, 'CREATE', ?, ?)
    `).run(body.operator || "Operator", Number(info.lastInsertRowid), `Menambahkan berkas: ${body.judul}`);

    return NextResponse.json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
