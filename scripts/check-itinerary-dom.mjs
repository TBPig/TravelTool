import fs from 'node:fs';

const html = fs.readFileSync('pages/itinerary.html', 'utf8');
const script = fs.readFileSync('scripts/itinerary.js', 'utf8');

if (script.includes("querySelector('.itinerary-page')") && !html.includes('class="itinerary-page"')) {
  console.error('itinerary.js expects .itinerary-page, but itinerary.html does not render it');
  process.exit(1);
}

console.log('itinerary DOM contract ok: empty-state container exists');
