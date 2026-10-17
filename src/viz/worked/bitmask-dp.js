// Pictures for the Bitmask DP and meet in the middle worked problem, made by running its solution on the official sample.
// Kattis pokemongogo, sample 1: the shortest round trip that catches every kind is 28 blocks.

import { text, graph, arrowHead } from '../draw.js';
import { frame, range } from '../stages/common.js';

const STOPS = [[5, 9, 'Eevee'], [20, 20, 'Flareon'], [1, 1, 'Flareon'], [1, 8, 'Jolteon'], [2, 8, 'Umbreon']];
const ANSWER = 28;

// The solution: dp[mask][v] is the shortest walk from home that has caught the kinds in mask and stands at v.
// Every offer is logged with the walk behind it, so a frame can show the two walks a state compares.
function solve(stops) {
  const n = stops.length, names = [];
  const kind = stops.map(([, , name]) => (names.includes(name) ? names.indexOf(name) : names.push(name) - 1));
  const full = (1 << names.length) - 1;
  const w = (v, u) => Math.abs(stops[v][0] - stops[u][0]) + Math.abs(stops[v][1] - stops[u][1]);
  const home = (v) => Math.abs(stops[v][0]) + Math.abs(stops[v][1]);
  const dp = Array.from({ length: full + 1 }, () => Array(n).fill(Infinity));
  const walk = Array.from({ length: full + 1 }, () => Array(n).fill(null));
  const offers = [];
  for (let v = 0; v < n; v++) { dp[1 << kind[v]][v] = home(v); walk[1 << kind[v]][v] = [v]; }
  for (let mask = 1; mask <= full; mask++) {
    for (let v = 0; v < n; v++) {
      if (dp[mask][v] === Infinity) continue;
      for (let u = 0; u < n; u++) {
        if (mask >> kind[u] & 1) continue;
        const next = mask | 1 << kind[u], val = dp[mask][v] + w(v, u);
        const offer = { mask: next, u, from: v, val, old: dp[next][u], oldWalk: walk[next][u], newWalk: [...walk[mask][v], u] };
        offers.push(offer);
        if (val < dp[next][u]) { dp[next][u] = val; walk[next][u] = offer.newWalk; }
      }
    }
  }
  const ends = stops.map((_, v) => dp[full][v] + home(v));
  const best = Math.min(...ends);
  return { names, kind, full, w, home, dp, walk, offers, ends, best };
}

