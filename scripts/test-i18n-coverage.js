#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'src', 'locales', 'en.json');
const taPath = path.join(__dirname, '..', 'src', 'locales', 'ta.json');

if (!fs.existsSync(enPath) || !fs.existsSync(taPath)) {
  console.error('❌ Locale files missing: en.json or ta.json not found in src/locales/');
  process.exit(1);
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ta = JSON.parse(fs.readFileSync(taPath, 'utf8'));

const enKeys = Object.keys(en);
const taKeys = Object.keys(ta);

console.log(`Checking i18n key coverage: en.json has ${enKeys.length} keys, ta.json has ${taKeys.length} keys.`);

const missingInTa = [];
enKeys.forEach((key) => {
  if (ta[key] === undefined || ta[key] === null || ta[key].trim() === '') {
    missingInTa.push(key);
  }
});

if (missingInTa.length > 0) {
  console.error(`❌ i18n coverage failure: ${missingInTa.length} key(s) in en.json missing or empty in ta.json:`);
  missingInTa.forEach((k) => console.error(`   - ${k}`));
  process.exit(1);
}

console.log('✅ i18n coverage check PASSED! 100% of en.json keys are covered in ta.json with non-empty Tamil translations.');
process.exit(0);

