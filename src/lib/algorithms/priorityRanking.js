/**
 * ============================================================================
 * MODULE 2: SUBJECT PRIORITY RANKING (Deterministic Analysis Engine)
 * ============================================================================
 * 
 * 1. Problem Statement:
 *    Determine the exact sequence in which a student should allocate their
 *    daily study time across Class 12 board subjects.
 *    Priority must be strictly deterministic (zero AI hallucinations):
 *      priority = urgency * (1 - readiness)
 *    where:
 *      - urgency increases non-linearly as the exam date approaches.
 *      - readiness represents the student's mastery [0.0 to 1.0].
 *    A subject with high urgency and low readiness receives maximum priority.
 * 
 * 2. Chosen Algorithm & Data Structure:
 *    - Data Structure: Array + Max-Heap (Binary Heap with 1-based or 0-based indexing)
 *      for streaming retrieval of the highest priority subjects.
 *    - Formula:
 *        urgency(days) = maxUrgency / (1 + (max(0, days) / halfLifeDays) ^ steepness)
 *        readiness = sum(weight_i * metric_i) bounded in [0.0, 1.0]
 *        priority = round(urgency * (1.0 - readiness) * 1000) / 1000
 *    - Single-Pass Map aggregation: Each subject's metrics are computed once.
 * 
 * 3. Complexity:
 *    - Time Complexity: O(K log K) for sorting or heap construction, where K is number
 *      of subjects (typically 6 for CS2612 / BZ2612).
 *    - Space Complexity: O(K) memory to store precomputed priority tuples.
 * ============================================================================
 */

import { EXAM_CONFIG } from "../examConfig.js";

/**
 * Calculates deterministic urgency factor based on days remaining until the examination.
 * Uses a logistic hill equation configured in EXAM_CONFIG.urgencyCurve.
 * 
 * @param {number} daysRemaining - Days until exam (e.g. 1.5, 3.0, 0.0).
 * @param {Object} [curveConfig=EXAM_CONFIG.urgencyCurve] - Config parameters.
 * @returns {number} Urgency score in range [minUrgency, maxUrgency].
 */
export function calculateUrgency(daysRemaining, curveConfig = EXAM_CONFIG.urgencyCurve) {
  const { maxUrgency, minUrgency, halfLifeDays, steepness, imminentThresholdDays } = curveConfig;

  if (typeof daysRemaining !== "number" || isNaN(daysRemaining)) {
    return minUrgency;
  }

  // If exam is today, tomorrow, or in the past, urgency is pegged at maximum
  if (daysRemaining <= (imminentThresholdDays || 2.0)) {
    return maxUrgency;
  }

  const denominator = 1.0 + Math.pow(daysRemaining / halfLifeDays, steepness);
  const rawUrgency = maxUrgency / denominator;

  return Math.max(minUrgency, Math.min(maxUrgency, rawUrgency));
}

/**
 * Calculates deterministic readiness score in the range [0.0, 1.0].
 * 
 * @param {Object} metrics - Object containing raw performance factors:
 *   - diagnosticScore: [0.0 to 1.0]
 *   - practiceAccuracy: [0.0 to 1.0]
 *   - syllabusCompletion: [0.0 to 1.0]
 *   - recencyScore: [0.0 to 1.0]
 * @param {Object} [weights=EXAM_CONFIG.readinessWeights]
 * @returns {number} Composite readiness in [0.0, 1.0].
 */
export function calculateReadiness(metrics = {}, weights = EXAM_CONFIG.readinessWeights) {
  const clamp = (val) => Math.max(0.0, Math.min(1.0, typeof val === "number" && !isNaN(val) ? val : 0.0));

  const diag = clamp(metrics.diagnosticScore ?? metrics.diagnostic ?? 0.0);
  const prac = clamp(metrics.practiceAccuracy ?? metrics.practice ?? 0.0);
  const syll = clamp(metrics.syllabusCompletion ?? metrics.syllabus ?? 0.0);
  const rec = clamp(metrics.recencyScore ?? metrics.recency ?? 0.5); // Default to neutral recency

  const score = (
    diag * weights.diagnosticWeight +
    prac * weights.practiceAccuracyWeight +
    syll * weights.syllabusCompletionWeight +
    rec * weights.recencyWeight
  );

  return Math.round(score * 10000) / 10000;
}

