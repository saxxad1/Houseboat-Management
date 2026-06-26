const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const outputFile = path.join(__dirname, 'combined_schema.sql');

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

// Ensure initial_schema is first, then the rest sorted alphabetically (by date)
const initial = files.find(f => f === 'initial_schema.sql');
const rest = files.filter(f => f !== 'initial_schema.sql').sort();
const sortedFiles = [initial, ...rest].filter(Boolean);

let combinedSql = '';
for (const file of sortedFiles) {
    combinedSql += `-- File: ${file}\n`;
    combinedSql += fs.readFileSync(path.join(migrationsDir, file), 'utf8') + '\n\n';
}

fs.writeFileSync(outputFile, combinedSql);
console.log('Successfully created combined_schema.sql');