export default function bitmaskDp() {
  const s = solve(STOPS);
  if (s.best !== ANSWER) throw new Error(`Pokemon Go Go: got ${s.best}, the sample says ${ANSWER}`);
  const n = STOPS.length, k = s.names.length;
  const bits = (m) => `${m.toString(2).padStart(k, '0')}₂`;
  const letter = (v) => STOPS[v][2][0];
  const where = (v) => `(${STOPS[v][0]}, ${STOPS[v][1]})`;
  const route = (wk) => ['H', ...wk.map((v) => (STOPS.filter((t) => t[2] === STOPS[v][2]).length > 1 ? `${letter(v)}${where(v)}` : letter(v)))].join(' → ');

  // The map: column c across, row r up. The stop at (20, 20) is drawn at the top right, not to scale.
  const W = 440, H = 300, R = 11;
  const at = ([r, c]) => (r > 10 ? [416, 24] : [32 + c * 36, 214 - r * 38]);
  const nodes = { H: at([0, 0]) };
  STOPS.forEach((t, v) => { nodes[v] = at(t); });
  const label = (id) => (id === 'H' ? 'H' : letter(+id));
  const extras = () => text(436, 56, '(20, 20)', 'v-label', 'end') + text(436, 70, 'not to scale', 'v-label', 'end')
    + STOPS.map((_, v) => text(nodes[v][0] - 17, nodes[v][1] - 15, v, 'v-idx')).join('');
  const legs = (wk, home = false) => {
    const pts = ['H', ...wk.map(String), ...(home ? ['H'] : [])];
    return pts.slice(1).map((b, i) => [pts[i], b, b === 'H' ? s.home(+pts[i]) : pts[i] === 'H' ? s.home(+b) : s.w(+pts[i], +b)]);
  };
  // Edges are drawn here rather than by graph(): a leg that would graze another stop bends away from it,
  // and each length sits on the side away from the middle of the map (inside a bent leg; below one at the top edge).
  const edge = ([a, b, d], cls) => {
    const [x1, y1] = nodes[a], [x2, y2] = nodes[b];
    const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const grazed = Object.entries(nodes).filter(([id]) => id !== a && id !== b).map(([, p]) => p).find(([px, py]) => {
      const t = Math.max(0, Math.min(len, (px - x1) * ux + (py - y1) * uy));
      return Math.hypot(px - x1 - ux * t, py - y1 - uy * t) < R + 10;
    });
    // The walk home bends further, so its arrowhead stays clear of the first leg leaving H.
    const size = b === 'H' ? 72 : 48;
    const bend = grazed ? ((-uy * (grazed[0] - mx) + ux * (grazed[1] - my)) > 0 ? -size : size) : 0;
    const cx = mx - uy * bend, cy = my + ux * bend;
    const toward = (px, py, qx, qy, cut) => { const l = Math.hypot(qx - px, qy - py); return [px + (qx - px) / l * cut, py + (qy - py) / l * cut]; };
    const [sx, sy] = toward(x1, y1, cx, cy, R), [ex, ey] = toward(x2, y2, cx, cy, R + 3);
    let side = (-uy * (mx - 220) + ux * (my - 120)) >= 0 ? 1 : -1;
    if (bend) side = -Math.sign(bend);
    const lx = mx - uy * (bend / 2 + 11 * side), ly = my + ux * (bend / 2 + 11 * side);
    const [tx, ty] = ly < 16 ? [mx + uy * 11, my - ux * 11] : [lx, ly];
    return `<path class="v-edge ${cls}" d="M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey}" fill="none" marker-end="url(#${arrowHead(cls)})"/>`
      + text(tx, ty, d, `v-weight ${cls}`);
  };
  // Faint streets, one line per block, under everything else.
  const streets = range(10).map((c) => `<line class="v-edge dim" x1="${at([0, c])[0]}" y1="${at([0, 0])[1]}" x2="${at([0, c])[0]}" y2="${at([5, 0])[1]}"/>`).join('')
    + range(6).map((r) => `<line class="v-edge dim" x1="${at([0, 0])[0]}" y1="${at([r, 0])[1]}" x2="${at([0, 9])[0]}" y2="${at([r, 0])[1]}"/>`).join('');
  const map = ({ edges = [], edgeCls = () => '', nodeCls = () => '' } = {}) => streets + edges.map((e) => edge(e, edgeCls(e[0], e[1]))).join('')
    + graph(nodes, [], { r: R, nodeText: label, nodeCls });
  const lines = (items) => items.map(([str, cls], i) => text(20, 248 + i * 20, str, `v-note ${cls}`, 'start')).join('');

  const frames = [];

  // 0: the sample on its map.
  frames.push(frame(W, H, map({ nodeCls: (id) => (id === 'H' ? 'current' : '') }) + extras()
    + lines([[`Kinds: ${s.names.map((nm) => `${nm[0]} = ${nm}`).join(', ')}`, ''], ['A walk costs the rows plus the columns it crosses.', '']]),
    `Sample 1: home H at (0, 0) and ${n} stops, each labelled by the first letter of its Pokémon. Flareon is at two stops.`));

  // 1: a moment where two walks reach the same state and the shorter replaces the longer:
  // they caught the same kinds at different stops (the two Flareons).
  {
    const o = s.offers.find((of) => of.old !== Infinity && of.val < of.old && of.oldWalk.some((v, i) => s.kind[v] === s.kind[of.newWalk[i]] && v !== of.newWalk[i]));
    if (!o) throw new Error('expected two walks through different Flareons to meet in one state');
    const good = legs(o.newWalk), bad = legs(o.oldWalk);
    const cls = new Map([...bad.map(([a, b]) => [`${a}-${b}`, 'bad']), ...good.map(([a, b]) => [`${a}-${b}`, 'good'])]);
    const sum = (wk) => legs(wk).map(([, , d]) => d).join(' + ');
    frames.push(frame(W, H, map({ edges: [...bad, ...good], edgeCls: (a, b) => cls.get(`${a}-${b}`), nodeCls: (id) => (id === String(o.u) ? 'current' : o.newWalk.includes(+id) || id === 'H' ? 'done' : o.oldWalk.includes(+id) ? 'wait' : 'dim') }) + extras()
      + lines([[`dp[${bits(o.mask)}][${o.u}]: ${s.names.filter((_, b) => o.mask >> b & 1).join(' and ')} caught, at stop ${o.u}`, 'hl'],
        [`${route(o.oldWalk)}: ${sum(o.oldWalk)} = ${o.old}, dropped`, 'bad'],
        [`${route(o.newWalk)}: ${sum(o.newWalk)} = ${o.val}, kept`, 'good']]),
      `dp[${bits(o.mask)}][${o.u}]: ${route(o.newWalk)} takes ${o.val} blocks, so it replaces ${route(o.oldWalk)} at ${o.old}. Both caught the same kinds and stand at the same stop.`));
  }

  // 2: the full mask: every end stop adds its walk home.
  {
    const notes = STOPS.map((_, v) => `${s.dp[s.full][v]} + ${s.home(v)} = ${s.ends[v]}`);
    // Beside each stop, except where a neighbour is in the way: below the Eevee stop, under the far Flareon's labels.
    const place = (v, [x, y]) => (y < 60 && x > 380 ? [436, y + 66, 'end'] : y < 60 ? [x - 17, y + 1, 'end'] : [x + 17, y + 1, 'start']);
    const ends = STOPS.map((_, v) => {
      const [x, y, anchor] = place(v, nodes[v]);
      return text(x, y, notes[v], `v-note ${s.ends[v] === s.best ? 'good' : 'bad'}`, anchor);
    }).join('');
    frames.push(frame(W, H, map({ nodeCls: (id) => (id === 'H' ? 'current' : s.ends[+id] === s.best ? 'done' : 'dim') }) + extras() + ends
      + lines([[`Each stop v: dp[${bits(s.full)}][v] + its walk home`, 'hl'], [`The least is ${s.best}.`, 'good']]),
      `The full mask ${bits(s.full)}: ending at stop v costs dp[${bits(s.full)}][v] plus the walk home, ${s.ends.join(', ')} for v = 0 to ${n - 1}. The least is ${s.best}.`));
  }

  // 3: the route the DP found for the answer.
  {
    const end = s.ends.indexOf(s.best), wk = s.walk[s.full][end], all = legs(wk, true);
    const total = all.reduce((t, [, , d]) => t + d, 0);
    if (total !== s.best) throw new Error('the drawn route should have the answer\'s length');
    frames.push(frame(W, H, map({ edges: all, edgeCls: () => 'good', nodeCls: (id) => (id === 'H' || wk.includes(+id) ? 'done' : 'dim') }) + extras()
      + lines([[`${route(wk)} → H`, 'good'], [`${all.map(([, , d]) => d).join(' + ')} = ${total} blocks`, 'good']]),
      `The best route the DP found: ${route(wk)} → H, ${all.map(([, , d]) => d).join(' + ')} = ${total} blocks.`));
  }
  return [{ title: 'Pokemon Go Go, sample 1', frames }];
}
