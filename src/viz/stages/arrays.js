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

  // A new array and the case k = 0: a[l..r] sums to 0 exactly when P[l] = P[r + 1].
  // Drawn with the slide's names, a and P, for this second array (a2, P2 here).
  const a2 = [2, -1, 3, -2, -2, 4];
  const P2 = prefix(a2);
  const H2 = 190, seen = new Map([[0, [0]]]);
  const seenText = () => text(x - 10, 172, `seen: ${[...seen].map(([v, at]) => `${num(v)}×${at.length}`).join('  ')}`, 'v-note', 'start');
  const draw2 = (j, aCls, pCls, extra = '') =>
    row(a2.map(num), { x, y: ya, name: 'a', index: true, cls: aCls })
    + row(P2.map((v, i) => (i <= j ? num(v) : '')), { x, y: yp, name: 'P', index: true, cls: pCls }) + seenText() + extra;
  frames.push(frame(W, H2, draw2(0, () => '', (k) => (k === 0 ? 'hl' : '')),
    'A new array a, and the case k = 0: a[l..r] sums to 0 exactly when P[l] = P[r + 1]. Walk its prefix sums P, counting in `seen` how often each value has occurred.'));
  let count = 0;
  for (let j = 1; j <= a2.length; j++) {
    const earlier = seen.get(P2[j]) || [];
    count += earlier.length;
    const first = earlier[0];
    frames.push(frame(W, H2, draw2(j,
      (k) => (earlier.length && k >= first && k < j ? 'good' : k === j - 1 ? 'wait' : k < j ? '' : 'dim'),
      (k) => (k === j ? (earlier.length ? 'good' : 'hl') : earlier.includes(k) ? 'good' : k < j ? 'done' : ''),
      earlier.length ? span(first, j - 1, 'sum = 0', { x, y: ya - 4, up: true, cls: 'good' }) : ''),
    earlier.length
      ? `P[${j}] = ${num(P2[j])} was seen before, at P[${first}]: a[${first}..${j - 1}] sums to 0. Blocks so far: ${count}.`
      : `P[${j}] = P[${j - 1}] + a[${j - 1}] = ${num(P2[j])}, a value not seen before: no zero-sum block ends at ${j - 1}.`));
    seen.set(P2[j], [...earlier, j]);
  }
  frames.push(frame(W, H2, draw2(a2.length, () => '', (k) => ([...seen.values()].some((at) => at.length > 1 && at.includes(k)) ? 'good' : 'dim')),
    `${count} zero-sum blocks, one per pair of equal prefix values, found in one pass with \`seen\`, a map from value to count: O(n log n).`));
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
    'Range updates without touching every cell. a starts at all 0s, so its difference array d (n + 1 cells) does too; record where each update starts and stops in d, then rebuild a once. If a starts non-zero, add the rebuilt changes to it.')];
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
  // The cells that got two updates (a[1..4] here), with one example of each pair of updates.
  const from = (i) => ups.filter(([l, r]) => l <= i && i <= r).map(([, , v]) => v);
  const both = range(n).filter((i) => from(i).length > 1);
  const examples = both.filter((i, k) => both.findIndex((j) => from(j).join() === from(i).join()) === k);
  frames.push(frame(W, H, draw(() => 'dim', (k) => (both.includes(k) ? 'good' : '')),
    `Done: ${ups.length} updates at O(1) each, then one O(n) pass. a[${both[0]}..${both.at(-1)}] (green) each got two updates: ${examples.map((i) => `a[${i}] = ${from(i).join(' + ')} = ${a[i]}`).join(', ')}.`));
  return [{ title: 'Difference arrays', frames }];
}

