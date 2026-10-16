// The Codeforces path: track and stage index, the stage primer, and its problems with hints.

import { html, raw, mount, $, toast, ago } from '../dom.js';
import { state, save, isSolved } from '../store.js';
import { TRACKS, STAGES, TIERS, stageById } from './curriculum.js';
import { UKIEPC } from './ukiepc.js';
import { currentStage, nextProblem, stageProgress, belowLevel, problemUrl, ratingBand, trackStages, stagePosition } from './roadmap.js';
import { fetchProfile } from './codeforces.js';
import { videosTpl, bindVideos } from './video-view.js';
import { TRD_CODE, TRD_REPO } from './trd.js';
import { CHEVRON_ICON } from '../icons.js';
import { hintToggle, hintPanel, bindHints } from './hints.js';
import { rich, highlightCpp } from '../format.js';
import { STAGE_VISUALS } from '../viz/stages.js';
import { stepperTpl, slidesTpl, bindSteppers } from '../viz/stepper.js';
import { listenButton, bindListen } from '../tts.js';
import { quizConfident } from './quiz.js';
import { STAGE_SOURCES } from './sources.js';

// Problems whose accepted submissions we keep after a sync: the path plus the UKIEPC sets.
export const TRACKED_IDS = new Set([
  ...STAGES.flatMap((s) => s.problems.map((p) => p.id)),
  ...UKIEPC.flatMap((c) => c.problems.map((p) => `${c.gym}${p.letter}`)),
]);

const rating = () => state.cf.maxRating ?? state.cf.rating;

// The handle form and sync status, shared with the UKIEPC page.
export function syncControls(app, redraw) {
  let syncing = false;
  let message = null;
  let error = false;
  let alive = true;

  function statusTpl() {
    if (message) return message;
    const cf = state.cf;
    if (!cf.syncedAt) return 'Optional. Problems you\'ve solved on Codeforces get ticked off here. Without it, tick them off yourself.';
    const ratingText = cf.rating != null ? `rated ${cf.rating}, max ${cf.maxRating}` : 'unrated';
    return html`Synced <strong>${cf.handle}</strong> (${ratingText}) ${ago(cf.syncedAt)}. ${Object.keys(cf.synced).length} of the problems here are accepted on Codeforces.`;
  }

  const tpl = () => html`
    <form class="handle-form" id="handle-form">
      <div>
        <label class="field-label" for="handle">Codeforces handle</label>
        <input id="handle" type="text" autocomplete="username" autocapitalize="off" spellcheck="false" value="${state.cf.handle}" required />
      </div>
      <button class="btn btn-primary" type="submit" ${syncing ? 'disabled' : ''}>${syncing ? 'Syncing…' : 'Sync solved problems'}</button>
      ${state.cf.syncedAt && !syncing ? html`<button class="text-btn small" type="button" id="forget">Disconnect</button>` : ''}
    </form>
    <p class="sync-status ${error ? 'error' : ''}" role="status">${statusTpl()}</p>`;

  function bind() {
    $('#handle-form', app).addEventListener('submit', (e) => {
      e.preventDefault();
      sync($('#handle', app).value.trim());
    });
    $('#forget', app)?.addEventListener('click', () => {
      Object.assign(state.cf, { handle: '', rating: null, maxRating: null, rank: null, synced: {}, totalSolved: null, syncedAt: null });
      save();
      message = null;
      redraw();
      toast('Disconnected. Problems you ticked off yourself are still ticked.');
    });
  }

  async function sync(handle) {
    if (!handle || syncing) return;
    syncing = true;
    error = false;
    message = 'Looking up the account…';
    redraw();
    try {
      const profile = await fetchProfile(handle, (msg) => {
        message = msg;
        if (alive) app.querySelector('.sync-status').textContent = msg;
      });
      const synced = {};
      for (const id of profile.solved) if (TRACKED_IDS.has(id)) synced[id] = true;
      Object.assign(state.cf, {
        handle: profile.handle,
        rating: profile.rating,
        maxRating: profile.maxRating,
        rank: profile.rank,
        synced,
        totalSolved: profile.solved.size,
        syncedAt: new Date().toISOString(),
      });
      save();
      message = null;
      toast(`Synced ${profile.handle}: ${Object.keys(synced).length} of these problems already solved.`);
    } catch (err) {
      error = true;
      message = err.message;
    } finally {
      syncing = false;
      // The sync is saved either way, but only redraw if this page is still showing.
      if (alive) redraw();
    }
  }

  return { tpl, bind, stop: () => { alive = false; } };
}

