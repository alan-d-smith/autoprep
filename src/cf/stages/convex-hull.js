// Convex hulls and the convex hull trick: primer and problems.
export default {
  id: 'convex-hull',
  title: 'Convex hulls and the convex hull trick',
  track: 'geometry',
  summary: 'Build a convex hull with the monotone chain, use it for containment and extreme-point questions, recognise hulls hiding in prefix sums and parabolas, and speed up DP with the convex hull trick.',
  primer: {
    slides: [
      {
        title: 'The outermost points of a set',
        points: [
          'Fences round trees, points extreme in some direction, one shape inside another: all ask about the outermost points.',
          'Testing all n² pairs as edges against all n points is O(n³), about 10^15 steps for n = 10^5.',
          'The convex hull, the smallest convex polygon containing every point, can be built in O(n log n) instead.',
        ],
        show: [0, 26],
        note: 'The finished hull of 8 points runs 1, 5, 8, 6, 2; points 3, 4 and 7 lie inside or on an edge.',
        say: 'Hull questions are about the outermost points of a set: the shortest fence around n trees, which points can be extreme in some direction, whether one shape fits inside another. A hull edge joins two points with every other point on one side of the line through them, but testing all n² pairs against all n points is O(n³), about 10^15 steps for n = 10^5. The convex hull, the smallest convex polygon containing every point, can be built in O(n log n) instead.',
      },
      {
        title: 'Every corner is a left turn',
        points: [
          'Walking counter-clockwise round a convex polygon, every corner turns left.',
          'Sort the points by x, then y, and walk along the bottom from the leftmost to the rightmost: the lower hull.',
          'A point where the walk turns right or goes straight lies on or above its neighbours\' line, so it is not a corner.',
        ],
        show: [0, 13],
        note: 'The lower hull 1 → 5 → 8: every corner on it turns left.',
        say: 'Walking counter-clockwise round a convex polygon, every corner is a left turn. So sort the points by x, breaking ties by y, and walk along the bottom from the leftmost point to the rightmost; that walk is the lower hull, the part of the hull seen from below. A point where the walk would turn right or go straight on lies on or above the line joining its neighbours, so it is not a corner.',
      },
      {
        title: 'Andrew\'s monotone chain pops right turns',
        points: [
          '`convexHull` scans the sorted points with a stack `h`, testing the turn from its top two points to the next point q.',
          'Before pushing q, pop while o → a → q is not a left turn, cross(o, a, q) ≤ 0, where a is the top of `h` and o the one below.',
          'A second scan from right to left builds the upper hull; joining the chains gives the hull counter-clockwise.',
        ],
        show: [0, 2],
        note: '1 → 2 → 3 turns right (cross = −5), so 2 is popped: it is not on the lower hull.',
        say: 'Andrew\'s monotone chain, `convexHull` in the template, does this with a stack `h`. Scan the sorted points. Before pushing each point q, measure the turn from o, the second-to-top point of h, through a, the top one, to q: cross(o, a, q), the cross product of a − o and q − o, is positive for a left turn. While that turn is not a left turn, pop the top: it is not on the lower hull. A second scan from right to left builds the upper hull the same way, and joining the two chains gives the hull counter-clockwise.',
      },
      {
        title: 'A popped point never returns in that scan',
        points: [
          'A popped point lies on or above the segment from the point below it to q, both of which are in the set.',
          'So it can never be a lower-hull corner, and `h` always holds the lower hull of the points scanned so far.',
          'Each point is pushed once and popped at most once: O(n) per scan, so the sort dominates at O(n log n).',
        ],
        show: [0, 5],
        note: '3 → 4 → 5 turns right, so 4 is popped, and the lower-hull scan never pushes it again (the upper-hull scan starts afresh).',
        say: 'A popped point lies on or above the segment from the point below it to q, both of which are in the set, so it can never be a lower-hull corner, however many points come later. So h always holds the lower hull of the points scanned so far. Each point is pushed once and popped at most once, so each scan is O(n) and the sort dominates: O(n log n) in all.',
      },
      {
        title: 'The convex hull trick for DP',
        points: [
          'In dp[i] = min over j < i of (dp[j] + m_j·x_i), each j is a line, and dp[i] is their lower envelope at x_i.',
          'Trying every j is O(n²). With decreasing slopes and increasing queries, `MonoCHT` keeps the envelope in a deque `L`.',
          'add(m, c) pops back lines while useless(l1, l2, l3) says so; query(x) pops front lines already beaten at x.',
        ],
        say: 'The convex hull trick is the same idea for lines. In a DP like dp[i] = min over j < i of (dp[j] + m_j·x_i), each earlier j is a line with slope m_j and intercept dp[j], and dp[i] is the lowest of those lines at x = x_i, a point on their lower envelope, which is a convex chain. Trying every j is O(n²), 5·10^11 steps for n = 10^6. When slopes arrive in decreasing order and queries in increasing order, `MonoCHT` keeps the envelope in a deque `L` of lines (m, c), each meaning y = m·x + c. Adding a line with add(m, c) first pops the last line l2 while useless(l1, l2, l3) says it can never again be strictly lowest, where l1 is the line before it and l3 the new one. query(x) pops from the front any line already beaten at x, since it stays beaten for every larger x.',
      },
      {
        title: 'Unsorted lines, and problems needing one chain',
        points: [
          'Each line enters and leaves the deque at most once, so the DP is O(n); with unsorted queries, binary search the envelope.',
          'With unsorted slopes too, use a Li Chao tree or KACTL\'s `LineContainer`, at O(log n) per operation.',
          'One chain often suffices: prefix sums as points (i, S_i) turn averages into slopes, and subtracting x² turns parabolas into lines.',
        ],
        say: 'Each line enters the deque once and leaves it at most once, so the whole DP is O(n). With unsorted queries, binary search the envelope instead of popping from the front; with unsorted slopes too, use a Li Chao tree or KACTL\'s `LineContainer`, at O(log n) per operation. Many hull problems need only one chain: the lines through two points with no point strictly above them are the upper-hull edges, prefix sums drawn as points (i, S_i) turn block averages into slopes so the lower hull gives the smallest averages, and parabolas y = x² + bx + c become lines once you subtract x² from y.',
      },
    ],
    terms: [
      'cross(o, a, b): the cross product of a − o and b − o, positive when o → a → b turns left (in the TRD version it is the member function `o.cross(a, b)` of `Point<ll>`).',
      '`convexHull`: Andrew\'s monotone chain, returning the hull counter-clockwise without duplicates or points in the middle of an edge (ConvexHull.h in the TRD has the same name and output).',
      '`h`: the stack holding the chain built so far; its top two points and the next point form the turn being tested.',
      'dp[i]: the DP value at i, a minimum over earlier j.',
      'm_j, x_i: in dp[i] = min over j of (dp[j] + m_j·x_i), the slope that j contributes and the point at which i queries.',
      '`MonoCHT`: the monotone convex hull trick, keeping the lower envelope of lines (the TRD version uses KACTL\'s `LineContainer` instead, which keeps the maximum, writes lines as k·x + m with slope k, and takes lines and queries in any order at O(log n) each; for a minimum, add(−k, −m) and negate query(x)).',
      '`L`: the deque of lines (m, c), each meaning y = m·x + c, in decreasing order of slope.',
      'add(m, c): adds the line y = m·x + c at the back, first popping the lines it makes useless.',
      'query(x): the lowest value of the lines at x, after popping lines from the front that can no longer be lowest.',
      'useless(l1, l2, l3): for the last two lines l1, l2 of `L` and a new line l3, true when l2 is never strictly below both l1 and l3, so l2 can go.',
      'a_i, b_j: input numbers, as in the disguise dp[i] = min_j dp[j] + b_j·a_i, where b_j becomes line j\'s slope and a_i the query point.',
      'S_i: the prefix sum a_1 + … + a_i, with S_0 = 0.',
    ],
    worked: {
      title: 'stepping stones',
      question: 'Stones 1 to 5 lie at positions x = 0, 2, 3, 6 and 8. You start on stone 1 and must reach stone 5, always jumping forward, and a jump from stone j to stone i costs (x_i − x_j)² + K, with K = 17. Find the smallest total cost. The real version has n up to 2·10^5 stones at strictly increasing positions up to 10^6, and K up to 10^12.',
      steps: [
        'Recognise it: dp[i], the cheapest way to reach stone i, is the minimum over j < i of dp[j] + (x_i − x_j)² + K, and trying every j is about n²/2 = 2·10^10 transitions at full size. Expanding the square gives dp[i] = x_i² + K + min over j of (−2·x_j·x_i + dp[j] + x_j²), and the only part that mixes i and j is a product of something about j with x_i: the convex hull trick.',
        'Model it: stone j becomes the line with slope m = −2·x_j and intercept c = dp[j] + x_j², and dp[i] = x_i² + K + (the lowest line at x = x_i). Positions increase, so slopes are added in decreasing order and queries come in increasing order, exactly what `MonoCHT` needs. dp[1] = 0, so line 1 is (m, c) = (0, 0).',
        'Stones 2 and 3: at x = 2 only line 1 is there, value 0, so dp[2] = 4 + 17 + 0 = 21 and line 2 is (−4, 25). At x = 3 line 1 gives 0 and line 2 gives −12 + 25 = 13, so line 1 stays in front, dp[3] = 9 + 17 + 0 = 26, and line 3 is (−6, 35).',
        'Adding line 3 makes line 2 useless: lines 1 and 3 meet at x = 35/6 ≈ 5.8, where both are 0 and line 2 is 25 − 4·35/6 ≈ 1.7, so line 2 is never strictly lowest and add(−6, 35) pops it. The template\'s useless(l1, l2, l3), with l1, l2, l3 lines 1, 2 and 3, agrees: (35 − 0)·(0 − (−4)) = 140 ≤ (25 − 0)·(0 − (−6)) = 150. In the story, no later stone is ever reached more cheaply from stone 2 than from stone 1 or 3.',
        'Stone 4, x = 6: line 3 gives −36 + 35 = −1 ≤ 0, line 1\'s value, so query(6) pops line 1 for good and dp[4] = 36 + 17 − 1 = 52; line 4 is (−12, 88). Stone 5, x = 8: line 3 gives −48 + 35 = −13 and line 4 gives −96 + 88 = −8, so line 3 stays in front and dp[5] = 64 + 17 − 13 = 68.',
        'Answer: 68, by jumping 1 → 3 → 5 at cost (3² + 17) + (5² + 17) = 26 + 42. Each line is added once and popped at most once, so the DP is O(n). dp[i] stays at most 2·10^12 (one jump straight to stone n costs at most 10^12 + 10^12), but the `useless` test multiplies an intercept difference up to 3·10^12 by a slope difference up to 2·10^6, about 6·10^18 and close to the long long limit, so keep the template\'s __int128.',
      ],
    },
    spot: [
      'Questions about the outermost points of a set: the length of a fence around everything, which points can be extreme, whether one shape fits inside another',
      'A DP transition dp[i] = min or max over j of (dp[j] + f(j)·g(i)), a product of something about j and something about i, with n up to 10^5 or 10^6',
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
  static bool useless(pair<ll, ll> l1, pair<ll, ll> l2, pair<ll, ll> l3) {  // l2 is never strictly lowest
    return (__int128)(l3.second - l1.second) * (l1.first - l2.first) <= (__int128)(l2.second - l1.second) * (l1.first - l3.first);
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
        'A convex region contains every segment between two of its points, so B is strictly inside A exactly when all m vertices of B are. That leaves m point-in-convex-polygon queries with n up to 10^5, so each query needs O(log n): binary search over the fan of triangles from one vertex of A.',
        'Reverse A to counter-clockwise order. For a point q: reject unless q is strictly left of A0→A1 and strictly right of A0→A(n−1); binary search the last i with q left of or on the ray A0→Ai; then q is strictly inside exactly when it is strictly left of the edge Ai→A(i+1). Use __int128 for the cross products.',
      ],
      solution: 'Since A is convex, B is strictly inside A exactly when every vertex of B is strictly inside A. Turn A counter-clockwise and fan it from A0: q is strictly inside exactly when cross(A1 − A0, q − A0) > 0, cross(A(n−1) − A0, q − A0) < 0, and cross(A(i+1) − Ai, q − Ai) > 0 for the sector i found by binary search on the sign of cross(Ai − A0, q − A0). Each query is O(log n), so the total is O(n + m log n). Points on an edge of A, including the first and last edges from A0, must give NO, which is why every test is strict; with coordinates up to 10^9 the cross products are computed in __int128.',
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
        'Slopes −x_j decrease as j grows and the query points y_i decrease, so a monotone deque works in O(n) after sorting. To reuse MonoCHT, which keeps a minimum, set z = −y and add each line negated, add(−x_j, −dp[j]); the inner maximum is then −query(−y_i). Read the 10^6 lines fast, use __int128 in the line test, and take the best dp[i] overall.',
      ],
      solution: 'Sort by x ascending; since no rectangle is nested, y is then strictly descending. Rectangle i placed after j adds the strip (x_i − x_j)·y_i to the union, so dp[i] = x_i·y_i − a_i + max(0, max_{j<i}(dp[j] − x_j·y_i)), and the answer is the largest dp[i]. Each j contributes the line y ↦ dp[j] − x_j·y; the slopes decrease and the queries y_i decrease, so keep the upper envelope in a deque and drop lines from the front as queries advance (or reuse a minimum hull such as MonoCHT: add(−x_j, −dp[j]) and take −query(−y_i)), O(n) after an O(n log n) sort. Values reach 10^18, so the intersection comparison needs __int128, and 3·10^6 input numbers need fast reading.',
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
        'Map each point (x, y) to (x, y − x²). The parabola y = x² + bx + c becomes the straight line Y = bx + c, and a point is strictly above the parabola exactly when its image is strictly above the line. So you are counting lines through two points with no point strictly above them: the edges of the upper convex hull.',
        'For each x keep only the highest transformed point, sort by x, and build the upper hull with a monotone stack, popping when the turn is not strictly clockwise so that collinear points merge into one edge. The answer is the number of hull points minus 1. Y reaches about 10^12, so use __int128 for cross products.',
      ],
      solution: 'Subtracting x² maps each U-shaped parabola through two points with different x to the line through their images, and keeps "strictly above" intact. A line through two transformed points has no point strictly above it exactly when it supports the upper convex hull, so the answer is the number of distinct lines along the upper hull. Keep only the largest Y for each x (a lower point with the same x can never lie on such a line), sort by x, and build the upper chain, popping while the cross product is ≥ 0 so that collinear points merge and each line is counted once. The answer is the hull size minus 1, in O(n log n), with cross products in __int128 because the transformed coordinates reach about 10^12.',
    },
  ],
};
