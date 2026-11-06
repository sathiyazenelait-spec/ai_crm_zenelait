import fs from 'fs';

const sidebarCode = fs.readFileSync('./src/components/layout/Sidebar.jsx', 'utf8');
const layoutCode = fs.readFileSync('./src/components/layout/Layout.jsx', 'utf8');

const layoutCases = new Set();
const caseRegex = /case\s+['"]([^'"]+)['"]/g;
let match;
while ((match = caseRegex.exec(layoutCode)) !== null) {
  layoutCases.add(match[1]);
}

const lines = sidebarCode.split('\n');
lines.forEach((line, idx) => {
  const m = line.match(/id:\s*['"]([^'"]+)['"]/);
  if (m) {
    const id = m[1];
    if (!layoutCases.has(id)) {
      console.log(`Line ${idx + 1}: id='${id}' -> ${line.trim()}`);
    }
  }
});
