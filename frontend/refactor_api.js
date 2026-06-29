const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib', 'api', 'tutors.api.ts');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /const res = await fetch\(([\s\S]*?)\);\s+if \(!res\.ok\) \{[\s\S]*?throw new Error\([\s\S]*?\);\s+\}\s+return res\.json\(\);/gm;

content = content.replace(regex, (match, fetchArgs) => {
  return `return apiFetch<any>(${fetchArgs});`;
});

const regexSimple = /const res = await fetch\(([\s\S]*?)\);\s+if \(!res\.ok\) throw new Error\([\s\S]*?\);\s+return res\.json\(\);/gm;

content = content.replace(regexSimple, (match, fetchArgs) => {
  return `return apiFetch<any>(${fetchArgs});`;
});

fs.writeFileSync(filePath, content);
console.log('Successfully refactored fetch to apiFetch');
