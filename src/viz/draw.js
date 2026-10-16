// Small SVG drawing helpers shared by every diagram. Everything returns markup strings; colours
// come from CSS classes (see "Diagrams" in styles.css) so diagrams follow the theme.
//
// Class vocabulary: hl = being looked at now (blue), good = kept or done (green), bad = rejected
// or conflicting (red), wait = queued or pending (amber), dim = not relevant yet.

const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function svg(width, height, body, label) {
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">${body}</svg>`;
}

export function text(x, y, value, cls = '', anchor = 'middle') {
  return `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}" dominant-baseline="central">${esc(value)}</text>`;
}

// A labelled row of boxes. `cls(i)` gives each box its state class; `index` draws indices underneath.
export function row(values, { x = 0, y = 0, size = 34, gap = 4, cls = () => '', name = '', index = false, indexFrom = 0 } = {}) {
  let out = name ? text(x - 10, y + size / 2, name, 'v-name', 'end') : '';
  values.forEach((v, i) => {
    const cx = x + i * (size + gap);
    out += `<g class="v-cell ${cls(i)}"><rect x="${cx}" y="${y}" width="${size}" height="${size}" rx="6"/>${v === '' || v == null ? '' : text(cx + size / 2, y + size / 2, v)}</g>`;
    if (index) out += text(cx + size / 2, y + size + 11, i + indexFrom, 'v-idx');
  });
  return out;
}

export const cellX = (i, { x = 0, size = 34, gap = 4 } = {}) => x + i * (size + gap);

// A bracket under (or over) boxes i..j of a row, with a label.
export function span(i, j, label, { x = 0, y = 0, size = 34, gap = 4, cls = 'hl', up = false } = {}) {
  const x1 = cellX(i, { x, size, gap }) + 2, x2 = cellX(j, { x, size, gap }) + size - 2;
  const d = up ? -6 : 6;
  return `<path class="v-bracket ${cls}" d="M${x1} ${y} v${d} H${x2} v${-d}"/>${label ? text((x1 + x2) / 2, y + (up ? -16 : 16), label, `v-note ${cls}`) : ''}`;
}

// The arrowhead (a <marker> in index.html) for a line of state class `cls`. Markers don't take the
// line's CSS, so a dimmed line needs its own faint arrowhead, or a deleted edge still looks live.
export const arrowHead = (cls) => ({ hl: 'v-arrow-hl', good: 'v-arrow-good', bad: 'v-arrow-bad', dim: 'v-arrow-dim' })[cls] || 'v-arrow';

export function arrow(x1, y1, x2, y2, cls = '', curve = 0) {
  const mx = (x1 + x2) / 2 + curve * (y2 - y1) * 0.25, my = (y1 + y2) / 2 - curve * (x2 - x1) * 0.25;
  return `<path class="v-link ${cls}" d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" marker-end="url(#${arrowHead(cls)})"/>`;
}

// A table with row and column headers. `cell(r, c)` returns { v, cls }.
export function table(rows, cols, cell, { x = 0, y = 0, size = 30, rowHead = [], colHead = [] } = {}) {
  let out = '';
  colHead.forEach((h, c) => { out += text(x + c * size + size / 2, y - 12, h, 'v-head'); });
  rowHead.forEach((h, r) => { out += text(x - 10, y + r * size + size / 2, h, 'v-head', 'end'); });
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const { v = '', cls = '' } = cell(r, c) || {};
      out += `<g class="v-cell ${cls}"><rect x="${x + c * size + 1}" y="${y + r * size + 1}" width="${size - 2}" height="${size - 2}" rx="4"/>${v === '' ? '' : text(x + c * size + size / 2, y + r * size + size / 2, v)}</g>`;
    }
  }
  return out;
}

// Nodes at fixed positions joined by edges. nodes: { id: [x, y] }; edges: [a, b, label?].
export function graph(nodes, edges, { nodeCls = () => '', edgeCls = () => '', nodeText = (id) => id, nodeNote = () => '', directed = false, r = 15, weightAt = 0.5 } = {}) {
  let out = '';
  edges.forEach(([a, b, w], i) => {
    const [x1, y1] = nodes[a], [x2, y2] = nodes[b];
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const sx = x1 + ux * r, sy = y1 + uy * r, ex = x2 - ux * (r + (directed ? 3 : 0)), ey = y2 - uy * (r + (directed ? 3 : 0));
    const cls = edgeCls(a, b, i);
    const marker = directed ? ` marker-end="url(#${arrowHead(cls)})"` : '';
    out += `<line class="v-edge ${cls}" x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}"${marker}/>`;
    if (w !== undefined) {
      const mx = x1 + (x2 - x1) * weightAt - uy * 11, my = y1 + (y2 - y1) * weightAt + ux * 11;
      out += text(mx, my, w, `v-weight ${cls}`);
    }
  });
  for (const [id, [x, y]] of Object.entries(nodes)) {
    out += `<g class="v-node ${nodeCls(id)}"><circle cx="${x}" cy="${y}" r="${r}"/>${text(x, y, nodeText(id))}</g>`;
    const note = nodeNote(id);
    if (note !== '' && note != null) out += text(x, y - r - 10, note, 'v-note');
  }
  return out;
}

export function polyline(points, cls = '', close = false) {
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ') + (close ? ' Z' : '');
  return `<path class="v-line ${cls}" d="${d}"/>`;
}

export function dot(x, y, cls = '', r = 4) {
  return `<circle class="v-dot ${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
}

export function legend(items, { x = 0, y = 0 } = {}) {
  let out = '', cx = x;
  for (const [cls, label] of items) {
    out += `<g class="v-cell ${cls}"><rect x="${cx}" y="${y - 6}" width="12" height="12" rx="3"/></g>${text(cx + 18, y, label, 'v-legend', 'start')}`;
    cx += 30 + label.length * 6.6;
  }
  return out;
}
