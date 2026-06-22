import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('scripts/auth.js', 'utf8');

const context = {
  console,
  API_BASE_URL: 'http://127.0.0.1:3000/api',
  fetch: async () => ({ json: async () => ({ success: false }) }),
  localStorage: {
    getItem: () => null,
    removeItem: () => {}
  },
  document: {
    getElementById: () => null,
    addEventListener: () => {},
    querySelector: () => null
  },
  window: { location: { reload: () => {} } }
};

vm.createContext(context);
vm.runInContext(source, context);

await context.checkUserLogin();

console.log('auth guard ok: checkUserLogin tolerates missing #user-actions');
