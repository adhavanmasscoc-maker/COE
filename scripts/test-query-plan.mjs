import { createClient } from "@libsql/client/web";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw',
});

async function main() {
  const res1 = await db.execute("EXPLAIN QUERY PLAN SELECT * FROM ExamQuestion WHERE examScheduleId = 'test' AND questionNumber = 1;");
  console.log("ExamQuestion lookup plan:", res1.rows[0]?.detail);

  const res2 = await db.execute("EXPLAIN QUERY PLAN SELECT * FROM ExamQuestion WHERE examScheduleId = 'test' ORDER BY questionNumber;");
  console.log("ExamQuestion order plan:", res2.rows[0]?.detail);
}

main().catch(console.error);

