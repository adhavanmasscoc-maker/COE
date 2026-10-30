// Question Bank Validation and Parsing Library
// Compatible with both Next.js ESM imports and Node.js require()

function sanitizeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/javascript:/gi, "")
            .replace(/on\w+\s*=/gi, "");
}

function validateQuestionItems(rawItems) {
  const errors = [];
  const validItems = [];
  const seenQuestions = new Set();

  rawItems.forEach((item, index) => {
    const qNum = item.id || item.questionNumber || index + 1;
    const qText = sanitizeHtml((item.question || item.questionText || "").trim());

    if (!qText) {
      errors.push({
        questionNumber: qNum,
        field: "question",
        message: `Question #${qNum} is missing question text.`,
      });
      return;
    }

    // Check duplicate question text
    const normalizedText = qText.toLowerCase().replace(/\s+/g, " ");
    if (seenQuestions.has(normalizedText)) {
      errors.push({
        questionNumber: qNum,
        field: "duplicate",
        message: `Question #${qNum} is a duplicate of a previous question in this bank: "${qText.slice(0, 40)}..."`,
      });
      return;
    }
    seenQuestions.add(normalizedText);

    // Options validation: supports { A, B, C, D } or [{id, text}]
    let optionsObj = {};
    if (item.options && typeof item.options === "object") {
      if (Array.isArray(item.options)) {
        item.options.forEach((opt) => {
          if (opt && opt.id && opt.text) {
            optionsObj[opt.id.toUpperCase()] = sanitizeHtml(String(opt.text).trim());
          }
        });
      } else {
        ["A", "B", "C", "D"].forEach((key) => {
          if (item.options[key] || item.options[key.toLowerCase()]) {
            optionsObj[key] = sanitizeHtml(String(item.options[key] || item.options[key.toLowerCase()]).trim());
          }
        });
      }
    }

    const missingKeys = ["A", "B", "C", "D"].filter((k) => !optionsObj[k]);
    if (missingKeys.length > 0) {
      errors.push({
        questionNumber: qNum,
        field: "options",
        message: `Question #${qNum} is missing option(s): ${missingKeys.join(", ")}. Exactly 4 options (A, B, C, D) are required.`,
      });
      return;
    }

    // Answer validation
    const ans = String(item.answer || item.correctAnswer || "").trim().toUpperCase();
    if (!ans || !["A", "B", "C", "D"].includes(ans)) {
      errors.push({
        questionNumber: qNum,
        field: "answer",
        message: `Question #${qNum} has an invalid or missing correct answer "${item.answer}". Must be one of: A, B, C, D.`,
      });
      return;
    }

    validItems.push({
      questionNumber: qNum,
      questionText: qText,
      options: optionsObj,
      correctAnswer: ans,
      explanation: item.explanation ? sanitizeHtml(String(item.explanation).trim()) : null,
      difficulty: item.difficulty || "MEDIUM",
      marks: item.marks ? Number(item.marks) : 1,
    });
  });

  return { errors, validItems };
}

function parseMarkdownQuestionBank(markdownText) {
  const blocks = markdownText.split(/(?=(?:^|\n)###?\s*(?:Q\s*)?\d+[\.:\)])|(?=(?:^|\n)\d+[\.:\)]\s+)/i);
  const questions = [];

  blocks.forEach((rawBlock) => {
    const trimmed = rawBlock.trim();
    if (!trimmed) return;

    // Extract Question Number and Text
    const qMatch = trimmed.match(/^(?:###?\s*)?(?:Q\s*)?(\d+)[\.:\)]\s*(.+?)(?=\n[A-D][\.:\)]|\nAnswer:|$)/is);
    let qNum = questions.length + 1;
    let qText = "";

    if (qMatch) {
      qNum = parseInt(qMatch[1], 10) || questions.length + 1;
      qText = qMatch[2].trim();
    } else {
      const firstLine = trimmed.split("\n")[0];
      qText = firstLine.replace(/^(?:###?\s*)?(?:Q\s*)?\d*[\.:\)]\s*/i, "").trim();
    }

    // Extract Options A, B, C, D
    const options = {};
    ["A", "B", "C", "D"].forEach((letter) => {
      const optRegex = new RegExp(`(?:^|\\n)\\s*${letter}[\\.:\\)]\\s*(.+?)(?=\\n[A-D][\\.:\\)]|\\nAnswer:|\\nExplanation:|$|\\n\\n)`, "i");
      const optMatch = trimmed.match(optRegex);
      if (optMatch) {
        options[letter] = optMatch[1].trim();
      }
    });

    // Extract Answer
    const ansMatch = trimmed.match(/(?:^|\n)\s*Answer\s*[:=\-]\s*([A-D])/i);
    const answer = ansMatch ? ansMatch[1].toUpperCase() : "";

    // Extract Explanation
    const expMatch = trimmed.match(/(?:^|\n)\s*Explanation\s*[:=\-]\s*(.+?)(?=\n###|\n\d+[\.:\)]|$)/is);
    const explanation = expMatch ? expMatch[1].trim() : null;

    if (qText) {
      questions.push({
        id: qNum,
        questionNumber: qNum,
        question: qText,
        options,
        answer,
        explanation,
      });
    }
  });

  return questions;
}

function normalizeOptionsList(options) {
  if (!options) return [];
  let parsed = options;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (Array.isArray(parsed)) {
    return parsed.map((item, idx) => {
      const id = String(item?.id || item?.key || String.fromCharCode(65 + idx)).toUpperCase();
      if (typeof item === "string") {
        return { id, text: item, textEn: item, textTa: null };
      }
      if (item && typeof item === "object") {
        const text = String(item.text !== undefined ? item.text : item.label !== undefined ? item.label : item.value !== undefined ? item.value : "");
        const textTa = item.textTa || item.ta || null;
        const textEn = item.textEn || item.en || text;
        return {
          id,
          text,
          textTa,
          textEn,
        };
      }
      return { id, text: String(item || ""), textEn: String(item || ""), textTa: null };
    });
  }
  if (parsed && typeof parsed === "object") {
    return Object.keys(parsed).map((k) => {
      const val = parsed[k];
      const id = k.toUpperCase();
      if (typeof val === "object" && val !== null) {
        return {
          id,
          text: String(val.text || val.label || val.en || ""),
          textTa: val.textTa || val.ta || null,
          textEn: val.textEn || val.en || String(val.text || ""),
        };
      }
      return {
        id,
        text: String(val !== undefined && val !== null ? val : ""),
        textEn: String(val !== undefined && val !== null ? val : ""),
        textTa: null,
      };
    });
  }
  return [];
}

// Data structure: JavaScript Map indexed by questionNumber.
// Time complexity: O(N) single scan + O(1) random access lookup.
// If rules change: Adjust key identifier or projected value fields.
function buildQuestionBankMap(rows) {
  if (!Array.isArray(rows)) return new Map();
  return new Map(rows.map((r) => [r.questionNumber, r]));
}

module.exports = {
  validateQuestionItems,
  parseMarkdownQuestionBank,
  normalizeOptionsList,
  buildQuestionBankMap,
};
