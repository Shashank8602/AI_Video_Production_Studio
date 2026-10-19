// Capture one still per camera shot: node stills.mjs
import { createServer } from 'vite';
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const outDir = 'videos/_preview';
fs.mkdirSync(outDir, { recursive: true });

const server = await createServer({ server: { port: 5199 }, logLevel: 'error' });
await server.listen();

const browser = await puppeteer.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[error]', e.message));
await page.setViewport({ width: 1080, height: 1920 });
await page.goto('http://localhost:5199/?capture=1', { waitUntil: 'load' });
await page.waitForFunction('window.__scene');

const shots = await page.evaluate(() => window.__scene.shots);
for (const shot of shots) {
  await page.evaluate((s) => window.__scene.set({
    shot: s, t: 1.3, screen: 'WHY IS THE\nNIGHT SKY\nDARK?',
    zib: { talking: true, mouth: 0.8, emotion: 'excited' }, bolt: { talking: false, mouth: 0 },
  }), shot);
  const canvas = await page.$('#stage');
  await canvas.screenshot({ path: `${outDir}/${shot}.png` });
  console.log('saved', shot);
}

await browser.close();
await server.close();
