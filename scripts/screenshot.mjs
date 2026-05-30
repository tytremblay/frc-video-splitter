import { _electron as electron } from 'playwright-core';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, '..');
const SHOT_DIR = '/tmp/shots';
mkdirSync(SHOT_DIR, { recursive: true });

const electronBin = resolve(APP_DIR, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron');

console.log('launching…');
const app = await electron.launch({
  executablePath: electronBin,
  args: [APP_DIR],
  env: { ...process.env },
  timeout: 30_000,
});

await new Promise(r => setTimeout(r, 6_000));

const page = app.windows().find(w => !w.url().startsWith('devtools://')) ?? await app.firstWindow();
console.log('windows:', app.windows().map(w => w.url()));

await page.screenshot({ path: `${SHOT_DIR}/01-initial.png` });
console.log('screenshot: /tmp/shots/01-initial.png');

// Click the Timeline tab
const clicked = await page.evaluate(() => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const tab = tabs.find(t => t.textContent?.includes('Timeline'));
  if (!tab) return 'NOT_FOUND';
  tab.click();
  return 'OK';
});
console.log('click Timeline tab:', clicked);

await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${SHOT_DIR}/02-timeline.png` });
console.log('screenshot: /tmp/shots/02-timeline.png');

await app.close();
