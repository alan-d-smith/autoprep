// Step-through diagrams: binary and ternary search on the answer, cross products and the convex hull.

import { text, row, cellX, span, arrow, polyline, dot } from '../draw.js';
import { frame, range } from './common.js';

const seg = ([x1, y1], [x2, y2], cls = '') => `<line class="v-edge ${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
const area = (pts, cls) => `<path class="v-area ${cls}" d="${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')} Z"/>`;
const signed = (v) => (v < 0 ? `−${-v}` : `${v}`);
const paren = (v) => (v < 0 ? `(−${-v})` : `${v}`);

function binarySearch() {
  // lastTrue, as in the template: ok reads true…true, then false…false, and the answer is the last true.
  const n = 16, target = 120, ok = (v) => v * v <= target;
  const x = 30, y = 34, size = 24, gap = 3, W = 470, H = 92;
  const at = (i) => cellX(i, { x, size, gap }) + size / 2;
  const known = { 0: true }, tried = {};  // ok(0) holds (0² = 0), so lo = 0 starts on the true side
  let lo = 0, hi = n - 1;
  const draw = (mid, midCls = 'hl') => {
    const cells = row(range(n), { x, y, size, gap, cls: (i) => (i === mid ? midCls : i in known ? (known[i] ? 'good' : 'bad') : i < lo || i > hi ? 'dim' : '') });
    const above = Object.entries(tried).map(([i, yes]) => text(at(+i), y - 12, +i * +i, `v-note ${yes ? 'good' : 'bad'}`)).join('')
      + (mid != null && !(mid in tried) ? text(at(mid), y - 12, 'mid', 'v-note hl') : '');
    const ends = lo === hi ? text(at(lo), y + size + 22, 'lo = hi', 'v-note') : text(at(lo), y + size + 22, 'lo', 'v-note') + text(at(hi), y + size + 22, 'hi', 'v-note');
    return cells + above + span(lo, hi, '', { x, y: y + size + 4, size, gap }) + ends;
  };
  const frames = [frame(W, H, draw(null), `Find the largest x in 0..${n - 1} with ok(x): x² ≤ ${target}, which reads true…true, then false…false. ok(0) is true, so start at lo = 0, hi = ${hi}, and keep ok(lo) true and everything above hi false.`)];
  let checks = 0;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo + 1) / 2), middle = (lo + hi) / 2;
    frames.push(frame(W, H, draw(mid), `lo = ${lo}, hi = ${hi}, so mid = lo + (hi − lo + 1) / 2 = ${mid}${middle === mid ? '' : `: the middle, ${middle}, rounded up`}.`
      + (hi === lo + 1 ? ` Rounded down it would be ${lo} = lo, already known true, so lo = mid would never move.` : '')));
    const yes = ok(mid);
    checks++;
    tried[mid] = yes;
    frames.push(frame(W, H, draw(mid, yes ? 'good' : 'bad'), `ok(${mid}): ${mid}² = ${mid * mid} ${yes ? '≤' : '>'} ${target}, so it's ${yes}.`));
    for (let i = yes ? lo : mid; i <= (yes ? mid : hi); i++) known[i] = yes;
    if (yes) lo = mid; else hi = mid - 1;
    frames.push(frame(W, H, draw(null), yes
      ? `True, so everything up to ${mid} is true too: the answer is at least ${mid}. lo = mid = ${lo}.`
      : `False, so everything from ${mid} up is false too: the answer is below ${mid}. hi = mid − 1 = ${hi}.`));
  }
  frames.push(frame(W, H, draw(null), `lo = hi = ${lo}: the loop stops and ${lo} is the answer, after ${checks} checks.`));
  for (let i = 0; i < n; i++) known[i] = ok(i);
  frames.push(frame(W, H, draw(null), `Scanning 0, 1, 2, … up to the first false would take ${lo + 2} checks; binary search takes about log₂(${n}) = ${Math.log2(n)}. Over 0..10^18 that's about 60.`));
  return { title: 'Binary search on the answer', frames };
}

