// Pictures for the DP with Fenwick and segment trees worked problem, made by running its solution on the official sample.
// Kattis greedyincreasingsubsequences, sample 1: 2 2 1 5 3 4 6 splits into 2 5 6, then 2 3 4, then 1.

import { text, row, cellX, legend } from '../draw.js';
import { frame, range } from '../stages/common.js';

const KEY = [2, 2, 1, 5, 3, 4, 6];
const ANSWER = [[2, 5, 6], [2, 3, 4], [1]];

// The passes exactly as the statement describes them, to draw the problem.
function passes(key) {
  const gone = key.map(() => false), out = [];
  while (gone.includes(false)) {
    const picked = [];
    for (let i = 0; i < key.length; i++) {
      if (!gone[i] && (!picked.length || key[i] > key[picked.at(-1)])) { picked.push(i); gone[i] = true; }
    }
    out.push(picked);
  }
  return out;
}

export default function dpStructures() {
  const n = KEY.length;
  const s = [...new Set(KEY)].sort((a, b) => b - a); // distinct keys, largest first
  const m = s.length;
  const rank = KEY.map((k) => s.indexOf(k) + 1);
  const low = (i) => i & -i;
  const t = Array(m + 1).fill(0);
  const dp = Array(n).fill(null);

  // The solution, with a snapshot of the tree and the query's walk for every item.
  const steps = [];
  for (let i = 0; i < n; i++) {
    const r = rank[i], walk = [];
    let best = 0;
    for (let j = r; j > 0; j -= low(j)) { walk.push(j); best = Math.max(best, t[j]); }
    const before = [...t];
    dp[i] = 1 + best;
    for (let j = r; j <= m; j += low(j)) t[j] = Math.max(t[j], dp[i]);
    steps.push({ i, r, walk, best, before, dp: dp.slice(0, i + 1) });
  }
  const seq = [];
  KEY.forEach((k, i) => { (seq[dp[i] - 1] ||= []).push(k); });
  if (JSON.stringify(seq) !== JSON.stringify(ANSWER)) throw new Error(`Greedy Increasing Subsequences: got ${JSON.stringify(seq)}, the sample says ${JSON.stringify(ANSWER)}`);
  const sim = passes(KEY);
  if (JSON.stringify(sim.map((p) => p.map((i) => KEY[i]))) !== JSON.stringify(ANSWER)) throw new Error('the simulated passes should match the sample');

  const W = 440, x = 70, size = 34, gap = 4;
  const note = (str, y, cls = 'hl') => text(W / 2, y, str, `v-note ${cls}`);

  const frames = [];

  // 0: the passes themselves, one row per pass, each showing what is left of the sequence.
  {
    const H = 182, left = KEY.map(() => true);
    let body = '';
    sim.forEach((picked, p) => {
      const y = 10 + p * 52;
      body += row(KEY.map((k, i) => (left[i] ? k : '')), { x, y, size, gap, name: `pass ${p + 1}`, cls: (i) => (!left[i] ? 'void' : picked.includes(i) ? 'good' : 'dim') });
      picked.forEach((i) => { left[i] = false; });
    });
    frames.push(frame(W, H, body + note(sim.map((p) => p.map((i) => KEY[i]).join(' ')).join('  |  '), 172, 'good'),
      `Sample 1: pass 1 picks ${sim[0].map((i) => KEY[i]).join(', ')} (green), pass 2 picks ${sim[1].map((i) => KEY[i]).join(', ')} from what is left, and pass 3 takes the last ${KEY[sim[2][0]]}.`));
  }

  // The DP rows: the keys in input order, and dp[i] once it is known.
  const items = (cls, known, dpCls = cls) => row(KEY, { x, y: 12, size, gap, name: 'key', index: true, cls })
    + row(KEY.map((_, i) => (i < known ? dp[i] : '')), { x, y: 64, size, gap, name: 'dp', cls: dpCls });

  // 1: the plain O(n²) view of item 4: scan the earlier items for keys ≥ its key.
  {
    const i = 4, H = 146;
    const earlier = range(i).filter((j) => KEY[j] >= KEY[i]);
    const cls = (j) => (j === i ? 'hl' : j < i && KEY[j] >= KEY[i] ? 'wait' : 'dim');
    const best = Math.max(0, ...earlier.map((j) => dp[j]));
    if (1 + best !== dp[i]) throw new Error('the scan and the tree should agree');
    frames.push(frame(W, H, items(cls, i + 1, (j) => (j === i ? 'hl' : earlier.includes(j) ? 'wait' : 'dim'))
      + note(`dp[${i}] = 1 + max(${earlier.map((j) => `dp[${j}]`).join(', ')}) = 1 + ${best} = ${dp[i]}`, 132),
      `Item ${i}, key ${KEY[i]}: of the earlier items only ${earlier.map((j) => `item ${j} (key ${KEY[j]})`).join(', ')} has a key ≥ ${KEY[i]}, so dp[${i}] = 1 + ${best} = ${dp[i]}.`));
  }

  // The tree over the ranks, as in the stage's Fenwick diagram: bar t[i] covers the lowbit(i) ranks ending at i.
  const tx = x, tsize = 46, tgap = 4, ty = 128;
  const cx = (k) => cellX(k, { x: tx, size: tsize, gap: tgap });
  const tree = (tt, cls) => {
    let out = row(s, { x: tx, y: ty, size: tsize, gap: tgap, name: 's', index: true, indexFrom: 1, cls: (k) => cls.rank(k + 1) })
      + text(tx - 10, ty + tsize + 11, 'r', 'v-name', 'end');
    for (let i = 1; i <= m; i++) {
      const x1 = cx(i - low(i)), x2 = cx(i - 1) + tsize, yb = ty + 64 + Math.log2(low(i)) * 27;
      const lbl = text((x1 + x2) / 2, yb + 11, `t[${i}]=${tt[i]}`, 'v-label').replace('<text ', low(i) === 1 ? '<text style="font-size: 10px" ' : '<text ');
      out += `<g class="v-bar ${cls.bar(i)}"><rect x="${x1 + 2}" y="${yb}" width="${x2 - x1 - 4}" height="22" rx="6"/>${lbl}</g>`;
    }
    return out;
  };
  const H2 = 296;

  // 2 and 3: an item's query on the tree, the moment before its update.
  for (const i of [1, 4]) {
    const st = steps[i];
    const read = new Set(st.walk);
    const cover = (k) => st.walk.some((b) => k > b - low(b) && k <= b);
    const body = items((j) => (j === i ? 'hl' : j < i ? '' : 'dim'), i + 1, (j) => (j === i ? 'hl' : j < i ? '' : 'dim'))
      + tree(st.before, { rank: (k) => (k > st.r ? 'dim' : cover(k) ? 'hl' : ''), bar: (b) => (read.has(b) ? 'hl' : 'dim') })
      + note(`query(${st.r}) = max(${st.walk.map((b) => `t[${b}]`).join(', ')}) = ${st.best}, so dp[${i}] = ${st.best} + 1 = ${dp[i]}`, 286);
    frames.push(frame(W, H2, body,
      `Item ${i}, key ${KEY[i]}, rank ${st.r}: query(${st.r}) reads ${st.walk.map((b) => `t[${b}] = ${st.before[b]}`).join(' and ')}, the best pass among earlier keys ≥ ${KEY[i]}, so dp[${i}] = ${st.best} + 1 = ${dp[i]}. Then update(${st.r}, ${dp[i]}).`));
  }

  // 4: the end: every item's pass, and the tree after the last update.
  {
    const PASS = ['good', 'wait', 'hl'];
    const passCls = (j) => PASS[dp[j] - 1] || '';
    frames.push(frame(W, H2, items(passCls, n) + tree(t, { rank: () => '', bar: () => '' })
      + seq.map((q, p) => legend([[PASS[p] || '', `pass ${p + 1}: ${q.join(' ')}`]], { x: 40 + p * 136, y: 286 })).join(''),
      `Every dp[i] is item i's pass: ${seq.map((q, p) => `pass ${p + 1} is ${q.join(' ')}`).join(', ')}.`));
  }
  return [{ title: 'Greedy Increasing Subsequences, sample 1', frames }];
}
