import fs from 'node:fs';

const script = fs.readFileSync('scripts/trip.js', 'utf8');

const requiredSnippets = [
  'map-landmark',
  'map-tile-layer',
  'attraction-card-image',
  'OpenStreetMap',
  'answerTripQuestion',
  'routeKnowledge',
  '故宫几点',
  '门票',
  '厕所',
  '拍照',
  '预算'
];

const missing = requiredSnippets.filter((snippet) => !script.includes(snippet));
const forbidden = ['投资人演示', '后续接高德', 'POI', '商业转化', 'demo 知识库', 'demo 行程'];

if (missing.length > 0) {
  console.error(`trip demo is missing richer map/assistant content: ${missing.join(', ')}`);
  process.exit(1);
}

const foundForbidden = forbidden.filter((snippet) => script.includes(snippet));
if (foundForbidden.length > 0) {
  console.error(`trip demo contains user-facing placeholder wording: ${foundForbidden.join(', ')}`);
  process.exit(1);
}

console.log('trip demo richness ok: map tiles, attraction images, and assistant knowledge detected');
