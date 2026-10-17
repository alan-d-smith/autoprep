// Benchmark page: Zetamac-style settings, the timed round, and the diagnosis that follows.

import { html, mount, $, toast, seconds, ago, plural } from '../dom.js';
import { state, save, addRound, benchmarkRounds, defaultSettings } from '../store.js';
import { OPS, SYMBOL, DURATIONS, DEFAULT_RANGES, NO_DECIMALS, nextQuestion, question, normaliseRanges, sameRanges, canonical } from './zetamac.js';
import { SKILLS, SKILL_ORDER } from './skills.js';
import { diagnose, autoGoal } from './diagnose.js';

const OP_NAMES = { add: 'Addition', sub: 'Subtraction', mul: 'Multiplication', div: 'Division' };

const answersPhrase = (points) => (points < 1.5 ? 'about one more correct answer' : `about ${Math.round(points)} more correct answers`);

export function focusReason(focus) {
  if (focus.reason === 'gap') {
    return `You take ${focus.ratio.toFixed(1)}× as long on these as your pace elsewhere predicts. Closing that gap is worth ${answersPhrase(focus.gapPoints)} a round.`;
  }
  return `Getting these to goal pace gains more than any other kind of question: ${answersPhrase(focus.points)} a round.`;
}

const clock = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const sameDecimals = (a = NO_DECIMALS, b = NO_DECIMALS) => a.mode === b.mode && (a.mode === 'off' || a.places === b.places);

const sameConfig = (round, settings) =>
  round.duration === settings.duration &&
  [...round.ops].sort().join() === [...settings.ops].sort().join() &&
  sameRanges(round.ranges || DEFAULT_RANGES, settings.ranges) &&
  sameDecimals(round.decimals, settings.decimals);

const DECIMAL_LABELS = { off: 'Off', mixed: 'Mixed', only: 'Only' };

