import { createClient } from "@libsql/client/web";
import fs from "node:fs";

const tursoUrl = process.env.TURSO_DATABASE_URL || 'libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io';
const tursoToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw';

const db = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

const statements = fs.readFileSync("scripts/indexes.sql", "utf8")
  .split("\n")
  .map((line) => line.replace(/--.*$/, "").trim())
  .join(" ")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of statements) {
  await db.execute(stmt);
}
console.log(`Applied ${statements.length} index statements to Turso successfully!`);
