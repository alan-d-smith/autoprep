// Step-through diagrams: DFS, BFS, rooted trees, DSU and Kruskal.
// Each one records a snapshot after every elementary step of the real algorithm, then draws it.

import { text, row, cellX, span, table, graph } from '../draw.js';
import { frame, range } from './common.js';

// Names under the cells of a row (vertices, edges) where row()'s numeric indices would mislead.
function under(labels, { x = 0, y = 0, size = 34, gap = 4 } = {}) {
  return labels.map((l, i) => text(cellX(i, { x, size, gap }) + size / 2, y + size + 11, l, 'v-idx')).join('');
}

// A note beside each node, above it unless an edge is in the way, else wherever there's most room.
function notesBeside(nodes, edges, value, r = 15) {
  const turn = 2 * Math.PI;
  const apart = (a, b) => { const d = Math.abs(a - b) % turn; return Math.min(d, turn - d); };
  return Object.entries(nodes).map(([id, [x, y]]) => {
    const v = value(id);
    if (v === '' || v == null) return '';
    const out = edges.filter(([a, b]) => a === id || b === id).map(([a, b]) => { const [ox, oy] = nodes[a === id ? b : a]; return Math.atan2(oy - y, ox - x); });
    const room = (t) => (out.length ? Math.min(...out.map((a) => apart(a, t))) : Math.PI);
    const options = [-90, -45, -135, 0, 180, 45, 135, 90].map((d) => (d * Math.PI) / 180);
    const t = options.find((o) => room(o) >= Math.PI / 3) ?? options.reduce((best, o) => (room(o) > room(best) ? o : best));
    return text(x + Math.cos(t) * (r + 10), y + Math.sin(t) * (r + 10), v, 'v-note');
  }).join('');
}

const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

function dfs() {
  const nodes = { 1: [60, 60], 2: [150, 40], 3: [70, 150], 4: [160, 130], 5: [240, 170], 6: [300, 60], 7: [380, 40], 8: [400, 120], 9: [320, 170] };
  const edges = [[1, 2], [1, 3], [2, 4], [3, 4], [4, 5], [6, 7], [7, 8]].map(([a, b]) => [String(a), String(b)]);
  const ids = Object.keys(nodes);
  const adj = Object.fromEntries(ids.map((id) => [id, []]));
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
  for (const id of ids) adj[id].sort((p, q) => p - q);
  const key = (a, b) => (+a < +b ? `${a}-${b}` : `${b}-${a}`);

  const order = {}, comp = {}, stack = [], finished = new Set(), tree = new Set(), back = new Set();
  const snaps = [];
  const snap = (caption, look = null) => snaps.push({ caption, look, order: { ...order }, stack: [...stack], finished: new Set(finished), tree: new Set(tree), back: new Set(back) });
  let t = 0, c = 0;
  snap('DFS tries neighbours in increasing order. Blue is being explored, amber waits on the recursion stack, green is finished; numbers are visit order.');
  const visit = (u, p) => {
    for (const v of adj[u]) {
      if (v === p) {
        snap(`Edge ${u}–${v} leads back to ${u}'s parent: skip it.`, key(u, v));
      } else if (order[v] && finished.has(v)) {
        snap(`Edge ${u}–${v}: ${v} is finished and below ${u} in the tree. It's the back edge ${v}–${u} again, seen from the top.`, key(u, v));
      } else if (order[v]) {
        back.add(key(u, v));
        snap(`Edge ${u}–${v}: ${v} is visited, still on the stack and not ${u}'s parent. That's a back edge, so the graph has a cycle.`);
      } else {
        tree.add(key(u, v));
        order[v] = ++t;
        comp[v] = c;
        stack.push(v);
        snap(`Edge ${u}–${v}: ${v} is unvisited, so it's a tree edge. Recurse: push ${v}, visit number ${t}.`);
        visit(v, u);
      }
    }
    finished.add(u);
    stack.pop();
    const members = ids.filter((id) => comp[id] === c);
    snap(stack.length
      ? `${u} has no edges left to try: it's finished. Pop it and return to ${stack.at(-1)}.`
      : `${u} is finished and the stack is empty: component ${c} is {${members.join(', ')}}.`);
  };
  for (const s of ids) {
    if (order[s]) continue;
    c++;
    order[s] = ++t;
    comp[s] = c;
    stack.push(s);
    snap(`${s} is unvisited: start a new DFS, component ${c}. Push ${s}, visit number ${t}.`);
    visit(s, null);
  }

  const depth = Math.max(...snaps.map((s) => s.stack.length));
  const W = 450, H = 256, sx = 70, sy = 214, size = 32;
  const draw = (s, final) => {
    const top = s.stack.at(-1);
    let out = graph(nodes, edges, {
      nodeCls: (id) => (final ? `comp${comp[id]}` : id === top ? 'current' : s.stack.includes(id) ? 'wait' : s.finished.has(id) ? 'done' : ''),
      edgeCls: (a, b) => { const k = key(a, b); return k === s.look ? 'hl' : s.back.has(k) ? 'bad' : s.tree.has(k) ? 'good' : ''; },
    }) + notesBeside(nodes, edges, (id) => s.order[id]);
    out += row(range(depth).map((i) => s.stack[i] ?? ''), { x: sx, y: sy, size, name: 'stack', cls: (i) => (i === s.stack.length - 1 ? 'hl' : i < s.stack.length ? 'wait' : '') });
    if (s.stack.length) out += text(cellX(s.stack.length - 1, { x: sx, size }) + size / 2, sy - 9, 'top', 'v-note hl');
    return out;
  };
  const frames = snaps.map((s) => frame(W, H, draw(s), s.caption));
  const groups = range(c).map((k) => `{${ids.filter((id) => comp[id] === k + 1).join(', ')}}`);
  frames.push(frame(W, H, draw(snaps.at(-1), true),
    `${c} components: ${list(groups)}. Every vertex is pushed once and every edge tried from both ends: O(n + m).`));
  return [{ title: 'Depth-first search', frames }];
}

