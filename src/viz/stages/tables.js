// Step-through diagrams: knapsack, interval DP, DP over subsets and the Fenwick tree.
// Each frame is one elementary step: one cell filled, one transition tried, one node touched.

import { text, row, cellX, table, graph } from '../draw.js';
import { frame, range } from './common.js';

function knapsack() {
  const items = [['A', 2, 3], ['B', 3, 4], ['C', 4, 5]];
  const n = items.length, C = 5;
  const W = 440, H = 176, x = 104, y = 34, size = 30;
  const dp = [Array(C + 1).fill(0)];
  const head = ['none', ...items.map(([name, w, v]) => `${name} w${w} v${v}`)];
  const draw = (known, cls, side = []) => table(n + 1, C + 1, (r, c) => ({ v: known(r, c) ? dp[r][c] : '', cls: cls(r, c) }), { x, y, size, rowHead: head, colHead: range(C + 1) })
    + side.map(([s, c], k) => text(x + (C + 1) * size + 20, y + 16 + k * 24, s, `v-note ${c}`, 'start')).join('');

  const frames = [frame(W, H, draw((r) => r === 0, (r) => (r === 0 ? 'done' : '')),
    `dp[i][c] is the best value from the first i items within capacity c. Each row is one pass of the code, c from ${C} down. With no items, every capacity is worth 0.`)];

  items.forEach(([name, w, v], i) => {
    const r = i + 1;
    dp.push([]);
    // Each row is one pass of the one-row code, so c runs downwards as it does there: the cells to the
    // left of the current one are still the row above, which is what a single row would hold.
    for (let c = C; c >= 0; c--) {
      const skip = dp[r - 1][c];
      const fits = c >= w;
      const take = fits ? dp[r - 1][c - w] + v : -Infinity;
      dp[r][c] = Math.max(skip, take);
      const known = (rr, cc) => rr < r || (rr === r && cc >= c);
      const cls = (rr, cc) => (rr === r && cc === c ? 'hl' : rr === r - 1 && (cc === c || (fits && cc === c - w)) ? 'wait' : '');
      const side = fits
        ? [[`skip: ${skip}`, skip >= take ? 'good' : 'wait'], [`take: ${dp[r - 1][c - w]} + ${v} = ${take}`, take > skip ? 'good' : 'wait']]
        : [[`skip: ${skip}`, 'good'], ['take: too heavy', 'bad']];
      frames.push(frame(W, H, draw(known, cls, side), fits
        ? `Capacity ${c}: skip ${name} for ${skip}, or take it: ${dp[r - 1][c - w]} from ${w} columns left in the row above, + ${v} = ${take}. Keep ${dp[r][c]}.`
        : `Capacity ${c}: ${name} weighs ${w} and doesn't fit, so copy the cell above: ${skip}.`));
    }
  });

  // Walk back from the corner: a cell that differs from the one above used that row's item.
  // As on the LCS diagram, green marks only the cells whose item was taken; the rest of the path is grey.
  const path = new Set(), taken = new Set(), chosen = [];
  const pathCls = (rr, cc) => (taken.has(`${rr},${cc}`) ? 'good' : path.has(`${rr},${cc}`) ? 'done' : 'dim');
  let c = C;
  for (let r = n; r > 0; r--) {
    const [name, w] = items[r - 1];
    const took = dp[r][c] !== dp[r - 1][c];
    path.add(`${r},${c}`);
    const at = c;
    const cls = (rr, cc) => (rr === r && cc === at ? 'hl' : rr === r - 1 && cc === at ? 'wait' : pathCls(rr, cc));
    frames.push(frame(W, H, draw(() => true, cls), took
      ? `${dp[r][at]} ≠ ${dp[r - 1][at]} above, so ${name} was taken: go up a row and ${w} columns left, to capacity ${at - w}.`
      : `${dp[r][at]} = ${dp[r - 1][at]} above, so ${name} wasn't needed: go straight up.`));
    if (took) { taken.add(`${r},${at}`); chosen.unshift(name); c -= w; }
  }
  path.add(`0,${c}`);
  frames.push(frame(W, H, draw(() => true, pathCls),
    `Best value ${dp[n][C]} with items ${chosen.join(' and ')}, the green cells. With one row, loop the capacity downwards so each item is used once.`));
  return [{ title: '0/1 knapsack', frames }];
}

