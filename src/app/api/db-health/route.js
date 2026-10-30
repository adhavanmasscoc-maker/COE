import { NextResponse } from "next/server";
import { db, libsql } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/db-health
 * Diagnostic health check verifying connectivity, latency, read/write,
 * and data integrity against Turso (libSQL) or local fallback.
 */
export async function GET() {
  const startTime = Date.now();
  const checks = {
    tursoConfigured: Boolean(process.env.TURSO_DATABASE_URL),
    connected: false,
    latencyMs: 0,
    readWriteVerified: false,
    tableCounts: {},
    error: null,
  };

  try {
    // 1. Direct Connectivity Check using libSQL
    const pingRes = await libsql.execute("SELECT 1 AS connected, CURRENT_TIMESTAMP AS serverTime");
    if (pingRes && pingRes.rows && pingRes.rows.length > 0) {
      checks.connected = true;
      checks.serverTime = pingRes.rows[0].serverTime;
    }

    // 2. Read/Write Probe Verification
    const probeId = `probe_${Date.now()}`;
    await libsql.execute({
      sql: `CREATE TABLE IF NOT EXISTS _health_check (
        id TEXT PRIMARY KEY,
        tested_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      args: [],
    });

    // Write probe
    await libsql.execute({
      sql: "INSERT INTO _health_check (id) VALUES (?)",
      args: [probeId],
    });

    // Read probe back
    const readBack = await libsql.execute({
      sql: "SELECT id FROM _health_check WHERE id = ?",
      args: [probeId],
    });

    // Clean up probe
    await libsql.execute({
      sql: "DELETE FROM _health_check WHERE id = ?",
      args: [probeId],
    });

    if (readBack.rows.length > 0 && readBack.rows[0].id === probeId) {
      checks.readWriteVerified = true;
    }

    // 3. Data Integrity & Table Row Counts via Prisma
    const [
      users,
      students,
      subjects,
      examSchedules,
      examQuestions,
      questionBankItems,
      submissions,
      results,
    ] = await Promise.all([
      db.user.count(),
      db.studentProfile.count(),
      db.subject.count(),
      db.examSchedule.count(),
      db.examQuestion.count(),
      db.questionBankItem.count(),
      db.examSubmission.count(),
      db.examResult.count(),
    ]);

    checks.tableCounts = {
      users,
      studentProfiles: students,
      subjects,
      examSchedules,
      examQuestions,
      questionBankItems,
      examSubmissions: submissions,
      examResults: results,
    };

    checks.latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      databaseProvider: checks.tursoConfigured ? "Turso (libSQL Cloud)" : "Local SQLite (dev.db)",
      checks,
    });
  } catch (err) {
    checks.latencyMs = Date.now() - startTime;
    checks.error = err.message;

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        checks,
      },
      { status: 500 }
    );
  }
}
