// Pictures for the BFS, multi-source BFS and state graphs worked problem, Fire (Kattis fire2): the
// solution's two BFS passes run on the official sample, whose five maps must all give the sample's output.

import { text, row, table, legend } from '../draw.js';
import { frame } from '../stages/common.js';

const SAMPLE = `5
4 3
####
#*@.
####
7 6
###.###
#*#.#*#
#.....#
#.....#
#..@..#
#######
7 4
###.###
#....*#
#@....#
.######
5 5
.....
.***.
.*@*.
.***.
.....
3 3
###
#@#
###`;
const OUTPUT = ['2', '5', 'IMPOSSIBLE', 'IMPOSSIBLE', 'IMPOSSIBLE'];

const dr = [1, -1, 0, 0], dc = [0, 0, 1, -1];

// The solution's bfs: squares are id = r * w + c, and square v may only be entered at a time below
// fire[v] (fire[v] = −1: it never burns). Records each pop with what it accepted and refused.
function bfs({ w, h, g }, sources, fire) {
  const dist = Array(w * h).fill(-1), q = [], pops = [];
  for (const s of sources) { dist[s] = 0; q.push(s); }
  while (q.length) {
    const u = q.shift(), took = [], refused = [];
    for (let k = 0; k < 4; k++) {
      const r = Math.floor(u / w) + dr[k], c = (u % w) + dc[k], v = r * w + c;
      if (r < 0 || r >= h || c < 0 || c >= w || g[r][c] === '#' || dist[v] !== -1) continue;
      if (fire[v] !== -1 && dist[u] + 1 >= fire[v]) { refused.push(v); continue; }
      dist[v] = dist[u] + 1;
      q.push(v);
      took.push(v);
    }
    pops.push({ u, took, refused, dist: [...dist], queue: [...q] });
  }
  return { dist, pops };
}

function solve(map) {
  const { w, h, g } = map, all = [...Array(w * h).keys()];
  const at = (ch) => all.filter((v) => g[Math.floor(v / w)][v % w] === ch);
  const fire = bfs(map, at('*'), Array(w * h).fill(-1)).dist;
  const run = bfs(map, at('@'), fire);
  const edge = (v) => { const r = Math.floor(v / w), c = v % w; return r === 0 || r === h - 1 || c === 0 || c === w - 1; };
  const out = all.filter((v) => edge(v) && run.dist[v] !== -1).map((v) => run.dist[v] + 1);
  return { ...map, fire, ...run, edge, answer: out.length ? String(Math.min(...out)) : 'IMPOSSIBLE' };
}

const maps = [];
{
  const lines = SAMPLE.split('\n');
  let i = 1;
  for (let t = 0; t < +lines[0]; t++) {
    const [w, h] = lines[i++].split(' ').map(Number);
    maps.push({ w, h, g: lines.slice(i, i + h) });
    i += h;
  }
}

const name = (v, w) => `(${Math.floor(v / w)}, ${v % w})`;

