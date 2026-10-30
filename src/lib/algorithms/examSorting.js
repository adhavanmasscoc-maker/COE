/**
 * ============================================================================
 * MODULE 1: EXAM TABLE SORTING (Student Dashboard & Schedule Views)
 * ============================================================================
 * 
 * 1. Problem Statement:
 *    Organize scheduled examinations for display in the candidate dashboard.
 *    Nearest upcoming exams must have top priority so students immediately see
 *    what to study next (e.g. Chemistry on Oct 31 before Physics on Nov 2).
 *    Completed/submitted examinations must cleanly sink to the bottom.
 *    Any date modification published by the Controller of Examinations (COE)
 *    must produce an updated deterministic order without layout thrashing.
 * 
 * 2. Chosen Algorithm & Data Structure:
 *    - Data Structure: Linear Array with stable multi-key comparative tuple evaluation.
 *    - Algorithm: Array.prototype.sort with a normalized integer priority key:
 *        * Group 0: Upcoming Active / Unlocked (exam time reached, ready to attend)
 *        * Group 1: Upcoming Future (earliest date & time first)
 *        * Group 2: Completed / Submitted (sunk to bottom, sorted by submission/date desc)
 *    - Tie-Breaking: Primary = Status Group -> Secondary = Timestamp (ms) -> Tertiary = Subject Name -> Quaternary = Exam ID.
 * 
 * 3. Complexity:
 *    - Time Complexity: O(N log N) where N is the total number of exams.
 *      Single-pass pre-normalization ensures no repeated date parsing inside comparator loops.
 *    - Space Complexity: O(N) memory allocation to maintain pure immutability of input.
 * ============================================================================
 */

import { EXAM_CONFIG } from "../examConfig.js";
import { sortExams } from "../config/engine.config.js";

export { sortExams };

/**
 * Safely converts any valid date string, Date object, or epoch number to millisecond timestamp.
 * Returns Infinity if invalid or absent to push unparseable records to the end deterministically.
 */
function parseTimestampSafe(rawDate) {
  if (!rawDate) return Number.MAX_SAFE_INTEGER;
  if (rawDate instanceof Date) {
    const t = rawDate.getTime();
    return isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
  }
  const parsed = new Date(rawDate).getTime();
  return isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
}

/**
 * Extracts a normalized subject name string for tie-breaking.
 */
function extractSubjectName(exam) {
  if (!exam) return "";
  if (typeof exam.subject === "string") return exam.subject;
  if (exam.subject && typeof exam.subject === "object") {
    return exam.subject.name || exam.subject.code || "";
  }
  return exam.name || exam.code || "";
}

/**
 * Pure function: Sorts an array of exams deterministically.
 * 
 * @param {Array<Object>} exams - Array of raw exam schedule objects.
 * @param {number|Date} [referenceTime=Date.now()] - Current wall clock timestamp.
 * @returns {Array<Object>} New shallow copy sorted according to syllabus rules.
 */
export function sortExamsByUpcomingPriority(exams, referenceTime = Date.now()) {
  if (!Array.isArray(exams) || exams.length === 0) {
    return [];
  }

  const nowMs = typeof referenceTime === "number" ? referenceTime : new Date(referenceTime).getTime();

  // Step 1: Decorate in O(N) single pass to avoid repeated Date parsing during comparison
  const decorated = exams.map((item, originalIndex) => {
    if (!item || typeof item !== "object") {
      return {
        item,
        originalIndex,
        group: 3,
        timestamp: Number.MAX_SAFE_INTEGER,
        subjectName: "",
        id: ""
      };
    }

    const timestamp = parseTimestampSafe(item.examDate || item.date || item.startTime);
    const isSubmitted = Boolean(
      item.isSubmitted ||
      item.submission?.isSubmitted ||
      item.status === "COMPLETED" ||
      item.status === "EVALUATED"
    );

    let group = 1; // Default: Upcoming future scheduled exam
    if (isSubmitted) {
      group = 2; // Sunk to bottom: completed/submitted
    } else if (timestamp <= nowMs && timestamp !== Number.MAX_SAFE_INTEGER) {
      group = 0; // Top priority: exam window active right now
    }

    return {
      item,
      originalIndex,
      group,
      timestamp,
      subjectName: extractSubjectName(item).toLowerCase(),
      id: String(item.id || item._id || originalIndex)
    };
  });

  // Step 2: Sort in O(N log N) using stable 4-tuple comparison
  decorated.sort((a, b) => {
    // 1. Group status (Active=0 < Upcoming=1 < Completed=2)
    if (a.group !== b.group) {
      return a.group - b.group;
    }

    // 2. Earliest timestamp first for upcoming; for completed, latest date first
    if (a.group === 2) {
      // Completed: reverse chronological
      if (a.timestamp !== b.timestamp) return b.timestamp - a.timestamp;
    } else {
      // Active & Upcoming: earliest date first
      if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
    }

    // 3. Stable Tie-Break 1: Subject Name alphabetical
    const nameDiff = a.subjectName.localeCompare(b.subjectName);
    if (nameDiff !== 0) return nameDiff;

    // 4. Stable Tie-Break 2: Exam ID string
    const idDiff = a.id.localeCompare(b.id);
    if (idDiff !== 0) return idDiff;

    // 5. Ultimate guarantee: original insertion order
    return a.originalIndex - b.originalIndex;
  });

  // Step 3: Undecorate in O(N)
  return decorated.map(d => d.item);
}

export default sortExamsByUpcomingPriority;

