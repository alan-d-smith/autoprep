// Read aloud with the browser's own speech synthesis (no service, nothing leaves the device).
// A "Listen" button reads every element marked data-read="<group>" in page order, highlighting the
// paragraph being spoken. Notation is turned into words: dp[i][j] → "dp of i, j", 10^9 → "10 to the 9".

import { html } from './dom.js';
import { state, save } from './store.js';

export const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const synth = ttsSupported ? window.speechSynthesis : null;
export const RATES = [0.9, 1, 1.25, 1.5];

let voice = null;
function pickVoice() {
  const voices = synth.getVoices().filter((v) => /^en/i.test(v.lang));
  const score = (v) => (/en-GB/i.test(v.lang) ? 4 : /en-US/i.test(v.lang) ? 2 : 1) + (/natural|online|neural|google/i.test(v.name) ? 3 : 0);
  voice = voices.sort((a, b) => score(b) - score(a))[0] || null;
}
if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

// Notation to words, for algorithm text and mental-maths working alike.
export function speakable(s) {
  return s
    .replace(/`/g, '')
    .replace(/\bO\(((?:[^()]|\([^()]*\))*)\)/g, 'O of $1')
    .replace(/([A-Za-z_][\w']*)((?:\[[^\]]*\])+)/g, (_, name, idx) => `${name} of ${idx.slice(1, -1).split('][').join(', ')}`)
    .replace(/(\w|\))\^\(([^()]*)\)/g, '$1 to the $2')
    .replace(/(\w|\))\^(-?\w+)/g, '$1 to the $2')
    .replace(/\b([A-Za-z])_\{([^}]*)\}/g, '$1 $2')
    .replace(/\b([A-Za-z])_(\w+)/g, '$1 $2')
    .replace(/\|([^|\s][^|]*)\|/g, 'the size of $1')
    .replace(/(\w)\.\.(\w)/g, '$1 to $2')
    .replace(/²/g, ' squared').replace(/³/g, ' cubed')
    .replace(/≤/g, ' at most ').replace(/≥/g, ' at least ').replace(/≠/g, ' is not ')
    .replace(/ < /g, ' less than ').replace(/ > /g, ' greater than ')
    .replace(/−/g, ' minus ').replace(/[·×]/g, ' times ').replace(/÷/g, ' divided by ')
    .replace(/ \+ /g, ' plus ').replace(/ = /g, ' equals ')
    .replace(/→/g, ': that is, ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Visible text of an element, keeping exponents and subscripts readable.
function readText(el) {
  const copy = el.cloneNode(true);
  copy.querySelectorAll('sup').forEach((n) => n.replaceWith(`^(${n.textContent})`));
  copy.querySelectorAll('sub').forEach((n) => n.replaceWith(`_{${n.textContent}}`));
  copy.querySelectorAll('[data-skip-read]').forEach((n) => n.remove());
  return copy.textContent;
}

let active = null; // { button, marked }

export function stopSpeaking() {
  if (!synth) return;
  synth.cancel();
  if (active) {
    active.marked?.classList.remove('speaking');
    active.button.textContent = 'Listen';
    active.button.setAttribute('aria-pressed', 'false');
  }
  active = null;
}

function speakGroup(button, elements, retried = false) {
  const wasBusy = synth.speaking || synth.pending;
  stopSpeaking();
  // Chrome can swallow utterances queued in the same tick as cancel(), so give it a moment.
  if (wasBusy && !retried) {
    setTimeout(() => speakGroup(button, elements, true), 80);
    return;
  }
  const session = { button, marked: null };
  active = session;
  button.textContent = 'Stop';
  button.setAttribute('aria-pressed', 'true');
  const parts = elements.flatMap((el) => speakable(readText(el)).split(/(?<=[.!?:])\s+(?=[A-Z0-9])/).filter(Boolean).map((sentence) => ({ el, sentence })));
  parts.forEach(({ el, sentence }, i) => {
    const u = new SpeechSynthesisUtterance(sentence);
    if (voice) u.voice = voice;
    u.lang = voice?.lang || 'en-GB';
    u.rate = state.ui.ttsRate || 1;
    u.onstart = () => {
      if (active !== session) return;
      if (session.marked !== el) {
        session.marked?.classList.remove('speaking');
        el.classList.add('speaking');
        session.marked = el;
      }
    };
    u.onend = () => { if (i === parts.length - 1 && active === session) stopSpeaking(); };
    // A real failure (no voice, synthesis unavailable) shouldn't leave the button stuck on "Stop".
    u.onerror = (e) => { if (active === session && !['interrupted', 'canceled'].includes(e.error)) stopSpeaking(); };
    synth.speak(u);
  });
}

export function listenButton(group, label = 'Listen') {
  if (!ttsSupported) return '';
  return html`<span class="listen"><button class="btn btn-small" type="button" data-listen="${group}" aria-pressed="false">${label}</button><button class="btn btn-small rate" type="button" data-rate title="Reading speed">${state.ui.ttsRate || 1}×</button></span>`;
}

// Wires every Listen and speed button inside root.
export function bindListen(root, signal) {
  if (!ttsSupported) return;
  root.addEventListener('click', (e) => {
    const rate = e.target.closest('[data-rate]');
    if (rate) {
      const next = RATES[(RATES.indexOf(state.ui.ttsRate || 1) + 1) % RATES.length];
      state.ui.ttsRate = next;
      save();
      root.querySelectorAll('[data-rate]').forEach((b) => { b.textContent = `${next}×`; });
      return;
    }
    const button = e.target.closest('[data-listen]');
    if (!button) return;
    if (active?.button === button) return stopSpeaking();
    const group = button.dataset.listen;
    const elements = [...root.querySelectorAll('[data-read]')].filter((el) => el.dataset.read.split(' ').includes(group));
    if (elements.length) speakGroup(button, elements);
  }, { signal });
  signal.addEventListener('abort', stopSpeaking);
}
