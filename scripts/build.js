#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");

console.log("🚀 Starting Antigravity COE Automated Build Pipeline...");

// 1. Guarantee environment variables for Prisma & JWT sessions
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
  console.log("ℹ️ Defaulted DATABASE_URL to file:./dev.db");
}
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = "tn-samacheer-kalvi-coe-super-secret-key-2026-secure-32chars";
  console.log("ℹ️ Defaulted SESSION_SECRET fallback");
}

function run(cmd, desc) {
  console.log(`\n▶ [${desc}] Running: ${cmd}`);
  try {
    execSync(cmd, {
      stdio: "inherit",
      env: { ...process.env },
      cwd: path.resolve(__dirname, ".."),
    });
  } catch (err) {
    console.error(`❌ Error during [${desc}]:`, err.message);
    process.exit(1);
  }
}

// 2. Generate Prisma Client
run("npx prisma generate", "Prisma Client Generate");

// 3. Push schema to SQLite dev.db
run("npx prisma db push --accept-data-loss", "Prisma Database Push");

// 4. Seed database with candidates, subjects, exams, and notices
run("node prisma/seed.js", "Database Seeding");

// 5. Next.js production build
run("npx next build", "Next.js Production Build");

console.log("\n✅ COE Production Build Completed Successfully!");
