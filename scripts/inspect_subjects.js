const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.subject.findMany({
    orderBy: [{ prepClass: "asc" }, { code: "asc" }]
  });
  console.log(`Subjects in DB (${subjects.length}):`);
  subjects.forEach(s => {
    console.log(`- ${s.name} (${s.code}) | Class ${s.prepClass} | ${s.medium} medium | ID: ${s.id}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
