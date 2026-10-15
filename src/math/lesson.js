// One technique: the explanation, a worked example you step through, and a drill on only that kind of question.

import { html, mount, $, seconds, raw } from '../dom.js';
import { state, addDrill, benchmarkRounds } from '../store.js';
import { question, questionForSkill, canonical } from './zetamac.js';
import { SKILLS } from './skills.js';
import { diagnose } from './diagnose.js';
import { mathPicture } from '../viz/maths.js';
import { listenButton, bindListen } from '../tts.js';

const DRILL_LENGTH = 15;
const GUIDED = 3;

export function renderLesson(app, skillId) {
  const skill = SKILLS[skillId];
  if (!skill) {
    mount(app, html`<div class="page-head"><h1>No such technique</h1><p><a href="#/math">See every technique on the mental maths page.</a></p></div>`);
    return;
  }

  const rounds = benchmarkRounds();
  const d = rounds.length ? diagnose(rounds, { goal: state.math.settings.goal }) : null;
  const measured = d?.enough ? d.skills.find((s) => s.id === skillId) : null;
  const before = measured?.evidence ? measured.estimate : null;
  const target = measured?.target ?? null;

  const listeners = new AbortController();
  bindListen(app, listeners.signal);

  let example = question(skill.op, ...skill.sample);
  let revealed = 0;
  let drill = null;
  let result = null;

  function workedTpl() {
    const steps = skill.steps(example);
    const done = revealed >= steps.length;
    return html`
      <p class="small muted">Worked example</p>
      <div class="mono q" data-read="lesson">${example.text}</div>
      <ol class="steps" aria-live="polite">
        ${steps.slice(0, revealed).map((s, i) => html`<li class="${i === steps.length - 1 ? 'final' : ''}" data-read="lesson">${s}</li>`)}
      </ol>
      ${done ? pictureTpl() : ''}
      <div class="btn-row">
        ${done
          ? html`<button class="btn" type="button" id="another">Try another example</button>`
          : html`<button class="btn" type="button" id="step">${revealed ? 'Next step' : 'Show the first step'}</button>
                 <button class="text-btn" type="button" id="all">Show all</button>`}
      </div>`;
  }

  // The method drawn for this example, shown once the working is out (so it doesn't give the answer away).
  function pictureTpl() {
    const picture = mathPicture(skillId, example);
    if (!picture) return '';
    return html`<figure class="viz viz-small"><div class="viz-frame">${raw(picture.svg)}</div><figcaption class="viz-caption" data-read="lesson">${picture.caption}</figcaption></figure>`;
  }

  function drillTpl() {
    if (result) {
      const delta = before != null ? result.avgMs - before : null;
      return html`
        <div class="drill-result">
          <h2 id="drill-title" tabindex="-1">Drill done</h2>
          <div class="compare">
            <div><span class="mono ${delta != null ? (delta < 0 ? 'better' : 'worse') : ''}">${result.avgMs ? seconds(result.avgMs) : '–'}</span><span class="small muted">this drill, without working shown</span></div>
            ${before != null ? html`<div><span class="mono">${seconds(before)}</span><span class="small muted">in your recent rounds</span></div>` : ''}
            ${target != null ? html`<div><span class="mono">${seconds(target)}</span><span class="small muted">target for your goal</span></div>` : ''}
          </div>
          <p>${verdict()}</p>
          <div class="btn-row">
            <button class="btn btn-primary" type="button" id="again">Drill again</button>
            <a class="btn" href="#/math">Play a round</a>
          </div>
        </div>`;
    }
    if (!drill) {
      return html`
        <h2 id="drill-title">Drill</h2>
        <p>${DRILL_LENGTH} questions of this kind only, drawn from your current ranges. The first ${GUIDED} show the working. After that, press <kbd>?</kbd> or the button when you need a hint. Answers given with the working shown don't count toward your time.</p>
        <div class="btn-row"><button class="btn btn-primary" type="button" id="go">Start the drill</button></div>`;
    }
    const counted = drill.done.filter((a) => !a.hinted);
    const avg = counted.length ? counted.reduce((s, a) => s + a.ms, 0) / counted.length : null;
    return html`
      <div class="drill-meta">
        <span>Question ${drill.done.length + 1} of ${DRILL_LENGTH}</span>
        <span>${avg != null ? `${seconds(avg)} average` : ''}</span>
      </div>
      <div class="question" id="dq">${drill.q.text}</div>
      <label class="visually-hidden" for="danswer">Your answer</label>
      <input class="answer" id="danswer" type="text" inputmode="${skillId.startsWith('dec-') ? 'decimal' : 'numeric'}" autocomplete="off" autocorrect="off" spellcheck="false" />
      ${drill.hinted
        ? html`<ol class="drill-steps">${skill.steps(drill.q).map((s) => html`<li>${s}</li>`)}</ol>`
        : html`<p class="arena-hint"><button class="text-btn" type="button" id="hint">Show the working</button></p>`}`;
  }

  function verdict() {
    if (!result.avgMs) return 'Every answer had the working shown. Run it again and try a few on your own.';
    if (before == null) return 'Play a round to see how this compares with your speed under time pressure.';
    if (target != null && result.avgMs <= target) return 'That is at goal pace. Play a round to check it holds up with mixed questions.';
    if (result.avgMs < before) return 'Faster than in your recent rounds. Another set or two will make the method automatic.';
    return 'Not faster yet. That is normal while a method is new. Use it deliberately every time, and speed follows.';
  }

  function draw() {
    mount(app, html`
      <p class="crumb"><a href="#/math">Mental maths</a></p>
      <div class="lesson">
        <div class="lesson-text">
          <p class="kind">${skill.name}</p>
          <h1 data-read="lesson">${skill.lesson.title}</h1>
          <p class="idea" data-read="lesson">${skill.lesson.idea}</p>
          <p class="when" data-read="lesson"><strong>When to use it:</strong> ${skill.lesson.when}</p>
          ${listenButton('lesson')}
          ${before != null ? html`<p class="small muted measured">In your recent rounds these took about ${seconds(before)} each${target != null ? `; your goal needs ${seconds(target)}` : ''}.</p>` : ''}
        </div>
        <div class="card worked" id="worked">${workedTpl()}</div>
      </div>
      <section class="card drill" id="drill" aria-labelledby="drill-title">${drillTpl()}</section>`);
    bind();
  }

  function redrawWorked() {
    mount($('#worked', app), workedTpl());
    bindWorked();
  }

  function redrawDrill() {
    mount($('#drill', app), drillTpl());
    bindDrill();
  }

  function bindWorked() {
    $('#step', app)?.addEventListener('click', () => { revealed++; redrawWorked(); ($('#step', app) || $('#another', app)).focus(); });
    $('#all', app)?.addEventListener('click', () => { revealed = Infinity; redrawWorked(); $('#another', app)?.focus(); });
    $('#another', app)?.addEventListener('click', () => {
      example = questionForSkill(skillId, state.math.settings.ranges, Math.random, example, state.math.settings.decimals.places);
      revealed = 0;
      redrawWorked();
      $('#step', app)?.focus();
    });
  }

  function bindDrill() {
    $('#go', app)?.addEventListener('click', startDrill);
    $('#again', app)?.addEventListener('click', startDrill);
    $('#hint', app)?.addEventListener('click', showHint);
    const input = $('#danswer', app);
    if (input) {
      input.addEventListener('input', onDrillInput);
      input.addEventListener('keydown', (e) => {
        if (e.key === '?') { e.preventDefault(); showHint(); }
        if (e.key === 'Escape') { drill = null; redrawDrill(); }
      });
      input.focus();
    }
    if (result) $('#drill-title', app)?.focus();
  }

  function bind() {
    bindWorked();
    bindDrill();
  }

  function startDrill() {
    result = null;
    drill = { done: [], q: null, shownAt: 0, hinted: false };
    nextDrillQuestion();
  }

  function nextDrillQuestion() {
    drill.q = questionForSkill(skillId, state.math.settings.ranges, Math.random, drill.q, state.math.settings.decimals.places);
    drill.hinted = drill.done.length < GUIDED;
    drill.shownAt = performance.now();
    redrawDrill();
  }

  function showHint() {
    if (!drill || drill.hinted) return;
    drill.hinted = true;
    const typed = $('#danswer', app).value;
    redrawDrill();
    $('#danswer', app).value = typed;
  }

  function onDrillInput(e) {
    const input = e.target;
    input.value = input.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    if (canonical(input.value) !== String(drill.q.answer)) return;
    drill.done.push({ ms: performance.now() - drill.shownAt, hinted: drill.hinted });
    if (drill.done.length < DRILL_LENGTH) {
      nextDrillQuestion();
      return;
    }
    const counted = drill.done.filter((a) => !a.hinted);
    const avgMs = counted.length ? counted.reduce((s, a) => s + a.ms, 0) / counted.length : null;
    result = { avgMs };
    addDrill({ skill: skillId, at: new Date().toISOString(), counted: counted.length, avgMs });
    drill = null;
    redrawDrill();
  }

  draw();
  return () => listeners.abort();
}
