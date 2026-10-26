const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TN_DGE_SUBJECTS = [
  // Class 10 (Secondary)
  { code: "TAM-10", name: "Language (Tamil)", prepClass: 10, medium: "Tamil" },
  { code: "ENG-10", name: "English", prepClass: 10, medium: "English" },
  { code: "MAT-10", name: "Mathematics", prepClass: 10, medium: "English" },
  { code: "SCI-10", name: "Science", prepClass: 10, medium: "English" },
  { code: "SOC-10", name: "Social Science", prepClass: 10, medium: "English" },

  // Class 12 (Higher Secondary - Science Stream)
  { code: "TAM-12", name: "Language (Tamil)", prepClass: 12, medium: "Tamil" },
  { code: "ENG-12", name: "English", prepClass: 12, medium: "English" },
  { code: "MAT-12", name: "Mathematics", prepClass: 12, medium: "English" },
  { code: "PHY-12", name: "Physics", prepClass: 12, medium: "English" },
  { code: "CHE-12", name: "Chemistry", prepClass: 12, medium: "English" },
  { code: "BIO-12", name: "Biology", prepClass: 12, medium: "English" },
  { code: "CS-12",  name: "Computer Science", prepClass: 12, medium: "English" },
  { code: "BOT-12", name: "Botany", prepClass: 12, medium: "English" },
  { code: "ZOO-12", name: "Zoology", prepClass: 12, medium: "English" },

  // Class 12 (Higher Secondary - Commerce & Arts Stream)
  { code: "ACC-12", name: "Accountancy", prepClass: 12, medium: "English" },
  { code: "COM-12", name: "Commerce", prepClass: 12, medium: "English" },
  { code: "ECO-12", name: "Economics", prepClass: 12, medium: "English" },
  { code: "BMS-12", name: "Business Mathematics & Statistics", prepClass: 12, medium: "English" },
  { code: "CA-12",  name: "Computer Applications", prepClass: 12, medium: "English" },
  { code: "HIS-12", name: "History", prepClass: 12, medium: "English" },
  { code: "GEO-12", name: "Geography", prepClass: 12, medium: "English" },
  { code: "POL-12", name: "Political Science", prepClass: 12, medium: "English" },

  // Class 11 (Higher Secondary First Year)
  { code: "TAM-11", name: "Language (Tamil)", prepClass: 11, medium: "Tamil" },
  { code: "ENG-11", name: "English", prepClass: 11, medium: "English" },
  { code: "MAT-11", name: "Mathematics", prepClass: 11, medium: "English" },
  { code: "PHY-11", name: "Physics", prepClass: 11, medium: "English" },
  { code: "CHE-11", name: "Chemistry", prepClass: 11, medium: "English" },
  { code: "BIO-11", name: "Biology", prepClass: 11, medium: "English" },
  { code: "CS-11",  name: "Computer Science", prepClass: 11, medium: "English" },
  { code: "ACC-11", name: "Accountancy", prepClass: 11, medium: "English" },
  { code: "COM-11", name: "Commerce", prepClass: 11, medium: "English" },
  { code: "ECO-11", name: "Economics", prepClass: 11, medium: "English" },

  // Class 9 (High School)
  { code: "TAM-09", name: "Language (Tamil)", prepClass: 9, medium: "Tamil" },
  { code: "ENG-09", name: "English", prepClass: 9, medium: "English" },
  { code: "MAT-09", name: "Mathematics", prepClass: 9, medium: "English" },
  { code: "SCI-09", name: "Science", prepClass: 9, medium: "English" },
  { code: "SOC-09", name: "Social Science", prepClass: 9, medium: "English" },
];

async function seed() {
  console.log("Seeding Official TN DGE Subjects...");
  for (const s of TN_DGE_SUBJECTS) {
    await prisma.subject.upsert({
      where: { code: s.code },
      update: { name: s.name, prepClass: s.prepClass, medium: s.medium },
      create: s,
    });
  }
  const total = await prisma.subject.count();
  console.log(`Success! Total subjects in SQLite: ${total}`);
}

seed()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
