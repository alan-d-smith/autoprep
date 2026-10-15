// Step-through diagrams for each path stage. Every frame is produced by running the real
// algorithm on a small example, so the pictures can't disagree with the maths.

import { svg, text, row, cellX, span, arrow, table, graph, polyline, dot } from './draw.js';

const frame = (w, h, body, caption, label) => ({ svg: svg(w, h, body, label || caption), caption });
const prefix = (a) => a.reduce((p, v) => [...p, p.at(-1) + v], [0]);
const range = (n) => [...Array(n).keys()];

// ---------- Dynamic programming ----------

function prefixSums() {
  const a = [3, 1, 4, 1, 5, 9, 2];
  const P = prefix(a);
  const W = 400, H = 150, x = 70;
  const rows = (pCls, aCls, pVals = P) =>
    row(a, { x, y: 14, name: 'a', index: true, cls: aCls }) + row(pVals, { x, y: 84, name: 'P', index: true, cls: pCls });
  const l = 2, r = 5;
  const b = [2, -1, 3, -2, -2, 4];
  const Q = prefix(b);
  return [{
    title: 'Prefix sums',
    frames: [
      frame(W, H, rows(() => '', () => '', P.map((v, i) => (i ? '' : v))), 'P[i] will hold the sum of the first i values of a, so P[0] = 0.'),
      frame(W, H, rows((i) => (i ? 'good' : ''), () => ''), 'One pass: P[i + 1] = P[i] + a[i]. The last cell, P[7] = 25, is the total.'),
      frame(W, H + 20, rows((i) => (i === r + 1 ? 'good' : i === l ? 'bad' : 'dim'), (i) => (i >= l && i <= r ? 'hl' : 'dim')) + span(l, r, `sum = ${P[r + 1] - P[l]}`, { x, y: 10, up: true }),
        `The sum of a[2..5] is P[6] − P[2] = ${P[r + 1]} − ${P[l]} = ${P[r + 1] - P[l]}. Any range, O(1).`),
      frame(W, H + 20, row(b, { x, y: 14, name: 'b', index: true, cls: (i) => (i >= 1 && i <= 3 ? 'hl' : 'dim') }) + row(Q, { x, y: 84, name: 'P', index: true, cls: (i) => (i === 1 || i === 4 ? 'good' : 'dim') }) + span(1, 3, 'sum = 0', { x, y: 10, up: true }),
        `P[1] = P[4] = ${Q[1]}, so b[1..3] sums to zero. Counting zero-sum blocks is counting equal pairs of prefix values.`),
    ],
  }];
}

function differenceArrays() {
  const n = 8, x = 70, W = 420, H = 150;
  const d = Array(n + 1).fill(0);
  const ups = [[1, 4, 3], [3, 6, 2]];
  const frames = [];
  ups.forEach(([l, r, v], k) => {
    d[l] += v;
    d[r + 1] -= v;
    frames.push(frame(W, H, row(d.slice(0, n + 1), { x, y: 54, name: 'd', index: true, cls: (i) => (i === l || i === r + 1 ? 'hl' : '') }) + span(l, r, `+${v} on ${l}..${r}`, { x, y: 50, up: true, cls: 'wait' }),
      `Add ${v} to positions ${l}..${r}: just d[${l}] += ${v} and d[${r + 1}] −= ${v}. Two cells, however long the range.${k ? '' : ' Start from d all zero.'}`));
  });
  const a = prefix(d).slice(1);
  frames.push(frame(W, H, row(d, { x, y: 14, name: 'd', index: true, cls: () => 'dim' }) + row(a, { x, y: 84, name: 'a', index: true, cls: (i) => (a[i] ? 'good' : '') }),
    'One prefix-sum pass over d rebuilds the array. Positions 3 and 4 got both updates: 3 + 2 = 5.'));
  return [{ title: 'Difference arrays', frames }];
}

function dpBasics() {
  const v = [5, 1, 3, 8, 2, 6];
  const n = v.length, x = 70, W = 340, H = 196;
  const dp = [];
  const took = [];
  const frames = [frame(W, H, row(v, { x, y: 120, name: 'value', index: true }), 'Pick values, never two neighbours, to maximise the total. dp[i] is the best you can do with the first i + 1 values.')];
  for (let i = 0; i < n; i++) {
    const skip = i ? dp[i - 1] : 0, take = (i >= 2 ? dp[i - 2] : 0) + v[i];
    dp[i] = Math.max(skip, take);
    took[i] = take > skip;
    let links = '';
    const cx = (k) => cellX(k, { x }) + 17;
    if (i >= 1) links += arrow(cx(i - 1), 56, cx(i) - 4, 56, took[i] ? 'dim' : 'good', 1.6);
    if (i >= 2) links += arrow(cx(i - 2), 54, cx(i) - 2, 54, took[i] ? 'good' : 'dim', 2.4);
    const body = row(dp.map((d, k) => (k <= i ? d : '')), { x, y: 60, name: 'dp', cls: (k) => (k === i ? 'hl' : '') }) + row(v, { x, y: 120, name: 'value', index: true, cls: (k) => (k === i ? 'hl' : 'dim') }) + links;
    const how = i === 0 ? `dp[0] = ${v[0]}` : `dp[${i}] = max(dp[${i - 1}], ${i >= 2 ? `dp[${i - 2}] + ` : ''}${v[i]}) = max(${skip}, ${take}) = ${dp[i]}`;
    frames.push(frame(W, H, body, `${how}: ${took[i] ? `take ${v[i]}` : `skip ${v[i]}`}.`));
  }
  const chosen = new Set();
  for (let i = n - 1; i >= 0;) { if (took[i]) { chosen.add(i); i -= 2; } else i -= 1; }
  frames.push(frame(W, H, row(dp, { x, y: 60, name: 'dp', cls: (k) => (k === n - 1 ? 'good' : 'dim') }) + row(v, { x, y: 120, name: 'value', index: true, cls: (k) => (chosen.has(k) ? 'good' : 'dim') }),
    `Walk back through the choices: ${[...chosen].sort((a, b) => a - b).map((k) => v[k]).join(' + ')} = ${dp[n - 1]}.`));
  return [{ title: 'Take or skip', frames }];
}

