const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function setAdmin() {
  const hash = await bcrypt.hash("1", 10);
  
  // 1. Create or update user with username '1'
  const admin1 = await prisma.user.upsert({
    where: { username: "1" },
    update: { passwordHash: hash, role: "ADMIN" },
    create: { username: "1", passwordHash: hash, role: "ADMIN" },
  });

  // 2. Also ensure 'coe.admin' can use password '1' as well
  const coeAdmin = await prisma.user.findUnique({ where: { username: "coe.admin" } });
  if (coeAdmin) {
    await prisma.user.update({
      where: { id: coeAdmin.id },
      data: { passwordHash: hash },
    });
  }

  console.log("Successfully set admin credentials to username: 1 and password: 1");
  await prisma.$disconnect();
}

setAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
