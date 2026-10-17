// Pictures for the Grid DP, interval DP and choosing the state worked problem, made by running its solution on the official sample.
// Kattis stringfactoring, sample 1: PRATTATTATTIC has least weight 6.

import { row, span, text } from '../draw.js';
import { frame } from '../stages/common.js';

const S = 'PRATTATTATTIC';
const ANSWER = 6;

// The solution: dp[l][r] is the least weight of s[l..r]. how[l][r] records the choice, to draw the factoring.
function solve(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => Array(n).fill(0));
  const how = Array.from({ length: n }, () => Array(n).fill(null));
  for (let len = 1; len <= n; len++) {
    for (let l = 0; l + len - 1 < n; l++) {
      const r = l + len - 1;
      dp[l][r] = len;
      how[l][r] = { kind: 'plain' };
      for (let k = l; k < r; k++) {
        if (dp[l][k] + dp[k + 1][r] < dp[l][r]) { dp[l][r] = dp[l][k] + dp[k + 1][r]; how[l][r] = { kind: 'split', k }; }
      }
      for (let d = 1; d < len; d++) {
        if (len % d === 0 && s.slice(l, r - d + 1) === s.slice(l + d, r + 1) && dp[l][l + d - 1] < dp[l][r]) {
          dp[l][r] = dp[l][l + d - 1];
          how[l][r] = { kind: 'rep', d };
        }
      }
    }
  }
  return { dp, how };
}

// A factoring as a tree: plain letters, two parts side by side, or a block of d letters repeated.
const plain = (l, r) => ({ kind: 'plain', l, r });
const rep = (l, r, d, inner) => ({ kind: 'rep', l, r, d, inner });
const seq = (...parts) => ({ kind: 'seq', parts });
const fromDp = (how, l, r) => {
  const h = how[l][r];
  if (h.kind === 'plain') return plain(l, r);
  if (h.kind === 'split') return seq(fromDp(how, l, h.k), fromDp(how, h.k + 1, r));
  return rep(l, r, h.d, fromDp(how, l, l + h.d - 1));
};

const SUP = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
// The written factoring, the letters it keeps (its weight), and one bracket per repeat with its nesting depth.
function read(s, t) {
  if (t.kind === 'plain') return { text: s.slice(t.l, t.r + 1), kept: Array.from({ length: t.r - t.l + 1 }, (_, i) => t.l + i), brackets: [], depth: 0 };
  if (t.kind === 'seq') {
    const parts = t.parts.map((p) => read(s, p));
    return { text: parts.map((p) => p.text).join(''), kept: parts.flatMap((p) => p.kept), brackets: parts.flatMap((p) => p.brackets), depth: Math.max(...parts.map((p) => p.depth)) };
  }
  const len = t.r - t.l + 1;
  if (len % t.d || s.slice(t.l, t.r - t.d + 1) !== s.slice(t.l + t.d, t.r + 1)) throw new Error(`not a repeat: ${s.slice(t.l, t.r + 1)}`);
  const inner = read(s, t.inner);
  const written = `(${inner.text})${SUP[len / t.d]}`;
  return { text: written, kept: inner.kept, brackets: [...inner.brackets, { l: t.l, r: t.r, label: written, depth: inner.depth + 1 }], depth: inner.depth + 1 };
}

