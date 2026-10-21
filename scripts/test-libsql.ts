import { createClient } from "@libsql/client";

async function test() {
  const client = createClient({
    url: "file:data/arsip.db",
  });

  const res = await client.execute("SELECT COUNT(*) as count FROM archives");
  console.log("Count from @libsql/client:", res.rows[0]);

  const samples = await client.execute("SELECT id, judul, tahun, box FROM archives LIMIT 3");
  console.log("Samples:", samples.rows);
}

test().catch(console.error);
