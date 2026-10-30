import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const tursoUrl = process.env.TURSO_DATABASE_URL || "libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io";
const tursoToken = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw";

console.log("=================================================");
console.log("   MIGRATING LOCAL SQLITE TO TURSO CLOUD DB      ");
console.log("=================================================");
console.log(`Target Turso: ${tursoUrl}`);

// 1. Local SQLite client
const localDb = createClient({
  url: `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
});

// 2. Remote Turso cloud client
const remoteDb = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

async function migrate() {
  console.log("Checking connectivity to Turso cloud...");
  const ping = await remoteDb.execute("SELECT 1 AS ok");
  console.log("✅ Turso Cloud Connected! Response:", ping.rows[0]);

  // Fetch all user tables from local SQLite
  const tablesResult = await localDb.execute(`
    SELECT name, sql FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations'
    ORDER BY name;
  `);

  console.log(`Found ${tablesResult.rows.length} tables in local SQLite.`);

  // Define table insertion order to respect foreign key constraints
  const orderedTables = [
    "User",
    "StudentProfile",
    "Subject",
    "StudentSubject",
    "ExamSchedule",
    "ExamQuestion",
    "QuestionBankItem",
    "QuestionPaper",
    "ExamSubmission",
    "ExamResult",
    "StudentActivityLog",
    "AuditLog",
    "Incident",
    "Feedback",
    "LiveExamAlert",
    "SyllabusUnit",
    "SyllabusChapter",
    "ChapterProgress",
    "SyllabusSubjectProgress",
  ];

  // Disable foreign keys temporarily during schema and data import
  await remoteDb.execute("PRAGMA foreign_keys = OFF;");

  // Step A: Create all tables first
  for (const row of tablesResult.rows) {
    const tableName = row.name;
    const tableSql = row.sql;
    if (!tableSql) continue;
    console.log(`Setting up schema for: ${tableName}...`);
    try {
      await remoteDb.execute(tableSql);
    } catch (err) {
      console.warn(`  Schema notice for ${tableName}:`, err.message);
    }
  }

  // Also create indexes
  const indexesResult = await localDb.execute(`
    SELECT sql FROM sqlite_master 
    WHERE type='index' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%';
  `);
  for (const idx of indexesResult.rows) {
    try {
      await remoteDb.execute(idx.sql);
    } catch (e) {}
  }

  // Step B: Copy data table by table
  const allTableNames = tablesResult.rows.map(r => r.name);
  const tablesToCopy = [
    ...orderedTables.filter(t => allTableNames.includes(t)),
    ...allTableNames.filter(t => !orderedTables.includes(t)),
  ];

  for (const tableName of tablesToCopy) {
    const data = await localDb.execute(`SELECT * FROM "${tableName}"`);
    if (data.rows.length === 0) {
      console.log(`• Table "${tableName}": 0 rows (skipped)`);
      continue;
    }

    console.log(`• Copying ${data.rows.length} rows into "${tableName}"...`);
    
    // Batch inserts in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < data.rows.length; i += chunkSize) {
      const chunk = data.rows.slice(i, i + chunkSize);
      const statements = chunk.map((item) => {
        const keys = Object.keys(item);
        const placeholders = keys.map(() => "?").join(", ");
        const values = Object.values(item);
        return {
          sql: `INSERT OR REPLACE INTO "${tableName}" (${keys.map(k => `"${k}"`).join(", ")}) VALUES (${placeholders})`,
          args: values,
        };
      });

      await remoteDb.batch(statements);
    }
    console.log(`  ✓ Inserted ${data.rows.length} rows successfully.`);
  }

  await remoteDb.execute("PRAGMA foreign_keys = ON;");

  console.log("\n=================================================");
  console.log("   DATA MIGRATION TO TURSO CLOUD DB COMPLETE!    ");
  console.log("=================================================");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
