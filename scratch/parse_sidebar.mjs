import fs from 'fs';

const sidebarCode = fs.readFileSync('./src/components/layout/Sidebar.jsx', 'utf8');

// Find all `else if (...) { navSections = [ ... ] }` or similar blocks
const branchRegex = /(?:if|else if)\s*\(([^)]+)\)\s*\{[\s\S]*?navSections\s*=\s*(\[[\s\S]*?\]);/g;

let match;
let count = 0;
while ((match = branchRegex.exec(sidebarCode)) !== null) {
  count++;
  const condition = match[1].trim();
  const rawSections = match[2];
  
  // Extract items { id, label }
  const itemMatches = [...rawSections.matchAll(/id:\s*['"]([^'"]+)['"],\s*label:\s*['"]([^'"]+)['"]/g)];
  console.log(`\n========================================`);
  console.log(`BRANCH #${count}: Condition: ${condition}`);
  console.log(`Items count: ${itemMatches.length}`);
  itemMatches.forEach(item => {
    console.log(`  - [${item[1]}] -> ${item[2]}`);
  });
}

