// DSU and minimum spanning trees: primer and problems.
export default {
  id: 'dsu-mst',
  title: 'DSU and minimum spanning trees',
  track: 'graphs',
  summary: 'Maintain components under edge additions with union-find, answer threshold questions by adding edges offline in sorted order, and build minimum spanning trees with Kruskal or dense Prim, including the virtual-vertex trick for "build here or connect" costs.',
  primer: {
    idea: 'A disjoint set union stores each component as a tree pointing to one representative; with path compression (here path halving) and union by size, find and unite take amortised O(α(n)), effectively constant. Kruskal sorts the edges by weight and keeps an edge exactly when it joins two different components, which yields a minimum spanning tree in O(m log m). The same "add edges in sorted order" loop answers threshold questions offline: after all edges of weight ≤ q are in, the DSU holds exactly the components of the graph restricted to weight ≤ q.',
    spot: [
      'Edges or "same group" relations are only ever added, and you need connectivity, component sizes or the number of components along the way.',
      '"Connect everything at minimum total cost", or keep a subset of edges so everything stays connected and the total is minimal: a minimum spanning tree.',
      'A threshold in the question, such as "using only edges of weight ≤ q" or "the largest edge on the path is at most q": sort the edges (and the queries) and union in increasing order.',
      'Each object either pays its own fixed cost or links to another object that is already served: add a virtual vertex 0 with an edge (0, i) of weight c_i.',
    ],
    disguises: [
      'Guests each want two shared items and you minimise the unhappy ones → items are vertices, guests are edges, and the unhappy guests are the edges that close a cycle in the DSU (1209D).',
      'Count pairs (u, v) whose path maximum is ≤ q → union edges in increasing weight; merging components of sizes x and y adds x·y pairs, the same loop as Kruskal (1213G). UKIEPC 2025 Fell Walking fixed the minimum and then added edges in this Kruskal order.',
      'Every city builds a power station for c_i or wires to a powered neighbour → an MST on n + 1 vertices with a virtual power-station vertex (1245D).',
      'A complete graph where connecting x and y costs a_x + a_y → only the star from the vertex with the smallest a can be in an MST, so the graph shrinks to O(n + m) edges (1095F).',
    ],
    pitfalls: [
      'Comparing p[a] with p[b] instead of find(a) with find(b), or merging a and b instead of their roots, silently corrupts the sets.',
      'Pair counts (x·y, s(s − 1)/2) and MST totals overflow int long before n reaches 2·10^5; keep them in long long.',
      'Materialising all n(n − 1)/2 edges of a dense graph costs memory and a large sort; for complete graphs with n ≈ 2000 use O(n²) Prim with plain arrays, or prove that only O(n) of the edges can ever be chosen.',
    ],
    code: `struct DSU {
    vector<int> p, sz;
    DSU(int n) : p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); }
    int find(int x) {                       // path halving: each step skips a level
        while (p[x] != x) x = p[x] = p[p[x]];
        return x;
    }
    bool unite(int a, int b) {              // false: a and b were already connected
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);      // union by size keeps trees shallow
        p[b] = a; sz[a] += sz[b];
        return true;
    }
};
// Kruskal: cheapest edge first, keep it iff it joins two components. O(m log m).
// Returns the MST weight (spanning forest weight if the graph is disconnected).
long long kruskal(int n, vector<array<long long, 3>> edges) {  // {w, u, v}
    sort(edges.begin(), edges.end());
    DSU d(n);
    long long total = 0;
    for (auto& [w, u, v] : edges) if (d.unite(u, v)) total += w;
    return total;
}
// Virtual source: "open a station at i for c_i" = edge (0, i, c_i) to an extra vertex 0,
// then the answer is an ordinary MST on n + 1 vertices.`,
    resources: [
      { label: 'CP-Algorithms: Disjoint Set Union', url: 'https://cp-algorithms.com/data_structures/disjoint_set_union.html' },
      { label: 'CP-Algorithms: Minimum spanning tree, Kruskal with DSU', url: 'https://cp-algorithms.com/graph/mst_kruskal_with_dsu.html' },
      { label: 'CP-Algorithms: Minimum spanning tree, Prim\'s algorithm', url: 'https://cp-algorithms.com/graph/mst_prim.html' },
      { label: 'USACO Guide: Disjoint Set Union', url: 'https://usaco.guide/gold/dsu' },
      { label: 'USACO Guide: Minimum Spanning Trees', url: 'https://usaco.guide/gold/mst' },
    ],
  },
  problems: [
    {
      id: '1249B2',
      name: 'Books Exchange (hard version)',
      rating: 1300,
      tier: 'warmup',
      hints: [
        'Follow one book: kid i → p_i → p_{p_i} → …. Since p is a permutation, where must this walk end, and which other kids lie on the same walk?',
        'A permutation splits into disjoint cycles, and a book comes back after exactly the length of its owner\'s cycle. Uniting i with p_i in a DSU turns each cycle into one component.',
        'For each query build a DSU on 1..n, unite(i, p_i) for every i, and print the size of find(i) for each kid. O(n α(n)) per query.',
      ],
      solution: 'The graph i → p_i of a permutation is a disjoint union of cycles, and kid i gets the book back after the length of the cycle through i. Unite i with p_i for every i; the component of i is exactly its cycle, so print sz[find(i)]. Simulating day by day is O(n²) on one long cycle. Build the DSU per query with that query\'s n, since only the sum of n is bounded.',
    },
    {
      id: '771A',
      name: 'Bear and Friendship Condition',
      rating: 1500,
      tier: 'warmup',
      hints: [
        'X–Y and Y–Z force X–Z. What does that imply for two members joined by a longer chain of friendships, say X–Y–Z–W?',
        'Applying the rule repeatedly, any two members in the same connected component must be direct friends: every component has to be a clique. A DSU finds the components, and a component with s members is a clique exactly when it holds s(s − 1)/2 friendships.',
        'Unite the ends of every friendship, then count friendships per root (edge (a, b) belongs to find(a)) and compare each root\'s count with sz·(sz − 1)/2 computed in long long. O((n + m) α(n)).',
      ],
      solution: 'The condition makes friendship transitive inside each component, so the network is reasonable iff every component is complete. Build components with a DSU, count the edges in each, and print NO if some component of size s has fewer than s(s − 1)/2 edges (pairs are distinct, so it can never have more). s(s − 1)/2 is about 1.1·10^10 for s = 150000, so an int comparison overflows.',
    },
    {
      id: '1702E',
      name: 'Split Into Two Sets',
      rating: 1600,
      tier: 'core',
      hints: [
        'Treat each number as a vertex and each domino as an edge between its two numbers. What must a vertex look like for a split to be possible, and what does a valid split mean for two dominoes that share a number?',
        'A domino {x, x} or a number on three dominoes makes it impossible. Otherwise n dominoes carry 2n numbers, so every number appears exactly twice and the graph is a disjoint union of cycles. Dominoes sharing a number must go to different sets, so the sets alternate around each cycle, which works exactly when every cycle has even length.',
        'Reject a_i = b_i or any count above 2. Otherwise unite a_i with b_i in a DSU; a component with s numbers is a cycle of s dominoes, so answer YES iff every component size is even. O(n α(n)) per test case.',
      ],
      solution: 'Count how often each number appears; a double or a count above 2 means NO. Then every number has degree exactly 2 in the number graph, so its components are cycles whose dominoes must alternate between the two sets. Unite the two numbers of each domino and answer YES iff every component has an even number of vertices. Equivalently, check that the graph "dominoes sharing a number" is bipartite with a DSU that stores parity.',
    },
    {
      id: '1209D',
      name: 'Cow and Snacks',
      rating: 1700,
      tier: 'core',
      hints: [
        'Draw the flavours as vertices and the guests as edges. In one connected group with s flavours, how many guests can possibly eat something?',
        'Every happy guest removes at least one new flavour and the first removes two, so a component with s flavours makes at most s − 1 guests happy, and ordering the guests along a spanning tree achieves that. The sad guests are exactly the edges that are not needed for a spanning forest.',
        'Unite x_i and y_i for each guest in input order and count the unite calls that return false (both flavours already connected). O((n + k) α(n)).',
      ],
      solution: 'Model flavours as vertices and guests as edges. In a component with s flavours, at most s − 1 guests can be happy, and lining guests up in BFS order of a spanning tree makes exactly s − 1 happy. So the minimum number of sad guests is k − (n − number of components) = the number of guests whose two flavours are already connected when processed. Count failed unions. O((n + k) α(n)).',
    },
    {
      id: '1213G',
      name: 'Path Queries',
      rating: 1800,
      tier: 'core',
      hints: [
        'For one query q, delete every edge heavier than q. Which pairs (u, v) are counted, in terms of the pieces that remain?',
        'A pair counts exactly when u and v are in the same component of the forest of edges with weight ≤ q, so the answer is Σ s(s − 1)/2 over those components. As q grows edges are only added, which is the Kruskal loop run offline: sort edges by weight and union them in that order.',
        'Sort the edges; keep a running total and, when an edge joins components of sizes x and y, add x·y. Record the total after all edges of weight ≤ w for each w up to 2·10^5 (or sort the queries with their indices) and answer by lookup. O(n log n + m + max w).',
      ],
      solution: 'The largest edge on the u–v path is ≤ q iff u and v are connected using only edges of weight ≤ q. Sort the edges and sweep q upwards, uniting each edge once q reaches its weight; merging components of sizes x and y creates x·y new valid pairs. Store the running count per weight value and print the answers in input order. The count reaches n(n − 1)/2 ≈ 2·10^10, so use long long; with n = 1 there are no edges and every answer is 0.',
    },
    {
      id: '1095F',
      name: 'Make It Connected',
      rating: 1900,
      tier: 'core',
      hints: [
        'Without special offers, any two vertices can be joined for a_x + a_y. If you had to connect everything with only such edges, which vertex would you put at the centre?',
        'Let r be the vertex with the smallest a. For any x, y the edge (x, y) at a_x + a_y is the heaviest edge of the triangle x, y, r, so by the cycle property an MST never needs it. Only the n − 1 star edges (r, i) plus the special offers matter, and the problem becomes a plain MST.',
        'Find r = argmin a, build the edge list from the m special offers plus (r, i, a_r + a_i) for every i ≠ r, and run Kruskal with a DSU, summing in long long. O((n + m) log(n + m)).',
      ],
      solution: 'Let r be the vertex with the smallest a. For a pair x, y, the cost a_x + a_y is at least both a_r + a_x and a_r + a_y, so the direct edge is the heaviest in the triangle with r and can be dropped. Build the star from r together with all special offers, sort by cost and run Kruskal. a_i and w go up to 10^12 and the total to about 4·10^17, so read and sum everything in long long. n = 1 prints 0.',
    },
    {
      id: '1245D',
      name: 'Shichikuji and Power Grid',
      rating: 1900,
      tier: 'core',
      hints: [
        'Building a station costs c_i and involves no other city. Can you make that option look like an edge, so that every decision is just "pick some edges"?',
        'Add a virtual vertex 0, the power source, with an edge (0, i) of weight c_i. A city has electricity iff it is connected to 0, so the cheapest plan is a minimum spanning tree on n + 1 vertices: tree edges at 0 are stations, all other tree edges are wires.',
        'The graph is complete with about 2·10^6 edges, so run O(n²) Prim from vertex 0 with arrays best[] and from[] and no heap, computing (k_i + k_j)·(|x_i − x_j| + |y_i − y_j|) on the fly. Record from[v] for each vertex you attach. O(n²).',
      ],
      solution: 'Vertex 0 stands for "has a power station" with edge weights c_i; wires cost (k_i + k_j) times the Manhattan distance. A plan is valid iff every city is connected to 0, so the optimum is an MST of this complete graph on n + 1 vertices. Dense Prim repeatedly attaches the cheapest unattached vertex and relaxes all others; a vertex attached from 0 gets a station, any other attachment is a wire. Wire costs reach about 4·10^15, so use long long. O(n²) time, O(n) memory; Kruskal on all pairs also passes but is slower.',
    },
    {
      id: '1513D',
      name: 'GCD and MST',
      rating: 2000,
      tier: 'challenge',
      hints: [
        'Kruskal would take the cheapest edges first. Which edges cost less than p, and which array value is responsible for an edge of weight a_i?',
        'An edge of weight a_i joins j and k exactly when every element of a[j..k] is a multiple of a_i and a_i lies inside, so a_i reaches a contiguous run of multiples around position i. Run Kruskal by hand: process positions in increasing a_i and greedily connect i to its neighbours along that run at cost a_i per new connection.',
        'Sort positions by a. For each i with a_i < p, walk left and right while the next element is divisible by a_i and the gap between it and its neighbour is not yet bridged, marking the gap and adding a_i. Stop at a bridged gap; finally add p for every gap still unbridged. Each gap is bridged once, so the walks cost O(n) after the O(n log n) sort.',
      ],
      solution: 'Components stay contiguous, so track which of the n − 1 gaps (j, j + 1) are bridged. In increasing order of a_i, while a_i < p, extend from i to the left while a_j % a_i == 0 and gap j is unbridged, bridging it for a_i (the edge (j, i) exists because all of a[j..i] are multiples of a_i), then do the same to the right. Stopping at a bridged gap is safe because an earlier walk with a value ≤ a_i got there first and anything further that a_i could reach is already in that component. Every remaining gap costs p. Values with a_i ≥ p are skipped since the adjacent p-edges are never worse. Sum in long long.',
    },
  ],
};
