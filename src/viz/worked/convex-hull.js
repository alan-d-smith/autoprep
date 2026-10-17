// Pictures for the Convex hulls and the convex hull trick worked problem, made by running its solution on the official sample.
// Covered Walkway (Kattis): dp[i] = x_i² + c + (the lowest line at x_i), where the roof starting at point j is the
// line with slope −2·x_j and intercept dp[j − 1] + x_j², kept in MonoCHT's deque L.

import { text, row, span, dot, polyline } from '../draw.js';
import { frame } from '../stages/common.js';

const SAMPLE = { c: 5000, x: [1, 23, 45, 67, 101, 124, 560, 789, 990, 1019], answer: 30726 };
const W = 460;
const fmt = (v) => (v < 0 ? `−${-v}` : `${v}`);

// The solution, recording for each i what add and query did to L. Lines are { j, m, c } with y = m·x + c.
function solve({ c, x }) {
  const n = x.length, X = [0, ...x], dp = [0], from = [0], L = [], steps = [];
  const val = (l, q) => l.m * q + l.c;
  const useless = (l1, l2, l3) => (l3.c - l1.c) * (l1.m - l2.m) <= (l2.c - l1.c) * (l1.m - l3.m);
  for (let i = 1; i <= n; i++) {
    const line = { j: i, m: -2 * X[i], c: dp[i - 1] + X[i] * X[i] };
    const before = [...L], back = [];
    while (L.length >= 2 && useless(L.at(-2), L.at(-1), line)) back.push(L.pop());
    L.push(line);
    const queried = [...L], front = [];
    while (L.length >= 2 && val(L[1], X[i]) <= val(L[0], X[i])) front.push(L.shift());
    const best = val(L[0], X[i]);
    dp[i] = X[i] * X[i] + c + best;
    from[i] = L[0].j;
    steps[i] = { i, q: X[i], line, before, back, queried, front, after: [...L], best, dp: dp[i] };
  }
  const roofs = [];
  for (let i = n; i > 0; i = from[i] - 1) roofs.unshift([from[i], i]);
  return { dp, from, steps, roofs };
}

// A row of the points, x_1..x_n, with i above each box.
const RX = 44, RS = 36, RG = 4;
function points(x, y, cls = () => '') {
  return x.map((_, k) => text(RX + k * (RS + RG) + RS / 2, y - 10, k + 1, 'v-idx')).join('') + row(x, { x: RX, y, size: RS, gap: RG, name: 'x', cls });
}
const bracket = (a, b, label, cls, y) => span(a - 1, b - 1, label, { x: RX, y, size: RS, gap: RG, cls });

// Lines in a window [xa, xb] × [ya, yb]; the plot sits in the box PX0..PX1, PY0..PY1.
const PX0 = 44, PX1 = 300, PY0 = 30, PY1 = 206, PANEL = 322;
function plot(step, { xa, xb, ya, yb }, ticks) {
  const sx = (v) => PX0 + ((v - xa) / (xb - xa)) * (PX1 - PX0), sy = (v) => PY1 - ((v - ya) / (yb - ya)) * (PY1 - PY0);
  const val = (l, q) => l.m * q + l.c;
  // A falling line enters the window at the top or the left and leaves at the bottom or the right.
  const clip = (l) => {
    const a = Math.max(xa, (yb - l.c) / l.m), b = Math.min(xb, (ya - l.c) / l.m);
    return a < b ? [[a, val(l, a)], [b, val(l, b)]] : null;
  };
  const popped = [...step.back, ...step.front], kept = step.after;
  const drawn = [...step.queried, ...step.back].sort((p, q) => p.j - q.j);
  let out = `<path class="v-axis" d="M${PX0} ${PY0 - 6} V${PY1} H${PX1 + 6}"/>` + text(PX1 + 12, PY1, 'x', 'v-idx', 'start');
  out += ticks.map((t) => `<path class="v-axis" d="M${sx(t)} ${PY1} v5"/>` + text(sx(t), PY1 + 14, t, t === step.q ? 'v-note hl' : 'v-idx')).join('');
  out += `<path class="v-axis" d="M${sx(step.q)} ${PY0} V${PY1}" stroke-dasharray="3 4"/>`;
  for (const l of drawn) {
    const seg = clip(l);
    if (!seg) continue;
    const bad = popped.includes(l);
    out += `<line class="v-edge ${bad ? 'bad' : ''}" x1="${sx(seg[0][0])}" y1="${sy(seg[0][1])}" x2="${sx(seg[1][0])}" y2="${sy(seg[1][1])}"/>`;
    const [lx, ly] = seg[0], top = ly >= yb - 1e-9;
    out += text(top ? sx(lx) + 6 : PX0 - 6, top ? PY0 - 10 : sy(ly), l.j, `v-note ${bad ? 'bad' : ''}`, top ? 'middle' : 'end');
  }
  // The lower envelope of the lines still in L, from the query point on: exact, through the pairwise crossings.
  const cuts = [step.q, xb];
  for (const p of kept) for (const q of kept) if (p.m !== q.m) { const t = (q.c - p.c) / (p.m - q.m); if (t > step.q && t < xb) cuts.push(t); }
  const env = cuts.sort((a, b) => a - b).map((t) => [t, Math.min(...kept.map((l) => val(l, t)))]).filter(([, v]) => v >= ya && v <= yb);
  out += polyline(env.map(([t, v]) => [sx(t), sy(v)]), 'good');
  for (const l of step.queried) out += dot(sx(step.q), sy(val(l, step.q)), l === kept[0] ? 'hl' : popped.includes(l) ? 'bad' : '', l === kept[0] ? 5 : 3.5);
  return out;
}

