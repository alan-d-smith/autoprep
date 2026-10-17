// Pictures for the Binary lifting and LCA worked problem, made by running its solution on the official sample.
// Kattis "Tourists", sample 1: the jump table, lca(2, 6) climbed level by level, then every pair's length.

import { text, table, graph, arrowHead, dot } from '../draw.js';
import { frame, range } from '../stages/common.js';

const SAMPLE = {
  n: 10,
  edges: [[3, 4], [3, 7], [1, 4], [4, 6], [1, 10], [8, 10], [2, 8], [1, 5], [4, 9]],
  output: 55,
  walk: [2, 6], // the pair whose LCA the slides climb
};

export default function tourists() {
  const { n, edges } = SAMPLE;
  const adj = range(n + 1).map(() => []);
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }

  // build(1): BFS for depths and parents (the root points to itself), then each level from the one below.
  const dep = Array(n + 1).fill(-1), parent = Array(n + 1).fill(1), order = [1];
  dep[1] = 0;
  for (let i = 0; i < order.length; i++) {
    for (const c of adj[order[i]]) if (dep[c] < 0) { dep[c] = dep[order[i]] + 1; parent[c] = order[i]; order.push(c); }
  }
  const maxDep = Math.max(...dep);
  // The solution keeps 18 levels; above the sample's depth they all hold the root, so the picture stops there.
  let LOG = 1;
  while (2 ** LOG <= maxDep) LOG++;
  const up = [parent];
  for (let j = 1; j < LOG; j++) up.push(range(n + 1).map((v) => up[j - 1][up[j - 1][v]]));
  const kth = (v, k) => { for (let j = LOG - 1; j >= 0; j--) if (k >> j & 1) v = up[j][v]; return v; };

  // lca(a, b) as in the solution, recording each test for the pictures.
  const lca = (a, b, log = []) => {
    if (dep[a] < dep[b]) [a, b] = [b, a];
    const from = a, k = dep[a] - dep[b];
    a = kth(a, k);
    log.push({ kind: 'level', from, k, a, b });
    if (a === b) return a;
    for (let j = LOG - 1; j >= 0; j--) {
      if (2 ** j > dep[a]) continue;
      const na = up[j][a], nb = up[j][b];
      log.push({ kind: na === nb ? 'stay' : 'jump', j, a, b, na, nb });
      if (na !== nb) { a = na; b = nb; }
    }
    log.push({ kind: 'parent', a, b, lca: up[0][a] });
    return up[0][a];
  };
  const dist = (a, b) => dep[a] + dep[b] - 2 * dep[lca(a, b)];

  // The answer: every pair x < y with y a multiple of x, length dist + 1.
  const pairs = [];
  for (let x = 1; x <= n; x++) for (let y = 2 * x; y <= n; y += x) pairs.push([x, y, dist(x, y) + 1]);
  const total = pairs.reduce((s, [, , len]) => s + len, 0);
  if (total !== SAMPLE.output) throw new Error(`Tourists sample: got ${total}, expected ${SAMPLE.output}`);

  // Layout: depth runs down the page; leaves take slots left to right and a parent sits over its children.
  const children = range(n + 1).map((v) => (v ? adj[v].filter((c) => parent[c] === v && c !== 1) : []));
  const slot = [];
  let next = 0;
  const place = (v) => {
    if (!children[v].length) return (slot[v] = next++);
    const s = children[v].map(place);
    return (slot[v] = (s[0] + s.at(-1)) / 2);
  };
  place(1);
  const W = 420, R = 14, GAP = 70, X0 = (W - (next - 1) * GAP) / 2 + 10, Y = (d) => 30 + d * 50;
  const pos = range(n + 1).map((v) => (v ? [X0 + slot[v] * GAP, Y(dep[v])] : null));
  const nodes = Object.fromEntries(range(n + 1).filter((v) => v).map((v) => [String(v), pos[v]]));
  const treeEdges = range(n + 1).filter((v) => v > 1).map((v) => [String(parent[v]), String(v)]);
  const midX = pos[1][0];

  // A jump from a vertex to an ancestor: a curve that bows away from the middle of the tree.
  const arc = (from, to, cls) => {
    const [x1, y1] = pos[from], [x2, y2] = pos[to];
    const len = Math.hypot(x2 - x1, y2 - y1);
    let nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
    if ((nx < 0) !== (x1 + x2 < 2 * midX) || (nx === 0 && x1 >= midX)) { nx = -nx; ny = -ny; }
    const bend = 30 + len * 0.2;
    const cx = (x1 + x2) / 2 + nx * bend, cy = (y1 + y2) / 2 + ny * bend;
    const toward = (x, y, r) => { const d = Math.hypot(cx - x, cy - y); return [x + (cx - x) / d * r, y + (cy - y) / d * r]; };
    const [sx, sy] = toward(x1, y1, R), [ex, ey] = toward(x2, y2, R + 4);
    return `<path class="v-link ${cls}" d="M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey}" marker-end="url(#${arrowHead(cls)})"/>`;
  };
  const ring = (v, cls) => {
    const [x, y] = pos[v], r = R + 5;
    return cls === 'bad' ? dot(x, y, 'bad', r) : `<path class="v-line ${cls}" d="M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0"/>`;
  };

  const TY = Y(maxDep) + 62, CELL = 30, TX = (W - n * CELL) / 2 + 10;
  const ROWS = [['dep', (v) => dep[v]], ...range(LOG).map((j) => [`up[${j}]`, (v) => up[j][v]])];
  const draw = ({ nodeCls = () => '', path = null, arcs = [], rings = [], cellCls = () => '', withTable = true } = {}) =>
    range(maxDep + 1).map((d) => text(18, Y(d), `dep ${d}`, 'v-idx', 'start')).join('')
    + graph(nodes, treeEdges, {
      r: R,
      nodeCls: (id) => nodeCls(+id),
      edgeCls: (a, b) => (path ? (path.has(+a) && path.has(+b) ? 'good' : 'dim') : ''),
    })
    + arcs.map(([f, t, c]) => arc(f, t, c)).join('')
    + rings.map(([v, c]) => ring(v, c)).join('')
    + (withTable ? table(ROWS.length, n, (r, c) => ({ v: ROWS[r][1](c + 1), cls: cellCls(ROWS[r][0], c + 1) }),
      { x: TX, y: TY, size: CELL, rowHead: ROWS.map(([name]) => name), colHead: range(n).map((c) => c + 1) }) : '');
  const H = TY + ROWS.length * CELL + 8;

  const [ex, ey] = SAMPLE.walk, exLen = dist(ex, ey) + 1;
  const onPath = new Set();
  const top = lca(ex, ey);
  for (const s of [ex, ey]) for (let v = s; ; v = parent[v]) { onPath.add(v); if (v === top) break; }
  const pathOrder = [];
  for (let v = ex; v !== top; v = parent[v]) pathOrder.push(v);
  const down = [];
  for (let v = ey; v !== top; v = parent[v]) down.push(v);
  pathOrder.push(top, ...down.reverse());

  const frames = [];
  // 0: the problem, one pair's path.
  frames.push(frame(W, Y(maxDep) + 24, draw({
    nodeCls: (v) => (v === ex || v === ey ? 'current' : onPath.has(v) ? 'done' : ''),
    path: onPath,
    withTable: false,
  }), `Sample 1 rooted at 1. The path from ${ex} to ${ey} is ${pathOrder.join(', ')}: ${exLen} vertices, so its length is ${exLen}.`));

  // 1: the table, with one entry of level 1 shown being built.
  const deep = ex, mid = up[0][deep], res = up[1][deep];
  frames.push(frame(W, H, draw({
    nodeCls: (v) => (v === deep ? 'current' : v === mid ? 'wait' : ''),
    arcs: [[deep, mid, 'hl'], [mid, res, 'hl']],
    rings: [[res, 'good']],
    cellCls: (row, v) => (row === 'up[1]' && v === deep ? 'hl' : row === 'up[0]' && (v === deep || v === mid) ? 'wait' : ''),
  }), `The sample's table. up[1][${deep}] = up[0][up[0][${deep}]] = up[0][${mid}] = ${res}: two jumps of 1 make one of 2. Vertex 1 is the root and points to itself.`));

  // 2 and 3: lca(ex, ey), climbed as the solution does.
  const log = [];
  lca(ex, ey, log);
  const level = log[0], stays = log.filter((s) => s.kind === 'stay'), jumps = log.filter((s) => s.kind === 'jump'), last = log.at(-1);
  if (level.k === 0 || !stays.length || !jumps.length || last.kind !== 'parent') throw new Error('Tourists picture: lca walk no longer has the steps the slides describe');
  const stay = stays[0];
  frames.push(frame(W, H, draw({
    nodeCls: (v) => (v === stay.a || v === stay.b ? 'current' : v === level.from ? 'done' : ''),
    arcs: [[level.from, level.a, 'good'], [stay.a, stay.na, 'bad'], [stay.b, stay.nb, 'bad']],
    rings: [[stay.na, 'bad']],
    cellCls: (row, v) => (row === 'up[0]' && v === level.from ? 'good' : row === `up[${stay.j}]` && (v === stay.a || v === stay.b) ? 'bad' : ''),
  }), `lca(${ex}, ${ey}): ${level.from} is ${level.k} deeper, so a = kth(${level.from}, ${level.k}) = ${level.a}. At j = ${stay.j}, up[${stay.j}][${stay.a}] = up[${stay.j}][${stay.b}] = ${stay.na}: maybe above the lowest common ancestor, so no jump.`));

  const jump = jumps.at(-1);
  frames.push(frame(W, H, draw({
    nodeCls: (v) => (v === last.a || v === last.b ? 'current' : v === level.from || v === jump.a || v === jump.b ? 'done' : ''),
    arcs: [[level.from, level.a, 'good'], ...jumps.flatMap((s) => [[s.a, s.na, 'good'], [s.b, s.nb, 'good']]), [last.a, last.lca, 'hl'], [last.b, last.lca, 'hl']],
    rings: [[last.lca, 'good']],
    cellCls: (row, v) => (row === `up[${jump.j}]` && (v === jump.a || v === jump.b) ? 'good' : row === 'up[0]' && v === last.a ? 'hl' : row === 'dep' && [ex, ey, last.lca].includes(v) ? 'hl' : ''),
  }), `At j = ${jump.j}, up[${jump.j}][${jump.a}] = ${jump.na} and up[${jump.j}][${jump.b}] = ${jump.nb} differ, so both jump. lca(${ex}, ${ey}) = up[0][${last.a}] = ${last.lca}, and dist = ${dep[ex]} + ${dep[ey]} − 2·${dep[last.lca]} = ${exLen - 1}.`));

  // 4: every pair's length, by row x and column y, and the total.
  const xs = [...new Set(pairs.map(([x]) => x))], ys = range(n - 1).map((i) => i + 2);
  const len = Object.fromEntries(pairs.map(([x, y, l]) => [`${x},${y}`, l]));
  const sums = xs.map((x) => pairs.filter(([px]) => px === x).reduce((s, [, , l]) => s + l, 0));
  const C = 32, PX = 70, PY = 30, SX = PX + ys.length * C + 14;
  const body = table(xs.length, ys.length, (r, c) => {
    const l = len[`${xs[r]},${ys[c]}`];
    return l === undefined ? { cls: 'void' } : { v: l, cls: xs[r] === ex && ys[c] === ey ? 'hl' : '' };
  }, { x: PX, y: PY, size: C, rowHead: xs, colHead: ys })
    + text(PX - 10, PY - 12, 'x \\ y', 'v-head', 'end')
    + table(xs.length, 1, (r) => ({ v: sums[r], cls: 'good' }), { x: SX, y: PY, size: C, colHead: ['sum'] })
    + text(SX + C / 2, PY + xs.length * C + 16, total, 'v-note good')
    + text(SX - 8, PY + xs.length * C + 16, 'total', 'v-note', 'end');
  frames.push(frame(W, PY + xs.length * C + 30, body,
    `Every pair of the sample: row x, column y holds the length of the path from x to y. The rows sum to ${sums.join(', ')}, a total of ${total}.`));

  return [{ title: 'Tourists, sample 1', frames }];
}
