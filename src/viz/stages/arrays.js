// Step-through diagrams: prefix sums, difference arrays, take-or-skip DP, LIS and LCS.
// Each frame is one elementary step of the algorithm, marking the values it reads.

import { text, row, cellX, span, arrow, table } from '../draw.js';
import { frame, prefix, range } from './common.js';

const num = (v) => (v < 0 ? `−${-v}` : String(v));
const plus = (p, q) => (q < 0 ? `${num(p)} − ${-q}` : `${num(p)} + ${q}`);
const cx = (i, x) => cellX(i, { x }) + 17; // centre of box i in a row at x

function prefixSums() {
  const a = [3, 1, 4, 1, 5, 9, 2];
  const n = a.length, W = 400, H = 165, x = 70, ya = 36, yp = 106;
  const P = [0];
  const draw = ({ aCls = () => '', pCls = () => '', upto = n, extra = '' }) =>
    row(a, { x, y: ya, name: 'a', index: true, cls: aCls })
    + row(P.map((v, i) => (i <= upto ? v : '')).concat(Array(n + 1 - P.length).fill('')), { x, y: yp, name: 'P', index: true, cls: pCls })
    + extra;
  const frames = [frame(W, H, draw({ upto: 0, pCls: (i) => (i === 0 ? 'hl' : '') }),
    'P[i] will hold the sum of the first i values of a. Start with P[0] = 0, the empty prefix.')];
  for (let i = 0; i < n; i++) {
    P.push(P[i] + a[i]);
    frames.push(frame(W, H, draw({
      upto: i + 1,
      aCls: (k) => (k === i ? 'wait' : k < i ? '' : 'dim'),
      pCls: (k) => (k === i + 1 ? 'hl' : k === i ? 'wait' : k < i ? 'done' : ''),
      extra: arrow(cx(i, x), ya + 37, cx(i + 1, x), yp - 3, 'hl'),
    }), `P[${i + 1}] = P[${i}] + a[${i}] = ${P[i]} + ${a[i]} = ${P[i + 1]}.${i === n - 1 ? ` The last cell is the total of a.` : ''}`));
  }
  // A range query: everything up to r, minus everything before l.
  const l = 2, r = 5;
  const whole = (k) => (k <= r ? 'hl' : 'dim');
  frames.push(frame(W, H, draw({ aCls: whole, pCls: (k) => (k === r + 1 ? 'good' : 'dim'), extra: span(0, r, `P[${r + 1}] = ${P[r + 1]}`, { x, y: ya - 4, up: true }) }),
    `The sum of a[${l}..${r}]? Start from P[${r + 1}] = ${P[r + 1]}, the sum of a[0..${r}]: everything up to the right end.`));
  frames.push(frame(W, H, draw({ aCls: (k) => (k < l ? 'bad' : k <= r ? 'hl' : 'dim'), pCls: (k) => (k === r + 1 ? 'good' : k === l ? 'bad' : 'dim'), extra: span(0, l - 1, `P[${l}] = ${P[l]}`, { x, y: ya - 4, up: true, cls: 'wait' }) }),
    `P[${l}] = ${P[l]} is the sum of a[0..${l - 1}], the part before the range. Subtract it.`));
  frames.push(frame(W, H, draw({ aCls: (k) => (k >= l && k <= r ? 'good' : 'dim'), pCls: (k) => (k === r + 1 || k === l ? 'good' : 'dim'), extra: span(l, r, `sum = ${P[r + 1] - P[l]}`, { x, y: ya - 4, up: true, cls: 'good' }) }),
    `a[${l}] + … + a[${r}] = P[${r + 1}] − P[${l}] = ${P[r + 1]} − ${P[l]} = ${P[r + 1] - P[l]}. Any range costs one subtraction: O(1).`));

  // Zero-sum blocks: b[l..r] sums to 0 exactly when Q[l] = Q[r + 1].
  const b = [2, -1, 3, -2, -2, 4];
  const Q = prefix(b);
  const H2 = 190, seen = new Map([[0, [0]]]);
  const seenText = () => text(x - 10, 172, `seen: ${[...seen].map(([v, at]) => `${num(v)}×${at.length}`).join('  ')}`, 'v-note', 'start');
  const drawB = (j, bCls, qCls, extra = '') =>
    row(b.map(num), { x, y: ya, name: 'b', index: true, cls: bCls })
    + row(Q.map((v, i) => (i <= j ? num(v) : '')), { x, y: yp, name: 'Q', index: true, cls: qCls }) + seenText() + extra;
  frames.push(frame(W, H2, drawB(0, () => '', (k) => (k === 0 ? 'hl' : '')),
    'Zero-sum blocks: b[l..r] sums to 0 exactly when Q[l] = Q[r + 1]. Walk the prefix sums Q, counting each value seen so far.'));
  let count = 0;
  for (let j = 1; j <= b.length; j++) {
    const earlier = seen.get(Q[j]) || [];
    count += earlier.length;
    const first = earlier[0];
    frames.push(frame(W, H2, drawB(j,
      (k) => (earlier.length && k >= first && k < j ? 'good' : k === j - 1 ? 'wait' : k < j ? '' : 'dim'),
      (k) => (k === j ? (earlier.length ? 'good' : 'hl') : earlier.includes(k) ? 'good' : k < j ? 'done' : ''),
      earlier.length ? span(first, j - 1, 'sum = 0', { x, y: ya - 4, up: true, cls: 'good' }) : ''),
    earlier.length
      ? `Q[${j}] = ${num(Q[j])} was seen before, at Q[${first}]: b[${first}..${j - 1}] sums to 0. Blocks so far: ${count}.`
      : `Q[${j}] = Q[${j - 1}] + b[${j - 1}] = ${num(Q[j])}, a value not seen before: no zero-sum block ends at ${j - 1}.`));
    seen.set(Q[j], [...earlier, j]);
  }
  frames.push(frame(W, H2, drawB(b.length, () => '', (k) => ([...seen.values()].some((at) => at.length > 1 && at.includes(k)) ? 'good' : 'dim')),
    `${count} zero-sum blocks, one per pair of equal prefix values, found in one pass with a hash map: O(n).`));
  return [{ title: 'Prefix sums', frames }];
}

