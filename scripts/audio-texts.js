// Lists every paragraph the site reads aloud, exactly as its Listen buttons would speak it, into
// audio/texts.json for scripts/build_audio.py to record. It drives the real pages in Chrome (or Edge),
// so the text always matches what the browser computes.
// Run: npm install, then npm run audio:texts
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { STAGES } from '../src/cf/curriculum.js';
import { SKILLS } from '../src/math/skills.js';
import { clipKey } from '../src/audio-key.js';
import { RECORDED_VOICE } from '../src/tts.js';

const PORT = 5199;
const BASE = `http://localhost:${PORT}/`;
const server = spawn(process.execPath, ['scripts/serve.js'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch({ channel: 'msedge' }));

try {
  const page = await browser.newPage();
  await page.addInitScript(() => localStorage.setItem('autoprep:storage-consent', 'granted'));
  for (let i = 0; ; i++) {
    try {
      await page.goto(BASE);
      break;
    } catch (e) {
      if (i > 20) throw e;
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  // Each paragraph as { text, script }: the words the site reads, and what the recording is made from.
  const read = (group) => page.evaluate(async (group) => {
    const { readingParts } = await import('/src/tts.js');
    const elements = [...document.querySelectorAll('[data-read]')].filter((el) => el.dataset.read.split(' ').includes(group));
    return readingParts(elements).map(({ text, script }) => ({ text, script }));
  }, group);

  const clips = new Map();
  const add = (parts, where) => {
    for (const { text, script = text } of parts) {
      const key = clipKey(RECORDED_VOICE, script);
      if (!clips.has(key)) clips.set(key, script === text ? { key, where, text } : { key, where, text, script });
    }
  };
  // The sample played when you choose the voice comes first, so it's recorded first.
  add([{ text: (await import('../src/tts.js')).SAMPLE }], 'voice sample');

  // Every step of every diagram, as its caption is shown and narrated.
  const captions = await page.evaluate(async () => {
    const [{ STAGE_VISUALS }, { richHtml }, { readingParts }] = await Promise.all(
      ['/src/viz/stages.js', '/src/format.js', '/src/tts.js'].map((m) => import(m)));
    const caption = document.createElement('p');
    const out = {};
    for (const [id, make] of Object.entries(STAGE_VISUALS)) {
      out[id] = make().filter((viz) => viz.frames.length > 1).flatMap((viz) => viz.frames.flatMap((f) => {
        caption.innerHTML = richHtml(f.caption);
        return readingParts([caption]).map(({ text, script }) => ({ text, script }));
      }));
    }
    return out;
  });

  // Each stage's primer and then its diagrams, in path order.
  for (const stage of STAGES) {
    await page.goto(`${BASE}#/path/${stage.id}`);
    await page.waitForFunction((title) => document.querySelector('h2[data-read="primer"]')?.textContent === title, stage.title);
    add(await read('primer'), `path/${stage.id}`);
    add(captions[stage.id] || [], `diagram/${stage.id}`);
  }

  // Every hint and solution sketch, path problems first, then UKIEPC. Rendered with all of them revealed.
  const hints = await page.evaluate(async () => {
    const [{ STAGES: stages }, { UKIEPC }, { hintPanel }, { state }, { mount }, { readingParts }] = await Promise.all(
      ['/src/cf/curriculum.js', '/src/cf/ukiepc.js', '/src/cf/hints.js', '/src/store.js', '/src/dom.js', '/src/tts.js'].map((m) => import(m)));
    const holder = document.createElement('div');
    const texts = (problem) => {
      state.cf.hints.__audio = problem.hints.length + 1;
      mount(holder, hintPanel('__audio', problem, true));
      return readingParts([...holder.querySelectorAll('[data-read]')]).map(({ text, script }) => ({ text, script }));
    };
    return [
      ...stages.flatMap((s) => s.problems.map((p) => ({ where: `path/${s.id}/${p.id}`, texts: texts(p) }))),
      ...UKIEPC.flatMap((c) => c.problems.map((p) => ({ where: `ukiepc/${c.year}/${p.letter}`, texts: texts(p) }))),
    ];
  });
  const [pathHints, ukiepcHints] = [hints.filter((h) => h.where.startsWith('path/')), hints.filter((h) => h.where.startsWith('ukiepc/'))];
  for (const h of pathHints) add(h.texts, h.where);

  // Each lesson with its first worked example stepped through to the end.
  for (const [id, skill] of Object.entries(SKILLS)) {
    await page.goto(`${BASE}#/math/learn/${id}`);
    await page.waitForFunction((title) => document.querySelector('h1[data-read="lesson"]')?.textContent === title, skill.lesson.title);
    if (await page.locator('#all').count()) await page.click('#all');
    add(await read('lesson'), `math/${id}`);
  }

  for (const h of ukiepcHints) add(h.texts, h.where);

  await mkdir('audio', { recursive: true });
  const list = [...clips.values()];
  await writeFile('audio/texts.json', `${JSON.stringify({ voice: RECORDED_VOICE, clips: list }, null, 1)}\n`);
  const chars = list.reduce((n, c) => n + c.text.length, 0);
  console.log(`${list.length} paragraphs, ${chars} characters (about ${(chars / 15 / 3600).toFixed(1)} hours of speech) → audio/texts.json`);
} finally {
  await browser.close();
  server.kill();
}