function intervalDp() {
  const s = 'AGBCBA';
  const n = s.length;
  const W = 300, H = 246, x = 80, y = 64, size = 30;
  const dp = Array.from({ length: n }, () => Array(n).fill(null));
  // The string sits above the table, one letter per column, so the current interval s[l..r] lights up.
  const draw = (cellCls, letterCls = () => '') => row([...s], { x: x + 2, y: 6, size: 26, gap: 4, name: 's', index: true, cls: letterCls })
    + table(n, n, (l, r) => (r < l ? { v: '', cls: 'void' } : { v: dp[l][r] ?? '', cls: cellCls(l, r) }), { x, y, size, rowHead: range(n).map((l) => `${l} ${s[l]}`) });

  const frames = [frame(W, H, draw(() => ''),
    'dp[l][r] is the longest palindromic subsequence of s[l..r]: row l, column r. Fill by length, so every shorter interval inside is ready.')];
  for (let i = 0; i < n; i++) dp[i][i] = 1;
  frames.push(frame(W, H, draw((l, r) => (l === r ? 'hl' : '')), 'Length 1: every single letter is a palindrome, so dp[i][i] = 1 down the diagonal.'));

  for (let len = 2; len <= n; len++) {
    for (let l = 0; l + len - 1 < n; l++) {
      const r = l + len - 1, sub = s.slice(l, r + 1);
      const match = s[l] === s[r];
      const inner = len === 2 ? 0 : dp[l + 1][r - 1];
      dp[l][r] = match ? inner + 2 : Math.max(dp[l + 1][r], dp[l][r - 1]);
      const reads = (a, b) => (match ? a === l + 1 && b === r - 1 : (a === l + 1 && b === r) || (a === l && b === r - 1));
      const cellCls = (a, b) => (a === l && b === r ? 'hl' : reads(a, b) ? 'wait' : '');
      const letterCls = (k) => (k < l || k > r ? 'dim' : k === l || k === r ? (match ? 'good' : 'bad') : 'hl');
      frames.push(frame(W, H, draw(cellCls, letterCls), match
        ? len === 2
          ? `dp[${l}][${r}], ${sub}: both ends are ${s[l]} and nothing is inside: 2.`
          : `dp[${l}][${r}], ${sub}: both ends are ${s[l]}, so wrap them round dp[${l + 1}][${r - 1}] = ${inner}: ${inner} + 2 = ${dp[l][r]}.`
        : `dp[${l}][${r}], ${sub}: ${s[l]} ≠ ${s[r]}, so drop one end: max(dp[${l + 1}][${r}], dp[${l}][${r - 1}]) = max(${dp[l + 1][r]}, ${dp[l][r - 1]}) = ${dp[l][r]}.`));
    }
  }

  // Walk back from the top-right cell to spell one longest palindrome.
  const kept = new Set(), visited = new Set();
  const doneCls = (a, b) => (visited.has(`${a},${b}`) ? 'good' : 'dim');
  for (let l = 0, r = n - 1; l <= r;) {
    visited.add(`${l},${r}`);
    const [cl, cr] = [l, r];
    const letters = (k) => (kept.has(k) ? 'good' : k === cl || k === cr ? 'hl' : k < cl || k > cr ? 'dim' : '');
    const cellCls = (a, b) => (a === cl && b === cr ? 'hl' : doneCls(a, b));
    if (l === r) {
      kept.add(l);
      frames.push(frame(W, H, draw(cellCls, letters), `One letter left, ${s[l]}: it goes in the middle.`));
      break;
    }
    if (s[l] === s[r]) {
      kept.add(l).add(r);
      frames.push(frame(W, H, draw(cellCls, letters), `dp[${l}][${r}]: the ends are both ${s[l]}, so keep them and step inside to dp[${l + 1}][${r - 1}].`));
      l++; r--;
    } else if (dp[l + 1][r] >= dp[l][r - 1]) {
      frames.push(frame(W, H, draw(cellCls, letters), `dp[${l}][${r}]: ${s[l]} ≠ ${s[r]}, and dp[${l + 1}][${r}] = ${dp[l + 1][r]} is the larger neighbour: drop ${s[l]}.`));
      l++;
    } else {
      frames.push(frame(W, H, draw(cellCls, letters), `dp[${l}][${r}]: ${s[l]} ≠ ${s[r]}, and dp[${l}][${r - 1}] = ${dp[l][r - 1]} is the larger neighbour: drop ${s[r]}.`));
      r--;
    }
  }
  const pal = [...kept].sort((a, b) => a - b).map((k) => s[k]).join('');
  frames.push(frame(W, H, draw(doneCls, (k) => (kept.has(k) ? 'good' : 'dim')),
    `dp[0][${n - 1}] = ${dp[0][n - 1]}: ${pal}. O(n²) intervals, O(1) work each.`));
  return [{ title: 'Interval DP, filled by length', frames }];
}

