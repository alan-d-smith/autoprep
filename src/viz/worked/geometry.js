// Pictures for the Geometry: cross products, polygons and sweeps worked problem, made by running its solution on the official sample.
// Intersecting Rectangles (Kattis): sweep a vertical line over x, keeping in `active` the heights of the
// horizontal edges it crosses; a vertical edge meets another outline when an active height lies strictly inside it.

import { text, row, dot } from '../draw.js';
import { frame } from '../stages/common.js';

const SAMPLES = [
  { rects: [[0, 0, 2, 2], [1, 1, 3, 4], [5, 7, 6, 8]], answer: 1, U: 22 },
  { rects: [[0, 0, 20, 20], [1, 1, 3, 4], [2, 10, 9, 12], [11, 3, 19, 18]], answer: 0, U: 9 },
];
const NAMES = 'ABCD';
const W = 420, H = 236, ox = 36, oy = 212, PANEL = 244;

// The solution: events sorted by x; at each, look for an active height strictly between y1 and y2.
function sweep(rects) {
  const ev = rects.flatMap(([x1, y1, x2, y2], r) => [{ x: x1, y1, y2, left: true, r }, { x: x2, y1, y2, left: false, r }]).sort((a, b) => a.x - b.x);
  const active = new Set(), steps = [];
  for (const e of ev) {
    const sorted = [...active].sort((a, b) => a - b);
    const above = sorted.find((h) => h > e.y1);  // set::upper_bound(y1)
    const found = above !== undefined && above < e.y2 ? above : null;
    steps.push({ ...e, active: sorted, above, found });
    if (found !== null) return { steps, answer: 1 };
    for (const h of [e.y1, e.y2]) e.left ? active.add(h) : active.delete(h);
  }
  return { steps, answer: 0 };
}

// Where outlines meet: a horizontal edge of one rectangle strictly crossing a vertical edge of another.
function crossings(rects) {
  const out = [];
  rects.forEach(([a1, h1, a2, h2], i) => rects.forEach(([x1, y1, x2, y2], j) => {
    if (i === j) return;
    for (const h of [h1, h2]) for (const v of [x1, x2]) if (a1 < v && v < a2 && y1 < h && h < y2) out.push({ v, h, horiz: i, vert: j });
  }));
  return out;
}

const seg = (x1, y1, x2, y2, cls = '') => `<line class="v-edge ${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
const lines = (rows) => rows.map(([s, cls], k) => text(PANEL, 34 + k * 20, s, `v-note ${cls}`, 'start')).join('');

function draw({ rects, U }, { step = null, cross = [], head = [] } = {}) {
  const px = (x) => ox + x * U, py = (y) => oy - y * U;
  const maxX = Math.max(...rects.map((r) => r[2])), maxY = Math.max(...rects.map((r) => r[3]));
  let out = `<path class="v-axis" d="M${ox - 8} ${oy} H${px(maxX) + 10} M${ox} ${oy + 8} V${py(maxY) - 10}"/>`;
  out += rects.map(([x1, y1, x2, y2]) => `<path class="v-area" d="M${px(x1)} ${py(y1)} H${px(x2)} V${py(y2)} H${px(x1)} Z"/>`).join('');
  if (step) out += `<path class="v-axis" d="M${px(step.x)} ${oy + 8} V${py(maxY) - 10}"/>` + text(px(step.x), py(maxY) - 18, `x = ${step.x}`, 'v-note hl');
  // Edge states: hl = the vertical edge being checked (or an edge at a crossing), good = its height is in active,
  // bad = the active height found between y1 and y2. All y values differ, so a height names one horizontal edge.
  const inSet = (h) => step && step.active.includes(h);
  rects.forEach(([x1, y1, x2, y2], r) => {
    for (const h of [y1, y2]) {
      const cls = step && step.found === h ? 'bad' : inSet(h) ? 'good' : cross.some((c) => c.horiz === r && c.h === h) ? 'hl' : '';
      out += seg(px(x1), py(h), px(x2), py(h), cls);
    }
    for (const v of [x1, x2]) {
      const cls = step && step.r === r && step.x === v ? 'hl' : cross.some((c) => c.vert === r && c.v === v) ? 'hl' : '';
      out += seg(px(v), py(y1), px(v), py(y2), cls);
    }
    out += text(px(x1) + 9, py(y2) + 10, NAMES[r], 'v-idx');
  });
  for (const c of cross) out += dot(px(c.v), py(c.h), 'bad', 6);
  if (!step) return out + lines(head);
  for (const h of step.active) out += dot(px(step.x), py(h), h === step.found ? 'bad' : 'good', h === step.found ? 6 : 4);
  const verdict = step.found !== null
    ? [[`${step.found} is strictly between:`, 'bad'], [`a crossing. Print 1.`, 'bad']]
    : [[step.above === undefined ? `nothing above ${step.y1}` : `lowest above ${step.y1}: ${step.above} ≥ ${step.y2}`, 'good'],
      [`then ${step.left ? 'insert' : 'erase'} ${step.y1} and ${step.y2}`, '']];
  out += lines([[`${NAMES[step.r]}'s ${step.left ? 'left' : 'right'} edge,`, 'hl'], [`y from ${step.y1} to ${step.y2}`, 'hl']]);
  out += text(PANEL, 90, 'active', 'v-name', 'start');
  out += step.active.length
    ? row(step.active, { x: PANEL, y: 102, size: 24, gap: 4, cls: (k) => (step.active[k] === step.found ? 'bad' : step.active[k] === step.above ? 'hl' : '') })
    : text(PANEL, 114, '(empty)', 'v-note', 'start');
  return out + verdict.map(([s, cls], k) => text(PANEL, 156 + k * 20, s, `v-note ${cls}`, 'start')).join('');
}

