const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Clean existing records to allow clean re-seeding
  await prisma.chapterProgress.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.workedSolution.deleteMany();
  await prisma.questionPaper.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.syllabusChapter.deleteMany();
  await prisma.syllabusUnit.deleteMany();
  await prisma.studentSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.notice.deleteMany();

  console.log("🧹 Cleaned existing database tables.");

  // 2. Hash credentials
  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash("1", saltRounds);
  const brotherDobHash = await bcrypt.hash("2011-05-14", saltRounds);
  const sisterDobHash = await bcrypt.hash("2009-08-22", saltRounds);

  // 3. Create COE Administrator User
  const adminUser = await prisma.user.create({
    data: {
      username: "1",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log(`✅ COE Administrator created: ${adminUser.username} (password: 1)`);

  // 4. Create Student A (Brother)
  const brotherUser = await prisma.user.create({
    data: {
      username: "TN2026-0901",
      passwordHash: brotherDobHash,
      role: "STUDENT",
      profile: {
        create: {
          fullName: "Adhavan (Brother)",
          currentClass: 9,
          examPrepClass: 10,
          board: "Tamil Nadu Samacheer Kalvi",
          medium: "English",
          academicYear: "2026–2027",
        },
      },
    },
    include: { profile: true },
  });
  console.log(`✅ Brother created: ${brotherUser.username} | School Grade: 9 -> Prep Standard: 10`);

  // 5. Create Student B (Sister)
  const sisterUser = await prisma.user.create({
    data: {
      username: "TN2026-1102",
      passwordHash: sisterDobHash,
      role: "STUDENT",
      profile: {
        create: {
          fullName: "Nithya (Sister)",
          currentClass: 11,
          examPrepClass: 12,
          board: "Tamil Nadu Samacheer Kalvi",
          medium: "English",
          academicYear: "2026–2027",
        },
      },
    },
    include: { profile: true },
  });
  console.log(`✅ Sister created: ${sisterUser.username} | School Grade: 11 -> Prep Standard: 12`);

  // 6. Seed 5 Core Subjects for Class 10 (Tamil Nadu Samacheer Kalvi)
  const class10SubjectsData = [
    {
      name: "Language (Tamil)",
      code: "TAM-10",
      prepClass: 10,
      medium: "Tamil",
      units: [
        { unitNumber: 1, title: "இயல் 1: அமுதூற்று", chapters: ["அன்னை மொழியே", "தமிழ் சொல் வளம்", "இரட்டுற மொழிதல்", "எழுத்து, சொல்"] },
        { unitNumber: 2, title: "இயல் 2: உயிரின் ஓசை", chapters: ["காற்றே வா", "முல்லைப் பாட்டு", "புயலிலே ஒரு தோணி", "தொகைநிலைத் தொடர்கள்"] },
      ],
    },
    {
      name: "English",
      code: "ENG-10",
      prepClass: 10,
      medium: "English",
      units: [
        { unitNumber: 1, title: "Unit 1: Exploration", chapters: ["His First Flight", "Life (Poem)", "The Tempest"] },
        { unitNumber: 2, title: "Unit 2: Art and Culture", chapters: ["The Night the Ghost Got In", "The Grumble Family", "Zigzag"] },
      ],
    },
    {
      name: "Mathematics",
      code: "MAT-10",
      prepClass: 10,
      medium: "English",
      units: [
        { unitNumber: 1, title: "Relations and Functions", chapters: ["Ordered Pairs & Relations", "Functions & Types", "Composition of Functions"] },
        { unitNumber: 2, title: "Numbers and Sequences", chapters: ["Euclid's Division Lemma", "Fundamental Theorem of Arithmetic", "Arithmetic Progressions", "Geometric Progressions"] },
        { unitNumber: 3, title: "Algebra", chapters: ["Simultaneous Linear Equations", "Quadratic Equations", "Matrices"] },
      ],
    },
    {
      name: "Science",
      code: "SCI-10",
      prepClass: 10,
      medium: "English",
      units: [
        { unitNumber: 1, title: "Physics: Laws of Motion", chapters: ["Newton's Laws", "Linear Momentum", "Gravitation"] },
        { unitNumber: 2, title: "Chemistry: Solutions", chapters: ["Types of Solutions", "Solubility Factors", "Hydrated Salts"] },
        { unitNumber: 3, title: "Biology: Plant Anatomy", chapters: ["Tissues & Tissue Systems", "Photosynthesis", "Cellular Respiration"] },
      ],
    },
    {
      name: "Social Science",
      code: "SOC-10",
      prepClass: 10,
      medium: "English",
      units: [
        { unitNumber: 1, title: "History: Modern World", chapters: ["Outbreak of World War I", "World Between Two World Wars"] },
        { unitNumber: 2, title: "Geography: India", chapters: ["Location, Relief and Drainage", "Climate and Natural Vegetation"] },
      ],
    },
  ];

  // 7. Seed 5 Core Subjects for Class 12 (Tamil Nadu Samacheer Kalvi)
  const class12SubjectsData = [
    {
      name: "Language (Tamil)",
      code: "TAM-12",
      prepClass: 12,
      medium: "Tamil",
      units: [
        { unitNumber: 1, title: "இயல் 1: உயிரினும் ஓம்பப்படும்", chapters: ["இளந்தமிழே", "தமிழாய் எழுதுவோம்", "தன்னேர் இலாத தமிழ்"] },
      ],
    },
    {
      name: "English",
      code: "ENG-12",
      prepClass: 12,
      medium: "English",
      units: [
        { unitNumber: 1, title: "Unit 1: Selflessness", chapters: ["Two Gentlemen of Verona", "The Castle (Poem)", "God Sees the Truth, but Waits"] },
      ],
    },
    {
      name: "Physics",
      code: "PHY-12",
      prepClass: 12,
      medium: "English",
      units: [
        { unitNumber: 1, title: "Electrostatics", chapters: ["Coulomb's Law & Electric Field", "Electric Potential & Capacitors", "Van de Graaff Generator"] },
        { unitNumber: 2, title: "Current Electricity", chapters: ["Ohm's Law & Drift Velocity", "Kirchhoff's Rules & Wheatstone Bridge", "Potentiometer"] },
      ],
    },
    {
      name: "Chemistry",
      code: "CHE-12",
      prepClass: 12,
      medium: "English",
      units: [
        { unitNumber: 1, title: "Metallurgy", chapters: ["Concentration of Ores", "Extraction of Crude Metal", "Refining Processes"] },
        { unitNumber: 2, title: "p-Block Elements", chapters: ["Group 13 & 14 Trends", "Boron Compounds", "Allotropes of Carbon"] },
      ],
    },
    {
      name: "Biology / Mathematics",
      code: "BIO-12",
      prepClass: 12,
      medium: "English",
      units: [
        { unitNumber: 1, title: "Reproduction in Organisms", chapters: ["Asexual Reproduction", "Sexual Reproduction in Flowering Plants"] },
        { unitNumber: 2, title: "Genetics and Evolution", chapters: ["Principles of Inheritance", "Molecular Basis of Inheritance"] },
      ],
    },
    {
      name: "Computer Science",
      code: "CSC-12",
      prepClass: 12,
      medium: "English",
      units: [
        { unitNumber: 1, title: "Problem Solving and Python", chapters: ["Functions & Scope", "Data Abstraction & OOP", "Algorithmic Efficiency"] },
        { unitNumber: 2, title: "Database & SQL", chapters: ["Relational Database & SQL", "CSV Integration with Python"] },
      ],
    },
  ];

  // Insert Class 10 Subjects & Assign to Brother
  const brotherProfile = brotherUser.profile;
  for (const subData of class10SubjectsData) {
    const createdSub = await prisma.subject.create({
      data: {
        name: subData.name,
        code: subData.code,
        prepClass: subData.prepClass,
        medium: subData.medium,
        units: {
          create: subData.units.map((u) => ({
            unitNumber: u.unitNumber,
            title: u.title,
            chapters: {
              create: u.chapters.map((ch, idx) => ({
                chapterNumber: idx + 1,
                title: ch,
              })),
            },
          })),
        },
      },
    });

    await prisma.studentSubject.create({
      data: {
        studentId: brotherProfile.id,
        subjectId: createdSub.id,
      },
    });
  }
  console.log("✅ Seeded 5 Class 10 subjects and mapped to Brother.");

  // Insert Class 12 Subjects & Assign to Sister
  const sisterProfile = sisterUser.profile;
  for (const subData of class12SubjectsData) {
    const createdSub = await prisma.subject.create({
      data: {
        name: subData.name,
        code: subData.code,
        prepClass: subData.prepClass,
        medium: subData.medium,
        units: {
          create: subData.units.map((u) => ({
            unitNumber: u.unitNumber,
            title: u.title,
            chapters: {
              create: u.chapters.map((ch, idx) => ({
                chapterNumber: idx + 1,
                title: ch,
              })),
            },
          })),
        },
      },
    });

    await prisma.studentSubject.create({
      data: {
        studentId: sisterProfile.id,
        subjectId: createdSub.id,
      },
    });
  }
  console.log("✅ Seeded 5 Class 12 subjects and mapped to Sister.");

  // 7b. Seed Full TN DGE Subject Catalog for Classes 9, 10, 11, 12
  const extraSubjects = [
    // Class 12 Science & Voc
    { code: "CS-12",  name: "Computer Science", prepClass: 12, medium: "English" },
    { code: "BOT-12", name: "Botany", prepClass: 12, medium: "English" },
    { code: "ZOO-12", name: "Zoology", prepClass: 12, medium: "English" },
    // Class 12 Commerce & Arts
    { code: "ACC-12", name: "Accountancy", prepClass: 12, medium: "English" },
    { code: "COM-12", name: "Commerce", prepClass: 12, medium: "English" },
    { code: "ECO-12", name: "Economics", prepClass: 12, medium: "English" },
    { code: "BMS-12", name: "Business Mathematics & Statistics", prepClass: 12, medium: "English" },
    { code: "CA-12",  name: "Computer Applications", prepClass: 12, medium: "English" },
    { code: "HIS-12", name: "History", prepClass: 12, medium: "English" },
    { code: "GEO-12", name: "Geography", prepClass: 12, medium: "English" },
    { code: "POL-12", name: "Political Science", prepClass: 12, medium: "English" },
    // Class 11 Subjects
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
    // Class 9 Subjects
    { code: "TAM-09", name: "Language (Tamil)", prepClass: 9, medium: "Tamil" },
    { code: "ENG-09", name: "English", prepClass: 9, medium: "English" },
    { code: "MAT-09", name: "Mathematics", prepClass: 9, medium: "English" },
    { code: "SCI-09", name: "Science", prepClass: 9, medium: "English" },
    { code: "SOC-09", name: "Social Science", prepClass: 9, medium: "English" },
  ];

  for (const s of extraSubjects) {
    await prisma.subject.upsert({
      where: { code: s.code },
      update: { name: s.name, prepClass: s.prepClass, medium: s.medium },
      create: s,
    });
  }
  console.log("✅ Seeded additional TN DGE Subjects across streams.");

  const math10 = await prisma.subject.findUnique({ where: { code: "MAT-10" } });
  const phy12 = await prisma.subject.findUnique({ where: { code: "PHY-12" } });

  const qpMath10 = await prisma.questionPaper.create({
    data: {
      subjectId: math10.id,
      prepClass: 10,
      examYear: 2024,
      title: "Class 10 Mathematics Board Examination - March 2024",
      board: "Tamil Nadu State Board",
      sourceInfo: "Directorate of Government Examinations (DGE), Government of Tamil Nadu",
      paperType: "PUBLIC_EXAM",
      maxMarks: 100,
      durationMinutes: 150,
      isPublished: true,
      solution: {
        create: {
          title: "Complete Step-by-Step Worked Solutions by Controller of Examinations",
          solutionType: "TEXT_STEP_BY_STEP",
          content: "Section I Solutions (14x1=14 Marks): \n1. Option A (k=30). Explanation: Using (alpha - beta)^2 = (alpha + beta)^2 - 4(alpha)(beta) ... \n2. Option B (61). Explanation: a_19 = -11 + 18(4) = 61.",
          isPublished: true,
        },
      },
    },
  });

  const qpPhy12 = await prisma.questionPaper.create({
    data: {
      subjectId: phy12.id,
      prepClass: 12,
      examYear: 2024,
      title: "Class 12 Physics Public Examination - March 2024",
      board: "Tamil Nadu State Board",
      sourceInfo: "Directorate of Government Examinations (DGE), Government of Tamil Nadu",
      paperType: "PUBLIC_EXAM",
      maxMarks: 70,
      durationMinutes: 180,
      isPublished: true,
      solution: {
        create: {
          title: "Detailed Worked Solutions and Derivations by COE",
          solutionType: "TEXT_STEP_BY_STEP",
          content: "Part I Solutions: \n1. Electric field intensity due to dipole on axial line: E = (1/4pieps0)*(2p/r^3). \n2. Principle of Van de Graaff Generator: Electrostatic induction and Action of points.",
          isPublished: true,
        },
      },
    },
  });
  console.log("✅ Seeded Official Question Papers & COE Worked Solutions with DGE source attribution.");

  // 9. Seed Examination Schedules (Draft & Published)
  await prisma.examSchedule.create({
    data: {
      subjectId: math10.id,
      prepClass: 10,
      examDate: new Date("2026-11-02T10:00:00.000Z"),
      durationMinutes: 150,
      totalMarks: 100,
      instructions: "Calculators are strictly prohibited. Formula sheets must not be brought into the hall.",
      status: "PUBLISHED",
    },
  });

  await prisma.examSchedule.create({
    data: {
      subjectId: phy12.id,
      prepClass: 12,
      examDate: new Date("2026-11-03T09:30:00.000Z"),
      durationMinutes: 180,
      totalMarks: 70,
      instructions: "All 4 parts are compulsory. Draw clean circuit diagrams wherever required.",
      status: "PUBLISHED",
    },
  });

  try {
    const { run } = require("../scripts/import_user_exams");
    if (typeof run === "function") {
      await run();
    }
  } catch (err) {
    console.log("Auto-seed error on CSC exams:", err.message);
  }
  console.log("✅ Seeded Official Examination Schedules including Computer Science (CSC-12).");

  // 10. Seed Official COE Notices
  await prisma.notice.create({
    data: {
      title: "Welcome to the 2026–2027 Academic Preparation Year",
      content: "Official notification from the Controller of Examinations: Syllabuses have been configured. Class 10 preparation applies to Adhavan and Class 12 preparation applies to Nithya. Regular examination schedules will be published progressively.",
      isPublished: true,
    },
  });

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
