// Shared by the stage diagrams: a frame is one picture plus the caption under it.

import { svg } from '../draw.js';

export const frame = (w, h, body, caption, label) => ({ svg: svg(w, h, body, label || caption), caption });
export const prefix = (a) => a.reduce((p, v) => [...p, p.at(-1) + v], [0]);
export const range = (n) => [...Array(n).keys()];
