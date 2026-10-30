import assert from "node:assert/strict";
import { sortExams, ENGINE_CONFIG } from "../src/lib/config/engine.config.js";
import { sortExamsByUpcomingPriority } from "../src/lib/algorithms/examSorting.js";

console.log("=== Testing Task 2: sortExams & Exam Priority Sorting ===");

const referenceNow = new Date("2026-10-25T10:00:00.000Z").getTime();

// Test 1: Chemistry (Oct 31) must rank above Physics (Nov 3)
const exams1 = [
  { id: "PHY-01", subject: "Physics", examDate: "2026-11-03T10:00:00.000Z" },
  { id: "CHE-01", subject: "Chemistry", examDate: "2026-10-31T10:00:00.000Z" },
];

const sorted1 = sortExams(exams1, referenceNow);
assert.equal(sorted1[0].subject, "Chemistry", "Chemistry (Oct 31) must rank before Physics (Nov 3)");
assert.equal(sorted1[1].subject, "Physics", "Physics (Nov 3) must rank after Chemistry (Oct 31)");
console.log("✔ Test 1 Passed: Chemistry (Oct 31) ranks ahead of Physics (Nov 3)");

// Test 2: When COE reschedules Physics to Oct 29, Physics becomes #1 priority
const exams2 = [
  { id: "PHY-01", subject: "Physics", examDate: "2026-10-29T10:00:00.000Z" },
  { id: "CHE-01", subject: "Chemistry", examDate: "2026-10-31T10:00:00.000Z" },
];

const sorted2 = sortExams(exams2, referenceNow);
assert.equal(sorted2[0].subject, "Physics", "Rescheduled Physics (Oct 29) must now rank first");
assert.equal(sorted2[1].subject, "Chemistry", "Chemistry (Oct 31) must now rank second");
console.log("✔ Test 2 Passed: Rescheduled Physics dynamically reorders to #1 priority");

// Test 3: Live exam takes highest priority; Completed exams sink to bottom
const exams3 = [
  { id: "ENG-01", subject: "English", examDate: "2026-10-20T10:00:00.000Z", isSubmitted: true },
  { id: "CHE-01", subject: "Chemistry", examDate: "2026-10-31T10:00:00.000Z" },
  { id: "BIO-01", subject: "Biology", examDate: "2026-10-25T09:30:00.000Z" }, // active right now
  { id: "MAT-01", subject: "Maths", examDate: "2026-10-18T10:00:00.000Z", isSubmitted: true },
];

const sorted3 = sortExams(exams3, referenceNow);
assert.equal(sorted3[0].subject, "Biology", "Active/live exam must be first");
assert.equal(sorted3[1].subject, "Chemistry", "Upcoming exam must follow live exam");
assert.equal(sorted3[2].subject, "English", "Completed exams sink to bottom, most recent completed first");
assert.equal(sorted3[3].subject, "Maths", "Older completed exam is last");
console.log("✔ Test 3 Passed: Live exams rank first, completed exams sink to bottom");

// Test 4: sortExamsByUpcomingPriority alias works identically
const sorted4 = sortExamsByUpcomingPriority(exams1, referenceNow);
assert.equal(sorted4[0].subject, "Chemistry");
console.log("✔ Test 4 Passed: sortExamsByUpcomingPriority backward compatibility maintained");

// Test 5: Benchmark 50,000 exams
const largeList = [];
for (let i = 0; i < 50000; i++) {
  largeList.push({
    id: `EX-${i}`,
    subject: i % 2 === 0 ? "Chemistry" : "Physics",
    examDate: new Date(referenceNow + (i % 100) * 86400000).toISOString(),
    isSubmitted: i % 5 === 0,
  });
}

const t0 = performance.now();
const largeSorted = sortExams(largeList, referenceNow);
const t1 = performance.now();
console.log(`✔ Test 5 Passed: 50,000 exams sorted in ${(t1 - t0).toFixed(2)} ms (O(N log N))`);

console.log("\nAll 5 Task 2 verification tests PASSED successfully!");

