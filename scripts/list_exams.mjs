import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

const tursoUrl = 'libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io';
const tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw';

const libsql = createClient({ url: tursoUrl, authToken: tursoToken });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function listExams() {
  const exams = await prisma.examSchedule.findMany({
    include: { subject: true, questions: true, submissions: true, results: true }
  });
  console.log('Total exams in Turso:', exams.length);
  exams.forEach(e => {
    console.log({
      id: e.id,
      subject: e.subject?.name,
      code: e.subject?.code,
      examDate: e.examDate,
      phase: e.phase,
      qCount: e.questions.length,
      submissions: e.submissions.length,
      results: e.results.length
    });
  });
}
listExams().catch(console.error).finally(() => prisma.$disconnect());