const list = (a) => `{${a.join(', ')}}`;
// "A's top", "B's left": which edge of which rectangle takes part in a crossing.
const edge = (rects, c, kind) => (kind === 'horiz'
  ? `${NAMES[c.horiz]}'s ${c.h === rects[c.horiz][3] ? 'top' : 'bottom'}`
  : `${NAMES[c.vert]}'s ${c.v === rects[c.vert][0] ? 'left' : 'right'}`);

export default () => {
  const frames = [];
  SAMPLES.forEach((sample, s) => {
    const { steps, answer } = sweep(sample.rects);
    if (answer !== sample.answer) throw new Error(`Intersecting Rectangles sample ${s + 1}: the sweep gives ${answer}, not ${sample.answer}`);
    const cross = crossings(sample.rects);
    if ((cross.length > 0) !== (answer === 1)) throw new Error(`Intersecting Rectangles sample ${s + 1}: crossings disagree with the sweep`);
    frames.push(frame(W, H, draw(sample, { head: [[`Sample ${s + 1}`, ''], [`answer ${answer}`, answer ? 'bad' : 'good']] }),
      `Sample ${s + 1}: ${sample.rects.map((r, i) => `${NAMES[i]} from (${r[0]}, ${r[1]}) to (${r[2]}, ${r[3]})`).join(', ')}. The answer is ${answer}.`));
    if (cross.length) {
      frames.push(frame(W, H, draw(sample, { cross, head: cross.flatMap((c) => [[`${edge(sample.rects, c, 'horiz')} ×`, 'hl'], [`${edge(sample.rects, c, 'vert')}: (${c.v}, ${c.h})`, 'hl']]) }),
        `The outlines meet only where a horizontal edge crosses a vertical edge: ${cross.map((c) => `${edge(sample.rects, c, 'horiz')} edge crosses ${edge(sample.rects, c, 'vert')} edge at (${c.v}, ${c.h})`).join('; ')}.`));
    }
    for (const step of steps) {
      const name = `${NAMES[step.r]}'s ${step.left ? 'left' : 'right'} edge`;
      const then = `${step.left ? 'insert' : 'erase'} ${step.y1} and ${step.y2}`;
      frames.push(frame(W, H, draw(sample, { step }), step.found !== null
        ? `x = ${step.x}: ${name} runs from ${step.y1} to ${step.y2}, and active = ${list(step.active)} holds ${step.found}, strictly between: a crossing at (${step.x}, ${step.found}). Print 1.`
        : step.above === undefined
          ? `x = ${step.x}: ${name} runs from ${step.y1} to ${step.y2}, and active ${step.active.length ? `= ${list(step.active)} has no height above ${step.y1}` : 'is empty'}. No crossing, so ${then}.`
          : `x = ${step.x}: ${name} runs from ${step.y1} to ${step.y2}; the lowest height above ${step.y1} in active = ${list(step.active)} is ${step.above}, not below ${step.y2}. No crossing, so ${then}.`));
    }
  });
  return [{ title: 'Intersecting Rectangles: the sweep on both samples', frames }];
};
