// Capture the named showcase states using a short-lived local server.
import { createReadStream, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = resolve(process.argv[2] || '.');
const game = join(repo, 'game');
const shots = JSON.parse(readFileSync(join(repo, 'shots.json'), 'utf8'));
const playwrightPath = process.env.PLAYWRIGHT_CORE || '/home/firdho/.local/node_modules/playwright-core/index.mjs';
const { chromium } = await import(pathToFileURL(playwrightPath));
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8' };
const server = createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  const file = resolve(game, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (file !== game && !file.startsWith(game + sep)) { res.writeHead(403).end(); return; }
  try { if (!statSync(file).isFile()) throw new Error(); } catch { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type':mime[extname(file)] || 'application/octet-stream' }); createReadStream(file).pipe(res);
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const browser = await chromium.launch({ headless:true, executablePath:process.env.CHROME_BIN || '/home/firdho/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome' });
try {
  const out = join(repo, 'screenshots'); mkdirSync(out, { recursive:true });
  for (const shot of shots) {
    const page = await browser.newPage({ viewport:{ width:1280, height:720 }, deviceScaleFactor:1 });
    await page.goto('http://127.0.0.1:' + server.address().port + '/index.html' + shot.query);
    await page.waitForFunction(() => window.__shotReady === true, null, { timeout:15000 });
    const target = join(out, shot.name); await page.screenshot({ path:target, type:'jpeg', quality:88 });
    console.log(shot.name + ': ' + statSync(target).size + ' bytes'); await page.close();
  }
} finally { await browser.close(); server.close(); }
