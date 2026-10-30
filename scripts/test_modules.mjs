/**
 * Test Suite for Module 1 (Exam Sorting) and Module 2 (Priority Ranking)
 * Covers:
 *  - Normal input
 *  - Empty input
 *  - Single element
 *  - Duplicates
 *  - Exact ties
 *  - Null / undefined / malformed fields
 *  - Required test: Chemistry on Oct 31 ranks above Physics on Nov 2 / Nov 3 when readiness is similar
 *  - 100,000-item stress test with benchmark timing
 */

import { sortExamsByUpcomingPriority } from "../src/lib/algorithms/examSorting.js";
import { rankSubjectsByPriority, calculateUrgency, calculateReadiness, MaxHeap } from "../src/lib/algorithms/priorityRanking.js";

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ""}`);
  }
}

console.log("\n=======================================================");
console.log("RUNNING SUITE: MODULE 1 - EXAM TABLE SORTING");
console.log("=======================================================");

// 1. Empty input
{
  const res = sortExamsByUpcomingPriority([]);
  assert(Array.isArray(res) && res.length === 0, "Empty array returns empty array");
  const resNull = sortExamsByUpcomingPriority(null);
  assert(Array.isArray(resNull) && resNull.length === 0, "Null input returns empty array");
}

// 2. Single element
{
  const single = [{ id: "EX1", subject: "Chemistry", examDate: "2026-10-31T14:00:00Z" }];
  const res = sortExamsByUpcomingPriority(single);
  assert(res.length === 1 && res[0].id === "EX1", "Single element preserved intact");
}

// 3. Normal input: Oct 31 Chemistry, Nov 2 Physics, Nov 4 Computer Science
{
  const refTime = new Date("2026-10-30T10:00:00Z").getTime();
  const sample = [
    { id: "PHY", subject: "Physics", examDate: "2026-11-02T09:30:00Z", isSubmitted: false },
    { id: "CHE", subject: "Chemistry", examDate: "2026-10-31T14:00:00Z", isSubmitted: false },
    { id: "CSC", subject: "Computer Science", examDate: "2026-11-04T10:00:00Z", isSubmitted: false },
    { id: "MAT", subject: "Mathematics", examDate: "2026-10-25T10:00:00Z", isSubmitted: true } // Already completed
  ];

  const sorted = sortExamsByUpcomingPriority(sample, refTime);

  assert(sorted[0].id === "CHE", "Earliest upcoming exam (Chemistry Oct 31) is index 0");
  assert(sorted[1].id === "PHY", "Second upcoming exam (Physics Nov 2) is index 1");
  assert(sorted[2].id === "CSC", "Third upcoming exam (Computer Science Nov 4) is index 2");
  assert(sorted[3].id === "MAT", "Completed exam (Mathematics) sinks to bottom");
}

// 4. Exact Ties and Duplicates
{
  const refTime = new Date("2026-10-30T10:00:00Z").getTime();
  const ties = [
    { id: "EX_B", subject: "Physics", examDate: "2026-11-02T10:00:00Z" },
    { id: "EX_A", subject: "Physics", examDate: "2026-11-02T10:00:00Z" },
    { id: "EX_C", subject: "Chemistry", examDate: "2026-11-02T10:00:00Z" }
  ];
  const sorted = sortExamsByUpcomingPriority(ties, refTime);

  // At identical date 2026-11-02T10:00:00Z:
  // "Chemistry" (EX_C) must come before "Physics" (EX_A and EX_B)
  // For Physics: EX_A must come before EX_B via id tie-break
  assert(sorted[0].id === "EX_C", "Tie-break on date: Chemistry precedes Physics alphabetically");
  assert(sorted[1].id === "EX_A", "Tie-break on date & subject: EX_A precedes EX_B alphabetically by id");
  assert(sorted[2].id === "EX_B", "EX_B is index 2");
}

// 5. Null, undefined, and malformed fields
{
  const messy = [
    null,
    { id: "VALID", subject: "Physics", examDate: "2026-11-02T10:00:00Z" },
    { id: "NO_DATE", subject: "Zoology" },
    { id: "INVALID_DATE", subject: "Botany", examDate: "not-a-date" },
    undefined
  ];
  const sorted = sortExamsByUpcomingPriority(messy);
  assert(sorted.length === 5, "Messy array retains all 5 slots without throwing exceptions");
  assert(sorted[0].id === "VALID", "Valid upcoming record appears first before missing dates");
}

// 6. 100,000-Item Benchmark Stress Test
{
  console.log("\n  [Stress Benchmark] Generating 100,000 exam objects...");
  const COUNT = 100000;
  const largeArray = new Array(COUNT);
  const baseTime = Date.now();

  for (let i = 0; i < COUNT; i++) {
    largeArray[i] = {
      id: `EXAM_${i}`,
      subject: i % 2 === 0 ? "Physics" : "Chemistry",
      examDate: new Date(baseTime + (i % 500) * 86400000).toISOString(),
      isSubmitted: i % 7 === 0
    };
  }

  const startTime = performance.now();
  const sortedLarge = sortExamsByUpcomingPriority(largeArray);
  const elapsedMs = performance.now() - startTime;

  console.log(`  [Stress Benchmark] 100,000 items sorted in: ${elapsedMs.toFixed(2)} ms`);
  assert(sortedLarge.length === COUNT, "100,000 items output length matches exactly");
  assert(elapsedMs < 1200, `Benchmark completes within 1200ms target (actual: ${elapsedMs.toFixed(2)} ms)`);
}

console.log("\n=======================================================");
console.log("RUNNING SUITE: MODULE 2 - SUBJECT PRIORITY RANKING");
console.log("=======================================================");

// 1. Empty & Null input
{
  assert(rankSubjectsByPriority([]).length === 0, "Empty subjects array returns empty array");
  assert(rankSubjectsByPriority(null).length === 0, "Null subjects returns empty array");
}

// 2. REQUIRED TEST: Chemistry (Oct 31) ranks above Physics (Nov 2 / Nov 3) when readiness is similar
{
  const refTime = new Date("2026-10-30T10:00:00Z").getTime(); // Today is Oct 30

  const subjects = [
    {
      code: "PHY-12",
      name: "Physics",
      examDate: "2026-11-03T09:30:00Z", // 4 days away
      diagnosticScore: 0.65,
      practiceAccuracy: 0.70,
      syllabusCompletion: 0.60,
      recencyScore: 0.70
    },
    {
      code: "CHE-12",
      name: "Chemistry",
      examDate: "2026-10-31T14:00:00Z", // ~1.1 days away (Tomorrow!)
      diagnosticScore: 0.65,
      practiceAccuracy: 0.70,
      syllabusCompletion: 0.60,
      recencyScore: 0.70
    },
    {
      code: "CSC-12",
      name: "Computer Science",
      examDate: "2026-11-04T10:00:00Z", // 5 days away
      diagnosticScore: 0.85,
      practiceAccuracy: 0.90,
      syllabusCompletion: 0.90,
      recencyScore: 0.85
    }
  ];

  const ranked = rankSubjectsByPriority(subjects, refTime);

  console.log("\n  Ranked Output:");
  ranked.forEach((r, i) => {
    console.log(`    #${i + 1}: ${r.code} (${r.name}) -> Priority: ${r.priority} | Urgency: ${r.urgency} | Readiness: ${r.readiness} | Days Left: ${r.daysRemaining}`);
  });

  assert(ranked[0].code === "CHE-12", "REQUIRED TEST: Chemistry on Oct 31 ranks #1 above Physics on Nov 3 when readiness is similar");
  assert(ranked[1].code === "PHY-12", "Physics is ranked #2");
  assert(ranked[2].code === "CSC-12", "High-readiness Computer Science is ranked lowest priority");
  assert(ranked[0].priority > ranked[1].priority, `Chemistry priority (${ranked[0].priority}) > Physics priority (${ranked[1].priority})`);
}

