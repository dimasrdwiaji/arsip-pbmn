import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const db = getDatabase();
    const { username, password } = await req.json();

    const user = db.prepare("SELECT id, username, nama_lengkap, role, password FROM users WHERE username = ?").get(username) as any;

    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, message: "Username atau password salah" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