function lis() {
  const a = [3, 1, 8, 2, 5, 9, 4, 7];
  const W = 400, H = 236, x = 70, base = 128, unit = 11;
  const tails = [], tailIdx = [], par = Array(a.length).fill(-1);
  const bars = (cls) => a.map((v, i) => {
    const bx = cellX(i, { x });
    return `<g class="v-bar ${cls(i)}"><rect x="${bx + 3}" y="${base - v * unit}" width="28" height="${v * unit}" rx="4"/></g>${text(bx + 17, base + 12, v, 'v-idx')}`;
  }).join('');
  const frames = [frame(W, H, bars(() => '') + row(['', '', '', ''], { x, y: 166, name: 'tails' }),
    'Each cell of tails, numbered by length, holds the smallest value an increasing subsequence of that length can end with.')];
  a.forEach((v, i) => {
    let k = tails.findIndex((t) => t >= v);
    const append = k === -1;
    if (append) k = tails.length;
    if (k > 0) par[i] = tailIdx[k - 1];
    const old = tails[k];
    tails[k] = v;
    tailIdx[k] = i;
    frames.push(frame(W, H, bars((j) => (j === i ? 'hl' : j < i ? '' : 'dim')) + row([...tails, ...Array(Math.max(0, 4 - tails.length)).fill('')], { x, y: 166, name: 'tails', index: true, indexFrom: 1, cls: (j) => (j === k ? (append ? 'good' : 'hl') : '') }),
      append ? `${v} is bigger than every tail, so it extends the longest subsequence: length ${tails.length}.` : `lower_bound finds the first tail ≥ ${v}: the length-${k + 1} tail ${old}. Replace it: a subsequence of length ${k + 1} can now end lower, at ${v}.`));
  });
  const seq = [];
  for (let i = tailIdx[tails.length - 1]; i !== -1; i = par[i]) seq.unshift(i);
  frames.push(frame(W, H, bars((j) => (seq.includes(j) ? 'good' : 'dim')) + row(tails, { x, y: 166, name: 'tails', index: true, indexFrom: 1, cls: () => 'dim' }),
    `Length ${tails.length}. Following parent pointers gives one: ${seq.map((j) => a[j]).join(', ')}. Use upper_bound instead for non-decreasing.`));
  return [{ title: 'Longest increasing subsequence in O(n log n)', frames }];
}

