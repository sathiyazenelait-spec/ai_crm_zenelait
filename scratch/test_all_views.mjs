import fs from 'fs';
import path from 'path';

function getJsxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsxFiles(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = getJsxFiles('./src');
console.log(`Analyzing ${allFiles.length} source files in ./src`);

function stripCommentsAndStrings(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/`[\s\S]*?`/g, '""')
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

let passed = 0;
let errors = [];

for (const file of allFiles) {
  try {
    const code = fs.readFileSync(file, 'utf8');
    const stripped = stripCommentsAndStrings(code);

    const openBraces = (stripped.match(/\{/g) || []).length;
    const closeBraces = (stripped.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      throw new Error(`Mismatched braces in code: { (${openBraces}) vs } (${closeBraces})`);
    }

    const openParens = (stripped.match(/\(/g) || []).length;
    const closeParens = (stripped.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      throw new Error(`Mismatched parentheses in code: ( (${openParens}) vs ) (${closeParens})`);
    }

    passed++;
  } catch (err) {
    errors.push({ file, error: err.message });
  }
}

console.log(`✅ Passed: ${passed} / ${allFiles.length}`);
if (errors.length > 0) {
  console.log('Errors:', errors);
} else {
  console.log('🎉 100% of source files have perfect lexical and structural balance!');
}
