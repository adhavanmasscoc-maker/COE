const fs = require('fs');

const physHtml = fs.readFileSync('d:/DYNAMIC EXAM SITE/QB/12/PHYSICS/index.html', 'utf8');

// Find EXAM_DATABASE in the script
const match = physHtml.match(/const\s+EXAM_DATABASE\s*=\s*(\{[\s\S]*?\n\s*\};\n)/);
if (match) {
  console.log('Found EXAM_DATABASE declaration, length:', match[1].length);
  // Evaluate or extract keys
  const dbCode = match[1];
  try {
    const fn = new Function('return ' + dbCode.replace(/;\s*$/, ''));
    const db = fn();
    console.log('Parsed successfully! Keys:', Object.keys(db));
    fs.writeFileSync('d:/DYNAMIC EXAM SITE/scripts/physics_extracted_raw.json', JSON.stringify(db, null, 2), 'utf8');
    console.log('Saved physics_extracted_raw.json');
  } catch (err) {
    console.error('Eval error:', err.message);
  }
} else {
  console.log('EXAM_DATABASE not matched by regex');
}

