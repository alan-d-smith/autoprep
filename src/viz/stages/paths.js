// Step-through diagrams: topological sort, Dijkstra and binary lifting.

import { text, row, table, graph, arrow, arrowHead, dot } from '../draw.js';
import { frame, range } from './common.js';

// A ring around a vertex: blue or green for "this one", red for "rejected".
const ring = (x, y, r, cls) => (cls === 'bad'
  ? dot(x, y, 'bad', r)
  : `<path class="v-line ${cls}" d="M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0"/>`);
const pad = (values, n) => [...values, ...Array(Math.max(0, n - values.length)).fill('')];

function topo() {
  // Labels chosen so the order Kahn's algorithm finds is not alphabetical: edges such as b → a point backwards in it.
  const nodes = { b: [50, 50], e: [50, 160], a: [160, 50], c: [160, 160], g: [270, 90], d: [270, 190], f: [380, 130] };
  const edges = [['b', 'a'], ['e', 'a'], ['e', 'c'], ['a', 'g'], ['c', 'g'], ['c', 'd'], ['g', 'f'], ['d', 'f']];
  const ids = Object.keys(nodes);
  const below = new Set(['e', 'c', 'd']); // where a vertex's in-degree is written, clear of its edges
  const indeg = Object.fromEntries(ids.map((k) => [k, 0]));
  for (const [, b] of edges) indeg[b]++;
  const queue = ids.filter((k) => !indeg[k]);
  const out = [], removed = new Set();
  const W = 440, H = 310;
  const note = (id, value, cls) => text(nodes[id][0], nodes[id][1] + (below.has(id) ? 28 : -26), value, `v-note ${cls}`);
  const draw = ({ cur = null, edge = null, fresh = null } = {}) =>
    graph(nodes, edges, {
      directed: true,
      nodeCls: (id) => (id === cur ? 'current' : out.includes(id) ? 'done' : queue.includes(id) ? 'wait' : ''),
      edgeCls: (a, b) => (edge && a === edge[0] && b === edge[1] ? 'hl' : removed.has(`${a}${b}`) ? 'dim' : ''),
    })
    + (edge ? ring(...nodes[edge[1]], 20, 'hl') : '')
    + ids.filter((id) => !out.includes(id)).map((id) => note(id, `in ${indeg[id]}`, edge && id === edge[1] ? (indeg[id] ? 'hl' : 'wait') : '')).join('')
    + row(pad(queue, ids.length), { x: 90, y: 236, size: 30, name: 'queue', cls: (i) => (i >= queue.length ? '' : queue[i] === fresh ? 'hl' : 'wait') })
    + row(pad(out, ids.length), { x: 90, y: 274, size: 30, name: 'order', cls: (i) => (i >= out.length ? '' : out[i] === cur && edge === null ? 'hl' : 'good') });

  const frames = [frame(W, H, draw(),
    `Kahn's algorithm. in[v] counts the edges into v. ${queue.join(' and ')} ${queue.length > 1 ? 'have' : 'has'} none, so ${queue.length > 1 ? 'they start' : 'it starts'} in the queue.`)];
  while (queue.length) {
    const u = queue.shift();
    out.push(u);
    const outs = edges.filter(([a]) => a === u);
    frames.push(frame(W, H, draw({ cur: u }), `Dequeue ${u} and append it to the order. ${outs.length
      ? `Now delete its ${outs.length === 1 ? 'outgoing edge' : `${outs.length} outgoing edges, one at a time`}.`
      : `${u} has no outgoing edges.`}`));
    for (const [a, b] of outs) {
      indeg[b]--;
      removed.add(`${a}${b}`);
      const freed = indeg[b] === 0;
      if (freed) queue.push(b);
      frames.push(frame(W, H, draw({ cur: u, edge: [a, b], fresh: freed ? b : null }), freed
        ? `Delete ${a} → ${b}: in[${b}] drops from 1 to 0. Nothing else has to come before ${b}, so enqueue it.`
        : `Delete ${a} → ${b}: in[${b}] drops from ${indeg[b] + 1} to ${indeg[b]}. ${indeg[b] === 1 ? 'One more edge still points' : `${indeg[b]} more edges still point`} into ${b}.`));
    }
  }
  removed.clear(); // the last picture shows every edge again, so you can see each one point forward
  frames.push(frame(W, H, draw(),
    `Order: ${out.join(', ')}. Every edge points forward in it. If the queue empties before all ${ids.length} are output, the graph has a cycle.`));
  return [{ title: 'Topological sort', frames }];
}