export default function intervalDp() {
  const n = S.length;
  const { dp, how } = solve(S);
  if (dp[0][n - 1] !== ANSWER) throw new Error(`String Factoring: got ${dp[0][n - 1]}, the sample says ${ANSWER}`);

  const W = 440, H = 146, x = 26, size = 26, gap = 4;
  const at = { x, size, gap };
  const levelY = (lv) => 58 + (lv - 1) * 32;
  const letters = (cls) => row([...S], { x, y: 8, size, gap, index: true, cls });
  const note = (s, cls = '') => text(W / 2, 134, s, `v-note ${cls}`);
  const bracket = (l, r, label, lv, cls = 'hl') => span(l, r, label, { ...at, y: levelY(lv), cls });

  // A whole factoring: the letters it keeps lit in cls, one bracket per repeat.
  const factoring = (t, cls) => {
    const f = read(S, t);
    const kept = new Set(f.kept);
    return {
      f,
      body: letters((i) => (kept.has(i) ? cls : 'dim')) + f.brackets.map((b) => bracket(b.l, b.r, b.label, b.depth, cls === 'bad' ? 'hl' : cls)).join(''),
    };
  };

  const frames = [];

  // 0: one factoring, (ATT)³ in the middle.
  const one = factoring(seq(plain(0, 1), rep(2, 10, 3, plain(2, 4)), plain(11, 12)), 'hl');
  frames.push(frame(W, H, one.body + note(`${one.f.text}: weight ${one.f.kept.length}, the letters still written`),
    `One factoring of ${S}: ${one.f.text} keeps ${one.f.kept.length} letters, so its weight is ${one.f.kept.length}.`));

  // 1: writing every TT as (T)² first.
  const pairs = [];
  for (let i = 0; i + 1 < n; i++) if (S[i] === S[i + 1] && !pairs.some(([a, b]) => b === i)) pairs.push([i, i + 1]);
  const greedyParts = [];
  let from = 0;
  for (const [a, b] of pairs) { if (a > from) greedyParts.push(plain(from, a - 1)); greedyParts.push(rep(a, b, 1, plain(a, a))); from = b + 1; }
  if (from < n) greedyParts.push(plain(from, n - 1));
  const greedy = factoring(seq(...greedyParts), 'bad');
  frames.push(frame(W, H, greedy.body + note(`${greedy.f.text}: weight ${greedy.f.kept.length}`, 'bad'),
    `Writing each pair of equal letters as a square first gives ${greedy.f.text}, weight ${greedy.f.kept.length}, and the three ATT blocks can no longer be joined.`));

  // 2: dp[2][4], a split of ATT into A and TT, whose TT was a repeat of T.
  {
    const l = 2, r = 4, k = how[l][r].k;
    if (how[l][r].kind !== 'split' || how[l + 1][r].kind !== 'rep') throw new Error('dp[2][4] should split off A, and TT should be a repeat');
    const body = letters((i) => (i < l || i > r ? 'dim' : 'hl'))
      + bracket(l, k, `${dp[l][k]}`, 1, 'wait') + bracket(k + 1, r, `(T)² = ${dp[k + 1][r]}`, 1, 'wait')
      + bracket(l, r, `dp[${l}][${r}] = ${dp[l][r]}`, 2);
    frames.push(frame(W, H, body + note(`dp[${l}][${r}] = dp[${l}][${k}] + dp[${k + 1}][${r}] = ${dp[l][k]} + ${dp[k + 1][r]} = ${dp[l][r]}`, 'hl'),
      `Length 3, ${S.slice(l, r + 1)}: the split after ${S[l]} reads dp[${l}][${k}] = ${dp[l][k]} and dp[${k + 1}][${r}] = ${dp[k + 1][r]}, since TT is T repeated. dp[${l}][${r}] = ${dp[l][r]}.`));
  }

  // 3: dp[2][10], ATT repeated three times, costs what one ATT costs.
  {
    const l = 2, r = 10, h = how[l][r];
    if (h.kind !== 'rep' || h.d !== 3) throw new Error('dp[2][10] should be a repeat of ATT');
    let body = letters((i) => (i < l || i > r ? 'dim' : i < l + h.d ? 'good' : 'hl'));
    for (let b = l; b <= r; b += h.d) body += bracket(b, b + h.d - 1, b === l ? `dp[${l}][${l + h.d - 1}] = ${dp[l][l + h.d - 1]}` : S.slice(b, b + h.d), 1, b === l ? 'good' : 'wait');
    body += bracket(l, r, `dp[${l}][${r}] = ${dp[l][r]}`, 2);
    frames.push(frame(W, H, body + note(`s[${l}..${r - h.d}] = s[${l + h.d}..${r}], so dp[${l}][${r}] = dp[${l}][${l + h.d - 1}] = ${dp[l][r]}`, 'hl'),
      `Length 9, ${S.slice(l, r + 1)}: with d = 3, s[${l}..${r - h.d}] = s[${l + h.d}..${r}], so it is ATT three times and dp[${l}][${r}] = dp[${l}][${l + h.d - 1}] = ${dp[l][r]}.`));
  }

  // 4: the answer, dp[0][12], drawn as the factoring the table chose.
  {
    const best = factoring(fromDp(how, 0, n - 1), 'good');
    if (best.f.kept.length !== ANSWER) throw new Error('the drawn factoring should have the answer\'s weight');
    const k = how[0][n - 1].k;
    frames.push(frame(W, H, best.body + note(`dp[0][${n - 1}] = dp[0][${k}] + dp[${k + 1}][${n - 1}] = ${dp[0][k]} + ${dp[k + 1][n - 1]} = ${dp[0][n - 1]}`, 'good'),
      `dp[0][${n - 1}] = ${dp[0][n - 1]}: ${best.f.text}, whose ${best.f.kept.length} written letters are green.`));
  }
  return [{ title: 'String Factoring, sample 1', frames }];
}
