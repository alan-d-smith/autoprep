// Liquid glass for the nav: a refraction map drawn per element size and fed to an SVG
// displacement filter on the backdrop (Chromium), plus the sliding lens under the active tab.

export const GLASS = {
  refraction: { strength: 0.14, depth: 0.35, curvature: 0.5, dispersion: 0.2 },
  edge: { bend: 0.6, width: 0.3 },
  sheen: { intensity: 1.2, thickness: 3.5, specular: 1.6, angle: 0 },
  glow: 0.1,
  frost: 1,
  brightness: 0,
};

const SVG_NS = 'http://www.w3.org/2000/svg';

// Signed distance from (x, y) to a rounded rectangle centred at (cx, cy); negative inside.
function roundedRectDistance(x, y, cx, cy, hw, hh, r) {
  const qx = Math.abs(x - cx) - (hw - r);
  const qy = Math.abs(y - cy) - (hh - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

// Encodes, per pixel, where to sample the backdrop from: R and G hold x and y offsets around 128.
// Near the rim the surface curves away, so light bends inward along the edge normal ("bend" over
// an "edge width" band, shaped by "curvature"); across the body a gentle lens pulls towards the
// centre ("strength").
function refractionMap(w, h, params) {
  const { strength, curvature } = params.refraction;
  const { bend, width } = params.edge;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, h);
  const cx = w / 2, cy = h / 2, hw = w / 2, hh = h / 2, r = Math.min(hw, hh);
  const band = Math.max(1, width * Math.min(w, h));
  const falloff = 1 + curvature * 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5, py = y + 0.5;
      const d = -roundedRectDistance(px, py, cx, cy, hw, hh, r);
      // Outward normal from the distance field's gradient.
      const gx = roundedRectDistance(px + 0.5, py, cx, cy, hw, hh, r) - roundedRectDistance(px - 0.5, py, cx, cy, hw, hh, r);
      const gy = roundedRectDistance(px, py + 0.5, cx, cy, hw, hh, r) - roundedRectDistance(px, py - 0.5, cx, cy, hw, hh, r);
      const gl = Math.hypot(gx, gy) || 1;
      const t = Math.min(1, Math.max(0, d / band));
      const rim = bend * (1 - t) ** falloff;
      let vx = -(gx / gl) * rim - ((px - cx) / hw) * strength;
      let vy = -(gy / gl) * rim - ((py - cy) / hh) * strength;
      vx = Math.max(-1, Math.min(1, vx));
      vy = Math.max(-1, Math.min(1, vy));
      const i = (y * w + x) * 4;
      img.data[i] = Math.round(128 + vx * 127);
      img.data[i + 1] = Math.round(128 + vy * 127);
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

function el(name, attrs) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// (Re)builds filter #id for an element of size w×h: displacement per colour channel for dispersion.
function buildFilter(id, w, h, params = GLASS) {
  const filter = document.getElementById(id);
  if (!filter || !w || !h) return;
  const scale = 2 * params.refraction.depth * h;
  // Each colour channel is displaced a little more or less than the last: a thin spectral fringe at the rim.
  const spread = params.refraction.dispersion * 0.25;
  filter.replaceChildren();
  for (const [k, v] of Object.entries({ x: 0, y: 0, width: w, height: h, filterUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' })) filter.setAttribute(k, v);
  filter.append(el('feImage', { href: refractionMap(w, h, params), x: 0, y: 0, width: w, height: h, preserveAspectRatio: 'none', result: 'map' }));
  const channels = [['r', 1 + spread, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'], ['g', 1, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'], ['b', 1 - spread, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0']];
  for (const [c, k, matrix] of channels) {
    filter.append(el('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: scale * k, xChannelSelector: 'R', yChannelSelector: 'G', result: `d${c}` }));
    filter.append(el('feColorMatrix', { in: `d${c}`, type: 'matrix', values: matrix, result: c }));
  }
  filter.append(el('feBlend', { in: 'r', in2: 'g', mode: 'screen', result: 'rg' }));
  filter.append(el('feBlend', { in: 'rg', in2: 'b', mode: 'screen' }));
}

// Keeps a filter's map matched to an element's size.
export function glassFor(element, filterId) {
  let size = '';
  const update = () => {
    const w = Math.round(element.offsetWidth), h = Math.round(element.offsetHeight);
    if (`${w}x${h}` === size) return;
    size = `${w}x${h}`;
    buildFilter(filterId, w, h);
  };
  new ResizeObserver(update).observe(element);
  update();
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Slides the lens from its current tab to `target`. The lens is given the target's real size (so its
// refraction map is exact when it lands) and the move is animated with transforms only, stretching
// between the two tabs like a drop of liquid on the way.
export function moveLens(lens, target, { instant = false } = {}) {
  const x1 = target.offsetLeft, w1 = target.offsetWidth, h = target.offsetHeight;
  const from = lens.dataset.x ? { x: Number(lens.dataset.x), w: Number(lens.dataset.w) } : null;
  lens.dataset.x = x1;
  lens.dataset.w = w1;
  lens.style.width = `${w1}px`;
  lens.style.height = `${h}px`;
  lens.style.transform = `translateX(${x1}px)`;
  lens.style.opacity = '1';
  buildFilter('glass-lens', w1, h);
  if (instant || !from || (from.x === x1 && from.w === w1)) return;

  const start = `translateX(${from.x}px) scaleX(${from.w / w1})`;
  const end = `translateX(${x1}px) scaleX(1)`;
  lens.getAnimations().forEach((a) => a.cancel());
  if (reducedMotion.matches) {
    lens.animate([{ transform: start }, { transform: end }], { duration: 220, easing: 'ease-out' });
    return;
  }
  // Mid-way the trailing edge lags and the leading edge runs ahead, then it settles with a small overshoot.
  const right = x1 > from.x;
  const lead = right ? x1 + w1 : x1;
  const trail = right ? from.x : from.x + from.w;
  const [midLeft, midRight] = right ? [trail + (lead - trail) * 0.3, lead] : [lead, trail - (trail - lead) * 0.3];
  const mid = `translateX(${midLeft}px) scaleX(${(midRight - midLeft) / w1}) scaleY(0.9)`;
  lens.animate(
    [
      { transform: start, easing: 'cubic-bezier(0.4, 0, 0.7, 0.4)' },
      { transform: mid, offset: 0.42, easing: 'cubic-bezier(0.2, 1.35, 0.45, 1)' },
      { transform: end },
    ],
    { duration: 560 },
  );
}
