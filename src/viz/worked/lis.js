// Pictures for the LIS worked problem, Manhattan Mornings (Kattis manhattanmornings): the solution run on
// samples 1 and 2. Each run throws if its answer differs from the sample's output.

import { text, row, cellX, polyline, dot } from '../draw.js';
import { frame } from '../stages/common.js';

const num = (v) => (v < 0 ? `−${-v}` : String(v));
const pt = ([x, y]) => `(${num(x)}, ${num(y)})`;
const tight = ([x, y]) => `(${num(x)},${num(y)})`;

// The solution: keep the errands inside the home–work rectangle, negate an axis when work lies left of or
// below home, sort by (x, y), then the longest non-decreasing subsequence of the y values with tails and
// upper_bound. tailIdx and par rebuild one best route for the last picture.
function solve({ home: [xh, yh], work: [xw, yw], errands }) {
  const fx = xw < xh ? -1 : 1, fy = yw < yh ? -1 : 1;
  const inside = ([x, y]) => Math.min(xh, xw) <= x && x <= Math.max(xh, xw) && Math.min(yh, yw) <= y && y <= Math.max(yh, yw);
  const kept = errands.filter(inside).map((p) => ({ p, q: [fx * p[0], fy * p[1]] }));
  kept.sort((u, v) => u.q[0] - v.q[0] || u.q[1] - v.q[1]);
  const a = kept.map((e) => e.q[1]);
  const tails = [], tailIdx = [], par = [], steps = [];
  a.forEach((v, i) => {
    let lo = 0, hi = tails.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (tails[mid] <= v) lo = mid + 1; else hi = mid; }
    const k = lo, old = tails[k];
    par[i] = k > 0 ? tailIdx[k - 1] : -1;
    tails[k] = v;
    tailIdx[k] = i;
    steps.push({ i, k, old, tails: [...tails] });
  });
  const route = [];
  for (let i = tails.length ? tailIdx.at(-1) : -1; i !== -1; i = par[i]) route.unshift(i);
  return { fx, fy, inside, kept, a, steps, route, answer: tails.length };
}

