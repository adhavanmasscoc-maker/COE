const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log("=== Verifying Curriculum Files in data/curriculum/ ===");
  const dir = path.join(process.cwd(), 'data', 'curriculum');
  if (!fs.existsSync(dir)) {
    console.error("FAIL: data/curriculum does not exist!");
    process.exit(1);
  }

  const files = fs.readdirSync(dir);
  console.log(`Found ${files.length} curriculum documents:`, files);

  const requiredFiles = [
    'official_exam_engine.json',
    'practice_exam_engine.json',
    'tn_master_syllabus.json',
    'curriculum_platform.json',
    'examination_engine.json',
    'revision_modules.json',
    'curriculum_platform_and_examination_engine.json',
    'class10_math_public_exams_2020_2026.md',
    'class12_csc_public_exams_2020_2026.md'
  ];

  for (const reqFile of requiredFiles) {
    if (!files.includes(reqFile)) {
      console.error(`FAIL: Missing required file: ${reqFile}`);
      process.exit(1);
    }
    const stat = fs.statSync(path.join(dir, reqFile));
    console.log(`  ✓ ${reqFile} (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  console.log("\n=== Verifying JSON Validity ===");
  for (const f of files) {
    if (f.endsWith('.json')) {
      const content = fs.readFileSync(path.join(dir, f), 'utf-8');
      try {
        const parsed = JSON.parse(content);
        console.log(`  ✓ ${f} is valid JSON with keys:`, Object.keys(parsed));
      } catch (err) {
        console.error(`  ✗ ${f} failed to parse:`, err.message);
        process.exit(1);
      }
    }
  }

  console.log("\n=== Verifying In-Memory PDF Parsing Engine ===");
  const { PDFParse } = require('pdf-parse');
  const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 300 144]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF');
  const parser = new PDFParse({ data: dummyPdf });
  const textResult = await parser.getText();
  console.log("  ✓ PDFParse instantiated and extracted text structure:", { total: textResult.total, hasPages: !!textResult.pages });

  console.log("\n=== All Curriculum & Multi-File Verification Checks Passed! ===");
}

runTests().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
