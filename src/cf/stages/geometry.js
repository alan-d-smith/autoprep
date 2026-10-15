// Geometry: cross products, polygons and sweeps: primer and problems.
export default {
  id: 'geometry',
  title: 'Geometry: cross products, polygons and sweeps',
  track: 'geometry',
  summary: 'Answer turn, side, intersection, area and inside/outside questions exactly with integer cross products, and process geometric events in sorted order with a sweep line.',
  primer: {
    idea: 'Treat points as integer vectors. The cross product a × b = a.x·b.y − a.y·b.x is twice the signed area of the triangle (0, a, b): its sign says whether b turns left or right of a, and almost everything else is built from it, including orientation tests, segment intersection, the shoelace area of a polygon, point in polygon and sorting by angle. With integer input these tests are exact in long long (or __int128), so compare in integers and use floating point only for the printed answer. When objects interact along one axis, a sweep line sorts their start and end events and keeps the currently active objects in a set or Fenwick tree, turning O(n²) pair checks into roughly O(n log n).',
    spot: [
      'Integer coordinates up to 10^9 and a yes/no or counting question about turns, sides of lines, intersections or containment',
      'A polygon given as a vertex list, with questions about its area, convexity, orientation or which points lie inside it',
      'Lines or segments where only the order of the objects at certain x positions, or the order of their endpoints, matters',
      'Many axis-parallel segments or rectangles whose interactions must be counted: sort by one coordinate and sweep',
    ],
    disguises: [
      'Is a turn dangerous, or which side of a road is a point on → the sign of one cross product (or of a·x + b·y + c), computed exactly in integers',
      'How many lines separate two points → count the lines for which the two points give a·x + b·y + c of different signs',
      'Do two lines cross inside a vertical strip → sort the lines by height at the left edge and look for an inversion at the right edge',
      'Compare angles between vectors → compare the (dot, |cross|) pairs with another cross product instead of calling atan2',
    ],
    pitfalls: [
      'Overflow: with coordinates up to 10^9 a cross product of differences can reach 8·10^18, at the edge of long long; anything larger, such as a product of two cross products, needs __int128. Never multiply two signed values just to compare their signs.',
      'Floating-point decisions: testing collinearity, "strictly inside" or ties with doubles and an epsilon gives WA on boundary tests. Keep every predicate in integers and convert only the final length or area.',
      'Boundary cases: points on an edge, collinear consecutive vertices, segments that touch without crossing, and the wrap-around from the last vertex back to the first.',
    ],
    code: `// Integer points; exact while |coordinate| <= 1e9 (cross products stay below 9.2e18).
typedef long long ll;
struct P { ll x, y; };
P operator-(P a, P b) { return {a.x - b.x, a.y - b.y}; }
ll cross(P a, P b) { return a.x * b.y - a.y * b.x; }   // > 0: b is counter-clockwise from a
ll dot(P a, P b) { return a.x * b.x + a.y * b.y; }
int orient(P a, P b, P c) { ll v = cross(b - a, c - a); return (v > 0) - (v < 0); }  // +1 = left turn
bool onSeg(P a, P b, P p) { return orient(a, b, p) == 0 && dot(a - p, b - p) <= 0; }
// Do the closed segments ab and cd share a point?
bool segInter(P a, P b, P c, P d) {
  int o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
  if (o1 * o2 < 0 && o3 * o4 < 0) return true;  // proper crossing
  return onSeg(a, b, c) || onSeg(a, b, d) || onSeg(c, d, a) || onSeg(c, d, b);
}
// Shoelace: twice the signed area, positive when the vertices run counter-clockwise.
ll area2(const vector<P> &g) {
  ll s = 0;
  for (size_t i = 0; i < g.size(); i++) s += cross(g[i], g[(i + 1) % g.size()]);
  return s;
}
// Point in simple polygon by ray casting to the right: 1 inside, 0 on the boundary, -1 outside.
int inPoly(const vector<P> &g, P p) {
  bool in = false;
  for (size_t i = 0; i < g.size(); i++) {
    P a = g[i], b = g[(i + 1) % g.size()];
    if (onSeg(a, b, p)) return 0;
    if ((a.y > p.y) != (b.y > p.y) && orient(a, b, p) == (b.y > a.y ? 1 : -1)) in = !in;
  }
  return in ? 1 : -1;
}`,
    resources: [
      { label: 'CP-Algorithms: Basic geometry', url: 'https://cp-algorithms.com/geometry/basic-geometry.html' },
      { label: 'CP-Algorithms: Check if two segments intersect', url: 'https://cp-algorithms.com/geometry/check-segments-intersection.html' },
      { label: 'CP-Algorithms: Area of a simple polygon', url: 'https://cp-algorithms.com/geometry/area-of-simple-polygon.html' },
      { label: 'USACO Guide: Geometry primitives', url: 'https://usaco.guide/plat/geo-pri' },
      { label: 'USACO Guide: Sweep line', url: 'https://usaco.guide/plat/sweep-line' },
    ],
  },
  problems: [
    {
      id: '659D',
      name: 'Bicycle Race',
      rating: 1500,
      tier: 'warmup',
      hints: [
        'Maria starts at the south-western point and heads north. Which way round the lake does that send her, and on which side of her is the water?',
        'Starting north from the lowest, then westernmost, point means the track runs clockwise, so the lake is on her right. Ignoring a turn puts her in the water exactly when the turn is to the left, and the sign of a cross product of consecutive directions tells left from right.',
        'For each vertex p_i with 1 ≤ i ≤ n − 1, compute cross(p_i − p_{i−1}, p_{i+1} − p_i) and count the positive values (left turns). O(n), all in integers.',
      ],
      solution: 'Because the first section goes north from the lowest, then westernmost, point, the track is traversed clockwise and the lake (the polygon\'s interior) is on the right. A turn is dangerous iff going straight on enters the interior, which happens exactly at the left turns of a clockwise walk. Count the vertices p_1..p_{n−1} where cross(p_i − p_{i−1}, p_{i+1} − p_i) > 0; the start vertex is a right turn and never counts. Since every section is axis-parallel, right turns minus left turns is 4, which gives the closed form (n − 4) / 2 as a check.',
    },
    {
      id: '593B',
      name: 'Anton and Lines',
      rating: 1600,
      tier: 'warmup',
      hints: [
        'Look at each line only where it meets the two borders x1 and x2. If two lines cross strictly inside the strip, what happens to their vertical order between x1 and x2?',
        'Two lines cross strictly inside iff their order at x1 is the reverse of their order at x2. So sort the lines by height at x1 and look for a pair whose heights at x2 are out of order: a sweep across the strip that only needs its two ends.',
        'Compute y1 = k·x1 + b and y2 = k·x2 + b in long long, sort the pairs (y1, y2) lexicographically, and answer YES iff some adjacent pair has y2 strictly decreasing. O(n log n).',
      ],
      solution: 'Map every line to (y1, y2), its heights at x1 and x2, computed exactly in long long (up to about 10^12). Lines i and j meet strictly inside the strip iff y1_i − y1_j and y2_i − y2_j have strictly opposite signs. After sorting by (y1, y2) such a pair exists iff the y2 sequence is not non-decreasing, which one scan of adjacent pairs decides. Breaking ties at x1 by y2 keeps lines that meet exactly on the left border from being reported, and testing for a strict decrease ignores lines that meet on the right border.',
    },
    {
      id: '498A',
      name: 'Crazy Town',
      rating: 1700,
      tier: 'core',
      hints: [
        'Every road is an infinite line. Can a route from home to the university avoid crossing a road that has home on one side and the university on the other?',
        'Each road that separates the two points must be crossed at least once, and no other road ever needs crossing. So the answer is the number of separating lines, and "which side of the line" is the sign of a·x + b·y + c.',
        'For each road compute s1 = a·x1 + b·y1 + c and s2 = a·x2 + b·y2 + c in long long and count the roads where the signs differ. Compare the signs directly: s1·s2 can reach 4·10^24 and overflow.',
      ],
      solution: 'A road separates home and the university iff a·x + b·y + c has different signs at the two points, and every route between them must cross each such road, so the answer is at least that count. The straight segment from home to the university (shifted slightly if it passes through an intersection) crosses exactly those roads once each, so the count is achieved. The values reach about 2·10^12, fine in long long, but compare (s1 > 0) with (s2 > 0) instead of multiplying them. O(n).',
    },
    {
      id: '772B',
      name: 'Volatile Kite',
      rating: 1800,
      tier: 'core',
      hints: [
        'What is the cheapest way to break convexity? Think about one vertex and its two neighbours only.',
        'Convexity breaks once some vertex p_i can reach the line through its neighbours. Its distance to that line is |cross(p_{i+1} − p_{i−1}, p_i − p_{i−1})| divided by |p_{i+1} − p_{i−1}| (twice the triangle area over the base), and moving the vertex and its neighbours towards each other closes the gap at half the cost.',
        'The answer is the minimum over all i of h_i / 2, where h_i is that distance, including the wrap-around triples. Compute the cross product exactly (__int128, since differences reach 2·10^9) and do only the final division in long double. O(n).',
      ],
      solution: 'For each vertex let h_i be the distance from p_i to the line through p_{i−1} and p_{i+1}, computed as |cross(p_{i+1} − p_{i−1}, p_i − p_{i−1})| / |p_{i+1} − p_{i−1}|. Moving p_i by h_i / 2 towards that line and both neighbours by h_i / 2 towards p_i makes the three points collinear, and no smaller D can do it, so the answer is min_i h_i / 2. The cross product is exact in __int128 and the division is the only floating-point step. Remember the triples that wrap around the end of the vertex list.',
    },
    {
      id: '1299B',
      name: 'Aerodynamic',
      rating: 1800,
      tier: 'core',
      hints: [
        'Try small cases: for a triangle T is a hexagon, and for a square T is a square. What property must P have for T to look like P?',
        'T is the set of all differences A − B with A and B in P, so T is always centrally symmetric (if v is in T, so is −v). P and T can only be similar if P is centrally symmetric too, and then T is just P scaled by 2. That is a check on vertex vectors, with no areas or angles.',
        'Answer NO if n is odd. Otherwise check that p_i + p_{i+n/2} is the same vector for every i < n/2 (twice the centre, so it stays in integers). O(n).',
      ],
      solution: 'T = P + (−P) is centrally symmetric for every P, and similarity preserves central symmetry, so P must be centrally symmetric; conversely, if it is, T is P scaled by 2 about its centre. For a convex polygon listed in order, central symmetry means n is even and each vertex p_i and its opposite p_{i+n/2} have the same midpoint. Compare the sums p_i + p_{i+n/2} in long long instead of halving them, so no fractions appear. O(n).',
    },
    {
      id: '961D',
      name: 'Pair Of Lines',
      rating: 2000,
      tier: 'core',
      hints: [
        'With up to 10^5 points you cannot try every pair of lines. If an answer exists, what can you say about the first three points?',
        'Two lines cover three points only if two of those points share a line (pigeonhole). So one of the lines through (p0, p1), (p0, p2) or (p1, p2) belongs to any valid answer.',
        'For each of the three candidate lines, set aside the points on it (cross product zero) and check that the rest are collinear, again with cross products. Coordinates reach 10^9, so compute cross products in __int128. O(n); with n ≤ 4 the answer is YES.',
      ],
      solution: 'If n ≤ 4, answer YES. Otherwise two of p0, p1, p2 lie on the same line of any valid pair, so that line is one of the three lines through two of them. For each candidate, collect the points not on it and test whether they are all collinear with the first two leftovers; zero, one or two leftovers always pass. Every test is the sign of a cross product: coordinate differences reach 2·10^9, so the products are near the long long limit and __int128 removes any doubt. Three candidates of O(n) each give O(n).',
    },
    {
      id: '1194E',
      name: 'Count The Rectangles',
      rating: 2200,
      tier: 'challenge',
      hints: [
        'A rectangle is fixed by a bottom and a top horizontal segment plus two vertical segments that reach both. If you fix the bottom segment, what do you need to know about each vertical segment?',
        'Fix the bottom h1 and keep only the verticals that cross it. For a top segment h2 above it, the usable verticals are those that still reach h2.y and whose x lies in the overlap of h1 and h2; c of them give c(c − 1)/2 rectangles. Sweeping h2 upwards, verticals only ever drop out, so this is a sweep line over y with a Fenwick tree over x.',
        'Sort horizontals by y. For each h1: add the verticals crossing it to a Fenwick tree indexed by x and sort them by top end; walk h2 upwards, removing verticals whose top is below h2.y, then count the ones in [max(x1), min(x2)] with a range query. O(n² log C) with C = 10^4.',
      ],
      solution: 'Split the segments into horizontal and vertical ones and sort the horizontals by y. For each bottom segment h1, take the verticals v with h1.x1 ≤ v.x ≤ h1.x2 and v.y1 ≤ h1.y ≤ v.y2, add 1 at position v.x in a Fenwick tree, and sort them by top end. Sweep the horizontals h2 above h1 in increasing y: first remove the verticals whose top is below h2.y, since they reach neither h2 nor anything higher, then let c be the number left with x in [max(h1.x1, h2.x1), min(h1.x2, h2.x2)] and add c(c − 1)/2. Empty the tree before the next h1. The total is O(n² log C), and the answer can reach about 10^13, so use long long.',
    },
    {
      id: '598C',
      name: 'Nearest vectors',
      rating: 2300,
      tier: 'challenge',
      hints: [
        'The pair with the smallest angle must be neighbours in some ordering of the vectors. Which ordering?',
        'Sort the vectors by polar angle; the minimum non-oriented angle is between two cyclically adjacent vectors, including the last and the first. The real difficulty is precision: two candidate angles can differ by less than double can resolve, so compare them in integers instead of with atan2.',
        'Polar-sort exactly: by half-plane first (y > 0, or y = 0 and x > 0), then by cross product. The angle between neighbours u and v is the direction of the vector (dot(u, v), |cross(u, v)|), which lies in the upper half-plane, so compare two such angles by the sign of their cross product. Everything fits in long long; O(n log n).',
      ],
      solution: 'Sort the vectors by angle without floating point: the half-plane {y > 0} ∪ {y = 0, x > 0} comes first, and inside a half a goes before b iff cross(a, b) > 0. For each of the n cyclic neighbour pairs, the non-oriented angle equals atan2(|cross|, dot), so represent it by the point (dot, |cross|), whose coordinates are at most 2·10^8 in absolute value. Angle 1 is smaller than angle 2 iff cross((dot1, |cross1|), (dot2, |cross2|)) > 0, a value below 10^17 and exact in long long. Keep the best pair and print its original indices. Plain double atan2 is known to fail on this problem; long double atan2l is the common workaround, but the integer comparison removes the question.',
    },
  ],
};
