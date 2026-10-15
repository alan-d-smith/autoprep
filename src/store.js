// Everything is kept in this browser's localStorage, and only once you've accepted the storage
// notice. Until then (or if you choose "Not now"), progress lives in memory for this visit only.

import { OPS, DURATIONS, DEFAULT_RANGES, DECIMAL_MODES, normaliseRanges, question } from './math/zetamac.js';

const KEY = 'autoprep:v1';
const CONSENT_KEY = 'autoprep:storage-consent';
const DECLINED_KEY = 'autoprep:storage-declined';
const MAX_ROUNDS = 30;
const MAX_DRILLS = 100;

export const defaultSettings = () => ({
  duration: 120,
  ops: [...OPS],
  ranges: structuredClone(DEFAULT_RANGES),
  decimals: { mode: 'off', places: 1 },
  goal: null,
});

const defaultUi = () => ({ ukiepcDifficulty: false, ukiepcTopics: false, ukiepcOpen: [], sidebarOpen: true, ttsRate: 1, closedTracks: [], openStages: [], closedStages: [], codeStyle: 'general', ttsVoice: 'auto', naturalModel: false, naturalReady: false, vizSpeed: 1, vizMuted: false, jumpTipShown: false });

const fresh = () => ({
  math: { rounds: [], drills: [], settings: defaultSettings() },
  cf: { handle: '', rating: null, maxRating: null, rank: null, synced: {}, manual: {}, hints: {}, totalSolved: null, syncedAt: null },
  ui: defaultUi(),
});

function load() {
  const base = fresh();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved || typeof saved !== 'object') return base;
    const math = saved.math || {};
    const settings = { ...base.math.settings, ...(math.settings || {}) };
    if (!DURATIONS.includes(settings.duration)) settings.duration = 120;
    settings.ops = Array.isArray(settings.ops) ? settings.ops.filter((op) => OPS.includes(op)) : [...OPS];
    if (!settings.ops.length) settings.ops = [...OPS];
    settings.ranges = normaliseRanges(settings.ranges);
    const decimals = settings.decimals || {};
    settings.decimals = { mode: DECIMAL_MODES.includes(decimals.mode) ? decimals.mode : 'off', places: decimals.places === 2 ? 2 : 1 };
    if (!(Number.isInteger(settings.goal) && settings.goal > 0)) settings.goal = null;
    const cf = { ...base.cf, ...(saved.cf || {}) };
    for (const key of ['synced', 'manual', 'hints']) if (!cf[key] || typeof cf[key] !== 'object') cf[key] = {};
    const ui = { ...base.ui, ...(saved.ui || {}) };
    for (const key of ['ukiepcOpen', 'closedTracks', 'openStages', 'closedStages']) if (!Array.isArray(ui[key])) ui[key] = [];
    if (!(ui.ttsRate >= 0.25 && ui.ttsRate <= 1.75)) ui.ttsRate = 1;
    if (typeof ui.ttsVoice !== 'string') ui.ttsVoice = 'auto';
    if (![0.5, 1, 2].includes(ui.vizSpeed)) ui.vizSpeed = 1;
    for (const key of ['vizMuted', 'jumpTipShown']) ui[key] = ui[key] === true;
    return {
      math: {
        rounds: Array.isArray(math.rounds) ? math.rounds.filter((r) => Array.isArray(r?.questions)) : [],
        drills: Array.isArray(math.drills) ? math.drills : [],
        settings,
      },
      cf,
      ui,
    };
  } catch {
    return base;
  }
}

export const state = load();

// 'granted', 'declined' (for this visit), or 'unknown' (not asked yet).
export function storageConsent() {
  try {
    if (localStorage.getItem(CONSENT_KEY) === 'granted') return 'granted';
    if (sessionStorage.getItem(DECLINED_KEY)) return 'declined';
  } catch {
    return 'declined';
  }
  return 'unknown';
}

export function grantStorage() {
  try {
    localStorage.setItem(CONSENT_KEY, 'granted');
  } catch {
    // Storage blocked by the browser: carry on in memory.
  }
  save();
}

export function declineStorage() {
  try {
    sessionStorage.setItem(DECLINED_KEY, '1');
  } catch {
    // Nothing to remember the choice with; we'll ask again next time.
  }
}

export function save() {
  if (storageConsent() !== 'granted') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private windows, full quota). The session still works.
  }
}

export function addRound(round) {
  state.math.rounds.unshift(round);
  state.math.rounds.length = Math.min(state.math.rounds.length, MAX_ROUNDS);
  save();
}

export function addDrill(drill) {
  state.math.drills.unshift(drill);
  state.math.drills.length = Math.min(state.math.drills.length, MAX_DRILLS);
  save();
}

// Rounds as stored ({ op, x, y, ms, misses }) plus each question's text and skill.
// Rounds saved before ranges or decimals were configurable used Zetamac's defaults.
export function benchmarkRounds() {
  return state.math.rounds.map((r) => ({
    ...r,
    ranges: r.ranges || DEFAULT_RANGES,
    decimals: r.decimals || { mode: 'off', places: 1 },
    questions: r.questions.map((q) => ({ ...question(q.op, q.x, q.y), ms: q.ms, misses: q.misses || 0 })),
  }));
}

export const isSolved = (id) => Boolean(state.cf.synced[id] || state.cf.manual[id]);
