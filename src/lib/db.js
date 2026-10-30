import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";
import path from "path";
import fs from "fs";

/**
 * Universal Database Client Singleton for Aknex COE Exam Portal
 * Supports:
 *  1. Remote Turso libSQL Serverless Database (via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN)
 *  2. Local SQLite dev.db with automatic writable /tmp staging for Vercel/AWS Serverless
 */

const tursoUrl = process.env.TURSO_DATABASE_URL || (process.env.DATABASE_URL?.startsWith("libsql:") ? process.env.DATABASE_URL : null);
const tursoToken = process.env.TURSO_AUTH_TOKEN;

function getResolvedDbUrl() {
  if (tursoUrl) return tursoUrl;

  const defaultDbPath = path.join(process.cwd(), "prisma", "dev.db");

  // On Vercel / serverless runtime, /var/task is read-only.
  // Copy the seeded dev.db to /tmp/dev.db where SQLite has full read/write access.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(defaultDbPath)) {
        fs.copyFileSync(defaultDbPath, tmpDbPath);
      }
      if (fs.existsSync(tmpDbPath)) {
        return `file:${tmpDbPath}`;
      }
    } catch (e) {
      console.warn("[db.js] Error staging writable /tmp/dev.db:", e.message);
    }
  }

  return process.env.DATABASE_URL || `file:${defaultDbPath}`;
}

const resolvedDbUrl = getResolvedDbUrl();

// 1. Direct libSQL client export for raw queries, batches, and diagnostic checks
export const libsql = createClient({
  url: tursoUrl || resolvedDbUrl,
  authToken: tursoToken || undefined,
});

// 2. Prisma Client Singleton with libSQL Adapter
const globalForPrisma = globalThis;

function createPrismaClient() {
  if (tursoUrl) {
    // Cloud Turso LibSQL Adapter Mode
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  // Local SQLite fallback mode (for offline development or writable /tmp on Vercel)
  return new PrismaClient({
    datasources: {
      db: { url: resolvedDbUrl },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;
