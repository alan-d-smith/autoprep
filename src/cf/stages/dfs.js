// DFS, components and cycles: primer and problems.
export default {
  id: 'dfs',
  title: 'DFS, components and cycles',
  track: 'graphs',
  summary: 'Turn a statement into a graph, label its connected components in O(n + m), and use the same traversal to detect cycles and 2-colour (bipartite) structure, on explicit graphs and on grids.',
  primer: {
    idea: 'Name the vertices (people, cells, snow drifts) and the edges (friends, shared side, same row), then one O(n + m) traversal started from every unvisited vertex labels the connected components. The same pass can collect facts per component (size, edge count, degrees) and 2-colour it, which answers "is it a single cycle", "does it contain a cycle" and "can it be split into two sides" without a second algorithm. The hard part is usually building the graph: grids, points that share a coordinate and lists of group members are all graphs once you decide what the vertices and edges are.',
    spot: [
      'Symmetric reachability questions: "can he get from any X to any Y", "how many users will hear the news", "how many separate regions": connected components.',
      'A grid of cells with walls or colours and a question about areas, rooms or connected regions: flood fill, with cells as vertices and shared sides as edges.',
      '"Split into two groups so that every edge goes across", "every edge joins an odd and an even number", "no two adjacent vertices get the same label": 2-colouring (bipartite check).',
      'The question is whether some loop exists, or whether a component is a single ring: detect a non-parent visited neighbour during DFS, or compare edges with vertices per component.',
    ],
    disguises: [
      'Fewest new objects or roads so that everything becomes mutually reachable → number of components − 1, since one new link can merge two components (217A: drifts sharing an x or y coordinate are adjacent).',
      'Groups or cliques given as member lists → link consecutive members of each list; k − 1 path edges give the same components as the k(k − 1)/2 pairs (1167C).',
      'Orient edges, assign parities or label vertices so that every edge joins two different kinds → 2-colour the graph; it is possible exactly when there is no odd cycle (1144F, 1093D).',
      'Remove k cells and keep the rest connected → keep the first s − k cells a search discovers (they form a tree), or remove DFS-tree leaves first (377A).',
    ],
    pitfalls: [
      'Recursive DFS on 2·10^5 vertices, or on a 500 × 500 grid whose empty cells form one long snake, can overflow the stack; use an explicit stack or BFS when the depth can be large.',
      'With many test cases, allocate the adjacency lists and visited arrays for this test (size n) instead of clearing a global array of the maximum size, which is O(t · maxN) when t is 3·10^5.',
      'In an undirected graph the edge back to the parent is not a cycle. Skip the parent (by edge id if multi-edges exist), or use the count rule: a component contains a cycle exactly when its edge count is at least its vertex count.',
    ],
    code: `// Components and 2-colouring with an explicit stack (no recursion depth limit).
// adj is 1-indexed. After the call: comp[v] = component id, side[v] = 0 or 1.
// Returns false if some edge joins two vertices on the same side (odd cycle).
bool explore(int n, const vector<vector<int>>& adj, vector<int>& comp, vector<int>& side) {
    comp.assign(n + 1, -1);
    side.assign(n + 1, -1);
    bool bipartite = true;
    int id = 0;
    for (int s = 1; s <= n; s++) {
        if (comp[s] != -1) continue;
        vector<int> st = {s};
        comp[s] = id; side[s] = 0;
        while (!st.empty()) {
            int u = st.back(); st.pop_back();
            for (int v : adj[u]) {
                if (comp[v] == -1) {
                    comp[v] = id; side[v] = side[u] ^ 1;
                    st.push_back(v);
                } else if (side[v] == side[u]) bipartite = false;
            }
        }
        id++;  // per-component facts (size, edge count, degrees) are gathered here
    }
    return bipartite;
}
// Grid version: cell (r, c) has id r * m + c; neighbours use these offsets.
const int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};`,
    resources: [
      { label: 'CP-Algorithms: Depth First Search', url: 'https://cp-algorithms.com/graph/depth-first-search.html' },
      { label: 'CP-Algorithms: Search for connected components', url: 'https://cp-algorithms.com/graph/search-for-connected-components.html' },
      { label: 'CP-Algorithms: Check whether a graph is bipartite', url: 'https://cp-algorithms.com/graph/bipartite-check.html' },
      { label: 'USACO Guide: Graph Traversal', url: 'https://usaco.guide/silver/graph-traversal' },
      { label: 'USACO Guide: Flood Fill', url: 'https://usaco.guide/silver/flood-fill' },
      { label: 'CSES: Building Teams (bipartite check)', url: 'https://cses.fi/problemset/task/1668' },
    ],
  },
  problems: [
    {
      id: '500A',
      name: 'New Year Transportation',
      rating: 1000,
      tier: 'warmup',
      hints: [
        'From cell i there is exactly one portal, and it only moves you to the right. How many different routes can start at cell 1?',
        'The portals form a directed graph in which every cell has one outgoing edge, so the cells reachable from 1 are a single chain 1 → 1 + a_1 → … . Reachability here is just following that chain.',
        'Start at cur = 1 and repeat cur += a[cur] while cur < t. Print YES exactly when you stop on t. O(n).',
      ],
      solution: 'Follow the only path: cur = 1, then cur = cur + a[cur] while cur < t. Every jump moves strictly right, so the walk either lands on t or jumps past it; print YES iff cur == t. O(n). A general DFS over the n − 1 directed portal edges gives the same answer; the point is to read the portals as a graph.',
    },
    {
      id: '217A',
      name: 'Ice Skating',
      rating: 1200,
      tier: 'warmup',
      hints: [
        'When can Bajtek get from one drift directly towards another? Does it matter if a third drift lies between them?',
        'Make each drift a vertex and join two drifts when they share an x or a y coordinate. A drift in between only splits the slide into two moves inside the same component, so "can get from A to B" means "same connected component".',
        'Count the components c with a DFS over the n ≤ 100 drifts (checking all pairs, O(n²)). The answer is c − 1: a new drift at (x of one drift, y of another) merges two components.',
      ],
      solution: 'Vertices are drifts, with an edge when x_i = x_j or y_i = y_j; a slide stops at the first drift in its way, which is in the same row or column, so reachability is exactly connectivity. Count components c by DFS in O(n²) and print c − 1. A new drift is adjacent only to drifts in its row and its column, and each of those groups already lies inside one component, so it merges at most two components; placing it at (x_a, y_b) for drifts a and b in different components does merge two, so c − 1 drifts are needed and enough.',
    },
    {
      id: '1167C',
      name: 'News Distribution',
      rating: 1400,
      tier: 'core',
      hints: [
        'The news spreads along friendships until it cannot spread further. So the answer for user x is the size of what?',
        'It is the size of the connected component of x in the friendship graph. The catch is building that graph: a group of k users is a clique with k(k − 1)/2 edges, far too many when k = 5·10^5.',
        'You only need connectivity, not every friendship: join each group member to the next one in its list (k − 1 edges). Label components with an iterative DFS (or DSU), record each component size, and print size[comp[i]]. O(n + Σk).',
      ],
      solution: 'Replace each group by a path through its members; a path connects the same users as the clique, so the components are unchanged and the graph has fewer than Σk edges. Label components with an iterative DFS, count their sizes, and print size[comp[i]] for every user. Groups with k = 0 or k = 1 add no edges. O(n + Σk); a recursive DFS can overflow the stack on a chain of 5·10^5 users.',
    },
    {
      id: '977E',
      name: 'Cyclic Components',
      rating: 1500,
      tier: 'core',
      hints: [
        'Look at a component that is a single cycle. What is the degree of each of its vertices? Does the converse also hold?',
        'A connected component is a cycle exactly when every vertex in it has degree 2: a connected graph with all degrees equal to 2 is one closed ring, and without loops or multi-edges it has at least 3 vertices. So this is "find components, then check one property per component".',
        'Store degrees, then run DFS from each unvisited vertex with a flag that becomes false if any visited vertex has degree other than 2. Count the components whose flag stays true. O(n + m).',
      ],
      solution: 'Label components with an iterative DFS; for each component check that all its vertices have degree exactly 2, and count the components that pass. All degrees 2 and connected means edges = vertices and a single ring; isolated vertices and paths fail the check. O(n + m). Do not abandon the traversal when you meet a bad vertex: the unvisited rest of that component would later be counted as a new component.',
    },
    {
      id: '510B',
      name: 'Fox And Two Dots',
      rating: 1500,
      tier: 'core',
      hints: [
        'Look only at the dots of one colour and the edges between side-adjacent dots of that colour. What does "a cycle of at least 4 dots" mean in that graph?',
        'It is cycle detection in an undirected graph, and the length condition is free: a grid has no triangles (it is bipartite), so every cycle has at least 4 cells. A DFS finds a cycle exactly when it reaches an already visited cell that is not the cell it just came from.',
        'For each unvisited cell run dfs(cell, parent) that moves only to same-coloured neighbours; if a neighbour other than the parent is already visited, print Yes. O(nm). Equivalently, count cells V and same-colour adjacent pairs E per component: a cycle exists iff E ≥ V.',
      ],
      solution: 'Each colour class is an undirected graph on cells with edges between side-adjacent cells. Run a DFS that remembers the cell it came from; reaching a visited neighbour other than that parent closes a cycle, and every grid cycle has length at least 4 because the grid has no odd cycles. O(nm) with n, m ≤ 50. The usual WA is counting the step back to the parent as a cycle, which makes any two adjacent same-coloured dots look like a cycle.',
    },
    {
      id: '377A',
      name: 'Maze',
      rating: 1600,
      tier: 'core',
      hints: [
        'Instead of choosing which k cells to wall up, choose which s − k cells to keep. What kind of set of cells is always connected?',
        'Any search from one empty cell discovers each new cell from a cell it has already discovered, so the first s − k cells it discovers form a tree and are connected. (Equivalently: removing a leaf of a DFS tree never disconnects the rest.)',
        'Count s, run DFS or BFS from any empty cell, and stop once s − k cells have been discovered; turn every other empty cell into X. O(nm).',
      ],
      solution: 'Run an iterative DFS or BFS from any empty cell and mark cells as kept when they are discovered, stopping after s − k cells. Every kept cell after the first was discovered from an earlier kept cell, so the kept cells form a connected tree; print X for every other empty cell. Deleting the first k cells in DFS post-order (children before parents) works for the same reason. O(nm) with up to 250 000 cells, so prefer an explicit stack or BFS to deep recursion.',
    },
    {
      id: '1144F',
      name: 'Graph Without Long Directed Paths',
      rating: 1700,
      tier: 'core',
      hints: [
        'Take any vertex v. If no directed path of length 2 may exist, can v have both an incoming and an outgoing edge?',
        'Every vertex must be all-out or all-in, and every edge must go from an all-out vertex to an all-in vertex. That is a 2-colouring: an orientation exists exactly when the graph is bipartite.',
        '2-colour the graph with DFS from vertex 1; if some edge joins two vertices of the same colour, print NO. Otherwise direct every edge from colour 0 to colour 1: character i is 0 if u_i has colour 0, else 1. O(n + m).',
      ],
      solution: 'A path of length 2 needs a vertex with an in-edge and an out-edge, so each vertex is a pure source or a pure sink, and every edge joins a source to a sink: a bipartition. 2-colour the connected graph with an iterative DFS; an edge inside one colour (an odd cycle) means NO. Otherwise print YES and, for each edge in input order, 0 when u_i is on side 0 and 1 otherwise. O(n + m). The sample output is the mirror image of this orientation; any valid answer is accepted.',
    },
    {
      id: '1093D',
      name: 'Beautiful Graph',
      rating: 1700,
      tier: 'challenge',
      hints: [
        'When is a + b odd for a, b ∈ {1, 2, 3}? What does that force for the two endpoints of every edge?',
        'Each edge must join an odd number (1 or 3) and an even number (2), so the vertices split into an odd side and an even side with every edge going across: a 2-colouring. A component that is not bipartite makes the answer 0, and a bipartite component has exactly two colourings (swap the sides).',
        'For each component, 2-colour it and count the vertices a and b on its two sides. If the first side is odd there are 2^a labellings (1 or 3 each, the other side all 2); if the second side is odd, 2^b. Multiply (2^a + 2^b) over all components mod 998244353.',
      ],
      solution: 'An odd sum means one endpoint is 2 and the other is 1 or 3, so a valid labelling is a 2-colouring in which the odd side has 2 choices per vertex. Colour each component with an iterative DFS; on a conflict the answer is 0. Otherwise a component with sides of sizes a and b has 2^a + 2^b labellings (an isolated vertex gives 3), and the answer is the product over components mod 998244353 with precomputed powers of 2. There are up to 3·10^5 tests, so allocate arrays of size n per test rather than resetting a maximum-size array each time.',
    },
  ],
};
