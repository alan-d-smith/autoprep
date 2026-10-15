// Step-through diagrams for each path stage. Every frame is produced by running the real
// algorithm on a small example, so the pictures can't disagree with the maths.

import arrays from './stages/arrays.js';
import tables from './stages/tables.js';
import traversal from './stages/traversal.js';
import paths from './stages/paths.js';
import geometry from './stages/geometry.js';

export const STAGE_VISUALS = { ...arrays, ...tables, ...traversal, ...paths, ...geometry };
