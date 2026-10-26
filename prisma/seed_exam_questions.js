const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding authentic exam questions into SQLite...");

  // 1. Fetch Class 10 Math Exam
  const math10Exam = await prisma.examSchedule.findFirst({
    where: { prepClass: 10 },
  });

  if (math10Exam) {
    // Delete any existing questions for clean seed
    await prisma.examQuestion.deleteMany({
      where: { examScheduleId: math10Exam.id },
    });

    const mathQuestions = [
      {
        questionNumber: 1,
        questionText: "If the difference between the roots of the quadratic equation x² - 13x + k = 0 is 7, find the value of k.",
        marks: 2,
        options: JSON.stringify([
          { id: "A", text: "k = 30" },
          { id: "B", text: "k = 36" },
          { id: "C", text: "k = 42" },
          { id: "D", text: "k = 40" },
        ]),
        correctAnswer: "A",
        explanation: "Using (α - β)² = (α + β)² - 4αβ, 7² = 13² - 4k => 49 = 169 - 4k => 4k = 120 => k = 30.",
      },
      {
        questionNumber: 2,
        questionText: "Find the 19th term of an Arithmetic Progression (A.P.) whose first term is -11 and common difference is 4.",
        marks: 2,
        options: JSON.stringify([
          { id: "A", text: "57" },
          { id: "B", text: "61" },
          { id: "C", text: "65" },
          { id: "D", text: "53" },
        ]),
        correctAnswer: "B",
        explanation: "a_n = a + (n-1)d = -11 + 18(4) = -11 + 72 = 61.",
      },
      {
        questionNumber: 3,
        questionText: "A tower stands vertically on the ground. From a point on the ground, 48 m away from the foot of the tower, the angle of elevation of the top of the tower is 30°. Find the height of the tower.",
        marks: 5,
        options: JSON.stringify([
          { id: "A", text: "16√3 m" },
          { id: "B", text: "24√3 m" },
          { id: "C", text: "48√3 m" },
          { id: "D", text: "12√3 m" },
        ]),
        correctAnswer: "A",
        explanation: "tan 30° = h / 48 => 1/√3 = h / 48 => h = 48 / √3 = 16√3 m.",
      },
      {
        questionNumber: 4,
        questionText: "If the radius of a cylinder is doubled and the height is halved, what happens to its curved surface area (CSA)?",
        marks: 2,
        options: JSON.stringify([
          { id: "A", text: "It is doubled" },
          { id: "B", text: "It is halved" },
          { id: "C", text: "It remains unchanged" },
          { id: "D", text: "It increases 4 times" },
        ]),
        correctAnswer: "C",
        explanation: "CSA = 2πrh. New CSA = 2π(2r)(h/2) = 2πrh. Area remains unchanged.",
      },
      {
        questionNumber: 5,
        questionText: "Two coins are tossed together. What is the probability of getting at least one head?",
        marks: 2,
        options: JSON.stringify([
          { id: "A", text: "1/4" },
          { id: "B", text: "1/2" },
          { id: "C", text: "3/4" },
          { id: "D", text: "1" },
        ]),
        correctAnswer: "C",
        explanation: "Sample space S = {HH, HT, TH, TT}. Favorable = {HH, HT, TH} (3 out of 4). Probability = 3/4.",
      },
    ];

    for (const q of mathQuestions) {
      await prisma.examQuestion.create({
        data: {
          examScheduleId: math10Exam.id,
          ...q,
        },
      });
    }
    console.log(`✅ Seeded 5 questions for Class 10 Math exam (ID: ${math10Exam.id}).`);
  }

  // 2. Fetch Class 12 Physics Exam
  const phy12Exam = await prisma.examSchedule.findFirst({
    where: { prepClass: 12 },
  });

  if (phy12Exam) {
    await prisma.examQuestion.deleteMany({
      where: { examScheduleId: phy12Exam.id },
    });

    const phyQuestions = [
      {
        questionNumber: 1,
        questionText: "The electric field intensity at a distance 'r' from the center of an electric dipole along its axial line is proportional to:",
        marks: 2,
        options: JSON.stringify([
          { id: "A", text: "1/r" },
          { id: "B", text: "1/r²" },
          { id: "C", text: "1/r³" },
          { id: "D", text: "1/r⁴" },
        ]),
        correctAnswer: "C",
        explanation: "For an electric dipole on axial line, E_axial = (1/4πε₀) * (2p / r³). Hence E is proportional to 1/r³.",
      },
      {
        questionNumber: 2,
        questionText: "A parallel plate capacitor is charged and then disconnected from the battery. If a dielectric slab is inserted between the plates, what happens to its potential difference?",
        marks: 2,
        options: JSON.stringify([
          { id: "A", text: "Increases" },
          { id: "B", text: "Decreases" },
          { id: "C", text: "Remains unchanged" },
          { id: "D", text: "Becomes zero" },
        ]),
        correctAnswer: "B",
        explanation: "Charge Q remains constant. Capacitance increases (C = ε_r * C₀). Since V = Q / C, potential difference decreases.",
      },
      {
        questionNumber: 3,
        questionText: "The working principle of Van de Graaff Generator is based on:",
        marks: 3,
        options: JSON.stringify([
          { id: "A", text: "Electrostatic induction and Action of points" },
          { id: "B", text: "Electromagnetic induction" },
          { id: "C", text: "Thermoelectric effect" },
          { id: "D", text: "Photoelectric emission" },
        ]),
        correctAnswer: "A",
        explanation: "It utilizes electrostatic induction to accumulate high potential and the action of sharp points (corona discharge) for spraying charges.",
      },
      {
        questionNumber: 4,
        questionText: "Kirchhoff's First Law (Current Rule) at a junction in an electrical circuit is a consequence of conservation of:",
        marks: 2,
        options: JSON.stringify([
          { id: "A", text: "Energy" },
          { id: "B", text: "Charge" },
          { id: "C", text: "Linear Momentum" },
          { id: "D", text: "Angular Momentum" },
        ]),
        correctAnswer: "B",
        explanation: "The algebraic sum of currents meeting at a junction is zero (Σ I = 0), representing conservation of electrical charge.",
      },
      {
        questionNumber: 5,
        questionText: "The magnetic susceptibility (χ_m) of a diamagnetic substance is:",
        marks: 2,
        options: JSON.stringify([
          { id: "A", text: "Small and positive" },
          { id: "B", text: "Large and positive" },
          { id: "C", text: "Small and negative" },
          { id: "D", text: "Independent of temperature and positive" },
        ]),
        correctAnswer: "C",
        explanation: "Diamagnetic materials have negative and small susceptibility, and it is independent of temperature according to Curie's law.",
      },
    ];

    for (const q of phyQuestions) {
      await prisma.examQuestion.create({
        data: {
          examScheduleId: phy12Exam.id,
          ...q,
        },
      });
    }
    console.log(`✅ Seeded 5 questions for Class 12 Physics exam (ID: ${phy12Exam.id}).`);
  }

  console.log("Exam questions seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding exam questions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
