// Short explainer videos for each stage, from well-known channels and kept under half an hour.
// Each was checked with YouTube's oEmbed endpoint (exists, allows embedding, channel as listed);
// lengths are from YouTube's search results.

const v = (id, title, channel, length) => ({ id, title, channel, length });

export const VIDEOS = {
  'prefix-sums': [v('PhgtNY_-CiY', 'Prefix Sums: Problems, Code in C++ and Python', 'Errichto Algorithms', '20:51')],
  'difference-arrays': [v('96RG7EBF8LI', 'Difference Array Technique: Range Updates', 'TLE Eliminators', '11:14')],
  'dp-basics': [v('aPQY__2H3tE', '5 Simple Steps for Solving Dynamic Programming Problems', 'Reducible', '21:27')],
  lis: [v('S9oUiVYEq7E', 'Longest Increasing Subsequence in n log n Time', 'Tushar Roy', '12:03')],
  lcs: [v('NnD96abizww', 'Longest Common Subsequence', 'Tushar Roy', '7:55')],
  knapsack: [v('cJ21moQpofY', '0/1 Knapsack Problem', 'WilliamFiset', '13:29')],
  'interval-dp': [v('vgLJZMUfnsU', 'Matrix Chain Multiplication (interval DP)', 'Tushar Roy', '11:08')],
  'bitmask-dp': [v('bjucBkxrMBs', 'Dynamic Programming with Bitmasks', 'Gaurav Sen', '16:43')],
  'dp-structures': [
    v('RgITNht_f4Q', 'Fenwick Tree Range Queries', 'WilliamFiset', '13:45'),
    v('rwXVCELcrqU', 'Lazy Propagation in Segment Trees', 'take U forward', '21:29'),
  ],
  dfs: [v('7fujbpJ0LB4', 'Depth First Search Algorithm', 'WilliamFiset', '10:20')],
  bfs: [v('KiCBXu4P-2Y', 'Breadth First Search: Grid Shortest Path', 'WilliamFiset', '16:51')],
  trees: [
    v('2FFq2_je7Lg', 'Rooting a Tree', 'WilliamFiset', '5:19'),
    v('0qgaIMqOEVs', 'Beginner Tree Algorithms', 'WilliamFiset', '9:54'),
  ],
  'dsu-mst': [
    v('ibjEGG7ylHk', 'Union Find Introduction', 'WilliamFiset', '5:46'),
    v('JZBQLXgSGfs', "Union Find: Kruskal's Algorithm", 'WilliamFiset', '6:15'),
  ],
  topo: [v('eL-KzMXSXXI', 'Topological Sort Algorithm', 'WilliamFiset', '14:09')],
  'shortest-paths': [
    v('pSqmAO-m7Lk', "Dijkstra's Shortest Path Algorithm", 'WilliamFiset', '24:47'),
    v('4NQ3HnhyNfQ', 'Floyd–Warshall All Pairs Shortest Path', 'WilliamFiset', '15:53'),
  ],
  'binary-lifting': [
    v('oib-XsjFa-M', 'Binary Lifting: k-th Ancestor of a Tree Node', 'Errichto Algorithms', '18:01'),
    v('dOAxrhAUIhA', 'LCA: Lowest Common Ancestor', 'Errichto Algorithms', '15:56'),
  ],
  'answer-search': [v('GU7DpgHINWQ', 'Binary Search Tutorial (C++ and Python)', 'Errichto Algorithms', '27:41')],
  geometry: [v('eu6i7WJeinw', 'Cross Products (Essence of Linear Algebra)', '3Blue1Brown', '8:54')],
  'convex-hull': [v('B2AJoQSZf4M', 'Convex Hull: Graham Scan and Jarvis March', 'Stable Sort', '7:24')],
};
