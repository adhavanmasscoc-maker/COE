const fs = require('fs');

const master = JSON.parse(fs.readFileSync('d:/DYNAMIC EXAM SITE/json-db/12/CHE-12-MASTER.json', 'utf8'));
const qItems = master.filter(item => item.type === 'QUESTION_ITEM');
console.log('Master CHE question items:', qItems.length);

const all100 = JSON.parse(fs.readFileSync('d:/DYNAMIC EXAM SITE/questions/exams/CHEMISTRY-12-100-ALL.json', 'utf8'));
console.log('CHEMISTRY-12-100-ALL keys:', Object.keys(all100));
console.log('set1 len:', all100.set1 ? all100.set1.length : 0);
console.log('set2 len:', all100.set2 ? all100.set2.length : 0);

const c100 = JSON.parse(fs.readFileSync('d:/DYNAMIC EXAM SITE/scripts/chemistry_100_questions.json', 'utf8'));
console.log('chemistry_100_questions keys:', Object.keys(c100));
console.log('c100 set1 len:', c100.set1 ? c100.set1.length : 0);
console.log('c100 set2 len:', c100.set2 ? c100.set2.length : 0);

