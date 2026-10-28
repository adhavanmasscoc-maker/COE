const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const exams = await prisma.examSchedule.findMany({
    include: {
      subject: true,
      questions: {
        select: { id: true, questionNumber: true, questionText: true, marks: true, reviewStatus: true }
      },
      submissions: {
        select: { id: true, studentId: true, score: true }
      }
    },
    orderBy: { examDate: "asc" }
  });

  console.log(`Found ${exams.length} exam schedules in DB:`);
  exams.forEach((e, idx) => {
    console.log(`\n[${idx + 1}] ID: ${e.id}`);
    console.log(`   Subject: ${e.subject?.name} (${e.subject?.code}) | Class: ${e.prepClass}`);
    console.log(`   Date: ${e.examDate} | Status: ${e.status} | Phase: ${e.phase}`);
    console.log(`   Total Marks: ${e.totalMarks} | Duration: ${e.durationMinutes} mins`);
    console.log(`   Question count in DB: ${e.questions.length} (Expected total: ${e.questions.reduce((sum, q) => sum + (q.marks || 0), 0)} marks)`);
    console.log(`   Submissions count: ${e.submissions.length}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
