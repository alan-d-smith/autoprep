// Convex hulls and the convex hull trick: primer and problems.
export default {
  id: 'convex-hull',
  title: 'Convex hulls and the convex hull trick',
  track: 'geometry',
  summary: 'Build a convex hull with the monotone chain, use it for containment and extreme-point questions, recognise hulls hiding in prefix sums and parabolas, and speed up DP with the convex hull trick.',
  primer: {
    idea: 'The convex hull is the smallest convex polygon containing a point set. Andrew\'s monotone chain builds it in O(n log n): sort the points by x, then sweep once for the lower hull and once for the upper hull, popping the last point while it does not make a left turn. Many problems need only one chain: the upper hull consists of the lines through two points with no point above them, and the lower hull of prefix-sum points gives the smallest averages. The convex hull trick is the same idea for lines: the minimum of lines m·x + c is a lower envelope, so a DP of the form dp[i] = min_j (dp[j] + m_j·x_i) runs in O(n) instead of O(n²) when slopes and queries arrive in sorted order.',
    spot: [
      'Questions about the outermost points of a set: the length of a fence around everything, which points can be extreme, whether one shape fits inside another',
      'A DP transition dp[i] = min or max over j of (dp[j] + f(j)·g(i)), a product of something about j and something about i, with n up to 10^5–10^6',
      'Averages, slopes or rates built from prefix sums, such as choosing blocks with the smallest average',
      'Curves like y = x² + bx + c through pairs of points, which become straight lines after a change of variables',
    ],
    disguises: [
      'Repeatedly averaging segments to get the lexicographically smallest sequence → the lower convex hull of the prefix-sum points (i, S_i); each hull edge is a block whose value is the edge\'s slope',
      'Parabolas y = x² + bx + c with no point strictly above → set Y = y − x², which turns them into lines, and count upper-hull edges',
      'Splitting time between activities with different rates to reach several targets → the achievable rates form the convex hull of the activity vectors; find where the ray towards the target leaves it',
      'dp[i] = min_j dp[j] + b_j·a_i with sorted a and b → each j is a line with slope b_j, and each step is a query on the lower envelope',
    ],
    pitfalls: [
      'Collinear and duplicate points: decide whether points on hull edges belong to the hull (popping on <= 0, as in the template, drops them) and remove duplicates first; a hull of one or two points must still work.',
      'Overflow in the convex hull trick: the test for a useless line multiplies an intercept difference (up to about 10^18) by a slope difference, so use __int128 or long double. Lines with equal slopes need explicit handling (keep the better intercept).',
      'The monotone trick assumes sorted slopes and sorted queries. If queries are unsorted, binary search over the envelope instead of popping from the front; if slopes are unsorted too, use a Li Chao tree.',
    ],
    code: `typedef long long ll;
struct P { ll x, y; };
ll cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
// Andrew's monotone chain: counter-clockwise hull, collinear and duplicate points dropped, O(n log n).
vector<P> convexHull(vector<P> p) {
  sort(p.begin(), p.end(), [](P a, P b) { return a.x < b.x || (a.x == b.x && a.y < b.y); });
  p.erase(unique(p.begin(), p.end(), [](P a, P b) { return a.x == b.x && a.y == b.y; }), p.end());
  if (p.size() < 3) return p;
  vector<P> h;
  for (int pass = 0; pass < 2; pass++) {  // pass 0 builds the lower hull, pass 1 the upper hull
    size_t start = h.size();
    for (P q : p) {
      while (h.size() >= start + 2 && cross(h[h.size() - 2], h.back(), q) <= 0) h.pop_back();
      h.push_back(q);
    }
    h.pop_back();  // the last point starts the other half
    reverse(p.begin(), p.end());
  }
  return h;
}
// Convex hull trick: min of lines m*x + c; slopes strictly decreasing, queries non-decreasing, O(n) total.
struct MonoCHT {
  deque<pair<ll, ll>> L;  // (m, c)
  static bool useless(pair<ll, ll> a, pair<ll, ll> b, pair<ll, ll> c) {  // b is never strictly lowest
    return (__int128)(c.second - a.second) * (a.first - b.first) <= (__int128)(b.second - a.second) * (a.first - c.first);
  }
  void add(ll m, ll c) {
    while (L.size() >= 2 && useless(L[L.size() - 2], L.back(), {m, c})) L.pop_back();
    L.push_back({m, c});
  }
  ll query(ll x) {
    while (L.size() >= 2 && L[1].first * x + L[1].second <= L[0].first * x + L[0].second) L.pop_front();
    return L[0].first * x + L[0].second;
  }
};`,
    resources: [
      { label: 'CP-Algorithms: Convex hull construction', url: 'https://cp-algorithms.com/geometry/convex-hull.html' },
      { label: 'CP-Algorithms: Convex hull trick and Li Chao tree', url: 'https://cp-algorithms.com/geometry/convex_hull_trick.html' },
      { label: 'CP-Algorithms: Point location in a convex polygon', url: 'https://cp-algorithms.com/geometry/point-in-convex-polygon.html' },
      { label: 'USACO Guide: Convex hull trick', url: 'https://usaco.guide/plat/convex-hull-trick' },
    ],
  },
  problems: [
    {
      id: '50C',
      name: 'Happy Farm 5',
      rating: 2000,
      tier: 'warmup',
      hints: [
        'The path must enclose every cow, and a shortest closed path around a set of points follows the outermost ones. What does it cost to walk from one outer cow to the next when the shepherd can also step diagonally?',
        'Only the convex hull of the cows matters. With diagonal steps, going from one hull vertex to the next takes max(|dx|, |dy|) moves (the Chebyshev distance), so the answer is the hull perimeter measured that way, plus a constant for keeping the cows strictly inside.',
        'Build the hull with the monotone chain after removing duplicate cows, sum max(|dx|, |dy|) over its edges, and add 4. A single point gives 4, and for collinear cows the hull is a segment counted once in each direction.',
      ],
      solution: 'Compute the convex hull of the cows with Andrew\'s monotone chain in O(n log n). Each hull edge from (x1, y1) to (x2, y2) costs max(|x2 − x1|, |y2 − y1|) moves with eight-direction steps, and keeping the herd strictly inside adds exactly 4 moves in total (check it on a single cow: the shortest loop around one point is 4 diagonal steps). So the answer is 4 plus the sum of the Chebyshev lengths of the hull edges, all in integers. Handle degenerate hulls: when all cows share a point the hull has no edges, and when they are collinear it is a segment walked there and back.',
    },
    {
      id: '166B',
      name: 'Polygons',
      rating: 2100,
      tier: 'warmup',
      hints: [
        'A is convex. If every vertex of B is strictly inside A, can any point of B still be outside?',
        'A convex region contains every segment between two of its points, so B is strictly inside A iff all m vertices of B are. That leaves m point-in-convex-polygon queries with n up to 10^5, so each query needs O(log n): binary search over the fan of triangles from one vertex of A.',
        'Reverse A to counter-clockwise order. For a point q: reject unless q is strictly left of A0→A1 and strictly right of A0→A(n−1); binary search the last i with q left of or on the ray A0→Ai; then q is strictly inside iff it is strictly left of the edge Ai→A(i+1). Use __int128 for the cross products.',
      ],
      solution: 'Since A is convex, B is strictly inside A iff every vertex of B is strictly inside A. Turn A counter-clockwise and fan it from A0: q is strictly inside iff cross(A1 − A0, q − A0) > 0, cross(A(n−1) − A0, q − A0) < 0, and cross(A(i+1) − Ai, q − Ai) > 0 for the sector i found by binary search on the sign of cross(Ai − A0, q − A0). Each query is O(log n), so the total is O(n + m log n). Points on an edge of A, including the first and last edges from A0, must give NO, which is why every test is strict; with coordinates up to 10^9 the cross products are computed in __int128.',
    },
    {
      id: '1299C',
      name: 'Water Balance',
      rating: 2100,
      tier: 'core',
      hints: [
        'In the final sequence the tanks fall into blocks, each set to its own average. How should the first block be chosen to make the first value as small as possible?',
        'The first value is minimised by the prefix with the smallest average, and then the same rule repeats on the rest. Draw the prefix sums as points (i, S_i): a block\'s average is the slope between two of these points, so the optimal blocks are exactly the edges of the lower convex hull.',
        'Build that hull with a stack of blocks (sum, length): push each tank as its own block and, while the block below has an average ≥ the top block\'s, merge them. Compare averages by cross-multiplying in long long and print each block\'s average to 9 decimals. O(n).',
      ],
      solution: 'Treat the prefix sums as points P_i = (i, S_i). Making the first value small means choosing the prefix with the smallest slope from P_0, which is the first edge of the lower convex hull of these points; the later blocks follow the later hull edges, with increasing slopes. A stack does this in O(n): each tank starts a block (a_i, 1), and while the block below has average ≥ the top one (sum_below·len_top ≥ sum_top·len_below, exact in long long since sums ≤ 10^12 and lengths ≤ 10^6), merge them. Print sum / len once per tank in the block. With n = 10^6, read integers rather than doubles and buffer the output.',
    },
    {
      id: '319C',
      name: 'Kalila and Dimna in the Logging Industry',
      rating: 2100,
      tier: 'core',
      hints: [
        'Once tree i is cut completely, every later charge costs b_i or less, and once tree n is cut, charging is free. Which trees are worth cutting completely, and in what order?',
        'Cut a chain of trees completely in increasing index order, ending at tree n; every other tree is finished afterwards for free. Moving from tree j to tree i costs a_i charges at b_j each, so dp[i] = min_{j<i} dp[j] + b_j·a_i. Each j is a line with slope b_j evaluated at x = a_i: a lower-envelope query.',
        'Slopes b_j arrive in decreasing order and the query points a_i in increasing order, so the monotone convex hull trick with a deque gives O(n). dp values reach 10^18, so do the useless-line test in __int128. The answer is dp[n].',
      ],
      solution: 'Let dp[i] be the minimum cost until tree i is cut completely; dp[1] = 0 because a_1 = 1 uses the initial charge. If j was the last tree cut completely before i, cutting tree i costs a_i charges at b_j each, so dp[i] = min_{j<i} (dp[j] + b_j·a_i), and after tree n every charge is free, so the answer is dp[n]. Each j is the line y = b_j·x + dp[j]; slopes decrease and query points increase, so a deque-based convex hull trick answers all queries in O(n) total. Compare intersection points by cross-multiplying in __int128, because intercepts reach 10^18 and slopes 10^9.',
    },
    {
      id: '1083E',
      name: 'The Fair Nut and Rectangles',
      rating: 2400,
      tier: 'core',
      hints: [
        'No rectangle contains another, so sorting by x also sorts y in the opposite order. For a chosen set in that order, what does the union look like, and how much area does each new rectangle add?',
        'With x increasing and y decreasing the union is a staircase: adding rectangle i after j adds (x_i − x_j)·y_i. So dp[i] = x_i·y_i − a_i + max(0, max_{j<i} dp[j] − x_j·y_i), and the inner maximum is over lines with slope −x_j evaluated at y_i: the convex hull trick.',
        'Slopes −x_j decrease as j grows and the query points y_i decrease, so a monotone deque works in O(n) after sorting (substitute z = −y if you want the min-with-increasing-queries form). Read the 10^6 lines fast, use __int128 in the line test, and take the best dp[i] overall.',
      ],
      solution: 'Sort by x ascending; since no rectangle is nested, y is then strictly descending. Rectangle i placed after j adds the strip (x_i − x_j)·y_i to the union, so dp[i] = x_i·y_i − a_i + max(0, max_{j<i}(dp[j] − x_j·y_i)), and the answer is the largest dp[i]. Each j contributes the line y ↦ dp[j] − x_j·y; the slopes decrease and the queries y_i decrease, so keep the upper envelope in a deque and drop lines from the front as queries advance (or negate, z = −y, and reuse a min-hull with increasing queries), O(n) after an O(n log n) sort. Values reach 10^18, so the intersection comparison needs __int128, and 3·10^6 input numbers need fast reading.',
    },
    {
      id: '605C',
      name: 'Freelancer\'s Dreams',
      rating: 2400,
      tier: 'challenge',
      hints: [
        'Splitting a day between projects gives a daily rate that is a weighted average of the projects\' vectors (a_i, b_i). Which daily rates can Mikhail achieve?',
        'The achievable daily rates are the convex hull of the points (a_i, b_i). Because he needs only at least p and q, the dominated corners (max a, 0), (0, max b) and (0, 0) can be added. In T days he collects T·rate, so the best rate is the hull point furthest along the ray from the origin towards (p, q).',
        'Build the hull of all points plus the three corners. For each hull edge u→v whose endpoints are not both strictly on the same side of the line through the origin and (p, q), intersect: t = cross(u, v) / cross((p, q), v − u). The largest t is where the ray leaves the hull, and the answer is 1 / t. O(n log n).',
      ],
      solution: 'Working on project i for a fraction of each day gives a convex combination of the vectors (a_i, b_i), so in T days Mikhail can collect exactly T times any point of their convex hull. Only "at least p and q" matters, so adding (max a, 0), (0, max b) and the origin changes nothing and turns the region into everything the projects dominate. The best rate is t·(p, q) with the largest t inside this hull, found by intersecting the ray from the origin through (p, q) with every hull edge it can cross; then T = 1 / t. Hull building and the side tests are exact in long long (coordinates ≤ 10^6); only the final t and 1 / t are floating point.',
    },
    {
      id: '1142C',
      name: 'U2',
      rating: 2400,
      tier: 'challenge',
      hints: [
        'Every parabola here has the same x² term. What happens to a parabola, and to "strictly above it", if you subtract x² from every y?',
        'Map each point (x, y) to (x, y − x²). The parabola y = x² + bx + c becomes the straight line Y = bx + c, and a point is strictly above the parabola iff its image is strictly above the line. So you are counting lines through two points with no point strictly above them: the edges of the upper convex hull.',
        'For each x keep only the highest transformed point, sort by x, and build the upper hull with a monotone stack, popping when the turn is not strictly clockwise so that collinear points merge into one edge. The answer is the number of hull points minus 1. Y reaches about 10^12, so use __int128 for cross products.',
      ],
      solution: 'Subtracting x² maps each U-shaped parabola through two points with different x to the line through their images, and keeps "strictly above" intact. A line through two transformed points has no point strictly above it iff it supports the upper convex hull, so the answer is the number of distinct lines along the upper hull. Keep only the largest Y for each x (a lower point with the same x can never lie on such a line), sort by x, and build the upper chain, popping while the cross product is ≥ 0 so that collinear points merge and each line is counted once. The answer is the hull size minus 1, in O(n log n), with cross products in __int128 because the transformed coordinates reach about 10^12.',
    },
  ],
};
