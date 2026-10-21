import { getDatabase } from "../lib/db";
import fs from "fs";

async function dump() {
  const db = getDatabase();
  const res = await db.execute("SELECT * FROM archives ORDER BY id ASC");
  console.log("Total archives in DB:", res.rows.length);
  fs.writeFileSync("data/seed-archives.json", JSON.stringify(res.rows, null, 2));
  console.log("Successfully saved to data/seed-archives.json");
}

dump().catch(console.error);
