import { NextRequest, NextResponse } from "next/server";
import { getDatabase, ensureDbInitialized } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDatabase();

    const res = await db.execute("SELECT id, username, nama_lengkap, role, COALESCE(status, 'Aktif') as status, created_at FROM users ORDER BY id ASC");
    return NextResponse.json({
      success: true,
      data: res.rows,
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

    const { username, password, nama_lengkap, role, status, operator } = body;

    if (!username || !password || !nama_lengkap) {
      return NextResponse.json(
        { success: false, message: "Username, password, dan nama lengkap wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanRole = ["ADMIN", "OPERATOR", "VERIFIKATOR"].includes(role) ? role : "OPERATOR";
    const cleanStatus = status === "Nonaktif" ? "Nonaktif" : "Aktif";

    // Cek duplikasi username
    const check = await db.execute({
      sql: "SELECT id FROM users WHERE username = ?",
      args: [cleanUsername],
    });

    if (check.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: `Username '${cleanUsername}' sudah digunakan.` },
        { status: 400 }
      );
    }

    const insertRes = await db.execute({
      sql: "INSERT INTO users (username, password, nama_lengkap, role, status) VALUES (?, ?, ?, ?, ?)",
      args: [cleanUsername, password, nama_lengkap.trim(), cleanRole, cleanStatus],
    });

    const newId = Number(insertRes.lastInsertRowid || 0);

    await db.execute({
      sql: "INSERT INTO audit_logs (username, action, target_id, details) VALUES (?, 'CREATE_USER', ?, ?)",
      args: [operator || "Admin", newId, `Membuat akun baru: ${cleanUsername} (${cleanRole})`],
    });

    return NextResponse.json({
      success: true,
      id: newId,
      message: `Akun ${cleanUsername} berhasil dibuat.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
