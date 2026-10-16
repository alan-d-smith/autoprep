// One picture per mental-maths method, drawn for whatever example is on screen: columns and
// carries, number lines, dot arrays, area models, and decimal points lined up. Each picture splits
// the question exactly as the worked steps in src/math/skills.js do, using the same helpers.

import { svg, text, arrow } from './draw.js';
import { parseDecimal, formatDecimal, alignDecimals } from '../math/zetamac.js';
import {
  placeParts, stripZeros, zerosWord, mulCore, leadingCarry, roundUpBy, factAnchor, divCore,
  PLACE_NAMES, inPlaces, withPoint, decDivPlan,
} from '../math/skills.js';

// Approximate character widths of the monospace diagram text (22px .v-big and 12px .v-note).
const BIG_CHAR = 13.4, NOTE_CHAR = 7.4;

// Column addition, right to left, with the carries written above.
function columns(x, y) {
  const w = 30, cols = Math.max(String(x).length, String(y).length) + 1;
  const left = 60, W = left + cols * w + 30, H = 160;
  const digit = (n, i) => { const s = String(n); const k = s.length - 1 - i; return k >= 0 ? s[k] : ''; };
  let out = '', carry = 0;
  const sum = String(x + y);
  for (let i = 0; i < cols; i++) {
    const cx = left + (cols - 1 - i) * w + w / 2;
    const dx = Number(digit(x, i) || 0), dy = Number(digit(y, i) || 0);
    if (carry) out += text(cx, 18, '1', 'v-note bad');
    const total = dx + dy + carry;
    carry = total >= 10 && i < cols - 1 ? 1 : 0;
    out += text(cx, 44, digit(x, i), 'v-big') + text(cx, 76, digit(y, i), 'v-big');
    const s = sum.length - 1 - i;
    if (s >= 0) out += text(cx, 124, sum[s], `v-big ${carry ? 'good' : ''}`);
  }
  out += text(left - 18, 76, '+', 'v-big') + `<path class="v-axis" d="M${left - 30} 98 H${left + cols * w}"/>`;
  return svg(W, H, out, `${x} + ${y} in columns`);
}

// Shares `room` px between gaps in proportion to their size, but gives every gap at least `min`.
function spread(gaps, room, min) {
  const fixed = new Set();
  for (;;) {
    const free = gaps.reduce((s, g, i) => (fixed.has(i) ? s : s + g), 0);
    const left = room - fixed.size * min;
    const widths = gaps.map((g, i) => (fixed.has(i) ? min : (g / free) * left));
    const short = gaps.map((_, i) => i).filter((i) => !fixed.has(i) && widths[i] < min);
    if (!short.length) return widths;
    short.forEach((i) => fixed.add(i));
    if (fixed.size === gaps.length) return gaps.map(() => room / gaps.length);
  }
}

// A number line with labelled hops. Like an empty number line it isn't to scale: each gap between
// marked points is at least MIN_GAP wide, so a hop of 1 beside a hop of 30 is still visible.
// points: [value, cls]; moves: [from, to, label, cls].
function hops(points, moves, label) {
  const values = [...new Set(points.map(([v]) => v))].sort((a, b) => a - b);
  const W = 460, x0 = 40, x1 = W - 40, y = 84, H = 118, MIN_GAP = 64;
  const widths = spread(values.slice(1).map((v, i) => v - values[i]), x1 - x0, MIN_GAP);
  const X = new Map(values.map((v, i) => [v, x0 + widths.slice(0, i).reduce((a, b) => a + b, 0)]));
  const base = y - 8;
  // Each hop is an arc whose control point sits `lift` above the line, so its peak is lift / 2 up.
  const arcs = moves.map(([a, b, lab, cls]) => ({ xa: X.get(a), xb: X.get(b), lift: 0.4 * Math.min(Math.abs(X.get(b) - X.get(a)), 150), lab, cls }));
  const arcY = (arc, at) => { const t = (at - arc.xa) / (arc.xb - arc.xa); return base - 2 * t * (1 - t) * arc.lift; };
  let out = `<path class="v-axis" d="M${x0 - 20} ${y} H${x1 + 20}"/>`;
  for (const [v, cls] of points) out += `<path class="v-tick ${cls}" d="M${X.get(v)} ${y - 6} V${y + 6}"/>` + text(X.get(v), y + 20, v, `v-note ${cls}`);
  for (const arc of arcs) {
    out += arrow(arc.xa, base, arc.xb, base, arc.cls, arc.lift / (0.25 * (arc.xb - arc.xa)));
    // Above its own arc, and above any other arc passing under the label.
    const mid = (arc.xa + arc.xb) / 2;
    let ly = base - arc.lift / 2 - 10;
    for (const other of arcs) {
      if (other === arc) continue;
      const [lo, hi] = [Math.min(other.xa, other.xb), Math.max(other.xa, other.xb)];
      if (mid > lo + 2 && mid < hi - 2) ly = Math.min(ly, arcY(other, mid) - 11);
    }
    out += text(mid, ly, arc.lab, `v-note ${arc.cls}`);
  }
  return svg(W, H, out, label);
}

