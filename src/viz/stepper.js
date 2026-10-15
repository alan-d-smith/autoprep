// A diagram you can step through: a few frames, each a picture plus one caption, with Back, Next and Play.

import { html, raw } from '../dom.js';
import { rich, richHtml } from '../format.js';
import { PLAY_ICON, PAUSE_ICON } from '../icons.js';

const diagrams = new Map(); // id → { frames, index, timer }
const PLAY_MS = 1900;

export function stepperTpl(id, { title, frames }) {
  const old = diagrams.get(id);
  const index = old && old.frames.length === frames.length ? old.index : 0;
  if (old?.timer) clearInterval(old.timer);
  diagrams.set(id, { frames, index, timer: null });
  const frame = frames[index];
  return html`
    <figure class="viz" data-viz="${id}">
      <figcaption class="viz-title">${title}</figcaption>
      <div class="viz-frame">${raw(frame.svg)}</div>
      <p class="viz-caption" aria-live="polite">${rich(frame.caption)}</p>
      ${frames.length > 1 ? html`
        <div class="viz-controls">
          <button class="btn btn-small" type="button" data-viz-step="prev" ${index === 0 ? 'disabled' : ''}>Back</button>
          <span class="viz-count">${index + 1} / ${frames.length}</span>
          <button class="btn btn-small" type="button" data-viz-step="next" ${index === frames.length - 1 ? 'disabled' : ''}>Next</button>
          <button class="btn btn-small play-btn" type="button" data-viz-step="play" aria-label="${index === frames.length - 1 ? 'Replay' : 'Play'}" title="${index === frames.length - 1 ? 'Replay' : 'Play'}">${raw(PLAY_ICON)}</button>
        </div>` : ''}
    </figure>`;
}

function show(figure, d, index) {
  d.index = Math.max(0, Math.min(d.frames.length - 1, index));
  const frame = d.frames[d.index];
  figure.querySelector('.viz-frame').innerHTML = frame.svg;
  figure.querySelector('.viz-caption').innerHTML = richHtml(frame.caption);
  figure.querySelector('.viz-count').textContent = `${d.index + 1} / ${d.frames.length}`;
  figure.querySelector('[data-viz-step="prev"]').disabled = d.index === 0;
  figure.querySelector('[data-viz-step="next"]').disabled = d.index === d.frames.length - 1;
  if (!d.timer) setPlay(figure.querySelector('[data-viz-step="play"]'), d.index === d.frames.length - 1 ? 'Replay' : 'Play');
}

// The play button shows a green triangle (Play or Replay) or a pause icon while playing.
function setPlay(button, label) {
  if (!button) return;
  button.innerHTML = label === 'Pause' ? PAUSE_ICON : PLAY_ICON;
  button.setAttribute('aria-label', label);
  button.title = label;
}

function stop(figure, d) {
  clearInterval(d.timer);
  d.timer = null;
  setPlay(figure.querySelector('[data-viz-step="play"]'), d.index === d.frames.length - 1 ? 'Replay' : 'Play');
}

export function bindSteppers(root, signal) {
  root.addEventListener('click', (e) => {
    const button = e.target.closest('[data-viz-step]');
    if (!button) return;
    const figure = button.closest('[data-viz]');
    const d = diagrams.get(figure.dataset.viz);
    if (!d) return;
    const step = button.dataset.vizStep;
    if (step === 'play') {
      if (d.timer) return stop(figure, d);
      if (d.index === d.frames.length - 1) show(figure, d, 0);
      setPlay(button, 'Pause');
      d.timer = setInterval(() => {
        if (!figure.isConnected) return stop(figure, d);
        show(figure, d, d.index + 1);
        if (d.index === d.frames.length - 1) stop(figure, d);
      }, PLAY_MS);
      return;
    }
    stop(figure, d);
    show(figure, d, d.index + (step === 'next' ? 1 : -1));
  }, { signal });
  signal.addEventListener('abort', () => {
    for (const d of diagrams.values()) {
      clearInterval(d.timer);
      d.timer = null;
    }
  });
}
