import fs from 'node:fs';

const html = fs.readFileSync('pages/trip.html', 'utf8');
const script = fs.readFileSync('scripts/trip.js', 'utf8');

const requiredHtml = [
  'id="trip-return-home"',
  'href="./home.html"',
  'id="trip-return-itinerary"',
  'href="./itinerary.html"'
];

const missingHtml = requiredHtml.filter((snippet) => !html.includes(snippet));
if (missingHtml.length > 0) {
  console.error(`trip page is missing clear return navigation: ${missingHtml.join(', ')}`);
  process.exit(1);
}

if (!script.includes("window.location.href = './home.html'")) {
  console.error('endTrip should return users to home.html after ending the trip');
  process.exit(1);
}

console.log('trip navigation ok: clear return links and end-trip redirect detected');
