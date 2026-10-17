// The path's front page: each track with your progress through it and where you are, plus the
// where-to-start quiz.

import { html, mount, ago } from '../dom.js';
import { state, isSolved } from '../store.js';
import { TRACKS } from './curriculum.js';
import { stageProgress, trackStages, belowLevel } from './roadmap.js';
import { syncControls } from './view.js';
import { openQuiz, quizConfident, quizStart } from './quiz.js';

const rating = () => state.cf.maxRating ?? state.cf.rating;

function trackTpl(track) {
  const stages = trackStages(track);
  const progress = stages.map((s) => stageProgress(s, isSolved));
  const here = quizStart(track);
  const stagesDone = progress.filter((p) => p.complete).length;
  const solved = progress.reduce((n, p) => n + p.solved, 0);
  const total = progress.reduce((n, p) => n + p.total, 0);
  const started = solved > 0 || stages.indexOf(here) > 0;
  return html`
    <section class="track" aria-labelledby="track-${track.id}">
      <h2 id="track-${track.id}">${track.title}</h2>
      <p class="track-sum">${stagesDone} of ${stages.length} stages complete, ${solved} of ${total} problems solved</p>
      <div class="rail" aria-hidden="true">
        ${stages.map((s, i) => html`<span class="${s === here ? 'here' : ''}"><i style="width:${(100 * progress[i].requiredSolved) / progress[i].required}%"></i></span>`)}
      </div>
      <ol class="track-stages">
        ${stages.map((s, i) => {
          const p = progress[i];
          const status = p.complete ? 'Done'
            : s === here ? `${p.requiredSolved} of ${p.required}`
            : quizConfident(s) ? 'Confident'
            : belowLevel(s, rating()) ? 'Below your rating'
            : p.solved ? `${p.requiredSolved} of ${p.required}` : '';
          return html`
            <li class="${p.complete ? 'done' : ''} ${s === here ? 'current' : ''}">
              <a href="#/path/${s.id}">
                <span class="num">${i + 1}</span>
                <span class="name">${s.title}${s === here ? html`<span class="here">you are here</span>` : ''}</span>
                <span class="status">${status}</span>
              </a>
            </li>`;
        })}
      </ol>
      ${here
        ? html`<a class="btn ${started ? 'btn-primary' : ''}" href="#/path/${here.id}">${started ? 'Continue' : 'Start'}</a>`
        : html`<p class="track-done">Track complete.</p>`}
    </section>`;
}

function quizTpl() {
  const quiz = state.cf.quiz;
  return quiz
    ? html`<p>You took the where-to-start quiz ${ago(quiz.at)}, so stages you're confident in are skipped.</p>
        <button class="btn" type="button" data-quiz="fresh">Retake the quiz</button>`
    : html`<p>Not sure where to start?</p>
        <button class="btn btn-primary" type="button" data-quiz>Take a quiz</button>`;
}

export function renderOverview(app) {
  const listeners = new AbortController();
  const sync = syncControls(app, draw);

  function draw() {
    mount(app, html`
      <div class="page-head">
        <h1>Codeforces path</h1>
        <p>Dynamic programming, graphs and geometry, in the order to learn them. Each stage starts with a primer, then problems that climb steadily in rating. If you get stuck, the hints give a nudge, then the technique, then the full approach.</p>
      </div>
      <div class="quiz-cta">${quizTpl()}</div>
      <div class="tracks">${TRACKS.map(trackTpl)}</div>
      <section class="account" aria-label="Codeforces account">${sync.tpl()}</section>`);
    sync.bind();
  }

  app.addEventListener('click', (e) => {
    const start = e.target.closest('[data-quiz]');
    if (!start) return;
    openQuiz({
      fresh: start.dataset.quiz === 'fresh',
      onSubmit: () => {
        // Redraw behind the dialog, so closing it shows the new starting points.
        draw();
      },
    });
  }, { signal: listeners.signal });

  draw();
  return () => {
    listeners.abort();
    sync.stop();
  };
}
