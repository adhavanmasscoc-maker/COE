import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

/**
 * Universal Database Client Singleton for Aknex COE Exam Portal
 * Supports:
 *  1. Remote Turso libSQL Serverless Database (via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN)
 *  2. Local SQLite dev.db (fallback when Turso env vars are not set)
 */

const tursoUrl = process.env.TURSO_DATABASE_URL || (process.env.DATABASE_URL?.startsWith("libsql:") ? process.env.DATABASE_URL : null);
const tursoToken = process.env.TURSO_AUTH_TOKEN;

// 1. Direct libSQL client export for raw queries, batches, and diagnostic checks
export const libsql = createClient({
  url: tursoUrl || `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
  authToken: tursoToken || undefined,
});

// 2. Prisma Client Singleton with libSQL Adapter
const globalForPrisma = globalThis;

function createPrismaClient() {
  if (tursoUrl) {
    // Cloud Turso LibSQL Adapter Mode
    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  // Local SQLite fallback mode (for offline development or untouched backup)
  const localDb = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
  return new PrismaClient({
    datasources: {
      db: { url: localDb },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;