// Hops forward (add) or back (subtract) by each place of b, biggest first, marking every landing point.
function placeHops(a, b, sign) {
  let at = a;
  const points = [[a, '']];
  const moves = placeParts(b).map((p, i, parts) => {
    const move = [at, at + sign * p, `${sign > 0 ? '+' : '−'}${p}`, 'hl'];
    at += sign * p;
    points.push([at, i === parts.length - 1 ? 'good' : '']);
    return move;
  });
  return hops(points, moves, `${a} ${sign > 0 ? '+' : '−'} ${b}`);
}

// Rows of dots, n to a row, in blocks: [rows, cls, label]. `whole` brackets every row with a label.
function dotBlocks(n, blocks, whole) {
  const step = 20, gap = 8, top = 12;
  const rows = blocks.reduce((s, [r]) => s + r, 0);
  const labelW = Math.max(...blocks.map(([, , l]) => String(l).length)) * NOTE_CHAR;
  const contentW = n * step + 14 + labelW + (whole != null ? 26 + String(whole).length * NOTE_CHAR : 0);
  const W = Math.max(360, contentW + 40), left = (W - contentW) / 2;
  const right = left + n * step;
  let out = '', yy = top;
  for (const [r, cls, label] of blocks) {
    const y0 = yy;
    for (let i = 0; i < r; i++, yy += step) {
      for (let j = 0; j < n; j++) out += `<circle class="v-dot ${cls}" cx="${left + step / 2 + j * step}" cy="${yy + step / 2}" r="6"/>`;
    }
    if (label !== '') out += text(right + 14, (y0 + yy) / 2, label, `v-note ${cls}`, 'start');
    yy += gap;
  }
  const bottom = yy - gap;
  if (whole != null) {
    const bx = right + 14 + labelW + 12;
    out += `<path class="v-bracket" d="M${bx} ${top + 2} h6 V${bottom - 2} h-6"/>` + text(bx + 14, (top + bottom) / 2, whole, 'v-note hl', 'start');
  }
  return svg(W, bottom + top, out, `${rows} rows of ${n}`);
}

// m lots of n, drawn as m rows of n dots split the way the steps rebuild the fact from an anchor.
const FACT_PICTURES = {
  2: (n) => ({ blocks: [[1, '', n], [1, 'hl', `+ ${n}`]], caption: `2 rows of ${n}: a second row (blue) doubles the first, making ${2 * n}` }),
  3: (n) => ({ blocks: [[2, 'good', 2 * n], [1, 'hl', `+ ${n}`]], caption: `3 rows of ${n}: 2 rows (green) are double ${n}, ${2 * n}, and one more row (blue) makes ${3 * n}` }),
  4: (n) => ({ blocks: [[2, 'good', 2 * n], [2, 'hl', `+ ${2 * n}`]], caption: `4 rows of ${n}: 2 rows (green) are double ${n}, ${2 * n}, and doubling again (blue) makes ${4 * n}` }),
  5: (n) => ({ blocks: [[5, 'good', 5 * n], [5, 'dim', '']], whole: 10 * n, caption: `10 rows of ${n} make ${10 * n}; the 5 rows you need (green) are half of that: ${5 * n}` }),
  6: (n) => ({ blocks: [[5, 'good', 5 * n], [1, 'hl', `+ ${n}`]], caption: `6 rows of ${n}: 5 rows (green) are ${5 * n}, and one more row (blue) makes ${6 * n}` }),
  7: (n) => ({ blocks: [[5, 'good', 5 * n], [2, 'hl', `+ ${2 * n}`]], caption: `7 rows of ${n}: 5 rows (green) are ${5 * n}, and 2 more rows (blue) are ${2 * n}, making ${7 * n}` }),
  8: (n) => ({ blocks: [[1, '', n], [1, 'good', `+ ${n}`], [2, 'hl', `+ ${2 * n}`], [4, 'good', `+ ${4 * n}`]], caption: `8 rows of ${n}: each doubling adds a copy of all the rows so far (green, then blue, then green), making ${2 * n}, ${4 * n}, then ${8 * n}` }),
  9: (n) => ({ blocks: [[9, 'good', 9 * n], [1, 'bad', `− ${n}`]], whole: 10 * n, caption: `10 rows of ${n} make ${10 * n}; take one row away (red) to leave 9 rows: ${9 * n}` }),
  11: (n) => ({ blocks: [[10, 'good', 10 * n], [1, 'hl', `+ ${n}`]], caption: `11 rows of ${n}: 10 rows (green) are ${10 * n}, and one more row (blue) makes ${11 * n}` }),
  12: (n) => ({ blocks: [[10, 'good', 10 * n], [2, 'hl', `+ ${2 * n}`]], caption: `12 rows of ${n}: 10 rows (green) are ${10 * n}, and 2 more rows (blue) are ${2 * n}, making ${12 * n}` }),
};

