// "Today": the next thing to do on each track.

import { html, mount, ago } from './dom.js';
import { state, benchmarkRounds, isSolved } from './store.js';
import { diagnose } from './math/diagnose.js';
import { SKILLS } from './math/skills.js';
import { focusReason } from './math/view.js';
import { TRACKS } from './cf/curriculum.js';
import { UKIEPC } from './cf/ukiepc.js';
import { currentStage, nextProblem, stageProgress, problemUrl, ratingBand, covered } from './cf/roadmap.js';

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

function trackItem(track) {
  const rating = state.cf.maxRating ?? state.cf.rating;
  const stage = currentStage(track, isSolved, rating);
  if (!stage) return html`<li><div class="track-head"><strong>${track.title}</strong><span>Complete</span></div></li>`;
  const progress = stageProgress(stage, isSolved);
  const next = nextProblem(stage, isSolved);
  return html`
    <li>
      <div class="track-head">
        <strong>${track.title}</strong>
        <span>${progress.requiredSolved} of ${progress.required} in <a href="#/path/${stage.id}">${stage.title}</a></span>
      </div>
      ${next ? html`
        <div class="next-problem">
          <span class="rating band-${ratingBand(next.rating)}">${next.rating}</span>
          <a href="${problemUrl(next.id)}" target="_blank" rel="noopener">${next.name}</a>
          <span class="small faint mono">${next.id}</span>
        </div>` : ''}
    </li>`;
}

function pathCard() {
  const all = UKIEPC.flatMap((c) => c.problems.map((p) => ({ ...p, key: `${c.gym}${p.letter}` })));
  const ready = all.filter((p) => !isSolved(p.key) && covered(p.stages, isSolved)).length;
  return html`
    <h2 id="today-path">Codeforces path</h2>
    <ul class="track-list">${TRACKS.map(trackItem)}</ul>
    <div class="btn-row">
      <a class="btn btn-primary" href="#/path">Open the path</a>
      <a class="btn" href="#/ukiepc">UKIEPC practice</a>
    </div>
    <p class="small faint">${ready ? `${ready} UKIEPC ${ready === 1 ? 'problem is' : 'problems are'} covered by stages you've completed. ` : ''}${state.cf.handle ? '' : html`Add your Codeforces handle on the <a href="#/path">path page</a> and solved problems get ticked off automatically.`}</p>`;
}

export function renderHome(app) {
  mount(app, html`
    <div class="page-head">
      <h1>What to practise next</h1>
      <p>Competitive programming through dynamic programming, graphs and geometry, plus mental maths for quant interviews. Each track tells you the single next thing to do.</p>
    </div>
    <div class="today">
      <section class="card" aria-labelledby="today-path">${pathCard()}</section>
      <section class="card" aria-labelledby="today-math">${mathCard()}</section>
    </div>`);
}
