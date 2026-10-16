// Geometry: cross products, polygons and sweeps: primer and problems.
export default {
  id: 'geometry',
  title: 'Geometry: cross products, polygons and sweeps',
  track: 'geometry',
  summary: 'Answer turn, side, intersection, area and inside/outside questions exactly with integer cross products, and process geometric events in sorted order with a sweep line.',
  primer: {
    slides: [
      {
        title: 'Doubles cannot tell close directions apart',
        points: [
          'Coordinates are integers up to 10^9; the questions are discrete, such as which way a path turns or whether segments touch.',
          'Angles from `atan2`, slopes y / x and intersection points in doubles are not exact.',
          '(10^9, 10^9 − 1) and (10^9 − 1, 10^9 − 2) differ by about 5·10^-19 radians, so `atan2` and slopes see one direction.',
        ],
        say: 'Geometry questions here come with integer coordinates up to 10^9 and ask something discrete: does the path turn left at this corner, do two segments touch, is a point inside a polygon, outside it or on its edge. The obvious tools, angles from atan2, slopes y / x and intersection points in doubles, are not exact. The directions (10^9, 10^9 − 1) and (10^9 − 1, 10^9 − 2) differ by about 5·10^-19 radians, far below the spacing of doubles near π/4 (about 10^-16), so atan2 returns the same angle for both and their slopes come out equal too; slopes also fail outright on vertical lines.',
      },
      {
        title: 'The cross product decides the turn',
        points: [
          'cross(a, b) = a.x·b.y − a.y·b.x is twice the signed area of the triangle with corners 0, a and b.',
          'It is positive when b is counter-clockwise from a, negative when clockwise, and zero when they are collinear.',
          'It needs only multiplication and subtraction, so on integers it is exact: for the two close directions it is exactly −1.',
        ],
        show: [0, 3],
        note: 'cross(a, b) = 10 > 0: b is counter-clockwise from a, and 10 is the parallelogram\'s area.',
        say: 'One exact number decides almost all of these: the cross product of two vectors, cross(a, b) = a.x·b.y − a.y·b.x. It is twice the signed area of the triangle with corners at the origin, a and b: positive when b is counter-clockwise from a, negative when clockwise, zero when they are collinear. It needs only multiplication and subtraction, so with integer input it is exact; for the two directions that atan2 could not tell apart, it is exactly −1, a definite clockwise turn.',
      },
      {
        title: 'Every test is built from orientations',
        points: [
          'orient(a, b, c) is the sign of cross(b − a, c − a): +1 for a left turn at b, −1 for a right turn, 0 if collinear.',
          'Segments ab and cd cross properly when each one\'s ends lie strictly on opposite sides of the other.',
          'Otherwise they meet only where an endpoint lies on the other segment: onSeg(a, b, p) checks collinear and dot(a − p, b − p) ≤ 0.',
        ],
        show: [0, 9],
        note: 'a = (1, 1), b = (5, 2), c = (6, 4): cross(b − a, c − a) = 4·3 − 1·5 = 7 > 0, so orient(a, b, c) = +1, a left turn at b.',
        say: 'The other tests are built from it, with each point stored as an integer vector `P`. orient(a, b, c) is the sign of cross(b − a, c − a): +1 if the walk a → b → c turns left at b, −1 if it turns right, 0 if the three points are collinear. Segments ab and cd cross properly when c and d lie strictly on opposite sides of ab and a and b strictly on opposite sides of cd; otherwise they can only meet where an endpoint of one lies on the other, which onSeg(a, b, p) checks: p is collinear with a and b, and dot(a − p, b − p) ≤ 0, so p lies between them, ends included. segInter(a, b, c, d) combines the two cases.',
      },
      {
        title: 'Shoelace area and ray casting',
        points: [
          'For vertices p_0, …, p_{n−1} in order, `area2` sums cross(p_i, p_{i+1}): twice the area, positive if counter-clockwise.',
          '`inPoly` casts a ray to the right from the point and counts the edges it crosses: an odd count means inside.',
          'An edge counts when exactly one end is strictly above the point and the edge passes to its right, which one `orient` call settles.',
        ],
        show: [0, 13],
        note: 'The second term: cross(p1, p2) = 11 is twice the area of the green triangle from the origin to the edge p1p2. The sum so far is 6.',
        say: 'A polygon is its vertices p_0, …, p_{n−1} in order, with the last edge wrapping from p_{n−1} back to p_0. The shoelace formula `area2` adds cross(p_i, p_{i+1}) over the edges; each term is twice the signed area of the triangle from the origin to that edge, and the total is twice the polygon\'s area, positive when the vertices run counter-clockwise. `inPoly` tests a point by casting a ray from it to the right and counting the edges the ray crosses, an odd count meaning inside. An edge counts when exactly one of its ends is strictly above the point. So a vertex level with the point counts as below it: a ray through a vertex is counted once where the boundary crosses the line and 0 or 2 times where it only touches, and a horizontal edge never counts. The edge must also pass to the point\'s right, which one `orient` call settles: the point must be left of an upward edge or right of a downward one.',
      },
      {
        title: 'Why they are right, and exact',
        points: [
          'Shoelace triangles outside the polygon are counted as often with a plus sign as with a minus sign, so they cancel.',
          'Each crossing moves the ray between inside and outside, and its far end is outside, so the parity decides.',
          'With |coordinates| ≤ 10^9, cross products of differences stay within 8·10^18, inside long long; larger products need __int128.',
        ],
        show: [0, 17],
        note: 'Sum 28, area 14: the three added triangles also cover the two red ones outside the polygon, and the −5 and −2 terms cancel them.',
        say: 'Why these are right: the origin triangles in the shoelace sum also cover ground outside the polygon, but each such patch is counted as often with a plus sign as with a minus sign, so it cancels. Each crossing moves the ray between inside and outside, and its far end is outside, so the parity of the count gives the answer. And every decision is an exact integer sign: with |coordinates| ≤ 10^9, differences reach 2·10^9 and a cross product of differences at most 8·10^18, inside long long (about 9.2·10^18); anything larger, such as a product of two cross products, needs __int128.',
      },
      {
        title: 'Stay exact; sweep when objects are many',
        points: [
          'Each test is O(1), and area and point in polygon are O(n).',
          'Print an area exactly from `area2`, a whole number or a half; use doubles only for a printed length. Compare angles by half-plane, then cross product.',
          'For many objects, a sweep line walks sorted start and end events, keeping the active ones in a set or Fenwick tree: O(n log n).',
        ],
        say: 'Each test is O(1), and area and point in polygon are O(n). Print an area exactly from area2, as a whole number or a whole number and a half: twice the area can reach 8·10^18, and a double holds integers exactly only up to 2^53, about 9·10^15. Keep floating point for a printed length only; even angles are compared with cross products, sorting by half-plane first and then by the sign of their cross product. When many objects interact along one axis, such as 10^5 segments where checking every pair is 5·10^9 tests, a sweep line sorts their start and end events by coordinate and walks through them, keeping the currently active objects in a set or Fenwick tree, which brings the work down to about O(n log n).',
      },
    ],
    terms: [
      '`P`: a point with long long coordinates x and y, also used as the vector from the origin to it (the TRD version uses `Point<ll>`, where cross and dot are member functions, as in `a.cross(b)`).',
      'cross(a, b): a.x·b.y − a.y·b.x, also written a × b; twice the signed area of the triangle 0, a, b, positive when b is counter-clockwise from a.',
      'dot(a, b): a.x·b.x + a.y·b.y, the dot product; it is ≤ 0 exactly when the angle between a and b is at least 90°.',
      'orient(a, b, c): the sign of cross(b − a, c − a): +1 for a left turn at b, 0 for collinear points, −1 for a right turn (`turn` in the TRD version, which calls `sideOf`).',
      'onSeg(a, b, p): whether p lies on the segment from a to b, ends included (`onEdge` in the TRD version, which calls `onSegment`).',
      'segInter(a, b, c, d): whether the closed segments ab and cd share at least one point.',
      'p_i: the i-th vertex of a polygon, p_0 to p_{n−1} in order round it; p_n means p_0 again.',
      'area2(g): twice the signed area of the polygon g by the shoelace formula (`polygonArea2` in the TRD version; the TRD\'s `area2` returns its absolute value).',
      'inPoly(g, p): 1 if p is inside the polygon g, 0 if it is on the boundary, −1 if outside (the TRD version\'s `inside` calls `inPolygon` and returns true or false, counting the boundary as inside).',
      'a·x + b·y + c: for a line given as a·x + b·y + c = 0, with integer coefficients a, b and c (numbers here, not points), its sign at a point (x, y) says which side of the line the point is on.',
    ],
    worked: {
      title: 'a garden and its sprinklers',
      question: 'A garden is the polygon with vertices (0, 0), (8, 0), (8, 6), (4, 2) and (0, 6), in that order. Print its area, then say whether each sprinkler, at (4, 4), (2, 3) and (6, 0), is inside the garden, outside it or on its boundary. The real version has up to 1000 vertices and 1000 sprinklers, with |coordinates| ≤ 10^9.',
      steps: [
        'Recognise it: integer coordinates, an area, and inside, outside or on the boundary. Counting unit squares would visit up to 4·10^18 of them, and working out in doubles where each edge meets a sprinkler\'s row can misjudge a sprinkler within rounding error of an edge, while "on the boundary" needs an exact zero. So use cross products in long long: the shoelace sum for the area and a ray cast for each sprinkler.',
        'Model it: call the vertices p_0 = (0, 0), p_1 = (8, 0), p_2 = (8, 6), p_3 = (4, 2) and p_4 = (0, 6), with p_5 = p_0. Twice the area is `area2` = Σ cross(p_i, p_{i+1}). For a sprinkler s, `inPoly` first checks `onSeg` against every edge, then counts the edges that a ray from s to the right crosses.',
        'Area: cross(p_0, p_1) = 0, cross(p_1, p_2) = 8·6 − 0·8 = 48, cross(p_2, p_3) = 8·2 − 6·4 = −8, cross(p_3, p_4) = 4·6 − 2·0 = 24 and cross(p_4, p_0) = 0. The sum is 64, positive, so the vertices run counter-clockwise and the area is 64 / 2 = 32. Check: the 8 × 6 rectangle is 48, minus the notch (0, 6), (4, 2), (8, 6), a triangle of area 8·4 / 2 = 16.',
        'Sprinkler s = (6, 0): for the edge p_0 → p_1, orient(p_0, p_1, s) = 0 and dot(p_0 − s, p_1 − s) = (−6)·2 + 0·0 = −12 ≤ 0, so s is on the boundary.',
        'Sprinkler s = (4, 4): four edges straddle the line y = 4. s is left of the upward edge p_1 → p_2 (cross = 24) and right of the downward edge p_2 → p_3 (cross = −8), so the ray crosses both; it is right of the upward edge p_3 → p_4 (cross = −8) and left of the downward edge p_4 → p_0 (cross = 24), so those pass on its left. 2 crossings, even: outside, in the notch.',
        'Sprinkler s = (2, 3): the ray crosses the upward edge p_1 → p_2 (cross = 36), the downward edge p_2 → p_3 (cross = −12) and the upward edge p_3 → p_4 (cross = 4), while the downward edge p_4 → p_0 (cross = 12) passes on its left. 3 crossings, odd: inside.',
        'Answer: the area is 32; (4, 4) is outside, (2, 3) inside and (6, 0) on the boundary. Each sprinkler costs O(n), about 10^6 steps for 1000 of each. Twice the area is an integer of at most 8·10^18, so keep `area2` in long long and print the area exactly from it, a whole number or a whole number and a half, with no doubles at all.',
      ],
    },
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
      'Floating-point decisions: testing collinearity, "strictly inside" or ties with doubles and an epsilon gives WA on boundary tests. Keep every predicate in integers and convert only a final length; print an area from area2 exactly, since doubles hold integers exactly only up to 2^53 ≈ 9·10^15.',
      'Boundary cases: points on an edge, collinear consecutive vertices, segments that touch without crossing, a ray through a vertex (use the half-open test), and the wrap-around from the last vertex back to the first.',
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
    // Half-open: exactly one end strictly above p, so a vertex on the ray is counted right.
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
        'The answer is the minimum over all i of h_i / 2, where h_i is that distance, including the wrap-around triples. Compute the cross product exactly in long long (differences reach 2·10^9, so it stays within 8·10^18) and do only the final division in long double. O(n).',
      ],
      solution: 'For each vertex let h_i be the distance from p_i to the line through p_{i−1} and p_{i+1}, computed as |cross(p_{i+1} − p_{i−1}, p_i − p_{i−1})| / |p_{i+1} − p_{i−1}|. Moving p_i by h_i / 2 towards that line and both neighbours by h_i / 2 towards p_i makes the three points collinear, and no smaller D can do it, so the answer is min_i h_i / 2. The cross product is exact in long long and the division is the only floating-point step. Remember the triples that wrap around the end of the vertex list.',
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
        'For each of the three candidate lines, set aside the points on it (cross product zero) and check that the rest are collinear, again with cross products. Coordinates reach 10^9, so differences reach 2·10^9 and each cross product stays within 8·10^18, inside long long. O(n); with n ≤ 4 the answer is YES.',
      ],
      solution: 'If n ≤ 4, answer YES. Otherwise two of p0, p1, p2 lie on the same line of any valid pair, so that line is one of the three lines through two of them. For each candidate, collect the points not on it and test whether they are all collinear with the first two leftovers; zero, one or two leftovers always pass. Every test is the sign of a cross product: coordinate differences reach 2·10^9, so each product stays within 8·10^18, inside long long (__int128 is only extra insurance). Three candidates of O(n) each give O(n).',
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
