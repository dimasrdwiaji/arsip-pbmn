import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getDatabase, ensureDbInitialized } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;
    const archiveId = data.get("archiveId") as string;

    if (!file) {
      return NextResponse.json({ success: false, message: "File PDF tidak ditemukan" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json({ success: false, message: "Hanya file PDF yang diperbolehkan" }, { status: 400 });
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "Ukuran file melebihi batas 25 MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Pada Vercel serverless, gunakan /tmp/uploads jika direktori publik lokal read-only
    let uploadsDir = path.join(process.cwd(), "public", "uploads");
    let fileUrlPrefix = "/uploads";

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch (e) {
      uploadsDir = path.join("/tmp", "uploads");
      fileUrlPrefix = "/uploads";
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    }

    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `${fileUrlPrefix}/${safeName}`;

    if (archiveId) {
      await ensureDbInitialized();
      const db = getDatabase();
      await db.execute({
        sql: "UPDATE archives SET file_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        args: [fileUrl, parseInt(archiveId, 10)],
      });

      await db.execute({
        sql: "INSERT INTO audit_logs (username, action, target_id, details) VALUES ('Operator', 'UPLOAD_PDF', ?, ?)",
        args: [parseInt(archiveId, 10), `Mengunggah berkas PDF: ${file.name}`],
      });
    }

    return NextResponse.json({ success: true, fileUrl });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
