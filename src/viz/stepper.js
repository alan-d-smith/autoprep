// A diagram you can step through: frames, each a picture plus one caption, with Back, Next, Play,
// a slider to jump to any step, a playback speed and a mute button. Left and right arrow keys step too.
// Unless muted, each step's caption is read aloud as it's shown, and Play waits for the voice before
// moving on.

import { html, raw } from '../dom.js';
import { rich, richHtml } from '../format.js';
import { PLAY_ICON, PAUSE_ICON, SPEAKER_ICON, MUTED_ICON } from '../icons.js';
import { state, save } from '../store.js';
import { ttsSupported, narrate, stopNarration, readingAloud, applyRate } from '../tts.js';

const diagrams = new Map(); // id → { frames, index, run, timer, wake }
const SPEEDS = [0.5, 1, 2];
const speed = () => state.ui.vizSpeed || 1;
const narrated = () => ttsSupported && !state.ui.vizMuted;

// Without narration, long captions stay up longer, so there's time to read them.
const holdFor = (caption) => Math.min(4200, Math.max(1100, 700 + caption.length * 20)) / speed();
// With it, a short pause once the voice has finished.
const PAUSE = 450;

const muteLabel = () => (state.ui.vizMuted ? 'Unmute narration' : 'Mute narration');

export function stepperTpl(id, { title, frames }) {
  const old = diagrams.get(id);
  const index = old && old.frames.length === frames.length ? old.index : 0;
  if (old) halt(old);
  diagrams.set(id, { frames, index, run: null, timer: null, wake: null });
  const frame = frames[index];
  const last = frames.length - 1;
  return html`
    <figure class="viz" data-viz="${id}">
      <figcaption class="viz-title">${title}</figcaption>
      <div class="viz-frame">${raw(frame.svg)}</div>
      <p class="viz-caption" aria-live="polite">${rich(frame.caption)}</p>
      ${frames.length > 1 ? html`
        <div class="viz-controls">
          <button class="btn btn-small" type="button" data-viz-step="prev" ${index === 0 ? 'disabled' : ''}>Back</button>
          <button class="btn btn-small" type="button" data-viz-step="next" ${index === last ? 'disabled' : ''}>Next</button>
          <button class="btn btn-small play-btn" type="button" data-viz-step="play" aria-label="${index === last ? 'Replay' : 'Play'}" title="${index === last ? 'Replay' : 'Play'}">${raw(PLAY_ICON)}</button>
          <input class="viz-scrub" type="range" min="1" max="${frames.length}" value="${index + 1}" aria-label="Step" data-viz-scrub>
          <span class="viz-count">${index + 1} / ${frames.length}</span>
          <button class="btn btn-small viz-speed" type="button" data-viz-speed title="Playback speed">${speed()}×</button>
          ${ttsSupported ? html`<button class="btn btn-small viz-mute" type="button" data-viz-mute aria-label="Mute narration" aria-pressed="${String(state.ui.vizMuted)}" title="${muteLabel()}">${raw(state.ui.vizMuted ? MUTED_ICON : SPEAKER_ICON)}</button>` : ''}
        </div>` : ''}
    </figure>`;
}

function show(figure, d, index) {
  d.index = Math.max(0, Math.min(d.frames.length - 1, index));
  const frame = d.frames[d.index];
  figure.querySelector('.viz-frame').innerHTML = frame.svg;
  figure.querySelector('.viz-caption').innerHTML = richHtml(frame.caption);
  figure.querySelector('.viz-count').textContent = `${d.index + 1} / ${d.frames.length}`;
  figure.querySelector('[data-viz-scrub]').value = d.index + 1;
  figure.querySelector('[data-viz-step="prev"]').disabled = d.index === 0;
  figure.querySelector('[data-viz-step="next"]').disabled = d.index === d.frames.length - 1;
  if (!d.run) setPlay(figure.querySelector('[data-viz-step="play"]'), d.index === d.frames.length - 1 ? 'Replay' : 'Play');
}

// The play button shows a green triangle (Play or Replay) or a pause icon while playing.
function setPlay(button, label) {
  if (!button) return;
  button.innerHTML = label === 'Pause' ? PAUSE_ICON : PLAY_ICON;
  button.setAttribute('aria-label', label);
  button.title = label;
}

// Ends playback without touching the page (the diagram may already be gone).
function halt(d) {
  d.run = null;
  clearTimeout(d.timer);
  d.wake?.();
  d.wake = null;
}

