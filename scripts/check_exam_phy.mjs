import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

const tursoUrl = 'libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io';
const tursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw';

const libsql = createClient({ url: tursoUrl, authToken: tursoToken });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function check() {
  const exam = await prisma.examSchedule.findUnique({
    where: { id: 'cmvuzjbul005a10udvtlh3pvb' },
    include: { subject: true, questions: true, submissions: true, results: true }
  });
  console.log('Exam found:', exam ? {
    id: exam.id,
    subject: exam.subject.name,
    code: exam.subject.code,
    prepClass: exam.prepClass,
    examDate: exam.examDate,
    phase: exam.phase,
    questionsCount: exam.questions.length,
    submissionsCount: exam.submissions.length,
    resultsCount: exam.results.length,
    totalMarks: exam.totalMarks
  } : 'Not found');
  if (exam && exam.questions.length > 0) {
    console.log('Sample question 0:', {
      text: exam.questions[0].questionText,
      options: exam.questions[0].options
    });
  }
  if (exam && exam.submissions.length > 0) {
    console.log('Submissions:', exam.submissions.map(s => ({
      id: s.id,
      studentId: s.studentId,
      score: s.score,
      timeTakenSecs: s.timeTakenSecs,
      attemptId: s.attemptId,
      submittedAt: s.submittedAt
    })));
  }
  if (exam && exam.results.length > 0) {
    console.log('Results:', exam.results.map(r => ({
      id: r.id,
      studentId: r.studentId,
      marksObtained: r.marksObtained,
      maxMarks: r.maxMarks,
      isPublished: r.isPublished
    })));
  }
}
check().catch(console.error).finally(() => prisma.$disconnect());

