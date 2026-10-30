import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

const tursoUrl = 'libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io';
const tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw';

const libsql = createClient({ url: tursoUrl, authToken: tursoToken });

async function checkDuplicates() {
  const result = await libsql.execute(`
    SELECT subjectId, questionNumber, COUNT(*) as c
    FROM QuestionBankItem
    GROUP BY subjectId, questionNumber
    HAVING c > 1;
  `);
  console.log("Turso duplicate QuestionBankItem count:", result.rows.length);
  if (result.rows.length > 0) {
    console.log("Sample duplicates:", result.rows.slice(0, 5));
  }
}

checkDuplicates().catch(console.error);

