// Pictures for the shortest paths worked problem, Full Tank? (Kattis fulltank): the solution's Dijkstra over
// states (city, fuel), run on the official sample's first query. Both queries are checked against the sample.

import { text, table, graph, arrow } from '../draw.js';
import { frame } from '../stages/common.js';

const SAMPLE = {
  input: '5 5\n10 10 20 12 13\n0 1 9\n0 2 8\n1 2 1\n1 3 11\n2 3 7\n2\n10 0 3\n20 1 4',
  output: ['170', 'impossible'],
};

function parse() {
  const lines = SAMPLE.input.split('\n').map((l) => l.split(' ').map(Number));
  const [[n, m], price] = lines;
  const roads = lines.slice(2, 2 + m), queries = lines.slice(3 + m);
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, len] of roads) { adj[u].push([v, len]); adj[v].push([u, len]); }
  return { n, price, roads, adj, queries };
}

// One query, as in the solution: state (v, f) is v·K + f, and pq pops the smallest (d, state). A sorted array
// pops in the same order, since no two entries are equal. A snapshot after every pop records dist, the settled
// states and the relaxations just made; par is kept only to draw the route at the end.
function query({ n, price, adj }, [c, src, t]) {
  const K = c + 1, dist = Array(n * K).fill(Infinity), par = Array(n * K).fill(-1), settled = new Set();
  let pq = [[0, src * K]];
  dist[src * K] = 0;
  const snaps = [{ dist: [...dist], settled: new Set(), moves: [] }];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const [d, s] = pq.shift();
    if (d !== dist[s]) continue;
    settled.add(s);
    const v = Math.floor(s / K), f = s % K;
    if (v === t) {
      snaps.push({ dist: [...dist], settled: new Set(settled), moves: [], s, d, end: true });
      return { K, ans: d, snaps, par };
    }
    const moves = [];
    const relax = (s2, d2, kind) => {
      const before = dist[s2], better = d2 < before;
      if (better) { dist[s2] = d2; par[s2] = s; pq.push([d2, s2]); }
      moves.push({ to: s2, d: d2, before, better, kind });
    };
    if (f < c) relax(s + 1, d + price[v], 'buy');
    for (const [u, len] of adj[v]) if (f >= len) relax(u * K + f - len, d, `drive ${len}`);
    snaps.push({ dist: [...dist], settled: new Set(settled), moves, s, d });
  }
  return { K, ans: null, snaps, par };
}

