// Pictures for the DSU and minimum spanning trees worked problem, Ladice (Kattis ladice): the solution's
// DSU over the drawers, run on the official sample 1, one frame per item. Sample 2 is run as a check.

import { text, row, cellX, graph } from '../draw.js';
import { frame } from '../stages/common.js';

const SAMPLES = {
  1: { input: '5 3\n1 2\n1 3\n1 2\n1 3\n1 2', output: 'LADICA LADICA LADICA SMECE SMECE' },
  2: { input: '9 10\n1 2\n3 4\n5 6\n7 8\n9 10\n2 3\n1 5\n8 2\n7 9', output: 'LADICA LADICA LADICA LADICA LADICA LADICA LADICA LADICA LADICA' },
};

// The solution: drawers are vertices, stored items are edges, and room[r] counts the empty drawers in
// root r's set. A snapshot after every item records exactly what the arrays hold.
function solve(sample) {
  const [[n, L], ...items] = SAMPLES[sample].input.split('\n').map((l) => l.split(' ').map(Number));
  const p = Array.from({ length: L + 1 }, (_, i) => i), sz = Array(L + 1).fill(1), room = Array(L + 1).fill(1);
  const find = (x) => { while (p[x] !== x) x = p[x] = p[p[x]]; return x; };
  const out = [], snaps = [];
  const snap = (extra) => snaps.push({ p: [...p], room: [...room], out: [...out], ...extra });
  snap({});
  for (let i = 0; i < n; i++) {
    const [A, B] = items[i];
    let a = find(A), b = find(B);
    const ra = a, rb = b, roomA = room[a], roomB = room[b];
    if (!room[a] && !room[b]) { out.push('SMECE'); snap({ i, ra, rb, roomA, roomB }); continue; }
    let child = null;
    if (a !== b) {
      if (sz[a] < sz[b]) [a, b] = [b, a];
      p[b] = a; sz[a] += sz[b]; room[a] += room[b];
      child = b;
    }
    room[a]--;
    out.push('LADICA');
    snap({ i, ra, rb, roomA, roomB, root: a, child });
  }
  if (out.join(' ') !== SAMPLES[sample].output) throw new Error(`Ladice sample ${sample}: got ${out.join(' ')}, expected ${SAMPLES[sample].output}`);
  return { n, L, items, snaps };
}

// Names under the cells of a row.
const under = (labels, { x, y, size, gap = 4 }) => labels.map((l, i) => text(cellX(i, { x, size, gap }) + size / 2, y + size + 11, l, 'v-idx')).join('');

export default () => {
  solve(2);
  const { n, L, items, snaps } = solve(1);
  const nodes = { 2: [36, 100], 1: [150, 100], 3: [264, 100] };
  // Items on the same pair of drawers bend apart so each stays visible.
  const bendOf = items.map(([a, b], i) => {
    const same = items.map((it, k) => [it, k]).filter(([[x, y]]) => (x === a && y === b) || (x === b && y === a)).map(([, k]) => k);
    return (same.indexOf(i) - (same.length - 1) / 2) * 38;
  });
  const curve = (i, cls) => {
    const [a, b] = items[i], [x1, y1] = nodes[a], [x2, y2] = nodes[b];
    const len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len, off = bendOf[i];
    const mx = (x1 + x2) / 2 + nx * off, my = (y1 + y2) / 2 + ny * off;
    const side = off >= 0 ? 1 : -1;
    const cx = mx + nx * off, cy = my + ny * off;
    // Start and end on the circles (radius 15), heading towards the control point.
    const rim = (px, py) => { const d = Math.hypot(cx - px, cy - py); return [px + ((cx - px) / d) * 15, py + ((cy - py) / d) * 15]; };
    const [sx, sy] = rim(x1, y1), [ex, ey] = rim(x2, y2);
    return `<path class="v-edge ${cls}" fill="none" d="M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey}"/>`
      + text(mx + nx * 11 * side, my + ny * 11 * side, i + 1, `v-weight ${cls}`);
  };
  // The graph on the left, the DSU arrays on the right, the items along the bottom.
  const x = 330, size = 34, ix = 120, wide = 48, py = 56, ry = 110, iy = 196, W = 460, H = 266;
  const head = (labels, { x: x0, y, size: s0 }) => labels.map((l, i) => text(cellX(i, { x: x0, size: s0 }) + s0 / 2, y - 11, l, 'v-idx')).join('');
  const draw = (s, final = false) => {
    const cur = s.i;
    const roots = cur === undefined ? [] : [s.ra, s.rb];
    let out = '';
    for (let k = 0; k < s.out.length; k++) {
      if (s.out[k] === 'LADICA') out += curve(k, final ? 'good' : k === cur ? 'hl' : 'good');
      else if (k === cur) out += curve(k, 'bad');
    }
    const isRoot = (d) => s.p[d] === d;
    out += graph(nodes, [], { nodeCls: (id) => (roots.includes(+id) ? 'current' : final ? 'done' : '') });
    const drawers = Array.from({ length: L }, (_, k) => k + 1);
    out += text(x - 10, py - 11, 'drawer', 'v-idx', 'end') + head(drawers, { x, y: py, size });
    out += row(drawers.map((d) => s.p[d]), { x, y: py, size, name: 'p', cls: (k) => (s.child === k + 1 ? 'good' : roots.includes(k + 1) ? 'hl' : '') });
    out += row(drawers.map((d) => s.room[d]), {
      x, y: ry, size, name: 'room',
      cls: (k) => (!isRoot(k + 1) ? 'dim' : s.root === k + 1 ? 'good' : roots.includes(k + 1) ? 'hl' : ''),
    });
    out += text(ix - 10, iy - 11, 'item', 'v-idx', 'end') + head(items.map((_, k) => k + 1), { x: ix, y: iy, size: wide });
    out += row(items.map(([a, b]) => `${a}–${b}`), {
      x: ix, y: iy, size: wide, name: 'drawers',
      cls: (k) => (k >= s.out.length ? '' : s.out[k] === 'SMECE' ? 'bad' : k === cur && !final ? 'hl' : 'good'),
    });
    out += under(items.map((_, k) => (k < s.out.length ? s.out[k] : '')), { x: ix, y: iy, size: wide });
    return out;
  };
  const caption = (s) => {
    if (s.i === undefined) return `Sample 1: ${L} drawers and ${n} items. Each drawer starts as a set of its own with one empty drawer, so room is 1 at every root.`;
    const [A, B] = items[s.i];
    const head = `Item ${s.i + 1} (${A}–${B}): find(${A}) = ${s.ra}, find(${B}) = ${s.rb}`;
    if (s.out[s.i] === 'SMECE') return `${head}, and room is 0 there, so every chain of moves loops: SMECE.`;
    if (s.child === null) return `${head}, the same tree, which has room 1. Stored: LADICA. It closes a cycle, so room[${s.root}] = 0.`;
    return `${head}, two different sets with room ${s.roomA} and ${s.roomB}. Stored: LADICA. p[${s.child}] = ${s.root} and room[${s.root}] = ${s.roomA} + ${s.roomB} − 1 = ${s.room[s.root]}.`;
  };
  const frames = snaps.map((s) => frame(W, H, draw(s), caption(s)));
  const last = snaps.at(-1);
  frames.push(frame(W, H, draw({ ...last, i: undefined, ra: undefined, rb: undefined, root: undefined, child: null }, true),
    `Output: ${last.out.join(', ')}, as in the sample. The stored items are green; the thrown ones are never added to the DSU.`));
  return [{ title: 'Ladice, sample 1', frames }];
};
