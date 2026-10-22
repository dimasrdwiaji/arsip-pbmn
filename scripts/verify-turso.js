const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

const env = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const urlMatch = env.match(/TURSO_DATABASE_URL="([^"]+)"/);
const tokenMatch = env.match(/TURSO_AUTH_TOKEN="([^"]+)"/);

if (!urlMatch || !tokenMatch) {
  console.log("No Turso env found.");
  process.exit(0);
}

const client = createClient({ url: urlMatch[1], authToken: tokenMatch[1] });

async function verify() {
  const r = await client.execute("SELECT kategori_pencipta_3, count(*) as total FROM archives GROUP BY kategori_pencipta_3");
  console.log("Turso 3-Tier Distribution:", r.rows);

  const sample = await client.execute("SELECT id, no_berkas, kode, judul, tahun, kategori_pencipta_3, pencipta FROM archives LIMIT 3");
  console.log("Sample records:", sample.rows);
}

verify();
