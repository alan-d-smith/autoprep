// Zetamac-style question generation, and the skill each question exercises.
//
// Settings mirror Zetamac: addition draws (a, b) from two ranges and subtraction shows the same
// problems in reverse; multiplication draws from two ranges and division shows them in reverse.
// Decimals (as in some trading-firm tests) move a decimal point into one or both numbers of those
// same problems: 0.7 × 64, 44.8 ÷ 0.7, 4.7 + 0.38.

export const OPS = ['add', 'sub', 'mul', 'div'];
export const SYMBOL = { add: '+', sub: '−', mul: '×', div: '÷', fadd: '+', fsub: '−', fmul: '×', fdiv: '÷' };
export const DURATIONS = [30, 60, 120, 300, 600];
export const DECIMAL_MODES = ['off', 'mixed', 'only'];
export const NO_DECIMALS = { mode: 'off', places: 1 };

export const DEFAULT_RANGES = { add: [[2, 100], [2, 100]], mul: [[2, 12], [2, 100]] };
export const RANGE_LIMITS = [1, 9999];

const BASE_OF = { fadd: 'add', fsub: 'sub', fmul: 'mul', fdiv: 'div' };

const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));
const rangesFor = (op, ranges) => (op === 'add' || op === 'sub' ? ranges.add : ranges.mul);

