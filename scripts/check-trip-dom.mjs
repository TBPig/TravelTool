import fs from 'node:fs';

const html = fs.readFileSync('pages/trip.html', 'utf8');
const script = fs.readFileSync('scripts/trip.js', 'utf8');

const htmlIds = new Set(
  [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
);

const scriptIds = new Set(
  [...script.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map((match) => match[1])
);

const missing = [...scriptIds].filter((id) => !htmlIds.has(id));

if (missing.length > 0) {
  console.error(`trip.js references ids that trip.html does not render: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`trip DOM contract ok: ${scriptIds.size} ids checked`);