function shortestPaths() {
  const nodes = { S: [50, 110], A: [170, 40], B: [170, 180], C: [290, 40], D: [290, 180], T: [400, 110] };
  const edges = [['S', 'A', 4], ['S', 'B', 1], ['B', 'A', 2], ['A', 'C', 1], ['B', 'C', 5], ['B', 'D', 4], ['C', 'T', 3], ['D', 'T', 3]];
  const ids = Object.keys(nodes);
  const below = new Set(['B', 'D']);
  const dist = Object.fromEntries(ids.map((k) => [k, Infinity]));
  const via = {};
  const done = new Set(), examined = new Set();
  const show = (d) => (d === Infinity ? '∞' : d);
  // The priority queue, kept sorted: a binary heap pops entries in this order.
  const byKey = (p, q) => p[0] - q[0] || (p[1] < q[1] ? -1 : 1);
  const stale = ([d, v]) => done.has(v) || d > dist[v];
  let pq = [[0, 'S']];
  dist.S = 0;
  const W = 450, H = 276;
  const note = (id, cls) => text(nodes[id][0], nodes[id][1] + (below.has(id) ? 28 : -26), show(dist[id]), `v-note ${cls}`);
  const draw = ({ cur = null, edge = null, improved = false, popping = false, fresh = null, final = false } = {}) =>
    graph(nodes, edges, {
      directed: true,
      nodeCls: (id) => (id === cur ? 'current' : done.has(id) ? 'done' : dist[id] < Infinity ? 'wait' : ''),
      edgeCls: (a, b) => (final ? (via[b] === a ? 'good' : 'dim')
        : edge && a === edge[0] && b === edge[1] ? (improved ? 'hl' : 'bad')
        : via[b] === a && (done.has(b) || b === cur) ? 'good' // the edge that fixed b's distance, green from the frame that settles b
        : examined.has(`${a}${b}`) && via[b] !== a ? 'dim' : ''),
    })
    + (edge ? ring(...nodes[edge[1]], 20, improved ? 'hl' : 'bad') : '')
    + ids.map((id) => note(id, edge && id === edge[1] ? (improved ? 'hl' : 'bad') : done.has(id) ? 'good' : '')).join('')
    + row(pad(pq.map(([d, v]) => `${d} ${v}`), 5), {
      x: 100, y: 230, size: 40, name: 'queue',
      cls: (i) => (i >= pq.length ? '' : popping && i === 0 ? (stale(pq[0]) ? 'bad' : 'hl') : pq[i] === fresh ? 'hl' : stale(pq[i]) ? 'dim' : 'wait'),
    });

  const frames = [frame(W, H, draw(), 'Dijkstra from S. Every distance starts at ∞ except dist[S] = 0, and the priority queue holds (0, S). Entries are (distance, vertex).')];
  while (pq.length) {
    pq.sort(byKey);
    const [d, u] = pq[0];
    if (stale(pq[0])) {
      frames.push(frame(W, H, draw({ popping: true }), `Pop (${d}, ${u}). ${u} is already settled at ${dist[u]}, so this entry is out of date: skip it.`));
      pq.shift();
      continue;
    }
    const outs = edges.filter(([a]) => a === u);
    frames.push(frame(W, H, draw({ cur: u, popping: true }), `Pop (${d}, ${u}), the smallest entry, and settle ${u} at ${d}: with no negative edges, no later path can be shorter.${outs.length ? '' : ` ${u} has no outgoing edges.`}`));
    pq.shift();
    done.add(u);
    for (const [a, b, w] of outs) {
      examined.add(`${a}${b}`);
      const cand = dist[a] + w, before = dist[b];
      const improved = !done.has(b) && cand < before;
      let fresh = null;
      if (improved) {
        dist[b] = cand;
        via[b] = a;
        fresh = [cand, b];
        pq.push(fresh);
        pq.sort(byKey);
      }
      const head = `Edge ${a} → ${b} (${w}): `;
      frames.push(frame(W, H, draw({ cur: u, edge: [a, b], improved, fresh }), done.has(b)
        ? `${head}${b} is already settled, so nothing changes.`
        : improved
          ? `${head}${dist[a]} + ${w} = ${cand} < ${show(before)}, so dist[${b}] = ${cand}. Push (${cand}, ${b})${before < Infinity ? `; the old (${before}, ${b}) stays in the queue, now out of date` : ''}.`
          : `${head}${dist[a]} + ${w} = ${cand} is not less than ${before}, so nothing changes.`));
    }
  }
  const pathTo = (v) => { const p = []; for (; v; v = via[v]) p.unshift(v); return p; };
  const beaten = edges.find(([a, b, w]) => a === 'S' && via[b] !== 'S' && dist[b] < w);
  frames.push(frame(W, H, draw({ final: true }),
    `Shortest-path tree in green. S to T costs ${dist.T}: ${pathTo('T').join(' → ')}.${beaten ? ` The direct edge S → ${beaten[1]} (${beaten[2]}) lost to ${pathTo(beaten[1]).join(' → ')} (${dist[beaten[1]]}).` : ''}`));
  return [{ title: "Dijkstra's algorithm", frames }];
}

