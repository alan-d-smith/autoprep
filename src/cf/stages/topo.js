// Topological sort and DAG DP: primer and problems.
export default {
  id: 'topo',
  title: 'Topological sort and DAG DP',
  track: 'graphs',
  summary: 'Turn "x before y" constraints into a directed graph, find an order or prove none exists, and run DP along that order for longest paths, path counts and minimal layer numbers.',
  primer: {
    idea: 'A directed graph can be listed so that every edge points forward exactly when it has no cycle, and Kahn\'s algorithm finds such an order in O(n + m): repeatedly remove a vertex with no remaining incoming edges (reversed DFS finishing order works too). If some vertices are never removed, they lie on or behind a cycle, which is your IMPOSSIBLE or "infinite" case. Once you have the order, any DP whose transitions follow edges (longest or shortest path, number of paths, earliest layer) is one pass over it, because every predecessor of a vertex is final before the vertex is used.',
    spot: [
      'The statement gives pairwise constraints: "a must come before b", "x is smaller than y", prerequisites, dependencies, or a list that is sorted under some unknown order.',
      'You must answer "impossible", -1 or "infinite" when the requirements contradict each other or a walk could repeat forever: that is cycle detection.',
      'The graph is promised to be acyclic ("no cyclic routes", "a task never depends on itself") and you want the best or the number of paths.',
      'You must give items the smallest ranks, levels or values that respect a set of < and = relations.',
    ],
    disguises: [
      'Find an alphabet or ranking under which a given list is sorted → compare neighbouring items; each first difference gives one edge "x before y", and any topological order of the letters is an answer.',
      'How many passes, rounds or semesters until everything is done → longest path in the dependency DAG, where an edge costs 1 when it forces a new pass and 0 otherwise.',
      'Assign the smallest positive values satisfying a < b and a = b → merge the = groups with DSU, then a group\'s value is 1 + the longest chain of < edges ending at it; a cycle, or a < inside one group, means no assignment.',
      'Orient undirected edges, or choose which edges to keep, so that no cycle appears → fix one vertex order (a topological order of the forced edges) and point everything forward in it; edges that all go forward in one order can never form a cycle.',
    ],
    pitfalls: [
      'Not checking for a cycle: after Kahn\'s algorithm, compare the number of removed vertices with n. With DFS you need three colours (unvisited, on the stack, finished); a plain visited flag cannot tell a back edge from a harmless cross edge.',
      'Running the DP in input order or vertex-number order, or starting Kahn\'s algorithm only from the source: start from every vertex with in-degree 0, or vertices fed by unreachable ones are never processed.',
      'In "sorted under some order" problems, a word followed by its own proper prefix ("care" before "car") can never be sorted, and it produces no letter edge, so it must be checked separately.',
    ],
    code: `// Kahn's algorithm on vertices 0..n-1. Returns a topological order;
// if it has fewer than n vertices, the graph has a cycle.
vector<int> topoOrder(const vector<vector<int>>& adj) {
    int n = adj.size();
    vector<int> indeg(n, 0), order;
    for (int v = 0; v < n; v++)
        for (int u : adj[v]) indeg[u]++;
    queue<int> q;  // a min-heap here gives the lexicographically smallest order
    for (int v = 0; v < n; v++) if (indeg[v] == 0) q.push(v);
    while (!q.empty()) {
        int v = q.front(); q.pop();
        order.push_back(v);
        for (int u : adj[v]) if (--indeg[u] == 0) q.push(u);
    }
    return order;
}

// DAG DP along the order: longest path (in edges) ending at each vertex,
// and the number of paths from src, mod 1e9+7. Returns false on a cycle.
bool dagDP(const vector<vector<int>>& adj, int src, vector<int>& len, vector<long long>& ways) {
    const long long MOD = 1e9 + 7;
    int n = adj.size();
    vector<int> order = topoOrder(adj);
    if ((int)order.size() < n) return false;
    len.assign(n, 0);
    ways.assign(n, 0);
    ways[src] = 1;
    for (int v : order)  // every predecessor of v is final before v is used
        for (int u : adj[v]) {
            len[u] = max(len[u], len[v] + 1);
            ways[u] = (ways[u] + ways[v]) % MOD;
        }
    return true;
}`,
    resources: [
      { label: 'CP-Algorithms: Topological sorting', url: 'https://cp-algorithms.com/graph/topological-sort.html' },
      { label: 'USACO Guide: Topological sort (with DAG DP)', url: 'https://usaco.guide/gold/toposort' },
      { label: 'CP-Algorithms: Finding a cycle', url: 'https://cp-algorithms.com/graph/finding-cycle.html' },
      { label: 'CSES: Longest Flight Route (longest path with reconstruction)', url: 'https://cses.fi/problemset/task/1680' },
    ],
  },
  problems: [
    {
      id: '510C',
      name: 'Fox And Names',
      rating: 1600,
      tier: 'warmup',
      hints: [
        'Two neighbouring names in a sorted list tell you something only at their first differing position. What does "rivest" before "shamir" say about the alphabet?',
        'Each neighbouring pair gives at most one constraint "letter x comes before letter y". You need an order of the 26 letters that respects all of them, which is a topological order of a 26-vertex graph; a cycle in that graph means Impossible.',
        'For each i, find the first position k where name[i] and name[i+1] differ and add the edge name[i][k] → name[i+1][k]. If there is no such position and name[i] is the longer one, print Impossible at once. Run Kahn\'s algorithm on the letters: fewer than 26 removed means Impossible, otherwise print the removal order.',
      ],
      solution: 'Only adjacent names need comparing, since lexicographic order is transitive. Each adjacent pair contributes the edge name[i][k] → name[i+1][k] at its first differing position k; when one name is a prefix of the other there is no edge, but a longer name followed by its own prefix ("care" then "car") is Impossible under any alphabet, which is the case most wrong answers miss. Kahn\'s algorithm on the 26 letters then gives a valid alphabet, or stops early on a cycle. O(total length + 26²).',
    },
    {
      id: '919D',
      name: 'Substring',
      rating: 1700,
      tier: 'warmup',
      hints: [
        'When can the value be arbitrarily large? And once you rule that out, what kind of graph is left?',
        'Any cycle (a self-loop counts) can be walked around forever, so its letters repeat without bound and the answer is -1. Otherwise the graph is a DAG, and the best path in a DAG is DP over a topological order. You do not know which letter wins, so track all 26.',
        'Run Kahn\'s algorithm; if not all n nodes are removed, print -1. Keep dp[v][c] = the most occurrences of letter c on a path ending at v: when v is removed, add 1 to dp[v][s[v]], then for each edge v → u set dp[u][c] = max(dp[u][c], dp[v][c]) for all c. The answer is the largest entry, O(26·(n + m)).',
      ],
      solution: 'If the graph has a cycle the answer is -1; Kahn\'s algorithm detects it, including self-loops x → x, because those nodes never reach in-degree 0. In a DAG, fixing the letter c turns the question into a longest path that counts nodes labelled c, so dp[v][c] for all 26 letters at once, filled in topological order, gives the answer in O(26·(n + m)) time and 26·n ints of memory. Multiple edges and disconnected parts need no special handling.',
    },
    {
      id: '721C',
      name: 'Journey',
      rating: 1800,
      tier: 'core',
      hints: [
        'There are two quantities: showplaces visited (to maximise) and time spent (at most T). Times go up to 10^9, so they cannot be a DP index, but the number of showplaces is at most 5000.',
        'Swap the roles: for each showplace v and count k, store the least time needed to stand at v having visited exactly k showplaces. The roads form a DAG, so this table fills in topological order, each road turning a k-showplace route into a (k+1)-showplace route.',
        'Set dp[1][1] = 0. For v in topological order and each road v → u with time t, set dp[u][k+1] = min(dp[u][k+1], dp[v][k] + t) and record par[u][k+1] = v. The answer is the largest k with dp[n][k] ≤ T; follow par back from (n, k) to print the route. O(n·(n + m)).',
      ],
      solution: 'dp[v][k] = least time to reach showplace v from 1 visiting k showplaces, filled in a topological order of the whole graph (start Kahn\'s algorithm from every in-degree-0 vertex, not only from 1; states unreachable from 1 just stay infinite). Relax dp[u][k+1] from dp[v][k] + t along every road and store the parent, then take the largest k with dp[n][k] ≤ T and walk the parents back. The trap is memory: 5001² entries are 100 MB as int, so store times as int (compute the sum in 64 bits and keep it only if ≤ T) and parents as short to stay under 256 MB. Time O(n·(n + m)) ≈ 5·10^7.',
    },
    {
      id: '1572A',
      name: 'Book',
      rating: 1800,
      tier: 'core',
      hints: [
        'Chapter i can be understood in the same reading as a required chapter j only if j appears earlier in the book. What happens when j > i?',
        'Treat each requirement as an edge j → i that costs 0 if j < i and 1 if j > i (you must wait for the next reading). The reading in which chapter i is understood is 1 plus the heaviest path ending at i, so the answer is a longest path in the dependency DAG, and a cycle of requirements means -1.',
        'Run Kahn\'s algorithm on the edges j → i with pass[i] = 1 for every chapter, relaxing pass[i] = max(pass[i], pass[j] + (j > i ? 1 : 0)). If fewer than n chapters are removed print -1, otherwise print the largest pass. O(n + Σk) per test.',
      ],
      solution: 'Chapter i is understood in reading max over its requirements j of (pass[j] + [j > i]), or reading 1 if it has none: a requirement that sits later in the book is only understood after the reader has passed chapter i, so i waits one more reading. That is a longest path with 0/1 weights, computed in topological order of the requirement graph; chapters on or behind a cycle are never understood, so print -1 if Kahn\'s algorithm does not remove all n. Simulating the readings directly is O(n²) in the worst case (the fifth sample stretched to n chapters needs n readings).',
    },
    {
      id: '1679D',
      name: 'Toss a Coin to Your Graph...',
      rating: 1900,
      tier: 'core',
      hints: [
        'Fix a threshold X and allow only vertices with a_i ≤ X. Can you decide quickly whether k − 1 moves are possible? How does the answer change as X grows?',
        'If X works, every larger X works too, so binary search on X. For a fixed X the allowed vertices form a subgraph: if it contains a cycle the coin can move forever, and if it is a DAG the longest possible walk is its longest path, a DP in topological order.',
        'Binary search over the sorted distinct values of a. check(X): run Kahn\'s algorithm on the vertices with a_i ≤ X; if some allowed vertex is never removed there is a cycle, so return true; otherwise compute the longest path in vertices, len[u] = max(len[u], len[v] + 1), and return max len ≥ k. If check(max a) fails print -1. O((n + m) log n).',
      ],
      solution: 'The answer is the smallest X for which the subgraph on vertices with a_i ≤ X contains a walk through k vertices. That holds if the subgraph has a cycle (k is up to 10^18, so only a cycle can give such long walks) or if its longest path has at least k vertices, and one Kahn pass with a longest-path DP answers both. The predicate is monotone in X, so binary search over the distinct a values costs O((n + m) log n). Keep k in 64 bits, and note that k = 1 needs just one vertex, so the answer is never -1 when n ≥ 1 and k = 1.',
    },
    {
      id: '1385E',
      name: 'Directing Edges',
      rating: 2000,
      tier: 'core',
      hints: [
        'Ignore the undirected edges for a moment. If the directed edges alone contain a cycle, can anything save you? And if they do not?',
        'The directed edges must already be acyclic, otherwise the answer is NO. If they are, take one topological order of all n vertices: an edge pointing from an earlier vertex to a later one can never close a cycle, so every undirected edge can be pointed forward in that order.',
        'Run Kahn\'s algorithm on the directed edges only, over all n vertices, and record pos[v]. If not every vertex is removed print NO. Otherwise print directed edges unchanged and each undirected edge x–y as "x y" if pos[x] < pos[y], else "y x". O(n + m).',
      ],
      solution: 'Directing the undirected edges only adds edges, so if the directed part has a cycle the answer is NO. Otherwise take a topological order of the directed part and orient each undirected edge from the earlier endpoint to the later one; every edge now goes forward in one fixed order, so the result is acyclic. Kahn\'s algorithm gives the cycle test and the positions in O(n + m). Reset the adjacency lists and in-degrees for each test case, and include vertices that touch only undirected edges in the order.',
    },
    {
      id: '1131D',
      name: 'Gourmet choice',
      rating: 2000,
      tier: 'challenge',
      hints: [
        'Dishes marked "=" must get the same number, so treat each group of equal dishes as a single item. What do the "<" and ">" entries become between groups?',
        'After merging "=" groups with DSU, every "<" is a directed edge between groups, and the smallest valid numbers are longest-path layers: a group with nothing below it gets 1, any other group gets 1 + the largest value below it. A cycle, or a "<" or ">" between two dishes of the same group, means No.',
        'Union dish i with dish n + j for each "=". For each "<" add the edge find(i) → find(n + j) (">" the reverse), printing No if both ends share a group. Run Kahn\'s algorithm over the group roots with val = 1 at sources and val[u] = max(val[u], val[v] + 1); if not every root is removed print No, else print val[find(x)] for each dish. O(nm).',
      ],
      solution: 'Collapse equal dishes with DSU over all n + m dishes, then build the "strictly better" graph between groups (up to 10^6 edges). An evaluation exists exactly when no "<" or ">" lies inside a group and that graph is acyclic. Giving each group 1 + the longest chain of groups below it is valid and makes every value individually as small as possible (a chain of L groups needs L distinct values), so the maximum is minimal too; it is a longest-path DP in topological order. When checking that Kahn\'s algorithm removed everything, count only DSU roots, not all n + m dishes.',
    },
  ],
};
