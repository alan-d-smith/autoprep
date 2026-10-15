// UKIEPC 2023–2025: every problem, what it needs from the path, and hints from the jury's solutions.
// Difficulty and topics are spoilers, so they're hidden until you switch them on, and each year is
// collapsed until you open it. All of that is remembered.

import { html, mount } from '../dom.js';
import { state, save, isSolved } from '../store.js';
import { stageById } from './curriculum.js';
import { UKIEPC } from './ukiepc.js';
import { covered, problemUrl } from './roadmap.js';
import { bindHints } from './hints.js';
import { bindListen } from '../tts.js';
import { syncControls, problemRow, bindSolveBoxes } from './view.js';

const DIFFICULTY = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export function renderUkiepc(app) {
  const open = new Set();
  const listeners = new AbortController();
  const sync = syncControls(app, draw);
  const ui = state.ui;

  function metaTpl(p, key) {
    if (!ui.ukiepcDifficulty && !ui.ukiepcTopics) return '';
    const ready = ui.ukiepcTopics && covered(p.stages, isSolved) && !isSolved(key);
    return html`
      <div class="uk-meta">
        ${ui.ukiepcDifficulty ? html`<span class="chip ${p.difficulty}">${DIFFICULTY[p.difficulty]}</span>` : ''}
        ${ui.ukiepcTopics ? html`
          ${p.stages.map((id) => stageById[id] && html`<a class="chip path-stage" href="#/path/${id}" title="Path stage">${stageById[id].title}</a>`)}
          ${p.techniques.filter((t) => !p.stages.some((id) => stageById[id]?.title === t)).map((t) => html`<span class="chip">${t}</span>`)}` : ''}
      </div>
      ${ready ? html`<span class="uk-ready">You've completed every stage this needs.</span>` : ''}`;
  }

  function contestTpl(contest) {
    const solved = contest.problems.filter((p) => isSolved(`${contest.gym}${p.letter}`)).length;
    const isOpen = ui.ukiepcOpen.includes(contest.year);
    return html`
      <details class="contest" data-year="${contest.year}" ${isOpen ? 'open' : ''}>
        <summary>
          <h2>UKIEPC ${contest.year}</h2>
          <span class="contest-count">${solved} of ${contest.problems.length} solved</span>
        </summary>
        <p class="contest-link small"><a href="https://codeforces.com/gym/${contest.gym}" target="_blank" rel="noopener">Open the ${contest.year} gym on Codeforces</a></p>
        <ul class="problem-list">
          ${contest.problems.map((p) => {
            const key = `${contest.gym}${p.letter}`;
            return problemRow({
              key,
              name: p.name,
              url: problemUrl(key),
              label: html`<span class="letter">${p.letter}</span>`,
              extra: metaTpl(p, key),
              hints: p,
              open,
              rowClass: 'uk-problem',
            });
          })}
        </ul>
      </details>`;
  }

  function draw() {
    const all = UKIEPC.flatMap((c) => c.problems.map((p) => ({ ...p, key: `${c.gym}${p.letter}` })));
    const solved = all.filter((p) => isSolved(p.key)).length;
    const ready = all.filter((p) => !isSolved(p.key) && covered(p.stages, isSolved)).length;
    mount(app, html`
      <div class="page-head">
        <h1>UKIEPC practice</h1>
        <p>Every problem from the 2023, 2024 and 2025 UK and Ireland Programming Contests, with the path stages each one relies on and hints that follow the jury's solutions. Use them as the final exam for the path: once you've completed a problem's stages, try it under contest conditions.</p>
      </div>
      ${sync.tpl()}
      <div class="spoilers" role="group" aria-label="Spoilers">
        <label class="switch"><input type="checkbox" role="switch" data-ui="ukiepcDifficulty" ${ui.ukiepcDifficulty ? 'checked' : ''} /> Show difficulty</label>
        <label class="switch"><input type="checkbox" role="switch" data-ui="ukiepcTopics" ${ui.ukiepcTopics ? 'checked' : ''} /> Show topics</label>
        <span class="small faint">Off by default, so the list doesn't tell you what each problem needs.</span>
      </div>
      <p class="muted uk-summary">${solved} of ${all.length} solved.${ready ? ` ${ready} more ${ready === 1 ? 'is' : 'are'} covered by stages you've completed.` : ''}</p>
      ${UKIEPC.map(contestTpl)}`);
    sync.bind();
  }

  app.addEventListener('change', (e) => {
    const toggle = e.target.closest('[data-ui]');
    if (!toggle) return;
    ui[toggle.dataset.ui] = toggle.checked;
    save();
    draw();
    app.querySelector(`[data-ui="${toggle.dataset.ui}"]`)?.focus();
  }, { signal: listeners.signal });

  // <details> toggle events don't bubble, so listen in the capture phase.
  app.addEventListener('toggle', (e) => {
    const year = Number(e.target.dataset?.year);
    if (!year) return;
    ui.ukiepcOpen = e.target.open ? [...new Set([...ui.ukiepcOpen, year])] : ui.ukiepcOpen.filter((y) => y !== year);
    save();
  }, { capture: true, signal: listeners.signal });

  bindHints(app, open, draw, listeners.signal);
  bindSolveBoxes(app, draw, listeners.signal);
  bindListen(app, listeners.signal);
  draw();
  return () => {
    listeners.abort();
    sync.stop();
  };
}
