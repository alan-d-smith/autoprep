// "Not sure where to start?" One technique per stage, shown one at a time, sorted into never heard of,
// heard of but not confident, and confident. Stages you're confident in are then passed over when the
// path works out where you are on each track.

import { html, mount } from '../dom.js';
import { rich } from '../format.js';
import { state, save, isSolved } from '../store.js';
import { TRACKS } from './curriculum.js';
import { currentStage, trackStages } from './roadmap.js';

// In path order: dynamic programming, graphs, then geometry and searching the answer.
export const QUIZ_ITEMS = [
  { stage: 'prefix-sums', name: 'Prefix sums', hint: 'Any range sum in O(1) after one pass' },
  { stage: 'difference-arrays', name: 'Difference arrays', hint: 'Add a value to a whole range in O(1)' },
  { stage: 'dp-basics', name: 'Dynamic programming', hint: 'Build each answer from answers to smaller cases' },
  { stage: 'lis', name: 'Longest increasing subsequence', hint: 'The longest rising chain, in O(n log n)' },
  { stage: 'lcs', name: 'Longest common subsequence and edit distance', hint: 'dp[i][j] over prefixes of two strings' },
  { stage: 'knapsack', name: 'Knapsack', hint: 'Choose items to fit a capacity' },
  { stage: 'interval-dp', name: 'Interval DP', hint: 'dp[l][r] over segments, filled by length' },
  { stage: 'bitmask-dp', name: 'Bitmask DP', hint: 'DP over subsets when n ≤ 20' },
  { stage: 'dp-structures', name: 'Fenwick and segment trees', hint: 'Range queries with updates in O(log n)' },
  { stage: 'dfs', name: 'Depth-first search', hint: 'Connected components and cycles' },
  { stage: 'bfs', name: 'Breadth-first search', hint: 'Fewest moves in an unweighted graph' },
  { stage: 'trees', name: 'Tree DP and rerooting', hint: 'Subtree answers, then the answer for every root' },
  { stage: 'dsu-mst', name: 'Union-find and minimum spanning trees', hint: 'Merge components; Kruskal\'s algorithm' },
  { stage: 'topo', name: 'Topological sort', hint: 'Order tasks that depend on each other' },
  { stage: 'shortest-paths', name: 'Dijkstra\'s algorithm', hint: 'Shortest paths with non-negative weights' },
  { stage: 'binary-lifting', name: 'Binary lifting and LCA', hint: 'Jump up a tree 2^k steps at a time' },
  { stage: 'answer-search', name: 'Binary search on the answer', hint: 'Find the smallest value that works' },
  { stage: 'geometry', name: 'Cross products', hint: 'Which way three points turn' },
  { stage: 'convex-hull', name: 'Convex hull', hint: 'The tightest fence around a set of points' },
];

const BINS = [
  { level: 0, label: 'Never heard of', key: '1' },
  { level: 1, label: 'Heard of, not confident', key: '2' },
  { level: 2, label: 'Confident', key: '3' },
];

const itemFor = Object.fromEntries(QUIZ_ITEMS.map((item) => [item.stage, item]));
const rating = () => state.cf.maxRating ?? state.cf.rating;

// The quiz's verdict on a stage, for currentStage(): skip the ones you're confident in.
export const quizConfident = (stage) => state.cf.quiz?.ratings?.[stage.id] === 2;

// Where each track starts, given the quiz and what's solved.
export const quizStart = (track) => currentStage(track, isSolved, rating(), quizConfident);

// Answers so far, kept while you're on the site, so closing the quiz part-way loses nothing.
let placed = new Map(); // stage id → level

