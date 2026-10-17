// Pictures for the LCS worked problem, Prince and Princess (Kattis princeandprincess), on its sample: the
// plain LCS table, then the solution, which rewrites b as positions in a and runs tails on them. Both throw
// if their answer differs from the sample's output, Case 1: 4.

import { text, row, cellX, table } from '../draw.js';
import { frame, range } from '../stages/common.js';

const SAMPLE = { n: 3, a: [1, 7, 5, 4, 8, 3, 9], b: [1, 4, 3, 5, 6, 2, 8, 9], expected: 4 };

// dp[i][j] = LCS of the first i squares of a and the first j of b.
function lcsTable() {
  const { a, b, expected } = SAMPLE;
  const n = a.length, m = b.length, size = 26, W = 400, x = (W - size * (m + 1)) / 2 + 12, y = 52;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  if (dp[n][m] !== expected) throw new Error(`Prince and Princess: the LCS table gives ${dp[n][m]}, the sample says ${expected}`);
  const match = (r, c) => r > 0 && c > 0 && a[r - 1] === b[c - 1];
  const matches = range(n + 1).flatMap((r) => range(m + 1).filter((c) => match(r, c)));
  const body = table(n + 1, m + 1, (r, c) => ({ v: dp[r][c], cls: match(r, c) ? 'good' : !r || !c ? 'done' : '' }),
    { x, y, size, rowHead: ['', ...a], colHead: ['', ...b] })
    + text(x - 34, y + size * (n + 1) / 2 + size / 2, 'a', 'v-name') + text(x + size * (m + 1) / 2 + size / 2, y - 34, 'b', 'v-name');
  return {
    title: 'The LCS table',
    frames: [frame(W, y + size * (n + 1) + 12, body,
      `dp[i][j] for the sample: dp[${n}][${m}] = ${dp[n][m]}. Only the ${matches.length} green cells, where the squares are equal, add 1; each row has at most one.`)],
  };
}

// The solution: pos[v] is the index of square v in a; b, rewritten by pos without the squares a never
// visits, is a list whose longest increasing subsequence (tails, lower_bound) is the answer.
function positions() {
  const { n, a, b, expected } = SAMPLE;
  const pos = Array(n * n + 1).fill(-1);
  a.forEach((v, i) => { pos[v] = i; });
  const kept = [], tails = [], tailIdx = [], par = [], steps = [];
  b.forEach((v, j) => {
    if (pos[v] < 0) return;
    const i = kept.length, x = pos[v];
    kept.push(j);
    let lo = 0, hi = tails.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (tails[mid] < x) lo = mid + 1; else hi = mid; }
    const k = lo, old = tails[k];
    par[i] = k > 0 ? tailIdx[k - 1] : -1;
    tails[k] = x;
    tailIdx[k] = i;
    steps.push({ j, k, old, tails: [...tails] });
  });
  if (tails.length !== expected) throw new Error(`Prince and Princess: tails gives ${tails.length}, the sample says ${expected}`);
  const route = [];
  for (let i = tailIdx.at(-1); i !== -1; i = par[i]) route.unshift(kept[i]);

  const size = 32, gap = 8, x0 = 64, ya = 34, yb = 122, yp = 172, yt = 238, W = 400, H = 296;
  const cx = (i) => cellX(i, { x: x0, size, gap }) + size / 2;
  const lines = (cls) => b.map((v, j) => (pos[v] < 0 ? ''
    : `<line class="v-edge ${cls(j)}" x1="${cx(pos[v])}" y1="${ya + size + 2}" x2="${cx(j)}" y2="${yb - 2}"/>`)).join('');
  const base = (aCls, bCls, lineCls) => range(a.length).map((i) => text(cx(i), ya - 12, i, 'v-idx')).join('')
    + row(a, { x: x0, y: ya, size, gap, name: 'a', cls: aCls })
    + row(b, { x: x0, y: yb, size, gap, name: 'b', cls: bCls })
    + lines(lineCls);
  const onA = (i) => b.includes(a[i]), onB = (j) => pos[b[j]] >= 0;
  const posRow = (cls) => row(b.map((v) => (pos[v] < 0 ? '–' : pos[v])), { x: x0, y: yp, size, gap, name: 'pos', cls: (j) => (onB(j) ? cls(j) : 'dim') });
  const tailsRow = (vals, cls) => row([...vals, ...Array(Math.max(0, 4 - vals.length)).fill('')], { x: x0, y: yt, size, gap, name: 'tails', index: true, cls });
  const dimUnmatched = (on) => (i) => (on(i) ? '' : 'dim');

  const frames = [frame(W, H, base(dimUnmatched(onA), dimUnmatched(onB), () => ''),
    'Lines join the squares both routes visit. A common route is a set of lines that don\'t cross.')];
  frames.push(frame(W, H, base(dimUnmatched(onA), dimUnmatched(onB), () => '') + posRow(() => '') + tailsRow([], () => ''),
    `pos rewrites b as positions in a: ${kept.map((j) => pos[b[j]]).join(', ')}. Squares ${b.filter((v) => pos[v] < 0).join(' and ')} are not on a and drop out.`));
  for (const { j, k, old, tails: t } of steps) {
    const x = pos[b[j]], append = old === undefined;
    const state = (jj) => (jj === j ? 'hl' : jj < j ? '' : 'dim');
    frames.push(frame(W, H, base((i) => (i === x ? 'hl' : onA(i) ? '' : 'dim'), (jj) => (onB(jj) ? state(jj) : 'dim'), (jj) => (jj === j ? 'hl' : jj < j ? '' : 'dim'))
      + posRow(state) + tailsRow(t, (kk) => (kk === k ? (append ? 'good' : 'hl') : '')),
    append
      ? `Square ${b[j]} is a[${x}]. ${x} is above every tail, so it ends a common route of ${k + 1}: tails[${k}] = ${x}.`
      : `Square ${b[j]} is a[${x}]. The first tail ≥ ${x} is tails[${k}] = ${old}; ${x} replaces it, so a common route of ${k + 1} can end earlier in a.`));
  }
  const chosen = new Set(route), chosenA = new Set(route.map((j) => pos[b[j]]));
  frames.push(frame(W, H, base((i) => (chosenA.has(i) ? 'good' : 'dim'), (j) => (chosen.has(j) ? 'good' : 'dim'), (j) => (chosen.has(j) ? 'good' : 'dim'))
    + posRow((j) => (chosen.has(j) ? 'good' : 'dim')) + tailsRow(steps.at(-1).tails, () => 'dim'),
  `Case 1: ${tails.length}. One longest common route, rebuilt from par: ${route.map((j) => b[j]).join(', ')}; its lines don't cross.`));
  return { title: 'Positions in a, then LIS', frames };
}

export default () => [lcsTable(), positions()];
