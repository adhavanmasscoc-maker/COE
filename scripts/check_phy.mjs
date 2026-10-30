import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

const tursoUrl = 'libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io';
const tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw';

const libsql = createClient({ url: tursoUrl, authToken: tursoToken });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function checkPhy() {
  const exam = await prisma.examSchedule.findUnique({
    where: { id: 'cmvuzjbph005st0ud2xp565q2' },
    include: { subject: true, questions: true, submissions: true, results: true }
  });
  console.log('Physics Exam:', {
    id: exam.id,
    subject: exam.subject.name,
    totalMarks: exam.totalMarks,
    phase: exam.phase,
    qCount: exam.questions.length,
    submissions: exam.submissions.map(s => ({
      id: s.id,
      score: s.score,
      timeTakenSecs: s.timeTakenSecs,
      attemptId: s.attemptId,
      submittedAt: s.submittedAt
    })),
    results: exam.results.map(r => ({
      id: r.id,
      marksObtained: r.marksObtained,
      maxMarks: r.maxMarks,
      isPublished: r.isPublished
    }))
  });

  console.log('Sample question options JSON:', exam.questions[0].options);
  console.log('Sample question text:', exam.questions[0].questionText);
}
checkPhy().catch(console.error).finally(() => prisma.$disconnect());

