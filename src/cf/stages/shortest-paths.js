// Dijkstra, Floyd–Warshall and state graphs: primer and problems.
export default {
  id: 'shortest-paths',
  title: 'Dijkstra, Floyd–Warshall and state graphs',
  track: 'graphs',
  summary: 'Compute single-source and all-pairs shortest paths, run Dijkstra over expanded states, and reuse a distance table to answer "what if this road changes" questions.',
  primer: {
    idea: 'Dijkstra settles vertices in increasing order of distance with a priority queue, O((n + m) log m) for non-negative weights, and it works on any graph you can describe, including expanded states such as (city, bike owned) or (vertex, riding or not). Floyd–Warshall gives all pairs in O(n³) for n up to about 500, and its outer loop means something: after the pass for k, distances use only the first k vertices as stopovers, so vertices can be added one at a time. With all-pairs distances precomputed, "change one road", "add a road" or "visit these places in some order" questions turn into arithmetic or DP on the table.',
    spot: [
      'Weighted edges with non-negative weights, and the question asks for the least total time, cost or distance from a start.',
      'The cost of an edge depends on something you carry or have done (a bike, a horse, a ticket, fuel, discounts used): make that part of the vertex.',
      'n is at most a few hundred and the question involves many pairs, or vertices and roads are added or removed over time: Floyd–Warshall or an O(n²) update per change.',
      'You may change one road, or must visit a few special places: precompute distances from the relevant sources once, then combine table entries.',
    ],
    disguises: [
      'Delete vertices one by one and report a sum over all pairs before each deletion → reverse the order and add the vertices as the k of Floyd–Warshall.',
      'Costs depend on an item picked up earlier (a bike, a horse, a coupon) → Dijkstra over states (vertex, item), with n times the number of item values states.',
      'Two people travel and meet at a vertex as early as possible → one Dijkstra from each start; meeting at v takes max(d1[v], d2[v]), so minimise that over v.',
      'Make one road free, or add one road, and minimise a sum of route lengths → with all-pairs distances, route a → b becomes min(d[a][b], d[a][x] + c + d[y][b], d[a][y] + c + d[x][b]) for road x–y of new length c.',
    ],
    pitfalls: [
      'Missing the stale-entry check: without "if (d != dist[v]) continue" a vertex popped many times rescans its edges, which can blow up to O(n·m). Also use a min-heap (greater<>), not the default max-heap.',
      'Overflow: 10^5 edges of weight 10^6 or more need long long, and an INF of LLONG_MAX overflows as soon as you add to it; use LLONG_MAX / 4 or skip INF entries.',
      'Floyd–Warshall with k not as the outermost loop: the result is wrong but often still passes small tests.',
    ],
    code: `const long long INF = LLONG_MAX / 4;  // INF + INF must not overflow

// Dijkstra from src; adj[v] = {to, weight}, weights >= 0. O((n + m) log m).
// par[u] = previous vertex on a shortest path (the shortest-path tree).
vector<long long> dijkstra(const vector<vector<pair<int, int>>>& adj, int src, vector<int>& par) {
    int n = adj.size();
    vector<long long> dist(n, INF);
    par.assign(n, -1);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
    dist[src] = 0;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, v] = pq.top(); pq.pop();
        if (d != dist[v]) continue;  // stale entry: v was settled with a smaller distance
        for (auto [u, w] : adj[v])
            if (d + w < dist[u]) {
                dist[u] = d + w;
                par[u] = v;
                pq.push({dist[u], u});
            }
    }
    return dist;
}

// Floyd-Warshall: d[i][j] = edge weight or INF, d[i][i] = 0. O(n^3).
// After the pass for k, d[i][j] uses only vertices 0..k as stopovers.
void floyd(vector<vector<long long>>& d) {
    int n = d.size();
    for (int k = 0; k < n; k++)  // k must be the outer loop
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                d[i][j] = min(d[i][j], d[i][k] + d[k][j]);
}`,
    resources: [
      { label: 'CP-Algorithms: Dijkstra on sparse graphs', url: 'https://cp-algorithms.com/graph/dijkstra.html' },
      { label: 'CP-Algorithms: Floyd–Warshall', url: 'https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html' },
      { label: 'USACO Guide: Shortest paths with non-negative edge weights', url: 'https://usaco.guide/gold/shortest-paths' },
      { label: 'CSES: Shortest Routes I', url: 'https://cses.fi/problemset/task/1671' },
    ],
  },
  problems: [
    {
      id: '295B',
      name: 'Greg and Graph',
      rating: 1700,
      tier: 'warmup',
      hints: [
        'Deleting vertices is awkward. What if you read the deletions backwards, so the graph grows instead of shrinking?',
        'In reverse, vertices are added one at a time, which is exactly what the outer loop of Floyd–Warshall does: after relaxing through a set S of vertices, d[i][j] is the shortest i → j path whose stopovers all lie in S. So use x_n, x_(n−1), …, x_1 as the successive k.',
        'For step = n down to 1: let k = x_step and set d[i][j] = min(d[i][j], d[i][k] + d[k][j]) for all i, j (all n vertices, not only the added ones). The answer before deletion step is the sum of d[i][j] over added i and j. O(n³) in total, with 64-bit sums.',
      ],
      solution: 'Reverse the deletions so vertices are added. Keep the full n×n matrix and relax every pair through each newly added vertex k; after adding a set S, d[i][j] is the shortest path using only stopovers from S, which for i, j in S is the distance in the remaining graph. Sum over pairs in S for that step and print the answers in the original order. Relaxing only pairs inside S is the common bug: a later vertex\'s routes through earlier ones are then never formed. O(n³) ≈ 1.25·10^8 simple operations, and sums up to about 2.5·10^10 need long long.',
    },
    {
      id: '1915G',
      name: 'Bicycles',
      rating: 1800,
      tier: 'warmup',
      hints: [
        'Once Slavic owns a bike, he never needs a slower one. So at any moment, which single number captures everything that matters about the bikes he has bought?',
        'Only the slowness of the best bike owned so far matters, and it takes at most 1000 values. Put it in the vertex: Dijkstra on states (city, best slowness), a graph with n·1000 vertices, because the fastest arrival at a city may carry a worse bike than a slightly slower arrival.',
        'Start at (1, s_1) with time 0. From (v, b), a road v–u of length w leads to (u, min(b, s_u)) at cost w·b (buying the bike at u is free and never hurts). The answer is the first popped state with city n. Use 64-bit times; O(1000·(n + m) log).',
      ],
      solution: 'Keep the slowness b of the fastest bike bought so far in the state; buying is free, so arriving at u always moves to (u, min(b, s_u)). Dijkstra over the n·1000 states with edge cost w·b gives the minimum, and the first state with city n taken from the heap is the answer. Times reach about 10^11, so use long long. Dijkstra on cities alone is wrong because it keeps only the fastest arrival at each city and forgets that another arrival might carry a better bike.',
    },
    {
      id: '2014E',
      name: 'Rendez-vous de Marian et Robin',
      rating: 1800,
      tier: 'core',
      hints: [
        'Either of them may wait, so meeting at vertex v takes as long as the later of the two arrivals there. What do you need to know about each vertex?',
        'Compute each traveller\'s earliest arrival at every vertex separately; the answer is the minimum over v of max(dM[v], dR[v]). Each traveller is a single-source shortest path whose state also says whether they are riding, because riding halves every later edge.',
        'Run Dijkstra twice (from 1 and from n) over states (v, riding) with riding ∈ {0, 1}: at a horse vertex, (v, 0) → (v, 1) costs 0; an edge costs w on foot and w/2 when riding. Let d[v] be the smaller of the two states, then print min over v of max(d1[v], dn[v]), or −1 if it is infinite. O((n + m) log n).',
      ],
      solution: 'Because waiting is allowed, the earliest meeting at v is max(d1[v], dn[v]), where each d is that traveller\'s own fastest arrival. Each is a Dijkstra on 2n states (vertex, mounted) with a free move onto a horse at horse vertices and halved edge costs once mounted (all w are even, so w/2 is exact). The minimum over all v covers every meeting point. Reset everything between test cases and print −1 when 1 and n are disconnected.',
    },
    {
      id: '20C',
      name: 'Dijkstra?',
      rating: 1900,
      tier: 'core',
      hints: [
        'This is the plain single-source problem. Besides the distances, what must you store to print the path itself?',
        'Dijkstra with a binary heap is O((n + m) log n) for non-negative weights. Recording, for each vertex, the vertex its distance last improved from gives the shortest-path tree, and the path to n is read off it backwards.',
        'Keep dist as long long (10^5 edges of weight 10^6) and set par[u] = v whenever dist[u] improves through v. Skip heap entries whose distance is larger than dist[v]. If dist[n] is infinite print −1, else follow par from n back to 1, reverse, and print.',
      ],
      solution: 'Standard Dijkstra from vertex 1 with a min-heap of (distance, vertex), the stale-entry check, and a predecessor stored on each improvement; reconstruct the path from n by following predecessors and reversing. Distances can reach 10^11, so int overflows. Loops and multiple edges need nothing special. The usual failures are int distances and dropping the stale check, which on dense multi-edge tests rescans the same vertices many times.',
    },
    {
      id: '25C',
      name: 'Roads in Berland',
      rating: 1900,
      tier: 'core',
      hints: [
        'You already have every shortest distance. When a new road a–b of length c opens, how can a new shortest path between cities i and j use it?',
        'A new shortest path uses the new road at most once, in one of two directions, and the parts before and after it are old shortest paths. So each road needs one O(n²) relaxation pass through it, the same step Floyd–Warshall does for a single k, not a full rerun.',
        'For each road: if c < d[a][b], set d[i][j] = min(d[i][j], d[i][a] + c + d[b][j], d[i][b] + c + d[a][j]) for all i, j. Then print the sum of d[i][j] over i < j in 64 bits. O(k·n²).',
      ],
      solution: 'Keep the distance matrix up to date. A path that uses the new road (a, b, c) has the form i → a → b → j or i → b → a → j with old shortest paths around the road, so one O(n²) pass with that formula fixes every pair; updating in place is safe because every value written is the length of a real path. Equivalently, set d[a][b] = d[b][a] = c and run the Floyd–Warshall step with k = a and then k = b. The sum over unordered pairs can exceed 2^31, so use long long; total O(k·n²) ≈ 2.7·10^7.',
    },
    {
      id: '545E',
      name: 'Paths and Trees',
      rating: 2000,
      tier: 'core',
      hints: [
        'In a shortest-path tree each vertex other than u has exactly one parent edge. Which edges are allowed to be that parent edge?',
        'An edge (x, v, w) can be v\'s parent edge exactly when dist[x] + w = dist[v] (a tight edge). Any choice of one tight edge per vertex forms a valid tree, because tight edges always come from strictly closer vertices, so the vertices can be decided independently and a greedy choice is optimal.',
        'Run Dijkstra from u. For each vertex v ≠ u, pick the tight edge into v with the smallest weight; you can do this inside the relaxation by also replacing the parent edge when the distance ties and the new edge is lighter. Sum those weights and print their indices. O((n + m) log n) with 64-bit distances.',
      ],
      solution: 'Every shortest-path tree chooses, for each v ≠ u, one incoming edge with dist[x] + w = dist[v], and every such choice is a tree (weights are positive, so following parents strictly decreases dist and ends at u). The total weight is the sum of the chosen edges, so take the lightest tight edge for each vertex independently. In Dijkstra, update the parent edge on a strict improvement and also on a tie with a lighter edge. Distances reach 3·10^14, and n = 1 must print 0 and an empty edge list.',
    },
    {
      id: '1433G',
      name: 'Reducing Delivery Cost',
      rating: 2100,
      tier: 'challenge',
      hints: [
        'There are only m ≤ 1000 roads to try and k ≤ 1000 routes. If you knew every pairwise distance, how fast could you evaluate one choice of free road?',
        'Precompute all-pairs shortest paths once. Making road x–y free only helps a route a → b that crosses it, and then the route costs d[a][x] + d[y][b] or d[a][y] + d[x][b] with the old distances, so each (road, route) pair is O(1).',
        'n = 1000 is too large for Floyd–Warshall, but the graph is sparse, so run Dijkstra from every district: O(n·m log n). Then for each road (x, y) compute the total Σ min(d[a][b], d[a][x] + d[y][b], d[a][y] + d[x][b]) over the routes, and print the smallest total. O(n·m log n + m·k).',
      ],
      solution: 'After zeroing road x–y, a route a → b costs the minimum of its old distance and the two ways of crossing the free road, where the parts before and after the road are old shortest paths (a shortest route never needs the free road twice). Build the distance table with n Dijkstra runs, about 10^7 operations, since Floyd–Warshall at n = 1000 is 10^9. Then try every road against every route in O(m·k) and take the minimum; zeroing a road never makes a route longer, so no separate "change nothing" case is needed.',
    },
  ],
};