function bfs() {
  const grid = ['..#....', '..#.##.', '.....#.', '.###.#.', '.......'];
  const R = grid.length, C = grid[0].length;
  const S = '0,0', T = '0,6';
  const dist = grid.map((r) => [...r].map(() => -1));
  const prev = {};
  dist[0][0] = 0;
  const queue = [S], done = new Set();
  const snaps = [];
  const snap = (caption, cur = null, fresh = []) => snaps.push({ caption, cur, fresh, queue: [...queue], done: new Set(done), dist: dist.map((r) => [...r]) });
  snap('BFS from S; cells are (row,column). A cell gets its distance the moment it is first reached, then waits in the queue (amber) to be expanded.');
  for (let found = false; queue.length && !found;) {
    const cur = queue.shift();
    const [r, c] = cur.split(',').map(Number);
    const fresh = [];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= C || grid[nr][nc] === '#' || dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      prev[`${nr},${nc}`] = cur;
      queue.push(`${nr},${nc}`);
      fresh.push(`${nr},${nc}`);
    }
    found = fresh.includes(T);
    const d = dist[r][c];
    snap(`Dequeue (${cur}) at distance ${d}. ${fresh.length
      ? `Enqueue ${list(fresh.map((k) => `(${k})`))} at distance ${d + 1}.`
      : 'Its neighbours are walls, off the grid or already reached: nothing to add.'}${found ? ' That reaches T, and in BFS its distance is already final: stop.' : ''}`, cur, fresh);
    done.add(cur);
  }
  const path = new Set();
  for (let k = T; k; k = prev[k]) path.add(k);

  const x = 50, y = 34, size = 34, qx = 64, qy = 236;
  const longest = Math.max(...snaps.map((s) => s.queue.length));
  const W = Math.max(330, qx + longest * 38 + 6), H = 290;
  const draw = (s, final) => {
    let out = table(R, C, (r, c) => {
      if (grid[r][c] === '#') return { cls: 'wall' };
      const k = `${r},${c}`, d = s.dist[r][c];
      const v = k === S ? 'S' : k === T ? 'T' : d >= 0 ? d : '';
      if (final) return { v: path.has(k) ? v : '', cls: path.has(k) ? 'good' : 'dim' };
      return { v, cls: k === s.cur ? 'hl' : s.queue.includes(k) ? 'wait' : s.done.has(k) ? 'done' : '' };
    }, { x, y, size, rowHead: range(R), colHead: range(C) });
    out += row(s.queue, { x: qx, y: qy, size, name: 'queue', cls: () => (final ? 'dim' : 'wait') });
    if (s.queue.length) out += text(qx + size / 2, qy + size + 11, 'front', 'v-idx');
    if (final) return out;
    const first = s.queue.indexOf(s.fresh[0]);
    if (s.fresh.length) out += span(first, first + s.fresh.length - 1, 'new', { x: qx, y: qy - 4, size, up: true, cls: 'wait' });
    return out;
  };
  const frames = snaps.map((s) => frame(W, H, draw(s), s.caption));
  const [tr, tc] = T.split(',').map(Number);
  frames.push(frame(W, H, draw(snaps.at(-1), true), `T is ${dist[tr][tc]} steps from S. Following each cell's parent back from T gives a shortest path (green). Cells left in the queue never needed expanding.`));
  return [{ title: 'Breadth-first search on a grid', frames }];
}

