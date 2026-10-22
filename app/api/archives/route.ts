import { NextRequest, NextResponse } from "next/server";
import { getDatabase, ensureDbInitialized, normalizeBox } from "@/lib/db";
import { hitungJra } from "@/lib/jra";
import { classifyCreator } from "@/lib/creator";

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
    const kode = searchParams.get("kode") || "";
    const penciptaKategori = searchParams.get("kategori_pencipta") || "";
    const jenisArsip = searchParams.get("jenis_arsip") || "";

    let query = "SELECT * FROM archives WHERE 1=1";
    const params: any[] = [];

    if (q) {
      query += ` AND (
        LOWER(judul) LIKE ? OR
        LOWER(uraian) LIKE ? OR
        LOWER(kode) LIKE ? OR
        LOWER(no_berkas) LIKE ? OR
        LOWER(box) LIKE ? OR
        LOWER(COALESCE(pencipta, '')) LIKE ?
      )`;
      const qLike = `%${q}%`;
      params.push(qLike, qLike, qLike, qLike, qLike, qLike);
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
      const stdBox = normalizeBox(box);
      query += " AND (box = ? OR box = ? OR box = ?)";
      params.push(stdBox, box, box.replace("Box ", "BOX "));
    }

    if (tahun && tahun !== "ALL") {
      query += " AND tahun = ?";
      params.push(parseInt(tahun, 10));
    }

    if (kode && kode !== "ALL") {
      query += " AND (REPLACE(kode, ' ', '') LIKE ?)";
      params.push(`%${kode.replace(/\s+/g, '')}%`);
    }

    if (jenisArsip && jenisArsip !== "ALL") {
      query += " AND jenis_arsip = ?";
      params.push(jenisArsip);
    }

    query += " ORDER BY tahun DESC, id ASC";

    const res = await db.execute({ sql: query, args: params });
    const rows = res.rows as any[];

    // Hitung JRA dan lengkapi kategori pencipta 3 tingkat
    let results = rows.map((r) => {
      const jra = hitungJra(r.tahun, r.kode, r.rubrik, r.judul);
      let kat3 = r.kategori_pencipta_3;
      if (!kat3) {
        kat3 = classifyCreator(r.judul, r.uraian, r.rubrik, r.pencipta).kategori;
      }
      return {
        ...r,
        box: normalizeBox(r.box),
        kategori_pencipta_3: kat3,
        jra,
      };
    });

    // Filter Pencipta (mendukung 'Biro PBMN', 'Kementerian PU', 'Eksternal')
    if (penciptaKategori && penciptaKategori !== "ALL") {
      results = results.filter((item) => {
        if (penciptaKategori === "INTERNAL") {
          return item.kategori_pencipta === "INTERNAL" || item.kategori_pencipta_3 !== "Eksternal";
        }
        if (penciptaKategori === "EKSTERNAL") {
          return item.kategori_pencipta === "EKSTERNAL" || item.kategori_pencipta_3 === "Eksternal";
        }
        return item.kategori_pencipta_3 === penciptaKategori;
      });
    }

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

    const creatorCls = classifyCreator(body.judul || "", body.uraian || "", body.rubrik || "", body.pencipta || "");
    const kat3 = body.kategori_pencipta_3 || creatorCls.kategori;
    const kat2 = kat3 === "Eksternal" ? "EKSTERNAL" : "INTERNAL";
    const pencipta = body.pencipta || creatorCls.namaLengkap;

    const insertSql = `
      INSERT INTO archives (
        no_berkas, no_urut, kode, judul, uraian, tahun, jumlah,
        status_fisik, box, skkaad, lokasi, rubrik, jenis_arsip, file_url, status_siklus,
        pencipta, kategori_pencipta, kategori_pencipta_3
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DALAM_RETENSI', ?, ?, ?)
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
        normalizeBox(body.box),
        body.skkaad || "Terbuka",
        body.lokasi || "Lt.4 Gedung Menteri PU, Bagian PMH BMN",
        body.rubrik || "UMUM",
        body.jenis_arsip || "INAKTIF",
        body.file_url || null,
        pencipta,
        kat2,
        kat3,
      ],
    });

    const newId = Number(res.lastInsertRowid || 0);

    await db.execute({
      sql: "INSERT INTO audit_logs (username, action, target_id, details) VALUES (?, 'CREATE', ?, ?)",
      args: [body.operator || "Operator", newId, `Menambahkan berkas: ${body.judul}`],
    });

    return NextResponse.json({ success: true, id: newId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
