const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib/api/tutors.api.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Thêm import apiFetch
if (!content.includes('import { apiFetch }')) {
  content = "import { apiFetch } from './interceptor';\n" + content;
}

// Hàm cần replace
// Từ:
//   const res = await fetch(...)
//   if (!res.ok) ...
//   return res.json();
// Đến:
//   return apiFetch(...)

content = content.replace(/const res = await fetch\((.*?)\);\s*if \(!res\.ok\)[\s\S]*?(?:throw new Error.*?|return \{ ok: false.*?\}|\})\s*return res\.json\(\);/gm, 'return apiFetch<any>($1);');

// Handle special case where err.message is caught
content = content.replace(/const res = await fetch\((.*?)\);\s*if \(!res\.ok\) \{[\s\S]*?throw new Error.*?;\s*\}\s*return res\.json\(\);/gm, 'return apiFetch<any>($1);');

// Clean up unused variables
content = content.replace(/const token = getToken\(\);\s*return apiFetch/gm, 'const token = getToken();\n  return apiFetch');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactored tutors.api.ts successfully');