function lcs() {
  const s = 'ABCBDA', t = 'BDCAB';
  const n = s.length, m = t.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) dp[i][j] = s[i - 1] === t[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const path = new Set();
  let res = '';
  for (let i = n, j = m; i > 0 && j > 0;) {
    if (s[i - 1] === t[j - 1]) { path.add(`${i},${j}`); res = s[i - 1] + res; i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--;
  }
  const W = 330, H = 270, x = 90, y = 40;
  const draw = (upto, final) => table(n + 1, m + 1, (r, c) => {
    if (r > upto) return { v: '' };
    const match = r && c && s[r - 1] === t[c - 1];
    const cls = final ? (path.has(`${r},${c}`) ? 'good' : 'dim') : r === upto && r ? (match ? 'good' : 'hl') : '';
    return { v: dp[r][c], cls };
  }, { x, y, rowHead: ['', ...s], colHead: ['', ...t] });
  const frames = [frame(W, H, draw(0), 'dp[i][j] is the LCS of the first i letters of s (rows) and the first j letters of t (columns). Row 0 and column 0 are empty prefixes: 0.')];
  for (let i = 1; i <= n; i++) {
    frames.push(frame(W, H, draw(i), i === 1
      ? 'Where the letters match (green), dp[i][j] = dp[i − 1][j − 1] + 1. Elsewhere it is the larger of the cell above and the cell to the left.'
      : `Row ${i}, letter ${s[i - 1]}: each cell needs only the row above and the cell to its left.`));
  }
  frames.push(frame(W, H, draw(n, true), `Walking back from the corner along matches gives one LCS: ${res}, length ${dp[n][m]}.`));
  return [{ title: 'Longest common subsequence', frames }];
}

function knapsack() {
  const items = [['A', 1, 1], ['B', 3, 4], ['C', 4, 5], ['D', 5, 7]];
  const C = 7;
  const dp = [Array(C + 1).fill(0)];
  items.forEach(([, w, v], i) => dp.push(range(C + 1).map((c) => Math.max(dp[i][c], c >= w ? dp[i][c - w] + v : -Infinity))));
  const chosen = new Set();
  for (let i = items.length, c = C; i > 0; i--) if (dp[i][c] !== dp[i - 1][c]) { chosen.add(i - 1); c -= items[i - 1][1]; }
  const W = 380, H = 230, x = 110, y = 40;
  const head = ['none', ...items.map(([name, w, v]) => `${name} w${w} v${v}`)];
  const draw = (upto, final) => table(items.length + 1, C + 1, (r, c) => {
    if (r > upto) return { v: '' };
    const cls = final ? (r === items.length && c === C ? 'good' : 'dim') : r === upto && r ? 'hl' : '';
    return { v: dp[r][c], cls };
  }, { x, y, rowHead: head, colHead: range(C + 1) });
  const frames = [frame(W, H, draw(0), 'Rows are items considered so far, columns are capacity used. dp[i][c] is the best value from the first i items within capacity c.')];
  items.forEach(([name, w, v], i) => {
    const r = i + 1;
    frames.push(frame(W, H, draw(r), r === 3
      ? `Row ${name}: dp[${name}][7] = max(skip ${name}: ${dp[r - 1][7]}, take ${name}: dp[row above][7 − ${w}] + ${v} = ${dp[r - 1][7 - w] + v}) = ${dp[r][7]}.`
      : `Row ${name} (weight ${w}, value ${v}): each cell is the better of skipping ${name} or taking it from ${w} columns to the left in the row above.`));
  });
  frames.push(frame(W, H, draw(items.length, true), `Best value ${dp[items.length][C]} with items ${[...chosen].map((i) => items[i][0]).sort().join(' and ')}. With one row, loop the capacity downwards so each item is used once.`));
  return [{ title: '0/1 knapsack', frames }];
}

function intervalDp() {
  const s = 'AGBCBA';
  const n = s.length;
  const dp = Array.from({ length: n }, () => Array(n).fill(0));
  for (let len = 1; len <= n; len++) for (let l = 0; l + len - 1 < n; l++) {
    const r = l + len - 1;
    dp[l][r] = len === 1 ? 1 : s[l] === s[r] ? (len === 2 ? 2 : dp[l + 1][r - 1] + 2) : Math.max(dp[l + 1][r], dp[l][r - 1]);
  }
  const W = 300, H = 250, x = 80, y = 40;
  const draw = (upto) => table(n, n, (l, r) => {
    const len = r - l + 1;
    if (r < l) return { v: '', cls: 'void' };
    if (len > upto) return { v: '' };
    return { v: dp[l][r], cls: len === upto ? (s[l] === s[r] && len > 1 ? 'good' : 'hl') : '' };
  }, { x, y, rowHead: [...s], colHead: [...s] });
  const frames = [];
  for (let len = 1; len <= n; len++) {
    frames.push(frame(W, H, draw(len), len === 1
      ? 'dp[l][r] is the longest palindromic subsequence of s[l..r]: row l, column r, for s = AGBCBA. Every single letter is a palindrome of length 1.'
      : len === 2
        ? 'Fill by length: an interval only needs shorter intervals inside it. Green cells have equal end letters: dp[l + 1][r − 1] + 2.'
        : len === n ? `The whole string is the top-right cell: ${dp[0][n - 1]} (ABCBA).` : `Length ${len}: otherwise drop one end, max(dp[l + 1][r], dp[l][r − 1]).`));
  }
  return [{ title: 'Interval DP, filled by length', frames }];
}

function bitmaskDp() {
  const cost = [[4, 2, 8], [4, 3, 7], [3, 1, 5]];
  const dp = Array(8).fill(Infinity);
  const from = Array(8).fill(-1);
  dp[0] = 0;
  const pop = (m) => m.toString(2).split('1').length - 1;
  for (let m = 0; m < 8; m++) for (let j = 0; j < 3; j++) if (!(m >> j & 1)) {
    const nm = m | (1 << j);
    const v = dp[m] + cost[pop(m)][j];
    if (v < dp[nm]) { dp[nm] = v; from[nm] = m; }
  }
  const levels = [[0], [1, 2, 4], [3, 5, 6], [7]];
  const pos = {};
  levels.forEach((lv, d) => lv.forEach((m, k) => { pos[m] = [60 + d * 120, 130 + (k - (lv.length - 1) / 2) * 80]; }));
  const nodes = Object.fromEntries(Object.entries(pos).map(([m, p]) => [m, p]));
  const edges = [];
  for (let m = 0; m < 8; m++) for (let j = 0; j < 3; j++) if (!(m >> j & 1)) edges.push([String(m), String(m | (1 << j)), cost[pop(m)][j]]);
  const best = new Set();
  for (let m = 7; from[m] !== -1; m = from[m]) best.add(`${from[m]}-${m}`);
  const draw = (upto, final) => graph(nodes, edges, {
    directed: true, r: 19, weightAt: 0.28,
    nodeText: (m) => Number(m).toString(2).padStart(3, '0'),
    nodeNote: (m) => (pop(+m) <= upto ? dp[m] : ''),
    nodeCls: (m) => (pop(+m) > upto ? 'dim' : final ? (best.has(`${from[m]}-${m}`) || m === '0' ? 'good' : '') : pop(+m) === upto ? 'current' : 'done'),
    edgeCls: (a, b) => (final ? (best.has(`${a}-${b}`) ? 'good' : 'dim') : pop(+b) === upto ? 'hl' : pop(+b) < upto ? '' : 'dim'),
  });
  const W = 460, H = 270;
  const frames = [frame(W, H, draw(0), 'Assign 3 workers to 3 jobs. A mask is the set of jobs taken (bits read right to left: job 0, 1, 2). dp[mask] = cheapest way to fill those jobs with the first popcount(mask) workers.')];
  for (let d = 1; d <= 3; d++) frames.push(frame(W, H, draw(d), `Worker ${d - 1} takes one free job: each mask with ${d} bit${d > 1 ? 's' : ''} looks back at masks with one bit fewer, adding the edge cost.`));
  frames.push(frame(W, H, draw(3, true), `dp[111] = ${dp[7]}. 2^n masks times n transitions: O(2^n · n) instead of n! orders.`));
  return [{ title: 'DP over subsets', frames }];
}

function dpStructures() {
  const n = 8, x = 60, W = 400, H = 220, size = 34, gap = 4;
  const low = (i) => i & -i;
  const level = (i) => Math.log2(low(i));
  const bars = (cls) => range(n).map((k) => {
    const i = k + 1;
    const x1 = cellX(i - low(i), { x }), x2 = cellX(i - 1, { x }) + size;
    const yb = 70 + level(i) * 34;
    return `<g class="v-bar ${cls(i)}"><rect x="${x1 + 2}" y="${yb}" width="${x2 - x1 - 4}" height="24" rx="6"/>${text(x2 - 14, yb + 12, `t${i}`, 'v-label')}</g>`;
  }).join('');
  const top = (cls) => row(range(n).map((k) => k + 1), { x, y: 18, size, gap, name: 'i', cls });
  const walk = (i, dir) => { const out = []; for (; i >= 1 && i <= n; i = dir < 0 ? i - low(i) : i + low(i)) out.push(i); return out; };
  const q = walk(7, -1), u = walk(3, 1);
  return [{
    title: 'Fenwick tree',
    frames: [
      frame(W, H, top(() => '') + bars(() => ''), 'Node i stores the sum of the block that ends at i and has length lowbit(i), the lowest set bit of i: t4 covers 1..4, t6 covers 5..6, t7 covers just 7.'),
      frame(W, H, top((k) => (k < 7 ? 'hl' : 'dim')) + bars((i) => (q.includes(i) ? 'good' : 'dim')), `prefix(7) = ${q.map((i) => `t${i}`).join(' + ')}: drop the lowest bit each step (7 → 6 → 4). O(log n).`),
      frame(W, H, top((k) => (k === 2 ? 'hl' : 'dim')) + bars((i) => (u.includes(i) ? 'hl' : 'dim')), `Changing a[3] updates ${u.map((i) => `t${i}`).join(', ')}: add the lowest bit each step (3 → 4 → 8). For DP, index by a compressed key and store the best dp value instead of a sum.`),
    ],
  }];
}

// ---------- Graphs ----------

function dfs() {
  const nodes = { 1: [60, 60], 2: [150, 40], 3: [70, 150], 4: [160, 130], 5: [240, 170], 6: [300, 60], 7: [380, 40], 8: [400, 120], 9: [320, 170] };
  const edges = [[1, 2], [1, 3], [2, 4], [3, 4], [4, 5], [6, 7], [7, 8]].map(([a, b]) => [String(a), String(b)]);
  const adj = {};
  for (const id of Object.keys(nodes)) adj[id] = [];
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
  for (const k in adj) adj[k].sort((p, q) => p - q);
  const order = {}, comp = {}, tree = new Set();
  const events = [];
  let t = 0, c = 0;
  const visit = (u, p) => {
    order[u] = ++t;
    comp[u] = c;
    events.push({ type: 'enter', u });
    for (const v of adj[u]) {
      if (v === p) continue;
      if (order[v]) { if (order[v] < order[u]) events.push({ type: 'back', u, v }); continue; }
      tree.add(`${u}-${v}`);
      tree.add(`${v}-${u}`);
      visit(v, u);
    }
  };
  for (const s of Object.keys(nodes)) if (!order[s]) { c++; events.push({ type: 'start', u: s, c }); visit(s, null); }
  const W = 450, H = 210;
  const frames = [];
  const seen = new Set(), seenTree = new Set(), back = new Set();
  const draw = (cur, final) => graph(nodes, edges, {
    nodeCls: (id) => (final ? `comp${comp[id]}` : id === cur ? 'current' : seen.has(id) ? 'done' : ''),
    nodeNote: (id) => (seen.has(id) ? order[id] : ''),
    edgeCls: (a, b) => (back.has(`${a}-${b}`) || back.has(`${b}-${a}`) ? 'bad' : seenTree.has(`${a}-${b}`) ? 'good' : final ? 'dim' : ''),
  });
  for (const e of events) {
    if (e.type === 'start') continue;
    if (e.type === 'enter') {
      seen.add(e.u);
      for (const v of adj[e.u]) if (seen.has(v) && tree.has(`${e.u}-${v}`)) { seenTree.add(`${e.u}-${v}`); seenTree.add(`${v}-${e.u}`); }
      const fresh = Object.keys(nodes).filter((id) => comp[id] === comp[e.u]).every((id) => id === e.u || !seen.has(id));
      frames.push(frame(W, H, draw(e.u), fresh ? `Vertex ${e.u} is unvisited: start a new DFS (component ${comp[e.u]}). Numbers show the order vertices are reached.` : `Go deeper to ${e.u}, the first unvisited neighbour.`));
    } else {
      back.add(`${e.u}-${e.v}`);
      frames.push(frame(W, H, draw(e.u), `From ${e.u}, edge ${e.u}–${e.v} reaches a vertex that's already visited and isn't ${e.u}'s parent: that closes a cycle.`));
    }
  }
  frames.push(frame(W, H, draw(null, true), `${c} components. Each DFS from an unvisited vertex finds exactly one, in O(n + m) overall.`));
  return [{ title: 'Depth-first search', frames }];
}

function bfs() {
  const grid = ['..#....', '..#.##.', '.....#.', '.###.#.', '.......'];
  const R = grid.length, C = grid[0].length;
  const S = [0, 0], T = [0, 6];
  const dist = grid.map((r) => [...r].map(() => -1));
  const prev = {};
  dist[S[0]][S[1]] = 0;
  const q = [S];
  while (q.length) {
    const [r, c] = q.shift();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= C || grid[nr][nc] === '#' || dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      prev[`${nr},${nc}`] = `${r},${c}`;
      q.push([nr, nc]);
    }
  }
  const path = new Set();
  for (let k = `${T[0]},${T[1]}`; k; k = prev[k]) path.add(k);
  const max = Math.max(...dist.flat());
  const W = 330, H = 200, x = 50, y = 20, size = 36;
  const draw = (d, final) => table(R, C, (r, c) => {
    if (grid[r][c] === '#') return { v: '', cls: 'wall' };
    const v = dist[r][c];
    const label = r === S[0] && c === S[1] ? 'S' : r === T[0] && c === T[1] && (final || v > d) ? 'T' : v <= d ? v : '';
    if (final) return { v: path.has(`${r},${c}`) ? v : '', cls: path.has(`${r},${c}`) ? 'good' : 'dim' };
    return { v: label, cls: v === d ? 'hl' : v < d && v >= 0 ? 'done' : '' };
  }, { x, y, size });
  const steps = [0, 1, 2, 3, 4, 6, 8, max].filter((d, i, arr) => d <= max && arr.indexOf(d) === i);
  const frames = steps.map((d) => frame(W, H, draw(d), d === 0
    ? 'BFS from S. The queue holds the frontier; every cell gets its distance the first time it is reached.'
    : `Distance ${d}: the frontier grows one step at a time, so cells are reached in order of distance.`));
  frames.push(frame(W, H, draw(max, true), `T is ${dist[T[0]][T[1]]} steps away. Following each cell's parent back to S gives a shortest path.`));
  return [{ title: 'Breadth-first search on a grid', frames }];
}

