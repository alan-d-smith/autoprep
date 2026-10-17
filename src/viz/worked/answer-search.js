// Pictures for the Binary and ternary search on the answer worked problem, made by running its solution on the official sample.
// Kattis "Freight Train", sample case 1: binary search on D, with the trains the greedy check ok(D) forms at each mid.

import { text, row, cellX, legend } from '../draw.js';
import { frame, range } from '../stages/common.js';

const SAMPLE = {
  input: '3\n6 2 2\n1 2\n8 3 3\n1 4 7\n6 4 4\n1 2 5 6\n',
  output: [2, 3, 2],
  shown: 0, // the test case the slides walk through
};

function parse(input) {
  const t = input.trim().split(/\s+/).map(Number);
  let i = 0;
  return range(t[i++]).map(() => {
    const [N, W, L] = t.slice(i, (i += 3));
    return { N, W, L, a: t.slice(i, (i += W)) };
  });
}

// ok(D) as in the solution, also returning the trains it forms: [first wagon, last wagon, holds freight].
function check({ N, W, L, a }, D) {
  let p = 1, trains = 0, i = 0;
  const made = [];
  while (p <= N) {
    while (i < W && a[i] < p) i++;
    const next = i < W ? a[i] : N + 1, start = p;
    p = Math.max(p + D, next);
    made.push([start, Math.min(p - 1, N), i < W && a[i] < p]);
    if (++trains > L) return { fits: false, made };
  }
  return { fits: true, made };
}

// The binary search for the first true, as in the solution, keeping every check.
function solve(test) {
  let lo = 1, hi = test.N;
  const steps = [];
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const { fits, made } = check(test, mid);
    if (fits) hi = mid; else lo = mid + 1;
    steps.push({ mid, fits, made, lo, hi });
  }
  return { answer: lo, steps };
}

const run = (s, e) => (s === e ? `${s}` : `${s}–${e}`);

export default function freightTrain() {
  const tests = parse(SAMPLE.input);
  const results = tests.map(solve);
  results.forEach(({ answer }, c) => {
    if (answer !== SAMPLE.output[c]) throw new Error(`Freight Train sample case ${c + 1}: got ${answer}, expected ${SAMPLE.output[c]}`);
  });
  const test = tests[SAMPLE.shown], { answer, steps } = results[SAMPLE.shown];
  const { N, L, a } = test;
  const freight = new Set(a);

  const W = 400, size = 34, gap = 4, x = (W - (N * (size + gap) - gap)) / 2 + 20;
  const at = (i) => cellX(i, { x, size, gap }) + size / 2;
  const WY = 36, DY = 122;

  // Brackets over the trains; a train past the L-th is drawn red.
  const bracket = (s, e, cls, label, labelCls) => {
    const x1 = cellX(s - 1, { x, size, gap }) + 2, x2 = cellX(e - 1, { x, size, gap }) + size - 2;
    return `<path class="v-bracket ${cls}" d="M${x1} ${WY - 4} v-6 H${x2} v6"/>` + text((x1 + x2) / 2, WY - 20, label, `v-note ${labelCls}`);
  };
  const trainCls = (k, has) => (k >= L ? 'bad' : has ? 'hl' : 'wait');
  const drawTrains = (made) => {
    const cls = range(N).map(() => '');
    made.forEach(([s, e, has], k) => { for (let w = s; w <= e; w++) cls[w - 1] = trainCls(k, has); });
    return made.map(([s, e, has], k) => bracket(s, e, has ? '' : 'wait', k >= L ? `train ${k + 1}` : has ? e - s + 1 : 'back', trainCls(k, has))).join('')
      + row(range(N).map((i) => (freight.has(i + 1) ? 'F' : '')), { x, y: WY, size, gap, name: 'wagons', index: true, indexFrom: 1, cls: (i) => cls[i] });
  };
  // The legend, spaced for its monospace labels.
  const key = (made, y) => {
    const items = [['hl', 'to Luxembourg'], ['wait', 'back, any length'], ...(made.length > L ? [['bad', `train ${L + 1} > L`]] : [])];
    const widths = items.map(([, label]) => 32 + label.length * 7.3);
    let lx = (W - widths.reduce((s, w) => s + w, 0) + 14) / 2;
    return items.map((item, i) => { const out = legend([item], { x: lx, y }); lx += widths[i]; return out; }).join('');
  };

  // The D row: values known true are green, known false red; lo..hi is bracketed underneath.
  const drawSearch = (k) => {
    const { mid, lo, hi } = steps[k];
    const known = (d) => {
      for (const s of steps.slice(0, k + 1)) if (s.fits ? d >= s.mid : d <= s.mid) return s.fits ? 'good' : 'bad';
      return d < lo || d > hi ? 'dim' : '';
    };
    const x1 = cellX(lo - 1, { x, size, gap }) + 2, x2 = cellX(hi - 1, { x, size, gap }) + size - 2, by = DY + size + 4;
    return row(range(N).map((i) => i + 1), { x, y: DY, size, gap, name: 'D', cls: (i) => known(i + 1) })
      + text(at(mid - 1), DY - 12, 'mid', 'v-note hl')
      + `<path class="v-bracket" d="M${x1} ${by} v6 H${x2} v-6"/>`
      + (lo === hi ? text(at(lo - 1), by + 18, 'lo = hi', 'v-note') : text(at(lo - 1), by + 18, 'lo', 'v-note') + text(at(hi - 1), by + 18, 'hi', 'v-note'));
  };

  const best = check(test, answer).made;
  const frames = [frame(W, WY + size + 46, drawTrains(best) + key(best, WY + size + 32),
    `Sample case ${SAMPLE.shown + 1}: ${N} wagons, freight in ${a.join(' and ')}, L = ${L}. Trains ${best.map(([s, e, has]) => `${run(s, e)} ${has ? 'to Luxembourg' : 'back'}`).join(', ')}: the answer is ${answer}.`)];
  steps.forEach(({ mid, fits, made, lo, hi }, k) => {
    const H = DY + size + 58;
    frames.push(frame(W, H, drawTrains(made) + drawSearch(k) + key(made, H - 10),
      `Check ${k + 1}: ok(${mid}) makes ${made.length} trains (${made.map(([s, e]) => run(s, e)).join(', ')}), ${fits ? `at most L = ${L}, so it is true and hi = ${hi}` : `more than L = ${L}, so it is false and lo = ${lo}`}.`));
  });
  return [{ title: 'Freight Train, sample case 1', frames }];
}