function differenceArrays() {
  const n = 8, x = 70, W = 430, H = 165, yd = 40, ya = 110;
  const ups = [[1, 4, 3], [3, 6, 2], [0, 2, 1]];
  const d = Array(n + 1).fill(0);
  const a = [];
  const draw = (dCls, aCls, extra = '') =>
    row(d.map(num), { x, y: yd, name: 'd', index: true, cls: dCls })
    + row(Array.from({ length: n }, (_, i) => (i < a.length ? num(a[i]) : '')), { x, y: ya, name: 'a', index: true, cls: aCls }) + extra;
  const frames = [frame(W, H, draw(() => '', () => 'dim'),
    'Range updates without touching every cell: record where each one starts and stops in d (n + 1 cells, all 0), then rebuild a once.')];
  ups.forEach(([l, r, v]) => {
    const bracket = span(l, r, `+${v} on a[${l}..${r}]`, { x, y: yd - 4, up: true, cls: 'wait' });
    d[l] += v;
    frames.push(frame(W, H, draw((i) => (i === l ? 'hl' : ''), () => 'dim', bracket),
      `Add ${v} to a[${l}..${r}]. First d[${l}] += ${v}: from position ${l} on, everything is ${v} higher. d[${l}] is now ${num(d[l])}.`));
    d[r + 1] -= v;
    frames.push(frame(W, H, draw((i) => (i === r + 1 ? 'hl' : i === l ? 'done' : ''), () => 'dim', bracket),
      `Then d[${r + 1}] −= ${v}: the increase stops after position ${r}. d[${r + 1}] is now ${num(d[r + 1])}. Two writes, however long the range.`));
  });
  for (let i = 0; i < n; i++) {
    a.push((i ? a[i - 1] : 0) + d[i]);
    frames.push(frame(W, H, draw((k) => (k === i ? 'wait' : k < i ? 'done' : ''), (k) => (k === i ? 'hl' : k === i - 1 ? 'wait' : k < i ? 'done' : 'dim'),
      arrow(cx(i, x), yd + 52, cx(i, x), ya - 3, 'hl')),
    i ? `a[${i}] = a[${i - 1}] + d[${i}] = ${plus(a[i - 1], d[i])} = ${num(a[i])}.` : `Rebuild with a prefix sum over d: a[0] = d[0] = ${num(a[0])}.`));
  }
  const both = range(n).filter((i) => ups.filter(([l, r]) => l <= i && i <= r).length > 1);
  frames.push(frame(W, H, draw(() => 'dim', (k) => (both.includes(k) ? 'good' : '')),
    `Done: ${ups.length} updates at O(1) each, then one O(n) pass. a[${both[0]}] got two updates: ${ups.filter(([l, r]) => l <= both[0] && both[0] <= r).map(([, , v]) => v).join(' + ')} = ${a[both[0]]}.`));
  return [{ title: 'Difference arrays', frames }];
}