// One sample: the street grid on the left, and on the right the sorted errands, a and tails.
function sample({ title, input, expected, unit, gx, gy, rx, labels, coords }) {
  const run = solve(input);
  if (run.answer !== expected) throw new Error(`Manhattan Mornings ${title}: got ${run.answer}, the sample says ${expected}`);
  const { home, work, errands } = input;
  const xs = [...errands, home, work].map(([x]) => x), ys = [...errands, home, work].map(([, y]) => y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const X = (x) => gx + (x - x0) * unit, Y = (y) => gy - (y - y0) * unit;
  const size = 34, gap = 12, ya = 64, yt = 150;
  const W = rx + run.a.length * (size + gap) + 10, H = Math.max(gy + 34, yt + 60);
  const order = new Map(run.kept.map((e, i) => [e, i]));

  const streets = () => {
    let out = '';
    for (let x = x0; x <= x1; x++) out += `<path class="v-axis" d="M${X(x)} ${Y(y0)} V${Y(y1)}"/>` + text(X(x), Y(y0) + 14, num(x), 'v-idx');
    for (let y = y0; y <= y1; y++) out += `<path class="v-axis" d="M${X(x0)} ${Y(y)} H${X(x1)}"/>` + text(X(x0) - 12, Y(y), num(y), 'v-idx');
    const [rx0, rx1] = [Math.min(home[0], work[0]), Math.max(home[0], work[0])], [ry0, ry1] = [Math.min(home[1], work[1]), Math.max(home[1], work[1])];
    out += `<rect class="v-area" x="${X(rx0)}" y="${Y(ry1)}" width="${X(rx1) - X(rx0)}" height="${Y(ry0) - Y(ry1)}"/>`;
    const place = (p, label) => {
      const [dx, dy, anchor] = labels[label];
      return `<g class="v-cell done"><rect x="${X(p[0]) - 7}" y="${Y(p[1]) - 7}" width="14" height="14" rx="3"/></g>` + text(X(p[0]) + dx, Y(p[1]) + dy, label, 'v-note', anchor);
    };
    return out + place(home, 'home') + place(work, 'work');
  };
  // Errand dots: cls(p, i) gives the state, where i is the errand's place in sorted order (undefined for an
  // errand outside the rectangle). Labels show coordinates before sorting (if asked), i afterwards.
  const dots = (cls, sorted) => errands.map((p) => {
    const e = run.kept.find((k) => k.p === p), i = e ? order.get(e) : undefined;
    const c = cls(p, i);
    const label = sorted ? (i === undefined ? '' : i) : coords ? pt(p) : '';
    return dot(X(p[0]), Y(p[1]), c, 5) + (label === '' ? '' : text(X(p[0]) + 9, Y(p[1]) - 10, label, `v-idx`, 'start'));
  }).join('');
  const aRow = (cls) => run.kept.map((e, i) => text(cellX(i, { x: rx, size, gap }) + size / 2, ya - 12, tight(e.q), 'v-idx')).join('')
    + row(run.a.map(num), { x: rx, y: ya, size, gap, name: 'a', index: true, cls });
  const tailsRow = (vals, cls) => row([...vals.map(num), ...Array(Math.max(0, run.a.length - vals.length)).fill('')], { x: rx, y: yt, size, gap, name: 'tails', index: true, cls });

  const frames = [frame(W, H, streets() + dots((p) => (run.inside(p) ? '' : 'bad'), false),
    `${title}: home ${pt(home)}, work ${pt(work)}. A shortest route stays in the shaded rectangle${errands.some((p) => !run.inside(p)) ? '; hollow errands lie outside it' : ''}.`)];
  frames.push(frame(W, H, streets() + dots((p, i) => (i === undefined ? 'bad' : ''), true) + aRow(() => '') + tailsRow([], () => ''),
    `Sorted by x${run.fx < 0 || run.fy < 0 ? ` after negating ${run.fx < 0 && run.fy < 0 ? 'both axes' : run.fx < 0 ? 'x' : 'y'}` : ''}, equal x by y: a = ${run.a.map(num).join(', ')}, the y values in that order.`));
  for (const { i, k, old, tails } of run.steps) {
    const v = run.a[i], append = old === undefined;
    frames.push(frame(W, H, streets() + dots((p, j) => (j === undefined ? 'bad' : j === i ? 'hl' : j < i ? '' : 'dim'), true)
      + aRow((j) => (j === i ? 'hl' : j < i ? '' : 'dim')) + tailsRow(tails, (j) => (j === k ? (append ? 'good' : 'hl') : '')),
    append
      ? `a[${i}] = ${num(v)} is above every tail, so it ends a route of ${k + 1} errand${k ? 's' : ''}: tails[${k}] = ${num(v)}.`
      : `The first tail above ${num(v)} is tails[${k}] = ${num(old)}. ${num(v)} replaces it: a route of ${k + 1} errand${k ? 's' : ''} can now end at y = ${num(v)}.`));
  }
  // One best route, rebuilt from par, drawn as a staircase from home to work through its errands.
  const stops = [home, ...run.route.map((i) => run.kept[i].p), work];
  const path = [];
  stops.forEach((p, s) => { if (s) path.push([X(p[0]), Y(stops[s - 1][1])]); path.push([X(p[0]), Y(p[1])]); });
  const onRoute = new Set(run.route);
  frames.push(frame(W, H, streets() + polyline(path, 'good') + dots((p, j) => (onRoute.has(j) ? 'good' : 'dim'), true)
    + aRow((j) => (onRoute.has(j) ? 'good' : 'dim')) + tailsRow(run.steps.at(-1).tails, () => 'dim'),
  `Answer ${run.answer}: one best route passes ${run.route.map((i) => pt(run.kept[i].p)).join(', ')}.`));
  return { title, frames };
}

export default () => [
  sample({
    title: 'Sample 1',
    input: { home: [0, 0], work: [6, 6], errands: [[5, 4], [2, 6], [3, 1]] },
    expected: 2, unit: 24, gx: 36, gy: 196, rx: 270,
    labels: { home: [0, 28, 'middle'], work: [0, -18, 'middle'] }, coords: true,
  }),
  sample({
    title: 'Sample 2',
    input: { home: [2, 1], work: [0, 0], errands: [[0, 0], [0, 1], [2, 0], [2, 1], [3, 1]] },
    expected: 3, unit: 56, gx: 40, gy: 120, rx: 266,
    labels: { home: [-12, -12, 'end'], work: [0, 28, 'middle'] }, coords: false,
  }),
];
