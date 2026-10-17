// Pictures for the Prefix and suffix sums worked problem, made by running its solution on the official sample.
// Kattis Game Night, Sample Input 1: five people sit A, B, A, B, C around a round table; the answer is 2.

import { text, row, span, table } from '../draw.js';
import { frame, range } from '../stages/common.js';

const SAMPLE = { s: 'ABABC', answer: 2 };
const TEAMS = 'ABC';

export default () => {
  const { s } = SAMPLE;
  const n = s.length;
  // The solution: t = s + s, P[c][i] = how many of the first i seats of t hold team c, then every
  // order (A B C or A C B) and start seat, keeping the three blocks' members who already sit there.
  const t = s + s;
  const P = range(3).map((c) => [...t].reduce((p, ch) => [...p, p.at(-1) + (TEAMS.indexOf(ch) === c ? 1 : 0)], [0]));
  const runs = [];
  for (const order of [[0, 1, 2], [0, 2, 1]]) {
    for (let start = 0; start < n; start++) {
      let l = start, stay = 0;
      const blocks = order.map((c) => {
        const r = l + P[c][n];
        const kept = P[c][r] - P[c][l];
        const b = { c, l, r, kept };
        stay += kept;
        l = r;
        return b;
      });
      runs.push({ order, start, blocks, stay, moves: n - stay });
    }
  }
  const best = Math.min(...runs.map((run) => run.moves));
  if (best !== SAMPLE.answer) throw new Error(`Game Night sample 1: the solution gives ${best}, the sample output is ${SAMPLE.answer}`);
  const runOf = (order, start) => runs.find((run) => run.order.join() === order && run.start === start);
  const name = (run) => run.order.map((c) => TEAMS[c]).join(', ');
  const seats = (b) => (b.r - b.l === 1 ? `t[${b.l}]` : `t[${b.l}..${b.r - 1}]`);

  // The round table: seat i at the clock position i/n of a turn, seat 0 at the top.
  const W = 440, H = 232, cx = 118, cy = 116, R = 70, box = 30;
  const angle = (i) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pt = (a, rad) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)].map((v) => +v.toFixed(1));
  const seat = (i, cls) => {
    const [x, y] = pt(angle(i), R);
    return `<g class="v-cell ${cls}"><rect x="${x - box / 2}" y="${y - box / 2}" width="${box}" height="${box}" rx="6"/>${text(x, y, s[i])}</g>`
      + text(...pt(angle(i), R - 34), i, 'v-idx');
  };
  // A block of seats l..r-1 (seat numbers mod n) as an arc outside the ring, with its team's letter.
  const arc = (b) => {
    const rad = R + 26, a1 = angle(b.l - 0.36), a2 = angle(b.r - 1 + 0.36);
    const [x1, y1] = pt(a1, rad), [x2, y2] = pt(a2, rad);
    return `<path class="v-bracket" d="M${x1} ${y1} A${rad} ${rad} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${x2} ${y2}"/>`
      + text(...pt((a1 + a2) / 2, rad + 16), TEAMS[b.c], 'v-note hl');
  };
  const side = (lines) => lines.map(([str, cls], k) => text(258, 48 + k * 26, str, `v-note ${cls || ''}`, 'start')).join('');
  const circle = (run) => {
    const disk = `<circle class="v-area" cx="${cx}" cy="${cy}" r="${R - 21}"/>`;
    if (!run) return disk + range(n).map((i) => seat(i, '')).join('');
    const target = Array(n);
    for (const b of run.blocks) for (let i = b.l; i < b.r; i++) target[i % n] = b.c;
    return disk + range(n).map((i) => seat(i, TEAMS.indexOf(s[i]) === target[i] ? 'good' : 'bad')).join('') + run.blocks.filter((b) => b.r > b.l).map(arc).join('');
  };

  const frames = [];
  const counts = range(3).map((c) => `${TEAMS[c]}: ${P[c][n]}`);
  frames.push(frame(W, H, circle(null) + side([[`${n} seats in a circle`], [counts.join('   ')], [`seat ${n - 1} is next to seat 0`]]),
    `Sample 1: ${s.split('').join(', ')} around the table, seats 0 to ${n - 1}. Team sizes ${counts.join(', ')}.`));
  const first = runOf('0,1,2', 0);
  frames.push(frame(W, H, circle(first) + side([
    [`order ${name(first)} from seat 0`],
    ...first.blocks.map((b) => [`${TEAMS[b.c]}: ${b.r - b.l === 1 ? `seat ${b.l}` : `seats ${b.l}–${b.r - 1}`}, keeps ${b.kept}`]),
    [`move ${n} − ${first.stay} = ${first.moves}`, 'bad'],
  ]), `One final seating: order ${name(first)} from seat 0. Green people already sit in their team's block; the ${first.moves} red ones must move.`));

  // The doubled seating t and the prefix counts P[c][i], one row per team.
  const x = 64, size = 30, gap = 4, yt = 46, yp = [106, 142, 178], GH = 254;
  const opt = { x, size, gap };
  const grid = ({ withP = true, tCls = () => '', pCls = () => '', extra = '' } = {}) => (withP ? prefixRows(pCls) : '')
    + row([...t], { ...opt, y: yt, name: 't', index: true, cls: tCls }) + extra;
  const prefixRows = (pCls) => range(3).map((c) => row(P[c], { ...opt, y: yp[c], name: `P[${TEAMS[c]}]`, index: c === 2, cls: (i) => pCls(c, i) })).join('');
  const blockCls = (run) => (i) => {
    const b = run.blocks.find((bb) => bb.l <= i && i < bb.r);
    return !b ? 'dim' : TEAMS.indexOf(t[i]) === b.c ? 'good' : 'bad';
  };
  const brackets = (run) => run.blocks.filter((b) => b.r > b.l).map((b) => span(b.l, b.r - 1, TEAMS[b.c], { ...opt, y: yt - 4, up: true })).join('');
  const sum = (run) => text(x - 30, GH - 12, `stay ${run.blocks.map((b) => b.kept).join(' + ')} = ${run.stay}, move ${n} − ${run.stay} = ${run.moves}`, 'v-note', 'start');
  const reads = (run) => (c, i) => {
    const b = run.blocks.find((bb) => bb.c === c);
    return b.r > b.l && (i === b.l || i === b.r) ? 'hl' : 'dim';
  };

  const wrap = runOf('0,2,1', 2);
  const wrapB = wrap.blocks.find((b) => b.r > n);
  const halves = span(0, n - 1, `s, seats 0–${n - 1}`, { ...opt, y: yt + 52, cls: 'wait' }) + span(n, 2 * n - 1, 'the same seats again', { ...opt, y: yt + 52, cls: 'wait' });
  frames.push(frame(W, 136, grid({ withP: false, tCls: blockCls(wrap), extra: brackets(wrap) + halves }),
    `t is the seating written twice. Order ${name(wrap)} from seat 2: B's block ${seats(wrapB)} is seats ${wrapB.l - n} and ${wrapB.r - 1 - n}, past the end of s.`));
  frames.push(frame(W, GH - 26, grid({ pCls: (c, i) => (i === n ? 'good' : '') }),
    `P[c][i] counts team c in t[0..i−1]. One pass fills all three rows; P[c][${n}] is the size of team c: ${counts.join(', ')}.`));
  for (const run of [first, wrap]) {
    frames.push(frame(W, GH, grid({ tCls: blockCls(run), pCls: reads(run), extra: brackets(run) + sum(run) }),
      `Order ${name(run)} from seat ${run.start}: ${run.blocks.map((b) => `P[${TEAMS[b.c]}][${b.r}] − P[${TEAMS[b.c]}][${b.l}] = ${b.kept}`).join(', ')}. ${run.stay} stay and ${run.moves} move.`));
  }

  // Every candidate: how many people it moves.
  const tx = 168, ty = 64, cell = 38;
  const cand = (oi, st) => runs[oi * n + st];
  frames.push(frame(W, 176,
    table(2, n, (r, c) => ({ v: cand(r, c).moves, cls: cand(r, c).moves === best ? 'good' : '' }), { x: tx, y: ty, size: cell, rowHead: ['order A, B, C', 'order A, C, B'], colHead: range(n) })
    + text(tx + (n * cell) / 2, ty - 34, 'start seat', 'v-head')
    + text(tx + (n * cell) / 2, ty + 2 * cell + 22, `fewest moves: ${best}`, 'v-note good'),
  `People who must move, for all ${2 * n} candidates. The fewest is ${best}, the sample's answer.`));
  return [{ title: 'Game Night, sample 1', frames }];
};