export default () => {
  const runs = maps.map(solve);
  runs.forEach((m, t) => {
    if (m.answer !== OUTPUT[t]) throw new Error(`Fire sample map ${t + 1}: got ${m.answer}, expected ${OUTPUT[t]}`);
  });
  const m = runs[1], frames = [];
  const { w, h, g } = m;
  const wall = (v) => g[Math.floor(v / w)][v % w] === '#';
  const ch = (v) => g[Math.floor(v / w)][v % w];

  // The map as given: walls, fires, your start and the one open square on the edge.
  const s0 = 34, x0 = (450 - w * s0) / 2 + 6;
  frames.push(frame(450, 290,
    table(h, w, (r, c) => {
      const v = r * w + c;
      if (wall(v)) return { cls: 'wall' };
      if (ch(v) === '*') return { v: '*', cls: 'bad' };
      if (ch(v) === '@') return { v: '@', cls: 'hl' };
      return { cls: m.edge(v) ? 'good' : '' };
    }, { x: x0, y: 34, size: s0, rowHead: [...Array(h).keys()], colHead: [...Array(w).keys()] })
    + legend([['bad', 'fire'], ['hl', 'you'], ['good', 'way out'], ['wall', 'wall']], { x: x0 - 40, y: 34 + h * s0 + 26 }),
    `Sample map 2: ${m.fire.filter((t) => t === 0).length} fires, your start @, and the open squares on the edge: ${m.fire.map((_, v) => v).filter((v) => !wall(v) && m.edge(v)).map((v) => name(v, w)).join(', ')}.`));

  // The fire times and your times side by side, with chosen squares marked in either grid.
  const s = 27, lx = 34, rx = 246, gy = 40;
  const twin = (map, fireMarks, distMarks, dist, extra = '') => {
    const cell = (marks, value) => (r, c) => {
      const v = r * map.w + c;
      if (map.g[r][c] === '#') return { cls: 'wall' };
      const val = value(v);
      return { v: val === -1 ? '' : val, cls: marks(v) };
    };
    const heads = { rowHead: [...Array(map.h).keys()], colHead: [...Array(map.w).keys()] };
    return text(lx, 10, 'fire', 'v-name', 'start') + text(rx, 10, 'dist', 'v-name', 'start')
      + table(map.h, map.w, cell(fireMarks, (v) => map.fire[v]), { x: lx, y: gy, size: s, ...heads })
      + table(map.h, map.w, cell(distMarks, (v) => dist[v]), { x: rx, y: gy, size: s, colHead: heads.colHead })
      + extra;
  };
  const start = m.dist.indexOf(0);
  const fireCls = (v) => (m.fire[v] === 0 ? 'bad' : '');
  frames.push(frame(450, 220, twin(m, fireCls, (v) => (v === start ? 'hl' : ''), m.dist.map((d, v) => (v === start ? 0 : -1))),
    'fire[v] for every square, from one BFS that starts with both fires at time 0. Your BFS has not started: dist is 0 at your start only.'));

  // Your BFS mid-run: the pop that both accepts a square and refuses two.
  const pop = m.pops.find((p) => p.took.length && p.refused.length >= 2);
  if (!pop) throw new Error('Fire: expected a pop that accepts one square and refuses two');
  const mark = (v) => (v === pop.u ? 'hl' : pop.took.includes(v) ? 'good' : pop.refused.includes(v) ? 'bad' : '');
  const qy = gy + h * s + 30;
  frames.push(frame(450, qy + 50, twin(m, (v) => mark(v) || fireCls(v), (v) => mark(v) || (pop.queue.includes(v) ? 'wait' : ''), pop.dist)
    + row(pop.queue.map((v) => `${Math.floor(v / w)},${v % w}`), { x: rx - 150, y: qy, size: 34, name: 'q', cls: (i) => (pop.took.includes(pop.queue[i]) ? 'good' : 'wait') }),
  `Pop ${name(pop.u, w)} at time ${pop.dist[pop.u]}. ${pop.took.map((v) => `${name(v, w)} is accepted: ${pop.dist[v]} < fire ${m.fire[v]}`).join('. ')}. ${pop.refused.map((v) => name(v, w)).join(' and ')} are refused: the fire is there at ${pop.refused.map((v) => m.fire[v]).join(' and ')}.`));

  // The end: the way out, one step ahead of the fire all the way.
  const exit = m.dist.findIndex((d, v) => d !== -1 && m.edge(v) && String(d + 1) === m.answer);
  const prev = (v) => {
    for (let k = 0; k < 4; k++) {
      const r = Math.floor(v / w) + dr[k], c = (v % w) + dc[k];
      if (r >= 0 && r < h && c >= 0 && c < w && m.dist[r * w + c] === m.dist[v] - 1) return r * w + c;
    }
    throw new Error('Fire: no previous square on the way out');
  };
  const path = [exit];
  while (m.dist[path.at(-1)] > 0) path.push(prev(path.at(-1)));
  if (path.some((v) => m.fire[v] !== -1 && m.dist[v] >= m.fire[v])) throw new Error('Fire: the way out enters a square after it burns');
  const close = path.filter((v) => m.fire[v] - m.dist[v] === 1).reverse();
  const onPath = (v) => (path.includes(v) ? 'good' : '');
  const ex = rx + (exit % w) * s + s / 2;
  frames.push(frame(450, 220, twin(m, (v) => onPath(v) || fireCls(v), onPath, m.dist,
    text(ex, gy - 26, `out at ${m.answer}`, 'v-note good')),
  `dist reaches the edge square ${name(exit, w)} at ${m.dist[exit]}, so you are out at ${m.answer}. Along the way (green) dist < fire on every square, by one second at ${close.map((v) => name(v, w)).join(', ')}.`));

  // Map 3: the fire reaches the only usable way out first.
  const m3 = runs[2];
  const refusedAll = new Set(m3.pops.flatMap((p) => p.refused));
  frames.push(frame(450, 40 + m3.h * s + 20, twin(m3, (v) => (refusedAll.has(v) ? 'bad' : m3.fire[v] === 0 ? 'bad' : ''), (v) => (refusedAll.has(v) ? 'bad' : m3.dist[v] === 0 ? 'hl' : ''), m3.dist),
    `Sample map 3 at the end: the fire reaches ${[...refusedAll].map((v) => name(v, m3.w)).join(' and ')} before you could, and no square you reach is on the edge: IMPOSSIBLE.`));

  return [{ title: 'Fire: two BFS passes on the sample', frames }];
};
