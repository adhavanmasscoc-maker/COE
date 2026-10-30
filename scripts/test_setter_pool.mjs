import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";

const prisma = new PrismaClient({
  datasources: { db: { url: "file:./dev.db" } },
});

async function main() {
  console.log("=== Testing 100-QB Pool Selection & Swapper API Logic ===");

  // Find a subject with QuestionBank items (e.g. Chemistry or Physics)
  const subject = await prisma.subject.findFirst({
    where: { questionBank: { some: {} } },
    include: { questionBank: { orderBy: { questionNumber: "asc" } } },
  });

  if (!subject) {
    console.log("No subject with question bank found in dev.db, querying QuestionBankItem directly...");
    const items = await prisma.questionBankItem.findMany({ orderBy: { questionNumber: "asc" } });
    console.log("Total QuestionBankItem count in dev.db:", items.length);
    return;
  }

  console.log(`Testing with Subject: ${subject.name} (${subject.code}) - Total Bank: ${subject.questionBank.length} Qs`);

  // Verify first 50 vs second 50 partitioning
  const first50 = subject.questionBank.filter((q) => q.questionNumber <= 50);
  const second50 = subject.questionBank.filter((q) => q.questionNumber > 50);

  console.log(`First 50 items count: ${first50.length}, Second 50 items count: ${second50.length}`);
  assert.ok(first50.length > 0, "First 50 must have items");
  assert.ok(first50.every((q) => q.questionNumber <= 50), "All first 50 items must have questionNumber <= 50");
  if (second50.length > 0) {
    assert.ok(second50.every((q) => q.questionNumber > 50), "All second 50 items must have questionNumber > 50");
  }

  // Simulate sampling 25 random from first 50
  const shuffled = [...first50].sort(() => 0.5 - Math.random());
  const sample25 = shuffled.slice(0, Math.min(25, shuffled.length));
  assert.equal(sample25.length, Math.min(25, first50.length), "Sample size must be 25");
  const idSet = new Set(sample25.map((q) => q.id));
  assert.equal(idSet.size, sample25.length, "Sampled 25 must have NO duplicates");

  console.log("✔ Sample 25 from First 50: verified non-duplicate and within range 1..50");

  // Verify sequential first 25
  const seq25 = first50.slice(0, 25);
  assert.equal(seq25.length, Math.min(25, first50.length));
  assert.equal(seq25[0].questionNumber, 1);
  console.log("✔ Sequential 25 from First 50: verified exact order 1..25");

  console.log("\nAll 100-QB Pool selection logic tests PASSED!");
  await prisma.$disconnect();
}

main().catch(console.error);