// An area model: rows × columns of parts, each rectangle labelled with its product. With
// `widthsAnswer`, the column widths are the answer's parts and are shown in green.
function area(rowsParts, colsParts, widthsAnswer = false) {
  const totalW = colsParts.reduce((a, b) => a + b, 0), totalH = rowsParts.reduce((a, b) => a + b, 0);
  const maxW = 360, maxH = 150, left = 70, top = 34;
  const scaleW = (v) => Math.max(48, (v / totalW) * maxW);
  const scaleH = (v) => Math.max(34, (v / totalH) * maxH);
  let out = '', yy = top, xx = left;
  rowsParts.forEach((r, ri) => {
    xx = left;
    const h = scaleH(r);
    out += text(left - 12, yy + h / 2, r, 'v-note', 'end');
    colsParts.forEach((c, ci) => {
      const w = scaleW(c);
      if (ri === 0) out += text(xx + w / 2, top - 14, c, `v-note ${widthsAnswer ? 'good' : ''}`);
      out += `<g class="v-cell ${(ri + ci) % 2 ? 'hl' : 'good'}"><rect x="${xx + 1}" y="${yy + 1}" width="${w - 2}" height="${h - 2}" rx="5"/>${text(xx + w / 2, yy + h / 2, r * c)}</g>`;
      xx += w;
    });
    yy += h;
  });
  return svg(Math.max(460, xx + 20), yy + 16, out, 'area model');
}

// Two decimals stacked with their points lined up. Zeros that aren't in the number as written are
// dimmed: the padding on the question's numbers, and any zeros at the end of the answer.
function aligned(x, y, op) {
  const [a, b, p] = alignDecimals(x, y);
  const r = op === 'fadd' ? a + b : a - b;
  const split = (units) => { const str = String(units).padStart(p + 1, '0'); return [str.slice(0, str.length - p), str.slice(str.length - p)]; };
  const places = (v) => (String(v).split('.')[1] || '').length;
  const rows = [[...split(a), places(x)], [...split(b), places(y)], [...split(r), places(formatDecimal(r, p))]];
  const cw = 24, intW = Math.max(...rows.map(([w]) => w.length)), pointX = 90 + intW * cw;
  let out = '';
  rows.forEach(([w, f, real], i) => {
    const yy = 30 + i * 40 + (i === 2 ? 14 : 0);
    const cls = i === 2 ? 'good' : '';
    [...w].forEach((d, k) => { out += text(pointX - (w.length - k) * cw + cw / 2, yy, d, `v-big ${cls}`); });
    if (p) out += text(pointX + 4, yy, '.', 'v-big bad');
    [...f].forEach((d, k) => { out += text(pointX + 10 + k * cw + cw / 2, yy, d, `v-big ${k >= real ? 'pad' : cls}`); });
  });
  out += text(50, 70, op === 'fadd' ? '+' : '−', 'v-big') + `<path class="v-axis" d="M40 100 H${pointX + 20 + p * cw}"/>`;
  return svg(pointX + 40 + p * cw, 170, out, 'decimal points lined up');
}