function ternarySearch() {
  const f = (t) => 0.28 * (t - 6.3) ** 2 + 1;
  const W = 470, H = 200, base = 172;
  const PX = (t) => 40 + t * 38, PY = (v) => base - 2 - v * 11;
  const t2 = (t) => t.toFixed(2), f3 = (t) => f(t).toFixed(3);
  const curve = polyline(range(101).map((i) => [PX(i / 10), PY(f(i / 10))]), '');
  const axis = `<path class="v-axis" d="M${PX(0)} ${base} H${PX(10)}"/>` + text(PX(0), base + 14, '0', 'v-idx') + text(PX(10), base + 14, '10', 'v-idx');
  const band = (lo, hi) => `<rect class="v-band" x="${PX(lo)}" y="22" width="${PX(hi) - PX(lo)}" height="${base - 22}"/>` + text(PX(lo), 12, 'lo', 'v-note') + text(PX(hi), 12, 'hi', 'v-note');
  const probe = (t, cls, label) => seg([PX(t), base], [PX(t), PY(f(t))], cls) + dot(PX(t), PY(f(t)), cls, 5) + text(PX(t), base + 14, label, `v-note ${cls}`);
  const rounds = 5;
  let lo = 0, hi = 10;
  const frames = [frame(W, H, axis + band(lo, hi) + curve, `Ternary search for the minimum of a function that falls, then rises. Start with lo..hi = 0..10 and shrink it by a third each round.`)];
  for (let k = 1; k <= rounds; k++) {
    const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
    const left = f(m1) < f(m2);
    frames.push(frame(W, H, axis + band(lo, hi) + curve + probe(m1, 'hl', 'm1') + probe(m2, 'hl', 'm2'),
      `Round ${k}: lo..hi = ${t2(lo)}..${t2(hi)}. m1 = lo + (hi − lo)/3 = ${t2(m1)}, m2 = hi − (hi − lo)/3 = ${t2(m2)}.`));
    frames.push(frame(W, H, axis + band(lo, hi) + curve + probe(m1, left ? 'good' : 'bad', 'm1') + probe(m2, left ? 'bad' : 'good', 'm2'),
      `f(m1) = ${f3(m1)} ${left ? '<' : '>'} f(m2) = ${f3(m2)}: the minimum can't be ${left ? `right of m2, where f only rises` : `left of m1, where f only falls`}.`));
    const [d1, d2] = left ? [m2, hi] : [lo, m1];
    const drop = `<rect class="v-area bad" x="${PX(d1)}" y="22" width="${PX(d2) - PX(d1)}" height="${base - 22}"/>`;
    if (left) hi = m2; else lo = m1;
    frames.push(frame(W, H, axis + drop + band(lo, hi) + curve,
      `Drop the ${left ? 'right' : 'left'} third: ${left ? `hi = m2 = ${t2(hi)}` : `lo = m1 = ${t2(lo)}`}. lo..hi is now ${t2(lo)}..${t2(hi)}, 2/3 as wide.`));
  }
  frames.push(frame(W, H, axis + band(lo, hi) + curve + dot(PX(6.3), PY(f(6.3)), 'good', 5),
    `After ${rounds} rounds lo..hi = ${t2(lo)}..${t2(hi)}, around the true minimum at 6.30. Each round keeps 2/3, so 100 rounds is plenty for doubles.`));
  return { title: 'Ternary search', frames };
}

const answerSearch = () => [binarySearch(), ternarySearch()];

