// Dijkstra, Floyd–Warshall and state graphs: primer and problems.
export default {
  id: 'shortest-paths',
  title: 'Dijkstra, Floyd–Warshall and state graphs',
  track: 'graphs',
  summary: 'Compute single-source and all-pairs shortest paths, run Dijkstra over expanded states, and reuse a distance table to answer "what if this road changes" questions.',
  primer: {
    slides: [
      {
        title: 'When edges have different costs',
        points: [
          'Find the least total cost from a start to every vertex, or to one target, when each edge has a weight.',
          'BFS counts edges, not cost: S → A costs 4, but S → B → A costs 1 + 2 = 3.',
          'Listing paths is exponential, and improving distances edge by edge until nothing changes can take n − 1 passes, about 10^10 steps.',
        ],
        show: [0, 17],
        note: 'Dijkstra\'s finished tree: S to T costs 7, and the direct edge S → A (4) lost to S → B → A (3).',
        say: 'The question: the least total cost from a start to every vertex, or to one target, when each edge has a weight. BFS answers it only when every edge costs the same: from S, the edge S → A of weight 4 is a single edge, but S → B → A with weights 1 and 2 costs 3. Listing every path is exponential, and improving distances edge by edge until nothing changes can take n − 1 passes over all m edges, about 10^10 steps for n = 10^5 vertices and m = 10^5 edges.',
      },
      {
        title: 'Settle the closest unknown vertex first',
        points: [
          'With no negative weights, the unknown vertex with the smallest tentative distance is already final.',
          'Any other route must leave the known vertices somewhere, already costing at least as much, and can only add more.',
          'So distances are fixed one at a time in increasing order, as BFS fixes them layer by layer.',
        ],
        show: [0, 4],
        note: 'B has the smallest tentative distance, 1, so it is settled: nothing can reach it more cheaply.',
        say: 'Suppose no weight is negative. Among the vertices whose distance is not yet known, take the one with the smallest tentative distance, the best found so far through vertices already known: no other route can beat it, because such a route has to leave the known vertices somewhere, already costs at least as much at that point, and can only add more. So distances can be fixed one vertex at a time in increasing order, much as BFS fixes them layer by layer.',
      },
      {
        title: 'Dijkstra\'s algorithm with a priority queue',
        points: [
          'dist[v] is the best distance found so far (`INF` until reached); the min-heap `pq` holds pairs (d, v).',
          'Pop the smallest pair; if d differs from dist[v] it is stale, so skip it. Otherwise v is settled.',
          'Relax each edge v → u of weight w: if d + w beats dist[u], update it, set par[u] = v and push the new pair.',
        ],
        show: [0, 5],
        note: 'Relaxing B → A lowers dist[A] from 4 to 3; the old pair (4, A) stays in the queue, now stale.',
        say: 'Dijkstra\'s algorithm does this with a priority queue. dist[v] holds the best distance found so far from the start `src` (INF until v is reached, 0 for `src`), and the min-heap `pq` holds pairs (d, v), each meaning "v can be reached at cost d". Pop the smallest pair. If d differs from dist[v], the pair is stale, left over from before an improvement, so skip it. Otherwise v is settled, meaning dist[v] is final. Relax each edge in adj[v] from v to u with weight w: if d + w < dist[u], set dist[u] = d + w, record par[u] = v and push (dist[u], u). Pushing a new pair instead of updating the old one keeps the code short. Following par[u] back from any vertex u gives a shortest path to it.',
      },
      {
        title: 'Why the popped distance is final',
        points: [
          'Suppose some path to v were shorter than d, and let u be its first unsettled vertex.',
          'The vertex before u is settled, so its edge into u was relaxed: dist[u] < d, and u would leave `pq` first.',
          'Each vertex settles once: at most m + 1 pushes, O((n + m) log m). A negative weight breaks the argument.',
        ],
        say: 'Why it is right: suppose some path to v were shorter than the popped d, and let u be its first vertex that is not yet settled. The vertex before u on that path is settled, so its edge into u was relaxed and dist[u] is at most the path\'s length up to u, which is below d because the rest of the path costs at least 0. Then (dist[u], u) would have come out of `pq` before (d, v). Each vertex is settled once and each edge relaxed once, so at most m + 1 pairs are pushed and the total is O((n + m) log m). A negative weight breaks the argument, which is why Dijkstra needs every weight ≥ 0.',
      },
      {
        title: 'Put what you carry in the vertex',
        points: [
          'Dijkstra only looks at edges, so a vertex can be a state: (city, coupons used), (vertex, riding or not).',
          'When an edge\'s cost depends on something you carry or have done, put that in the vertex.',
          'If what you carry takes K values c = 0 to K − 1, number state (v, c) as v·K + c: n·K vertices, and the same code runs on them.',
        ],
        say: 'Dijkstra never looks at what a vertex means, only at its edges, so a vertex can be a state: (city, best bike owned), (vertex, riding or not), (city, coupons used). When the cost of an edge depends on something you carry or have done, put that thing in the vertex. If it takes K values c from 0 to K − 1, number the state (v, c) as v·K + c: the graph has n·K vertices, and the same dijkstra runs on it unchanged.',
      },
      {
        title: 'All pairs at once with Floyd–Warshall',
        points: [
          'd[i][j] starts as the edge weights, with `INF` where there is no edge and 0 on the diagonal.',
          'For k = 0 to n − 1, d[i][j] = min(d[i][j], d[i][k] + d[k][j]); after pass k, stopovers lie among vertices 0 to k.',
          'O(n³), about 1.25·10^8 for n = 500; the table turns "add a road" or "visit these in order" into arithmetic or a small DP.',
        ],
        say: 'For all pairs at once, Floyd–Warshall keeps a table d[i][j] that starts as the edge weights (INF where there is no edge, 0 on the diagonal) and, for k = 0 to n − 1 in the outer loop, sets d[i][j] = min(d[i][j], d[i][k] + d[k][j]) for every i and j. After the pass for k, d[i][j] is the shortest path from i to j whose stopovers all lie among vertices 0 to k, so the outer loop can add vertices one at a time, in any order you choose. It costs O(n³), about 1.25·10^8 for n = 500. With the finished table, "change one road", "add a road" or "visit these places in some order" become arithmetic or a small DP over table entries.',
      },
    ],
    terms: [
      'adj[v]: the edges out of v, as pairs (u, w): an edge from v to u with weight w (the TRD version stores the same pairs but names the popped vertex u and its neighbour v: adj[u] holds {v, w}, and it sets par[v] = u).',
      '`src`: the start vertex (`s` in the TRD version).',
      'dist[v]: the best distance from `src` to v found so far, final once v is settled, and INF if v is unreachable (LLONG_MAX in the TRD version). In the worked question, dist[v][0] and dist[v][1] are the best distances to the states "at v, coupon unused" and "at v, coupon used".',
      '`pq`: a min-heap of pairs (d, v), each saying v can be reached at cost d; a popped pair whose d differs from dist[v] is stale and skipped.',
      'par[u]: the vertex before u on a shortest path from `src`; the edges from par[u] to u form the shortest-path tree (in the TRD version, `path(t)` follows them back).',
      '`INF`: the stand-in for "unreachable", LLONG_MAX / 4, so that adding to it cannot overflow (`inf`, which is 2^62, in KACTL\'s FloydWarshall.h).',
      'd[i][j]: the Floyd–Warshall table: edge weights at first, the shortest distance from i to j at the end (`m[i][j]` in the TRD version).',
      '`k`: the Floyd–Warshall outer loop; after its pass for k, d[i][j] uses only vertices 0 to k as stopovers.',
      '`K`: in a state graph, how many values c = 0 to K − 1 the thing you carry can take; state (v, c) is vertex v·K + c (`stateId(city, c, K)` in the TRD version).',
      'd1[v]: in a two-person problem, the distance to v from the first person\'s start, from one Dijkstra run.',
      'd2[v]: the distance to v from the second person\'s start, from a second run.',
    ],
    worked: {
      title: 'one flight at half price',
      question: 'There are n = 5 cities and m = 5 one-way flights: from 1 to 2 costing 4, from 2 to 3 costing 4, from 3 to 5 costing 4, from 1 to 4 costing 14 and from 4 to 5 costing 2. You hold one coupon that halves the price of a single flight (every price is even). Find the cheapest way from city 1 to city n. The real version has n up to 10^5, m up to 2·10^5 and prices up to 10^9, and city n is always reachable.',
      steps: [
        'Recognise it: the cheapest route with non-negative prices is Dijkstra, but what a flight costs depends on whether the coupon is still unused, so that belongs in the vertex. Shortcuts fail: the cheapest route without the coupon is 1 → 2 → 3 → 5 at 12, and halving one of its flights gives 10, which is not the best; rerunning Dijkstra once per flight with that flight halved is m runs, about 10^12 steps at full size.',
        'Model it: state (v, c) means "at city v, with c coupons used", so (v, 0) and (v, 1), 2n states in all. Number (v, c) as 2v + c (K = 2) and the template\'s dijkstra runs on them unchanged, with dist[v][c] at index 2v + c. A flight u → v of price p gives three edges: (u, 0) to (v, 0) costing p, (u, 0) to (v, 1) costing p / 2, and (u, 1) to (v, 1) costing p. Run Dijkstra from (1, 0) with dist[1][0] = 0, and stop at the first state of city n that comes out of `pq`.',
        'Pop dist[1][0] = 0: the flight to 2 sets dist[2][0] = 4 and dist[2][1] = 2, and the flight to 4 sets dist[4][0] = 14 and dist[4][1] = 7. Pop dist[2][1] = 2: dist[3][1] = 2 + 4 = 6. Pop dist[2][0] = 4: dist[3][0] = 4 + 4 = 8, while the coupon option, 4 + 2 = 6, does not beat the 6 already in dist[3][1].',
        'Pop dist[3][1] = 6: dist[5][1] = 6 + 4 = 10. Pop dist[4][1] = 7: the flight to 5 gives 7 + 2 = 9, better than 10, so dist[5][1] = 9, and the pair (10, (5, 1)) still in `pq` is now stale. Pop dist[3][0] = 8: dist[5][0] = 8 + 4 = 12, and the coupon option, 8 + 2 = 10, does not beat 9. The next pop is (9, (5, 1)), the first state of city 5, so stop.',
        'Answer: 9, by flying from 1 to 4 with the coupon for 7, then from 4 to 5 for 2. Dijkstra on 2n states and 3m edges is O((n + m) log m). Costs reach about 10^5 · 10^9 = 10^14, so dist must be long long, with an INF that leaves room for adding a price.',
      ],
    },
    spot: [
      'Weighted edges with non-negative weights, and the question asks for the least total time, cost or distance from a start.',
      'The cost of an edge depends on something you carry or have done (a bike, a horse, a ticket, fuel, discounts used): make that part of the vertex.',
      'n is at most a few hundred and the question involves many pairs, or vertices and roads are added over time (or removed, if you can read the removals in reverse as additions): Floyd–Warshall, then an O(n²) relaxation per addition.',
      'You may change one road, or must visit a few special places: precompute distances from the relevant sources once, then combine table entries.',
    ],
    disguises: [
      'Delete vertices one by one and report a sum over all pairs before each deletion → reverse the order and add the vertices as the k of Floyd–Warshall.',
      'Costs depend on an item picked up earlier (a bike, a horse, a coupon) → Dijkstra over states (vertex, item), n states per item value.',
      'Two people travel and meet at a vertex as early as possible → one Dijkstra from each start; meeting at v takes max(d1[v], d2[v]), so minimise that over v.',
      'Make one road free, or add one road, and minimise a sum of route lengths → with all-pairs distances, route a → b becomes min(d[a][b], d[a][x] + w + d[y][b], d[a][y] + w + d[x][b]) for road x–y of new length w.',
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
        'Compute each traveller\'s earliest arrival at every vertex separately; the answer is the minimum over v of max(d1[v], d2[v]). Each traveller is a single-source shortest path whose state also says whether they are riding, because riding halves every later edge.',
        'Run Dijkstra twice (from 1 and from n) over states (v, riding) with riding ∈ {0, 1}: at a horse vertex, (v, 0) → (v, 1) costs 0; an edge costs w on foot and w/2 when riding. From the run from 1, let d1[v] be the better of v\'s two states, and from the run from n, d2[v]; then print min over v of max(d1[v], d2[v]), or −1 if it is infinite. O((n + m) log n).',
      ],
      solution: 'Because waiting is allowed, the earliest meeting at v is max(d1[v], d2[v]), where d1[v] is Marian\'s fastest arrival from 1 and d2[v] is Robin\'s from n. Each is a Dijkstra on 2n states (vertex, mounted) with a free move onto a horse at horse vertices and halved edge costs once mounted (all w are even, so w/2 is exact). The minimum over all v covers every meeting point. Reset everything between test cases and print −1 when 1 and n are disconnected.',
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
