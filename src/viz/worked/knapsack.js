// Pictures for the knapsack worked problem, A Musical Question (Kattis amusicalquestion): the solution run
// on sample 2, W = 100 and songs 10 20 30 40 50. Throws if its answer differs from the sample's "80 70".

import { text, row, table, legend } from '../draw.js';
import { frame, range } from '../stages/common.js';

const W = 100, w = [10, 20, 30, 40, 50], expected = [80, 70];
const STEP = 10; // every song is a multiple of 10, so the picture shows rows and columns 0, 10, …, 100

export default () => {
  // can[c1][c2]: some songs fill the first CD with exactly c1 minutes and the second with exactly c2.
  // Each song is one pass over c1 from W down: can[c1] |= (can[c1] << w[i]) | can[c1 − w[i]].
  const can = Array.from({ length: W + 1 }, () => Array(W + 1).fill(false));
  can[0][0] = true;
  const copy = () => can.map((r) => [...r]);
  const snaps = [copy()];
  let mid = null; // the table during song 30's pass, just after row c1 = 30
  w.forEach((wi, i) => {
    for (let c1 = W; c1 >= 0; c1--) {
      const old = [...can[c1]];
      for (let c2 = 0; c2 <= W; c2++)
        can[c1][c2] = old[c2] || (c2 >= wi && old[c2 - wi]) || (c1 >= wi && can[c1 - wi][c2]);
      if (wi === 30 && c1 === 30) mid = { before: snaps[i], now: copy(), c1, wi };
    }
    snaps.push(copy());
  });
  can.forEach((r, c1) => r.forEach((on, c2) => {
    if (on && (c1 % STEP || c2 % STEP)) throw new Error(`A Musical Question: (${c1}, ${c2}) is reachable but not drawn`);
  }));
  let best = [0, 0];
  for (let c1 = 0; c1 <= W; c1++) for (let c2 = 0; c2 <= c1; c2++)
    if (can[c1][c2] && (c1 + c2 > best[0] + best[1] || (c1 + c2 === best[0] + best[1] && c1 - c2 < best[0] - best[1]))) best = [c1, c2];
  if (best.join(' ') !== expected.join(' ')) throw new Error(`A Musical Question: got ${best.join(' ')}, the sample says ${expected.join(' ')}`);

  const N = W / STEP + 1, size = 22, x = 58, y = 52, sx = x + N * size + 34, FW = sx + 96, FH = y + N * size + 14;
  const heads = range(N).map((k) => k * STEP);
  const grid = (cls) => table(N, N, (r, c) => ({ cls: cls(r * STEP, c * STEP) }),
    { x, y, size, rowHead: heads, colHead: heads.map((h) => (h % 20 ? '' : h)) })
    + text(x + N * size / 2, y - 32, 'c2: minutes on CD 2', 'v-note') + text(x - 38, y - 12, 'c1', 'v-note');
  const songs = (cur) => text(sx + 14, y - 12, 'w[i]', 'v-head')
    + w.map((v, i) => row([v], { x: sx, y: y + i * 34, size: 28, cls: () => (i === cur ? 'hl' : i < cur ? 'done' : 'dim') })).join('');
  const key = (items) => items.map(([c, label], k) => legend([[c, label]], { x: sx, y: y + 5 * 34 + 14 + k * 20 })).join('');
  const reach = (t) => (c1, c2) => (t[c1][c2] ? 'good' : 'dim');

  const frames = [frame(FW, FH, grid(reach(snaps[0])) + songs(-1) + key([['good', 'reachable']]),
    'Before any song only can[0][0] is set: both CDs empty.')];
  const after = (i) => {
    const t = snaps[i + 1], prev = snaps[i];
    const fresh = [];
    t.forEach((r, c1) => r.forEach((on, c2) => { if (on && !prev[c1][c2]) fresh.push([c1, c2]); }));
    return frame(FW, FH, grid((c1, c2) => (t[c1][c2] && !prev[c1][c2] ? 'hl' : reach(t)(c1, c2))) + songs(i) + key([['good', 'reachable'], ['hl', 'new']]),
      `After song ${i + 1}, ${w[i]} minutes: ${fresh.length} new pairs, such as (${fresh[0].join(', ')}).`);
  };
  frames.push(after(0), after(1));
  {
    const { before, now, c1, wi } = mid;
    // Row c1 is rebuilt from the old cells of row c1 − wi (the song on CD 1) and of row c1 itself (on CD 2).
    const source = (r, c) => (r === c1 - wi || r === c1) && before[r][c];
    frames.push(frame(FW, FH, grid((r, c) => (source(r, c) ? 'wait' : now[r][c] && !before[r][c] ? 'hl' : reach(now)(r, c))) + songs(2)
      + key([['good', 'reachable'], ['hl', 'new'], ['wait', 'read']]),
    `Song ${wi}, partway through its pass: rows ${W} down to ${c1} are updated, rows below ${c1} are not yet. Row ${c1} reads row ${c1 - wi} (the song on CD 1) and its own old cells, shifted ${wi} right (on CD 2).`));
  }
  frames.push(after(2), after(3), after(4));
  const total = best[0] + best[1];
  frames.push(frame(FW, FH, grid((c1, c2) => {
    if ((c1 === best[0] && c2 === best[1]) || (c1 === best[1] && c2 === best[0])) return 'hl';
    if (can[c1][c2]) return c1 + c2 === total ? 'wait' : 'good';
    return 'dim';
  }) + songs(w.length) + key([['good', 'reachable'], ['wait', `total ${total}`], ['hl', 'answer']]),
  `The largest total is ${total}. Of those pairs, (${best.join(', ')}) and (${best[1]}, ${best[0]}) differ least: print ${best.join(' ')}.`));
  return [{ title: 'Two CDs, sample 2', frames }];
};
