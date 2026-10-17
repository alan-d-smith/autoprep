// Pictures for the topological sort worked problem, Brexit Negotiations (Kattis brexitnegotiations): the
// solution's Kahn's algorithm on the reversed rules with a min-heap, run on the official sample 2, filling the
// meetings from the last one back. Sample 1 is run as a check.

import { text, row, cellX, graph } from '../draw.js';
import { frame } from '../stages/common.js';

const SAMPLES = {
  1: { input: '3\n10 0\n10 0\n10 0', output: 12 },
  2: { input: '6\n2 2 4 3\n4 1 5\n1 2 2 4\n3 1 5\n2 0\n4 1 3', output: 8 },
};

// adj[v] lists the topics that must come before v, so indeg[b] counts the unplaced topics that need b first.
// q is the min-heap of (e, v); a sorted array pops in the same order, since no two entries are equal.
function solve(sample) {
  const [[n], ...lines] = SAMPLES[sample].input.split('\n').map((l) => l.split(' ').map(Number));
  const e = [0], adj = [[]], indeg = Array(n + 1).fill(0);
  lines.forEach(([ev, , ...before]) => { e.push(ev); adj.push(before); for (const b of before) indeg[b]++; });
  const byKey = (u, v) => e[u] - e[v] || u - v;
  let q = [];
  for (let v = 1; v <= n; v++) if (indeg[v] === 0) q.push(v);
  q.sort(byKey);
  const order = Array(n).fill(null), placed = new Set(), snaps = [];
  const snap = (extra) => snaps.push({ indeg: [...indeg], q: [...q], order: [...order], placed: new Set(placed), ...extra });
  snap({});
  let ans = 0;
  for (let pos = n - 1; pos >= 0; pos--) {
    const before = [...q];
    const v = q.shift();
    ans = Math.max(ans, e[v] + pos);
    order[pos] = v;
    placed.add(v);
    const drops = [], pushed = [];
    for (const u of adj[v]) {
      indeg[u]--;
      drops.push(u);
      if (indeg[u] === 0) { q.push(u); pushed.push(u); }
    }
    q.sort(byKey);
    snap({ v, pos, before, drops, pushed, ans });
  }
  if (ans !== SAMPLES[sample].output) throw new Error(`Brexit Negotiations sample ${sample}: got ${ans}, expected ${SAMPLES[sample].output}`);
  return { n, e, adj, snaps, ans };
}

const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const labels = (values, { x, y, size, up = false }) => values.map((l, i) => text(cellX(i, { x, size }) + size / 2, up ? y - 11 : y + size + 11, l, 'v-idx')).join('');

export default () => {
  solve(1);
  const { n, e, adj, snaps, ans } = solve(2);
  const nodes = { 1: [40, 36], 6: [40, 136], 3: [150, 86], 4: [260, 36], 2: [260, 136], 5: [370, 86] };
  const below = new Set(['6', '2']);
  const edges = Object.keys(nodes).flatMap((v) => adj[v].map((b) => [v, String(b)]));
  const topics = Array.from({ length: n }, (_, k) => k + 1);
  const x = 100, size = 34, iy = 204, qy = 258, oy = 340, ly = 380, W = 460, H = 422;
  const draw = (s, final = false) => {
    const lengths = s.order.map((v, pos) => (v === null ? '' : e[v] + pos));
    const worst = final ? lengths.indexOf(s.ans) : -1;
    return graph(nodes, edges, {
      directed: true,
      nodeCls: (id) => (+id === s.v && !final ? 'current' : s.placed.has(+id) ? 'done' : s.q.includes(+id) ? 'wait' : ''),
      edgeCls: (a) => (+a === s.v && !final ? 'hl' : s.placed.has(+a) && !final ? 'dim' : ''),
    })
      + Object.entries(nodes).map(([id, [nx, ny]]) => text(nx, ny + (below.has(id) ? 27 : -26), `e ${e[id]}`, `v-note ${+id === s.v && !final ? 'hl' : ''}`)).join('')
      + text(x - 10, iy - 11, 'topic', 'v-idx', 'end') + labels(topics, { x, y: iy, size, up: true })
      + row(topics.map((v) => (s.placed.has(v) ? '' : s.indeg[v])), {
        x, y: iy, size, name: 'indeg',
        cls: (k) => (s.placed.has(k + 1) ? 'dim' : s.drops?.includes(k + 1) ? (s.indeg[k + 1] ? 'hl' : 'wait') : ''),
      })
      + row([...s.q, ...Array(n - s.q.length).fill('')], { x, y: qy, size, name: 'q', cls: (k) => (k >= s.q.length ? '' : s.pushed?.includes(s.q[k]) ? 'hl' : 'wait') })
      + labels(s.q.map((v) => `e ${e[v]}`), { x, y: qy, size })
      + text(x - 10, oy - 11, 'pos', 'v-idx', 'end') + labels(topics.map((k) => k - 1), { x, y: oy, size, up: true })
      + row(s.order.map((v) => (v === null ? '' : v)), { x, y: oy, size, name: 'order', cls: (k) => (s.order[k] === null ? '' : k === s.pos && !final ? 'hl' : 'good') })
      + row(lengths, { x, y: ly, size, name: 'e + pos', cls: (k) => (lengths[k] === '' ? '' : k === worst ? 'bad' : k === s.pos && !final ? 'hl' : '') });
  };
  const caption = (s) => {
    if (s.v === undefined) return `Arrows run from each topic to the topics it needs first. indeg counts the unplaced topics that need a topic first; ${list(s.q)} ${s.q.length > 1 ? 'have' : 'has'} 0, so q starts with ${s.q.length > 1 ? 'them' : 'it'}.`;
    const choice = s.before.length > 1 ? `q holds ${list(s.before.map((v) => `${v} (e ${e[v]})`))}; the shortest, ${s.v}, takes` : `Only ${s.v} is ready, so it takes`;
    const freed = s.pushed.length ? ` ${list(s.pushed)} ${s.pushed.length > 1 ? 'reach' : 'reaches'} indeg 0 and ${s.pushed.length > 1 ? 'join' : 'joins'} q.` : '';
    const dropped = s.drops.length ? ` Deleting its arrows lowers indeg of ${list(s.drops)}.${freed}` : '';
    return `${choice} pos ${s.pos} and lasts ${e[s.v]} + ${s.pos} = ${e[s.v] + s.pos}.${dropped}`;
  };
  const frames = snaps.map((s) => frame(W, H, draw(s), caption(s)));
  const last = snaps.at(-1);
  frames.push(frame(W, H, draw(last, true), `Order ${last.order.join(', ')}. The longest meeting lasts ${ans}, the sample's answer.`));
  return [{ title: 'Brexit Negotiations, sample 2', frames }];
};