function geometry() {
  const U = 34, ox = 44, oy = 176, W = 400, H = 232;
  const P = ([x, y]) => [ox + x * U, oy - y * U];
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const axes = `<path class="v-axis" d="M${ox - 8} ${oy} H${ox + 9.4 * U} M${ox} ${oy + 1.4 * U} V${oy - 4.7 * U}"/>`;
  const vec = (v, cls, label, from = [0, 0], below = v[1] < 0) => {
    const [x1, y1] = P(from), [x2, y2] = P([from[0] + v[0], from[1] + v[1]]);
    return arrow(x1, y1, x2, y2, cls) + (label ? text(x2 + 8, y2 + (below ? 12 : -8), label, `v-note ${cls}`, 'start') : '');
  };
  const rect = ([x1, y1], [x2, y2], cls) => area([P([x1, y1]), P([x2, y1]), P([x2, y2]), P([x1, y2])], cls);
  const para = (a, b, cls) => area([P([0, 0]), P(a), P([a[0] + b[0], a[1] + b[1]]), P(b)], cls);
  const sum = (s, cls = 'hl') => text(W - 8, 14, s, `v-note ${cls}`, 'end');
  const show = (v) => `(${v.map(signed).join(', ')})`;
  const frames = [];

  // cross(a, b) term by term: a.x·b.y is a rectangle, a.y·b.x is another, and their difference is the parallelogram.
  const a = [4, 1];
  const pair = (b, name) => {
    const t1 = a[0] * b[1], t2 = a[1] * b[0], c = cross(a, b);
    const base = axes + vec(a, '', `a = ${show(a)}`);
    const bv = vec(b, c > 0 ? 'good' : c < 0 ? 'bad' : 'hl', `b = ${show(b)}`);
    const r1 = rect([0, 0], [a[0], b[1]], t1 >= 0 ? 'hl' : 'bad'), r2 = rect([0, 0], [b[0], a[1]], t2 > 0 ? 'bad' : 'hl');
    frames.push(frame(W, H, r1 + base + bv + sum(`${a[0]}·${paren(b[1])} = ${signed(t1)}`),
      `${name}a.x·b.y = ${a[0]}·${paren(b[1])} = ${signed(t1)}: the ${a[0]} × ${Math.abs(b[1])} rectangle${t1 < 0 ? ', negative because b points below the x-axis' : ''}.`));
    frames.push(frame(W, H, r1 + r2 + base + bv + sum(`${a[0]}·${paren(b[1])} − ${a[1]}·${paren(b[0])} = ${signed(t1)} − ${signed(t2)}`),
      `Subtract a.y·b.x = ${a[1]}·${paren(b[0])} = ${signed(t2)}, the ${Math.abs(b[0])} × ${a[1]} rectangle: cross(a, b) = ${signed(t1)} − ${signed(t2)} = ${signed(c)}.`));
    frames.push(frame(W, H, para(a, b, c > 0 ? 'good' : 'bad') + base + bv + sum(`cross(a, b) = ${signed(c)}`, c > 0 ? 'good' : 'bad'),
      c > 0
        ? `cross(a, b) = ${c} > 0: b is counter-clockwise from a, a left turn. ${c} is also the parallelogram's area.`
        : `cross(a, b) = ${signed(c)} < 0: b is clockwise from a, a right turn. The parallelogram's area is still ${-c}.`));
  };
  frames.push(frame(W, H, axes + vec(a, '', `a = ${show(a)}`) + vec([2, 3], 'good', 'b = (2, 3)'),
    'cross(a, b) = a.x·b.y − a.y·b.x is one number that says which way b turns from a. Build it term by term.'));
  pair([2, 3], '');
  pair([3, -1], 'Now b = (3, −1). ');
  const b3 = [2 * a[0], 2 * a[1]];
  frames.push(frame(W, H, axes + vec(b3, 'hl', `b = ${show(b3)}`) + vec(a, '', `a = ${show(a)}`, [0, 0], true) + sum(`${a[0]}·${b3[1]} − ${a[1]}·${b3[0]} = ${cross(a, b3)}`),
    `b = ${show(b3)} = 2a: cross = ${a[0]}·${b3[1]} − ${a[1]}·${b3[0]} = ${cross(a, b3)}. Zero means collinear: no turn at all.`));

  // Orientation of three points, as orient(a, b, c): the sign of cross(b − a, c − a).
  const pa = [1, 1], pb = [5, 2];
  const sub = (u, v) => [u[0] - v[0], u[1] - v[1]];
  const named = (pt, label, dx, dy, anchor = 'middle') => dot(...P(pt), 'hl', 4.5) + text(P(pt)[0] + dx, P(pt)[1] + dy, label, 'v-note hl', anchor);
  for (const [k, pc] of [[6, 4], [8, 1]].entries()) {
    const u = sub(pb, pa), v = sub(pc, pa), c = cross(u, v);
    // Each label sits clear of the segments drawn: b's goes above b when the walk turns down from it.
    const pts = named(pa, `a ${show(pa)}`, 0, 16) + (k ? named(pb, `b ${show(pb)}`, 0, -14) : named(pb, `b ${show(pb)}`, 8, 16, 'start'))
      + named(pc, `c ${show(pc)}`, 12, 0, 'start');
    if (k === 0) {
      frames.push(frame(W, H, axes + vec(u, '', '', pa) + vec(v, 'hl', '', pa) + pts + sum(`b − a = ${show(u)}, c − a = ${show(v)}`),
        `Which way does a → b → c turn? Measure both from a: b − a = ${show(u)} and c − a = ${show(v)}, then take their cross product.`));
    }
    const ok = c > 0;
    frames.push(frame(W, H, axes + seg(P(pa), P(pb), ok ? 'good' : 'bad') + seg(P(pb), P(pc), ok ? 'good' : 'bad') + vec(v, 'hl', '', pa) + pts + sum(`cross = ${u[0]}·${paren(v[1])} − ${u[1]}·${paren(v[0])} = ${signed(c)}`, ok ? 'good' : 'bad'),
      `${k ? `With c = ${show(pc)}: c − a = ${show(v)}, and cross` : 'orient(a, b, c): cross(b − a, c − a)'} = ${u[0]}·${paren(v[1])} − ${u[1]}·${paren(v[0])} = ${signed(c)} ${ok ? '> 0, a left turn at b' : '< 0, a right turn at b'}.`));
  }

  // Shoelace: each term is twice the signed area of the triangle (0, 0), p_i, p_{i+1}.
  const poly = [[1, 1], [6, 1], [7, 3], [4, 4], [1, 3]];
  const m = poly.length;
  const off = [[-12, 12], [12, 12], [14, 0], [0, -14], [-14, 0]];
  const outline = polyline(poly.map(P), '', true) + poly.map((pt, i) => dot(...P(pt), '', 3.5) + text(P(pt)[0] + off[i][0], P(pt)[1] + off[i][1], `p${i}`, 'v-idx')).join('') + text(ox - 4, oy + 12, '(0, 0)', 'v-idx', 'end');
  const total = (k, terms) => text(W - 8, oy + 30, `sum = ${terms.slice(0, k).map((t, i) => (i ? (t < 0 ? `− ${-t}` : `+ ${t}`) : signed(t))).join(' ')}${k > 1 ? ` = ${signed(terms.slice(0, k).reduce((s, t) => s + t, 0))}` : ''}`, 'v-note hl', 'end');
  frames.push(frame(W, H, axes + outline,
    'Shoelace: area = |Σ cross(p_i, p_{i+1})| / 2. Each term is twice the signed area of the triangle from the origin (0, 0) to one edge.'));
  const terms = range(m).map((i) => cross(poly[i], poly[(i + 1) % m]));
  for (let i = 0; i < m; i++) {
    const s = poly[i], e = poly[(i + 1) % m], t = terms[i];
    frames.push(frame(W, H, axes + area([P([0, 0]), P(s), P(e)], t > 0 ? 'good' : 'bad') + outline + seg(P(s), P(e), 'hl') + total(i + 1, terms),
      `cross(p${i}, p${(i + 1) % m}) = ${s[0]}·${e[1]} − ${s[1]}·${e[0]} = ${signed(t)}: ${t > 0 ? 'counter-clockwise around the origin, so it adds' : 'clockwise around the origin, so it subtracts'}.`));
  }
  const twice = terms.reduce((s, t) => s + t, 0);
  // The negative terms' triangles, in red, are exactly what the positive ones cover outside the polygon.
  const neg = range(m).filter((i) => terms[i] < 0), word = ['no', 'one', 'two', 'three', 'four', 'five'];
  const fan = poly.map((pt) => seg(P([0, 0]), P(pt), 'dim')).join('');
  const red = neg.map((i) => area([P([0, 0]), P(poly[i]), P(poly[(i + 1) % m])], 'bad')).join('');
  frames.push(frame(W, H, axes + fan + red + area(poly.map(P), 'good') + outline + total(m, terms),
    `Sum = ${twice}, so the area is ${twice} / 2 = ${twice / 2}. The ${word[m - neg.length]} added triangles cover the polygon and the ${word[neg.length]} red ones outside it; the red terms, ${neg.map((i) => signed(terms[i])).join(' and ')}, cancel those. Integer input keeps it exact.`));
  return [{ title: 'Cross product and polygon area', frames }];
}

