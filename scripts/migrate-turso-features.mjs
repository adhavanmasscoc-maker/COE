import { createClient } from "@libsql/client/web";

const tursoUrl = process.env.TURSO_DATABASE_URL || "libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io";
const tursoToken = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw";

const client = createClient({ url: tursoUrl, authToken: tursoToken });

async function run() {
  console.log("Connecting to Turso Cloud at:", tursoUrl);

  console.log("Creating PracticeAttempt table...");
  await client.execute(`
    CREATE TABLE IF NOT EXISTS PracticeAttempt (
      id TEXT PRIMARY KEY,
      attemptId TEXT NOT NULL UNIQUE,
      studentId TEXT NOT NULL,
      subjectCode TEXT NOT NULL,
      setName TEXT NOT NULL,
      medium TEXT NOT NULL DEFAULT 'English',
      attemptNumber INTEGER NOT NULL DEFAULT 1,
      startTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      totalTimeSpent INTEGER NOT NULL DEFAULT 0,
      timePerQuestion TEXT,
      answersJson TEXT NOT NULL,
      score REAL NOT NULL DEFAULT 0,
      totalMarks REAL NOT NULL DEFAULT 50,
      percentage REAL NOT NULL DEFAULT 0,
      mode TEXT NOT NULL DEFAULT 'PRACTICE',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES StudentProfile(id) ON DELETE CASCADE
    );
  `);

  console.log("Creating ExamDateAuditLog table...");
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ExamDateAuditLog (
      id TEXT PRIMARY KEY,
      examScheduleId TEXT NOT NULL,
      oldDate DATETIME NOT NULL,
      newDate DATETIME NOT NULL,
      changedBy TEXT NOT NULL,
      reason TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (examScheduleId) REFERENCES ExamSchedule(id) ON DELETE CASCADE
    );
  `);

  console.log("Adding attemptId and isGraded columns to ExamSubmission...");
  try {
    await client.execute("ALTER TABLE ExamSubmission ADD COLUMN attemptId TEXT;");
    console.log("Added attemptId column to ExamSubmission.");
  } catch (e) {
    console.log("attemptId column exists or notice:", e.message);
  }

  try {
    await client.execute("ALTER TABLE ExamSubmission ADD COLUMN isGraded BOOLEAN DEFAULT 0;");
    console.log("Added isGraded column to ExamSubmission.");
  } catch (e) {
    console.log("isGraded column exists or notice:", e.message);
  }

  console.log("✅ Turso Cloud Schema Migration Successful!");
}

run().catch(console.error);