// A checkbox, rating, name and hints for one problem. Shared by the path and UKIEPC pages.
export function problemRow({ key, name, url, pid = '', label, extra = '', hints, isNext, open, rowClass = '' }) {
  const synced = Boolean(state.cf.synced[key]);
  const solved = isSolved(key);
  return html`
    <li class="problem ${rowClass} ${solved ? 'solved' : ''} ${isNext ? 'next' : ''}" id="prob-${key}">
      <div class="problem-row">
        <input type="checkbox" data-solve="${key}" ${solved ? 'checked' : ''} ${synced ? 'disabled' : ''}
               aria-label="${synced ? `${name}: accepted on Codeforces` : `Mark ${name} as solved`}" />
        ${label}
        <span>
          <a class="name" href="${url}" target="_blank" rel="noopener">${name}</a><span class="pid">${pid}</span>
          ${extra}
        </span>
        <span class="row-end">
          <span class="via">${synced ? 'Accepted on Codeforces' : isNext ? 'Up next' : ''}</span>
          ${hints ? hintToggle(key, hints.hints, open.has(key)) : ''}
        </span>
      </div>
      ${hints ? hintPanel(key, hints, open.has(key)) : ''}
    </li>`;
}

export function bindSolveBoxes(root, redraw, signal) {
  root.addEventListener('change', (e) => {
    const box = e.target.closest('[data-solve]');
    if (!box) return;
    const id = box.dataset.solve;
    if (box.checked) state.cf.manual[id] = new Date().toISOString();
    else delete state.cf.manual[id];
    save();
    redraw();
    root.querySelector(`[data-solve="${id}"]`)?.focus();
  }, { signal });
}

// A problem picked in the stage list: scrolled to (and briefly highlighted) once its stage renders.
let pendingJump = null;

function jumpToProblem() {
  const row = pendingJump && document.getElementById(`prob-${pendingJump}`);
  pendingJump = null;
  if (!row) return;
  row.scrollIntoView({ block: 'center' });
  row.classList.add('flash');
  setTimeout(() => row.classList.remove('flash'), 1600);
}

