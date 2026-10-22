const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = (match[2] || "").trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.log("No TURSO_DATABASE_URL found, skipping cloud sync.");
  process.exit(0);
}

console.log("Connecting to Turso:", url);
const client = createClient({ url, authToken });

async function main() {
  try {
    // 1. Alter table archives & users
    try {
      await client.execute("ALTER TABLE archives ADD COLUMN kategori_pencipta_3 TEXT DEFAULT 'Biro PBMN'");
      console.log("Added column kategori_pencipta_3 to archives");
    } catch (e) {
      console.log("Column kategori_pencipta_3 already exists in archives");
    }

    try {
      await client.execute("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'Aktif'");
      console.log("Added column status to users");
    } catch (e) {
      console.log("Column status already exists in users");
    }

    // 2. Read seed data
    const seedPath = path.join(__dirname, "../data/seed-archives.json");
    const seedData = JSON.parse(fs.readFileSync(seedPath, "utf8"));

    console.log(`Syncing ${seedData.length} records to Turso...`);

    const updateStatements = seedData.map((item) => ({
      sql: `UPDATE archives SET 
              kategori_pencipta_3 = ?, 
              pencipta = ?,
              kategori_pencipta = ?
            WHERE id = ?`,
      args: [
        item.kategori_pencipta_3 || "Biro PBMN",
        item.pencipta,
        item.kategori_pencipta,
        item.id,
      ],
    }));

    const chunkSize = 100;
    for (let i = 0; i < updateStatements.length; i += chunkSize) {
      const chunk = updateStatements.slice(i, i + chunkSize);
      await client.batch(chunk, "write");
      console.log(`Updated records ${i + 1} to ${Math.min(i + chunkSize, updateStatements.length)}`);
    }

    console.log("Turso Cloud Database synced successfully!");
  } catch (err) {
    console.error("Error syncing Turso:", err);
  }
}

main();