/**
 * Binary Max-Heap Data Structure for priority ranking.
 */
export class MaxHeap {
  constructor(comparator = (a, b) => a.priority - b.priority) {
    this.heap = [];
    this.comparator = comparator;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.heap[0] || null;
  }

  push(item) {
    this.heap.push(item);
    this._siftUp(this.heap.length - 1);
  }

  pop() {
    if (this.isEmpty()) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._siftDown(0);
    }
    return top;
  }

  _siftUp(idx) {
    let current = idx;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.comparator(this.heap[current], this.heap[parent]) > 0) {
        [this.heap[current], this.heap[parent]] = [this.heap[parent], this.heap[current]];
        current = parent;
      } else {
        break;
      }
    }
  }

  _siftDown(idx) {
    let current = idx;
    const length = this.heap.length;
    while (true) {
      const left = 2 * current + 1;
      const right = 2 * current + 2;
      let largest = current;

      if (left < length && this.comparator(this.heap[left], this.heap[largest]) > 0) {
        largest = left;
      }
      if (right < length && this.comparator(this.heap[right], this.heap[largest]) > 0) {
        largest = right;
      }

      if (largest !== current) {
        [this.heap[current], this.heap[largest]] = [this.heap[largest], this.heap[current]];
        current = largest;
      } else {
        break;
      }
    }
  }
}

/**
 * Pure function: Ranks a list of student subjects by study priority.
 * 
 * @param {Array<Object>} subjects - Array of subject evaluation records:
 *   - code: e.g. "CHE-12", "PHY-12"
 *   - name: e.g. "Chemistry", "Physics"
 *   - examDate: Date | string | timestamp
 *   - diagnosticScore: number [0-1]
 *   - practiceAccuracy: number [0-1]
 *   - syllabusCompletion: number [0-1]
 *   - recencyScore: number [0-1]
 * @param {Date|number} [referenceTime=Date.now()] - Current analysis timestamp.
 * @returns {Array<Object>} Ranked array sorted descending by priority score.
 */
export function rankSubjectsByPriority(subjects, referenceTime = Date.now()) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return [];
  }

  const nowMs = typeof referenceTime === "number" ? referenceTime : new Date(referenceTime).getTime();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // Single pass O(K) precomputation of urgency, readiness, and composite priority
  const evaluated = subjects.map((sub, idx) => {
    if (!sub || typeof sub !== "object") {
      return {
        subject: sub,
        code: `UNKNOWN_${idx}`,
        name: "Unknown",
        daysRemaining: 999,
        urgency: EXAM_CONFIG.urgencyCurve.minUrgency,
        readiness: 0.0,
        priority: 0.0
      };
    }

    const examMs = sub.examDate ? new Date(sub.examDate).getTime() : NaN;
    let daysRemaining = 999;
    if (!isNaN(examMs)) {
      daysRemaining = Math.max(0, (examMs - nowMs) / MS_PER_DAY);
    }

    const urgency = calculateUrgency(daysRemaining);
    const readiness = calculateReadiness(sub);
    // Core formula: priority = urgency * (1 - readiness)
    const rawPriority = urgency * (1.0 - readiness);
    const priority = Math.round(rawPriority * 1000) / 1000;

    return {
      ...sub,
      code: sub.code || `SUB_${idx}`,
      name: sub.name || sub.code || "Subject",
      daysRemaining: Math.round(daysRemaining * 10) / 10,
      urgency: Math.round(urgency * 100) / 100,
      readiness: Math.round(readiness * 1000) / 1000,
      priority,
      originalIndex: idx
    };
  });

  // Sort descending by priority: primary = priority desc -> secondary = daysRemaining asc -> tertiary = name asc
  evaluated.sort((a, b) => {
    // 1. Highest priority first
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    // 2. Tie-break: closer exam date
    if (a.daysRemaining !== b.daysRemaining) {
      return a.daysRemaining - b.daysRemaining;
    }
    // 3. Tie-break: alphabetical code/name
    const nameDiff = String(a.code).localeCompare(String(b.code));
    if (nameDiff !== 0) return nameDiff;

    return a.originalIndex - b.originalIndex;
  });

  return evaluated;
}

export default rankSubjectsByPriority;