function dpBasics() {
  // Never two neighbours: the template's dp[i][s] with K = 1. Row i covers the first i values;
  // s = 1 when row i's value was taken, s = 0 when it was skipped (or i = 0, the empty prefix).
  const v = [5, 1, 3, 8, 2, 6];
  const n = v.length, size = 32, W = 440, H = 292, xi = 30, xv = 46, xd = 106, y = 56, xs = 190;
  const dp = [[0, -Infinity]];
  const fmt = (val) => (val === -Infinity ? '−∞' : String(val));
  const cell = (r, s) => (dp[r]?.[s] === undefined ? '' : fmt(dp[r][s]));
  const draw = ({ dCls = () => '', vCls = () => '', side = [] } = {}) =>
    text(xi, y - 12, 'i', 'v-head') + range(n + 1).map((r) => text(xi, y + r * size + size / 2, r, 'v-idx')).join('')
    + table(n + 1, 1, (r) => ({ v: r ? v[r - 1] : '', cls: r ? vCls(r) : 'void' }), { x: xv, y, size, colHead: ['value'] })
    + table(n + 1, 2, (r, s) => ({ v: cell(r, s), cls: dCls(r, s) }), { x: xd, y, size, colHead: ['s=0', 's=1'] })
    + text(xd + size, y - 34, 'dp[i][s]', 'v-head')
    + side.map(([s, c], k) => text(xs, y + 16 + k * 24, s, `v-note ${c}`, 'start')).join('')
    + text(xs, y + 5.5 * size, 's = 1: this row\'s value was taken', 'v-idx', 'start')
    + text(xs, y + 6.5 * size, 's = 0: it was skipped', 'v-idx', 'start');
  const frames = [frame(W, H, draw({ dCls: (r) => (r === 0 ? 'done' : '') }),
    'Never take two neighbours (the template with K = 1). dp[i][s] is the best total from the first i values, with s = 1 if the i-th was taken and s = 0 if not. Row 0 is the empty prefix: 0, and −∞ for s = 1, which is impossible.')];
  for (let r = 1; r <= n; r++) {
    const x = v[r - 1], [s0, s1] = dp[r - 1];
    const skip = Math.max(s0, s1), take = s0 + x;
    const skipNote = `skip ${x}: max(${fmt(s0)}, ${fmt(s1)}) = ${skip}`, takeNote = `take ${x}: ${s0} + ${x} = ${take}`;
    dp.push([skip]);
    frames.push(frame(W, H, draw({
      dCls: (rr, s) => (rr === r && s === 0 ? 'hl' : rr === r - 1 ? 'wait' : rr < r ? 'done' : ''),
      vCls: (rr) => (rr <= r ? '' : 'dim'),
      side: [[skipNote, 'hl']],
    }), `Skip ${x}: dp[${r}][0] = max(dp[${r - 1}][0], dp[${r - 1}][1]) = max(${fmt(s0)}, ${fmt(s1)}) = ${skip}.`));
    dp[r][1] = take;
    frames.push(frame(W, H, draw({
      dCls: (rr, s) => (rr === r && s === 1 ? 'hl' : rr === r - 1 && s === 0 ? 'wait' : rr <= r ? 'done' : ''),
      vCls: (rr) => (rr === r ? 'wait' : rr < r ? '' : 'dim'),
      side: [[skipNote, ''], [takeNote, 'hl']],
    }), `Take ${x}: it may only follow s = 0, so dp[${r}][1] = dp[${r - 1}][0] + ${x} = ${s0} + ${x} = ${take}.`));
  }
  // Walk back from the larger entry of the last row: s says whether that row's value was taken.
  const path = [], taken = new Set();
  const larger = (r) => (dp[r][1] > dp[r][0] ? 1 : 0);
  for (let r = n, s = larger(n); r > 0;) {
    const x = v[r - 1], val = dp[r][s];
    const [nr, ns] = s ? [r - 1, 0] : [r - 1, larger(r - 1)];
    path.push([r, s]);
    if (s) taken.add(r);
    const at = `${path.length === 1 ? `Walk back from the larger entry of the last row, dp[${r}][${s}]` : `dp[${r}][${s}]`} = ${val}`;
    const next = nr ? `Step to dp[${nr}][${ns}].` : 'Step to dp[0][0], the empty prefix: stop.';
    const [cr, cs] = [r, s], seenPath = path.map(([pr, ps]) => `${pr},${ps}`);
    frames.push(frame(W, H, draw({
      dCls: (rr, ss) => (rr === cr && ss === cs ? 'hl' : rr === nr && ss === ns ? 'wait' : seenPath.includes(`${rr},${ss}`) ? (ss ? 'good' : 'done') : 'dim'),
      vCls: (rr) => (rr === cr ? (cs ? 'good' : 'bad') : taken.has(rr) ? 'good' : 'dim'),
    }), s
      ? `${at}: ${x} was taken, so the value before it was skipped. ${next}`
      : `${at}: ${x} was skipped, and ${val} is the larger of dp[${nr}][0] = ${fmt(dp[nr][0])} and dp[${nr}][1] = ${fmt(dp[nr][1])}. ${next}`));
    [r, s] = [nr, ns];
  }
  path.push([0, 0]);
  const onPath = new Set(path.map(([pr, ps]) => `${pr},${ps}`));
  const picked = [...taken].sort((p, q) => p - q);
  frames.push(frame(W, H, draw({
    dCls: (rr, ss) => (onPath.has(`${rr},${ss}`) ? (ss ? 'good' : 'done') : 'dim'),
    vCls: (rr) => (taken.has(rr) ? 'good' : 'dim'),
  }), `Best total: ${picked.map((r) => v[r - 1]).join(' + ')} = ${Math.max(...dp[n])}. Each row was built from the row above alone, so two rows of memory and O(n) time are enough.`));
  return [{ title: 'Take or skip', frames }];
}

