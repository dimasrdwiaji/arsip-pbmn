import { NextRequest, NextResponse } from "next/server";
import { getDatabase, ensureDbInitialized } from "@/lib/db";
import { hitungJra } from "@/lib/jra";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureDbInitialized();
    const db = getDatabase();
    const id = parseInt(params.id, 10);
    const res = await db.execute({
      sql: "SELECT * FROM archives WHERE id = ?",
      args: [id],
    });
    const row = res.rows[0] as any;

    if (!row) {
      return NextResponse.json({ success: false, message: "Arsip tidak ditemukan" }, { status: 404 });
    }

    const jra = hitungJra(row.tahun, row.kode, row.rubrik, row.judul);
    return NextResponse.json({ success: true, data: { ...row, jra } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureDbInitialized();
    const db = getDatabase();
    const id = parseInt(params.id, 10);
    const body = await req.json();

    const updateSql = `
      UPDATE archives SET
        no_berkas = ?,
        no_urut = ?,
        kode = ?,
        judul = ?,
        uraian = ?,
        tahun = ?,
        jumlah = ?,
        status_fisik = ?,
        box = ?,
        skkaad = ?,
        lokasi = ?,
        rubrik = ?,
        jenis_arsip = ?,
        status_siklus = ?,
        no_ba_musnah = ?,
        file_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.execute({
      sql: updateSql,
      args: [
        body.no_berkas,
        body.no_urut,
        body.kode,
        body.judul,
        body.uraian,
        parseInt(body.tahun, 10),
        body.jumlah,
        body.status_fisik,
        body.box,
        body.skkaad,
        body.lokasi,
        body.rubrik,
        body.jenis_arsip || "INAKTIF",
        body.status_siklus || "DALAM_RETENSI",
        body.no_ba_musnah || null,
        body.file_url || null,
        id,
      ],
    });

    await db.execute({
      sql: "INSERT INTO audit_logs (username, action, target_id, details) VALUES (?, 'UPDATE', ?, ?)",
      args: [body.operator || "Operator", id, `Memperbarui berkas ID #${id}`],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureDbInitialized();
    const db = getDatabase();
    const id = parseInt(params.id, 10);

    const checkRes = await db.execute({
      sql: "SELECT judul FROM archives WHERE id = ?",
      args: [id],
    });
    const old = checkRes.rows[0] as any;

    await db.execute({
      sql: "DELETE FROM archives WHERE id = ?",
      args: [id],
    });

    await db.execute({
      sql: "INSERT INTO audit_logs (username, action, target_id, details) VALUES ('Operator', 'DELETE', ?, ?)",
      args: [id, `Menghapus arsip: ${old?.judul || id}`],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