// dp[mask][v] exactly as in the template: any item may start, and going from v to u costs w[v][u].
function bitmaskPath() {
  const w = [[0, 4, 7], [4, 0, 2], [7, 2, 0]]; // symmetric, drawn as a triangle beside the table
  const n = 3, full = (1 << n) - 1;
  const mask = (m) => `${m.toString(2).padStart(n, '0')}₂`;
  const has = (m, v) => (m >> v & 1) === 1;
  const show = (v) => (v === Infinity ? '∞' : v);
  const dp = Array.from({ length: full + 1 }, () => Array(n).fill(Infinity));
  const order = Array.from({ length: full + 1 }, () => Array(n).fill(null)); // the cheapest order found so far
  for (let v = 0; v < n; v++) { dp[1 << v][v] = 0; order[1 << v][v] = [v]; }
  const route = (o) => o.join(' → ');

  const W = 460, H = 262, x = 78, y = 40, size = 30;
  const nodes = { 0: [272, 112], 1: [408, 112], 2: [340, 42] };
  const edges = [['0', '1', w[0][1]], ['0', '2', w[0][2]], ['1', '2', w[1][2]]];
  const steps = (o) => new Set(o.slice(1).map((u, k) => [o[k], u].sort().join('-')));
  // cell(m, v) gives a table cell's class; o is an order to draw on the triangle, with its last step in `last`.
  const draw = ({ cell = () => '', o = null, last = '', side = [], done = false } = {}) => {
    const on = o ? steps(o) : new Set(), lastStep = o && o.length > 1 ? o.slice(-2).sort().join('-') : null;
    return table(full, n, (r, v) => {
      const m = r + 1;
      return has(m, v) ? { v: show(dp[m][v]), cls: cell(m, v) } : { v: '', cls: 'void' };
    }, { x, y, size, rowHead: range(full).map((r) => mask(r + 1)), colHead: range(n).map(String) })
      + text(x - 10, y - 12, 'v:', 'v-head', 'end')
      + graph(nodes, edges, {
        r: 15,
        nodeCls: (id) => (o && o.includes(+id) ? (+id === o.at(-1) && !done ? 'current' : 'done') : ''),
        edgeCls: (a, b) => { const k = [a, b].sort().join('-'); return k === lastStep ? last : on.has(k) ? 'good' : ''; },
      })
      + side.map(([s, cls], k) => text(206, 176 + k * 22, s, `v-note ${cls}`, 'start')).join('');
  };

  const frames = [frame(W, H, draw({ cell: (m) => (m === 1 || m === 2 || m === 4 ? 'done' : '') }),
    'dp[mask][v] is the cheapest path that visits exactly the items in mask (bit i is item i) and ends at v. Any item can start, dp[1 << v][v] = 0; the rest start at ∞.')];
  for (let m = 1; m < full; m++) {
    for (let v = 0; v < n; v++) {
      if (!has(m, v) || dp[m][v] === Infinity) continue;
      for (let u = 0; u < n; u++) {
        if (has(m, u)) continue;
        const nm = m | (1 << u), old = dp[nm][u], oldOrder = order[nm][u], val = dp[m][v] + w[v][u];
        const o = [...order[m][v], u], ok = val < old;
        if (ok) { dp[nm][u] = val; order[nm][u] = o; }
        const cell = (a, b) => (a === nm && b === u ? (ok ? 'hl' : 'bad') : a === m && b === v ? 'wait' : '');
        const side = old === Infinity ? [[`${route(o)}: ${val}`, 'hl']]
          : ok ? [[`${route(o)}: ${val}, kept`, 'good'], [`${route(oldOrder)}: ${old}, dropped`, 'bad']]
            : [[`${route(oldOrder)}: ${old}, kept`, 'good'], [`${route(o)}: ${val}, dropped`, 'bad']];
        const head = `dp[${mask(m)}][${v}] = ${dp[m][v]}, then on to ${u}: ${dp[m][v]} + w[${v}][${u}] = ${val}`;
        frames.push(frame(W, H, draw({ cell, o, last: ok ? 'hl' : 'bad', side }), old === Infinity
          ? `${head} < ∞, so dp[${mask(nm)}][${u}] = ${val}.`
          : ok
            ? `${head} < ${old}, so dp[${mask(nm)}][${u}] = ${val}: two orders of the same items end at ${u}, and the cheaper replaces the other.`
            : `${head} ≥ ${old}, so dp[${mask(nm)}][${u}] stays ${old}: two orders of the same items end at ${u}, and only the cheaper is kept.`));
      }
    }
  }
  const best = Math.min(...dp[full]), end = dp[full].indexOf(best), bestOrder = order[full][end];
  const ties = range(n).filter((v) => v !== end && dp[full][v] === best);
  frames.push(frame(W, H, draw({ cell: (m, v) => (m !== full ? 'dim' : v === end ? 'good' : 'hl') }),
    `The answer is the smallest entry in the full mask's row: min(${dp[full].join(', ')}) = ${best}, ending at ${end}.${ties.length ? ` Ending at ${ties.join(' or ')} ties, as w is the same both ways and that path is this one reversed.` : ''}`));
  const onPath = new Set(bestOrder.map((v, k) => `${bestOrder.slice(0, k + 1).reduce((s, u) => s | (1 << u), 0)},${v}`));
  frames.push(frame(W, H, draw({ cell: (m, v) => (onPath.has(`${m},${v}`) ? 'good' : 'dim'), o: bestOrder, last: 'good', done: true, side: [[`${route(bestOrder)}: ${best}`, 'good']] }),
    `Cheapest path ${route(bestOrder)}, cost ${best}. Every move went down the table to a larger mask, so the rows were filled in order: O(2^n · n²) instead of n! orders.`));
  return { title: 'Cheapest path through every item, dp[mask][v]', frames };
}