function lis() {
  // The last value, 1, lands in tails[0] after the LIS is complete, so the final tails is not a subsequence.
  const a = [4, 2, 9, 3, 6, 10, 5, 8, 1];
  const W = 420, H = 236, x = 70, base = 128, unit = 11, yt = 166;
  const tails = [], tailIdx = [], par = Array(a.length).fill(-1), lenAt = [];
  const bars = (cls) => a.map((v, i) => {
    const bx = cellX(i, { x });
    return `<g class="v-bar ${cls(i)}"><rect x="${bx + 3}" y="${base - v * unit}" width="28" height="${v * unit}" rx="4"/></g>${text(bx + 17, base + 12, v, 'v-idx')}`;
  }).join('');
  const tailsRow = (cls) => row([...tails, ...Array(Math.max(0, 4 - tails.length)).fill('')], { x, y: yt, name: 'tails', index: true, cls });
  const cur = (i) => (j) => (j === i ? 'hl' : j < i ? '' : 'dim');
  const frames = [frame(W, H, bars(() => '') + tailsRow(() => ''),
    'tails[k] holds the smallest value an increasing subsequence of length k + 1 can end with. Each new value binary-searches tails.')];
  a.forEach((v, i) => {
    // lower_bound: the first tail that is at least v.
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1, less = tails[mid] < v, [l0, h0] = [lo, hi];
      frames.push(frame(W, H, bars(cur(i)) + tailsRow((j) => (j === mid ? 'wait' : j < l0 || j >= h0 ? 'dim' : '')),
        `${v}: is tails[${mid}] = ${tails[mid]}, the length-${mid + 1} tail, less than ${v}? ${less ? `Yes, so ${v} can go after it: search longer lengths.` : `No: search this length and shorter.`}`));
      if (less) lo = mid + 1; else hi = mid;
    }
    const k = lo, append = k === tails.length, old = tails[k];
    if (k > 0) par[i] = tailIdx[k - 1];
    lenAt[i] = k + 1;
    tails[k] = v;
    tailIdx[k] = i;
    frames.push(frame(W, H, bars(cur(i)) + tailsRow((j) => (j === k ? (append ? 'good' : 'hl') : '')),
      !k && append ? `tails is empty: ${v} becomes tails[0], the end of a length-1 subsequence.`
        : append ? `${v} is bigger than every tail, so it follows tails[${k - 1}] = ${tails[k - 1]} and becomes tails[${k}], the end of a length-${k + 1} subsequence.`
          : `The first tail ≥ ${v} is tails[${k}] = ${old}, the length-${k + 1} tail. Replace it: length ${k + 1} can now end lower, at ${v}.`));
  });
  // Recover one subsequence by following parent pointers back from the last tail.
  const seq = [];
  const finalTails = tails.join(', ');
  for (let i = tailIdx[tails.length - 1]; i !== -1; i = par[i]) {
    seq.unshift(i);
    const p = par[i], here = i, picked = new Set(seq);
    frames.push(frame(W, H, bars((j) => (j === here ? 'hl' : picked.has(j) ? 'good' : 'dim')) + tailsRow(() => 'dim'),
      p === -1 ? `${a[here]} started its subsequence, so stop. Reading forwards: ${seq.map((j) => a[j]).join(', ')}. tails ends as ${finalTails}, which is not a subsequence: its ${tails[0]} is the last value of a.`
        : `${a[here]} ended a length-${lenAt[here]} subsequence after ${a[p]}, the length-${lenAt[here] - 1} tail when ${a[here]} arrived. Step back to ${a[p]}.`));
  }
  frames.push(frame(W, H, bars((j) => (seq.includes(j) ? 'good' : 'dim')) + tailsRow(() => 'dim'),
    `LIS length ${tails.length}: ${seq.map((j) => a[j]).join(', ')}, rebuilt from par, not read off tails. n binary searches: O(n log n). Use upper_bound for non-decreasing.`));
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
