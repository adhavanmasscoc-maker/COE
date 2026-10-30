/**
 * Centralized Exam & Study Configuration for "DYNAMIC EXAM SITE"
 * All operational thresholds, curve parameters, and algorithm weights reside here.
 * No hardcoded magic numbers in business logic.
 */

export const EXAM_CONFIG = Object.freeze({
  // 1. Daily Study Limits & Schedule Slots
  schedule: Object.freeze({
    dailyStudyLimitMinutes: 240, // 4 hours maximum daily study target
    minSessionDurationMinutes: 30,
    maxSessionDurationMinutes: 90,
    breakDurationMinutes: 15,
    preferredSlotBoundaries: Object.freeze([
      { id: "morning", startHour: 6, endHour: 9, maxMinutes: 120 },
      { id: "evening", startHour: 17, endHour: 20, maxMinutes: 120 },
      { id: "night", startHour: 20, endHour: 22, maxMinutes: 60 }
    ]),
  }),

  // 2. Readiness Metric Component Weights (must sum to 1.0)
  readinessWeights: Object.freeze({
    diagnosticWeight: 0.30,      // Baseline diagnostic test performance (30%)
    practiceAccuracyWeight: 0.35,// Question bank practice accuracy (35%)
    syllabusCompletionWeight: 0.20,// Chapter progress coverage (20%)
    recencyWeight: 0.15          // Recent study frequency / activity decay (15%)
  }),

  // 3. Urgency Curve Parameters
  // urgency(days) = maxUrgency / (1 + (days / halfLifeDays)^steepness)
  urgencyCurve: Object.freeze({
    maxUrgency: 100.0,
    minUrgency: 5.0,
    halfLifeDays: 5.0,   // At 5 days before exam, urgency is 50% of maximum
    steepness: 1.8,      // Non-linear acceleration when exam is < 3 days away
    imminentThresholdDays: 2.0 // Exams within 48h receive immediate peak prioritization
  }),

  // 4. Diagnostic & Practice Constraints
  diagnostics: Object.freeze({
    questionsPerSubject: 15,
    passScorePercentage: 40.0,
    masteryScorePercentage: 80.0
  }),

  // 5. Analytics & Weak-Topic Detection
  analytics: Object.freeze({
    minAttemptsForWeakTopic: 3, // Minimum student attempts on a topic before flagging as weak
    weakTopicAccuracyThreshold: 0.50, // Accuracy below 50% flags as high priority intervention
    strongTopicAccuracyThreshold: 0.85,
  }),

  // 6. Mark Distribution Histogram Buckets (Percentage Ranges: [min, max, label])
  markDistributionBuckets: Object.freeze([
    { min: 0, max: 34.99, label: "E (< 35% - Needs Attention)" },
    { min: 35, max: 49.99, label: "D (35% - 49% - Satisfactory)" },
    { min: 50, max: 69.99, label: "C (50% - 69% - Average)" },
    { min: 70, max: 84.99, label: "B (70% - 84% - Commendable)" },
    { min: 85, max: 100, label: "A (85% - 100% - Distinction)" },
  ]),

  // 7. Network Retry & Idempotency Config
  networkSubmission: Object.freeze({
    maxRetries: 3,
    initialDelayMs: 600,
    backoffFactor: 2.0,
    maxDelayMs: 4000,
    idempotencyWindowSeconds: 60
  })
});

export default EXAM_CONFIG;

