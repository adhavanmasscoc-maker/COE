import { createClient } from "@libsql/client/web";

const tursoUrl = 'libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io';
const tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw';

const db = createClient({ url: tursoUrl, authToken: tursoToken });

async function applyIndexesAB() {
  console.log("Applying Index A: idx_activity_roll_action_time on StudentActivityLog(rollNo, action, createdAt)...");
  await db.execute("CREATE INDEX IF NOT EXISTS idx_activity_roll_action_time ON StudentActivityLog(rollNo, action, createdAt);");
  console.log("✓ Applied idx_activity_roll_action_time successfully.");

  console.log("Applying Index B: uq_qbank_subject_qno on QuestionBankItem(subjectId, questionNumber)...");
  await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_qbank_subject_qno ON QuestionBankItem(subjectId, questionNumber);");
  console.log("✓ Applied uq_qbank_subject_qno successfully.");

  // Verify with EXPLAIN QUERY PLAN
  const planA = await db.execute("EXPLAIN QUERY PLAN SELECT * FROM StudentActivityLog WHERE rollNo = 'TN2026-0901' AND action = 'PAGE_VIEW' ORDER BY createdAt DESC;");
  console.log("\nEXPLAIN QUERY PLAN A (StudentActivityLog):");
  planA.rows.forEach(r => console.log(" ", r.detail));

  const planB = await db.execute("EXPLAIN QUERY PLAN SELECT * FROM QuestionBankItem WHERE subjectId = 'sample-sub-id' AND questionNumber = 10;");
  console.log("\nEXPLAIN QUERY PLAN B (QuestionBankItem):");
  planB.rows.forEach(r => console.log(" ", r.detail));
}

applyIndexesAB().catch(console.error);