function stop(figure, d) {
  halt(d);
  stopNarration(figure);
  setPlay(figure.querySelector('[data-viz-step="play"]'), d.index === d.frames.length - 1 ? 'Replay' : 'Play');
}

const wait = (d, ms) => new Promise((resolve) => {
  d.wake = resolve;
  d.timer = setTimeout(resolve, ms);
});

// Keeps the current step up for as long as it needs: until its caption has been read, or for a while.
async function dwell(figure, d, run) {
  const caption = d.frames[d.index].caption;
  if (!narrated()) return wait(d, holdFor(caption));
  const started = Date.now();
  const read = await narrate(figure.querySelector('.viz-caption'), figure);
  if (d.run !== run) return;
  // Even if the voice ended at once (nothing could speak), give the step a moment.
  if (read) return wait(d, Math.max(PAUSE, 900 - (Date.now() - started)) / speed());
  // Muted part-way through a step: carry on silently. Otherwise a Listen button took over, so pause.
  if (!narrated()) return wait(d, holdFor(caption));
  stop(figure, d);
}

async function play(figure, d) {
  if (d.index === d.frames.length - 1) show(figure, d, 0);
  const run = (d.run = {});
  setPlay(figure.querySelector('[data-viz-step="play"]'), 'Pause');
  while (d.run === run) {
    await dwell(figure, d, run);
    if (d.run !== run) return;
    if (!figure.isConnected) return halt(d);
    if (d.index === d.frames.length - 1) return stop(figure, d);
    show(figure, d, d.index + 1);
  }
}

// Reads the step just shown by hand, unless the page itself is being read aloud.
function say(figure) {
  if (narrated() && !readingAloud()) narrate(figure.querySelector('.viz-caption'), figure);
}

export function bindSteppers(root, signal) {
  const find = (el) => {
    const figure = el.closest('[data-viz]');
    return figure ? [figure, diagrams.get(figure.dataset.viz)] : [];
  };
  const step = (figure, d, index) => {
    stop(figure, d);
    const before = d.index;
    show(figure, d, index);
    if (d.index !== before) say(figure);
  };
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-viz-speed]')) {
      state.ui.vizSpeed = SPEEDS[(SPEEDS.indexOf(speed()) + 1) % SPEEDS.length];
      save();
      root.querySelectorAll('[data-viz-speed]').forEach((b) => { b.textContent = `${speed()}×`; });
      applyRate();
      return;
    }
    const mute = e.target.closest('[data-viz-mute]');
    if (mute) {
      state.ui.vizMuted = !state.ui.vizMuted;
      save();
      root.querySelectorAll('[data-viz-mute]').forEach((b) => {
        b.setAttribute('aria-pressed', String(state.ui.vizMuted));
        b.title = muteLabel();
        b.innerHTML = state.ui.vizMuted ? MUTED_ICON : SPEAKER_ICON;
      });
      if (state.ui.vizMuted) return stopNarration();
      // Unmuting a diagram that isn't playing reads its current step; a playing one speaks from its next.
      const [figure, d] = find(mute);
      if (d && !d.run) say(figure);
      return;
    }
    const button = e.target.closest('[data-viz-step]');
    if (!button) return;
    const [figure, d] = find(button);
    if (!d) return;
    const which = button.dataset.vizStep;
    if (which === 'play') return d.run ? stop(figure, d) : play(figure, d);
    step(figure, d, d.index + (which === 'next' ? 1 : -1));
  }, { signal });
  // Dragging the slider shows each step at once but only reads the one it settles on.
  let settle = 0;
  root.addEventListener('input', (e) => {
    if (!e.target.matches('[data-viz-scrub]')) return;
    const [figure, d] = find(e.target);
    if (!d) return;
    stop(figure, d);
    show(figure, d, Number(e.target.value) - 1);
    clearTimeout(settle);
    settle = setTimeout(() => { if (figure.isConnected && !d.run) say(figure); }, 350);
  }, { signal });
  root.addEventListener('keydown', (e) => {
    if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.target.matches('[data-viz-scrub]') || !e.target.closest('.viz-controls')) return;
    const [figure, d] = find(e.target);
    if (!d) return;
    e.preventDefault();
    step(figure, d, d.index + (e.key === 'ArrowRight' ? 1 : -1));
  }, { signal });
  signal.addEventListener('abort', () => {
    clearTimeout(settle);
    for (const d of diagrams.values()) halt(d);
  });
}
