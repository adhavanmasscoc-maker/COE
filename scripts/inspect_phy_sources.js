const fs = require('fs');

const master = JSON.parse(fs.readFileSync('d:/DYNAMIC EXAM SITE/json-db/12/PHY-12-MASTER.json', 'utf8'));
const qItems = master.filter(item => item.type === 'QUESTION_ITEM');
console.log('Master PHY question items:', qItems.length);

const all100 = JSON.parse(fs.readFileSync('d:/DYNAMIC EXAM SITE/questions/exams/PHYSICS-12-100-ALL.json', 'utf8'));
console.log('PHYSICS-12-100-ALL keys:', Object.keys(all100));
if (all100.questions) console.log('all100 questions len:', all100.questions.length);
if (all100.set1) console.log('all100 set1 len:', all100.set1.length, 'set2 len:', all100.set2.length);

const set1 = JSON.parse(fs.readFileSync('d:/DYNAMIC EXAM SITE/questions/exams/PHYSICS-12-50-SET1.json', 'utf8'));
console.log('SET1 questions len:', set1.questions ? set1.questions.length : 0);

const set2 = JSON.parse(fs.readFileSync('d:/DYNAMIC EXAM SITE/questions/exams/PHYSICS-12-50-SET2.json', 'utf8'));
console.log('SET2 questions len:', set2.questions ? set2.questions.length : 0);

