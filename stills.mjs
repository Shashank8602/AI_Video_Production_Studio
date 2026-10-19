// Capture preview stills: node stills.mjs [name ...]   (no names = all scenarios)
import { createServer } from 'vite';
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const outDir = 'videos/_preview';
fs.mkdirSync(outDir, { recursive: true });

const excited = { talking: true, mouth: 0.8, emotion: 'excited' };
const calm = { talking: true, mouth: 0.5, emotion: 'neutral' };
const idle = { talking: false, mouth: 0, emotion: 'neutral' };
const mood = (emotion, mouth = 0.4) => ({ talking: true, mouth, emotion });

// Each scenario: a camera shot plus who is doing what
const SCENARIOS = {
  wide: { shot: 'wide', poses: { zib: 'sit', bolt: 'stand' }, zib: excited, bolt: idle },
  wideStand: { shot: 'wide', poses: { zib: 'stand', bolt: 'stand' }, zib: excited, bolt: idle },
  wideLie: { shot: 'wide', poses: { zib: 'lie', bolt: 'sit' }, zib: idle, bolt: calm },
  zibClose: { shot: 'zibClose', poses: { zib: 'sit', bolt: 'stand' }, zib: excited, bolt: idle },
  boltClose: { shot: 'boltClose', poses: { zib: 'sit', bolt: 'stand' }, zib: idle, bolt: calm },
  zibOts: { shot: 'zibOts', poses: { zib: 'sit', bolt: 'stand' }, zib: excited, bolt: idle },
  boltOts: { shot: 'boltOts', poses: { zib: 'sit', bolt: 'stand' }, zib: idle, bolt: calm },
  zibWowed: { shot: 'zibClose', poses: { zib: 'stand', bolt: 'stand' }, zib: mood('wowed', 0.9), bolt: idle },
  zibDoubtful: { shot: 'zibClose', poses: { zib: 'sit', bolt: 'stand' }, zib: mood('doubtful', 0.3), bolt: idle },
  boltSincere: { shot: 'boltClose', poses: { zib: 'sit', bolt: 'stand' }, zib: idle, bolt: mood('sincere', 0.3) },
  boltDoubtful: { shot: 'boltClose', poses: { zib: 'sit', bolt: 'stand' }, zib: idle, bolt: mood('doubtful', 0.3) },
  boltWowed: { shot: 'boltClose', poses: { zib: 'sit', bolt: 'stand' }, zib: idle, bolt: mood('wowed', 0.7) },
  boltThinking: { shot: 'boltClose', poses: { zib: 'sit', bolt: 'stand' }, zib: idle, bolt: mood('thinking', 0.2) },
  boltDeadpan: { shot: 'boltClose', poses: { zib: 'sit', bolt: 'stand' }, zib: idle, bolt: mood('deadpan', 0.3) },
  boltSit: { shot: 'boltClose', poses: { zib: 'lie', bolt: 'sit' }, zib: idle, bolt: calm },
};

const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(SCENARIOS);

const server = await createServer({ server: { port: 5199 }, logLevel: 'error' });
await server.listen();

const browser = await puppeteer.launch({ headless: true, args: process.env.CPU_GL ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--use-gl=angle', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[error]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console error]', m.text()); });
await page.setViewport({ width: 1080, height: 1920 });
await page.goto('http://localhost:5199/?capture=1', { waitUntil: 'load' });
await page.waitForFunction('window.__scene');

for (const name of names) {
  const sc = SCENARIOS[name];
  if (!sc) { console.log('unknown scenario', name); continue; }
  const t0 = Date.now();
  await page.evaluate((s) => window.__scene.set({ ...s, t: 1.3, push: 0.3, screen: 'WHY IS THE\nNIGHT SKY\nDARK?' }), sc);
  await (await page.$('#stage')).screenshot({ path: `${outDir}/${name}.png` });
  console.log('saved', name, `${Date.now() - t0}ms`);
}

await browser.close();
await server.close();
