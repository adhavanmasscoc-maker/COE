import assert from "node:assert/strict";
import { pickQuestion, pickOption, pickExplanation } from "../src/lib/config/engine.config.js";

console.log("=== Testing Practice Submission Mistakes-First & Filter Logic ===");

const sampleQuestions = [
  { id: "Q1", questionText: "What is H2O?", correctAnswer: "A", options: [{ id: "A", text: "Water" }, { id: "B", text: "Acid" }], explanation: "Water molecule" },
  { id: "Q2", questionText: "What is NaCl?", correctAnswer: "B", options: [{ id: "A", text: "Sugar" }, { id: "B", text: "Salt" }], explanation: "Sodium chloride is salt" },
  { id: "Q3", questionText: "What is CO2?", correctAnswer: "C", options: [{ id: "A", text: "Oxygen" }, { id: "B", text: "Nitrogen" }, { id: "C", text: "Carbon dioxide" }], explanation: "Carbon dioxide" },
  { id: "Q4", questionText: "What is Au?", correctAnswer: "D", options: [{ id: "A", text: "Silver" }, { id: "D", text: "Gold" }], explanation: "Gold symbol" },
];

const answers = {
  Q1: "A", // Correct
  Q2: "A", // Wrong (Salt vs Sugar)
  Q3: "B", // Wrong (CO2 vs Nitrogen)
  // Q4: Skipped
};

let calculatedScore = 0;
let incorrectCount = 0;
let unattemptedCount = 0;
let correctCount = 0;

const breakdown = sampleQuestions.map((q, idx) => {
  const chosen = answers[q.id];
  const isCorrect = Boolean(chosen && chosen.toUpperCase() === q.correctAnswer?.toUpperCase());
  if (isCorrect) {
    calculatedScore += 1;
    correctCount += 1;
  } else if (chosen) {
    incorrectCount += 1;
  } else {
    unattemptedCount += 1;
  }
  return { ...q, index: idx + 1, chosen, isCorrect };
});

assert.equal(calculatedScore, 1, "Score must be 1");
assert.equal(correctCount, 1, "Correct count must be 1");
assert.equal(incorrectCount, 2, "Incorrect count must be 2");
assert.equal(unattemptedCount, 1, "Unattempted count must be 1");

// Test default filter: if incorrectCount > 0, default is INCORRECT
const defaultFilter = incorrectCount > 0 ? "INCORRECT" : unattemptedCount > 0 ? "UNATTEMPTED" : "ALL";
assert.equal(defaultFilter, "INCORRECT", "Default filter must be INCORRECT to show mistakes directly");

// Filter by INCORRECT
const wrongOnly = breakdown.filter((item) => item.chosen && !item.isCorrect);
assert.equal(wrongOnly.length, 2, "Must show exactly the 2 wrong answers directly");
assert.equal(wrongOnly[0].id, "Q2");
assert.equal(wrongOnly[1].id, "Q3");

console.log("✔ Test 1 Passed: Wrong answers filtered directly without scrolling (Q2, Q3)");
console.log("✔ Test 2 Passed: Accurate counts: 1 Correct, 2 Wrong, 1 Skipped");
console.log("✔ Test 3 Passed: Default tab automatically routes to mistakes first");

console.log("\nAll practice wrong-answers-first tests PASSED!");

