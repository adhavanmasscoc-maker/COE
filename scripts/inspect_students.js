const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      profile: {
        include: {
          subjects: { include: { subject: true } },
          examResults: true,
          examSubmissions: true,
        }
      }
    }
  });

  console.log(`Users in DB (${users.length}):`);
  users.forEach(u => {
    console.log(`- Username: ${u.username} | Role: ${u.role}`);
    if (u.profile) {
      console.log(`  Name: ${u.profile.fullName} | Grade: ${u.profile.currentClass} (Prep Class ${u.profile.examPrepClass}) | Medium: ${u.profile.medium}`);
      console.log(`  Subjects: ${u.profile.subjects.map(s => s.subject.code).join(", ")}`);
      console.log(`  Submissions: ${u.profile.examSubmissions.length} | Results: ${u.profile.examResults.length}`);
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
