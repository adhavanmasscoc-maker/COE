import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkLocal() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT subjectId, questionNumber, COUNT(*) as c
    FROM QuestionBankItem
    GROUP BY subjectId, questionNumber
    HAVING c > 1;
  `);
  console.log("Local SQLite duplicate QuestionBankItem count:", result.length);
}

checkLocal().catch(console.error).finally(() => prisma.$disconnect());

