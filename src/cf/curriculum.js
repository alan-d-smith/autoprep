// The path: three tracks of stages in learning order. Each stage module (src/cf/stages/*.js) holds its
// primer and Codeforces problems, sorted by rating, each with progressive hints. Names and ratings come
// from the Codeforces API; `npm run verify:curriculum` re-checks them.

import prefixSums from './stages/prefix-sums.js';
import differenceArrays from './stages/difference-arrays.js';
import dpBasics from './stages/dp-basics.js';
import lis from './stages/lis.js';
import lcs from './stages/lcs.js';
import knapsack from './stages/knapsack.js';
import intervalDp from './stages/interval-dp.js';
import bitmaskDp from './stages/bitmask-dp.js';
import dpStructures from './stages/dp-structures.js';
import dfs from './stages/dfs.js';
import bfs from './stages/bfs.js';
import trees from './stages/trees.js';
import dsuMst from './stages/dsu-mst.js';
import topo from './stages/topo.js';
import shortestPaths from './stages/shortest-paths.js';
import binaryLifting from './stages/binary-lifting.js';
import answerSearch from './stages/answer-search.js';
import geometry from './stages/geometry.js';
import convexHull from './stages/convex-hull.js';

export const TRACKS = [
  { id: 'dp', title: 'Dynamic programming', stages: [prefixSums, differenceArrays, dpBasics, lis, lcs, knapsack, intervalDp, bitmaskDp, dpStructures] },
  { id: 'graphs', title: 'Graphs', stages: [dfs, bfs, trees, dsuMst, topo, shortestPaths, binaryLifting] },
  { id: 'geometry', title: 'Geometry and searching the answer', stages: [answerSearch, geometry, convexHull] },
].map((track) => ({ ...track, stages: track.stages.map((s) => s.id) }));

export const TIERS = { warmup: 'Warm-up', core: 'Core', challenge: 'Challenge' };

export const STAGES = [
  prefixSums, differenceArrays, dpBasics, lis, lcs, knapsack, intervalDp, bitmaskDp, dpStructures,
  dfs, bfs, trees, dsuMst, topo, shortestPaths, binaryLifting,
  answerSearch, geometry, convexHull,
];

export const stageById = Object.fromEntries(STAGES.map((s) => [s.id, s]));
