// One picture per mental-maths method, drawn for whatever example is on screen: columns and
// carries, number lines, area models, and decimal points lined up.

import { svg, text, arrow } from './draw.js';
import { parseDecimal, formatDecimal, alignDecimals } from '../math/zetamac.js';

function stripZeros(n) {
  let zeros = 0;
  while (n >= 10 && n % 10 === 0) { n /= 10; zeros++; }
  return [n, zeros];
}

function placeParts(n) {
  const parts = [];
  for (let p = 1; n > 0; p *= 10, n = Math.floor(n / 10)) if (n % 10) parts.unshift((n % 10) * p);
  return parts;
}

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

// A number line with labelled hops.
function hops(points, moves, label) {
  const lo = Math.min(...points.map((p) => p[0])), hi = Math.max(...points.map((p) => p[0]));
  const pad = (hi - lo) * 0.08 || 1;
  const W = 460, H = 140, x0 = 30, x1 = W - 30, y = 100;
  const X = (v) => x0 + ((v - lo + pad) / (hi - lo + 2 * pad)) * (x1 - x0);
  let out = `<path class="v-axis" d="M${x0} ${y} H${x1}"/>`;
  for (const [v, cls] of points) out += `<path class="v-tick ${cls}" d="M${X(v)} ${y - 6} V${y + 6}"/>` + text(X(v), y + 20, v, `v-note ${cls}`);
  moves.forEach(([a, b, lab, cls]) => {
    out += arrow(X(a), y - 8, X(b), y - 8, cls, a < b ? 1.6 : -1.6);
    out += text((X(a) + X(b)) / 2, y - 14 - Math.abs(X(b) - X(a)) * 0.2, lab, `v-note ${cls}`);
  });
  return svg(W, H, out, label);
}

// An area model: rows × columns of parts, each rectangle labelled with its product.
function area(rowsParts, colsParts, unknownCols = false) {
  const totalW = colsParts.reduce((a, b) => a + b, 0), totalH = rowsParts.reduce((a, b) => a + b, 0);
  const W = 460, maxW = 360, maxH = 150, left = 70, top = 34;
  const scaleW = (v) => Math.max(48, (v / totalW) * maxW);
  const scaleH = (v) => Math.max(34, (v / totalH) * maxH);
  let out = '', yy = top;
  rowsParts.forEach((r, ri) => {
    let xx = left;
    const h = scaleH(r);
    out += text(left - 12, yy + h / 2, r, 'v-note', 'end');
    colsParts.forEach((c, ci) => {
      const w = scaleW(c);
      if (ri === 0) out += text(xx + w / 2, top - 14, unknownCols ? `${c} ?` : c, `v-note ${unknownCols ? 'good' : ''}`);
      out += `<g class="v-cell ${(ri + ci) % 2 ? 'hl' : 'good'}"><rect x="${xx + 1}" y="${yy + 1}" width="${w - 2}" height="${h - 2}" rx="5"/>${text(xx + w / 2, yy + h / 2, r * c)}</g>`;
      xx += w;
    });
    yy += h;
  });
  return svg(W, yy + 16, out, 'area model');
}

// Two decimals stacked with their points lined up; padding zeros are dimmed.
function aligned(x, y, op) {
  const [a, b, p] = alignDecimals(x, y);
  const r = op === 'fadd' ? a + b : a - b;
  const split = (units) => { const str = String(units).padStart(p + 1, '0'); return [str.slice(0, str.length - p), str.slice(str.length - p)]; };
  const places = (v) => (String(v).split('.')[1] || '').length;
  const rows = [[...split(a), places(x)], [...split(b), places(y)], [...split(r), p]];
  const cw = 24, intW = Math.max(...rows.map(([w]) => w.length)), pointX = 90 + intW * cw;
  let out = '';
  rows.forEach(([w, f, real], i) => {
    const yy = 30 + i * 40 + (i === 2 ? 14 : 0);
    const cls = i === 2 ? 'good' : '';
    [...w].forEach((d, k) => { out += text(pointX - (w.length - k) * cw + cw / 2, yy, d, `v-big ${cls}`); });
    if (p) out += text(pointX + 4, yy, '.', 'v-big bad');
    [...f].forEach((d, k) => { out += text(pointX + 10 + k * cw + cw / 2, yy, d, `v-big ${cls} ${k >= real ? 'pad' : ''}`); });
  });
  out += text(50, 70, op === 'fadd' ? '+' : '−', 'v-big') + `<path class="v-axis" d="M40 100 H${pointX + 20 + p * cw}"/>`;
  return svg(pointX + 40 + p * cw, 170, out, 'decimal points lined up');
}

// Decimal point moves, shown as the number before and after.
function shiftPicture(lines) {
  const W = 460, H = 34 + lines.length * 44;
  let out = '';
  lines.forEach(([from, to, note], i) => {
    const yy = 30 + i * 44;
    out += text(120, yy, from, 'v-big', 'end') + arrow(140, yy, 200, yy, 'hl') + text(220, yy, to, 'v-big good', 'start') + text(W - 10, yy, note, 'v-note', 'end');
  });
  return svg(W, H, out, 'moving the decimal point');
}

