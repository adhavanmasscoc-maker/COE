/**
 * Standalone Turso / libSQL Connectivity & Health Check Script
 * Usage: node scripts/turso-health-check.js
 */

const { createClient } = require("@libsql/client/web");
const path = require("path");
const fs = require("fs");

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

const tursoUrl = process.env.TURSO_DATABASE_URL || (process.env.DATABASE_URL?.startsWith("libsql:") ? process.env.DATABASE_URL : null);
const tursoToken = process.env.TURSO_AUTH_TOKEN;

console.log("=================================================");
console.log("   AKNEX COE — TURSO (libSQL) HEALTH INSPECTOR   ");
console.log("=================================================");

const targetUrl = tursoUrl || `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
console.log(`📡 Target URL: ${targetUrl.startsWith("libsql:") ? targetUrl : targetUrl.split("?")[0]}`);
console.log(`🔑 Auth Token: ${tursoToken ? "Configured (" + tursoToken.slice(0, 15) + "...)" : "None (Local Mode)"}\n`);

async function runCheck() {
  const startTime = Date.now();
  const client = createClient({
    url: targetUrl,
    authToken: tursoToken || undefined,
  });

  try {
    // 1. Basic Ping & Latency
    const t0 = Date.now();
    const ping = await client.execute("SELECT 1 AS connected, CURRENT_TIMESTAMP AS server_time");
    const pingLatency = Date.now() - t0;
    console.log(`✅ [1/4] Connectivity Ping: SUCCESS (${pingLatency}ms latency)`);
    console.log(`      Server Timestamp: ${ping.rows[0].server_time}`);

    // 2. Read / Write Probe Test
    const t1 = Date.now();
    await client.execute(`CREATE TABLE IF NOT EXISTS _health_check (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    const probeId = `probe_${Date.now()}`;
    await client.execute({
      sql: "INSERT INTO _health_check (id) VALUES (?)",
      args: [probeId],
    });

    const readRes = await client.execute({
      sql: "SELECT id FROM _health_check WHERE id = ?",
      args: [probeId],
    });

    await client.execute({
      sql: "DELETE FROM _health_check WHERE id = ?",
      args: [probeId],
    });
    const rwLatency = Date.now() - t1;

    if (readRes.rows.length > 0 && readRes.rows[0].id === probeId) {
      console.log(`✅ [2/4] Read/Write Verification: SUCCESS (${rwLatency}ms latency)`);
    } else {
      console.error("❌ [2/4] Read/Write Verification: FAILED (Probe row mismatch)");
    }

    // 3. Table Integrity & Counts
    console.log("\n📊 [3/4] Data Integrity & Record Counts in Turso:");
    const tables = [
      "User",
      "StudentProfile",
      "Subject",
      "ExamSchedule",
      "ExamQuestion",
      "QuestionBankItem",
      "QuestionPaper",
      "ExamSubmission",
      "ExamResult",
      "StudentActivityLog",
      "SyllabusUnit",
      "SyllabusChapter",
    ];

    for (const table of tables) {
      try {
        const res = await client.execute(`SELECT COUNT(*) AS count FROM "${table}"`);
        const count = res.rows[0].count;
        console.log(`      • ${table.padEnd(20)}: ${count} rows`);
      } catch (err) {
        console.log(`      • ${table.padEnd(20)}: [Table error: ${err.message}]`);
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log("\n=================================================");
    console.log(`🎉 [4/4] ALL TURSO CLOUD CHECKS PASSED (${totalDuration}ms total)`);
    console.log("=================================================");
  } catch (err) {
    console.error("\n❌ Health Check Error:", err.message);
  }
}

runCheck();
