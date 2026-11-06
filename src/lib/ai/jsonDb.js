import fs from "fs";
import path from "path";

// In-memory cache for fast serverless responses
const memoryCache = new Map();

/**
 * Returns the global manifest of all academic entities in the AI JSON-DB.
 */
export function getManifest() {
  const manifestPath = path.join(process.cwd(), "json-db", "manifest.json");
  if (!fs.existsSync(manifestPath)) return null;
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

/**
 * Loads and returns all entities for a specific subject code (e.g. "MAT-12", "PHY-12", "CHE-12").
 * @param {string} subjectCode - e.g. "MAT-12", "PHY-12", "CHE-12", "MAT-10"
 * @returns {Array} List of AknexAcademicEntity objects
 */
export function getSubjectEntities(subjectCode) {
  if (!subjectCode) return [];
  const normalizedCode = subjectCode.toUpperCase().trim();

  if (memoryCache.has(normalizedCode)) {
    return memoryCache.get(normalizedCode);
  }

  const standard = normalizedCode.includes("-10") ? "10" : "12";
  const filePath = path.join(process.cwd(), "json-db", standard, `${normalizedCode}-MASTER.json`);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    memoryCache.set(normalizedCode, data);
    return data;
  } catch (err) {
    console.error(`Failed to load json-db file for ${normalizedCode}:`, err);
    return [];
  }
}

/**
 * Retrieves a specific academic entity by its unique ID.
 * @param {string} entityId - e.g. "TN-12-MAT-2024-Q01" or "TN-12-MAT-U01-C002"
 * @returns {object|null}
 */
export function getAcademicEntity(entityId) {
  if (!entityId) return null;
  const parts = entityId.split("-");
  if (parts.length < 3) return null;

  const std = parts[1]; // "10" or "12"
  const subAbbr = parts[2]; // "MAT", "PHY", "CHE"
  const subCode = `${subAbbr}-${std}`;

  const entities = getSubjectEntities(subCode);
  return entities.find((e) => e.id === entityId) || null;
}

/**
 * Searches academic entities by keyword and semantic filters.
 * @param {string} subjectCode - Target subject code
 * @param {string} query - Student query or search terms
 * @param {object} options - { type: "SYLLABUS_CONCEPT" | "QUESTION_ITEM", limit: number }
 * @returns {Array} Scored list of matching entities
 */
export function searchAcademicEntities(subjectCode, query = "", { type = null, limit = 5 } = {}) {
  const entities = getSubjectEntities(subjectCode);
  if (!entities.length) return [];

  const terms = (query || "")
    .toLowerCase()
    .replace(/[^\w\s\u0B80-\u0BFF]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (!terms.length) {
    let filtered = entities;
    if (type) filtered = filtered.filter((e) => e.type === type);
    return filtered.slice(0, limit);
  }

  const scored = entities
    .filter((e) => (type ? e.type === type : true))
    .map((e) => {
      let score = 0;
      const haystack = [
        e.topic,
        e.unitTitle?.en,
        e.unitTitle?.ta,
        e.conceptPayload?.summaryMarkdownEn,
        e.conceptPayload?.summaryMarkdownTa,
        e.conceptPayload?.keyFormulas?.join(" "),
        e.questionPayload?.questionEn,
        e.questionPayload?.questionTa,
        e.questionPayload?.stepByStepSolution?.en,
        e.questionPayload?.stepByStepSolution?.ta,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      for (const term of terms) {
        if (haystack.includes(term)) {
          score += 2;
        }
      }

      return { entity: e, score };
    })
    .filter((res) => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((res) => res.entity);

  return scored;
}

/**
 * Formats an AknexAcademicEntity into a clean, markdown-enriched context block for Gemini prompts.
 * @param {object} entity - AknexAcademicEntity object
 * @param {string} userLanguage - "en" or "ta"
 * @returns {string} Formatted markdown prompt context
 */
export function formatEntityForGemini(entity, userLanguage = "en") {
  if (!entity) return "";
  const isTa = userLanguage === "ta";

  if (entity.type === "SYLLABUS_CONCEPT") {
    const payload = entity.conceptPayload || {};
    const summary = isTa ? payload.summaryMarkdownTa || payload.summaryMarkdownEn : payload.summaryMarkdownEn;
    const formulas = (payload.keyFormulas || []).map((f) => `• $${f.replace(/^\$|\$$/g, "")}$`).join("\n");
    const pitfalls = (payload.commonPitfalls || []).map((p) => `• ${p}`).join("\n");

    return `### Academic Reference: ${entity.topic}
**Subject**: ${entity.subjectCode} (Standard ${entity.standard})
**Unit ${entity.unitNumber}**: ${isTa ? entity.unitTitle?.ta || entity.unitTitle?.en : entity.unitTitle?.en}

#### Theoretical Core:
${summary}

${formulas ? `#### Key Formulas:\n${formulas}\n` : ""}
${pitfalls ? `#### Watch Out For:\n${pitfalls}\n` : ""}`;
  }

  if (entity.type === "QUESTION_ITEM") {
    const payload = entity.questionPayload || {};
    const qText = isTa ? payload.questionTa || payload.questionEn : payload.questionEn;
    const sol = isTa ? payload.stepByStepSolution?.ta || payload.stepByStepSolution?.en : payload.stepByStepSolution?.en;

    let optionsText = "";
    if (payload.options) {
      optionsText = Object.entries(payload.options)
        .map(([k, v]) => `(${k}) ${v}`)
        .join("  |  ");
    }

    return `### Exam Question Reference [${entity.id}]
**Subject**: ${entity.subjectCode} (${payload.part || "Standard Exam"}, ${payload.marks || 1} Mark)
**Source**: ${payload.sourceExam || "TN DGE Board Examination"}

**Question**:
${qText}

${optionsText ? `**Options**: ${optionsText}\n` : ""}
**Correct Answer**: (${payload.correctAnswer})

**Official Valuation Rubric / Step-by-Step Solution**:
${sol}`;
  }

  return "";
}

