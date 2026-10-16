// Re-checks the path's sources (src/cf/sources.js): opens each cited page in Chrome (or Edge) and
// confirms every quoted passage still appears in its visible text, so a citation can't quietly stop
// backing what it's cited for. Run: npm install, then npm run verify:sources
import { chromium } from 'playwright-core';
import { STAGE_SOURCES } from '../src/cf/sources.js';

// Typographic quotes and dashes made plain, spacing collapsed, case ignored.
const norm = (s) => s.normalize('NFKC')
  .replace(/[‘’‛′]/g, "'").replace(/[“”″]/g, '"')
  .replace(/[‐-―−]/g, '-').replace(/ /g, ' ')
  .replace(/\s+/g, ' ').trim().toLowerCase();

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch({ channel: 'msedge' }));
const page = await browser.newPage();
const texts = new Map();
async function textOf(url) {
  if (!texts.has(url)) {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    texts.set(url, res?.ok() ? norm(await page.evaluate(() => document.body.innerText)) : null);
  }
  return texts.get(url);
}

let failed = 0;
try {
  for (const [stage, sources] of Object.entries(STAGE_SOURCES)) {
    for (const source of sources) {
      const text = await textOf(source.url);
      const missing = text == null ? ['(page did not load)'] : source.quotes.filter((q) => !text.includes(norm(q)));
      if (missing.length) {
        failed++;
        console.log(`✗ ${stage}: ${source.title} (${source.url})`);
        for (const q of missing) console.log(`    not found: ${q}`);
      }
    }
  }
} finally {
  await browser.close();
}
const total = Object.values(STAGE_SOURCES).flat().length;
console.log(failed ? `${failed} of ${total} sources no longer show their quoted passages.` : `All ${total} sources still contain their quoted passages.`);
process.exitCode = failed ? 1 : 0;
