import fs from 'fs';
import path from 'path';

// Path to the output file
const outputFile = path.resolve('src/lib/breakpoints.js');

// Check if the file already exists
if (fs.existsSync(outputFile)) {
  console.log('ℹ️  src/lib/breakpoints.js already exists, skipping generation');
  process.exit(0);
}

// Breakpoints defined here (matching Tailwind @theme in main.scss)
const breakpoints = {
  sm: 600,
  md: 1008,
  lg: 1280,
};

// Write JS file
const fileContent = `// Auto-generated file by scripts/setup-breakpoints.js
export const breakpoints = ${JSON.stringify(breakpoints, null, 2).replace(/"([^"]+)":/g, '$1:')};
`;

fs.writeFileSync(outputFile, fileContent, 'utf8');
console.log('✅ Breakpoints generated in src/lib/breakpoints.js');
