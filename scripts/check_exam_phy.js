const { db } = require('./src/lib/db.js');

async function check() {
  const exam = await db.examSchedule.findUnique({
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
    console.log('Sample question 0 options:', exam.questions[0].options);
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
}
check().catch(console.error).finally(() => db.$disconnect());

