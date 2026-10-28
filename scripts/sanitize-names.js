const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function clean() {
  console.log("=== Sanitizing Student Profiles & Telemetry Records ===");

  // 1. Sanitize StudentProfile full names
  const profiles = await prisma.studentProfile.findMany({ include: { user: true } });
  for (const p of profiles) {
    let cleanName = p.fullName
      .replace(/\s*\((Brother|Sister|brother|sister)\)/gi, "")
      .trim();

    if (p.user?.username === "TN2026-0901" && (!cleanName.endsWith("S") && !cleanName.includes("Adhavan S"))) {
      cleanName = "Adhavan S";
    }
    if (p.user?.username === "TN2026-1102" && (!cleanName.endsWith("S") && !cleanName.includes("Nithya S"))) {
      cleanName = "Nithya S";
    }

    if (cleanName !== p.fullName) {
      await prisma.studentProfile.update({
        where: { id: p.id },
        data: { fullName: cleanName },
      });
      console.log(`Updated Profile: "${p.fullName}" -> "${cleanName}"`);
    }
  }

  // 2. Sanitize Activity Logs student names
  const logs = await prisma.studentActivityLog.findMany();
  for (const l of logs) {
    let cleanName = l.studentName
      .replace(/\s*\((Brother|Sister|brother|sister)\)/gi, "")
      .trim();
    if (l.rollNo === "TN2026-0901") cleanName = "Adhavan S";
    if (l.rollNo === "TN2026-1102") cleanName = "Nithya S";

    if (cleanName !== l.studentName) {
      await prisma.studentActivityLog.update({
        where: { id: l.id },
        data: { studentName: cleanName },
      });
    }
  }

  console.log("✅ All student names strictly sanitized to formal names only.");
}

clean()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
