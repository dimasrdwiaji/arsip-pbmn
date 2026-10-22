import { NextRequest, NextResponse } from "next/server";
import { getDatabase, ensureDbInitialized, normalizeBox } from "@/lib/db";
import { hitungJra } from "@/lib/jra";
import { classifyCreator } from "@/lib/creator";

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
    let kat3 = row.kategori_pencipta_3;
    if (!kat3) {
      kat3 = classifyCreator(row.judul, row.uraian, row.rubrik, row.pencipta).kategori;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...row,
        box: normalizeBox(row.box),
        kategori_pencipta_3: kat3,
        jra,
      },
    });
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

    const creatorCls = classifyCreator(body.judul || "", body.uraian || "", body.rubrik || "", body.pencipta || "");
    const kat3 = body.kategori_pencipta_3 || creatorCls.kategori;
    const kat2 = kat3 === "Eksternal" ? "EKSTERNAL" : "INTERNAL";
    const pencipta = body.pencipta || creatorCls.namaLengkap;

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
        pencipta = ?,
        kategori_pencipta = ?,
        kategori_pencipta_3 = ?,
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
        normalizeBox(body.box),
        body.skkaad,
        body.lokasi,
        body.rubrik,
        body.jenis_arsip || "INAKTIF",
        body.status_siklus || "DALAM_RETENSI",
        body.no_ba_musnah || null,
        body.file_url || null,
        pencipta,
        kat2,
        kat3,
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
    const item = checkRes.rows[0] as any;

    if (!item) {
      return NextResponse.json({ success: false, message: "Arsip tidak ditemukan" }, { status: 404 });
    }

    await db.execute({
      sql: "DELETE FROM archives WHERE id = ?",
      args: [id],
    });

    await db.execute({
      sql: "INSERT INTO audit_logs (username, action, target_id, details) VALUES ('Operator', 'DELETE', ?, ?)",
      args: [id, `Menghapus arsip: ${item.judul}`],
    });

    return NextResponse.json({ success: true, message: "Arsip berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