function bitmaskDp() {
  const cost = [[4, 2, 8], [4, 3, 7], [3, 1, 5]]; // cost[worker][job]
  const n = 3, full = (1 << n) - 1;
  const pop = (m) => m.toString(2).split('1').length - 1;
  const bits = (m) => Number(m).toString(2).padStart(n, '0');
  // In captions a mask carries a subscript 2, so it reads as binary (and is spoken digit by digit).
  const mask = (m) => `${bits(m)}₂`;
  const show = (v) => (v === Infinity ? '∞' : v);
  const levels = [[0], [1, 2, 4], [3, 5, 6], [7]];
  const nodes = {};
  levels.forEach((lv, d) => lv.forEach((m, k) => { nodes[m] = [60 + d * 120, 130 + (k - (lv.length - 1) / 2) * 80]; }));
  const edges = [];
  for (let m = 0; m <= full; m++) for (let j = 0; j < n; j++) if (!(m >> j & 1)) edges.push([String(m), String(m | (1 << j)), cost[pop(m)][j]]);

  const dp = Array(full + 1).fill(Infinity), from = Array(full + 1).fill(-1);
  dp[0] = 0;
  const processed = new Set();
  const W = 460, H = 270;
  const draw = ({ cur = null, tried = null, ok = false, path = null } = {}) => graph(nodes, edges, {
    directed: true, r: 19, weightAt: 0.28,
    nodeText: bits,
    nodeNote: (m) => show(dp[m]),
    nodeCls: (m) => (path ? (path.nodes.has(+m) ? 'done' : 'dim') : +m === cur ? 'current' : processed.has(+m) ? 'done' : dp[m] < Infinity ? 'wait' : ''),
    edgeCls: (a, b) => {
      if (path) return path.edges.has(`${a}-${b}`) ? (`${a}-${b}` === path.now ? 'hl' : 'good') : 'dim';
      if (tried === `${a}-${b}`) return ok ? 'hl' : 'bad';
      if (from[b] === +a) return 'good';
      return processed.has(+a) || +a === cur ? 'dim' : '';
    },
  });

  const frames = [frame(W, H, draw(),
    'Jobs to workers: dp[mask] = cheapest way for the first popcount(mask) workers to take the jobs in mask (bit j is job j). The next worker is always worker popcount(mask), so no last item is needed. dp[000₂] = 0, the rest start at ∞.')];
  for (let m = 0; m < full; m++) {
    const k = pop(m);
    for (let j = 0; j < n; j++) {
      if (m >> j & 1) continue;
      const nm = m | (1 << j), old = dp[nm], val = dp[m] + cost[k][j];
      const ok = val < old;
      if (ok) { dp[nm] = val; from[nm] = m; }
      frames.push(frame(W, H, draw({ cur: m, tried: `${m}-${nm}`, ok }), ok
        ? `From ${mask(m)} (${dp[m]}), worker ${k} takes job ${j}: ${dp[m]} + ${cost[k][j]} = ${val} < ${show(old)}, so dp[${mask(nm)}] = ${val}.`
        : `From ${mask(m)} (${dp[m]}), worker ${k} takes job ${j}: ${dp[m]} + ${cost[k][j]} = ${val} ≥ ${old}, so dp[${mask(nm)}] stays ${old}.`));
    }
    processed.add(m);
  }
  processed.add(full);

  // Follow the stored predecessors back from the full mask.
  const path = { nodes: new Set([full]), edges: new Set(), now: null };
  const assign = [];
  for (let m = full; from[m] !== -1; m = from[m]) {
    const p = from[m], job = Math.log2(m ^ p), worker = pop(p);
    path.nodes.add(p);
    path.edges.add(`${p}-${m}`);
    path.now = `${p}-${m}`;
    assign[worker] = job;
    frames.push(frame(W, H, draw({ path }), `dp[${mask(m)}] = ${dp[m]} came from ${mask(p)} (${dp[p]}): worker ${worker} took job ${job} for ${cost[worker][job]}.`));
  }
  path.now = null;
  frames.push(frame(W, H, draw({ path }),
    `Cheapest total ${dp[full]}: ${assign.map((job, w) => `worker ${w} on job ${job}`).join(', ')}. O(2^n · n) instead of n! orders.`));
  return { title: 'Jobs to workers: dp[mask] without a last item', frames };
}

