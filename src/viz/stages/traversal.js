// Step-through diagrams: DFS, BFS, rooted trees, DSU and Kruskal.
// Each one records a snapshot after every elementary step of the real algorithm, then draws it.

import { text, row, cellX, span, table, graph } from '../draw.js';
import { frame, range } from './common.js';

// Names under the cells of a row (vertices, edges) where row()'s numeric indices would mislead.
function under(labels, { x = 0, y = 0, size = 34, gap = 4 } = {}) {
  return labels.map((l, i) => text(cellX(i, { x, size, gap }) + size / 2, y + size + 11, l, 'v-idx')).join('');
}

const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

// The stage template's `explore`, step by step: label a vertex when it is pushed, then pop u and
// scan all of adj[u], labelling (and pushing) every unlabelled neighbour.
function dfs() {
  const nodes = { 1: [60, 60], 2: [150, 40], 3: [70, 150], 4: [160, 130], 5: [240, 170], 6: [300, 60], 7: [380, 40], 8: [400, 120], 9: [420, 180] };
  const edges = [[1, 2], [1, 3], [2, 4], [3, 4], [4, 5], [6, 7], [7, 8]].map(([a, b]) => [String(a), String(b)]);
  const ids = Object.keys(nodes);
  const adj = Object.fromEntries(ids.map((id) => [id, []]));
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
  for (const id of ids) adj[id].sort((p, q) => p - q);
  const key = (a, b) => (+a < +b ? `${a}-${b}` : `${b}-${a}`);

  const comp = {}, side = {}, par = {}, st = [], done = new Set(), tree = new Set(), cycle = new Set();
  const snaps = [];
  const snap = (caption, { u = null, look = null, set = [] } = {}) => snaps.push({ caption, u, look, set, comp: { ...comp }, side: { ...side }, st: [...st], done: new Set(done), tree: new Set(tree), cycle: new Set(cycle) });
  snap('This runs the template\'s explore. Blue is the vertex just popped, amber is in st (labelled, neighbours not scanned yet), green is done. A green edge labelled a vertex; a red dashed one closes a cycle.');
  let id = 0, from = 0;
  ids.forEach((s, i) => {
    if (s in comp) return;
    const skipped = ids.slice(from, i);
    from = i + 1;
    comp[s] = id; side[s] = 0; par[s] = null; st.push(s);
    snap(`s = ${s}: ${skipped.length ? `${list(skipped)} ${skipped.length > 1 ? 'are' : 'is'} labelled already, but ` : ''}comp[${s}] = −1, so start component ${id}: comp[${s}] = ${id}, side[${s}] = 0, push ${s}.`, { set: [s] });
    while (st.length) {
      const u = st.pop();
      if (!adj[u].length) snap(`Pop ${u}: adj[${u}] is empty, so there is nothing to scan.`, { u });
      adj[u].forEach((v, j) => {
        const lead = j === 0 ? `Pop ${u} and scan adj[${u}] = [${adj[u].join(', ')}]. ` : '';
        const k = key(u, v);
        if (!(v in comp)) {
          comp[v] = id; side[v] = side[u] ^ 1; par[v] = u; st.push(v); tree.add(k);
          snap(`${lead}${v} is unlabelled: comp[${v}] = ${id}, side[${v}] = side[${u}] ^ 1 = ${side[v]}, push ${v}.`, { u, look: k, set: [v] });
        } else if (v === par[u]) {
          snap(`${lead}${v} is labelled, but it is ${u}'s parent, the vertex that labelled ${u}: no cycle here.`, { u, look: k });
        } else {
          const again = cycle.has(k);
          cycle.add(k);
          // The cycle: up the labelling tree from u to the first vertex shared with v's way up, then down to v.
          const up = (x) => (x === null ? [] : [x, ...up(par[x])]);
          const fromV = up(v), fromU = up(u);
          const meet = fromU.find((x) => fromV.includes(x));
          const ring = [...fromU.slice(0, fromU.indexOf(meet) + 1), ...fromV.slice(0, fromV.indexOf(meet)).reverse(), u];
          const sides = side[v] === side[u] ? `Both ends have side ${side[u]}, so bipartite becomes false.` : `Its ends have sides ${side[u]} and ${side[v]}, so bipartite stays true.`;
          snap(`${lead}${v} is labelled and is not ${u}'s parent, so edge ${u}–${v} closes a cycle${again ? ` (the same edge, now seen from ${u})` : `, ${ring.join('–')}`}. ${sides}`, { u, look: k });
        }
      });
      done.add(u);
    }
    const members = ids.filter((x) => comp[x] === id);
    id++;
    snap(`st is empty: component ${id - 1} is {${members.join(', ')}}, and id goes up to ${id}.`);
  });

  const W = 450, H = 356, tx = 110, ty = 232, cs = 30, sx = 110, sy = 312;
  const depth = Math.max(...snaps.map((s) => s.st.length));
  // A labelled box around each component, for the final picture.
  const boxes = () => range(id).map((k) => {
    const xs = ids.filter((x) => comp[x] === k).map((x) => nodes[x]);
    const x1 = Math.min(...xs.map(([x]) => x)) - 20, x2 = Math.max(...xs.map(([x]) => x)) + 20;
    const y1 = Math.min(...xs.map(([, y]) => y)) - 20, y2 = Math.max(...xs.map(([, y]) => y)) + 20;
    return `<rect class="v-bracket" x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" rx="14"/>${text((x1 + x2) / 2, y1 - 8, `comp ${k}`, 'v-note hl')}`;
  }).join('');
  const draw = (s, final) => {
    let out = final ? boxes() : '';
    out += graph(nodes, edges, {
      nodeCls: (x) => (final ? 'done' : x === s.u ? 'current' : s.st.includes(x) ? 'wait' : s.done.has(x) ? 'done' : ''),
      edgeCls: (a, b) => { if (final) return ''; const k = key(a, b); return s.cycle.has(k) ? 'bad' : k === s.look ? 'hl' : s.tree.has(k) ? 'good' : ''; },
    });
    const rows = ['comp', 'side'];
    out += table(rows.length, ids.length, (r, c) => {
      const v = s[rows[r]][ids[c]];
      return v === undefined ? { v: '−1', cls: 'dim' } : { v, cls: s.set.includes(ids[c]) ? 'hl' : '' };
    }, { x: tx, y: ty, size: cs, rowHead: rows, colHead: ids });
    out += row(range(depth).map((i) => s.st[i] ?? ''), { x: sx, y: sy, size: cs, name: 'st', cls: (i) => (i < s.st.length ? 'wait' : '') });
    if (s.st.length) out += text(cellX(s.st.length - 1, { x: sx, size: cs }) + cs / 2, sy - 9, 'top', 'v-note wait');
    return out;
  };
  const frames = snaps.map((s) => frame(W, H, draw(s), s.caption));
  const groups = range(id).map((k) => `{${ids.filter((x) => comp[x] === k).join(', ')}}`);
  frames.push(frame(W, H, draw(snaps.at(-1), true),
    `${id} components: ${list(groups)}. comp[v] is v's component, so "can u reach v?" is comp[u] == comp[v]. Every vertex is pushed once and every edge scanned from both ends: O(n + m).`));
  return [{ title: 'Components with an explicit stack', frames }];
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
  snap('BFS from S; cells are (row,column), and grey squares are walls. A cell gets its distance the moment it is first reached, then waits in the queue (amber) to be expanded.');
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

// The stage template's RootedTree, step by step: a stack DFS sets par and depth when it pushes a
// vertex and tin when it pops it; then a walk backwards over order adds each size into its parent's.
function trees() {
  const parent = { 2: 1, 3: 1, 4: 2, 5: 2, 6: 3, 7: 5, 8: 5 };
  const nodes = { 1: [200, 26], 2: [120, 76], 3: [290, 76], 4: [70, 126], 5: [170, 126], 6: [290, 126], 7: [130, 176], 8: [210, 176] };
  const ids = Object.keys(nodes);
  const edges = Object.entries(parent).map(([c, p]) => [String(p), c]);
  // Adjacency lists in increasing order, as if the edges had been read in that order.
  const g = Object.fromEntries(ids.map((id) => [id, []]));
  for (const [a, b] of edges) { g[a].push(b); g[b].push(a); }
  for (const id of ids) g[id].sort((a, b) => a - b);
  const root = ids.find((id) => !(id in parent));
  const kidsOf = (v) => g[v].filter((u) => u !== parent[v]?.toString());
  const one = (xs, word, many) => (xs.length > 1 ? `${many} ${list(xs)}` : `${word} ${xs[0]}`);

  const par = {}, depth = {}, tin = {}, size = {}, order = [], st = [], done = new Set();
  const snaps = [];
  const snap = (caption, extra = {}) => snaps.push({ caption, par: { ...par }, depth: { ...depth }, tin: { ...tin }, size: { ...size }, order: [...order], st: [...st], done: new Set(done), hl: [], wait: [], good: [], edges: [], ...extra });
  snap(`Root the tree at ${root}. The template's stack DFS sets par and depth when it pushes a vertex, and tin, its slot in order, when it pops it. A walk backwards over order then fills size.`);
  par[root] = '−1'; depth[root] = 0; st.push(root);
  snap(`Push the root ${root}: par[${root}] = −1 and depth[${root}] = 0.`, { wait: [`par:${root}`, `depth:${root}`] });
  let told = false;
  while (st.length) {
    const v = st.pop();
    const before = st.filter((u) => par[u] === par[v]);
    tin[v] = order.length;
    order.push(v);
    const kids = kidsOf(v);
    for (const u of kids) { par[u] = v; depth[u] = depth[v] + 1; st.push(u); }
    const why = before.length && !told ? `; it was pushed after ${list(before)}, so it comes off the stack first` : '';
    told ||= why !== '';
    snap(`Pop ${v}: tin[${v}] = ${tin[v]}, so ${v} takes order[${tin[v]}]${why}. ${kids.length
      ? `Push ${one(kids, 'its child', 'its children')}: par = ${v}, depth = depth[${v}] + 1 = ${depth[v] + 1}.`
      : `${v} has no children to push.`}`,
    { focus: v, slot: tin[v], hl: [`tin:${v}`], wait: kids.flatMap((u) => [`par:${u}`, `depth:${u}`]), edges: kids.map((u) => `${v}-${u}`) });
    done.add(v);
  }
  for (const id of ids) size[id] = 1;
  snap(`order is complete. Every size[v] starts at 1, for v itself. Now walk order backwards, from order[${order.length - 1}] down to order[1], adding each size into its parent's.`,
    { hl: ids.map((id) => `size:${id}`) });
  const final = new Set();
  for (let i = order.length - 1; i > 0; i--) {
    const v = order[i], p = par[v], was = size[p];
    size[p] += size[v];
    final.add(v);
    const kids = kidsOf(v);
    const why = kids.length
      ? `${v}'s ${one(kids, 'child', 'children')} ${kids.length > 1 ? 'come' : 'comes'} later in order and ${kids.length > 1 ? 'have' : 'has'} already been added`
      : `${v} is a leaf`;
    snap(`order[${i}] = ${v}: ${why}, so size[${v}] = ${size[v]} is final. Add it to its parent: size[${p}] = ${was} + ${size[v]} = ${size[p]}.${i === 1 ? ` Only the root, order[0], is left, and size[${p}] = ${size[p]} is final too.` : ''}`,
      { focus: v, parentOf: p, slot: i, final: new Set(final), good: [`size:${v}`], hl: [`size:${p}`], edges: [`${p}-${v}`] });
  }
  const after = { ...snaps.at(-1), focus: null, parentOf: null, slot: null, good: [], hl: [], edges: [], final: new Set(ids) };
  // The largest subtree below the root, then the largest one nested inside it.
  const big = ids.filter((id) => id !== root).sort((a, b) => size[b] - size[a])[0];
  const nested = kidsOf(big).sort((a, b) => size[b] - size[a])[0];
  const inSub = (v, id) => tin[id] >= tin[v] && tin[id] < tin[v] + size[v];
  [big, nested].forEach((v, i) => {
    const a = tin[v], b = tin[v] + size[v] - 1;
    const members = ids.filter((id) => inSub(v, id));
    snaps.push({ ...after, block: v, hl: [`tin:${v}`, `size:${v}`], caption: i === 0
      ? `${v}'s subtree {${members.join(', ')}} is order[${a}..${b}]: it starts at tin[${v}] = ${a} and has size[${v}] = ${size[v]} entries. Once ${v} is popped, its descendants go on top of whatever was below it in st, so they all come off before that.`
      : `Subtrees nest as blocks: ${v}'s is order[${a}..${b}]. The stack took ${kidsOf(root).at(-1)}'s subtree first, but any child order keeps every subtree a block, so a subtree query is a range query on order[tin[v] .. tin[v] + size[v] − 1].` });
  });

  const tx = 110, ty = 222, cs = 30, oy = 380, sx = 340, sy = 30;
  const W = 450, H = 430;
  const depthMax = Math.max(...snaps.map((s) => s.st.length));
  const draw = (s) => {
    const sub = s.block ? (id) => inSub(s.block, id) : null;
    const node = (id) => {
      if (sub) return sub(id) ? 'current' : 'dim';
      if (id === s.focus) return 'current';
      if (s.final) return id === s.parentOf ? 'wait' : s.final.has(id) ? 'done' : '';
      return s.st.includes(id) ? 'wait' : s.done.has(id) ? 'done' : '';
    };
    let out = graph(nodes, edges, {
      nodeCls: node,
      edgeCls: (a, b) => (sub ? (sub(a) && sub(b) ? 'hl' : 'dim') : s.edges.includes(`${a}-${b}`) ? 'hl' : !s.final && b in s.par ? 'good' : ''),
    });
    const rows = ['par', 'depth', 'tin', 'size'];
    out += table(rows.length, ids.length, (r, c) => {
      const name = rows[r], id = ids[c];
      const v = s[name][id];
      const k = `${name}:${id}`;
      return { v: v ?? '', cls: s.hl.includes(k) ? 'hl' : s.good.includes(k) ? 'good' : s.wait.includes(k) ? 'wait' : '' };
    }, { x: tx, y: ty, size: cs, rowHead: rows, colHead: ids });
    out += row(range(ids.length).map((i) => s.order[i] ?? ''), {
      x: tx, y: oy, size: cs, name: 'order', index: true,
      cls: (i) => (s.block ? (i >= tin[s.block] && i < tin[s.block] + size[s.block] ? 'hl' : 'dim') : i === s.slot ? 'hl' : ''),
    });
    if (s.block) out += span(tin[s.block], tin[s.block] + size[s.block] - 1, `order[${tin[s.block]}..${tin[s.block] + size[s.block] - 1}]`, { x: tx, y: oy - 4, size: cs, up: true });
    out += row(range(depthMax).map((i) => s.st[i] ?? ''), { x: sx, y: sy, size: cs, name: 'st', cls: (i) => (i < s.st.length ? 'wait' : '') });
    if (s.st.length) out += text(cellX(s.st.length - 1, { x: sx, size: cs }) + cs / 2, sy - 9, 'top', 'v-note wait');
    return out;
  };
  return [{ title: 'Rooted tree: par, depth, preorder, subtree size', frames: snaps.map((s) => frame(W, H, draw(s), s.caption)) }];
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
  const snaps = [];
  const snap = (caption, extra = {}) => snaps.push({ caption, p: { ...p }, status: [...status], roots: [], wait: [], ...extra });

  // find with path halving, as in the template (x = p[x] = p[p[x]]); reports the walk so the frame can show it.
  const find = (v) => {
    const path = [v];
    while (p[path.at(-1)] !== path.at(-1)) path.push(p[path.at(-1)]);
    const root = path.at(-1);
    const moved = [];
    for (let x = v; p[x] !== x; x = p[x]) {
      if (p[p[x]] !== p[x]) moved.push(`${x} to its grandparent ${p[p[x]]}`);
      p[x] = p[p[x]];
    }
    const walk = path.length === 1 ? `p[${v}] = ${v}, so ${v} is a root` : `${path.join(' → ')}, so the root is ${root}`;
    return { root, path, moved: path.filter((x, i) => i % 2 === 0 && i + 2 < path.length), text: `find(${v}): ${walk}.${moved.length ? ` On the way, path halving repoints ${list(moved)}.` : ''}` };
  };

  snap('Kruskal tries edges from lightest to heaviest (the sorted row) and keeps one only if its ends are in different sets. Green edges are kept. The DSU\'s own trees, drawn from p at the bottom, start with every vertex as its own root.');
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
    snap(`Roots ${fa.root} and ${fb.root} differ: take ${a}–${b}. ${why} p[${small}] = ${big}, giving {${members(big).join(', ')}}.`, { changed: [small], merged: members(big) });
  }
  const rest = sorted.slice(next).map(([a, b, w]) => `${a}–${b} (${w})`);
  snap(`${taken.length} edges = n − 1, so stop${rest.length ? `: ${list(rest)} ${rest.length > 1 ? 'are' : 'is'} never examined` : ''}. MST weight ${taken.join(' + ')} = ${taken.reduce((s, w) => s + w, 0)}.`, { final: true });

  const x = 80, size = 32, ey = 206, py = 270, fy = 352, unit = 44, level = 50;
  const depthIn = (pp, v) => (pp[v] === v ? 0 : 1 + depthIn(pp, pp[v]));
  const W = 460, H = fy + level * Math.max(...snaps.flatMap((s) => ids.map((v) => depthIn(s.p, v)))) + 22;
  // The DSU's forest as p stores it: roots on the top line, each vertex under its parent, arrows to the parent.
  const forest = (s) => {
    const kids = (v) => ids.filter((k) => k !== v && s.p[k] === v);
    const at = {};
    let leaf = 0;
    const place = (v, d) => {
      const c = kids(v);
      if (!c.length) at[v] = [x + leaf++ * unit + unit / 2, fy + d * level];
      else { c.forEach((k) => place(k, d + 1)); at[v] = [(at[c[0]][0] + at[c.at(-1)][0]) / 2, fy + d * level]; }
    };
    ids.filter((v) => s.p[v] === v).forEach((r) => place(r, 0));
    const links = ids.filter((v) => s.p[v] !== v).map((v) => [v, s.p[v]]);
    return text(x - 10, fy, 'trees', 'v-name', 'end') + graph(at, links, {
      directed: true, r: 14,
      nodeCls: (id) => (s.final ? 'done' : s.roots.includes(id) ? 'current' : s.wait.includes(id) ? 'wait' : s.merged?.includes(id) ? 'done' : ''),
      edgeCls: (a) => (s.changed?.includes(a) ? 'good' : ''),
    });
  };
  const draw = (s) => graph(nodes, edges, {
    nodeCls: (id) => (s.final ? 'done' : s.roots.includes(id) ? 'current' : s.wait.includes(id) ? 'wait' : s.merged?.includes(id) ? 'done' : ''),
    edgeCls: (a, b) => {
      const st = s.status[sorted.findIndex(([u, v]) => u === a && v === b)];
      return s.final && st !== 'good' ? 'dim' : st;
    },
  })
    + row(sorted.map(([, , w]) => w), { x, y: ey, size, name: 'sorted', cls: (i) => (s.final && !s.status[i] ? 'dim' : s.status[i]) })
    + under(sorted.map(([a, b]) => a + b), { x, y: ey, size })
    + row(ids.map((id) => s.p[id]), { x, y: py, size, name: 'p', cls: (i) => (s.changed?.includes(ids[i]) ? 'good' : s.roots.includes(ids[i]) ? 'hl' : s.wait.includes(ids[i]) ? 'wait' : '') })
    + under(ids, { x, y: py, size })
    + forest(s);
  return [{ title: 'DSU and Kruskal', frames: snaps.map((s) => frame(W, H, draw(s), s.caption)) }];
}

export default {
  dfs,
  bfs,
  trees,
  'dsu-mst': dsuMst,
};