function dpBasics() {
  const v = [5, 1, 3, 8, 2, 6];
  const n = v.length, x = 70, W = 340, H = 196, yd = 60, yv = 120;
  const dp = [], took = [];
  const links = (i, cls1, cls2) =>
    (i >= 1 ? arrow(cx(i - 1, x), yd - 4, cx(i, x) - 4, yd - 4, cls1, 1.6) : '')
    + (i >= 2 ? arrow(cx(i - 2, x), yd - 6, cx(i, x) - 2, yd - 6, cls2, 2.4) : '');
  const draw = (dCls, vCls, extra = '') =>
    row(Array.from({ length: n }, (_, k) => (k < dp.length ? dp[k] : '')), { x, y: yd, name: 'dp', cls: dCls })
    + row(v, { x, y: yv, name: 'value', index: true, cls: vCls }) + extra;
  const frames = [frame(W, H, draw(() => '', () => ''), 'Pick values, never two neighbours, to maximise the total. dp[i] is the best you can do with the first i + 1 values.')];
  for (let i = 0; i < n; i++) {
    const skip = i ? dp[i - 1] : 0, take = (i >= 2 ? dp[i - 2] : 0) + v[i];
    const reads = (k) => (k === i ? 'hl' : k === i - 1 || k === i - 2 ? 'wait' : k < i ? 'done' : '');
    frames.push(frame(W, H, draw(reads, (k) => (k === i ? 'wait' : 'dim'), links(i, 'hl', 'hl')),
      i === 0
        ? `dp[0]: skip ${v[0]} and have 0, or take it and have ${v[0]}.`
        : i === 1
          ? `dp[1]: skip ${v[1]} and keep dp[0] = ${skip}, or take ${v[1]} alone, since its neighbour ${v[0]} must go: ${take}.`
          : `dp[${i}]: skip ${v[i]} and keep dp[${i - 1}] = ${skip}, or take it on top of dp[${i - 2}] = ${dp[i - 2]}: ${dp[i - 2]} + ${v[i]} = ${take}.`));
    dp.push(Math.max(skip, take));
    took.push(take > skip);
    frames.push(frame(W, H, draw((k) => (k === i ? (took[i] ? 'good' : 'hl') : k < i ? 'done' : ''), (k) => (k === i ? (took[i] ? 'good' : 'bad') : 'dim'), links(i, took[i] ? 'dim' : 'good', took[i] ? 'good' : 'dim')),
      `dp[${i}] = max(${skip}, ${take}) = ${dp[i]}: ${took[i] ? `take ${v[i]}` : `skip ${v[i]}`}.`));
  }
  // Walk back through the choices.
  const chosen = new Set();
  for (let i = n - 1; i >= 0;) {
    const here = i;
    if (took[i]) chosen.add(i);
    const step = took[i] ? 2 : 1;
    frames.push(frame(W, H, draw((k) => (k === here ? 'hl' : 'dim'), (k) => (k === here ? (took[here] ? 'good' : 'bad') : chosen.has(k) ? 'good' : 'dim')),
      took[here]
        ? `Walk back: dp[${here}] took ${v[here]}, so it is in. Its neighbour can't be, so jump to ${here - 2 >= 0 ? `dp[${here - 2}]` : 'the start'}.`
        : `Walk back: dp[${here}] = dp[${here - 1}] skipped ${v[here]}. Step to dp[${here - 1}].`));
    i -= step;
  }
  frames.push(frame(W, H, draw((k) => (k === n - 1 ? 'good' : 'dim'), (k) => (chosen.has(k) ? 'good' : 'dim')),
    `Best total: ${[...chosen].sort((p, q) => p - q).map((k) => v[k]).join(' + ')} = ${dp[n - 1]}. O(n) time, and only the last two dp values are ever needed.`));
  return [{ title: 'Take or skip', frames }];
}

