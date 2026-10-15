// Read aloud. A "Listen" button reads every element marked data-read="<group>" in page order,
// highlighting the paragraph being spoken; clicking another paragraph meanwhile jumps to it. Diagrams
// narrate their steps through narrate(). Notation is turned into words: dp[i][j] → "dp of i, j", 10^9 → "10 to the 9".
//
// Where the words come from, best first:
// 1. Pre-recorded clips in the natural voice Heart (audio/af_heart, built by scripts/build_audio.py),
//    for every paragraph that's part of the site. They play at once on any device.
// 2. Kokoro, the neural model behind those clips, run on the graphics card (tts-worker.js). It's only
//    used once you choose to download it (330 MB): for the other natural voices, and for text that
//    isn't pre-recorded, such as a new worked example.
// 3. The browser's own speech synthesis, for everything else or a browser voice picked under Voice.
// The first two send nothing anywhere. Some browsers' online voices (Edge's natural voices, Chrome's
// Google voices) are made on their maker's servers.

import { html, mount, toast } from './dom.js';
import { state, save, storageConsent } from './store.js';
import { clipKey } from './audio-key.js';

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? window.speechSynthesis : null;
const hasAudio = typeof Audio !== 'undefined';
const mayHaveGpu = typeof navigator !== 'undefined' && 'gpu' in navigator && typeof Worker !== 'undefined';
export const ttsSupported = Boolean(synth) || hasAudio;

export const RATE_MIN = 0.25;
export const RATE_MAX = 1.75;
const rate = () => state.ui.ttsRate || 1;
const rateLabel = (r) => `${Number(r.toFixed(2))}×`;

// Kokoro's best-rated voices (its own grades run A for Heart down to C for George). Heart is the one
// that's pre-recorded.
export const RECORDED_VOICE = 'af_heart';
export const NATURAL_VOICES = [
  { id: 'af_heart', name: 'Heart', accent: 'American' },
  { id: 'af_bella', name: 'Bella', accent: 'American' },
  { id: 'bf_emma', name: 'Emma', accent: 'British' },
  { id: 'am_michael', name: 'Michael', accent: 'American' },
  { id: 'bm_george', name: 'George', accent: 'British' },
];
const MODEL_MB = 330;
export const SAMPLE = 'This is how I sound reading your notes.';

// ---------- Choosing a voice ----------

let gpuCheck = null;
const gpuAvailable = () => (gpuCheck ??= mayHaveGpu ? navigator.gpu.requestAdapter().then((a) => Boolean(a), () => false) : Promise.resolve(false));
let modelBroken = false; // the model failed to load or run on this visit

const ACCENTS = { GB: 'British', US: 'American', AU: 'Australian', IN: 'Indian', IE: 'Irish', CA: 'Canadian', NZ: 'New Zealand', ZA: 'South African' };
const browserVoices = () => (synth ? synth.getVoices().filter((v) => /^en/i.test(v.lang)) : []);
const voiceLabel = (v) => v.name.replace(/^Microsoft\s+/, '').replace(/\s+-\s+.*$/, '').replace(/\s+Online \(Natural\)$/, ' (natural)');
const voiceAccent = (v) => ACCENTS[v.lang.split(/[-_]/)[1]?.toUpperCase()] || v.lang;

// Without a choice: Edge's online natural voices, then Google's, then British English.
function bestBrowserVoice(uri) {
  const voices = browserVoices();
  const chosen = uri && voices.find((v) => v.voiceURI === uri);
  if (chosen) return chosen;
  const score = (v) => (/en-GB/i.test(v.lang) ? 4 : /en-US/i.test(v.lang) ? 2 : 1) + (/natural|neural|online/i.test(v.name) ? 6 : /google/i.test(v.name) ? 3 : 0);
  return voices.sort((a, b) => score(b) - score(a))[0] || null;
}

// What the current setting asks for: a natural voice id, or a browser voice.
function chosenVoice(pick = state.ui.ttsVoice || 'auto') {
  if (pick.startsWith('browser:') || !hasAudio) return { natural: null, browser: bestBrowserVoice(pick.slice(8)) };
  const id = pick.slice(8);
  return { natural: NATURAL_VOICES.some((v) => v.id === id) ? id : RECORDED_VOICE, browser: bestBrowserVoice(null) };
}

