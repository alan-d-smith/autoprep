// "Today": the next thing to do on each track.

import { html, mount, ago } from './dom.js';
import { state, benchmarkRounds, isSolved } from './store.js';
import { diagnose } from './math/diagnose.js';
import { SKILLS } from './math/skills.js';
import { focusReason } from './math/view.js';
import { TRACKS } from './cf/curriculum.js';
import { UKIEPC } from './cf/ukiepc.js';
import { nextProblem, stageProgress, problemUrl, ratingBand, problemReady, trackStages } from './cf/roadmap.js';
import { openQuiz, quizStart } from './cf/quiz.js';

const anySolved = () => Object.keys(state.cf.synced).length > 0 || Object.keys(state.cf.manual).length > 0;
// Nothing done yet: no round, no solved problem, no quiz and no Codeforces handle.
const newcomer = () => !state.math.rounds.length && !anySolved() && !state.cf.quiz && !state.cf.handle;

function mathCard() {
  const rounds = benchmarkRounds();
  if (!rounds.length) {
    return html`
      <h2 id="today-math">Mental maths</h2>
      <p class="muted">No rounds yet. Two minutes of Zetamac-style questions is enough to find the technique that's holding you back.</p>
      <div class="btn-row"><a class="btn btn-primary" href="#/math">Play a round</a></div>`;
  }
  const last = rounds[0];
  const d = diagnose(rounds, { goal: state.math.settings.goal });
  const focus = d.enough ? d.focus : null;
  return html`
    <h2 id="today-math">Mental maths</h2>
    <div>
      <div class="score-line"><span class="big-number">${last.score}</span><span class="muted">correct in your last round, ${ago(last.at)}</span></div>
      ${rounds.length > 1 ? html`<div class="trail" aria-label="Recent scores, newest first">${rounds.slice(0, 8).map((r) => html`<span>${r.score}</span>`)}</div>` : ''}
    </div>
    ${focus
      ? html`<div class="fix-next"><span class="small faint">Fix next</span><strong>${SKILLS[focus.id].name}</strong><span class="small muted">${focusReason(focus)}</span></div>
        <div class="btn-row"><a class="btn btn-signal" href="#/math/learn/${focus.id}">Practise this</a><a class="btn" href="#/math">Play a round</a></div>`
      : html`<p class="muted">${d.enough ? `You're on pace for ${d.goal} across the board. Set a higher goal to get a new focus.` : 'That round was too short to diagnose. A full two-minute round gives enough answers.'}</p>
        <div class="btn-row"><a class="btn btn-primary" href="#/math">Play a round</a></div>`}`;
}

// A stage you haven't started points at its primer; once you have, at the next problem.
function stepTpl(stage, progress) {
  if (!progress.solved) {
    const ratings = stage.problems.filter((p) => p.tier !== 'challenge').map((p) => p.rating);
    return html`<p class="small muted"><a href="#/path/${stage.id}">Start with the primer</a>, then ${progress.required} problems rated ${Math.min(...ratings)} to ${Math.max(...ratings)}.</p>`;
  }
  const next = nextProblem(stage, isSolved);
  return next ? html`
    <div class="next-problem">
      <span class="small faint">Next</span>
      <span class="rating band-${ratingBand(next.rating)}">${next.rating}</span>
      <a href="${problemUrl(next.id)}" target="_blank" rel="noopener">${next.name}</a>
      <span class="small faint mono">${next.id}</span>
    </div>` : '';
}

function trackItem(track) {
  const stages = trackStages(track);
  const stage = quizStart(track);
  if (!stage) return html`<li><div class="track-head"><span>${track.title}</span><span>Complete</span></div></li>`;
  const progress = stageProgress(stage, isSolved);
  return html`
    <li>
      <div class="track-head">
        <span>${track.title}</span>
        <span>Stage ${stages.indexOf(stage) + 1} of ${stages.length}</span>
      </div>
      <div class="rail" aria-hidden="true">
        ${stages.map((s) => {
          const p = stageProgress(s, isSolved);
          return html`<span class="${s === stage ? 'here' : ''}"><i style="width:${(100 * p.requiredSolved) / p.required}%"></i></span>`;
        })}
      </div>
      <div class="track-stage">
        <a href="#/path/${stage.id}">${stage.title}</a>
        ${progress.solved ? html`<span>${progress.requiredSolved} of ${progress.required} solved</span>` : ''}
      </div>
      ${stepTpl(stage, progress)}
    </li>`;
}

function pathCard() {
  const all = UKIEPC.flatMap((c) => c.problems.map((p) => ({ ...p, key: `${c.gym}${p.letter}` })));
  const ready = all.filter((p) => !isSolved(p.key) && problemReady(p, isSolved)).length;
  // Until you've taken the quiz or solved anything, it's the quickest way to find where to start.
  const askQuiz = !state.cf.quiz && !anySolved();
  return html`
    <h2 id="today-path">Codeforces path</h2>
    ${askQuiz ? html`
      <div class="home-quiz">
        <p>Not sure where to start?</p>
        <button class="btn btn-primary" type="button" data-quiz>Take a quiz</button>
      </div>` : ''}
    <ul class="track-list">${TRACKS.map(trackItem)}</ul>
    <div class="btn-row">
      <a class="btn ${askQuiz ? '' : 'btn-primary'}" href="#/path">Open the path</a>
      <a class="btn" href="#/ukiepc">UKIEPC practice</a>
    </div>
    ${ready ? html`<p class="small muted"><a href="#/ukiepc/ready">${ready} UKIEPC ${ready === 1 ? 'problem is' : 'problems are'} covered</a> by stages you've completed.</p>` : ''}
    ${state.cf.handle ? '' : html`<p class="small faint">Add your Codeforces handle on the <a href="#/path">path page</a> and solved problems get ticked off automatically.</p>`}`;
}

export function renderHome(app) {
  const listeners = new AbortController();

  function draw() {
    mount(app, html`
      <div class="page-head">
        <h1>What to practise next</h1>
        ${newcomer() ? html`<p>Competitive programming through dynamic programming, graphs and geometry, plus mental maths for quant interviews. Each track tells you the single next thing to do.</p>` : ''}
      </div>
      <div class="today">
        <section class="card" aria-labelledby="today-path">${pathCard()}</section>
        <section class="card" aria-labelledby="today-math">${mathCard()}</section>
      </div>`);
  }

  app.addEventListener('click', (e) => {
    if (!e.target.closest('[data-quiz]')) return;
    // Redraw behind the dialog, so closing it shows where each track now starts.
    openQuiz({ onSubmit: draw });
  }, { signal: listeners.signal });

  draw();
  return () => listeners.abort();
}
