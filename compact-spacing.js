const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { from: /py-16 md:py-28/g, to: 'py-10 md:py-16' },
  { from: /py-16 md:py-24/g, to: 'py-10 md:py-16' },
  { from: /mb-12 md:mb-20/g, to: 'mb-8 md:mb-12' },
  { from: /mb-12 md:mb-16/g, to: 'mb-8 md:mb-12' },
  { from: /mb-10 md:mb-16/g, to: 'mb-8 md:mb-12' }
];

let updatedFilesCount = 0;

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
    updatedFilesCount++;
  }
}

console.log(`Total files updated: ${updatedFilesCount}`);
