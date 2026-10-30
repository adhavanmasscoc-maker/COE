const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

async function main() {
  const duplicates = await prisma.$queryRawUnsafe('SELECT examScheduleId, questionNumber, COUNT(*) as cnt FROM ExamQuestion GROUP BY examScheduleId, questionNumber HAVING cnt > 1;');
  console.log('dev.db duplicates:', duplicates);
  await prisma.$disconnect();
}
main().catch(console.error);

