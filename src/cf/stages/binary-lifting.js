// Binary lifting and LCA: primer and problems.
export default {
  id: 'binary-lifting',
  title: 'Binary lifting and LCA',
  track: 'graphs',
  summary: 'Build jump tables up[k][v] on trees and on "next" pointers to answer k-th ancestor, LCA, distance and path-maximum queries in O(log n), and count how many greedy steps lead from l to r.',
  primer: {
    idea: 'Store for every vertex its 2^k-th ancestor, up[k][v] = up[k−1][up[k−1][v]], which takes O(n log n) to build. A jump of any length splits into its binary digits, and "climb as long as a condition still holds" becomes a descent from the largest power of two down, both O(log n). LCA lifts the deeper vertex to the same depth and then lifts both while their ancestors differ; keeping an aggregate (max edge, sum) next to each jump answers path queries the same way. The table works for any function next(x), not only parents: UKIEPC 2023 Fast Forward jumped through "next ad break" pointers exactly like this.',
    spot: [
      'Many queries about paths between two vertices of a fixed tree: distances, whether a vertex lies on a path, the heaviest edge on a path.',
      'For each vertex, "the highest ancestor that still satisfies X", where X is monotone along the root path (sums of positive weights, depths).',
      'A greedy step "from position x go as far as possible" repeated many times, with many queries asking how many steps get from l to r.',
      'Applying the same function k times with k up to 10^9 or 10^18: teleporters, permutations, successor graphs.',
    ],
    disguises: [
      'Minimum spanning tree that must contain a given edge → MST weight minus the heaviest MST edge on the path between its endpoints plus its own weight; the path maximum comes from binary lifting (609E)',
      'Fewest pieces or intervals covering [l, r], over many queries → a greedy "furthest reach" pointer next(x), and the answer is how often you apply it: jump tables over next (1516D, 1175E)',
      'Is there one simple path through all these vertices? → the deepest vertex and the deepest vertex off its root path are the ends; check dist(a, x) + dist(x, b) = dist(a, b) with LCA (1702G2)',
      'For each vertex count the descendants that "reach" it within a budget → each descendant is counted by a contiguous run of ancestors; find the top of the run by lifting and add 1 along it with a tree difference array (739B, 191C)',
    ],
    pitfalls: [
      'LOG must satisfy 2^LOG > the longest jump: depths up to 2·10^5 − 1 need LOG = 18, because 2^17 = 131072 is too small.',
      'Give the root (or a sentinel such as position n + 1) a jump to itself. Otherwise up[k] of the root reads garbage or index 0, and a "jump while the condition holds" loop walks off the tree.',
      'Fill up[k][v] only after the ancestors of v are complete: build in BFS order, or make k the outer loop over all vertices. A recursive DFS on a path of 2·10^5 vertices can overflow the stack.',
    ],
    code: `const int LOG = 18;                 // 2^LOG > n
int n;
vector<vector<int>> adj;
vector<array<int, LOG>> up;         // up[v][k] = 2^k-th ancestor of v (the root points to itself)
vector<int> dep;
void build(int root) {              // BFS, so parents are finished before children
    up.assign(n + 1, {}); dep.assign(n + 1, -1);
    vector<int> q = {root};
    dep[root] = 0; up[root].fill(root);
    for (size_t i = 0; i < q.size(); i++) {
        int v = q[i];
        for (int c : adj[v]) if (dep[c] < 0) {
            dep[c] = dep[v] + 1; up[c][0] = v;
            for (int k = 1; k < LOG; k++) up[c][k] = up[up[c][k - 1]][k - 1];
            q.push_back(c);
        }
    }
}
int kth(int v, int k) {             // k-th ancestor of v, k <= dep[v]
    for (int b = 0; b < LOG; b++) if (k >> b & 1) v = up[v][b];
    return v;
}
int lca(int a, int b) {
    if (dep[a] < dep[b]) swap(a, b);
    a = kth(a, dep[a] - dep[b]);    // lift the deeper vertex to the same depth
    if (a == b) return a;
    for (int k = LOG - 1; k >= 0; k--)
        if (up[a][k] != up[b][k]) { a = up[a][k]; b = up[b][k]; }
    return up[a][0];
}
int dist(int a, int b) { return dep[a] + dep[b] - 2 * dep[lca(a, b)]; }`,
    resources: [
      { label: 'CP-Algorithms: Lowest Common Ancestor, binary lifting', url: 'https://cp-algorithms.com/graph/lca_binary_lifting.html' },
      { label: 'USACO Guide: Binary Jumping', url: 'https://usaco.guide/plat/binary-jump' },
      { label: 'CSES: Company Queries I (k-th ancestor)', url: 'https://cses.fi/problemset/task/1687' },
      { label: 'CSES: Planets Queries I (jumping in a successor graph)', url: 'https://cses.fi/problemset/task/1750' },
    ],
  },
  problems: [
    {
      id: '1714G',
      name: 'Path Prefixes',
      rating: 1700,
      tier: 'warmup',
      hints: [
        'Along the path from the root to i, the b-sums of the prefixes only grow, because every b_j ≥ 1. What shape does the set of prefixes with b-sum ≤ A_i have?',
        'Those prefixes end at exactly the root-path vertices u with B_u ≤ A_i, and they form the top part of the path. So r_i is the depth of the deepest ancestor u of i with B_u ≤ A_i: a "climb while the condition fails" query, which binary lifting answers in O(log n).',
        'Compute A, B and depth for all vertices in BFS order from vertex 1 (a parent can have a larger label than its child) and build up[k][v]. For i: if B_i ≤ A_i then r_i = depth_i; otherwise jump by decreasing powers of two while the landing vertex still has B > A_i, step once more to the parent and print its depth. O(n log n).',
      ],
      solution: 'Let A_v and B_v be the a-sum and b-sum from the root to v. Since every b ≥ 1, B strictly increases down the path, so the prefixes with b-sum ≤ A_i form a top part of the root-to-i path and r_i is the depth of its deepest vertex. Find that vertex by lifting from i with decreasing powers of two while the landing vertex still has B > A_i, then take one parent step; the root has B = 0 and points to itself, so the walk never leaves the tree. Root the tree with BFS because p_j may exceed j, and keep the sums in long long. Keeping the B values of the current DFS path in an array and binary searching it is an equivalent O(n log n) solution.',
    },
    {
      id: '1328E',
      name: 'Tree Queries',
      rating: 1900,
      tier: 'warmup',
      hints: [
        'A query vertex may be on the path or next to it. If v is next to a root-to-u path without being on it, which neighbour of v must be on the path? Can you swap each query vertex for one vertex that is certainly on the path?',
        'Replacing every query vertex by its parent (the root stays itself) loses nothing. The condition becomes "all these vertices lie on one root-to-u path", that is, each of them is an ancestor of the deepest one. Ancestor tests are the building block of LCA.',
        'Precompute parent, depth and DFS entry and exit times tin/tout. Per query map each v to parent(v), pick the deepest result w, and check tin[x] ≤ tin[w] and tout[w] ≤ tout[x] for every x (or lca(x, w) = x). O(n + Σk), or O(Σk log n) with binary-lifting LCA.',
      ],
      solution: 'If v is within distance 1 of a root-to-u path, then parent(v) is on that path: if v is on it, so is its parent, and if v hangs off it, the path vertex next to v must be its parent, since a path through a child of v would pass through v. Conversely, parent(v) on the path puts v within distance 1. So replace each vertex by its parent, take the deepest result w, and answer YES exactly when every replaced vertex is an ancestor of w. Test ancestry in O(1) with tin/tout from one iterative DFS, or with binary-lifting LCA, and keep the root mapped to itself.',
    },
    {
      id: '191C',
      name: 'Fools and Roads',
      rating: 1900,
      tier: 'core',
      hints: [
        'Each pair of fools adds 1 to every road on one tree path, and walking each path edge by edge is O(n·k). Is there a tree version of "add 1 to a range in O(1), read everything at the end"?',
        'Root the tree. The path a–b climbs from a to lca(a, b) and descends to b. Put +1 on a and on b and −2 on their LCA; then the number of paths using the road from v to its parent is the sum of these marks over the subtree of v. All you need per pair is one LCA query, which binary lifting answers in O(log n).',
        'Build depths and up[k][v] with a BFS from city 1, place the three marks for each pair, then add every vertex\'s total into its parent in reverse BFS order. For road i print the total of whichever endpoint is deeper. O((n + k) log n).',
      ],
      solution: 'This is a difference array on a tree: for each pair (a, b) do cnt[a] += 1, cnt[b] += 1, cnt[lca(a, b)] −= 2. After subtree sums, the value at v counts exactly the paths with one end inside the subtree of v and the other outside, which are the paths using the road (v, parent(v)). LCA by binary lifting makes this O((n + k) log n). Print in input order by mapping each road to its deeper endpoint, and accumulate in reverse BFS order rather than with recursion, which can overflow the stack on a path-shaped tree.',
    },
    {
      id: '739B',
      name: 'Alyona and a tree',
      rating: 1900,
      tier: 'core',
      hints: [
        'Fix the controlled vertex u and walk up its ancestors v. dist(v, u) only grows as v moves up. Which ancestors control u, then?',
        'The controllers of u form a contiguous run of ancestors: from parent(u) up to the highest ancestor x with D_u − D_x ≤ a_u, where D is the weighted depth. Find x with binary lifting (jump while the condition still holds), then add 1 to every vertex on the vertical path parent(u) … x.',
        'Adding 1 along a vertical path is a tree difference array: mark[parent(u)] += 1 and mark[parent(x)] −= 1 when x is not the root. The answer for v is the sum of marks in its subtree, accumulated in reverse BFS order. O(n log n).',
      ],
      solution: 'Let D be the weighted depth. u is controlled by the proper ancestors v with D_u − D_v ≤ a_u, and since D decreases going up, they form a run from parent(u) up to a highest vertex x. Find x by lifting from u with decreasing powers of two while D_u − D_target ≤ a_u, skip u if not even its parent qualifies, and record +1 at parent(u) and −1 at parent(x). Subtree sums of these marks give every vertex\'s count, O(n log n) in total. D reaches 2·10^14, so use long long, and fill the tables in BFS order from vertex 1.',
    },
    {
      id: '1702G2',
      name: 'Passable Paths (hard version)',
      rating: 2000,
      tier: 'core',
      hints: [
        'If the set lies on one simple path, you can shorten the path so that it starts and ends at vertices of the set. Which vertex of the set is certainly one of the two ends?',
        'The deepest vertex a is an end. The other end b is the deepest vertex that is not an ancestor of a; if every vertex is an ancestor of a, they all lie on a\'s root path and the answer is YES. Otherwise x lies on the path a–b exactly when dist(a, x) + dist(x, b) = dist(a, b), and LCA gives distances.',
        'Precompute depths and binary lifting tables. Per query: a = deepest vertex, b = deepest x with lca(a, x) ≠ x, then check the distance equality for every x in the set. O((n + Σk) log n).',
      ],
      solution: 'Take a = the deepest vertex of the set; if the set is passable, a is an end of the covering path. The vertices that are not ancestors of a (lca(a, x) ≠ x) all lie on the other branch, so the deepest of them is the other end b; if there are none, the whole set lies on the root path of a and the answer is YES. Otherwise check dist(a, x) + dist(x, b) = dist(a, b) for every x, with dist from depths and binary-lifting LCA. O((n + Σk) log n); k = 1 and n = 1 are valid inputs and must print YES.',
    },
    {
      id: '609E',
      name: 'Minimum spanning tree for each edge',
      rating: 2100,
      tier: 'core',
      hints: [
        'Start from one minimum spanning tree T. If an edge (u, v) outside T must be included, adding it closes exactly one cycle. Which edge of that cycle should you drop?',
        'Drop the heaviest edge on the tree path between u and v, so the answer is W(T) − maxOnPath(u, v) + w; for an edge of T the path is the edge itself and the formula gives W(T). So the task is path-maximum queries on a fixed tree, which binary lifting answers by storing the heaviest edge next to each jump.',
        'Run Kruskal for T. Root T and store up[k][v] together with mx[k][v], the heaviest edge on the 2^k edges above v: mx[k][v] = max(mx[k−1][v], mx[k−1][up[k−1][v]]). For each input edge lift u and v to their LCA, taking the max over every jump used. O(m log m + (n + m) log n).',
      ],
      solution: 'Build an MST with Kruskal and let W be its weight. Forcing edge (u, v, w) into the tree means removing one tree edge from the cycle it closes, and the best choice is the heaviest edge on the tree path u–v, giving W − maxPath(u, v) + w (this also yields W for the tree edges). Answer each path maximum with binary lifting that stores, beside each 2^k jump, the heaviest edge it covers, and combine those maxima during the LCA climb from both ends. O(m log m + (n + m) log n); W reaches 2·10^14, so it must be long long.',
    },
    {
      id: '1516D',
      name: 'Cut',
      rating: 2100,
      tier: 'challenge',
      hints: [
        'When is the product of a group equal to its LCM? Think about primes. Then, for a single query, is cutting greedily from left to right optimal?',
        'Product = LCM means no prime divides two elements of the group: they are pairwise coprime. Greedy is optimal, so from a start i the piece extends to just before go(i), the first index that cannot join it. The answer is how many times you apply go from l before passing r: jumping along a "next" pointer, which binary lifting makes O(log n) per query.',
        'Compute go from right to left: go(i) = min(go(i+1), the next index after i that contains a prime factor of a_i), using a smallest-prime-factor sieve and a "next occurrence" array per prime, with go(n+1) = n+1. Build up[k][i]. Per query, from x = l jump by 2^k while up[k][x] ≤ r and count the steps; the answer is that count + 1. O((n + q) log n).',
      ],
      solution: 'A group has product equal to its LCM exactly when its elements are pairwise coprime. From a start i the greedy takes the longest valid piece, which ends just before go(i) = min(go(i + 1), the next index after i sharing a prime with a_i); the min with go(i + 1) is needed because a valid piece starting at i stays valid without a_i. A query is then "how many go-steps from l until the position exceeds r", answered with binary lifting on go by jumping while the target is ≤ r and adding 1 for the last piece. Factorise with an SPF sieve up to 10^5 and make n + 1 a sentinel that points to itself.',
    },
    {
      id: '1175E',
      name: 'Minimal Segment Cover',
      rating: 2200,
      tier: 'challenge',
      hints: [
        'For one query, think greedily: [x, cur] is already covered. Which interval should you take next?',
        'Take the interval with l ≤ cur that reaches furthest right: next(cur) = max(cur, max{r : l ≤ cur}). The answer is the number of applications of next needed to reach y, and next is one fixed function on the coordinates 0..5·10^5, so binary lifting counts the steps in O(log C).',
        'Store the best r for each left end, take prefix maxima so that next(x) = max(x, prefix max at x), and set up[k][x] = up[k−1][up[k−1][x]]. Per query jump by 2^k while up[k][x] < y and add 2^k; then answer count + 1 if next(x) ≥ y, otherwise −1. O((C + m) log C) with C = 5·10^5.',
      ],
      solution: 'Greedy covering: with [x, cur] covered, take the interval starting at or before cur with the largest right end. Define next(c) = max(c, largest r over intervals with l ≤ c) for every coordinate using a prefix maximum, and build jump tables over next. For a query climb from x by powers of two while the landing point is still < y; then one more step must reach y, otherwise there is a gap and the answer is −1 (a stuck point has next(c) = c, which the jumps preserve). The table has 19 levels of 5·10^5 + 1 ints, about 38 MB, which fits.',
    },
  ],
};
