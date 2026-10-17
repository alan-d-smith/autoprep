// Binary lifting and LCA: primer and problems.
export default {
  id: 'binary-lifting',
  title: 'Binary lifting and LCA',
  track: 'graphs',
  summary: 'Build jump tables up[j][v] on trees and on "next" pointers to answer k-th ancestor, LCA, distance and path-maximum queries in O(log n), and count how many greedy steps lead from l to r.',
  primer: {
    slides: [
      {
        title: 'Many queries on one fixed tree',
        points: [
          'Queries ask for the k-th ancestor, the LCA of a and b, their distance, or the heaviest edge between them.',
          'Walking up one parent at a time is O(depth): about 4·10^10 steps on a path of 2·10^5 vertices with 2·10^5 queries.',
          'Storing every ancestor of every vertex makes jumps O(1), but needs O(n²) memory.',
        ],
        say: 'The questions come on a fixed rooted tree, many at a time: the k-th ancestor of v, the lowest common ancestor (LCA) of a and b, the distance between them, the heaviest edge on their path. Walking up one parent at a time answers each in O(depth), and on a path-shaped tree with n = 2·10^5 vertices and 2·10^5 queries that is about 4·10^10 steps. Storing every ancestor of every vertex would make each jump O(1), but needs O(n²) memory.',
      },
      {
        title: 'Any jump is a few power-of-two jumps',
        points: [
          'A jump of 13 is a jump of 8, then 4, then 1: its binary digits.',
          'So it is enough to know where jumps of 1, 2, 4, 8, … land from each vertex.',
          'Each is built from the one before: a jump of 2^j is two jumps of 2^(j−1).',
        ],
        show: [0, 8],
        note: 'The 5th ancestor of 7: 5 is 101 in binary, so jump 4, then 1.',
        say: 'Every jump length is a sum of distinct powers of two, its binary digits: a jump of 13 is a jump of 8, then 4, then 1. So it is enough to know, for each vertex, where jumps of 1, 2, 4, 8 and so on land, and each of those is built from the one before, because a jump of 2^j is two jumps of 2^(j−1).',
      },
      {
        title: 'Build the jump table by doubling',
        points: [
          'up[j][v] is the vertex 2^j steps above v, for levels j < `LOG`. Row 0 holds the parents, and the root points to itself.',
          'up[j][v] = up[j−1][up[j−1][v]], so each row is filled from the row below, one row at a time: O(n log n) to build.',
          'kth(v, k) makes one jump v = up[j][v] for each power 2^j in the binary form of k: at most `LOG` jumps.',
        ],
        show: [0, 5],
        note: 'Doubling: up[2][7] = up[1][up[1][7]] = up[1][5] = 3, two jumps of 2 making one of 4; rows 0 and 1 are already full.',
        say: 'Binary lifting stores up[j][v], the vertex 2^j steps above v, for every level j from 0 to LOG − 1, where 2^LOG is larger than any jump (LOG = 18 when n is up to 2·10^5). Row 0 holds the parents, found by a BFS from the root, with the root pointing to itself so that a jump past the top stops at the root. Every later row follows from the one below it: up[j][v] = up[j−1][up[j−1][v]]. Filling the table one row at a time, for every vertex, costs O(n log n). Then kth(v, k), the k-th ancestor of v, makes one jump v = up[j][v] for each power 2^j in the binary form of k, at most LOG jumps.',
      },
      {
        title: 'LCA: level up, then climb together',
        points: [
          'Lift the deeper vertex until both have the same dep[v]; if the two now coincide, that vertex is the LCA.',
          'Otherwise try j from `LOG` − 1 down to 0, jumping both only when up[j][a] ≠ up[j][b].',
          'They end as two children of the LCA, up[0][a]. Then dist(a, b) = dep[a] + dep[b] − 2·dep[lca(a, b)].',
        ],
        show: [0, 16],
        note: 'Climbing together: the ancestors 2 steps above 5 and 10 differ, so both jump, and the LCA is higher still.',
        say: 'For lca(a, b), the deepest vertex that is an ancestor of both, first lift the deeper vertex by the difference in depth, where dep[v] counts the edges from the root to v; if the two now coincide, that vertex is the answer. Otherwise the LCA is some s ≥ 1 steps above both, and their 2^j-th ancestors are equal exactly when 2^j ≥ s. Trying j from LOG − 1 down to 0 and jumping both only when up[j][a] ≠ up[j][b] climbs s − 1 steps, one binary digit at a time, and leaves a and b as two different children of the LCA, which is up[0][a]. Distances follow: dist(a, b) = dep[a] + dep[b] − 2·dep[lca(a, b)].',
      },
      {
        title: 'Descend from the largest jump',
        points: [
          'If a condition holds low on v\'s path to the root and fails above, try jumps from the largest down.',
          'Take each jump that still lands where it holds: the jumps taken spell out, in binary, how far it reaches.',
          'Store an aggregate with each jump, such as the heaviest of its 2^j edges, to answer path maximum or sum queries.',
        ],
        say: 'Whenever a condition holds on a bottom part of the path from v towards the root and fails above it, such as "the sum of positive weights climbed is at most x", try the jumps from the largest down and take each one that still lands on a vertex satisfying it: the jumps taken spell out, in binary, how far the condition reaches. An aggregate stored next to each jump, such as the heaviest edge among those 2^j edges, combines the same way as the jumps and answers path-maximum or path-sum queries during the climb.',
      },
      {
        title: 'No tree needed, only a successor',
        points: [
          'For any next(x), set up[0][x] = next(x) and double as before.',
          '"Where am I after k steps?" needs a level for each bit of k: `LOG` = 60 for k up to 10^18. The template\'s 18 covers only k < 2^18.',
          '"How many greedy steps lead from l past r?" uses the same descent. Building is O(n·LOG) time and memory, each query O(LOG).',
        ],
        say: 'Nothing in the table needs a tree. For any function next(x) that gives each position one successor, setting up[0][x] = next(x) and doubling as before answers "where am I after k steps", as long as there is a level for every bit of k: LOG = 60 for k up to 10^18, while the template\'s LOG = 18 only covers k below 2^18. The same descent answers "how many greedy steps lead from l past r", which never takes more than n steps. UKIEPC 2023 Fast Forward jumped through "next ad break" pointers this way. Building costs O(n·LOG) time and memory, 1.2·10^7 entries for n = 2·10^5 and LOG = 60, and every query O(LOG).',
      },
    ],
    terms: [
      'up[j][v]: the vertex 2^j steps above v, or the root if v is less than 2^j deep; j is the level, never a step count. Over a function next, it is next applied 2^j times (`tbl[j][v]` in the TRD version, built by `treeJump`).',
      '`LOG`: the number of levels, j = 0 to LOG − 1; 2^LOG must exceed the longest jump, so 18 for depths below 2^18 and 60 for k up to 10^18 (in the TRD version `treeJump` picks it as the number of rows of `tbl`, which only covers jumps shorter than about 2n, so `stepTable` builds its own 60).',
      'dep[v]: the number of edges from the root down to v (`depth` in the TRD version).',
      'kth(v, k): the k-th ancestor of v, one jump for each bit set in k (`jmp(tbl, v, k)` in the TRD version).',
      'lca(a, b): the lowest common ancestor of a and b, the deepest vertex that has both in its subtree; a vertex counts as its own ancestor (`lca(tbl, depth, a, b)` in the TRD version).',
      'dist(a, b): the number of edges on the path between a and b (`treeDist` in the TRD version).',
      'next(x): the successor of position x under any function that gives each position one successor, such as "the furthest point one greedy step reaches"; jumping along it needs no tree (in the TRD version, `stepTable(next)` builds the 60 levels once and `afterSteps(up, x, k)` answers each query).',
    ],
    worked: {
      problem: { source: 'kattis', id: 'tourists', name: 'Tourists', difficulty: '3.6' },
      slides: [
        {
          title: 'Sum the path lengths between multiples',
          points: [
            'A tree has n ≤ 2·10^5 vertices, labelled 1 to n.',
            'For each pair x < y where y is a multiple of x, the length is the number of vertices on the path from x to y, both ends included.',
            'Print the sum of these lengths over all such pairs.',
          ],
          show: [0, 0],
          note: 'Sample 1, rooted at 1: the path from 2 to 6 has 6 vertices. The 17 pairs of this tree sum to 55.',
          say: 'Tree City has n attractions, up to 2·10^5, labelled 1 to n and joined by n − 1 roads into a tree. A tourist at x goes on to every y greater than x that is a multiple of x, along the path between them. The length of that trip is the number of attractions on the path, counting x and y. Print the sum of the lengths over all such pairs. In the sample, the trip from 2 to 6 passes 2, 8, 10, 1, 4 and 6, so its length is 6, and the 17 trips add up to 55.',
        },
        {
          title: 'Millions of pairs, each a long walk',
          points: [
            'x has ⌊n/x⌋ − 1 multiples above it, so there are about 2.3·10^6 pairs when n = 2·10^5.',
            'Walking each path one edge at a time is O(depth): on a path of 2·10^5 vertices labelled in order, the walks take about 2.2·10^11 steps.',
            'A BFS from every x is no better: n searches of n steps, 4·10^10.',
          ],
          say: 'Count the pairs first. x has ⌊n/x⌋ − 1 multiples above it, and adding these up over all x gives about 2.3·10^6 pairs when n = 2·10^5. That many pairs is fine, but their paths are not. Walking from x to y one edge at a time costs O(depth), and on a path of 2·10^5 vertices labelled in order the walks add up to about 2.2·10^11 steps. A BFS from every x is no better: n searches of n steps each, 4·10^10.',
        },
        {
          title: 'A path length is a distance plus one',
          points: [
            'The tree never changes; only the pairs do. That is millions of distance queries on one fixed tree.',
            'Rooted at 1, the length from x to y is dist(x, y) + 1, where dist(x, y) = dep[x] + dep[y] − 2·dep[lca(x, y)].',
            'Binary lifting answers each lca(x, y) in O(log n), after O(n log n) to build up[j][v].',
          ],
          say: 'The tree is fixed and only the pairs change, so this is millions of distance queries on one tree, which is what binary lifting is for. Root the tree at 1. The path from x to y climbs from x to their lowest common ancestor, lca(x, y), and comes down to y, so it has dist(x, y) = dep[x] + dep[y] − 2·dep[lca(x, y)] edges, and one more vertex than edges. Building up[j][v] costs O(n log n) once, and after that every lca(x, y) costs O(log n).',
        },
        {
          title: 'Build the jump table from vertex 1',
          points: [
            'A BFS from 1 gives dep[v] and the parent up[0][v]; vertex 1 points to itself.',
            'Each level doubles the one below: up[j][v] = up[j−1][up[j−1][v]]. `LOG` = 18 is enough, since 2^18 > 2·10^5.',
            'The sample is 3 deep, so levels 0 and 1 cover it; every higher level holds 1.',
          ],
          show: [0, 1],
          note: 'The finished table for the sample, highlighting how up[1][2] was built: up[0][up[0][2]] = up[0][8] = 10.',
          say: 'A BFS from vertex 1, without recursion, gives every depth dep[v] and every parent up[0][v], with vertex 1 pointing to itself so that a jump past the top stops there. Each level doubles the one below it: up[j][v] = up[j−1][up[j−1][v]]. No vertex is 2^18 deep when n is at most 2·10^5, so 18 levels are enough: LOG = 18. The sample tree is only 3 deep, so levels 0 and 1 already cover it, and every higher level holds 1. For example, up[1][2] = up[0][up[0][2]] = up[0][8] = 10.',
        },
        {
          title: 'lca(2, 6): level the depths first',
          points: [
            '2 is at depth 3 and 6 at depth 2, so lift 2 by one: kth(2, 1) = up[0][2] = 8.',
            '8 ≠ 6, so try the levels from the top. At j = 1, up[1][8] = up[1][6] = 1: a common ancestor, but maybe not the lowest, so don\'t jump.',
          ],
          show: [0, 2],
          note: 'Midway through lca(2, 6): 2 has been lifted to 8, and the jump of 2 is refused because 8 and 6 would both land on 1.',
          say: 'Take the pair 2 and 6. Vertex 2 is at depth 3 and 6 is at depth 2, so first lift 2 by the difference, one step: kth(2, 1) = up[0][2] = 8. Now 8 and 6 are level but different, so the LCA is higher up. Try the levels from the top. At j = 1, up[1][8] and up[1][6] are both 1. That is a common ancestor, but it may be above the lowest one, so neither vertex jumps.',
        },
        {
          title: 'Climb together, then step to the parent',
          points: [
            'At j = 0, up[0][8] = 10 and up[0][6] = 4 differ, so both jump. 10 and 4 are now children of the LCA.',
            'lca(2, 6) = up[0][10] = 1, so dist(2, 6) = 3 + 2 − 2·0 = 5 and the path has 6 vertices.',
          ],
          show: [0, 3],
          note: 'End of lca(2, 6): 8 and 6 jumped to 10 and 4, whose parent 1 is the lowest common ancestor.',
          say: 'At j = 0, up[0][8] = 10 and up[0][6] = 4 are different, so both jump, to 10 and 4. The levels have run out, and 10 and 4 are two children of the lowest common ancestor, so it is their parent: lca(2, 6) = up[0][10] = 1. Then dist(2, 6) = dep[2] + dep[6] − 2·dep[1] = 3 + 2 − 0 = 5 edges, and the path has 6 vertices, as in the statement.',
        },
        {
          title: 'All 17 pairs, and the cost',
          points: [
            'The same for every pair gives the lengths in the table, which sum to 55.',
            'O(n log n) pairs at O(log n) each make O(n log² n). The sum passes 2·10^11 on a long path, so it needs long long.',
            'lca(a, b) skips any level whose jump is longer than dep[a]: both vertices would land on the root, so that jump is never taken.',
          ],
          show: [0, 4],
          note: 'Every pair of the sample: row x, column y holds the length of the path from x to y. The rows sum to 26, 16, 6, 4 and 3, which is 55.',
          say: 'Doing the same for all 17 pairs of the sample gives the lengths in the table, which add up to 55. There are O(n log n) pairs and each lca costs O(log n), so the whole solution is O(n log² n), plus O(n log n) to build the table. On a path of 2·10^5 vertices the sum is about 2.2·10^11, so it needs long long. With 2.3·10^6 pairs, reading the table takes most of the time, so lca(a, b) skips every level whose jump is longer than dep[a]: such a jump would land both vertices on the root, so it can never be taken.',
        },
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

const int LOG = 18;
int n;
vector<vector<int>> adj;
array<vector<int>, LOG> up;         // up[j][v] = 2^j-th ancestor of v (the root points to itself)
vector<int> dep;

void build(int root) {
    up[0].assign(n + 1, root); dep.assign(n + 1, -1);
    vector<int> q = {root};
    dep[root] = 0;
    for (size_t i = 0; i < q.size(); i++)
        for (int c : adj[q[i]]) if (dep[c] < 0) {
            dep[c] = dep[q[i]] + 1; up[0][c] = q[i];
            q.push_back(c);
        }
    for (int j = 1; j < LOG; j++) {
        up[j].resize(n + 1);
        for (int v = 0; v <= n; v++) up[j][v] = up[j - 1][up[j - 1][v]];
    }
}
int kth(int v, int k) {
    for (int j = LOG - 1; j >= 0; j--) if (k >> j & 1) v = up[j][v];
    return v;
}
int lca(int a, int b) {
    if (dep[a] < dep[b]) swap(a, b);
    a = kth(a, dep[a] - dep[b]);
    if (a == b) return a;
    for (int j = LOG - 1; j >= 0; j--)  // a jump longer than dep[a] would land both on the root
        if ((1 << j) <= dep[a] && up[j][a] != up[j][b]) { a = up[j][a]; b = up[j][b]; }
    return up[0][a];
}
int dist(int a, int b) { return dep[a] + dep[b] - 2 * dep[lca(a, b)]; }

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    cin >> n;
    adj.assign(n + 1, {});
    for (int i = 0; i < n - 1; i++) {
        int a, b; cin >> a >> b;
        adj[a].push_back(b); adj[b].push_back(a);
    }
    build(1);
    long long total = 0;
    for (int x = 1; x <= n; x++)
        for (int y = 2 * x; y <= n; y += x) total += dist(x, y) + 1;
    cout << total << '\\n';
}`,
    },
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
      'For each vertex count the descendants that "reach" it within a budget → each descendant is counted by a contiguous run of ancestors; find the top of the run by lifting and add 1 along it with a tree difference array (739B)',
      'Many paths in a tree, and for each edge count the paths that use it → +1 at a and at b, −2 at lca(a, b), then subtree sums (191C)',
    ],
    pitfalls: [
      'LOG must satisfy 2^LOG > the longest jump: depths up to 2·10^5 − 1 need LOG = 18, because 2^17 = 131072 is too small, and k up to 10^18 steps needs 60.',
      'Give the root (or a sentinel such as position n + 1) a jump to itself. Otherwise up[j] of the root reads garbage or index 0, and a "jump while the condition holds" loop walks off the tree.',
      'Fill row j only after row j − 1 is complete for every vertex (j as the outer loop), or fill all levels of a vertex once its ancestors are done, in BFS order. A recursive DFS on a path of 2·10^5 vertices can overflow the stack.',
    ],
    code: `const int LOG = 18;                 // 2^LOG > n, the longest jump on a tree
int n;
vector<vector<int>> adj;
array<vector<int>, LOG> up;         // up[j][v] = 2^j-th ancestor of v (the root points to itself)
vector<int> dep;
void build(int root) {
    up[0].assign(n + 1, root); dep.assign(n + 1, -1);
    vector<int> q = {root};         // BFS for parents and depths, without recursion
    dep[root] = 0;
    for (size_t i = 0; i < q.size(); i++)
        for (int c : adj[q[i]]) if (dep[c] < 0) {
            dep[c] = dep[q[i]] + 1; up[0][c] = q[i];
            q.push_back(c);
        }
    for (int j = 1; j < LOG; j++) {  // row j from row j - 1: two jumps of 2^(j-1)
        up[j].resize(n + 1);
        for (int v = 0; v <= n; v++) up[j][v] = up[j - 1][up[j - 1][v]];
    }
}
int kth(int v, int k) {             // k-th ancestor of v, k <= dep[v]: one jump per set bit of k
    for (int j = LOG - 1; j >= 0; j--) if (k >> j & 1) v = up[j][v];
    return v;
}
int lca(int a, int b) {
    if (dep[a] < dep[b]) swap(a, b);
    a = kth(a, dep[a] - dep[b]);    // lift the deeper vertex to the same depth
    if (a == b) return a;
    for (int j = LOG - 1; j >= 0; j--)
        if (up[j][a] != up[j][b]) { a = up[j][a]; b = up[j][b]; }
    return up[0][a];
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
        'Compute A, B and depth for all vertices in BFS order from vertex 1 (a parent can have a larger label than its child) and build up[j][v]. For i: if B_i ≤ A_i then r_i = depth_i; otherwise jump by decreasing powers of two while the landing vertex still has B > A_i, step once more to the parent and print its depth. O(n log n).',
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
        'Build depths and up[j][v] with a BFS from city 1, place the three marks for each pair, then add every vertex\'s total into its parent in reverse BFS order. For road i print the total of whichever endpoint is deeper. O((n + k) log n).',
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
        'Run Kruskal for T. Root T and store up[j][v] together with mx[j][v], the heaviest edge on the 2^j edges above v: mx[j][v] = max(mx[j−1][v], mx[j−1][up[j−1][v]]). For each input edge lift u and v to their LCA, taking the max over every jump used. O(m log m + (n + m) log n).',
      ],
      solution: 'Build an MST with Kruskal and let W be its weight. Forcing edge (u, v, w) into the tree means removing one tree edge from the cycle it closes, and the best choice is the heaviest edge on the tree path u–v, giving W − maxPath(u, v) + w (this also yields W for the tree edges). Answer each path maximum with binary lifting that stores, beside each 2^j jump, the heaviest edge it covers, and combine those maxima during the LCA climb from both ends. O(m log m + (n + m) log n); W reaches 2·10^14, so it must be long long.',
    },
    {
      id: '1516D',
      name: 'Cut',
      rating: 2100,
      tier: 'challenge',
      hints: [
        'When is the product of a group equal to its LCM? Think about primes. Then, for a single query, is cutting greedily from left to right optimal?',
        'Product = LCM means no prime divides two elements of the group: they are pairwise coprime. Greedy is optimal, so from a start i the piece extends to just before go(i), the first index that cannot join it. The answer is how many times you apply go from l before passing r: jumping along a "next" pointer, which binary lifting makes O(log n) per query.',
        'Compute go from right to left: go(i) = min(go(i+1), the next index after i that contains a prime factor of a_i), using a smallest-prime-factor sieve and a "next occurrence" array per prime, with go(n+1) = n+1. Build up[j][i]. Per query, from x = l jump by 2^j while up[j][x] ≤ r and count the steps; the answer is that count + 1. O((n + q) log n).',
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
        'Store the best r for each left end, take prefix maxima so that next(x) = max(x, prefix max at x), and set up[j][x] = up[j−1][up[j−1][x]]. Per query jump by 2^j while up[j][x] < y and add 2^j; then answer count + 1 if next(x) ≥ y, otherwise −1. O((C + m) log C) with C = 5·10^5.',
      ],
      solution: 'Greedy covering: with [x, cur] covered, take the interval starting at or before cur with the largest right end. Define next(c) = max(c, largest r over intervals with l ≤ c) for every coordinate using a prefix maximum, and build jump tables over next. For a query climb from x by powers of two while the landing point is still < y; then one more step must reach y, otherwise there is a gap and the answer is −1 (a stuck point has next(c) = c, which the jumps preserve). The table has 19 levels of 5·10^5 + 1 ints, about 38 MB, which fits.',
    },
  ],
};
