import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { hitungJra } from "@/lib/jra";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const id = parseInt(params.id, 10);
    const row = db.prepare("SELECT * FROM archives WHERE id = ?").get(id) as any;

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
    const db = getDatabase();
    const id = parseInt(params.id, 10);
    const body = await req.json();

    const stmt = db.prepare(`
      UPDATE archives SET
        no_berkas = @no_berkas,
        no_urut = @no_urut,
        kode = @kode,
        judul = @judul,
        uraian = @uraian,
        tahun = @tahun,
        jumlah = @jumlah,
        status_fisik = @status_fisik,
        box = @box,
        skkaad = @skkaad,
        lokasi = @lokasi,
        rubrik = @rubrik,
        jenis_arsip = @jenis_arsip,
        status_siklus = @status_siklus,
        no_ba_musnah = @no_ba_musnah,
        file_url = @file_url,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    stmt.run({
      id,
      no_berkas: body.no_berkas,
      no_urut: body.no_urut,
      kode: body.kode,
      judul: body.judul,
      uraian: body.uraian,
      tahun: parseInt(body.tahun, 10),
      jumlah: body.jumlah,
      status_fisik: body.status_fisik,
      box: body.box,
      skkaad: body.skkaad,
      lokasi: body.lokasi,
      rubrik: body.rubrik,
      jenis_arsip: body.jenis_arsip || "INAKTIF",
      status_siklus: body.status_siklus || "DALAM_RETENSI",
      no_ba_musnah: body.no_ba_musnah || null,
      file_url: body.file_url || null,
    });

    db.prepare(`
      INSERT INTO audit_logs (username, action, target_id, details)
      VALUES (?, 'UPDATE', ?, ?)
    `).run(body.operator || "Operator", id, `Memperbarui berkas ID #${id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const id = parseInt(params.id, 10);

    const old = db.prepare("SELECT judul FROM archives WHERE id = ?").get(id) as any;
    db.prepare("DELETE FROM archives WHERE id = ?").run(id);

    db.prepare(`
      INSERT INTO audit_logs (username, action, target_id, details)
      VALUES ('Operator', 'DELETE', ?, ?)
    `).run(id, `Menghapus arsip: ${old?.judul || id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