function panel(step) {
  const cls = (l) => (l === step.line ? 'good' : l === step.after[0] ? 'hl' : step.back.includes(l) || step.front.includes(l) ? 'bad' : '');
  const shown = [...step.queried, ...step.back].sort((p, q) => p.j - q.j);
  return text(PANEL, 40, `i = ${step.i}, x = ${step.q}`, 'v-note hl', 'start')
    + text(PANEL, 66, 'L', 'v-name', 'start')
    + row(shown.map((l) => l.j), { x: PANEL + 18, y: 52, size: 26, gap: 4, cls: (k) => cls(shown[k]) })
    + text(PANEL, 110, `query(${step.q})`, 'v-note', 'start') + text(PANEL, 130, `= ${fmt(step.best)}`, 'v-note hl', 'start')
    + text(PANEL, 160, `dp[${step.i}] = ${step.dp}`, 'v-note good', 'start');
}

export default () => {
  const { c, x } = SAMPLE, n = x.length;
  const { dp, steps, roofs } = solve(SAMPLE);
  if (dp[n] !== SAMPLE.answer) throw new Error(`Covered Walkway sample: the DP gives ${dp[n]}, not ${SAMPLE.answer}`);
  const cost = ([a, b]) => c + (x[b - 1] - x[a - 1]) ** 2;
  if (roofs.reduce((s, r) => s + cost(r), 0) !== dp[n]) throw new Error('Covered Walkway sample: the roofs do not add up to dp[n]');
  const frames = [];

  // The sample, with the two extremes: one roof over everything, or a roof per point.
  const one = cost([1, n]);
  frames.push(frame(W, 150, points(x, 30) + bracket(1, n, `one roof: ${c} + ${x[n - 1] - x[0]}² = ${one}`, 'bad', 72)
    + text(RX, 128, `a roof per point: ${n} · ${c} = ${n * c}`, 'v-note', 'start'),
  `The sample: c = ${c} and ${n} points from ${x[0]} to ${x[n - 1]}. One roof over everything costs ${one}; a roof per point costs ${n * c}.`));

  // dp[i] for one i, split at the start j of its last roof.
  const i5 = 5, j5 = steps[i5].after[0].j;
  frames.push(frame(W, 150, points(x, 30, (k) => (k < i5 ? '' : 'dim'))
    + (j5 > 1 ? bracket(1, j5 - 1, `dp[${j5 - 1}] = ${dp[j5 - 1]}`, 'good', 72) : '')
    + bracket(j5, i5, cost([j5, i5]), 'hl', 72)
    + text(RX, 128, `dp[${i5}] = dp[${j5 - 1}] + ${c} + (${x[i5 - 1]} − ${x[j5 - 1]})² = ${dp[j5 - 1]} + ${cost([j5, i5])} = ${dp[i5]}`, 'v-note hl', 'start'),
  `dp[${i5}]: the last roof starts at point j = ${j5}, so dp[${i5}] = dp[${j5 - 1}] + c + (x_${i5} − x_${j5})² = ${dp[j5 - 1]} + ${c} + ${(x[i5 - 1] - x[j5 - 1]) ** 2} = ${dp[i5]}.`));

  // Lines while the first points are added, then the query that pops two lines from the front.
  const early = { xa: 0, xb: 110, ya: -2600, yb: 7800 }, ticks = x.slice(0, 5);
  for (const i of [2, 3]) {
    const s = steps[i];
    frames.push(frame(W, 240, plot(s, early, ticks) + panel(s), s.back.length
      ? `i = ${i}: add(${fmt(s.line.m)}, ${s.line.c}) pops line ${s.back.map((l) => l.j).join(', ')}: it is never below both neighbours. query(${s.q}) = ${fmt(s.best)} on line ${s.after[0].j}, so dp[${i}] = ${s.dp}.`
      : `i = ${i}: L holds lines ${s.after.map((l) => l.j).join(' and ')}. query(${s.q}) = ${fmt(s.best)} on line ${s.after[0].j}, so dp[${i}] = ${s.q}² + ${c} ${s.best < 0 ? '−' : '+'} ${Math.abs(s.best)} = ${s.dp}.`));
  }
  const s5 = steps[5];
  frames.push(frame(W, 240, plot(s5, { xa: 40, xb: 130, ya: -7200, yb: 2600 }, x.slice(2, 6)) + panel(s5),
    `i = 5: query(${s5.q}) pops lines ${s5.front.map((l) => l.j).join(' and ')} from the front, since line ${s5.after[0].j} is lower at x = ${s5.q} and stays lower to the right. dp[5] = ${s5.dp}.`));

  // The answer: the roofs found by following each dp[i] back to the start of its last roof.
  frames.push(frame(W, 150, points(x, 30, () => 'good') + roofs.map((r) => bracket(r[0], r[1], cost(r), 'good', 72)).join('')
    + text(RX, 128, `dp[${n}] = ${roofs.map(cost).join(' + ')} = ${dp[n]}`, 'v-note good', 'start'),
  `The answer: roofs over points ${roofs.map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`)).join(', ')}, costing ${roofs.map(cost).join(' + ')} = ${dp[n]}.`));
  return [{ title: 'Covered Walkway: the convex hull trick on the sample', frames }];
};