function trees() {
  const parent = { 2: 1, 3: 1, 4: 2, 5: 2, 6: 3, 7: 5, 8: 5 };
  const nodes = { 1: [200, 30], 2: [120, 90], 3: [290, 90], 4: [70, 150], 5: [170, 150], 6: [290, 150], 7: [130, 210], 8: [210, 210] };
  const edges = Object.entries(parent).map(([c, p]) => [String(p), c]);
  const kids = {};
  for (const [c, p] of Object.entries(parent)) (kids[p] ||= []).push(c);
  const depth = { 1: 0 }, size = {}, tin = {}, order = [];
  const go = (u) => { tin[u] = order.length; order.push(u); size[u] = 1; for (const v of kids[u] || []) { depth[v] = depth[u] + 1; go(v); size[u] += size[v]; } };
  go('1');
  const sub = new Set(order.slice(tin[2], tin[2] + size[2]));
  const W = 400, H = 320;
  const orderRow = (cls) => row(order, { x: 70, y: 254, name: 'order', index: true, cls });
  return [{
    title: 'Rooted tree: depth, subtree size, DFS order',
    frames: [
      frame(W, H, graph(nodes, edges, { nodeNote: (id) => `d${depth[id]}` }), 'Root the tree at 1. One DFS sets each vertex\'s parent and depth: depth[child] = depth[parent] + 1.'),
      frame(W, H, graph(nodes, edges, { nodeNote: (id) => size[id], nodeCls: (id) => (kids[id] ? '' : 'done') }), 'Subtree sizes come after the children: size[u] = 1 + the sizes of u\'s children. Leaves (green) are 1.'),
      frame(W, H, graph(nodes, edges, { nodeCls: (id) => (sub.has(id) ? 'current' : 'dim'), edgeCls: (a, b) => (sub.has(a) && sub.has(b) ? 'hl' : 'dim') }) + orderRow((i) => (i >= tin[2] && i < tin[2] + size[2] ? 'hl' : 'dim')),
        `In DFS order, every subtree is a contiguous block: vertex 2's subtree is positions ${tin[2]}..${tin[2] + size[2] - 1}. Subtree queries become range queries.`),
    ],
  }];
}

