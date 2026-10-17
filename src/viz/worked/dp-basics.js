// Pictures for the DP: states and transitions worked problem, made by running its solution on the official sample.
// Kattis Everything Is A Nail, Sample Input 2: tasks 0 1 2 0 1 2 0 1 2 0; the answer is 5.

import { text, row, table } from '../draw.js';
import { frame, range } from '../stages/common.js';

const SAMPLE = { tasks: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0], answer: 5 };
const TOOL = ['hammer', 'screwdriver', 'wrench']; // tool k does task type k: 0 nail, 1 screw, 2 bolt

// The solution for one order of tools: dp[s] = most tasks done while holding order[s], after s drops.
// Returns every column, dp after 0, 1, …, n tasks.
function run(tasks, order) {
  let dp = [0, 0, 0];
  const cols = [dp];
  for (const x of tasks) {
    dp = [...dp];
    for (let s = 1; s < 3; s++) dp[s] = Math.max(dp[s], dp[s - 1]);
    for (let s = 0; s < 3; s++) dp[s] += x === order[s] ? 1 : 0;
    cols.push(dp);
  }
  return cols;
}

const ORDERS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];

export default () => {
  const { tasks } = SAMPLE;
  const n = tasks.length;
  const results = ORDERS.map((order) => ({ order, cols: run(tasks, order) }));
  const bestOf = (r) => Math.max(...r.cols[n]);
  const best = Math.max(...results.map(bestOf));
  if (best !== SAMPLE.answer) throw new Error(`Everything Is A Nail sample 2: the solution gives ${best}, the sample output is ${SAMPLE.answer}`);
  const { order, cols } = results[0]; // hammer, then screwdriver, then wrench
  if (bestOf(results[0]) !== best) throw new Error('the pictured order should reach the best total');

  const W = 444, size = 28, x = 128, yt = 34, ty = 108;
  const legend = text(x - 118, 14, 'task types: 0 nail, 1 screw, 2 bolt', 'v-note', 'start');
  const taskRow = (cls = () => '') => row(tasks, { x: x + size + 1, y: yt, size: size - 2, gap: 2, name: 'task', cls });
  const heads = order.map((tool, s) => `s=${s} ${TOOL[tool]}`);
  const grid = (known, cls) => table(3, n + 1, (s, i) => ({ v: known(i) ? cols[i][s] : '', cls: cls(s, i) }), { x, y: ty, size, rowHead: heads, colHead: range(n + 1) })
    + text(x - 10, ty - 12, 'i', 'v-head', 'end');
  const lines = (list, y = ty + 3 * size + 24) => list.map(([str, cls], k) => text(x - 118, y + k * 20, str, `v-note ${cls || ''}`, 'start')).join('');
  const H = 250;

  const frames = [];
  frames.push(frame(W, 70, legend + taskRow(), `Sample 2: ${n} tasks, ${tasks.join(' ')}. The most that can be done is ${best}.`));
  frames.push(frame(W, H, legend + taskRow(() => 'dim') + grid((i) => i === 0, (s, i) => (i === 0 ? 'done' : ''))
    + lines([[`order: ${order.map((t) => TOOL[t]).join(', then ')}`], ['before any task, every state is 0']]),
  `Order ${order.map((t) => TOOL[t]).join(', ')}. dp[s] after i tasks, holding tool s of the order. Before any task all three are 0, since tools can be dropped before task 1.`));

  // Task 4 in detail: drops first (s from 1 up), then the tool that fits gains one.
  const k = 4, x4 = tasks[k - 1], prev = cols[k - 1];
  const dropped = [prev[0], Math.max(prev[1], prev[0])];
  dropped.push(Math.max(prev[2], dropped[1]));
  const fit = order.indexOf(x4);
  frames.push(frame(W, H + 20, legend + taskRow((j) => (j === k - 1 ? 'hl' : j < k - 1 ? '' : 'dim'))
    + grid((i) => i <= k, (s, i) => (i === k ? (s === fit ? 'good' : 'hl') : i === k - 1 ? 'wait' : i < k ? 'done' : ''))
    + lines([
      [`task ${k} is a ${['nail', 'screw', 'bolt'][x4]}`],
      [`drops: dp[1] = max(${prev[1]}, ${prev[0]}) = ${dropped[1]}, dp[2] = max(${prev[2]}, ${dropped[1]}) = ${dropped[2]}`],
      [`the ${TOOL[x4]} fits: dp[${fit}] = ${dropped[fit]} + 1 = ${cols[k][fit]}`, 'good'],
    ]),
  `Task ${k}, partway through: a drop can only move down a row, then the ${TOOL[x4]}'s row gains 1. Column ${k} is ${cols[k].join(', ')}.`));

  frames.push(frame(W, H, legend + taskRow() + grid(() => true, (s, i) => (i === n ? (cols[n][s] === best ? 'good' : 'hl') : 'done'))
    + lines([[`after all ${n} tasks: ${cols[n].join(', ')}; the best is ${best}`, 'good']]),
  `The full table for this order. The last column is ${cols[n].join(', ')}, so this order completes at most ${best} tasks.`));

  // Walk back from the best cell: a task that fits the state's tool was done, and the value before
  // it sits in the same row or a row above (a drop).
  const path = new Set(), done = new Set();
  let s = cols[n].indexOf(best);
  path.add(`${s},${n}`);
  for (let i = n; i > 0; i--) {
    const did = tasks[i - 1] === order[s];
    if (did) done.add(i - 1);
    const before = cols[i][s] - (did ? 1 : 0);
    while (cols[i - 1][s] !== before) s--;
    path.add(`${s},${i - 1}`);
  }
  const phases = order.map((tool, ph) => {
    const at = [...done].filter((j) => tasks[j] === tool).map((j) => j + 1).sort((a, b) => a - b);
    return at.length ? `${TOOL[tool]}: task${at.length > 1 ? 's' : ''} ${at.join(', ')}` : '';
  }).filter(Boolean);
  frames.push(frame(W, H, legend + taskRow((j) => (done.has(j) ? 'good' : 'dim'))
    + grid(() => true, (r, i) => (path.has(`${r},${i}`) ? (i > 0 && done.has(i - 1) && tasks[i - 1] === order[r] ? 'good' : 'done') : 'dim'))
    + lines([[phases.slice(0, 2).join('; '), 'good'], [`${phases.slice(2).join('; ')}: ${done.size} tasks done`, 'good']]),
  `One best plan, read back from the corner: ${phases.join('; ')}. The green tasks are done; the rest are skipped.`));

  // Every order.
  const ox = 70, oy = 62, cell = 50;
  frames.push(frame(W, 150,
    table(1, ORDERS.length, (r, c) => ({ v: bestOf(results[c]), cls: bestOf(results[c]) === best ? 'good' : '' }), { x: ox, y: oy, size: cell, colHead: ORDERS.map((o) => o.map((t) => TOOL[t][0].toUpperCase()).join(' ')), rowHead: ['best'] })
    + text(ox + (ORDERS.length * cell) / 2, oy - 38, 'order of the tools: H hammer, S screwdriver, W wrench', 'v-head')
    + text(ox + (ORDERS.length * cell) / 2, oy + cell + 26, `answer: the largest, ${best}`, 'v-note good'),
  `All ${ORDERS.length} orders: the best totals are ${results.map(bestOf).join(', ')}. The answer is the largest, ${best}.`));
  return [{ title: 'Everything Is A Nail, sample 2', frames }];
};