function lis() {
  const a = [3, 1, 8, 2, 5, 9, 4, 7];
  const W = 400, H = 236, x = 70, base = 128, unit = 11, yt = 166;
  const tails = [], tailIdx = [], par = Array(a.length).fill(-1), lenAt = [];
  const bars = (cls) => a.map((v, i) => {
    const bx = cellX(i, { x });
    return `<g class="v-bar ${cls(i)}"><rect x="${bx + 3}" y="${base - v * unit}" width="28" height="${v * unit}" rx="4"/></g>${text(bx + 17, base + 12, v, 'v-idx')}`;
  }).join('');
  const tailsRow = (cls) => row([...tails, ...Array(Math.max(0, 4 - tails.length)).fill('')], { x, y: yt, name: 'tails', index: true, indexFrom: 1, cls });
  const cur = (i) => (j) => (j === i ? 'hl' : j < i ? '' : 'dim');
  const frames = [frame(W, H, bars(() => '') + tailsRow(() => ''),
    'tails[k] holds the smallest value an increasing subsequence of length k can end with. Each new value binary-searches tails.')];
  a.forEach((v, i) => {
    // lower_bound: the first tail that is at least v.
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1, less = tails[mid] < v, [l0, h0] = [lo, hi];
      frames.push(frame(W, H, bars(cur(i)) + tailsRow((j) => (j === mid ? 'wait' : j < l0 || j >= h0 ? 'dim' : '')),
        `${v}: is the length-${mid + 1} tail ${tails[mid]} less than ${v}? ${less ? `Yes, so ${v} can go after it: search longer lengths.` : `No: search this length and shorter.`}`));
      if (less) lo = mid + 1; else hi = mid;
    }
    const k = lo, append = k === tails.length, old = tails[k];
    if (k > 0) par[i] = tailIdx[k - 1];
    lenAt[i] = k + 1;
    tails[k] = v;
    tailIdx[k] = i;
    frames.push(frame(W, H, bars(cur(i)) + tailsRow((j) => (j === k ? (append ? 'good' : 'hl') : '')),
      !k && append ? `tails is empty: ${v} starts a subsequence of length 1.`
        : append ? `${v} is bigger than every tail, so it extends length ${k} (ending ${tails[k - 1]}) to length ${k + 1}.`
          : `The first tail ≥ ${v} is the length-${k + 1} tail ${old}. Replace it: length ${k + 1} can now end lower, at ${v}.`));
  });
  // Recover one subsequence by following parent pointers back from the last tail.
  const seq = [];
  for (let i = tailIdx[tails.length - 1]; i !== -1; i = par[i]) {
    seq.unshift(i);
    const p = par[i], here = i, picked = new Set(seq);
    frames.push(frame(W, H, bars((j) => (j === here ? 'hl' : picked.has(j) ? 'good' : 'dim')) + tailsRow(() => 'dim'),
      p === -1 ? `${a[here]} started its subsequence, so stop. Reading forwards: ${seq.map((j) => a[j]).join(', ')}.`
        : `${a[here]} ended a length-${lenAt[here]} subsequence after ${a[p]}, the length-${lenAt[here] - 1} tail when ${a[here]} arrived. Step back to ${a[p]}.`));
  }
  frames.push(frame(W, H, bars((j) => (seq.includes(j) ? 'good' : 'dim')) + tailsRow(() => 'dim'),
    `LIS length ${tails.length}: ${seq.map((j) => a[j]).join(', ')}. n binary searches: O(n log n). Use upper_bound for non-decreasing.`));
  return [{ title: 'Longest increasing subsequence in O(n log n)', frames }];
}