function convexHull() {
  // Third value: which side of the point its number goes, clear of every segment the scans draw.
  const pts = [[1, 2, 'l'], [2, 4, 'a'], [3, 1, 'b'], [4, 3, 'a'], [5, 0, 'b'], [6, 4, 'a'], [7, 2, 'a'], [9, 3, 'r']].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const side = { a: [0, -16], b: [0, 17], l: [-14, 0], r: [14, 0] };
  const n = pts.length, U = 40, ox = -10, oy = 190, W = 380, H = 266;
  const P = (i) => [ox + pts[i][0] * U, oy - pts[i][1] * U];
  const cross = (o, a, b) => (pts[a][0] - pts[o][0]) * (pts[b][1] - pts[o][1]) - (pts[a][1] - pts[o][1]) * (pts[b][0] - pts[o][0]);
  const name = (i) => i + 1;
  const draw = ({ done = new Set(), focus = [], chain = [], cls = 'hl', kept = [], test = null, popped = null, stack = [], stackCls = () => '' }) => {
    let out = kept.length ? polyline(kept.map(P), 'good') : '';
    if (chain.length > 1) out += polyline(chain.map(P), cls);
    if (test) out += seg(P(test[0]), P(test[1]), test[2]);
    out += pts.map((_, i) => dot(...P(i), focus.includes(i) ? 'hl' : done.has(i) ? '' : 'dim', focus.includes(i) ? 5.5 : 4.5)).join('');
    if (popped != null) out += dot(...P(popped), 'bad', 9);
    out += pts.map((pt, i) => text(P(i)[0] + side[pt[2]][0], P(i)[1] + side[pt[2]][1], name(i), 'v-idx')).join('');
    return out + row(stack.map(name), { x: 70, y: 226, size: 28, name: 'stack', cls: stackCls });
  };
  const frames = [frame(W, H, draw({ done: new Set(range(n)) }),
    `Andrew's monotone chain. The labels number the points sorted by x, then y: ${pts.map((pt, i) => `${name(i)} (${pt[0]}, ${pt[1]})`).join(', ')}. Scan left to right for the lower hull, keeping only left turns.`)];

  const scan = (order, kept, label, side) => {
    const st = [], done = new Set();
    const base = { kept, cls: 'hl' };
    const [s0, s1] = order;
    st.push(s0, s1);
    done.add(s0).add(s1);
    frames.push(frame(W, H, draw({ ...base, done, focus: [s0, s1], chain: [...st], stack: [...st], stackCls: () => 'good' }),
      `${label}: push ${name(s0)} and ${name(s1)}. A stack of fewer than two points has no turn to check.`));
    for (const i of order.slice(2)) {
      done.add(i);
      for (;;) {
        const o = st.at(-2), b = st.at(-1), c = cross(o, b, i);
        if (c > 0) {
          frames.push(frame(W, H, draw({ ...base, done, focus: [o, b, i], chain: [...st], test: [b, i, 'good'], stack: [...st, i], stackCls: (k) => (k === st.length ? 'good' : '') }),
            `Turn ${name(o)} → ${name(b)} → ${name(i)}: cross = ${c} > 0, a left turn. Push ${name(i)}.`));
          st.push(i);
          break;
        }
        frames.push(frame(W, H, draw({ ...base, done, focus: [o, b, i], chain: [...st], test: [b, i, 'bad'], popped: b, stack: [...st], stackCls: (k) => (k === st.length - 1 ? 'bad' : '') }),
          c === 0
            ? `Turn ${name(o)} → ${name(b)} → ${name(i)}: cross = 0, a straight line, so ${name(b)} adds nothing. Pop ${name(b)}.`
            : `Turn ${name(o)} → ${name(b)} → ${name(i)}: cross = ${signed(c)} ≤ 0, a right turn, so ${name(b)} isn't on the ${side} hull. Pop ${name(b)}.`));
        st.pop();
        if (st.length < 2) {
          frames.push(frame(W, H, draw({ ...base, done, focus: [st[0], i], chain: [...st], test: [st[0], i, 'good'], stack: [...st, i], stackCls: (k) => (k === st.length ? 'good' : '') }),
            `Only ${name(st[0])} is left, so there's no turn to check. Push ${name(i)}.`));
          st.push(i);
          break;
        }
      }
    }
    return st;
  };

  const lower = scan(range(n), [], 'Lower hull', 'lower');
  frames.push(frame(W, H, draw({ done: new Set(range(n)), kept: lower, stack: lower, stackCls: () => 'good' }),
    `Lower hull: ${lower.map(name).join(' → ')}. Every point was pushed once and popped at most once.`));
  const upper = scan(range(n).reverse(), lower, 'Upper hull, right to left', 'upper');
  frames.push(frame(W, H, draw({ done: new Set(range(n)), kept: [...lower, ...upper.slice(1)], stack: upper, stackCls: () => 'good' }),
    `Upper hull: ${upper.map(name).join(' → ')}. Together with the lower hull it goes all the way round.`));
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  const outside = range(n).filter((i) => !hull.includes(i));
  frames.push(frame(W, H, area(hull.map(P), 'good') + draw({ done: new Set(hull), focus: [], kept: [...hull, hull[0]], stack: hull, stackCls: () => 'good' }),
    `Hull: ${hull.map(name).join(', ')}. Points ${outside.map(name).join(', ')} are inside or on an edge. O(n log n) to sort, O(n) per scan. Popping only on cross < 0 keeps collinear points, but then input that is all on one line comes back with its middle points twice.`));
  return [{ title: 'Convex hull', frames }];
}

export default {
  'answer-search': answerSearch,
  geometry,
  'convex-hull': convexHull,
};
