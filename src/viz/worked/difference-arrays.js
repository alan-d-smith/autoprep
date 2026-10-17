// Pictures for the Difference arrays and sweeps worked problem, made by running its solution on the official sample.
// Kattis Landscape Generator: Sample 2 is one hill, H 1 6 on 7 points; Sample 1 is 13 edits on 20 points.

import { text, row, cellX, polyline, dot } from '../draw.js';
import { frame, range } from '../stages/common.js';

const SAMPLE_1 = {
  n: 20,
  edits: 'H 12 13|D 5 18|R 13 14|R 8 16|H 2 3|V 10 19|V 3 13|R 8 13|V 3 10|D 5 18|V 11 12|R 1 6|R 14 19',
  out: [1, 2, 0, -3, -7, -9, -11, -9, -7, -6, -6, -5, -3, -4, -5, -4, -4, -3, 0, 0],
};
const SAMPLE_2 = { n: 7, edits: 'H 1 6', out: [1, 2, 3, 3, 2, 1, 0] };

const num = (v) => (v < 0 ? `−${-v}` : String(v));
const signed = (v) => (v > 0 ? `+${v}` : num(v));

// The solution: Raise/Depress write d, Hill/Valley write dd, then one pass with a running slope and height.
function solve({ n, edits }) {
  const d = Array(n + 3).fill(0), dd = Array(n + 3).fill(0);
  const writes = [];
  for (const edit of edits.split('|')) {
    const [c, a, b] = edit.split(' ');
    const x1 = +a, x2 = +b, v = c === 'R' || c === 'H' ? 1 : -1;
    if (c === 'R' || c === 'D') {
      d[x1] += v;
      d[x2 + 1] -= v;
    } else {
      const at = [[x1, v], [Math.floor((x1 + x2) / 2) + 1, -v], [Math.floor((x1 + x2 + 1) / 2) + 1, -v], [x2 + 2, v]];
      for (const [i, w] of at) dd[i] += w;
      writes.push(...at);
    }
  }
  const slope = [0], h = [0];
  for (let i = 1; i <= n; i++) {
    slope.push(slope[i - 1] + dd[i]);
    h.push(h[i - 1] + d[i] + slope[i]);
  }
  return { d, dd, slope, h, writes };
}

function check(sample, h) {
  if (h.slice(1).join() !== sample.out.join()) throw new Error(`Landscape Generator: the solution gives ${h.slice(1).join(' ')}, the sample output is ${sample.out.join(' ')}`);
}

function hill() {
  const { n } = SAMPLE_2;
  const { dd, slope, h, writes } = solve(SAMPLE_2);
  check(SAMPLE_2, h);
  const cells = n + 1; // points 1..n, plus n + 1, where the last write lands
  const W = 440, H = 262, x = 84, base = 98, unit = 20, ys = 128, yd = 188;
  const cx = (i) => cellX(i - 1, { x }) + 17;
  // Bars for the heights known so far (up to point `upto`), the slope row and the dd row.
  const draw = ({ upto = 0, ddKnown = true, hCls = () => '', sCls = () => '', dCls = () => '' }) => {
    let out = text(x - 10, base - 30, 'h', 'v-name', 'end');
    for (let i = 1; i <= n; i++) {
      const known = i <= upto, v = h[i];
      const top = base - Math.max(v, 0) * unit;
      if (known && v !== 0) out += `<g class="v-bar ${hCls(i)}"><rect x="${cx(i) - 14}" y="${top}" width="28" height="${Math.abs(v) * unit}" rx="4"/></g>`;
      if (known) out += text(cx(i), top - 10, num(v), `v-note ${hCls(i)}`);
    }
    out += `<path class="v-axis" d="M${x - 4} ${base} H${cx(cells) + 17}"/>`;
    out += row(range(cells).map((k) => (k + 1 <= upto && k + 1 <= n ? num(slope[k + 1]) : '')), { x, y: ys, name: 'slope', cls: (k) => (k + 1 > n ? 'void' : sCls(k + 1)) });
    out += row(range(cells).map((k) => (ddKnown ? signed(dd[k + 1]) : '')), { x, y: yd, name: 'dd', index: true, indexFrom: 1, cls: (k) => dCls(k + 1) });
    return out;
  };
  const written = new Set(writes.map(([i]) => i));
  const [x1, x2] = SAMPLE_2.edits.split(' ').slice(1).map(Number);
  const frames = [];
  frames.push(frame(W, H, draw({ upto: n, ddKnown: false, dCls: () => 'dim', sCls: (i) => (slope[i] > 0 ? 'good' : slope[i] < 0 ? 'bad' : 'wait') }),
    `The hill H ${x1} ${x2}: heights ${h.slice(1, n + 1).join(', ')}. The step into each point is +1 up to the middle, 0 between the two middle points, then −1.`));
  frames.push(frame(W, H, draw({ upto: 0, dCls: (i) => (written.has(i) ? 'hl' : '') }),
    `Four writes record the hill: ${[...written].sort((a, b) => a - b).map((i) => `dd[${i}] ${dd[i] > 0 ? '+=' : '−='} ${Math.abs(dd[i])}`).join(', ')}.`));
  const mid = Math.floor((x1 + x2) / 2) + 1;
  for (const upto of [mid, n]) {
    frames.push(frame(W, H, draw({
      upto,
      hCls: (i) => (i === upto && upto < n ? 'hl' : upto === n ? 'good' : ''),
      sCls: (i) => (i === upto && upto < n ? 'hl' : ''),
      dCls: (i) => (i === upto && upto < n ? 'wait' : i <= upto ? 'done' : 'dim'),
    }), upto < n
      ? `Point ${upto}: slope = ${num(slope[upto - 1])} ${dd[upto] < 0 ? '−' : '+'} ${Math.abs(dd[upto])} = ${num(slope[upto])}, and h = ${num(h[upto - 1])} + ${num(slope[upto])} = ${num(h[upto])}.`
      : `The pass is over: heights ${h.slice(1, n + 1).join(', ')}, the sample's output. dd[${n + 1}] is never read.`));
  }
  return { title: 'Landscape Generator, sample 2', frames };
}

function landscape() {
  const { n } = SAMPLE_1;
  const { h } = solve(SAMPLE_1);
  check(SAMPLE_1, h);
  const W = 440, H = 214, x = 40, pitch = 20, base = 52, unit = 10;
  const px = (i) => x + (i - 1) * pitch, py = (v) => base - v * unit;
  const pts = range(n).map((k) => [px(k + 1), py(h[k + 1])]);
  let body = `<path class="v-axis" d="M${x - 10} ${base} H${px(n) + 10}"/>` + text(x - 16, base, '0', 'v-idx', 'end');
  body += polyline(pts, 'hl') + pts.map(([px1, py1]) => dot(px1, py1, 'hl', 3.5)).join('');
  for (let i = 1; i <= n; i++) {
    const v = h[i];
    body += text(px(i), v >= 0 ? py(v) - 11 : py(v) + 13, num(v), 'v-label');
    body += text(px(i), H - 12, i, 'v-idx');
  }
  return {
    title: 'Landscape Generator, sample 1',
    frames: [frame(W, H, body, `Sample 1: the ${n} heights after its ${SAMPLE_1.edits.split('|').length} edits, from ${num(Math.min(...h.slice(1)))} to ${Math.max(...h.slice(1))}.`)],
  };
}

export default () => [hill(), landscape()];