function lcs() {
  const s = 'ABCBD', t = 'BDCAB';
  const n = s.length, m = t.length, size = 30;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  const W = 300, H = 232, x = 80, y = 40;
  const done = new Set();
  for (let r = 0; r <= n; r++) for (let c = 0; c <= m; c++) if (!r || !c) done.add(`${r},${c}`);
  // Headers drawn here, not by table(), so the letters being compared can light up.
  const heads = (hr, hc, cls) =>
    [...t].map((ch, c) => text(x + (c + 1) * size + size / 2, y - 12, ch, c + 1 === hc ? `v-note ${cls}` : 'v-head')).join('')
    + [...s].map((ch, r) => text(x - 10, y + (r + 1) * size + size / 2, ch, r + 1 === hr ? `v-note ${cls}` : 'v-head', 'end')).join('');
  const draw = (cls, hr = 0, hc = 0, hcls = 'hl') => table(n + 1, m + 1, (r, c) => ({ v: done.has(`${r},${c}`) ? dp[r][c] : '', cls: cls(r, c) }), { x, y, size }) + heads(hr, hc, hcls);
  const frames = [frame(W, H, draw((r, c) => (!r || !c ? 'done' : '')),
    'dp[i][j] is the LCS of the first i letters of s (rows) and the first j of t (columns). Row 0 and column 0 are empty prefixes: 0.')];
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const match = s[i - 1] === t[j - 1];
    dp[i][j] = match ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    done.add(`${i},${j}`);
    const reads = match ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]];
    frames.push(frame(W, H, draw((r, c) => (r === i && c === j ? (match ? 'good' : 'hl') : reads.some(([p, q]) => p === r && q === c) ? 'wait' : ''), i, j, match ? 'good' : 'hl'),
      match
        ? `${s[i - 1]} = ${t[j - 1]}: extend the diagonal. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`
        : `${s[i - 1]} ≠ ${t[j - 1]}: drop a letter. dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}.`));
  }
  // Walk back from the corner.
  const path = new Set();
  let res = '';
  for (let i = n, j = m; i > 0 && j > 0;) {
    const match = s[i - 1] === t[j - 1];
    const up = !match && dp[i - 1][j] >= dp[i][j - 1];
    path.add(`${i},${j}`);
    const [pi, pj] = [i, j], seenPath = new Set(path);
    if (match) res = s[i - 1] + res;
    frames.push(frame(W, H, draw((r, c) => (r === pi && c === pj ? (match ? 'good' : 'hl') : seenPath.has(`${r},${c}`) ? 'done' : 'dim'), pi, pj, match ? 'good' : 'hl'),
      match
        ? `Walk back: ${s[i - 1]} = ${t[j - 1]}, so ${s[i - 1]} is in the LCS. Move diagonally to dp[${i - 1}][${j - 1}].`
        : `Walk back: ${s[i - 1]} ≠ ${t[j - 1]}. dp[${i - 1}][${j}] = ${dp[i - 1][j]} ${up ? '≥' : '<'} dp[${i}][${j - 1}] = ${dp[i][j - 1]}, so move ${up ? 'up' : 'left'}.`));
    if (match) { i--; j--; } else if (up) i--; else j--;
  }
  const matches = new Set([...path].filter((k) => { const [r, c] = k.split(',').map(Number); return s[r - 1] === t[c - 1]; }));
  frames.push(frame(W, H, draw((r, c) => (matches.has(`${r},${c}`) ? 'good' : path.has(`${r},${c}`) ? 'done' : 'dim')),
    `One LCS is ${res}, length ${dp[n][m]}: the green matches on the path. O(nm) time; each row needs only the row above.`));
  return [{ title: 'Longest common subsequence', frames }];
}

export default {
  'prefix-sums': prefixSums,
  'difference-arrays': differenceArrays,
  'dp-basics': dpBasics,
  lis,
  lcs,
};
