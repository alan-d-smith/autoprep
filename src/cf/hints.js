// Progressive hints: a nudge, then the technique, then the approach, then a solution sketch.
// How far you've revealed is remembered per problem.

import { html } from '../dom.js';
import { state, save } from '../store.js';
import { rich } from '../format.js';
import { listenButton } from '../tts.js';

export const revealedCount = (key, hints) => Math.min(state.cf.hints[key] || 0, hints.length + 1);

export function hintToggle(key, hints, open) {
  const shown = revealedCount(key, hints);
  const label = shown === 0 ? 'Hints' : shown > hints.length ? 'Solution' : `Hint ${shown} of ${hints.length}`;
  return html`<button class="hint-toggle" type="button" data-hints="${key}" aria-expanded="${String(open)}" aria-controls="hints-${key}">${label}</button>`;
}

export function hintPanel(key, { hints, solution }, open) {
  if (!open) return '';
  const shown = revealedCount(key, hints);
  const next = shown < hints.length ? `Show hint ${shown + 1}` : shown === hints.length ? 'Show the solution sketch' : null;
  return html`
    <div class="hints" id="hints-${key}">
      ${shown ? html`
        <dl>
          ${hints.slice(0, shown).map((h, i) => html`<div class="hint"><dt>Hint ${i + 1}</dt><dd data-read="hints-${key}">${rich(h)}</dd></div>`)}
          ${shown > hints.length ? html`<div class="hint solution"><dt>Solution</dt><dd data-read="hints-${key}">${rich(solution)}</dd></div>` : ''}
        </dl>` : html`<p class="small muted">Each hint gives away a little more: first a nudge, then the technique, then how to solve it.</p>`}
      <div class="btn-row">
        ${next ? html`<button class="btn" type="button" data-reveal="${key}">${next}</button>` : ''}
        ${shown ? listenButton(`hints-${key}`) : ''}
      </div>
    </div>`;
}

// Wires hint toggles and reveal buttons inside `root`. `redraw` re-renders the view.
export function bindHints(root, open, redraw, signal) {
  root.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-hints]');
    const reveal = e.target.closest('[data-reveal]');
    if (toggle) {
      const key = toggle.dataset.hints;
      if (open.has(key)) open.delete(key);
      else open.add(key);
      redraw();
      root.querySelector(`[data-hints="${key}"]`)?.focus();
    } else if (reveal) {
      const key = reveal.dataset.reveal;
      state.cf.hints[key] = (state.cf.hints[key] || 0) + 1;
      save();
      redraw();
      (root.querySelector(`[data-reveal="${key}"]`) || root.querySelector(`[data-hints="${key}"]`))?.focus();
    }
  }, { signal });
}