export function renderPath(app, stageId) {
  const open = new Set();
  const listeners = new AbortController();
  const sync = syncControls(app, draw);

  // The floating index: tracks fold away, and each stage opens to list its problems.
  let indexState = { selected: null, here: new Set() };
  const stageOpen = (s) => state.ui.openStages.includes(s.id) || (s === indexState.selected && !state.ui.closedStages.includes(s.id));

  function indexTpl(selected, here) {
    indexState = { selected, here };
    return TRACKS.map((track) => {
      const closed = state.ui.closedTracks.includes(track.id);
      return html`
        <section class="index-track">
          <button class="index-track-head" type="button" data-toggle-track="${track.id}" aria-expanded="${String(!closed)}">${raw(CHEVRON_ICON)}<span>${track.title}</span></button>
          <ol ${closed ? 'hidden' : ''}>
            ${trackStages(track).map((s) => {
              const p = stageProgress(s, isSolved);
              const below = !p.complete && belowLevel(s, rating());
              const open = stageOpen(s);
              return html`
                <li class="index-stage">
                  <div class="index-stage-row">
                    <button class="index-expand" type="button" data-toggle-stage="${s.id}" aria-expanded="${String(open)}" aria-label="${open ? 'Hide' : 'Show'} the problems in ${s.title}">${raw(CHEVRON_ICON)}</button>
                    <a class="stage-link ${p.complete ? 'done' : ''}" href="#/path/${s.id}" aria-current="${s === selected ? 'page' : 'false'}"
                       title="${below ? 'Below your rating: skim it or use it for review' : ''}">
                      <span>${s.title}${here.has(s) ? html`<span class="here">you are here</span>` : ''}</span>
                      <span class="count">${p.solved}/${p.total}</span>
                    </a>
                  </div>
                  ${open ? html`
                    <ol class="index-problems">
                      ${s.problems.map((pr) => html`
                        <li><a class="index-problem ${isSolved(pr.id) ? 'solved' : ''}" href="#/path/${s.id}" data-jump="${pr.id}">
                          <span class="tick" aria-hidden="true">${isSolved(pr.id) ? '✓' : ''}</span>
                          <span class="rating band-${ratingBand(pr.rating)}">${pr.rating}</span>
                          <span class="pname">${pr.name}</span>
                        </a></li>`)}
                    </ol>` : ''}
                </li>`;
            })}
          </ol>
        </section>`;
    });
  }

  function redrawIndex() {
    const scroll = $('.index-scroll', app);
    if (!scroll) return;
    const top = scroll.scrollTop;
    mount(scroll, indexTpl(indexState.selected, indexState.here));
    scroll.scrollTop = top;
  }

  // The stage's code, either general or written against the TRD (KACTL-based), as chosen.
  function templateTpl(stage) {
    const trdEntry = TRD_CODE[stage.id];
    const style = state.ui.codeStyle === 'trd' && trdEntry ? 'trd' : 'general';
    return html`
      <div class="template-head">
        <h3>Template</h3>
        ${trdEntry ? html`
          <div class="segmented" role="group" aria-label="Implementation">
            <button type="button" data-code-style="general" aria-pressed="${String(style === 'general')}">General</button>
            <button type="button" data-code-style="trd" aria-pressed="${String(style === 'trd')}">KACTL TRD</button>
          </div>` : ''}
      </div>
      ${style === 'trd' ? html`
        <p class="uses small">Uses
          ${trdEntry.uses.map((u) => html`<span class="chip ${u.from === 'kactl' ? 'kactl' : ''}" title="${u.from === 'kactl' ? 'From KACTL: not in your TRD' : 'In your TRD'}">${u.file}${u.from === 'kactl' ? ' (KACTL)' : ''}</span>`)}
          <a href="${TRD_REPO}" target="_blank" rel="noopener">Your TRD</a>
        </p>
        ${trdEntry.uses.some((u) => u.from === 'kactl') ? html`<p class="small faint">Files marked KACTL aren't in your TRD yet.</p>` : ''}` : ''}
      <pre class="code"><code>${highlightCpp((style === 'trd' ? trdEntry.code : stage.primer.code).trim())}</code></pre>`;
  }

  function primerTpl(stage) {
    const { primer } = stage;
    const visuals = STAGE_VISUALS[stage.id]?.() || [];
    return html`
      <section class="primer" aria-label="Primer">
        ${slidesTpl(`${stage.id}-how`, primer.slides, visuals)}
        ${primer.terms ? termsTpl(primer.terms) : ''}
        ${visuals.map((viz, i) => stepperTpl(`${stage.id}-${i}`, viz))}
        ${primer.worked ? html`<section class="cp-worked card" data-worked-for="${stage.id}" aria-label="Worked question">${workedTpl(stage)}</section>` : ''}
        ${videosTpl(stage.id)}
        <div class="primer-cols">
          <div><h3 data-read="primer">Reach for it when</h3><ul>${primer.spot.map((s) => html`<li data-read="primer">${rich(s)}</li>`)}</ul></div>
          <div><h3 data-read="primer">Common bugs</h3><ul>${primer.pitfalls.map((s) => html`<li data-read="primer">${rich(s)}</li>`)}</ul></div>
        </div>
        <div>
          <h3 data-read="primer">How it hides in a statement</h3>
          <ul class="disguises">${primer.disguises.map((s) => html`<li data-read="primer">${rich(s)}</li>`)}</ul>
        </div>
        <div class="template" data-template="${stage.id}">${templateTpl(stage)}</div>
        <div>
          <h3>Read more</h3>
          <div class="resources">${primer.resources.map((r) => html`<a href="${r.url}" target="_blank" rel="noopener">${r.label}</a>`)}</div>
        </div>
        ${sourcesTpl(STAGE_SOURCES[stage.id])}
      </section>`;
  }

  // A small question solved with the stage's technique, one step at a time so you can try each first.
  const workedShown = new Map(); // stage id → steps revealed
  function workedTpl(stage) {
    const { title, question, steps } = stage.primer.worked;
    const shown = workedShown.get(stage.id) || 0;
    return html`
      <h3 data-read="primer">Worked question: ${title}</h3>
      <p class="cp-worked-q" data-read="primer">${rich(question)}</p>
      <ol class="cp-steps" aria-live="polite">
        ${steps.slice(0, shown).map((s, i) => html`<li class="${i === steps.length - 1 ? 'final' : ''}" tabindex="-1" data-read="primer"><span>${rich(s)}</span></li>`)}
      </ol>
      ${shown < steps.length ? html`
        <div class="btn-row">
          <button class="btn btn-small" type="button" data-worked="next">${shown ? 'Next step' : 'Show the first step'}</button>
          <button class="text-btn small" type="button" data-worked="all">Show all steps</button>
        </div>` : ''}`;
  }

  // What the names in the walkthrough, code and diagram stand for, each written "name: meaning".
  function termsTpl(terms) {
    return html`
      <div class="terms">
        <h3 data-read="primer">Notation</h3>
        <dl>${terms.map((t) => {
          const at = t.indexOf(': ');
          // The colon is only for reading aloud, so the name and its meaning don't run together.
          return html`<div data-read="primer"><dt>${rich(t.slice(0, at))}<span class="visually-hidden">:</span></dt> <dd>${rich(t.slice(at + 2))}</dd></div>`;
        })}</dl>
      </div>`;
  }

  // Pages checked to contain what this stage teaches, each with what it backs. Folded away by default.
  function sourcesTpl(sources) {
    if (!sources?.length) return '';
    return html`
      <details class="sources">
        <summary><h3>Sources</h3><span class="sources-count">${sources.length}</span></summary>
        <p class="small faint">The primer, diagram and hints are written for autoprep. These pages cover the same material, and each was checked to contain what it's listed for.</p>
        <ol>${sources.map((s) => html`<li><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a><span>${s.supports}</span></li>`)}</ol>
      </details>`;
  }

  function problemsTpl(stage) {
    const next = nextProblem(stage, isSolved);
    const notes = { warmup: 'to get the idea working', core: 'the stage is complete once these are solved', challenge: 'optional, for when you want more' };
    return Object.entries(TIERS).map(([tier, label]) => {
      const problems = stage.problems.filter((p) => p.tier === tier);
      if (!problems.length) return '';
      return html`
        <div class="tier">
          <h3>${label} <small>${notes[tier]}</small></h3>
          <ul class="problem-list">
            ${problems.map((p) => problemRow({
              key: p.id,
              name: p.name,
              url: problemUrl(p.id),
              pid: p.id,
              label: html`<span class="rating band-${ratingBand(p.rating)}" title="Codeforces rating">${p.rating}</span>`,
              hints: p,
              isNext: next && next.id === p.id,
              open,
            }))}
          </ul>
        </div>`;
    });
  }

  function draw() {
    const here = new Set(TRACKS.map((t) => currentStage(t, isSolved, rating(), quizConfident)).filter(Boolean));
    const stage = stageById[stageId];
    // An unknown stage: show the overview of all three tracks instead.
    if (!stage) {
      location.replace('#/path');
      return;
    }
    const { track, index, of } = stagePosition(stage);
    const siblings = trackStages(track);
    const pos = siblings.indexOf(stage);
    const prev = siblings[pos - 1];
    const next = siblings[pos + 1];
    const progress = stageProgress(stage, isSolved);
    const below = !progress.complete && belowLevel(stage, rating());

    const indexOpen = state.ui.sidebarOpen;
    mount(app, html`
      <div class="path-page ${indexOpen ? 'with-index' : ''}">
      <div class="page-head">
        <h1>Codeforces path</h1>
        <p>Dynamic programming, graphs and geometry, in the order to learn them. Each stage starts with a primer, then problems that climb steadily in rating. If you get stuck, the hints walk you from a nudge to spotting the technique to the full approach.</p>
      </div>
      ${sync.tpl()}

        <article class="stage">
          <label class="visually-hidden" for="stage-picker">Stage</label>
          <select class="stage-picker" id="stage-picker">
            ${TRACKS.map((t) => html`<optgroup label="${t.title}">${trackStages(t).map((s) => html`<option value="${s.id}" ${s === stage ? 'selected' : ''}>${s.title}${here.has(s) ? ' (you are here)' : ''}</option>`)}</optgroup>`)}
          </select>

          <header class="stage-head">
            <span class="kicker"><a href="#/path">${track.title}</a>, stage ${index} of ${of}</span>
            <h2 data-read="primer">${stage.title}</h2>
            <p data-read="primer">${rich(stage.summary)}</p>
            ${listenButton('primer')}
            <div class="stage-status">
              <div class="meter"><span style="width:${(100 * progress.requiredSolved) / progress.required}%"></span></div>
              <span>${progress.complete ? 'Complete' : `${progress.requiredSolved} of ${progress.required} required problems solved`}</span>
              ${below ? html`<span class="faint">Below your rating. Skim the primer and move on, or use it for review.</span>` : ''}
            </div>
          </header>

          ${primerTpl(stage)}

          <section class="problems" aria-labelledby="problems-title">
            <h2 id="problems-title">Problems</h2>
            ${problemsTpl(stage)}
          </section>

          <nav class="stage-nav" aria-label="Neighbouring stages">
            ${prev ? html`<a href="#/path/${prev.id}">Previous: ${prev.title}</a>` : html`<span></span>`}
            ${next ? html`<a href="#/path/${next.id}">Next: ${next.title}</a>` : ''}
          </nav>
        </article>
      </div>

      <aside class="stage-index" id="stage-index" aria-label="Stages" ${indexOpen ? '' : 'hidden'}>
        <div class="index-head">
          <span>Stages</span>
          <button class="index-hide" type="button" data-index="hide" aria-controls="stage-index" aria-expanded="true">Hide</button>
        </div>
        <nav class="index-scroll" aria-label="All stages">${indexTpl(stage, here)}</nav>
      </aside>
      <button class="index-tab" type="button" data-index="show" aria-controls="stage-index" aria-expanded="false" ${indexOpen ? 'hidden' : ''}>Stages</button>`);
    sync.bind();
    $('#stage-picker', app).addEventListener('change', (e) => { location.hash = `#/path/${e.target.value}`; });
    $('.stage-index [aria-current="page"]', app)?.scrollIntoView({ block: 'nearest' });
    if (pendingJump) setTimeout(jumpToProblem, 0);
  }

  // Show or hide the floating stage list without re-rendering (so your place on the page stays put).
  app.addEventListener('click', (e) => {
    // Reveal worked steps in place, so the page doesn't jump.
    const reveal = e.target.closest('[data-worked]');
    if (reveal) {
      const holder = reveal.closest('[data-worked-for]');
      const stage = stageById[holder.dataset.workedFor];
      const total = stage.primer.worked.steps.length;
      const shown = reveal.dataset.worked === 'all' ? total : (workedShown.get(stage.id) || 0) + 1;
      workedShown.set(stage.id, shown);
      mount(holder, workedTpl(stage));
      (holder.querySelector('[data-worked="next"]') || holder.querySelector('.cp-steps li:last-child'))?.focus();
      return;
    }
    const codeStyle = e.target.closest('[data-code-style]');
    if (codeStyle) {
      // Swap just the code block so the page doesn't jump.
      state.ui.codeStyle = codeStyle.dataset.codeStyle;
      save();
      const holder = codeStyle.closest('[data-template]');
      mount(holder, templateTpl(stageById[holder.dataset.template]));
      holder.querySelector(`[data-code-style="${state.ui.codeStyle}"]`)?.focus();
      return;
    }
    const button = e.target.closest('[data-index]');
    if (!button) return;
    const show = button.dataset.index === 'show';
    state.ui.sidebarOpen = show;
    save();
    $('#stage-index', app).hidden = !show;
    $('.index-tab', app).hidden = show;
    $('.path-page', app).classList.toggle('with-index', show);
    $(show ? '.index-hide' : '.index-tab', app).focus();
  }, { signal: listeners.signal });

  bindHints(app, open, draw, listeners.signal);
  bindSolveBoxes(app, draw, listeners.signal);
  bindSteppers(app, listeners.signal);
  bindListen(app, listeners.signal);
  bindVideos(app, listeners.signal);

  app.addEventListener('click', (e) => {
    const track = e.target.closest('[data-toggle-track]');
    const stage = e.target.closest('[data-toggle-stage]');
    const jump = e.target.closest('[data-jump]');
    if (track) {
      const id = track.dataset.toggleTrack;
      const list = state.ui.closedTracks;
      state.ui.closedTracks = list.includes(id) ? list.filter((t) => t !== id) : [...list, id];
      save();
      redrawIndex();
      $(`[data-toggle-track="${id}"]`, app)?.focus();
    } else if (stage) {
      const id = stage.dataset.toggleStage;
      const s = stageById[id];
      const open = stageOpen(s);
      state.ui.openStages = open ? state.ui.openStages.filter((x) => x !== id) : [...state.ui.openStages, id];
      state.ui.closedStages = open ? [...new Set([...state.ui.closedStages, id])] : state.ui.closedStages.filter((x) => x !== id);
      save();
      redrawIndex();
      $(`[data-toggle-stage="${id}"]`, app)?.focus();
    } else if (jump) {
      // Same stage: just scroll. Another stage: navigate, then scroll once it has rendered.
      pendingJump = jump.dataset.jump;
      if (jump.getAttribute('href') === location.hash) {
        e.preventDefault();
        jumpToProblem();
      }
    }
  }, { signal: listeners.signal });
  draw();
  return () => {
    listeners.abort();
    sync.stop();
  };
}
