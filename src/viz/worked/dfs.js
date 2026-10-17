// Pictures for the DFS, components and cycles worked problem, Hoppers (Kattis hoppers): the template's
// explore run on the official samples, with the adjacency lists built in input order like the solution's.

import { text, row, cellX, table, graph, arrow, legend } from '../draw.js';
import { frame } from '../stages/common.js';

const SAMPLES = {
  1: { input: '3 2\n1 2\n2 3', output: 1 },
  2: { input: '5 10\n1 2\n2 3\n3 4\n4 5\n5 1\n1 3\n2 4\n3 5\n4 1\n5 2', output: 0 },
  3: { input: '12 13\n2 3\n3 4\n4 5\n5 2\n6 7\n7 8\n8 9\n9 10\n10 7\n9 12\n12 11\n11 6\n12 7', output: 3 },
};

const parse = (input) => {
  const [[n], ...edges] = input.split('\n').map((l) => l.split(' ').map(Number));
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  return { n, edges, adj };
};

// The template's explore, recording a snapshot after every push and every check of a labelled neighbour.
function explore({ n, adj }) {
  const comp = Array(n + 1).fill(-1), side = Array(n + 1).fill(-1), done = new Set(), tree = new Set();
  const snaps = [];
  let bipartite = true, id = 0, st = [];
  const snap = (extra) => snaps.push({ comp: [...comp], side: [...side], st: [...st], done: new Set(done), tree: new Set(tree), bipartite, id, ...extra });
  for (let s = 1; s <= n; s++) {
    if (comp[s] !== -1) continue;
    st = [s];
    comp[s] = id; side[s] = 0;
    snap({ set: [s] });
    while (st.length) {
      const u = st.pop();
      for (const v of adj[u]) {
        if (comp[v] === -1) {
          comp[v] = id; side[v] = side[u] ^ 1; st.push(v); tree.add(`${u}-${v}`);
          snap({ u, v, set: [v] });
        } else {
          if (side[v] === side[u]) bipartite = false;
          snap({ u, v, check: true });
        }
      }
      done.add(u);
    }
    id++;
    snap({ end: true });
  }
  return { comp, side, bipartite, id, snaps };
}

const solve = (sample) => {
  const g = parse(SAMPLES[sample].input);
  const run = explore(g);
  const answer = run.bipartite ? run.id : run.id - 1;
  if (answer !== SAMPLES[sample].output) throw new Error(`Hoppers sample ${sample}: got ${answer}, expected ${SAMPLES[sample].output}`);
  return { ...g, ...run };
};

const linked = (a, b) => (e) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a);

// One picture of explore: the graph, the comp and side rows, and the stack st.
function drawRun(g, s, nodes, { final = false, boxes = false, top = 240 } = {}) {
  const ids = Object.keys(nodes);
  const edges = g.edges.map(([a, b]) => [String(a), String(b)]);
  const look = s.u ? linked(s.u, s.v) : () => false;
  let out = '';
  // At the end, a labelled box around each component.
  if (final && boxes) {
    for (let k = 0; k < s.id; k++) {
      const xs = ids.filter((x) => s.comp[x] === k).map((x) => nodes[x]);
      const x1 = Math.min(...xs.map(([x]) => x)) - 22, x2 = Math.max(...xs.map(([x]) => x)) + 22;
      const y1 = Math.min(...xs.map(([, y]) => y)) - 22, y2 = Math.max(...xs.map(([, y]) => y)) + 22;
      out += `<rect class="v-bracket" x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="14"/>${text((x1 + x2) / 2, y1 - 9, `comp ${k}`, 'v-note hl')}`;
    }
  }
  out += graph(nodes, edges, {
    nodeCls: (x) => (final ? (s.side[x] === 0 ? 'comp1' : 'comp2') : +x === s.u ? 'current' : s.st.includes(+x) ? 'wait' : s.done.has(+x) ? 'done' : ''),
    edgeCls: (a, b) => {
      if (look([+a, +b])) return s.check && s.side[a] === s.side[b] ? 'bad' : 'hl';
      return !final && (s.tree.has(`${a}-${b}`) || s.tree.has(`${b}-${a}`)) ? 'good' : '';
    },
  });
  const rows = ['comp', 'side'];
  const cs = 30, tx = Math.max(70, (450 - ids.length * cs) / 2 + 20);
  out += table(rows.length, ids.length, (r, c) => {
    const x = +ids[c], v = s[rows[r]][x];
    return v === -1 ? { v: '−1', cls: 'dim' } : { v, cls: s.set?.includes(x) ? 'hl' : '' };
  }, { x: tx, y: top, size: cs, rowHead: rows, colHead: ids });
  if (final) return out + legend([['hl', 'side 0'], ['good', 'side 1']], { x: tx, y: top + 2 * cs + 22 });
  const sy = top + 2 * cs + 26, depth = Math.max(...g.snaps.map((x) => x.st.length));
  out += row([...Array(depth).keys()].map((i) => s.st[i] ?? ''), { x: tx, y: sy, size: cs, name: 'st', cls: (i) => (i < s.st.length ? 'wait' : '') });
  if (s.st.length) out += text(cellX(s.st.length - 1, { x: tx, size: cs }) + cs / 2, sy - 9, 'top', 'v-note wait');
  return out;
}

