import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// In Vercel / serverless runtime, SQLite must reside in /tmp to allow read & write access
function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    // External cloud database (Turso LibSQL, Supabase, Neon, Vercel Postgres)
    return process.env.DATABASE_URL;
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");

    try {
      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } else {
          fs.writeFileSync(tmpDbPath, "");
        }
      }
    } catch (e) {
      console.error("Vercel serverless SQLite init notice:", e.message);
    }

    const resolved = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = resolved;
    return resolved;
  }

  // Local development / self-hosted node server
  const localDb = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
  process.env.DATABASE_URL = localDb;
  return localDb;
}

const activeDbUrl = resolveDatabaseUrl();
const globalForPrisma = globalThis;

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