export default () => {
  const g = parse();
  const runs = g.queries.map((q) => query(g, q));
  const got = runs.map((r) => (r.ans === null ? 'impossible' : String(r.ans)));
  if (got.join() !== SAMPLE.output.join()) throw new Error(`Full Tank? sample: got ${got.join(', ')}, expected ${SAMPLE.output.join(', ')}`);
  const [c, src, t] = g.queries[0];
  const { K, snaps, par } = runs[0];
  const cityOf = (s) => Math.floor(s / K), fuelOf = (s) => s % K;
  const name = (s) => `(${cityOf(s)}, ${fuelOf(s)})`;

  const nodes = { 0: [46, 66], 1: [176, 22], 2: [176, 112], 3: [306, 66], 4: [420, 66] };
  const roads = g.roads.map(([u, v, len]) => [String(u), String(v), len]);
  const x = 48, y = 196, size = 37, W = 460, H = y + g.n * size + 8;
  const centre = (s) => [x + fuelOf(s) * size + size / 2, y + cityOf(s) * size + size / 2];
  // A drive changes row: the arrow runs from the source cell's lower (or upper) edge to the target's facing edge,
  // mostly along the gap between rows. Buying moves one cell right and needs no arrow.
  const link = (from, to, cls) => {
    const [x1, y1] = centre(from), [x2, y2] = centre(to), dir = Math.sign(y2 - y1);
    return arrow(x1, y1 + dir * (size / 2 - 5), x2 + Math.sign(x1 - x2) * 4, y2 - dir * (size / 2 - 7), cls);
  };
  const priceAt = (id) => text(nodes[id][0], nodes[id][1] + (id === '2' ? 27 : -26), `p ${g.price[id]}`, 'v-note');
  // The route behind the answer, from par.
  const end = snaps.at(-1).s, route = [];
  for (let s = end; s >= 0; s = par[s]) route.unshift(s);
  const routeCities = route.map(cityOf).filter((v, i, a) => v !== a[i - 1]);
  const onRoute = (a, b) => routeCities.some((v, i) => i && ((routeCities[i - 1] === +a && v === +b) || (routeCities[i - 1] === +b && v === +a)));

  const draw = (snap) => {
    const cur = snap.s, final = snap.end;
    const fresh = new Set(snap.moves.filter((m) => m.better).map((m) => m.to));
    const curCity = cur === undefined ? null : cityOf(cur);
    const roadNow = (a, b) => snap.moves.some((m) => m.kind !== 'buy' && ((curCity === +a && cityOf(m.to) === +b) || (curCity === +b && cityOf(m.to) === +a)));
    let out = graph(nodes, roads, {
      nodeCls: (id) => (+id === curCity ? 'current' : final && routeCities.includes(+id) ? 'done' : ''),
      edgeCls: (a, b) => (final ? (onRoute(a, b) ? 'good' : 'dim') : roadNow(a, b) ? 'hl' : ''),
    }) + Object.keys(nodes).map(priceAt).join('');
    out += text(x + (K * size) / 2, y - 30, 'fuel f', 'v-idx') + text(x - 10, y - 12, 'city', 'v-idx', 'end');
    // Three-digit costs need a smaller font than the default to fit their cells.
    out += table(g.n, K, (v, f) => {
      const s = v * K + f, d = snap.dist[s];
      const cls = s === cur ? 'hl'
        : final ? (route.includes(s) ? 'good' : 'dim')
          : fresh.has(s) ? 'good' : snap.settled.has(s) ? 'done' : d < Infinity ? 'wait' : '';
      return { v: d === Infinity ? '' : d, cls };
    }, { x, y, size, rowHead: Array.from({ length: g.n }, (_, v) => v), colHead: Array.from({ length: K }, (_, f) => f) })
      .replace(/<text ([^>]*)class=""/g, '<text $1class="" style="font-size:12.5px"');
    if (final) {
      for (let i = 1; i < route.length; i++) if (cityOf(route[i]) !== cityOf(route[i - 1])) out += link(route[i - 1], route[i], 'good');
    } else {
      for (const m of snap.moves) if (m.kind !== 'buy') out += link(cur, m.to, m.better ? 'hl' : 'bad');
    }
    return out;
  };
  const caption = (snap) => {
    if (snap.s === undefined) return `Query c = ${c}, from city ${src} to city ${t}. Rows are cities and columns fuel levels; dist[${src}][0] = 0 and every other state is unreached (blank).`;
    if (snap.end) return `Pop ${name(snap.s)} at ${snap.d}: the first state of city ${t} to leave pq, so the answer is ${snap.d}. Green: the route behind it, buying at cities ${[...new Set(route.filter((s, i) => route[i + 1] === s + 1).map(cityOf))].join(' and ')}.`;
    const said = snap.moves.map((m) => `${m.kind === 'buy' ? `buy 1 unit for ${g.price[cityOf(snap.s)]}` : `drive ${m.kind.slice(6)} to city ${cityOf(m.to)}`}: dist[${cityOf(m.to)}][${fuelOf(m.to)}] ${m.better ? (m.before === Infinity ? `= ${m.d}` : `drops from ${m.before} to ${m.d}`) : `stays ${m.before}, as ${m.d} is no better`}`);
    return `Pop ${name(snap.s)} at ${snap.d}. ${said.join('; ')}.`.replace(/\. b/, '. B').replace(/\. d/, '. D');
  };
  const frames = snaps.map((s) => frame(W, H, draw(s), caption(s)));
  return [{ title: 'Full Tank?, sample query 1', frames }];
};
