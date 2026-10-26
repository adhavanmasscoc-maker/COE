const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function clean() {
  const students = await prisma.user.findMany();
  for (const s of students) {
    if (!s.fullName) continue;
    let cleanName = s.fullName.replace(/\s*\((Brother|Sister|brother|sister)\)/gi, "").trim();
    if (cleanName !== s.fullName) {
      await prisma.user.update({ where: { id: s.id }, data: { fullName: cleanName } });
      console.log("Sanitized:", s.fullName, "->", cleanName);
    }
  }
}

clean().finally(async () => {
  await prisma.$disconnect();
});
