const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATE_PATH = path.join(__dirname, 'math_template.html');
const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf8');

const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];
const SESSIONS = ['annual', 'supp'];

// Utility to create HTML from template
function generateSubjectHtml(config, examPapersJson) {
  let html = templateHtml;

  // Replace Title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>Tamil Nadu HSE (+2) ${config.titleEn} Public Examination Archive (2020–2026) • 14 Official Board Papers</title>`
  );

  // Replace Brand Title and Subtitle in Header
  html = html.replace(
    /<h1 class="brand-title">[\s\S]*?<\/h1>/,
    `<h1 class="brand-title">
            <i data-lucide="${config.icon || 'book-open'}" style="width:18px;height:18px;"></i>
            HSE (+2) ${config.titleEn} Archive
          </h1>`
  );

  html = html.replace(
    /<span class="brand-subtitle">.*?<\/span>/,
    `<span class="brand-subtitle">Tamil Nadu State Board • 2020–2026 (14 Official Papers) • Code: ${config.subjectCode}</span>`
  );

  // Replace Blueprint Modal Title & Content
  html = html.replace(
    /<h3 class="modal-title">.*?<\/h3>/,
    `<h3 class="modal-title">DGE Examination Blueprint & Weightage — ${config.titleEn}</h3>`
  );

  if (config.blueprintHtml) {
    html = html.replace(
      /<div style="font-size:0.85rem;line-height:1.7;color:var\(--text-secondary\);">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
      `<div style="font-size:0.85rem;line-height:1.7;color:var(--text-secondary);">${config.blueprintHtml}</div></div></div>`
    );
  }

  // Replace Maximum Marks in Meta Row script if needed
  if (config.maxMarks && config.maxMarks !== 90) {
    html = html.replace(
      'Maximum Marks: 90',
      `Maximum Marks: ${config.maxMarks} (Theory: ${config.maxMarks}, Practical/Internal: ${100 - config.maxMarks})`
    );
  }

  // Replace Section headers / rubrics if customized
  if (config.part1Rubric) {
    html = html.replace(/20 × 1 = 20 Marks • All Questions Compulsory/g, config.part1Rubric);
  }
  if (config.part2Rubric) {
    html = html.replace(/7 × 2 = 14 Marks • Answer any 7 • Q30 is Compulsory/g, config.part2Rubric);
  }
  if (config.part3Rubric) {
    html = html.replace(/7 × 3 = 21 Marks • Answer any 7 • Q40 is Compulsory/g, config.part3Rubric);
  }
  if (config.part4Rubric) {
    html = html.replace(/7 × 5 = 35 Marks • Answer all Questions \(Either \/ Or\)/g, config.part4Rubric);
  }

  // Inject Embedded Exam Papers JSON
  html = html.replace('/* EMBEDDED_JSON_HERE */', JSON.stringify(examPapersJson, null, 2));

  return html;
}

module.exports = {
  YEARS,
  SESSIONS,
  generateSubjectHtml
};