function trees() {
  const parent = { 2: 1, 3: 1, 4: 2, 5: 2, 6: 3, 7: 5, 8: 5 };
  const nodes = { 1: [200, 26], 2: [120, 76], 3: [290, 76], 4: [70, 126], 5: [170, 126], 6: [290, 126], 7: [130, 176], 8: [210, 176] };
  const ids = Object.keys(nodes);
  const edges = Object.entries(parent).map(([c, p]) => [String(p), c]);
  const kids = {};
  for (const [c, p] of Object.entries(parent)) (kids[p] ||= []).push(c);
  const root = ids.find((id) => !(id in parent));

  const depth = {}, tin = {}, size = {}, order = [], stack = [], finished = new Set();
  const snaps = [];
  const snap = (caption, extra = {}) => snaps.push({ caption, depth: { ...depth }, tin: { ...tin }, size: { ...size }, order: [...order], stack: [...stack], finished: new Set(finished), hl: [], wait: [], ...extra });
  snap(`Root the tree at ${root}. One DFS fills depth and tin (the slot in order) on the way down, and size on the way back up.`);
  const go = (u) => {
    const p = parent[u];
    depth[u] = p ? depth[p] + 1 : 0;
    tin[u] = order.length;
    order.push(u);
    stack.push(u);
    snap(p
      ? `Enter ${u} from ${p}: depth[${u}] = depth[${p}] + 1 = ${depth[u]}, and tin[${u}] = ${tin[u]}: ${u} takes order[${tin[u]}].`
      : `Enter the root ${u}: depth[${u}] = 0, and tin[${u}] = 0: it takes order[0].`,
    { focus: u, edge: p ? `${p}-${u}` : null, hl: [`depth:${u}`, `tin:${u}`], wait: p ? [`depth:${p}`] : [], slot: tin[u] });
    const ch = kids[u] || [];
    for (const v of ch) go(v);
    size[u] = 1 + ch.reduce((sum, v) => sum + size[v], 0);
    finished.add(u);
    snap(ch.length
      ? `All of ${u}'s children are finished: size[${u}] = 1 + ${ch.map((v) => `size[${v}]`).join(' + ')} = 1 + ${ch.map((v) => size[v]).join(' + ')} = ${size[u]}.`
      : `${u} is a leaf: size[${u}] = 1. Finished, so return to ${p}.`,
    { focus: u, hl: [`size:${u}`], wait: ch.map((v) => `size:${v}`) });
    stack.pop();
  };
  go(root);
  const after = snaps.at(-1);
  const blocks = ids.filter((id) => id !== root && size[id] > 1).sort((a, b) => tin[a] - tin[b]).slice(0, 2);
  const inSub = (v, id) => tin[id] >= tin[v] && tin[id] < tin[v] + size[v];
  blocks.forEach((v, i) => {
    const a = tin[v], b = tin[v] + size[v] - 1;
    const members = order.slice(a, b + 1);
    snaps.push({ ...after, block: v, hl: [`tin:${v}`, `size:${v}`], wait: [], caption: i === 0
      ? `${v}'s subtree {${members.join(', ')}} is order[${a}..${b}]: it starts at tin[${v}] = ${a} and has size[${v}] = ${size[v]}. DFS finishes a subtree before leaving it.`
      : `Subtrees nest as blocks: ${v}'s is order[${a}..${b}]. So a query on the subtree of v is a range query on order[tin[v] .. tin[v] + size[v] − 1].` });
  });

  const tx = 110, ty = 228, cs = 30, oy = 352;
  const W = 410, H = 402;
  const draw = (s) => {
    const sub = s.block ? (id) => inSub(s.block, id) : null;
    let out = graph(nodes, edges, {
      nodeCls: (id) => (sub ? (sub(id) ? 'current' : 'dim') : id === s.focus ? 'current' : s.stack.includes(id) ? 'wait' : s.finished.has(id) ? 'done' : ''),
      edgeCls: (a, b) => (sub ? (sub(a) && sub(b) ? 'hl' : 'dim') : `${a}-${b}` === s.edge ? 'hl' : b in s.tin ? 'good' : ''),
    });
    const rows = ['depth', 'tin', 'size'];
    out += table(rows.length, ids.length, (r, c) => {
      const name = rows[r], id = ids[c];
      const v = s[name][id];
      const k = `${name}:${id}`;
      return { v: v ?? '', cls: s.hl.includes(k) ? 'hl' : s.wait.includes(k) ? 'wait' : '' };
    }, { x: tx, y: ty, size: cs, rowHead: rows, colHead: ids });
    out += row(range(ids.length).map((i) => s.order[i] ?? ''), {
      x: tx, y: oy, size: cs, name: 'order', index: true,
      cls: (i) => (s.block ? (i >= tin[s.block] && i < tin[s.block] + size[s.block] ? 'hl' : 'dim') : i === s.slot ? 'hl' : ''),
    });
    if (s.block) out += span(tin[s.block], tin[s.block] + size[s.block] - 1, `order[${tin[s.block]}..${tin[s.block] + size[s.block] - 1}]`, { x: tx, y: oy - 4, size: cs, up: true });
    return out;
  };
  return [{ title: 'Rooted tree: depth, subtree size, DFS order', frames: snaps.map((s) => frame(W, H, draw(s), s.caption)) }];
}

