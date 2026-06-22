import fs from 'node:fs';

const routeMap = fs.readFileSync('pages/route-map.html', 'utf8');
const trip = fs.readFileSync('scripts/trip.js', 'utf8');

const routeMapForbidden = [
  'Investor Demo',
  '路线地图 Demo',
  '静态演示版',
  '生成北京路线Demo',
  '后续可',
  '后续正式版本'
];

const tripForbidden = [
  '投资人演示',
  '后续接高德',
  '商业转化',
  'demo 知识库',
  'demo 行程'
];

const routeMapHits = routeMapForbidden.filter((text) => routeMap.includes(text));
const tripHits = tripForbidden.filter((text) => trip.includes(text));

if (routeMapHits.length > 0 || tripHits.length > 0) {
  console.error(`product copy contains placeholder wording: ${[...routeMapHits, ...tripHits].join(', ')}`);
  process.exit(1);
}

console.log('product copy ok: no visible demo/future placeholder wording detected');
