// scripts/sync_turso_ai_tables.mjs
import { createClient } from "@libsql/client/web";
import fs from "fs";
import path from "path";

// Load .env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = (match[2] || "").trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[match[1]] = val;
    }
  });
}

const url = process.env.TURSO_DATABASE_URL || "file:./dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function run() {
  console.log("Creating tables on Turso...");

  await client.execute(`
    CREATE TABLE IF NOT EXISTS SyllabusVector (
      id TEXT PRIMARY KEY,
      subjectCode TEXT NOT NULL,
      unitNumber INTEGER NOT NULL,
      chunkTitle TEXT NOT NULL,
      contentEn TEXT NOT NULL,
      contentTa TEXT NOT NULL,
      embedding TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✓ SyllabusVector table created.");

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_syllabus_vec_subj_unit ON SyllabusVector(subjectCode, unitNumber);
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS StudentAiSession (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      subjectCode TEXT NOT NULL,
      messages TEXT NOT NULL,
      weakAreas TEXT NOT NULL,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✓ StudentAiSession table created.");

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_student_ai_sess ON StudentAiSession(studentId, subjectCode);
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS SystemSetting (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✓ SystemSetting table created.");

  // Insert default setting for ai_tutor_enabled if not present
  await client.execute({
    sql: `INSERT OR IGNORE INTO SystemSetting (id, key, value, updatedAt) VALUES ('ai_tutor_setting', 'ai_tutor_enabled', 'true', CURRENT_TIMESTAMP);`,
    args: []
  });
  console.log("✓ Default SystemSetting initialized.");
}

run()
  .then(() => {
    console.log("All Turso tables synced successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  });

