import fs from 'fs';
import path from 'path';

// Path to the output file
const outputFile = path.resolve('src/lib/breakpoints.js');

// Check if the file already exists
if (fs.existsSync(outputFile)) {
  console.log('ℹ️  src/lib/breakpoints.js already exists, skipping generation');
  process.exit(0);
}

// Path to the Sass breakpoints file
const scssFile = path.resolve('node_modules/@enodo/foundation-css/src/variables/_breakpoints.scss');

// Read file content
const content = fs.readFileSync(scssFile, 'utf8');

// Match the $breakpoints map
const match = content.match(/\$breakpoints\s*:\s*\(([\s\S]*?)\)\s*!?default/);
if (!match) {
  console.error('❌ $breakpoints variable not found in _breakpoints.scss');
  process.exit(1);
}

const breakpoints = {};

// Split entries safely
const entries = match[1]
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean); // remove empty entries (like trailing comma)

entries.forEach((entry, index) => {
  // Split only on first colon
  const colonIndex = entry.indexOf(':');
  if (colonIndex === -1) {
    console.warn(`Skipping invalid entry #${index}: "${entry}"`);
    return;
  }

  const keyRaw = entry.slice(0, colonIndex).trim();
  const valueRaw = entry.slice(colonIndex + 1).trim();

  if (!keyRaw || !valueRaw) {
    console.warn(`Skipping invalid entry #${index}: "${entry}"`);
    return;
  }

  // Clean value safely
  const valueClean = valueRaw
    .replace(/px|rem|em|!default/g, '')
    .replace(/\/\*.*\*\//, '')
    .trim();

  if (!valueClean) return;

  // Parse as integer
  breakpoints[keyRaw] = parseInt(valueClean, 10);
});

// Write JS file
const fileContent = `// Auto-generated file by scripts/setup-breakpoints.js
export const breakpoints = ${JSON.stringify(breakpoints, null, 2).replace(/"([^"]+)":/g, '$1:')};
`;

fs.writeFileSync(outputFile, fileContent, 'utf8');
console.log('✅ Breakpoints generated in src/lib/breakpoints.js');