export default () => {
  const frames = [];

  // Sample 1: a hopper on 1 jumps over 2 to 3, and from 3 back to 1; 2 is never infected.
  const one = solve(1);
  const infected = new Set([1]);
  for (const queue = [1]; queue.length;) {
    const u = queue.pop();
    for (const v of one.adj[u]) for (const w of one.adj[v]) if (!infected.has(w)) { infected.add(w); queue.push(w); }
  }
  const hit = [...infected].sort((a, b) => a - b);
  const sameSide = [1, 2, 3].filter((x) => one.side[x] === one.side[1]);
  if (hit.join() !== sameSide.join()) throw new Error('Hoppers sample 1: the infected hosts should be host 1\'s side');
  const pathNodes = { 1: [130, 92], 2: [225, 92], 3: [320, 92] };
  const pathEdges = one.edges.map(([a, b]) => [String(a), String(b)]);
  frames.push(frame(450, 150,
    arrow(138, 74, 312, 74, 'good', 0.9) + text(225, 22, 'hop', 'v-note good')
    + graph(pathNodes, pathEdges, { nodeCls: (x) => (+x === 1 ? 'current' : infected.has(+x) ? 'done' : '') })
    + text(225, 132, `infected from 1: {${hit.join(', ')}}`, 'v-note'),
    `Sample 1: a hopper on host 1 hops over 2 to 3. The infected hosts are {${hit.join(', ')}}; host 2 is never infected.`));
  const endOne = one.snaps.at(-1);
  frames.push(frame(450, 240, drawRun(one, endOne, pathNodes, { final: true, top: 140 })
    + text(225, 30, `side ${one.side[1]} = {${sameSide.join(', ')}}: the hosts a hopper on 1 infects`, 'v-note'),
    `Sample 1 after explore: ${[1, 2, 3].map((x) => `side[${x}] = ${one.side[x]}`).join(', ')}, all in component ${one.comp[1]}.`));

  // Sample 3: three components, all bipartite.
  const three = solve(3);
  const nodes3 = {
    1: [40, 118], 2: [100, 64], 3: [170, 64], 4: [170, 172], 5: [100, 172],
    6: [240, 186], 7: [280, 118], 8: [350, 56], 9: [418, 118], 10: [350, 118], 11: [310, 202], 12: [370, 182],
  };
  const check = three.snaps.find((s) => s.check && s.u === 12 && s.v === 7);
  if (!check || check.side[12] === check.side[7]) throw new Error('Hoppers sample 3: expected the check of 7 from 12 to cross sides');
  frames.push(frame(450, 370, drawRun(three, check, nodes3),
    `Sample 3, component 2: popping 12 (side ${check.side[12]}) finds 7 already labelled with side ${check.side[7]}, so the link 12–7 crosses sides.`));
  const end3 = three.snaps.at(-1);
  frames.push(frame(450, 344, drawRun(three, end3, nodes3, { final: true, boxes: true }),
    `Sample 3 at the end: id = ${three.id} components and bipartite = ${three.bipartite}, so the answer is id = ${three.id}.`));

  // Sample 2: every pair linked; the first link inside one side.
  const two = solve(2);
  const nodes2 = Object.fromEntries([1, 2, 3, 4, 5].map((k, i) => [k, [225 + 92 * Math.sin((i * 2 * Math.PI) / 5), 112 - 92 * Math.cos((i * 2 * Math.PI) / 5)]]));
  const clash = two.snaps.find((s) => s.check && s.side[s.u] === s.side[s.v]);
  if (!clash) throw new Error('Hoppers sample 2: expected a link inside one side');
  frames.push(frame(450, 356, drawRun(two, clash, nodes2, { top: 236 }),
    `Sample 2: popping ${clash.u} (side ${clash.side[clash.u]}) finds ${clash.v} with the same side, so bipartite becomes false and the answer is id − 1 = ${two.id - 1}.`));

  return [{ title: 'Hoppers: explore on the samples', frames }];
};