// Rewrites, one per line: from → to, with a short note. Positions follow the longest text in each column.
function shiftPicture(lines) {
  const longest = (k) => Math.max(...lines.map((l) => l[k].length));
  const fromX = 10 + longest(0) * BIG_CHAR, toX = fromX + 100, noteX = toX + longest(1) * BIG_CHAR + 24;
  const W = Math.max(460, noteX + longest(2) * NOTE_CHAR + 10), H = 34 + lines.length * 44;
  let out = '';
  lines.forEach(([from, to, note], i) => {
    const yy = 30 + i * 44;
    out += text(fromX, yy, from, 'v-big', 'end') + arrow(fromX + 20, yy, fromX + 80, yy, 'hl') + text(toX, yy, to, 'v-big good', 'start');
    if (note) out += text(noteX, yy, note, 'v-note', 'start');
  });
  return svg(W, H, out, 'moving the decimal point');
}

// "31.0 = 31" when the point leaves zeros at the end that can go, else just the number. `drop`
// names those zeros for a caption: "The zero at the end" or "The zeros at the end".
function pointed(units, places) {
  const full = withPoint(units, places), short = formatDecimal(units, places);
  const zeros = full === short ? 0 : full.match(/0+$/)[0].length;
  return { full, short, text: zeros ? `${full} = ${short}` : short, drop: zeros ? `The ${zeros === 1 ? 'zero' : 'zeros'} at the end` : '' };
}

