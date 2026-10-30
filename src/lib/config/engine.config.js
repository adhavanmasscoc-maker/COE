/**
 * Central Engine Configuration & Language Resolver
 * File: src/lib/config/engine.config.js
 */

export const ENGINE_CONFIG = Object.freeze({
  statusRank: Object.freeze({ live: 0, upcoming: 1, completed: 2 }),
  urgency: Object.freeze({ minDays: 0.5 }),
  weights: Object.freeze({ diagnostic: 0.3, practice: 0.4, self: 0.15, recency: 0.15 }),
  weakTopic: Object.freeze({ minAttempts: 3, maxItems: 5 }),
  scoreBuckets: Object.freeze([0, 35, 50, 60, 75, 90, 101]),
  diagnosticQuestionsPerSubject: 10,
  dailyStudyMinutes: 180,
  retry: Object.freeze({ maxTries: 4, baseMs: 400 }),
  missingMessage: Object.freeze({
    en: "Content is being prepared by the examination cell.",
    ta: "பாடக்குறிப்புகள் மற்றும் விடைகள் தயாரிப்பில் உள்ளன.",
  }),
  supportedMediums: Object.freeze(["en", "ta"]),
});

// Data structure: Direct object property lookup.
// Time complexity: O(1) constant time.
// If rules change: Update fallback string in ENGINE_CONFIG.missingMessage, not here.
export function pick(field, medium, missingMsg = ENGINE_CONFIG.missingMessage) {
  const norm = medium === "Tamil" || medium === "ta" ? "ta" : "en";
  const v = field?.[norm];
  return typeof v === "string" && v.trim() ? v : missingMsg[norm];
}

// Data structure: Plain object field bundle { en, ta }.
// Time complexity: O(1) constant time.
// If rules change: Add or adjust question field aliases in the field object mapping.
export function pickQuestion(q, medium, missingMsg = ENGINE_CONFIG.missingMessage) {
  if (!q) {
    const norm = medium === "Tamil" || medium === "ta" ? "ta" : "en";
    return missingMsg[norm];
  }
  const field = {
    en: q.question_en || q.questionTextEn || q.questionText || q.question || q.text || "",
    ta: q.question_ta || q.questionTextTa || "",
  };
  return pick(field, medium, missingMsg);
}

// Data structure: Plain object field bundle { en, ta }.
// Time complexity: O(1) constant time.
// If rules change: Add or adjust option field aliases in the field object mapping.
export function pickOption(opt, medium, missingMsg = ENGINE_CONFIG.missingMessage) {
  if (!opt) {
    const norm = medium === "Tamil" || medium === "ta" ? "ta" : "en";
    return missingMsg[norm];
  }
  if (typeof opt === "string") return opt;
  const field = {
    en: opt.textEn || opt.en || opt.text || opt.label || opt.value || "",
    ta: opt.textTa || opt.ta || "",
  };
  return pick(field, medium, missingMsg);
}

// Data structure: Plain object field bundle { en, ta }.
// Time complexity: O(1) constant time.
// If rules change: Add or adjust explanation field aliases in the field object mapping.
export function pickExplanation(q, medium, missingMsg = ENGINE_CONFIG.missingMessage) {
  if (!q) {
    const norm = medium === "Tamil" || medium === "ta" ? "ta" : "en";
    return missingMsg[norm];
  }
  const field = {
    en: q.explanation_en || q.explanationEn || q.explanation || "",
    ta: q.explanation_ta || q.explanationTa || "",
  };
  return pick(field, medium, missingMsg);
}

// Data structure: Array decoration with integer rank tuple { e, rank, examAt, subject, id, originalIndex }.
// Time complexity: O(N log N) with O(N) memory allocation and single-pass timestamp normalization.
// If rules change: Update cfg.statusRank or add custom tie-break rules in comparator.
export function sortExams(exams, now = Date.now(), cfg = ENGINE_CONFIG) {
  if (!Array.isArray(exams) || exams.length === 0) return [];
  const nowMs = typeof now === "number" ? now : new Date(now).getTime();

  const statusOf = (e) => {
    if (e.isSubmitted || e.submission?.isSubmitted || e.status === "COMPLETED" || e.status === "EVALUATED") {
      return "completed";
    }
    const examAtMs = new Date(e.examAt || e.examDate || e.startTime || 0).getTime();
    const durationMs = (e.durationMinutes || 150) * 60 * 1000;
    const windowEndMs = e.windowEnd ? new Date(e.windowEnd).getTime() : examAtMs + durationMs;
    if (windowEndMs > 0 && nowMs >= windowEndMs) return "completed";
    if (examAtMs > 0 && nowMs >= examAtMs) return "live";
    return "upcoming";
  };

  return exams
    .map((e, idx) => {
      const examAt = new Date(e?.examAt || e?.examDate || e?.startTime || 0).getTime() || 0;
      const status = statusOf(e || {});
      const rank = cfg.statusRank[status] ?? 1;
      const subject = typeof e?.subject === "string" ? e.subject : (e?.subject?.name || e?.name || "");
      const id = String(e?.id || idx);
      return { e, rank, examAt, subject, id, originalIndex: idx };
    })
    .sort((a, b) =>
      a.rank - b.rank ||
      (a.rank === cfg.statusRank.completed ? b.examAt - a.examAt : a.examAt - b.examAt) ||
      a.subject.localeCompare(b.subject) ||
      a.id.localeCompare(b.id) ||
      a.originalIndex - b.originalIndex
    )
    .map((d) => d.e);
}