// ---------- Pre-recorded clips ----------

// The index of recorded clips, re-read now and then so a long visit sees newly added recordings.
let recorded = null; // Promise<Set of clip keys>
let recordedAt = 0;
function recordedKeys() {
  if (!recorded || Date.now() - recordedAt > 30000) {
    recordedAt = Date.now();
    recorded = fetch(`audio/${RECORDED_VOICE}/index.json`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : { clips: [] }))
      .then((j) => new Set(j.clips), () => new Set());
  }
  return recorded;
}
const clipUrl = (key) => `audio/${RECORDED_VOICE}/${key}.webm`;

// Fetched clips as object URLs, so the next paragraph is already here when this one ends.
const fetched = new Map();
function fetchClip(url) {
  let p = fetched.get(url);
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${r.status} for ${url}`);
      return r.blob();
    }).then((b) => URL.createObjectURL(b));
    p.catch(() => fetched.delete(url));
    fetched.set(url, p);
    while (fetched.size > 40) {
      const [oldest, op] = fetched.entries().next().value;
      fetched.delete(oldest);
      op.then((u) => URL.revokeObjectURL(u), () => {});
    }
  }
  return p;
}

// ---------- The in-browser model (opt-in) ----------

let worker = null;
let ready = false;
let requestId = 0;
const waiting = new Map(); // request id → { resolve, reject }

function failModel(message) {
  modelBroken = true;
  ready = false;
  for (const w of waiting.values()) w.reject(new Error(message));
  waiting.clear();
  worker?.terminate();
  worker = null;
  console.warn('Natural voice model unavailable:', message);
}

function startWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./tts-worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = ({ data }) => {
    if (data.type === 'progress') {
      if (active && !ready) setButton(active.button, 'loading', data.total ? data.loaded / data.total : null);
    } else if (data.type === 'ready') {
      ready = true;
      if (!state.ui.naturalReady) {
        state.ui.naturalReady = true;
        save();
      }
    } else if (data.id === undefined) {
      if (data.type === 'error') failModel(data.message);
    } else {
      const w = waiting.get(data.id);
      if (!w) return;
      waiting.delete(data.id);
      if (data.type === 'audio') w.resolve(data);
      else w.reject(new Error(data.message || 'skipped'));
    }
  };
  // A failed import of the model code (offline, CDN blocked) lands here.
  worker.onerror = (e) => {
    e.preventDefault?.();
    failModel(e.message || 'the speech worker failed to start');
  };
  worker.postMessage({ type: 'load', cache: storageConsent() === 'granted' });
  return worker;
}

// 16-bit WAV, so generated speech plays through the same <audio> element as the recordings.
function wavUrl(samples, sampleRate) {
  const n = samples.length;
  const view = new DataView(new ArrayBuffer(44 + n * 2));
  const ascii = (at, s) => { for (let i = 0; i < s.length; i++) view.setUint8(at + i, s.charCodeAt(i)); };
  ascii(0, 'RIFF'); view.setUint32(4, 36 + n * 2, true); ascii(8, 'WAVE'); ascii(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  ascii(36, 'data'); view.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true);
  return URL.createObjectURL(new Blob([view.buffer], { type: 'audio/wav' }));
}

// Recently generated sentences, so reading something again starts at once.
const generated = new Map();
function generate(text, voice, session) {
  const key = `${voice}|${text}`;
  const hit = generated.get(key);
  if (hit) return hit;
  const id = ++requestId;
  const job = new Promise((resolve, reject) => {
    waiting.set(id, { resolve, reject });
    startWorker().postMessage({ type: 'speak', id, session, text, voice, speed: 1 });
  }).then(({ samples, rate: sampleRate }) => {
    // A GPU that returns NaNs or silence would otherwise just play nothing.
    let sum = 0;
    for (let i = 0; i < samples.length; i += 8) sum += samples[i] * samples[i];
    const rms = Math.sqrt(sum / Math.max(1, samples.length / 8));
    if (!(rms > 1e-4)) throw new Error(`the model produced ${Number.isNaN(rms) ? 'NaN' : 'silent'} audio`);
    return wavUrl(samples, sampleRate);
  });
  job.catch(() => generated.delete(key));
  generated.set(key, job);
  while (generated.size > 60) {
    const [oldest, op] = generated.entries().next().value;
    generated.delete(oldest);
    op.then((u) => URL.revokeObjectURL(u), () => {});
  }
  return job;
}

// ---------- Text ----------

// Notation to words, for algorithm text and mental-maths working alike. The recordings are keyed by
// the result, so changing this means re-recording (see README).
//
// Two touches make it sound spoken rather than read out: a chain of equals signs says what each step
// gives ("P of 7 is P of 6 plus A of 6, which is 23 plus 2, so 25"), and a variable called a is
// capitalised, so it isn't heard as the article. Kokoro still takes a capital A for the article in some
// places ("A plus b"), so the recording script writes that A as "eh", which it always says as the
// letter. (Its [A](/ˈA/) phoneme syntax drifts onto the wrong word in some paragraphs.)

const LETTER = ''; // before a name that's the letter A
const LIST = ''; // a comma between indices, which doesn't end a clause
const letterA = (name) => (/^a$/i.test(name) ? `${LETTER}A` : name);
// Words that can follow a variable but never the article "a".
const AFTER_NAME = /^(?:of|plus|minus|times|over|equals|is|to|and|or|less|greater|at|mod|xor|shifted|from|sub|up)(?![\w-])/;

// x = y = z = 25 → "x is y, which is z, so 25". A chain is one clause: punctuation (but not an index
// list's commas or the point in 0.7) and linking words like "iff" or "when" end it, and whatever is in
// brackets is a clause of its own. "so" only introduces a final number; otherwise it's "which is".
const CLAUSE_WORD = /^ (?:iff|if|when|whenever|and|or|but|while|so|then|since|because|unless|where|until) /;
const RESULT = /^\s*(?:minus )?(?:\d|infinity\b)/;
function equalities(s) {
  const chain = (clause) => clause.split(' equals ').reduce((acc, part, k, all) =>
    (k === 0 ? part : `${acc}${k === 1 ? ' is ' : k < all.length - 1 || !RESULT.test(part) ? ', which is ' : ', so '}${part}`));
  let i = 0;
  const level = () => {
    let out = '';
    let clause = '';
    const flush = () => {
      out += chain(clause);
      clause = '';
    };
    while (i < s.length && s[i] !== ')') {
      const c = s[i];
      if (c === '(') {
        i++;
        clause += `(${level()}${s[i] === ')' ? ')' : ''}`;
        i++;
        continue;
      }
      if (c === ' ' && CLAUSE_WORD.test(s.slice(i, i + 12))) flush();
      clause += c;
      i++;
      if (/[,;:!?]/.test(c) || (c === '.' && !/\d/.test(s[i] || ''))) flush();
    }
    flush();
    return out;
  };
  let out = level();
  while (i < s.length) { // a stray ")"
    i++;
    out += `)${level()}`;
  }
  return out;
}

function spoken(s) {
  const span = (end) => (end === ')' ? 'up to' : 'to');
  const words = s
    .replace(/`/g, '')
    .replace(/⌊([^⌋]*)⌋/g, 'floor of $1').replace(/⌈([^⌉]*)⌉/g, 'ceiling of $1')
    .replace(/\bO\(((?:[^()]|\([^()]*\))*)\)/g, 'O of $1')
    // A point's coordinates: a.x → "A x".
    .replace(/\b([A-Za-z])\.([xyz])\b/g, (_, name, field) => `${letterA(name)} ${field}`)
    // a[l..r) is a slice, a[i][j] an index, [l, r] an interval.
    .replace(/([A-Za-z_][\w']*)\[([^[\]]*?)\.\.([^[\]]*?)([)\]])/g, (_, name, a, b, end) => `${letterA(name)} from ${a} ${span(end)} ${b}`)
    .replace(/([A-Za-z_][\w']*)((?:\[[^\]]*\])+)/g, (_, name, idx) => `${letterA(name)} of ${idx.slice(1, -1).split('][').join(', ').replace(/,/g, LIST)}`)
    .replace(/\[([^[\],]+),\s*([^[\],]+)([)\]])/g, (_, a, b, end) => `${a} ${span(end)} ${b}`)
    .replace(/(\w|\))\^\(([^()]*)\)/g, '$1 to the $2')
    .replace(/(\w|\))\^(-?\w+)/g, '$1 to the $2')
    .replace(/ \^ /g, ' xor ')
    .replace(/(\w)_\{([^}]*)\}/g, (_, name, sub, at, all) => `${at > 0 && /\w/.test(all[at - 1]) ? name : letterA(name)} ${sub}`)
    .replace(/\b([A-Za-z])_(\w+)/g, (_, name, sub) => `${letterA(name)} ${sub}`)
    .replace(/(\w)_(?=\w)/g, '$1 ')
    .replace(/\{([^{}]*)\}/g, '$1')
    .replace(/\|\||&&/g, (op) => (op === '||' ? ' or ' : ' and '))
    .replace(/\|=/g, ' or-equals ').replace(/&=/g, ' and-equals ').replace(/ \| /g, ' or ').replace(/ & /g, ' and ')
    .replace(/\|([^|\s][^|]*)\|/g, 'the size of $1')
    .replace(/\b1\s*<<\s*(\w+)/g, '2 to the $1')
    .replace(/\s*<<\s*/g, ' shifted left by ').replace(/\s*>>\s*/g, ' shifted right by ')
    .replace(/\s*%\s*/g, ' mod ')
    .replace(/\+\+/g, ' plus plus ').replace(/\+=/g, ' plus-equals ').replace(/[-−]=/g, ' minus-equals ')
    .replace(/==/g, ' equals ').replace(/!=/g, ' is not ').replace(/<=/g, ' at most ').replace(/>=/g, ' at least ')
    // C++ types: map<int, int> → "map of int, int"; then a bare j<i is a comparison.
    .replace(/\b([A-Za-z_]\w*)<([\w:, ]{0,24})>/g, (_, name, inner) => (inner ? `${name} of ${inner}` : name))
    .replace(/(\w)\s*<\s*(?=\w)/g, '$1 less than ').replace(/(\w)\s*>\s*(?=\w)/g, '$1 greater than ')
    .replace(/\b0\/1\b/g, 'zero-one')
    .replace(/([\w)²]+)\s*\/\s*(?=\d|\(|[a-z]\b)/g, '$1 over ')
    .replace(/(\w)\.\.(?\w)/g, '$1 to $2').replace(/(\w)\s*\.\.\s+(?=\w)/g, '$1 to ')
    .replace(/²/g, ' squared').replace(/³/g, ' cubed')
    .replace(/≤/g, ' at most ').replace(/≥/g, ' at least ').replace(/≠/g, ' is not ')
    .replace(/ < /g, ' less than ').replace(/ > /g, ' greater than ')
    .replace(/−/g, ' minus ').replace(/[·×]/g, ' times ').replace(/÷/g, ' divided by ')
    .replace(/(\w)\+(?=\w)/g, '$1 plus ')
    .replace(/ \+ /g, ' plus ').replace(/ = /g, ' equals ')
    .replace(/∞/g, 'infinity').replace(/≈/g, 'about').replace(/√/g, 'square root of ').replace(/[Σ∑]/g, 'sum of ')
    .replace(/(\w)\*/g, '$1 star')
    // Short names joined by arrows or dashes are edges, paths and ranges: S → A → T, 1–2, 60–100. An
    // arrow after a number is a step in some working: 0.7 × 64 → 7 × 64.
    .replace(/\b(\w{1,2}) → (?=(\w{1,2}\b|…))/g, (_, a, b) => (/^\d+$/.test(a) && !/[A-Za-z]/.test(b) ? `${a}, then ` : `${a} to `))
    .replace(/\b(\w{1,3})–(?=\w{1,3}\b)/g, '$1 to ')
    .replace(/(\d) → /g, '$1, then ')
    .replace(/→/g, ': that is, ')
    .replace(/log₂\s*\(([^()]*)\)/g, 'log base 2 of $1').replace(/log₂\s*/g, 'log base 2 of ')
    .replace(/(\w)…(\w)/g, '$1 … $2')
    .replace(/\bvs\.?(?=\s)/g, 'versus')
    .replace(/[[\]{}]/g, ' ')
    .replace(/\s+([,.;:!?)])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  // Any other a (or A) followed by something only a variable can be followed by is the letter.
  const named = words.replace(/(^|[^\w'])[aA](?=$|[,.;:!?)']|\s(\S+))/g, (m, before, next) => (next === undefined || AFTER_NAME.test(next) ? `${before}${LETTER}A` : m));
  return equalities(named).replace(//g, ',');
}

// The words the site reads, and the script the recordings were made from (scripts/build_audio.py).
export const speakable = (s) => spoken(s).replace(//g, '');
const script = (words) => words.replace(/A/g, 'eh');
export const recordingScript = (s) => script(spoken(s));

// Visible text of an element, keeping exponents and subscripts readable.
function readText(el) {
  const copy = el.cloneNode(true);
  copy.querySelectorAll('sup').forEach((n) => n.replaceWith(`^(${n.textContent})`));
  copy.querySelectorAll('sub').forEach((n) => n.replaceWith(`_{${n.textContent}}`));
  copy.querySelectorAll('[data-skip-read]').forEach((n) => n.remove());
  return copy.textContent;
}

// What each element will be read as, and the script its recording is made from. scripts/audio-texts.js
// uses this too, so recordings match.
export const readingParts = (elements) => elements.map((el) => {
  const words = spoken(readText(el));
  return { el, text: words.replace(//g, ''), script: script(words) };
}).filter((p) => p.text);
// A recording is keyed by its script, so changing how something is pronounced re-records it too.
const partKey = (part) => clipKey(RECORDED_VOICE, part.script ?? part.text);
const sentences = (text) => text.split(/(?<=[.!?:])\s+(?=[A-Z0-9])/).filter(Boolean);

// ---------- Playing ----------

let player = null; // one <audio> element for recordings and generated speech alike
let active = null; // { button, owner, parts, marked, stop, session, jump }
let sessionCount = 0;

// A diagram's narration also follows its own speed button.
const sessionRate = (session) => (session?.owner ? Math.min(2, Math.max(RATE_MIN, rate() * (state.ui.vizSpeed || 1))) : rate());
// This session was stopped, replaced, or told to jump elsewhere: whatever was about to play shouldn't.
const stale = (session) => active !== session || session.jump != null;

// Applies a changed speed to whatever is playing now (the browser voice picks it up from its next sentence).
export function applyRate() {
  if (player && !player.paused && active) player.playbackRate = sessionRate(active);
}

function setButton(button, mode, fraction) {
  if (!button) return;
  button.setAttribute('aria-pressed', String(mode !== 'idle'));
  button.toggleAttribute('aria-busy', mode === 'loading');
  button.textContent = mode === 'idle' ? 'Listen' : mode === 'speaking' ? 'Stop' : fraction != null && fraction < 1 ? `Voice ${Math.floor(fraction * 100)}%` : 'Starting…';
}

function mark(session, el) {
  if (session.marked === el) return;
  session.marked?.classList.remove('speaking');
  el?.classList.add('speaking');
  session.marked = el;
}

export function stopSpeaking() {
  const s = active;
  active = null;
  synth?.cancel();
  if (!s) return;
  s.marked?.classList.remove('speaking');
  if (!s.owner) s.parts.forEach((p) => p.el?.classList.remove('read-part'));
  s.stop?.();
  worker?.postMessage({ type: 'cancel', session: s.session });
  for (const [id, w] of waiting) {
    w.reject(new Error('stopped'));
    waiting.delete(id);
  }
  setButton(s.button, 'idle');
}

function playUrl(session, url) {
  return new Promise((resolve) => {
    const done = () => {
      player.onended = player.onerror = null;
      session.stop = null;
      resolve();
    };
    player.onended = done;
    player.onerror = done;
    session.stop = () => { player.pause(); done(); };
    player.src = url;
    // Loading a source resets the speed, so set it afterwards. Keeping the pitch is the default.
    player.defaultPlaybackRate = player.playbackRate = sessionRate(session);
    player.play().then(() => { if (active === session) setButton(session.button, 'speaking'); }, (e) => {
      console.warn('Playback failed:', e);
      done();
    });
  });
}

function speakBrowser(session, text, voice) {
  return new Promise((resolve) => {
    const parts = sentences(text);
    if (!synth || !parts.length) return resolve();
    setButton(session.button, 'speaking');
    session.stop = () => { synth.cancel(); resolve(); };
    parts.forEach((sentence, i) => {
      const u = new SpeechSynthesisUtterance(sentence);
      if (voice) u.voice = voice;
      u.lang = voice?.lang || 'en-GB';
      u.rate = sessionRate(session);
      u.onend = () => { if (i === parts.length - 1) resolve(); };
      // A real failure (no voice, synthesis unavailable) shouldn't leave the button stuck on "Stop".
      u.onerror = () => resolve();
      synth.speak(u);
    });
  });
}

// Reads one paragraph with the best source available for it.
async function readPart(session, part, voice, keys, next) {
  if (voice.natural === RECORDED_VOICE && keys.has(partKey(part))) {
    const url = await fetchClip(clipUrl(partKey(part))).catch(() => null);
    if (next && keys.has(partKey(next))) fetchClip(clipUrl(partKey(next))).catch(() => {});
    if (stale(session)) return;
    mark(session, part.el);
    if (url) return playUrl(session, url);
  }
  const useModel = voice.natural && state.ui.naturalModel && !modelBroken && hasAudio && (await gpuAvailable());
  if (useModel) {
    const jobs = sentences(part.text).map((s) => generate(s, voice.natural, session.session));
    jobs.forEach((j) => j.catch(() => {}));
    for (let i = 0; i < jobs.length; i++) {
      let url;
      try {
        url = await jobs[i];
      } catch (e) {
        if (stale(session)) return;
        failModel(e.message);
        toast("The natural voice couldn't run here, so this uses the browser's voice.", 5000);
        return speakBrowser(session, sentences(part.text).slice(i).join(' '), voice.browser);
      }
      if (stale(session)) return;
      mark(session, part.el);
      await playUrl(session, url);
      if (stale(session)) return;
    }
    return;
  }
  if (stale(session)) return;
  if (voice.natural) explainFallback(voice.natural);
  mark(session, part.el);
  return speakBrowser(session, part.text, voice.browser);
}

// A natural voice was chosen but this text has no recording and the model isn't downloaded, so the
// browser's voice reads it. Say so (once per page) rather than silently switching voices.
let explained = false;
function explainFallback(id) {
  if (explained) return;
  explained = true;
  const name = NATURAL_VOICES.find((v) => v.id === id)?.name || 'Heart';
  toast(`This part isn't recorded in ${name}'s voice, so your browser's voice reads it.${state.ui.naturalModel ? '' : ' To hear it in ' + name + ', download the voice model under Voice.'}`, 6000);
}

// Reads parts in order. Resolves true once all of them have been read, false if reading was stopped or
// something else started reading. owner marks a diagram's narration rather than a Listen button.
async function speak(button, parts, pick, owner = null) {
  const wasBusy = synth && (synth.speaking || synth.pending);
  stopSpeaking();
  if (!parts.length) return true;
  const session = { button, owner, parts, marked: null, stop: null, session: ++sessionCount, jump: null };
  active = session;
  setButton(button, 'loading');
  // While a page is read, each of its paragraphs can be clicked to jump there.
  if (!owner && parts.length > 1) {
    parts.forEach((p) => p.el?.classList.add('read-part'));
    if (!state.ui.jumpTipShown) {
      state.ui.jumpTipShown = true;
      save();
      toast('Click any paragraph to jump to it, ahead or back.', 4000);
    }
  }
  // Some browsers only let an <audio> element play if it first plays during the click itself.
  if (hasAudio && !player) {
    player = new Audio();
    player.preservesPitch = true;
    player.src = wavUrl(new Float32Array(1), 8000);
    player.play().catch(() => {});
  }
  const voice = chosenVoice(pick);
  const keys = voice.natural === RECORDED_VOICE ? await recordedKeys() : new Set();
  if (active !== session) return;
  // Chrome can swallow utterances queued straight after cancel(), so give it a moment.
  if (wasBusy) await new Promise((r) => setTimeout(r, 80));
  for (let i = 0; i < parts.length;) {
    if (active !== session) return false;
    await readPart(session, parts[i], voice, keys, parts[i + 1]);
    if (active !== session) return false;
    if (session.jump == null) {
      i++;
      continue;
    }
    i = session.jump;
    session.jump = null;
    if (synth) await new Promise((r) => setTimeout(r, 80));
  }
  if (active !== session) return false;
  stopSpeaking();
  return true;
}

// Moves a reading to parts[i], cutting off whatever is being said now.
function jumpTo(session, i) {
  session.jump = i;
  mark(session, session.parts[i].el);
  // Sentences the model was still making for the old place aren't wanted any more.
  worker?.postMessage({ type: 'cancel', session: session.session });
  session.session = ++sessionCount;
  synth?.cancel();
  session.stop?.();
}

// Reads one diagram caption for owner (the diagram's element). Resolves true once it has been read,
// false if it was stopped or something else started reading.
export function narrate(el, owner) {
  if (!ttsSupported) return Promise.resolve(true);
  return speak(null, readingParts([el]).map((p) => ({ ...p, el: null })), undefined, owner);
}

// Stops owner's narration (any diagram's, without owner), but not a page being read.
export function stopNarration(owner) {
  if (active?.owner && (!owner || active.owner === owner)) stopSpeaking();
}

// A Listen button is reading right now.
export const readingAloud = () => Boolean(active && !active.owner);

// ---------- Controls ----------

export function listenButton(group, label = 'Listen') {
  if (!ttsSupported) return '';
  return html`<span class="listen"><button class="btn btn-small" type="button" data-listen="${group}" aria-pressed="false">${label}</button><details class="tts-menu rate-menu"><summary class="btn btn-small rate" title="Reading speed">${rateLabel(rate())}</summary><div class="tts-pop rate-pop"><label class="rate-row"><span>Speed</span><input type="range" min="${RATE_MIN}" max="${RATE_MAX}" step="0.05" value="${rate()}" data-rate-slider aria-label="Reading speed"></label><div class="rate-ends"><span>${rateLabel(RATE_MIN)}</span><span>${rateLabel(RATE_MAX)}</span></div></div></details><details class="tts-menu voice-menu"><summary class="btn btn-small" title="Choose the voice">Voice</summary><div class="tts-pop voice-pop" data-voice-pop></div></details></span>`;
}

async function fillVoiceMenu(pop, confirmFor = null) {
  const gpu = !modelBroken && (await gpuAvailable());
  const pick = state.ui.ttsVoice || 'auto';
  const current = chosenVoice(pick);
  const isCurrent = (key) => (key.startsWith('natural:') ? !pick.startsWith('browser:') && key === `natural:${current.natural}` : key === `browser:${current.browser?.voiceURI}` && pick.startsWith('browser:'));
  const kept = storageConsent() === 'granted';
  const download = `${MODEL_MB} MB download`;
  const confirmVoice = confirmFor && NATURAL_VOICES.find((v) => v.id === confirmFor);
  mount(pop, confirmVoice ? html`
    <p class="voice-group">${confirmVoice.name} needs the voice model</p>
    <p class="voice-note">Every natural voice except Heart is made on your device by a speech model that runs on your graphics card. It's a one-time ${download}${kept ? ', which your browser keeps' : ' (again each visit, since storage is off)'}.</p>
    <div class="voice-confirm">
      <button type="button" class="btn btn-small btn-primary" data-model-ok="${confirmVoice.id}">Download ${MODEL_MB} MB</button>
      <button type="button" class="btn btn-small" data-model-cancel>Not now</button>
    </div>` : html`
    <p class="voice-group">Natural</p>
    ${NATURAL_VOICES.map((v) => {
      const recordedVoice = v.id === RECORDED_VOICE;
      const usable = recordedVoice || gpu;
      return html`<button type="button" data-voice="natural:${v.id}" aria-pressed="${String(isCurrent(`natural:${v.id}`))}" ${usable ? '' : 'disabled'}>${v.name}<span>${recordedVoice ? `${v.accent}, recorded` : state.ui.naturalModel ? v.accent : `${v.accent}, ${MODEL_MB} MB`}</span></button>`;
    })}
    ${synth ? html`
      <p class="voice-group">Browser</p>
      ${browserVoices().map((v) => html`<button type="button" data-voice="browser:${v.voiceURI}" aria-pressed="${String(isCurrent(`browser:${v.voiceURI}`))}">${voiceLabel(v)}<span>${voiceAccent(v)}</span></button>`)}` : ''}
    <p class="voice-note">${gpu
      ? `Heart is pre-recorded for everything on the site. The other natural voices, and Heart for new text such as a fresh worked example, need the voice model (${download}); until then that text uses the browser voice.`
      : `Heart is pre-recorded for everything on the site; new text such as a fresh worked example uses the browser voice. ${modelBroken ? "The voice model couldn't run in this browser." : 'The other natural voices need WebGPU, which this browser doesn\'t have.'}`}</p>`);
}

// Starts the model in the background when a voice that needs it is chosen and it has loaded here
// before, so pressing Listen doesn't wait for the shaders to compile. Never starts a download.
let warmed = false;
function warmUp() {
  if (warmed || !state.ui.naturalModel || !state.ui.naturalReady || modelBroken) return;
  const { natural } = chosenVoice();
  if (!natural || natural === RECORDED_VOICE) return;
  warmed = true;
  (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(() => gpuAvailable().then((ok) => { if (ok) startWorker(); }));
}

// Wires every Listen, speed and voice control inside root.
export function bindListen(root, signal) {
  if (!ttsSupported) return;
  warmUp();
  explained = false;
  const closeMenus = (except) => root.querySelectorAll('.tts-menu[open]').forEach((d) => { if (d !== except) d.open = false; });
  const sample = (menu, pick) => speak(menu.closest('.listen').querySelector('[data-listen]'), [{ el: null, text: SAMPLE }], pick);
  root.addEventListener('toggle', (e) => {
    if (!e.target.matches?.('.tts-menu') || !e.target.open) return;
    closeMenus(e.target);
    if (e.target.matches('.voice-menu')) fillVoiceMenu(e.target.querySelector('[data-voice-pop]'));
  }, { capture: true, signal });
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = e.target.closest?.('.tts-menu[open]');
    if (open) {
      open.open = false;
      open.querySelector('summary').focus();
    }
  }, { signal });
  // A click that re-rendered the menu has a detached target: that's still inside it.
  document.addEventListener('click', (e) => { if (e.target.isConnected && !e.target.closest('.tts-menu')) closeMenus(); }, { signal });
  root.addEventListener('input', (e) => {
    if (!e.target.matches('[data-rate-slider]')) return;
    state.ui.ttsRate = Number(e.target.value);
    root.querySelectorAll('.rate-menu summary').forEach((s) => { s.textContent = rateLabel(rate()); });
    root.querySelectorAll('[data-rate-slider]').forEach((s) => { if (s !== e.target) s.value = rate(); });
    applyRate();
  }, { signal });
  root.addEventListener('change', (e) => { if (e.target.matches('[data-rate-slider]')) save(); }, { signal });
  root.addEventListener('click', (e) => {
    const choice = e.target.closest('[data-voice]');
    if (choice) {
      const menu = choice.closest('.voice-menu');
      const pick = choice.dataset.voice;
      const id = pick.startsWith('natural:') ? pick.slice(8) : null;
      // Ask before the first download.
      if (id && id !== RECORDED_VOICE && !state.ui.naturalModel) return fillVoiceMenu(menu.querySelector('[data-voice-pop]'), id);
      state.ui.ttsVoice = pick;
      save();
      menu.open = false;
      sample(menu, pick);
      return;
    }
    const ok = e.target.closest('[data-model-ok]');
    if (ok) {
      const menu = ok.closest('.voice-menu');
      state.ui.naturalModel = true;
      state.ui.ttsVoice = `natural:${ok.dataset.modelOk}`;
      save();
      menu.open = false;
      sample(menu, state.ui.ttsVoice);
      return;
    }
    const cancel = e.target.closest('[data-model-cancel]');
    if (cancel) return fillVoiceMenu(cancel.closest('[data-voice-pop]'));
    const button = e.target.closest('[data-listen]');
    if (!button) {
      // A click on a paragraph of the page being read jumps there, unless it was on a control inside it
      // or ended a text selection.
      const part = e.target.closest('.read-part');
      if (!part || !active || active.owner || e.target.closest('a, button, input, select, textarea, summary, label')) return;
      if (String(window.getSelection?.() || '').trim()) return;
      const i = active.parts.findIndex((p) => p.el === part);
      if (i >= 0) jumpTo(active, i);
      return;
    }
    if (active?.button === button) return stopSpeaking();
    const group = button.dataset.listen;
    const elements = [...root.querySelectorAll('[data-read]')].filter((el) => el.dataset.read.split(' ').includes(group));
    speak(button, readingParts(elements));
  }, { signal });
  signal.addEventListener('abort', stopSpeaking);
}