// 3. MaxHeap Functionality
{
  const heap = new MaxHeap();
  heap.push({ name: "Low", priority: 10 });
  heap.push({ name: "High", priority: 95 });
  heap.push({ name: "Mid", priority: 50 });

  assert(heap.size() === 3, "MaxHeap holds 3 items");
  assert(heap.peek().name === "High", "MaxHeap peek is highest priority (95)");
  const popped = heap.pop();
  assert(popped.name === "High" && heap.peek().name === "Mid", "MaxHeap pop returns highest, next peek is Mid (50)");
}

// 4. Single element & Ties
{
  const single = [{ code: "BIO-12", name: "Biology", examDate: "2026-11-05" }];
  const res = rankSubjectsByPriority(single);
  assert(res.length === 1 && res[0].code === "BIO-12", "Single subject ranked properly");

  const ties = [
    { code: "ZOO-12", name: "Zoology", examDate: "2026-11-05", diagnosticScore: 0.5 },
    { code: "BOT-12", name: "Botany", examDate: "2026-11-05", diagnosticScore: 0.5 }
  ];
  const rankedTies = rankSubjectsByPriority(ties);
  assert(rankedTies[0].code === "BOT-12", "Tie-break on equal priority: BOT-12 precedes ZOO-12 alphabetically");
}

// 5. 100,000-Item Benchmark Stress Test for Priority Ranking
{
  console.log("\n  [Stress Benchmark] Generating 100,000 subject analysis inputs...");
  const COUNT = 100000;
  const largeSubjects = new Array(COUNT);
  const now = Date.now();

  for (let i = 0; i < COUNT; i++) {
    largeSubjects[i] = {
      code: `SUB_${i}`,
      name: `Subject ${i}`,
      examDate: new Date(now + (i % 30) * 86400000).toISOString(),
      diagnosticScore: (i % 100) / 100,
      practiceAccuracy: (i % 90) / 100,
      syllabusCompletion: (i % 80) / 100,
      recencyScore: (i % 70) / 100
    };
  }

  const startTime = performance.now();
  const rankedLarge = rankSubjectsByPriority(largeSubjects);
  const elapsedMs = performance.now() - startTime;

  console.log(`  [Stress Benchmark] 100,000 subjects evaluated & ranked in: ${elapsedMs.toFixed(2)} ms`);
  assert(rankedLarge.length === COUNT, "100,000 ranked subjects output matches input length");
  assert(elapsedMs < 1200, `Benchmark completes within 1200ms target (actual: ${elapsedMs.toFixed(2)} ms)`);
}

console.log("\n=======================================================");
console.log(`ALL TESTS FINISHED: ${passedTests} / ${totalTests} PASSED`);
console.log("=======================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}