export function mathPicture(skillId, q) {
  const { x, y } = q;
  switch (skillId) {
    case 'add-basic': {
      const [a, b] = x >= y ? [x, y] : [y, x];
      const lead = leadingCarry(x, y);
      const hopsText = placeParts(b).length > 1 ? `hop forward by each place of ${b}, biggest first` : `hop forward ${b}`;
      return {
        svg: placeHops(a, b, 1),
        caption: `Start at ${a} and ${hopsText}.${lead ? ` The ${lead.place}, ${lead.digits.join(' and ')}, make ${lead.sum}, but they are the leftmost column, so nothing is carried: ${lead.sum} is written as it is.` : ''}`,
      };
    }
    case 'add-carry':
      return { svg: columns(x, y), caption: 'Right to left: a column that makes 10 or more writes its last digit (green) and carries 1 (red) into the next column.' };
    case 'sub-basic': {
      const many = placeParts(y).length > 1;
      return { svg: placeHops(x, y, -1), caption: many ? 'Hop back by each place of the number you take away, biggest first.' : `Hop back ${y} in one go.` };
    }
    case 'sub-borrow': {
      const up = roundUpBy(y);
      return { svg: hops([[x, ''], [x - y - up, ''], [x - y, 'good']], [[x, x - y - up, `−${y + up}`, 'hl'], [x - y - up, x - y, `+${up}`, 'good']], `${x} − ${y}`), caption: `Hop back a round ${y + up}, then forward the ${up} you over-did.` };
    }
    case 'sub-cross': {
      if (x === 100) return { svg: hops([[y, ''], [100, 'hl']], [[y, 100, `${100 - y}`, 'hl']], `${x} − ${y}`), caption: `The gap from ${y} up to 100 is ${100 - y}.` };
      // Bridge at the hundred below x; a whole number of hundreds is bridged at 100, as the steps do (300 − 48).
      const h = Math.floor(x / 100) * 100;
      const via = x === h ? 100 : h;
      return { svg: hops([[y, ''], [via, 'hl'], [x, '']], [[y, via, `${via - y}`, 'hl'], [via, x, `${x - via}`, 'good']], `${x} − ${y}`), caption: `The gap from ${y} up to ${x} is ${via - y} to reach ${via}, plus ${x - via} more: ${x - y}.` };
    }
    case 'mul-facts': {
      const { small, big, zeros } = mulCore(x, y);
      const [m, n] = factAnchor(small, big);
      const tail = zeros ? ` Then put back ${zeros === 1 ? 'the zero' : `${zeros} zeros`}: ${x * y}.` : '';
      const fact = FACT_PICTURES[m]?.(n);
      if (!fact) return { svg: dotBlocks(n, [[m, 'good', m * n]]), caption: `${m} rows of ${n} = ${m * n}.${tail}` };
      return { svg: dotBlocks(n, fact.blocks, fact.whole), caption: `${fact.caption}.${tail}` };
    }
    case 'mul-split':
    case 'mul-1112':
    case 'mul-2x2': {
      const { small, big, zeros } = mulCore(x, y);
      const tail = zeros ? ` Then put back ${zeros === 1 ? 'the zero' : `${zeros} zeros`}: ${x * y}.` : '';
      if (skillId === 'mul-1112') {
        return { svg: area([10, small - 10], [big]), caption: `${small} = 10 + ${small - 10}: ${big} × 10 plus ${big} × ${small - 10} = ${small * big}.${tail}` };
      }
      if (skillId === 'mul-2x2') {
        const rows = placeParts(small);
        return { svg: area(rows, [big]), caption: `Split ${small} into ${rows.join(' + ')}: ${rows.map((r) => `${r} × ${big}`).join(' plus ')}, a total area of ${small * big}.${tail}` };
      }
      const cols = placeParts(big);
      return { svg: area([small], cols), caption: `Split ${big} into ${cols.join(' + ')}: the answer is the total area, ${small * big}.${tail}` };
    }
    case 'div-facts': {
      const core = divCore(x, y);
      const [q1, qz] = stripZeros(core.q);
      const inner = core.x / 10 ** qz;
      const cancelled = core.dz ? `With ${zerosWord(core.dz)} cancelled from both, ` : '';
      const width = qz ? `${q1}, so with ${qz === 1 ? 'the zero' : `${qz} zeros`} put back the answer is ${core.q}` : `the answer, ${q1}`;
      return { svg: area([core.d], [q1], true), caption: `${cancelled}${inner} is an area ${core.d} tall; the width that fills it is ${width}.` };
    }
    case 'div-split':
    case 'div-1112':
    case 'div-2x2': {
      const core = divCore(x, y);
      const chunks = placeParts(core.q);
      const cancelled = core.dz ? `With ${zerosWord(core.dz)} cancelled from both, ` : '';
      const rest = chunks.length > 1
        ? `${core.x} is an area ${core.d} tall. Fill it with the widest round chunks that fit; the widths add up to the answer, ${core.q}.`
        : `${core.x} is an area ${core.d} tall; the width that fills it is the answer, ${core.q}.`;
      return { svg: area([core.d], chunks, true), caption: cancelled + rest };
    }
    case 'dec-addsub': {
      const [a, b, p] = alignDecimals(x, y);
      const r = q.op === 'fadd' ? a + b : a - b;
      const padded = parseDecimal(x)[1] < p || parseDecimal(y)[1] < p;
      const res = pointed(r, p);
      return {
        svg: aligned(x, y, q.op),
        caption: `Line the points up${padded ? ' and pad with zeros (dimmed)' : ''} so every number has the same number of decimal places.${res.drop ? ` ${res.drop} of the answer (dimmed) can go: ${res.full} is ${res.short}.` : ''}`,
      };
    }
    case 'dec-mul': {
      const [a, pa] = parseDecimal(x), [b, pb] = parseDecimal(y);
      const res = pointed(a * b, pa + pb);
      return {
        svg: shiftPicture([[`${x} × ${y}`, `${a} × ${b}`, 'ignore the points'], [String(a * b), res.text, `${pa + pb} place${pa + pb === 1 ? '' : 's'} back`]]),
        caption: `Multiply the whole numbers, then give the answer as many decimal places as the question had.${res.drop ? ` ${res.drop}, after the point, can then go: ${res.full} is ${res.short}.` : ''}`,
      };
    }
    case 'dec-div': {
      const { py, dividend, divisor, pq, whole, q: units } = decDivPlan(x, y, q.answer);
      const lines = [];
      if (py) lines.push([`${x} ÷ ${y}`, `${dividend} ÷ ${divisor}`, `points ${py === 1 ? 'one place' : `${py} places`} right`]);
      if (pq) lines.push([`${dividend} ÷ ${divisor}`, `${whole} ÷ ${divisor} = ${units}`, `in ${PLACE_NAMES[pq]}`], [inPlaces(units, pq), String(q.answer), '']);
      else lines.push([`${dividend} ÷ ${divisor}`, String(q.answer), 'divide']);
      const counted = `count in ${PLACE_NAMES[pq]}: ${inPlaces(whole, pq)} ÷ ${divisor} = ${inPlaces(units, pq)}, which is ${q.answer}`;
      let caption;
      if (!py) caption = pq ? `The divisor is already whole, but the answer isn't, so ${counted}.` : `The divisor is already whole: ${dividend} ÷ ${divisor} = ${q.answer}.`;
      else caption =`Moving both points the same way leaves the answer unchanged, so make the divisor whole first${pq ? `. ${dividend} ÷ ${divisor} still isn't whole, so ${counted}` : `: ${dividend} ÷ ${divisor} = ${q.answer}`}.`;
      return { svg: shiftPicture(lines), caption };
    }
    default:
      return null;
  }
}
