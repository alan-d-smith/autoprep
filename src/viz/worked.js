// Pictures for each stage's worked problem. Like the stage diagrams, every frame comes from running
// the real solution, here on the problem's own sample, so the slides can't disagree with it.

import prefixSums from './worked/prefix-sums.js';
import differenceArrays from './worked/difference-arrays.js';
import dpBasics from './worked/dp-basics.js';
import lis from './worked/lis.js';
import lcs from './worked/lcs.js';
import knapsack from './worked/knapsack.js';
import intervalDp from './worked/interval-dp.js';
import bitmaskDp from './worked/bitmask-dp.js';
import dpStructures from './worked/dp-structures.js';
import dfs from './worked/dfs.js';
import bfs from './worked/bfs.js';
import trees from './worked/trees.js';
import dsuMst from './worked/dsu-mst.js';
import topo from './worked/topo.js';
import shortestPaths from './worked/shortest-paths.js';
import binaryLifting from './worked/binary-lifting.js';
import answerSearch from './worked/answer-search.js';
import geometry from './worked/geometry.js';
import convexHull from './worked/convex-hull.js';

export const WORKED_VISUALS = {
  'prefix-sums': prefixSums,
  'difference-arrays': differenceArrays,
  'dp-basics': dpBasics,
  lis,
  lcs,
  knapsack,
  'interval-dp': intervalDp,
  'bitmask-dp': bitmaskDp,
  'dp-structures': dpStructures,
  dfs,
  bfs,
  trees,
  'dsu-mst': dsuMst,
  topo,
  'shortest-paths': shortestPaths,
  'binary-lifting': binaryLifting,
  'answer-search': answerSearch,
  geometry,
  'convex-hull': convexHull,
};