function dsuMst() {
  const nodes = { A: [60, 60], B: [200, 40], C: [110, 160], D: [330, 70], E: [250, 170], F: [400, 170] };
  const edges = [['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 5], ['B', 'D', 10], ['C', 'E', 3], ['D', 'E', 4], ['E', 'F', 6], ['D', 'F', 11]];
  const sorted = [...edges].sort((a, b) => a[2] - b[2]);
  const p = Object.fromEntries(Object.keys(nodes).map((k) => [k, k]));
  const find = (v) => (p[v] === v ? v : (p[v] = find(p[v])));
  const state = {};
  const W = 460, H = 210;
  const frames = [frame(W, H, graph(nodes, edges), 'Kruskal: sort edges by weight and take each one unless both ends are already connected. DSU answers "connected?" in near-constant time.')];
  let total = 0;
  for (const [a, b, w] of sorted) {
    const ok = find(a) !== find(b);
    if (ok) { p[find(a)] = find(b); total += w; }
    state[`${a}${b}`] = ok ? 'good' : 'bad';
    const groups = {};
    for (const k of Object.keys(nodes)) (groups[find(k)] ||= []).push(k);
    frames.push(frame(W, H, graph(nodes, edges, { edgeCls: (x, y) => (x === a && y === b ? (ok ? 'hl' : 'bad') : state[`${x}${y}`] === 'good' ? 'good' : state[`${x}${y}`] ? 'dim' : '') }),
      `${a}–${b} (${w}): ${ok ? 'different sets, so take it and union them' : 'same set already, so it would make a cycle: skip'}. Sets: ${Object.values(groups).map((g) => `{${g.join('')}}`).join(' ')}.`));
    if (Object.keys(groups).length === 1) break;
  }
  frames.push(frame(W, H, graph(nodes, edges, { edgeCls: (x, y) => (state[`${x}${y}`] === 'good' ? 'good' : 'dim') }), `Minimum spanning tree: ${Object.keys(nodes).length - 1} edges, total ${total}.`));
  return [{ title: 'DSU and Kruskal', frames }];
}

function topo() {
  const nodes = { a: [50, 50], b: [50, 160], c: [160, 50], d: [160, 160], e: [270, 90], f: [270, 190], g: [380, 130] };
  const edges = [['a', 'c'], ['b', 'c'], ['b', 'd'], ['c', 'e'], ['d', 'e'], ['d', 'f'], ['e', 'g'], ['f', 'g']];
  const indeg = Object.fromEntries(Object.keys(nodes).map((k) => [k, 0]));
  for (const [, b] of edges) indeg[b]++;
  const queue = Object.keys(nodes).filter((k) => !indeg[k]);
  const out = [], removed = new Set();
  const W = 440, H = 270;
  const draw = (cur) => graph(nodes, edges, {
    directed: true,
    nodeCls: (id) => (id === cur ? 'current' : out.includes(id) ? 'done' : queue.includes(id) ? 'wait' : ''),
    nodeNote: (id) => (out.includes(id) ? '' : `in ${indeg[id]}`),
    edgeCls: (a, b) => (removed.has(`${a}${b}`) ? 'dim' : a === cur ? 'hl' : ''),
  }) + row([...out, ...Array(7 - out.length).fill('')], { x: 90, y: 220, size: 30, name: 'order', cls: (i) => (i < out.length ? 'good' : '') });
  const frames = [frame(W, H, draw(null), `Kahn's algorithm. "in" is each vertex's number of incoming edges. Vertices with none (amber) can go first: queue = ${queue.join(', ')}.`)];
  while (queue.length) {
    const u = queue.shift();
    out.push(u);
    const freed = [];
    for (const [a, b] of edges) if (a === u) { removed.add(`${a}${b}`); if (--indeg[b] === 0) { queue.push(b); freed.push(b); } }
    frames.push(frame(W, H, draw(u), `Output ${u} and delete its edges.${freed.length ? ` ${freed.join(' and ')} now ${freed.length > 1 ? 'have' : 'has'} no incoming edges: queue ${freed.length > 1 ? 'them' : 'it'}.` : ''}`));
  }
  frames.push(frame(W, H, draw(null), `Every edge points left to right in ${out.join(', ')}. If the queue empties before every vertex is output, there's a cycle.`));
  return [{ title: 'Topological sort', frames }];
}

function shortestPaths() {
  const nodes = { S: [50, 110], A: [170, 40], B: [170, 180], C: [290, 40], D: [290, 180], T: [400, 110] };
  const edges = [['S', 'A', 4], ['S', 'B', 1], ['B', 'A', 2], ['A', 'C', 1], ['B', 'C', 5], ['B', 'D', 4], ['C', 'T', 3], ['D', 'T', 3]];
  const dist = Object.fromEntries(Object.keys(nodes).map((k) => [k, Infinity]));
  const via = {};
  dist.S = 0;
  const done = new Set();
  const W = 450, H = 230;
  const draw = (cur, relaxed = new Set(), final = false) => graph(nodes, edges, {
    directed: true,
    nodeCls: (id) => (id === cur ? 'current' : done.has(id) ? 'done' : dist[id] < Infinity ? 'wait' : ''),
    nodeNote: (id) => (dist[id] < Infinity ? dist[id] : '∞'),
    edgeCls: (a, b) => (final ? (via[b] === a ? 'good' : 'dim') : relaxed.has(`${a}${b}`) ? 'hl' : via[b] === a && done.has(b) ? 'good' : ''),
  });
  const frames = [frame(W, H, draw(null), 'Dijkstra from S. Distances start at infinity; a priority queue always hands back the closest vertex not yet settled.')];
  while (done.size < Object.keys(nodes).length) {
    const u = Object.keys(nodes).filter((k) => !done.has(k)).sort((a, b) => dist[a] - dist[b])[0];
    done.add(u);
    const relaxed = new Set(), better = [];
    for (const [a, b, w] of edges) if (a === u && dist[u] + w < dist[b]) { dist[b] = dist[u] + w; via[b] = u; relaxed.add(`${a}${b}`); better.push(`${b} = ${dist[b]}`); }
    frames.push(frame(W, H, draw(u, relaxed), `Settle ${u} at distance ${dist[u]}: nothing can beat it later, because every edge is non-negative.${better.length ? ` Relax its edges: ${better.join(', ')}.` : ''}`));
  }
  const path = [];
  for (let v = 'T'; v; v = via[v]) path.unshift(v);
  frames.push(frame(W, H, draw(null, new Set(), true), `Shortest-path tree. S to T is ${dist.T}: ${path.join(' → ')}. Note S → A directly (4) loses to S → B → A (3).`));
  return [{ title: "Dijkstra's algorithm", frames }];
}

function binaryLifting() {
  const n = 13;
  const xs = range(n).map((i) => 30 + i * 34);
  const yLine = 150;
  const nodes = Object.fromEntries(range(n).map((i) => [String(i), [xs[i], yLine]]));
  const edges = range(n - 1).map((i) => [String(i), String(i + 1)]);
  const jump = (from, len, cls) => {
    const x1 = xs[from], x2 = xs[from - len];
    return `<path class="v-link ${cls}" d="M${x1} ${yLine - 16} C${x1} ${yLine - 30 - len * 9} ${x2} ${yLine - 30 - len * 9} ${x2} ${yLine - 18}" marker-end="url(#${cls === 'good' ? 'v-arrow-good' : cls === 'hl' ? 'v-arrow-hl' : 'v-arrow'})"/>`;
  };
  const base = (cls) => graph(nodes, edges, { r: 12, nodeCls: cls, nodeText: (id) => id });
  const W = 470, H = 190;
  const k = 11;
  const parts = [8, 2, 1];
  const frames = [frame(W, H, base((id) => (id === '12' ? 'current' : '')) + [1, 2, 4, 8].map((len) => jump(12, len, '')).join(''),
    'A path of depths 0..12. up[j][v] is v\'s 2^j-th ancestor: up[0] is the parent and up[j][v] = up[j − 1][up[j − 1][v]]. From 12: jumps of 1, 2, 4, 8.')];
  let at = 12;
  const done = [];
  for (const len of parts) {
    done.push([at, len]);
    at -= len;
    const here = at;
    frames.push(frame(W, H, base((id) => (+id === here ? 'current' : +id > here && +id <= 12 ? 'done' : '')) + done.map(([f, l], i) => jump(f, l, i === done.length - 1 ? 'hl' : 'good')).join(''),
      `k = ${k} = ${parts.join(' + ')}. Bit ${Math.log2(len)} is set: jump ${len} to depth ${here}.`));
  }
  frames.push(frame(W, H, base((id) => (+id === at ? 'current' : 'dim')) + done.map(([f, l]) => jump(f, l, 'good')).join(''),
    `The ${k}th ancestor of 12 is ${at}, in ${parts.length} jumps instead of ${k}. LCA uses the same table: lift the deeper vertex, then lift both while their ancestors differ.`));
  return [{ title: 'Binary lifting', frames }];
}

// ---------- Geometry and searching the answer ----------

function answerSearch() {
  const n = 16, answer = 11, x = 30, W = 470, H = 110, size = 24, gap = 3;
  const frames = [];
  let lo = 0, hi = n - 1;
  const known = {};
  const draw = (mid) => row(range(n), { x, y: 30, size, gap, cls: (i) => (i === mid ? 'hl' : known[i] === true ? 'good' : known[i] === false ? 'bad' : i < lo || i > hi ? 'dim' : '') })
    + (mid != null ? text(cellX(mid, { x, size, gap }) + size / 2, 16, 'mid', 'v-note hl') : '')
    + text(cellX(lo, { x, size, gap }) + size / 2, 72, 'lo', 'v-note') + text(cellX(hi, { x, size, gap }) + size / 2, 88, 'hi', 'v-note');
  frames.push(frame(W, H, draw(null), `Find the smallest x where check(x) is true. The answer is monotone: false…false, then true…true. Search 0..${n - 1}.`));
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const ok = mid >= answer;
    for (let i = ok ? mid : lo; i <= (ok ? hi : mid); i++) known[i] = ok;
    frames.push(frame(W, H, draw(mid), `check(${mid}) is ${ok}: the answer is ${ok ? `at most ${mid}` : `above ${mid}`}.`));
    if (ok) hi = mid; else lo = mid + 1;
  }
  frames.push(frame(W, H, draw(null), `lo = hi = ${lo}. log₂(${n}) = 4 checks instead of ${answer + 1}; on a range of 10^18 it would take about 60.`));

  // Ternary search on a unimodal function.
  const f = (t) => 0.28 * (t - 6.3) ** 2 + 1;
  const PX = (t) => 40 + t * 38, PY = (v) => 170 - v * 11;
  const curve = polyline(range(101).map((i) => [PX(i / 10), PY(f(i / 10))]), '');
  const tern = [];
  let a = 0, b = 10;
  for (let step = 0; step < 4; step++) {
    const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3;
    const drop = f(m1) < f(m2) ? 'right' : 'left';
    const body = curve
      + `<rect class="v-band" x="${PX(a)}" y="20" width="${PX(b) - PX(a)}" height="150"/>`
      + dot(PX(m1), PY(f(m1)), 'hl', 5) + dot(PX(m2), PY(f(m2)), 'hl', 5)
      + text(PX(m1), 184, 'm1', 'v-note hl') + text(PX(m2), 184, 'm2', 'v-note hl');
    tern.push(frame(W, 196, body, step === 0
      ? `Ternary search for the minimum of a unimodal function: compare f(m1) and f(m2). f(m1) ${f(m1) < f(m2) ? '<' : '>'} f(m2), so the minimum can't be in the ${drop} third.`
      : `Drop the ${drop} third again. Each step keeps 2/3 of the range; 100 iterations is plenty for doubles.`));
    if (f(m1) < f(m2)) b = m2; else a = m1;
  }
  return [{ title: 'Binary search on the answer', frames }, { title: 'Ternary search', frames: tern }];
}

function geometry() {
  const U = 34, ox = 60, oy = 170;
  const P = ([x, y]) => [ox + x * U, oy - y * U];
  const axes = `<path class="v-axis" d="M${ox - 10} ${oy} H${ox + 9 * U} M${ox} ${oy + 10} V${oy - 4.6 * U}"/>`;
  const vec = (v, cls, label) => { const [x2, y2] = P(v); return arrow(ox, oy, x2, y2, cls) + text(x2 + 10, y2 - 8, label, `v-note ${cls}`, 'start'); };
  const para = (a, b, cls) => `<path class="v-area ${cls}" d="M${ox} ${oy} L${P(a).join(' ')} L${P([a[0] + b[0], a[1] + b[1]]).join(' ')} L${P(b).join(' ')} Z"/>`;
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const a = [4, 1], b1 = [2, 3], b2 = [3, -1.5];
  const W = 420, H = 230;
  const poly = [[1, 1], [6, 1], [7, 3], [4, 4], [1, 3]];
  let twice = 0;
  for (let i = 0; i < poly.length; i++) twice += cross(poly[i], poly[(i + 1) % poly.length]);
  const fan = range(poly.length - 2).map((i) => `<path class="v-area ${i % 2 ? 'hl' : 'good'}" d="M${P(poly[0]).join(' ')} L${P(poly[i + 1]).join(' ')} L${P(poly[i + 2]).join(' ')} Z"/>`).join('');
  return [{
    title: 'Cross product and polygon area',
    frames: [
      frame(W, H, axes + para(a, b1, 'good') + vec(a, '', 'a = (4, 1)') + vec(b1, 'good', 'b = (2, 3)'),
        `cross(a, b) = 4·3 − 1·2 = ${cross(a, b1)} > 0: b is counter-clockwise from a (a left turn). Its size is the parallelogram's area.`),
      frame(W, H + 60, axes + para(a, b2, 'bad') + vec(a, '', 'a = (4, 1)') + vec(b2, 'bad', 'b = (3, −1.5)'),
        `cross(a, b) = 4·(−1.5) − 1·3 = ${cross(a, b2)} < 0: clockwise, a right turn. Zero means collinear. All in integers when the input is.`),
      frame(W, H, axes + fan + polyline(poly.map(P), 'good', true) + poly.map((p) => dot(...P(p), '', 3.5)).join(''),
        `Shoelace: area = |Σ cross(p_i, p_{i+1})| / 2 = ${Math.abs(twice) / 2}. It is the sum of signed triangles, here fanned from one vertex.`),
    ],
  }];
}

function convexHull() {
  const pts = [[1, 2], [2, 4.5], [3, 1], [3.5, 3], [4.5, 5], [5, 2.5], [6, 0.5], [6.5, 4], [7.5, 3], [8.5, 1.5], [9, 4.2]].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const U = 38, ox = 30, oy = 220;
  const P = ([x, y]) => [ox + x * U, oy - y * U];
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const W = 400, H = 240;
  const dots = (cls) => pts.map((p, i) => dot(...P(p), cls(i), 4.5)).join('');
  const frames = [frame(W, H, dots(() => '') + pts.map((p, i) => text(...P(p).map((v, k) => v + (k ? 14 : 0)), i + 1, 'v-idx')).join(''),
    "Andrew's monotone chain: sort the points by x. Build the lower hull left to right, keeping only left turns.")];
  const lower = [];
  for (let i = 0; i < pts.length; i++) {
    const popped = [];
    while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), pts[i]) <= 0) popped.push(lower.pop());
    lower.push(pts[i]);
    if (i < 2 && !popped.length) continue;
    const chain = polyline(lower.map(P), 'hl');
    const gone = popped.map((p) => dot(...P(p), 'bad', 6)).join('');
    frames.push(frame(W, H, dots((k) => (k === i ? 'hl' : k > i ? 'dim' : '')) + chain + gone,
      popped.length ? `Point ${i + 1} makes a right turn with the last two kept points, so pop ${popped.length === 1 ? 'one' : popped.length} (red). Each point is pushed and popped at most once: O(n) after sorting.` : `Point ${i + 1}: still a left turn, so push it.`));
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), pts[i]) <= 0) upper.pop();
    upper.push(pts[i]);
  }
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  frames.push(frame(W, H, dots(() => 'dim') + polyline(lower.map(P), 'good') + polyline(upper.map(P), 'hl'), 'The upper hull is the same loop from right to left.'));
  frames.push(frame(W, H, `<path class="v-area good" d="${hull.map((p, i) => `${i ? 'L' : 'M'}${P(p).join(' ')}`).join(' ')} Z"/>` + dots((i) => (hull.includes(pts[i]) ? 'good' : 'dim')),
    `The hull has ${hull.length} of the ${pts.length} points. Use cross ≤ 0 to drop collinear points, or < 0 to keep them.`));
  return [{ title: 'Convex hull', frames }];
}

export const STAGE_VISUALS = {
  'prefix-sums': prefixSums,
  'difference-arrays': differenceArrays,
  'dp-basics': dpBasics,
  lis,
  lcs,
  knapsack,
  'interval-dp': intervalDp,
  'bitmask-dp': bitmaskDp,
  'dp-structures': dpStructures,
  dfs,
  bfs,
  trees,
  'dsu-mst': dsuMst,
  topo,
  'shortest-paths': shortestPaths,
  'binary-lifting': binaryLifting,
  'answer-search': answerSearch,
  geometry,
  'convex-hull': convexHull,
};