export function openQuiz({ fresh = false, onSubmit = () => {} } = {}) {
  if (fresh) placed = new Map();
  const dialog = document.createElement('dialog');
  dialog.className = 'quiz';
  dialog.setAttribute('aria-labelledby', 'quiz-title');
  mount(dialog, html`
    <div class="quiz-body">
      <header class="quiz-head">
        <h2 id="quiz-title">Which of these have you heard of?</h2>
        <button class="quiz-close" type="button" data-quiz-close aria-label="Close the quiz">×</button>
        <p>Drag each technique into the box that fits, or pick the box. <span class="quiz-count"></span></p>
      </header>
      <div class="quiz-deck"></div>
      <div class="quiz-bins">
        ${BINS.map((bin) => html`
          <section class="quiz-bin" data-bin="${bin.level}" aria-label="${bin.label}">
            <button class="quiz-bin-head" type="button" data-place="${bin.level}"><kbd>${bin.key}</kbd><span>${bin.label}</span></button>
            <ul class="quiz-chips"></ul>
          </section>`)}
      </div>
      <div class="quiz-foot" inert>
        <div class="quiz-foot-inner">
          <p>All sorted. Drag any you'd like to change, then submit.</p>
          <button class="btn btn-primary quiz-submit" type="button" data-quiz-submit>Submit<span class="arrow" aria-hidden="true">→</span></button>
        </div>
      </div>
      <p class="visually-hidden" aria-live="polite" data-quiz-say></p>
    </div>`);
  document.body.append(dialog);

  const $ = (sel) => dialog.querySelector(sel);
  const next = () => QUIZ_ITEMS.find((item) => !placed.has(item.stage));
  const say = (text) => { $('[data-quiz-say]').textContent = text; };

  function draw() {
    const item = next();
    $('.quiz-count').textContent = `${placed.size} of ${QUIZ_ITEMS.length} sorted.`;
    mount($('.quiz-deck'), item
      ? html`<div class="quiz-card" tabindex="0" data-item="${item.stage}" aria-describedby="quiz-title"><strong>${item.name}</strong><span>${rich(item.hint)}</span></div>`
      : '');
    for (const bin of BINS) {
      const items = QUIZ_ITEMS.filter((it) => placed.get(it.stage) === bin.level);
      mount($(`[data-bin="${bin.level}"] .quiz-chips`), items.map((it) => html`<li><button class="quiz-chip" type="button" data-item="${it.stage}">${it.name}</button></li>`));
    }
    // Once everything's sorted, the bottom of the quiz opens to show Submit.
    const done = !item;
    dialog.classList.toggle('done', done);
    $('.quiz-foot').inert = !done;
  }

  function place(stage, level, { focus = 'card' } = {}) {
    const first = !placed.has(stage);
    placed.set(stage, level);
    draw();
    const upNext = next();
    say(`${itemFor[stage].name}: ${BINS[level].label.toLowerCase()}.${upNext ? ` Next: ${upNext.name}.` : ' All sorted: submit when ready.'}`);
    if (focus === 'card' && first) (upNext ? $('.quiz-card') : $('[data-quiz-submit]'))?.focus();
    if (focus === 'chip') $(`.quiz-chip[data-item="${stage}"]`)?.focus();
  }

  // Dragging works the same with a mouse, a finger or a pen.
  dialog.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.quiz-card, .quiz-chip');
    if (!el || e.button !== 0) return;
    const stage = el.dataset.item;
    const start = { x: e.clientX, y: e.clientY };
    let dragging = false;
    let over = null;
    el.setPointerCapture(e.pointerId);
    // The box under the pointer, looking past the technique being dragged.
    const binAt = (x, y) => document.elementsFromPoint(x, y).filter((n) => !el.contains(n)).map((n) => n.closest('[data-bin]')).find(Boolean) || null;
    const move = (ev) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!dragging && Math.hypot(dx, dy) < 5) return;
      dragging = true;
      el.classList.add('dragging');
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      const bin = binAt(ev.clientX, ev.clientY);
      if (bin !== over) {
        over?.classList.remove('over');
        bin?.classList.add('over');
        over = bin;
      }
    };
    const end = (cancelled) => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
      over?.classList.remove('over');
      if (!dragging) return;
      if (!cancelled && over) return place(stage, Number(over.dataset.bin), { focus: 'none' });
      // Dropped outside a box: slide back.
      el.classList.remove('dragging');
      el.classList.add('returning');
      el.style.transform = '';
      el.addEventListener('transitionend', () => el.classList.remove('returning'), { once: true });
    };
    const up = () => end(false);
    const cancel = () => end(true);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancel);
  });

  dialog.addEventListener('click', (e) => {
    if (e.target.closest('[data-quiz-close]')) return dialog.close();
    if (e.target.closest('[data-quiz-submit]')) return submit();
    if (e.target.closest('a[href^="#/"]')) return dialog.close();
    // A click on a box (but not on a technique already in it) puts the current one there.
    const bin = !e.target.closest('.quiz-chip') && e.target.closest('[data-bin]');
    const item = next();
    if (bin && item) place(item.stage, Number(bin.dataset.bin));
  });

  // 1, 2 and 3 sort the technique in focus (a sorted one, to move it) or else the current one.
  dialog.addEventListener('keydown', (e) => {
    const bin = BINS.find((b) => b.key === e.key);
    if (!bin || e.target.matches('input, textarea') || e.ctrlKey || e.metaKey || e.altKey) return;
    const chip = e.target.closest('.quiz-chip');
    const stage = chip?.dataset.item || next()?.stage;
    if (!stage) return;
    e.preventDefault();
    place(stage, bin.level, { focus: chip ? 'chip' : 'card' });
  });

  function submit() {
    const ratings = Object.fromEntries(placed);
    state.cf.quiz = { at: new Date().toISOString(), ratings };
    save();
    placed = new Map();
    dialog.classList.remove('done');
    mount($('.quiz-body'), resultsTpl(ratings));
    $('.quiz-head h2').focus();
    onSubmit();
  }

  // Leaving the page (Back, or a link) closes it too.
  const leave = new AbortController();
  window.addEventListener('hashchange', () => dialog.close(), { signal: leave.signal });
  dialog.addEventListener('close', () => {
    leave.abort();
    dialog.remove();
  });
  draw();
  dialog.showModal();
  $('.quiz-card')?.focus();
}

function resultsTpl(ratings) {
  const names = (stages) => stages.map((s) => itemFor[s.id].name).join(', ');
  return html`
    <header class="quiz-head">
      <h2 id="quiz-title" tabindex="-1">Where to start</h2>
      <button class="quiz-close" type="button" data-quiz-close aria-label="Close">×</button>
      <p>Each track now starts at the first stage you're not confident in. Stages you know are still there to review.</p>
    </header>
    <div class="quiz-results">
      ${TRACKS.map((track) => {
        const start = quizStart(track);
        const stages = trackStages(track);
        const never = stages.filter((s) => ratings[s.id] === 0);
        const shaky = stages.filter((s) => ratings[s.id] === 1);
        return html`
          <section class="quiz-track">
            <h3>${track.title}</h3>
            ${start
              ? html`<p>Start at <a href="#/path/${start.id}">${start.title}</a></p>`
              : html`<p>You're confident across this track. Its challenge problems are a good test of that.</p>`}
            ${never.length ? html`<p class="small"><span class="faint">New to you:</span> ${names(never)}</p>` : ''}
            ${shaky.length ? html`<p class="small"><span class="faint">Worth brushing up:</span> ${names(shaky)}</p>` : ''}
          </section>`;
      })}
    </div>
    <div class="quiz-actions"><button class="btn" type="button" data-quiz-close>Done</button></div>`;
}