export function mathPicture(skillId, q) {
  const { x, y } = q;
  switch (skillId) {
    case 'add-basic':
    case 'add-carry':
      return { svg: columns(x, y), caption: skillId === 'add-carry' ? 'Right to left: a column that makes 10 or more writes its last digit and carries 1 (red) into the next column.' : 'No column reaches 10, so each digit of the answer is just the two digits added.' };
    case 'sub-basic': {
      const parts = placeParts(y);
      let at = x;
      const moves = parts.map((p) => { const m = [at, at - p, `−${p}`, 'hl']; at -= p; return m; });
      return { svg: hops([[x, ''], [x - y, 'good']], moves, `${x} − ${y}`), caption: 'Hop back by each place of the number you take away, biggest first.' };
    }
    case 'sub-borrow': {
      const up = (10 - (y % 10)) % 10;
      return { svg: hops([[x, ''], [x - y - up, ''], [x - y, 'good']], [[x, x - y - up, `−${y + up}`, 'hl'], [x - y - up, x - y, `+${up}`, 'good']], `${x} − ${y}`), caption: `Hop back a round ${y + up}, then forward the ${up} you over-did.` };
    }
    case 'sub-cross': {
      const h = Math.floor(x / 100) * 100;
      return { svg: hops([[y, ''], [h, 'hl'], [x, '']], [[y, h, `${h - y}`, 'hl'], [h, x, `${x - h}`, 'good']], `${x} − ${y}`), caption: `The gap from ${y} up to ${x} is ${h - y} to reach ${h}, plus ${x - h} more: ${x - y}.` };
    }
    case 'mul-facts': {
      const [p, pz] = stripZeros(x), [r, rz] = stripZeros(y);
      const [a, b] = p <= r ? [p, r] : [r, p];
      const W = 40 + b * 20, H = 30 + a * 20;
      let out = '';
      for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) out += `<circle class="v-dot ${j < 5 ? 'good' : 'hl'}" cx="${30 + j * 20}" cy="${20 + i * 20}" r="6"/>`;
      return { svg: svg(Math.max(W, 120), H, out, `${a} rows of ${b}`), caption: `${a} rows of ${b} = ${a * b}${pz + rz ? `, then ${pz + rz === 1 ? 'a zero' : `${pz + rz} zeros`}: ${x * y}` : ''}. Split at 5 (green) when 5 is your anchor.` };
    }
    case 'mul-split':
    case 'mul-1112':
    case 'mul-2x2': {
      const [p, pz] = stripZeros(x), [r, rz] = stripZeros(y);
      const [small, big] = p <= r ? [p, r] : [r, p];
      const zeros = pz + rz;
      const tail = zeros ? `, then ${zeros === 1 ? 'a zero' : `${zeros} zeros`}: ${x * y}` : '';
      if (skillId === 'mul-1112') {
        return { svg: area([10, small - 10], [big]), caption: `${small} = 10 + ${small - 10}: ${big} × 10 plus ${big} × ${small - 10} = ${small * big}${tail}.` };
      }
      const cols = placeParts(big);
      const rowsParts = skillId === 'mul-2x2' ? placeParts(small) : [small];
      return { svg: area(rowsParts, cols), caption: `Split ${big} into ${cols.join(' + ')}${skillId === 'mul-2x2' ? ` and ${small} into ${rowsParts.join(' + ')}` : ''}. The answer is the total area, ${small * big}${tail}.` };
    }
    case 'div-facts':
    case 'div-split':
    case 'div-1112':
    case 'div-2x2': {
      const [d, dz] = stripZeros(y);
      const quotient = x / y;
      const chunks = placeParts(quotient);
      return { svg: area([d], chunks, true), caption: `${x / 10 ** dz} is an area ${d} tall. Fill it with the widest round chunks that fit; the widths add up to the answer, ${quotient}.` };
    }
    case 'dec-addsub':
      return { svg: aligned(x, y, q.op), caption: 'Line the points up and pad with zeros so every number has the same number of decimal places.' };
    case 'dec-mul': {
      const [a, pa] = parseDecimal(x), [b, pb] = parseDecimal(y);
      return { svg: shiftPicture([[`${x} × ${y}`, `${a} × ${b}`, 'ignore the points'], [String(a * b), formatDecimal(a * b, pa + pb), `${pa + pb} place${pa + pb === 1 ? '' : 's'} back`]]), caption: 'Multiply the whole numbers, then give the answer as many decimal places as the question had.' };
    }
    case 'dec-div': {
      const [, py] = parseDecimal(y);
      const shift = (s, k) => { const [u, p] = parseDecimal(s); return p >= k ? formatDecimal(u, p - k) : String(u * 10 ** (k - p)); };
      const lines = [];
      if (py) lines.push([`${x} ÷ ${y}`, `${shift(x, py)} ÷ ${shift(y, py)}`, `both × ${10 ** py}`]);
      lines.push([`${shift(x, py)} ÷ ${shift(y, py)}`, String(q.answer), 'divide']);
      return { svg: shiftPicture(lines), caption: 'Moving both points the same way leaves the answer unchanged; make the divisor whole first.' };
    }
    default:
      return null;
  }
}