function binaryLifting() {
  // Vertex 0 is the root and points to itself, as in KACTL's treeJump.
  const parent = [0, 0, 1, 2, 3, 4, 5, 6, 2, 8, 9];
  const n = parent.length;
  const depth = parent.map(() => 0);
  for (let v = 1; v < n; v++) depth[v] = depth[parent[v]] + 1;
  const maxDepth = Math.max(...depth);
  let LOG = 1;
  while ((1 << LOG) <= maxDepth) LOG++;
  const up = [parent.slice()];
  for (let j = 1; j < LOG; j++) up.push(range(n).map((v) => up[j - 1][up[j - 1][v]]));

  // Depth runs left to right. The path from the root to the deepest vertex is the top row; the rest hang below it.
  const deep = depth.indexOf(maxDepth);
  const spine = new Set();
  for (let v = deep; ; v = parent[v]) { spine.add(v); if (!v) break; }
  const others = range(n).filter((v) => !spine.has(v));
  const branchDeep = others.reduce((best, v) => (depth[v] > depth[best] ? v : best), others[0]);
  const STEP = 58, X = (d) => 32 + d * STEP, SPINE = 86, BRANCH = 176, R = 13;
  const pos = range(n).map((v) => [X(depth[v]), spine.has(v) ? SPINE : BRANCH]);
  const nodes = Object.fromEntries(range(n).map((v) => [String(v), pos[v]]));
  const edges = range(n).filter((v) => v).map((v) => [String(parent[v]), String(v)]);

  // A jump from one vertex to an ancestor: arcs above the top row, below the bottom row, a straight arrow between rows.
  const arc = (from, to, cls) => {
    const [x1, y1] = pos[from], [x2, y2] = pos[to];
    if (y1 === y2) {
      // Leave from left of centre and land right of centre, so a jump out never starts under the arrowhead of a jump in.
      const s = y1 === SPINE ? -1 : 1, h = 14 + ((x1 - x2) / STEP) * 10, a = x1 - 5, b = x2 + 5;
      return `<path class="v-link ${cls}" d="M${a} ${y1 + s * (R - 1)} C${a} ${y1 + s * (R + h)} ${b} ${y1 + s * (R + h)} ${b} ${y2 + s * (R + 3)}" marker-end="url(#${arrowHead(cls)})"/>`;
    }
    const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    return arrow(x1 + ux * R, y1 + uy * R, x2 - ux * (R + 4), y2 - uy * (R + 4), cls);
  };

  const filled = new Set();
  const W = 470, H = 346, TX = 76, TY = 248;
  const draw = ({ nodeCls = () => '', arcs = [], rings = [], cellCls = () => '', path = null } = {}) =>
    range(maxDepth + 1).map((d) => text(X(d), 12, `d${d}`, 'v-idx')).join('')
    + arcs.map(([f, t, c]) => arc(f, t, c)).join('')
    + graph(nodes, edges, {
      r: R,
      nodeCls: (id) => nodeCls(+id),
      edgeCls: (a, b) => (path ? (path.has(+a) && path.has(+b) ? 'good' : 'dim') : ''),
    })
    + rings.map(([v, c]) => ring(...pos[v], R + 5, c)).join('')
    + table(LOG, n, (j, v) => ({ v: filled.has(`${j},${v}`) ? up[j][v] : '', cls: cellCls(j, v) }),
      { x: TX, y: TY, size: 30, rowHead: range(LOG).map((j) => `up[${j}]`), colHead: range(n) });

  const frames = [frame(W, H, draw(),
    `up[j][v] is v's 2^j-th ancestor. Depth runs left to right, and the root, 0, points to itself so a jump can't fall off the top.`)];

  // Building the table, one row per power of two.
  range(n).forEach((v) => filled.add(`0,${v}`));
  frames.push(frame(W, H, draw({ cellCls: (j) => (j === 0 ? 'good' : '') }),
    'Row 0 is the parent: up[0][v] = parent[v], with up[0][0] = 0. Each later row doubles the jump.'));
  for (let j = 1; j < LOG; j++) {
    for (const v of [deep, branchDeep]) {
      const mid = up[j - 1][v], res = up[j][v];
      filled.add(`${j},${v}`);
      frames.push(frame(W, H, draw({
        nodeCls: (x) => (x === v ? 'current' : x === mid ? 'wait' : ''),
        arcs: [[v, mid, 'hl'], [mid, res, 'hl']],
        rings: [[res, 'good']],
        cellCls: (r, c) => (r === j && c === v ? 'hl' : r === j - 1 && (c === v || c === mid) ? 'wait' : ''),
      }), `up[${j}][${v}] = up[${j - 1}][up[${j - 1}][${v}]] = up[${j - 1}][${mid}] = ${res}: two jumps of ${2 ** (j - 1)} make one of ${2 ** j}.`));
    }
    range(n).forEach((v) => filled.add(`${j},${v}`));
    const shallow = range(n).filter((v) => v && depth[v] < 2 ** j);
    const clamp = shallow.reduce((best, v) => (depth[v] > depth[best] ? v : best), shallow[0]);
    frames.push(frame(W, H, draw({
      nodeCls: (x) => (x === clamp ? 'current' : x === 0 ? 'done' : ''),
      cellCls: (r, c) => (r === j ? (c === clamp ? 'hl' : 'good') : ''),
    }), `Row ${j} is filled the same way for every vertex. A jump past the root stops there: ${clamp} is only ${depth[clamp]} deep, so up[${j}][${clamp}] = 0.`));
  }

  // k-th ancestor: one jump per set bit of k.
  const k = maxDepth - 2;
  const bits = k.toString(2);
  const kParts = range(LOG).reverse().filter((j) => k >> j & 1).map((j) => 2 ** j);
  frames.push(frame(W, H, draw({ nodeCls: (x) => (x === deep ? 'current' : '') }),
    `Query: the ${k}th ancestor of ${deep}. ${k} is ${bits} in binary, so jump ${kParts.join(', then ')}.`));
  let at = deep, jumps = 0;
  const trail = [deep], done = [];
  for (let j = LOG - 1; j >= 0; j--) {
    if (!(k >> j & 1)) {
      frames.push(frame(W, H, draw({
        nodeCls: (x) => (x === at ? 'current' : trail.includes(x) ? 'done' : ''),
        arcs: done.map(([f, t]) => [f, t, 'good']),
      }), `Bit ${j} of ${k} is 0: no jump of ${2 ** j}. Stay at ${at}.`));
      continue;
    }
    const from = at;
    at = up[j][at];
    jumps++;
    trail.push(at);
    done.push([from, at]);
    frames.push(frame(W, H, draw({
      nodeCls: (x) => (x === at ? 'current' : trail.includes(x) ? 'done' : ''),
      arcs: done.map(([f, t], i) => [f, t, i === done.length - 1 ? 'hl' : 'good']),
      cellCls: (r, c) => (r === j && c === from ? 'hl' : ''),
    }), `Bit ${j} of ${k} is 1: jump ${2 ** j} with up[${j}][${from}] = ${at}.`));
  }
  frames.push(frame(W, H, draw({ nodeCls: (x) => (x === at ? 'current' : trail.includes(x) ? 'done' : 'dim'), arcs: done.map(([f, t]) => [f, t, 'good']) }),
    `The ${k}th ancestor of ${deep} is ${at}, at depth ${maxDepth} − ${k} = ${depth[at]}: ${jumps} jumps instead of ${k}. Any k takes at most log₂ n.`));

  // LCA of the deepest vertex and the deepest vertex off its path.
  let a = deep, b = branchDeep;
  const seen = new Set([a, b]);
  const diff = depth[a] - depth[b];
  frames.push(frame(W, H, draw({ nodeCls: (x) => (x === a || x === b ? 'current' : '') }),
    `LCA(${a}, ${b}). ${a} is at depth ${depth[a]} and ${b} at depth ${depth[b]}: first lift ${a} by the difference, ${diff}, so both are level.`));
  const kept = [];
  for (let j = LOG - 1; j >= 0; j--) {
    if (!(diff >> j & 1)) continue;
    const from = a;
    a = up[j][a];
    seen.add(a);
    kept.push([from, a]);
    frames.push(frame(W, H, draw({
      nodeCls: (x) => (x === a || x === b ? 'current' : seen.has(x) ? 'done' : ''),
      arcs: kept.map(([f, t]) => [f, t, 'hl']),
      cellCls: (r, c) => (r === j && c === from ? 'hl' : ''),
    }), `Bit ${j} of ${diff} is set: ${from} jumps to up[${j}][${from}] = ${a}. Both are at depth ${depth[a]} now, and ${a} ≠ ${b}.`));
  }
  for (let j = LOG - 1; j >= 0 && a !== b; j--) {
    const na = up[j][a], nb = up[j][b];
    const cells = (r, c) => (r === j && (c === a || c === b) ? (na === nb ? 'bad' : 'hl') : '');
    if (na === nb) {
      frames.push(frame(W, H, draw({
        nodeCls: (x) => (x === a || x === b ? 'current' : seen.has(x) ? 'done' : ''),
        arcs: [...kept.map(([f, t]) => [f, t, 'good']), [a, na, 'bad'], [b, nb, 'bad']],
        rings: [[na, 'bad']],
        cellCls: cells,
      }), `up[${j}][${a}] = up[${j}][${b}] = ${na}: a common ancestor, but maybe above the lowest one. Don't jump.`));
      continue;
    }
    kept.push([a, na], [b, nb]);
    const oa = a, ob = b;
    a = na;
    b = nb;
    seen.add(a).add(b);
    frames.push(frame(W, H, draw({
      nodeCls: (x) => (x === a || x === b ? 'current' : seen.has(x) ? 'done' : ''),
      arcs: kept.map(([f, t], i) => [f, t, i >= kept.length - 2 ? 'hl' : 'good']),
      cellCls: (r, c) => (r === j && (c === oa || c === ob) ? 'hl' : ''),
    }), `up[${j}][${oa}] = ${a} and up[${j}][${ob}] = ${b} differ, so the LCA is higher still: both jump ${2 ** j}.`));
  }
  const lca = a === b ? a : up[0][a];
  const onPath = new Set();
  for (const s of [deep, branchDeep]) for (let v = s; ; v = parent[v]) { onPath.add(v); if (v === lca) break; }
  frames.push(frame(W, H, draw({
    nodeCls: (x) => (x === a || x === b ? 'current' : seen.has(x) ? 'done' : ''),
    arcs: [...kept.map(([f, t]) => [f, t, 'good']), ...(a === b ? [] : [[a, lca, 'hl'], [b, lca, 'hl']])],
    rings: [[lca, 'good']],
    cellCls: (r, c) => (r === 0 && (c === a || c === b) ? 'hl' : ''),
  }), a === b ? `Both reached ${a}: that is the LCA.` : `${a} and ${b} are now children of the meeting point, so LCA = up[0][${a}] = ${lca}.`));
  frames.push(frame(W, H, draw({ nodeCls: (x) => (x === lca ? 'current' : onPath.has(x) ? 'done' : 'dim'), path: onPath, rings: [[lca, 'good']] }),
    `LCA(${deep}, ${branchDeep}) = ${lca}. The path between them has dep[${deep}] + dep[${branchDeep}] − 2·dep[${lca}] = ${depth[deep] + depth[branchDeep] - 2 * depth[lca]} edges.`));
  return [{ title: 'Binary lifting: k-th ancestor and LCA', frames }];
}

export default {
  topo,
  'shortest-paths': shortestPaths,
  'binary-lifting': binaryLifting,
};
