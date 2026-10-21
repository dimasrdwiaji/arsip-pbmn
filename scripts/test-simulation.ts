import os from "os";
import path from "path";
import fs from "fs";

async function testSimulate() {
  process.env.VERCEL = "1";
  const { ensureDbInitialized, getDatabase } = await import("../lib/db");
  await ensureDbInitialized();
  const db = getDatabase();
  const count = await db.execute("SELECT COUNT(*) as count FROM archives");
  console.log("Simulation Vercel auto-seed result:", count.rows[0]);
}

testSimulate().catch(console.error);