const bitmaskDiagrams = () => [bitmaskPath(), bitmaskDp()];

function dpStructures() {
  // The numbers added at positions 1..8. The page calls them x[i], and uses query/update and t[i] as the template does;
  // this tree keeps sums where the DP keeps maxima.
  const xs = [5, 2, 9, 1, 6, 3, 7, 4];
  const n = xs.length, size = 42, gap = 4, x = 50, W = 440, H = 238;
  const low = (i) => i & -i;
  const t = Array(n + 1).fill(0);
  const cx = (k) => cellX(k, { x, size, gap });
  // A one-position bar is narrow, so its label is set a size smaller to stay inside it.
  const label = (i, lx, ly) => text(lx, ly, `t[${i}]=${t[i]}`, 'v-label').replace('<text ', low(i) === 1 ? '<text style="font-size: 10px" ' : '<text ');
  const bars = (cls) => range(n).map((k) => {
    const i = k + 1;
    const x1 = cx(i - low(i)), x2 = cx(i - 1) + size;
    const yb = 88 + Math.log2(low(i)) * 30;
    return `<g class="v-bar ${cls(i)}"><rect x="${x1 + 2}" y="${yb}" width="${x2 - x1 - 4}" height="24" rx="6"/>${label(i, (x1 + x2) / 2, yb + 12)}</g>`;
  }).join('');
  const top = (cls) => row(xs, { x, y: 18, size, gap, name: 'x', index: true, indexFrom: 1, cls: (k) => cls(k + 1) });
  const note = (s, cls = 'hl') => text(x - 30, 222, s, `v-note ${cls}`, 'start');
  const block = (i) => (low(i) === 1 ? `x[${i}]` : `x[${i - low(i) + 1}..${i}]`);

  const frames = [frame(W, H, top(() => '') + bars(() => 'dim'),
    'Bar t[i] sums the block of x that ends at i with length lowbit(i), the lowest set bit of i: t[4] is x[1..4], t[7] is x[7]. Start at 0, then update(i, x[i]) for each i.')];

  const touched = new Set();
  for (let i = 1; i <= n; i++) {
    const walk = [];
    for (let j = i; j <= n; j += low(j)) walk.push(j);
    for (const j of walk) {
      t[j] += xs[i - 1];
      touched.add(j);
      const next = j + low(j);
      frames.push(frame(W, H, top((k) => (k === i ? 'hl' : k < i ? '' : 'dim')) + bars((b) => (b === j ? 'hl' : touched.has(b) ? '' : 'dim')) + note(`update(${i}, ${xs[i - 1]}): ${walk.join(' → ')}`),
        `update(${i}, ${xs[i - 1]}): t[${j}] += ${xs[i - 1]}, now ${t[j]}. ${next <= n ? `Next: ${j} + lowbit(${j}) = ${next}.` : `${j} + ${low(j)} = ${next} > ${n}: done.`}`));
    }
  }
  frames.push(frame(W, H, top(() => '') + bars(() => ''),
    `Built with ${n} updates, each touching at most log₂ ${n} + 1 = ${Math.log2(n) + 1} bars. Every bar now holds its block's sum.`));

  // query(i): add bars while dropping the lowest bit.
  const query = (q) => {
    const added = [], parts = [];
    let sum = 0;
    for (let i = q; i > 0; i -= low(i)) {
      sum += t[i];
      added.push(i);
      parts.push(t[i]);
      const next = i - low(i), cur = i, done = new Set(added.slice(0, -1));
      const cover = (k) => added.some((b) => k > b - low(b) && k <= b);
      frames.push(frame(W, H,
        top((k) => (k > q ? 'dim' : k > cur - low(cur) && k <= cur ? 'hl' : cover(k) ? 'good' : '')) + bars((b) => (b === cur ? 'hl' : done.has(b) ? 'good' : 'dim')) + note(`query(${q}) = ${parts.join(' + ')} = ${sum}`),
        `query(${q}): add t[${cur}] = ${t[cur]} (${block(cur)}), sum ${sum}. ${next ? `Next: ${cur} − lowbit(${cur}) = ${next}.` : `${cur} − ${low(cur)} = 0: stop.`}`));
    }
    return { sum, added };
  };
  const p7 = query(7);
  frames.push(frame(W, H, top((k) => (k <= 7 ? 'good' : 'dim')) + bars((b) => (p7.added.includes(b) ? 'good' : 'dim')) + note(`query(7) = ${p7.sum}`, 'good'),
    `query(7) = ${p7.sum} from ${p7.added.length} bars (${[...p7.added, 0].join(' → ')}) instead of 7 additions: O(log n).`));
  const p2 = query(2);
  frames.push(frame(W, H, top((k) => (k >= 3 && k <= 7 ? 'good' : 'dim')) + bars((b) => (p7.added.includes(b) ? 'good' : p2.added.includes(b) ? 'bad' : 'dim')) + note(`x[3..7] = ${p7.sum} − ${p2.sum} = ${p7.sum - p2.sum}`, 'good'),
    `Sum of x[3..7] = query(7) − query(2) = ${p7.sum} − ${p2.sum} = ${p7.sum - p2.sum}. For DP, store a max over compressed keys instead of a sum.`));
  return [{ title: 'Fenwick tree', frames }];
}

export default {
  knapsack,
  'interval-dp': intervalDp,
  'bitmask-dp': bitmaskDiagrams,
  'dp-structures': dpStructures,
};
