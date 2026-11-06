// scripts/compile_math.mjs
import fs from "fs";

console.log("Reading template and 14-paper database...");
const template = fs.readFileSync("scripts/math_template.html", "utf8");
const papersJson = fs.readFileSync("scripts/all_14_papers.json", "utf8");

const finalHtml = template.replace("/* EMBEDDED_JSON_HERE */", papersJson);

const targetPaths = [
  "QB/12/MATH/index.html",
  "public/student/qb/12/math/index.html",
  "public/students/qb/12/math/index.html",
  "12/MATH/12th_Standard_Mathematics_Public_Exam_Papers_(2020-2026).html"
];

targetPaths.forEach(p => {
  fs.writeFileSync(p, finalHtml, "utf8");
  console.log(`✓ Generated ${p} (${Math.round(finalHtml.length / 1024)} KB)`);
});

console.log("All 14 Mathematics Public Examination Papers successfully generated!");

