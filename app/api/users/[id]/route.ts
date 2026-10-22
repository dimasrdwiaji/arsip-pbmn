import { NextRequest, NextResponse } from "next/server";
import { getDatabase, ensureDbInitialized } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureDbInitialized();
    const db = getDatabase();
    const id = parseInt(params.id, 10);
    const body = await req.json();

    const { nama_lengkap, role, status, password, operator } = body;

    const userRes = await db.execute({
      sql: "SELECT id, username FROM users WHERE id = ?",
      args: [id],
    });
    const targetUser = userRes.rows[0] as any;
    if (!targetUser) {
      return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    let updateSql = `
      UPDATE users SET
        nama_lengkap = COALESCE(?, nama_lengkap),
        role = COALESCE(?, role),
        status = COALESCE(?, status)
    `;
    const args: any[] = [nama_lengkap || null, role || null, status || null];

    if (password && String(password).trim().length > 0) {
      updateSql += `, password = ?`;
      args.push(String(password).trim());
    }

    updateSql += ` WHERE id = ?`;
    args.push(id);

    await db.execute({ sql: updateSql, args });

    await db.execute({
      sql: "INSERT INTO audit_logs (username, action, target_id, details) VALUES (?, 'UPDATE_USER', ?, ?)",
      args: [operator || "Admin", id, `Memperbarui akun pengguna ID #${id} (${targetUser.username})`],
    });

    return NextResponse.json({
      success: true,
      message: `Akun ${targetUser.username} berhasil diperbarui.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureDbInitialized();
    const db = getDatabase();
    const id = parseInt(params.id, 10);
    const { searchParams } = new URL(req.url);
    const operator = searchParams.get("operator") || "Admin";

    // Cegah menghapus user admin utama (id = 1 atau username = admin)
    const check = await db.execute({
      sql: "SELECT id, username FROM users WHERE id = ?",
      args: [id],
    });
    const user = check.rows[0] as any;

    if (!user) {
      return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    if (user.username === "admin" || user.id === 1) {
      return NextResponse.json(
        { success: false, message: "Akun Super Administrator utama ('admin') tidak dapat dihapus." },
        { status: 403 }
      );
    }

    await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id],
    });

    await db.execute({
      sql: "INSERT INTO audit_logs (username, action, target_id, details) VALUES (?, 'DELETE_USER', ?, ?)",
      args: [operator, id, `Menghapus akun pengguna ${user.username}`],
    });

    return NextResponse.json({
      success: true,
      message: `Akun ${user.username} berhasil dihapus.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