export function sameRanges(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Clamps user-entered ranges into a usable, ordered form.
export function normaliseRanges(ranges) {
  const fix = (pair, fallback) => {
    if (!Array.isArray(pair) || pair.length !== 2) return fallback;
    let [lo, hi] = pair.map((v) => Math.round(Number(v)));
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return fallback;
    [lo, hi] = [Math.min(lo, hi), Math.max(lo, hi)].map((v) => Math.min(RANGE_LIMITS[1], Math.max(RANGE_LIMITS[0], v)));
    return [lo, hi];
  };
  const out = {};
  for (const key of ['add', 'mul']) {
    const given = ranges?.[key] || [];
    out[key] = [fix(given[0], DEFAULT_RANGES[key][0]), fix(given[1], DEFAULT_RANGES[key][1])];
  }
  return out;
}

// ---------- Exact decimals ----------
// A decimal is held as [units, places]: "4.48" is [448, 2]. No floating point is involved.

export function parseDecimal(s) {
  const [whole, frac = ''] = String(s).split('.');
  return [Number((whole || '0') + frac), frac.length];
}

export function formatDecimal(units, places) {
  const digits = String(units).padStart(places + 1, '0');
  if (!places) return digits;
  return `${digits.slice(0, -places)}.${digits.slice(-places)}`.replace(/\.?0+$/, '');
}

export function alignDecimals(x, y) {
  const [a, pa] = parseDecimal(x), [b, pb] = parseDecimal(y);
  const p = Math.max(pa, pb);
  return [a * 10 ** (p - pa), b * 10 ** (p - pb), p];
}

const addDecimal = (x, y) => { const [a, b, p] = alignDecimals(x, y); return formatDecimal(a + b, p); };
const subDecimal = (x, y) => { const [a, b, p] = alignDecimals(x, y); return formatDecimal(a - b, p); };
const mulDecimal = (x, y) => { const [a, pa] = parseDecimal(x), [b, pb] = parseDecimal(y); return formatDecimal(a * b, pa + pb); };
function divDecimal(x, y) {
  const [a, b] = alignDecimals(x, y);
  for (let k = 0; k <= 8; k++) if ((a * 10 ** k) % b === 0) return formatDecimal((a * 10 ** k) / b, k);
  return String(a / b);
}

// A typed answer in canonical form ("04.50" → "4.5", ".5" → "0.5"), or null if it isn't a number yet.
export function canonical(input) {
  if (!/^\d*\.?\d*$/.test(input) || input === '' || input === '.') return null;
  const [whole, frac = ''] = input.split('.');
  const w = whole.replace(/^0+(?=\d)/, '') || '0';
  const f = frac.replace(/0+$/, '');
  return f ? `${w}.${f}` : w;
}

export const isCorrect = (input, q) => canonical(input) === String(q.answer);

// ---------- Questions ----------

export function question(op, x, y) {
  if (op in BASE_OF) {
    const answer = { fadd: addDecimal, fsub: subDecimal, fmul: mulDecimal, fdiv: divDecimal }[op](x, y);
    return { op, x: String(x), y: String(y), answer, text: `${x} ${SYMBOL[op]} ${y}`, skill: classify(op, x, y) };
  }
  const answer = { add: x + y, sub: x - y, mul: x * y, div: x / y }[op];
  return { op, x, y, answer, text: `${x} ${SYMBOL[op]} ${y}`, skill: classify(op, x, y) };
}

function fromPair(op, a, b) {
  if (op === 'sub') return question('sub', a + b, a);
  if (op === 'div') return question('div', a * b, a);
  return question(op, a, b);
}

export function randomQuestion(op, ranges = DEFAULT_RANGES, rng = Math.random) {
  const [[aLo, aHi], [bLo, bHi]] = rangesFor(op, ranges);
  return fromPair(op, randInt(aLo, aHi, rng), randInt(bLo, bHi, rng));
}

// The same problem with decimal points moved into it. For × and ÷ the answer has at most
// `places` decimal places; for + and − each number has at most `places`.
export function decimalQuestion(op, ranges = DEFAULT_RANGES, places = 1, rng = Math.random) {
  const [[aLo, aHi], [bLo, bHi]] = rangesFor(op, ranges);
  const additive = op === 'add' || op === 'sub';
  for (let tries = 0; tries < 50; tries++) {
    const a = randInt(aLo, aHi, rng), b = randInt(bLo, bHi, rng);
    const pa = randInt(0, places, rng);
    const pb = additive ? randInt(0, places, rng) : randInt(0, places - pa, rng);
    const x = formatDecimal(a, pa), y = formatDecimal(b, pb);
    if (!x.includes('.') && !y.includes('.')) continue;
    if (op === 'add') return question('fadd', x, y);
    if (op === 'sub') return question('fsub', addDecimal(x, y), x);
    if (op === 'mul') return question('fmul', x, y);
    return question('fdiv', mulDecimal(x, y), x);
  }
  // Ranges where every number ends in zero can't carry a decimal point: fall back to whole numbers.
  return randomQuestion(op, ranges, rng);
}

// Picks an operation uniformly, avoiding an exact repeat of the previous question.
export function nextQuestion(ops, previous, rng = Math.random, ranges = DEFAULT_RANGES, decimals = NO_DECIMALS) {
  let q;
  for (let tries = 0; tries < 10; tries++) {
    const op = ops[Math.floor(rng() * ops.length)];
    const decimal = decimals.mode === 'only' || (decimals.mode === 'mixed' && rng() < 0.5);
    q = decimal ? decimalQuestion(op, ranges, decimals.places, rng) : randomQuestion(op, ranges, rng);
    if (!previous || q.text !== previous.text) break;
  }
  return q;
}

// Ranges used when a skill can't come up under the current settings (e.g. two-digit × two-digit
// with Zetamac's defaults): the drill still has something sensible to draw from.
const SKILL_FALLBACK_RANGES = {
  'mul-2x2': { add: DEFAULT_RANGES.add, mul: [[13, 99], [13, 99]] },
  'div-2x2': { add: DEFAULT_RANGES.add, mul: [[13, 99], [13, 99]] },
};

const DECIMAL_SKILL_OPS = { 'dec-addsub': ['add', 'sub'], 'dec-mul': ['mul'], 'dec-div': ['div'] };

// Draws questions for one skill, from the given ranges when that skill occurs in them.
export function questionForSkill(skillId, ranges = DEFAULT_RANGES, rng = Math.random, previous = null, places = 1) {
  const sources = [ranges, DEFAULT_RANGES, SKILL_FALLBACK_RANGES[skillId]].filter(Boolean);
  const decimalOps = DECIMAL_SKILL_OPS[skillId];
  const op = skillId === 'trivial' ? 'mul' : skillId.split('-')[0];
  for (const source of sources) {
    for (let tries = 0; tries < 2000; tries++) {
      const q = decimalOps
        ? decimalQuestion(decimalOps[Math.floor(rng() * decimalOps.length)], source, places, rng)
        : randomQuestion(op, source, rng);
      if (q.skill === skillId && (!previous || q.text !== previous.text)) return q;
    }
  }
  throw new Error(`Could not generate a question for ${skillId}`);
}

const isPowerOfTen = (n) => n >= 10 && /^10*$/.test(String(n));

function stripZeros(n) {
  let zeros = 0;
  while (n >= 10 && n % 10 === 0) { n /= 10; zeros++; }
  return [n, zeros];
}

// Does any column except the leading one add up to 10 or more? (A carry out of the leading
// column just adds a digit: 72 + 51 = 123 needs nothing held in your head.)
function carries(x, y) {
  const columns = Math.max(String(x).length, String(y).length);
  for (let i = 0; i < columns - 1; i++) {
    if ((Math.floor(x / 10 ** i) % 10) + (Math.floor(y / 10 ** i) % 10) >= 10) return true;
  }
  return false;
}

function borrows(x, y) {
  for (; y; x = Math.floor(x / 10), y = Math.floor(y / 10)) if (x % 10 < y % 10) return true;
  return false;
}

// One primary skill per question, so time spent is never counted twice.
export function classify(op, x, y) {
  if (op === 'fadd' || op === 'fsub') return 'dec-addsub';
  if (op === 'fmul') return 'dec-mul';
  if (op === 'fdiv') return 'dec-div';
  if (op === 'add') return carries(x, y) ? 'add-carry' : 'add-basic';
  if (op === 'sub') {
    if (isPowerOfTen(y)) return 'trivial';
    const d = x - y;
    if (y < 100 && Math.floor(x / 100) > Math.floor(d / 100)) return 'sub-cross';
    return borrows(x, y) ? 'sub-borrow' : 'sub-basic';
  }
  // Trailing zeros are free: 7 × 60 is 7 × 6 with a zero, 840 ÷ 20 is 84 ÷ 2.
  if (op === 'mul') {
    const [p] = stripZeros(x), [q] = stripZeros(y);
    const [small, big] = p <= q ? [p, q] : [q, p];
    if (small === 1) return 'trivial';
    if (big <= 12) return 'mul-facts';
    if (small >= 13) return 'mul-2x2';
    return small >= 11 ? 'mul-1112' : 'mul-split';
  }
  const quotient = x / y;
  if (y === 1 || isPowerOfTen(y) || isPowerOfTen(quotient)) return 'trivial';
  const [divisor] = stripZeros(y), [q] = stripZeros(quotient);
  if (divisor >= 13) return 'div-2x2';
  if (q <= 12) return 'div-facts';
  return divisor >= 11 ? 'div-1112' : 'div-split';
}

const distributionCache = new Map();
const ENUMERATE_LIMIT = 100000;
const DECIMAL_SAMPLES = 60000;

function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

// Share of questions per skill for the given settings. Whole-number problems are enumerated
// exactly when the ranges are small enough; anything else is sampled with a fixed seed.
export function skillDistribution(ops, ranges = DEFAULT_RANGES, decimals = NO_DECIMALS) {
  const key = `${[...ops].sort().join(',')}|${JSON.stringify(ranges)}|${decimals.mode}${decimals.places}`;
  if (distributionCache.has(key)) return distributionCache.get(key);
  const freq = {};
  if (decimals.mode !== 'off') {
    const rng = seeded(4242);
    for (let i = 0; i < DECIMAL_SAMPLES; i++) {
      const { skill } = nextQuestion(ops, null, rng, ranges, decimals);
      freq[skill] = (freq[skill] || 0) + 1 / DECIMAL_SAMPLES;
    }
    distributionCache.set(key, freq);
    return freq;
  }
  for (const op of ops) {
    const [[aLo, aHi], [bLo, bHi]] = rangesFor(op, ranges);
    const pairs = (aHi - aLo + 1) * (bHi - bLo + 1);
    const add = (a, b, w) => {
      const { skill } = fromPair(op, a, b);
      freq[skill] = (freq[skill] || 0) + w;
    };
    if (pairs <= ENUMERATE_LIMIT) {
      const w = 1 / ops.length / pairs;
      for (let a = aLo; a <= aHi; a++) for (let b = bLo; b <= bHi; b++) add(a, b, w);
    } else {
      const rng = seeded(12345);
      const w = 1 / ops.length / ENUMERATE_LIMIT;
      for (let i = 0; i < ENUMERATE_LIMIT; i++) add(randInt(aLo, aHi, rng), randInt(bLo, bHi, rng), w);
    }
  }
  distributionCache.set(key, freq);
  return freq;
}

