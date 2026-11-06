const fs = require('fs');
const path = require('path');

// Read the template
const templatePath = path.join(__dirname, 'math_template.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');

console.log('Template loaded, length:', templateHtml.length);