function dsuMst() {
  const nodes = { A: [60, 60], B: [200, 40], C: [110, 160], D: [330, 70], E: [250, 170], F: [400, 170] };
  const edges = [['A', 'B', 6], ['A', 'C', 2], ['B', 'C', 7], ['B', 'D', 10], ['C', 'E', 3], ['D', 'E', 4], ['E', 'F', 5], ['D', 'F', 1]];
  const ids = Object.keys(nodes);
  const sorted = [...edges].sort((a, b) => a[2] - b[2]);
  const p = Object.fromEntries(ids.map((k) => [k, k]));
  const setSize = Object.fromEntries(ids.map((k) => [k, 1]));
  const status = sorted.map(() => '');
  const rootOf = (v) => (p[v] === v ? v : rootOf(p[v]));
  const members = (r) => ids.filter((id) => rootOf(id) === r);
  const sets = () => [...new Set(ids.map(rootOf))].map((r) => `{${members(r).join(', ')}}`).join(' ');
  const snaps = [];
  const snap = (caption, extra = {}) => snaps.push({ caption, p: { ...p }, status: [...status], sets: sets(), roots: [], wait: [], ...extra });

  // find with path compression; reports the walk so the frame can show it.
  const find = (v) => {
    const path = [v];
    while (p[path.at(-1)] !== path.at(-1)) path.push(p[path.at(-1)]);
    const root = path.at(-1);
    const moved = path.slice(0, -2);
    for (const x of path) p[x] = root;
    const walk = path.length === 1 ? `parent[${v}] = ${v}, so ${v} is a root` : `${path.join(' → ')}, so the root is ${root}`;
    return { root, path, moved, text: `find(${v}): ${walk}.${moved.length ? ` Path compression points ${list(moved)} straight at ${root}.` : ''}` };
  };

  snap('Kruskal tries edges from lightest to heaviest (the sorted row) and keeps one only if its ends are in different sets. Each vertex starts as its own parent.');
  const taken = [];
  let next = 0;
  for (; next < sorted.length && taken.length < ids.length - 1; next++) {
    const [a, b, w] = sorted[next];
    status[next] = 'hl';
    const fa = find(a);
    snap(`Edge ${a}–${b} (${w}). ${fa.text}`, { roots: [fa.root], wait: fa.path, changed: fa.moved });
    const fb = find(b);
    snap(fb.text, { roots: [fa.root, fb.root], wait: [...fa.path, ...fb.path], changed: fb.moved });
    if (fa.root === fb.root) {
      status[next] = 'bad';
      snap(`Both roots are ${fa.root}: ${a} and ${b} are already connected, so ${a}–${b} would close a cycle. Skip it.`, { roots: [fa.root], wait: [a, b] });
      continue;
    }
    const [big, small] = setSize[fa.root] >= setSize[fb.root] ? [fa.root, fb.root] : [fb.root, fa.root];
    const why = setSize[big] === setSize[small] ? 'Equal sizes, so' : `${big}'s set is bigger (${setSize[big]} vs ${setSize[small]}), so`;
    p[small] = big;
    setSize[big] += setSize[small];
    status[next] = 'good';
    taken.push(w);
    snap(`Roots ${fa.root} and ${fb.root} differ: take ${a}–${b}. ${why} parent[${small}] = ${big}, giving {${members(big).join(', ')}}.`, { changed: [small], merged: members(big) });
  }
  const rest = sorted.slice(next).map(([a, b, w]) => `${a}–${b} (${w})`);
  snap(`${taken.length} edges = n − 1, so stop${rest.length ? `: ${list(rest)} ${rest.length > 1 ? 'are' : 'is'} never examined` : ''}. MST weight ${taken.join(' + ')} = ${taken.reduce((s, w) => s + w, 0)}.`, { final: true });

  const x = 80, size = 32, ey = 206, py = 270;
  const W = 460, H = 350;
  const draw = (s) => graph(nodes, edges, {
    nodeCls: (id) => (s.final ? 'done' : s.roots.includes(id) ? 'current' : s.wait.includes(id) ? 'wait' : s.merged?.includes(id) ? 'done' : ''),
    edgeCls: (a, b) => {
      const st = s.status[sorted.findIndex(([u, v]) => u === a && v === b)];
      return s.final && st !== 'good' ? 'dim' : st;
    },
  })
    + row(sorted.map(([, , w]) => w), { x, y: ey, size, name: 'sorted', cls: (i) => (s.final && !s.status[i] ? 'dim' : s.status[i]) })
    + under(sorted.map(([a, b]) => a + b), { x, y: ey, size })
    + row(ids.map((id) => s.p[id]), { x, y: py, size, name: 'parent', cls: (i) => (s.changed?.includes(ids[i]) ? 'good' : s.roots.includes(ids[i]) ? 'hl' : s.wait.includes(ids[i]) ? 'wait' : '') })
    + under(ids, { x, y: py, size })
    + text(x - 10, 338, 'sets', 'v-name', 'end') + text(x, 338, s.sets, 'v-note', 'start');
  return [{ title: 'DSU and Kruskal', frames: snaps.map((s) => frame(W, H, draw(s), s.caption)) }];
}

export default {
  dfs,
  bfs,
  trees,
  'dsu-mst': dsuMst,
};
