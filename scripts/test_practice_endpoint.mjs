import fs from 'fs';
import path from 'path';

function testBank(code, set) {
  const isSetB = set === "2" || set === "set-b";
  let bankFileName = null;
  if (code === "CHE-12") bankFileName = isSetB ? "CHEMISTRY-12-50-SET2.json" : "CHEMISTRY-12-50-SET1.json";
  if (code === "PHY-12") bankFileName = isSetB ? "PHYSICS-12-50-SET2.json" : "PHYSICS-12-50-SET1.json";
  if (code === "ENG-12") bankFileName = isSetB ? "ENGLISH-12-50-SET2.json" : "ENGLISH-12-50-SET1.json";

  const filePath = path.join(process.cwd(), "questions", "exams", bankFileName);
  const exists = fs.existsSync(filePath);
  if (!exists) return { code, set, exists: false };
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const qArr = raw.questions || [];
  return {
    code,
    set: isSetB ? "Set B" : "Set A",
    fileName: bankFileName,
    exists: true,
    count: qArr.length,
    sampleQ: qArr[0]?.id,
    hasTamil: Boolean(qArr[0]?.question_ta || qArr[0]?.options_ta)
  };
}

console.log(testBank("CHE-12", "set-a"));
console.log(testBank("CHE-12", "set-b"));
console.log(testBank("PHY-12", "set-a"));
console.log(testBank("PHY-12", "set-b"));
console.log(testBank("ENG-12", "set-a"));
console.log(testBank("ENG-12", "set-b"));