export function renderMath(app) {
  let run = null;
  let freshReport = false;

  function rangeInputs(key, symbol) {
    const [[aLo, aHi], [bLo, bHi]] = state.math.settings.ranges[key];
    const field = (i, j, value, label) => html`<input type="number" inputmode="numeric" min="1" max="9999" data-range="${key}.${i}.${j}" value="${value}" aria-label="${label}" />`;
    return html`
      <div class="zm-range">
        <span class="pair">(${field(0, 0, aLo, `${OP_NAMES[key]}: first number, from`)} to ${field(0, 1, aHi, `${OP_NAMES[key]}: first number, to`)})</span>
        <span class="op">${symbol}</span>
        <span class="pair">(${field(1, 0, bLo, `${OP_NAMES[key]}: second number, from`)} to ${field(1, 1, bHi, `${OP_NAMES[key]}: second number, to`)})</span>
      </div>`;
  }

  function settingsTpl() {
    const settings = state.math.settings;
    const last = state.math.rounds[0];
    const best = state.math.rounds.filter((r) => sameConfig(r, settings)).reduce((m, r) => Math.max(m, r.score), -1);
    const isDefault = sameRanges(settings.ranges, DEFAULT_RANGES) && settings.ops.length === 4 && settings.duration === 120 && settings.decimals.mode === 'off';
    const opBox = (op) => html`<label class="zm-label"><input type="checkbox" data-op="${op}" ${settings.ops.includes(op) ? 'checked' : ''} /> ${OP_NAMES[op]}</label>`;
    return html`
      <div class="card">
        <div class="zm-settings">
          <div class="zm-row">${opBox('add')}${rangeInputs('add', SYMBOL.add)}</div>
          <div class="zm-row">${opBox('sub')}<span class="zm-note">Addition problems in reverse.</span></div>
          <div class="zm-row">${opBox('mul')}${rangeInputs('mul', SYMBOL.mul)}</div>
          <div class="zm-row">${opBox('div')}<span class="zm-note">Multiplication problems in reverse.</span></div>
          <div class="zm-row">
            <span class="zm-label" id="dec-label">Decimals</span>
            <div class="zm-decimals">
              <div class="segmented" role="group" aria-labelledby="dec-label">
                ${Object.entries(DECIMAL_LABELS).map(([mode, label]) => html`<button type="button" data-decimals="${mode}" aria-pressed="${String(settings.decimals.mode === mode)}">${label}</button>`)}
              </div>
              ${settings.decimals.mode === 'off' ? html`<span class="zm-note">The same problems with a decimal point moved in, like 0.7 × 64 or 44.8 ÷ 0.7. Some trading firms test these.</span>` : html`
                <label class="visually-hidden" for="places">Decimal places</label>
                <select id="places">
                  <option value="1" ${settings.decimals.places === 1 ? 'selected' : ''}>Up to 1 decimal place</option>
                  <option value="2" ${settings.decimals.places === 2 ? 'selected' : ''}>Up to 2 decimal places</option>
                </select>
                <span class="zm-note">${settings.decimals.mode === 'mixed' ? 'About half the questions.' : 'Every question.'}</span>`}
            </div>
          </div>
        </div>
        <div class="zm-footer">
          <div>
            <label class="field-label" for="duration">Duration</label>
            <select id="duration">${DURATIONS.map((d) => html`<option value="${d}" ${d === settings.duration ? 'selected' : ''}>${d} seconds</option>`)}</select>
          </div>
          <div>
            <label class="field-label" for="goal">Goal score</label>
            <input id="goal" type="number" min="5" max="999" step="1" inputmode="numeric" value="${settings.goal ?? ''}" placeholder="${last ? `auto (${autoGoal(last.score)})` : 'auto'}" />
          </div>
          <button class="btn btn-primary" id="start" type="button">Start</button>
          ${best >= 0 ? html`<span class="small muted">Best with these settings: <span class="mono">${best}</span></span>` : ''}
          ${isDefault ? '' : html`<button class="text-btn small" id="reset" type="button">Reset to Zetamac defaults</button>`}
        </div>
      </div>
      <p class="small faint settings-note">Correct answers move on by themselves, with no Enter needed. Press Enter to start.</p>`;
  }

  function runningTpl() {
    return html`
      <div class="arena-bar">
        <span><span class="mono" id="score">0</span> correct</span>
        <span class="mono" id="clock">${clock(run.duration * 1000)}</span>
      </div>
      <div class="time-line"><span id="time-fill" style="width:100%"></span></div>
      <div class="question" id="q"></div>
      <label class="visually-hidden" for="answer">Your answer</label>
      <input class="answer" id="answer" type="text" inputmode="${run.decimals.mode === 'off' ? 'numeric' : 'decimal'}" autocomplete="off" autocorrect="off" spellcheck="false" />
      <p class="arena-hint"><button class="text-btn" type="button" id="end">End round</button> or press Esc. Unfinished rounds aren't saved.</p>`;
  }

  function reportTpl() {
    const rounds = benchmarkRounds();
    if (!rounds.length) return '';
    const d = diagnose(rounds, { goal: state.math.settings.goal });
    const last = rounds[0];
    const heading = freshReport ? 'Your result' : `Your last round, ${ago(last.at)}`;
    if (!d.enough) {
      return html`
        <section class="report" aria-labelledby="report-title">
          <h2 id="report-title" tabindex="-1">${heading}</h2>
          <p class="muted">${plural(last.score, 'correct answer')} isn't enough to see a pattern. A two-minute round gives enough answers for a diagnosis.</p>
        </section>`;
    }
    const scale = Math.max(...d.skills.map((s) => Math.max(s.estimate, s.target))) * 1.05;
    const focusId = d.focus?.id;
    return html`
      <section class="report" aria-labelledby="report-title">
        <div>
          <h2 id="report-title" tabindex="-1">${heading}</h2>
          <div class="stats">
            <div class="stat"><span class="mono">${d.score}</span><span class="small">correct</span></div>
            <div class="stat"><span class="mono">${d.goal}</span><span class="small">${d.goalIsAuto ? 'next goal' : 'your goal'}</span></div>
            <div class="stat"><span class="mono">${seconds((last.duration * 1000) / Math.max(1, d.score))}</span><span class="small">per answer</span></div>
            <div class="stat"><span class="mono">${seconds(d.targetAvgMs)}</span><span class="small">needed for the goal</span></div>
            ${rounds.length > 1 ? html`<div class="stat"><span class="trail">${rounds.slice(0, 8).map((r) => html`<span>${r.score}</span>`)}</span><span class="small">recent scores</span></div>` : ''}
          </div>
        </div>

        ${d.focus ? html`
          <div class="focus">
            <span class="label">Fix this first</span>
            <h2>${SKILLS[d.focus.id].name}</h2>
            <p>${focusReason(d.focus)}</p>
            <div class="focus-numbers">
              <span>Your average <b>${seconds(d.focus.estimate)}</b></span>
              <span>Target <b>${seconds(d.focus.target)}</b></span>
              <span>${d.focus.n ? html`Seen <b>${d.focus.n}</b> ${d.focus.n === 1 ? 'time' : 'times'} this round` : 'Not seen this round; based on earlier rounds'}</span>
            </div>
            ${d.focus.confidence === 'low' ? html`<p class="small note">This is based on only a few questions. Another round will confirm it.</p>` : ''}
            <div class="btn-row"><a class="btn btn-signal" href="#/math/learn/${d.focus.id}">Learn the method and drill it</a></div>
          </div>` : html`
          <div class="focus calm">
            <h2>No clear weak spot</h2>
            <p>You're on pace for ${d.goal} on every kind of question. Set a higher goal score to see what's next.</p>
          </div>`}

        <div>
          <h3>Where your time goes</h3>
          <p class="small table-note">Each row is one kind of question. The bar is your average time and the tick is the time you need for your goal (green bars are already there). "Lost per round" is how many more correct answers you'd get if that row hit its target.</p>
          <table class="skill-table">
            <thead><tr><th>Kind of question</th><th class="num hide-sm">This round</th><th class="num">You</th><th class="num">Target</th><th class="hide-sm"><span class="visually-hidden">Comparison</span></th><th class="num">Lost per round</th></tr></thead>
            <tbody>
              ${d.skills.map((s) => html`
                <tr class="${s.id === focusId ? 'is-focus' : ''}">
                  <td><a href="#/math/learn/${s.id}">${SKILLS[s.id].name}</a></td>
                  <td class="num hide-sm">${s.n || '–'}</td>
                  <td class="num">${s.evidence ? seconds(s.estimate) : '–'}</td>
                  <td class="num">${seconds(s.target)}</td>
                  <td class="hide-sm">
                    <div class="vs" aria-hidden="true">
                      ${s.evidence ? html`<span class="you ${s.estimate <= s.target ? 'under' : ''}" style="width:${(100 * s.estimate) / scale}%"></span>` : ''}
                      <span class="target" style="left:${(100 * s.target) / scale}%"></span>
                    </div>
                  </td>
                  <td class="num cost ${s.points < 0.5 ? 'zero' : ''}">${s.points < 0.5 ? '–' : s.points.toFixed(1)}</td>
                </tr>`)}
            </tbody>
          </table>
        </div>

        ${d.slowest.length ? html`
          <div>
            <h3>Your slowest answers</h3>
            <p class="small table-note">Each one worked through with the method for that kind of question.</p>
            <ul class="slow-list">
              ${d.slowest.map((q) => html`
                <li>
                  <span class="q">${q.text}</span>
                  <span class="t">${seconds(q.ms)}</span>
                  <span class="work">${SKILLS[q.skill].steps(q).join('  ·  ')}</span>
                </li>`)}
            </ul>
          </div>` : ''}
      </section>`;
  }

  function skillsTpl() {
    const rounds = benchmarkRounds();
    const d = rounds.length ? diagnose(rounds, { goal: state.math.settings.goal }) : null;
    const rowFor = (id) => (d?.enough ? d.skills.find((s) => s.id === id) : null);
    return html`
      <section class="section" aria-labelledby="skills-title">
        <h2 id="skills-title">Every technique</h2>
        <p class="section-intro">Every question falls into one of these. Open one to learn the method and drill only that kind of question.</p>
        <div class="skill-grid">
          ${SKILL_ORDER.map((id) => {
            const s = SKILLS[id];
            const row = rowFor(id);
            return html`
              <a class="skill-card" href="#/math/learn/${id}">
                <strong>${s.name}</strong>
                <span class="eg">${question(s.op, ...s.sample).text}</span>
                <span class="last">${row?.evidence ? `About ${seconds(row.estimate)} in recent rounds` : 'Not measured yet'}</span>
              </a>`;
          })}
        </div>
      </section>`;
  }

  function draw() {
    if (run) {
      mount(app, html`<section class="arena" aria-label="Round in progress">${runningTpl()}</section>`);
      return;
    }
    mount(app, html`
      <div class="page-head">
        <h1>Mental maths</h1>
        <p>A Zetamac-style round with the same settings. When time's up, you'll see which technique is costing you the most, with a short explanation and a drill on just that kind of question.</p>
      </div>
      <section aria-label="Settings">${settingsTpl()}</section>
      ${reportTpl()}
      ${skillsTpl()}`);
    bindSettings();
  }

  function readRanges() {
    const ranges = structuredClone(state.math.settings.ranges);
    for (const input of app.querySelectorAll('[data-range]')) {
      const [key, i, j] = input.dataset.range.split('.');
      ranges[key][Number(i)][Number(j)] = Number(input.value);
    }
    return normaliseRanges(ranges);
  }

  function bindSettings() {
    for (const box of app.querySelectorAll('[data-op]')) {
      box.addEventListener('change', () => {
        const ops = OPS.filter((op) => app.querySelector(`[data-op="${op}"]`).checked);
        if (!ops.length) {
          box.checked = true;
          toast('Keep at least one operation switched on.');
          return;
        }
        state.math.settings.ops = ops;
        save();
        draw();
      });
    }
    for (const input of app.querySelectorAll('[data-range]')) {
      input.addEventListener('change', () => {
        state.math.settings.ranges = readRanges();
        save();
        draw();
        app.querySelector(`[data-range="${input.dataset.range}"]`)?.focus();
      });
    }
    for (const b of app.querySelectorAll('[data-decimals]')) {
      b.addEventListener('click', () => {
        state.math.settings.decimals.mode = b.dataset.decimals;
        save();
        draw();
        app.querySelector(`[data-decimals="${b.dataset.decimals}"]`)?.focus();
      });
    }
    $('#places', app)?.addEventListener('change', (e) => {
      state.math.settings.decimals.places = Number(e.target.value) === 2 ? 2 : 1;
      save();
      draw();
    });
    $('#duration', app).addEventListener('change', (e) => {
      state.math.settings.duration = Number(e.target.value);
      save();
      draw();
    });
    $('#goal', app).addEventListener('change', (e) => {
      const n = Number(e.target.value);
      state.math.settings.goal = Number.isInteger(n) && n >= 5 ? n : null;
      save();
      draw();
    });
    $('#reset', app)?.addEventListener('click', () => {
      state.math.settings = { ...defaultSettings(), goal: state.math.settings.goal };
      save();
      draw();
      toast('Back to Zetamac defaults.');
    });
    $('#start', app).addEventListener('click', start);
    if (freshReport) {
      const title = $('#report-title', app);
      title?.scrollIntoView({ block: 'start' });
      window.scrollBy(0, -96);
      title?.focus({ preventScroll: true });
      freshReport = false;
    }
  }

  // ---------- The timed round ----------

  function start() {
    const { duration, ops, ranges, decimals } = state.math.settings;
    const now = performance.now();
    run = { duration, ops: [...ops], ranges: structuredClone(ranges), decimals: { ...decimals }, endsAt: now + duration * 1000, answered: [], q: null, shownAt: now, misses: 0, lastMiss: '', frame: 0 };
    draw();
    $('#answer', app).addEventListener('input', onInput);
    $('#end', app).addEventListener('click', () => finish(false));
    showNext();
    tick();
  }

  function showNext() {
    run.q = nextQuestion(run.ops, run.q, Math.random, run.ranges, run.decimals);
    run.shownAt = performance.now();
    run.misses = 0;
    run.lastMiss = '';
    $('#q', app).textContent = run.q.text;
    const input = $('#answer', app);
    input.value = '';
    input.classList.remove('miss');
    input.focus();
  }

  function onInput(e) {
    const now = performance.now();
    if (now >= run.endsAt) return finish(true);
    const input = e.target;
    // Digits and a single decimal point; "4.50", ".5" and "0.5" are all read as numbers.
    input.value = input.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    const target = String(run.q.answer);
    if (canonical(input.value) === target) {
      const { op, x, y } = run.q;
      run.answered.push({ op, x, y, ms: Math.round(now - run.shownAt), misses: run.misses });
      $('#score', app).textContent = run.answered.length;
      showNext();
      return;
    }
    // A full-length wrong answer counts as one miss until you change it.
    if (input.value.length >= target.length && input.value !== run.lastMiss) {
      run.misses++;
      run.lastMiss = input.value;
      input.classList.add('miss');
    } else if (input.value.length < target.length) {
      input.classList.remove('miss');
    }
  }

  function tick() {
    const left = run.endsAt - performance.now();
    if (left <= 0) return finish(true);
    $('#clock', app).textContent = clock(left);
    $('#time-fill', app).style.width = `${(100 * left) / (run.duration * 1000)}%`;
    run.frame = requestAnimationFrame(tick);
  }

  function finish(completed) {
    cancelAnimationFrame(run.frame);
    if (completed) {
      const { duration, ops, ranges, decimals, answered } = run;
      addRound({ at: new Date().toISOString(), duration, ops, ranges, decimals, score: answered.length, questions: answered });
      freshReport = true;
    } else {
      toast('Round ended. Unfinished rounds aren\'t saved.');
    }
    run = null;
    draw();
  }

  function onKey(e) {
    if (run && e.key === 'Escape') {
      finish(false);
    } else if (!run && e.key === 'Enter' && !e.target.closest('input, button, a, select, textarea')) {
      e.preventDefault();
      start();
    }
  }

  document.addEventListener('keydown', onKey);
  draw();
  return () => {
    document.removeEventListener('keydown', onKey);
    if (run) cancelAnimationFrame(run.frame);
  };
}
