// Binary and ternary search on the answer: primer and problems.
export default {
  id: 'answer-search',
  title: 'Binary and ternary search on the answer',
  track: 'geometry',
  summary: 'Turn "find the best value" into "is this value achievable?" and binary search the boundary, or ternary search a convex cost over one free parameter.',
  primer: {
    idea: 'If testing one candidate answer is easy and feasibility is monotone (when x is achievable, so is every smaller x), binary search for the boundary: O(log range) checks, each usually a greedy O(n) pass, so O(n log range) in total. On real numbers, run a fixed 60–100 halvings instead of looping until hi − lo < eps. When you instead choose one parameter (a position, a shift, a time) to minimise a cost that falls and then rises, such as a max or sum of convex pieces, ternary search discards a third of the interval per step; on integers, binary search on the sign of f(x + 1) − f(x) instead.',
    spot: [
      'The statement asks for the largest or smallest value of something (cookies, time, radius, median) and a fixed candidate is easy to test, often greedily',
      'Feasibility is monotone in the answer: more time, a larger radius or a lower target can only make the check easier',
      'A real-valued output with tolerance 10^-6 together with a question of the form "can everything fit, or everyone meet, within T"',
      'You pick one free parameter, such as a meeting point, a shift x or a final height, and the cost is a max or sum of |something − parameter| terms, which is convex in it',
    ],
    disguises: [
      'The k-th smallest value of a huge implicit set (a multiplication table, all pairwise sums) → binary search on the value v and count the entries ≤ v',
      'Maximise the minimum, minimise the maximum, or the largest radius that still fits → binary search on the threshold and check greedily whether every part can meet it',
      'Minimum time for everyone to gather → binary search on T; each person can reach an interval of positions and the check is whether all intervals intersect',
      'Choose a point or shift that minimises a worst-case or total distance → the cost is convex in that parameter, so ternary search it, even when each evaluation is itself an O(n) scan',
    ],
    pitfalls: [
      'Mid rounding: with lo = mid you must take mid = lo + (hi − lo + 1) / 2, or the loop never ends when hi = lo + 1. Write the invariant (ok(lo) true, everything above hi false) before coding.',
      'Overflow inside the check: a_i × guess can pass 10^18. Pick hi so the products fit in long long, and stop summing once the running total exceeds the budget.',
      'while (hi − lo > 1e-9) can loop forever once doubles stop changing; use a fixed iteration count. Ternary search also needs a function with no flat stretch away from the optimum: on a plateau f(m1) == f(m2) and it can discard the side holding the minimum.',
    ],
    code: `// Largest x in [lo, hi] with ok(x) true, for ok that is true up to some point and false after.
// Invariant: ok(lo) is true (check it first); everything above hi is false.
template <class F> long long lastTrue(long long lo, long long hi, F ok) {
  while (lo < hi) {
    long long mid = lo + (hi - lo + 1) / 2;  // round up, or lo = mid never moves when hi = lo + 1
    if (ok(mid)) lo = mid; else hi = mid - 1;
  }
  return lo;
}
// Smallest real x with ok(x) true: a fixed number of halvings, never while (hi - lo > eps).
template <class F> double firstTrueReal(double lo, double hi, F ok) {
  for (int it = 0; it < 100; it++) {
    double mid = (lo + hi) / 2;
    if (ok(mid)) hi = mid; else lo = mid;
  }
  return hi;
}
// Argmin of a unimodal f on reals (falls, then rises): drop the third that cannot hold the minimum.
template <class F> double argminReal(double lo, double hi, F f) {
  for (int it = 0; it < 100; it++) {
    double m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
    if (f(m1) < f(m2)) hi = m2; else lo = m1;
  }
  return (lo + hi) / 2;
}
// Argmin of a convex f on integers: binary search for the first x with f(x) <= f(x + 1).
template <class F> long long argminInt(long long lo, long long hi, F f) {
  while (lo < hi) {
    long long mid = lo + (hi - lo) / 2;
    if (f(mid) <= f(mid + 1)) hi = mid; else lo = mid + 1;
  }
  return lo;
}`,
    resources: [
      { label: 'CP-Algorithms: Binary search', url: 'https://cp-algorithms.com/num_methods/binary_search.html' },
      { label: 'CP-Algorithms: Ternary search', url: 'https://cp-algorithms.com/num_methods/ternary_search.html' },
      { label: 'USACO Guide: Binary search', url: 'https://usaco.guide/silver/binary-search' },
    ],
  },
  problems: [
    {
      id: '1201C',
      name: 'Maximum Median',
      rating: 1400,
      tier: 'warmup',
      hints: [
        'Sort the array first. Raising an element to the left of the median can never raise the median, so which elements matter? For a target median M, how many operations does it take?',
        'Whether median M is reachable is monotone: if M costs at most k operations, so does every smaller M. So binary search on M with a cost check instead of looking for a formula.',
        'After sorting, cost(M) = sum over i ≥ n/2 (0-indexed) of max(0, M − a_i). Binary search the largest M in [a_{n/2}, a_{n/2} + k] with cost(M) ≤ k; O(n log k).',
      ],
      solution: 'Sort a. The median is at least M iff every element from index n/2 to the end is at least M, and the cheapest way there raises each such a_i < M up to M, costing the sum of max(0, M − a_i) over i ≥ n/2. This cost grows with M, so binary search the largest M in [a_{n/2}, a_{n/2} + k] whose cost is at most k. Use long long: M can reach 2·10^9, and stopping the sum as soon as it passes k keeps it small. O(n log n + n log k).',
    },
    {
      id: '670D2',
      name: 'Magic Powder - 2',
      rating: 1500,
      tier: 'warmup',
      hints: [
        'If Apollinaria can bake c cookies, can she bake c − 1? How much magic powder does a fixed number of cookies need?',
        'Baking is monotone in the number of cookies, and checking a fixed count c is a single sum, so binary search on c: the answer is the largest c whose powder requirement is at most k.',
        'need(c) = sum over i of max(0, a_i·c − b_i). Search c in [0, 2·10^9] (b_i + k ≤ 2·10^9 and a_i ≥ 1). a_i·c reaches 2·10^18, which still fits in long long, but break out of the sum as soon as it exceeds k.',
      ],
      solution: 'For c cookies ingredient i needs a_i·c grams, so the powder required is the sum of max(0, a_i·c − b_i), which never decreases as c grows. Binary search the largest c with requirement ≤ k, keeping lo = 0 feasible and hi = 2·10^9 + 1 infeasible; each check is O(n), so the total is O(n log 2·10^9). The usual WA is overflow: a_i·c is up to 2·10^18, and the running sum overflows if you keep adding after it passes k, so stop early.',
    },
    {
      id: '780B',
      name: 'The Meeting Place Cannot Be Changed',
      rating: 1600,
      tier: 'core',
      hints: [
        'Fix a time T. Where can friend i be after T seconds, and what must be true of all these sets for everyone to meet?',
        'Friend i can reach exactly the interval [x_i − v_i·T, x_i + v_i·T], and every interval grows with T. So "can they meet within T" is monotone: binary search on the real number T.',
        'Check: max(x_i − v_i·T) ≤ min(x_i + v_i·T). Search T in [0, 10^9] with 100 halvings rather than an epsilon loop; O(100·n).',
      ],
      solution: 'Within time T friend i can stand anywhere in [x_i − v_i·T, x_i + v_i·T], so all of them can meet iff the largest left end is at most the smallest right end. This only gets easier as T grows, so binary search T over [0, 10^9] (distance ≤ 10^9, speed ≥ 1) for 100 iterations and print hi with 12 decimals. The fixed iteration count avoids an endless loop when hi − lo stops shrinking in floating point. Ternary search on the meeting point also works, since the time to gather at p is max_i |x_i − p| / v_i, a convex function of p.',
    },
    {
      id: '1730B',
      name: 'Meeting on the Line',
      rating: 1600,
      tier: 'core',
      hints: [
        'Write the gathering time as a function of the meeting point x0. What does each person\'s term t_i + |x_i − x0| look like as a graph, and what happens when you take the maximum of several of them?',
        'Each term is a V shape, so their maximum is convex in x0: it falls with slope −1, then rises with slope +1, with a single lowest point. That is exactly what ternary search on reals needs.',
        'Ternary search x0 over [0, 10^8] for about 100 iterations; each evaluation is an O(n) maximum. Print the final midpoint.',
      ],
      solution: 'f(x0) = max_i (t_i + |x_i − x0|) is a maximum of convex functions, so it is convex, and because every piece has slope ±1 its minimum is a single point. Ternary search on [0, 10^8]: evaluate f at the two thirds, discard the side with the larger value, repeat 100 times, and print (lo + hi) / 2. That is O(100·n) per test, fine for Σn ≤ 2·10^5. As a check, the optimum is also (min(x_i − t_i) + max(x_i + t_i)) / 2, because f(x0) = max(max(x_i + t_i) − x0, x0 − min(x_i − t_i)).',
    },
    {
      id: '439D',
      name: 'Devu and his Brother',
      rating: 1700,
      tier: 'core',
      hints: [
        'In the final arrays there is a value T with min(a) ≥ T ≥ max(b). If you fix T, what is the cheapest way to get there?',
        'For a fixed T the cost is Σ max(0, T − a_i) + Σ max(0, b_i − T), a sum of convex functions of T and therefore convex. Minimising a convex function over the integers is a job for ternary search.',
        'Binary search for the first T in [1, 10^9] with cost(T) ≤ cost(T + 1), the integer form of ternary search; each cost evaluation is O(n + m). Keep the cost in long long.',
      ],
      solution: 'Any valid final state has a threshold T between max(b) and min(a), and for a fixed T the cheapest fix raises every a_i below T to T and lowers every b_i above T to T. That cost is a sum of convex piecewise-linear functions of T, so it is convex, and the first T with cost(T) ≤ cost(T + 1) is a minimiser. Binary search that T in [1, 10^9]: about 30 rounds of two O(n + m) evaluations. The cost can reach 10^5·10^9, so use long long.',
    },
    {
      id: '1359C',
      name: 'Mixing Water',
      rating: 1700,
      tier: 'core',
      hints: [
        'Work out the barrel temperature after an even number of cups, and after 2k + 1 cups. Which of these can ever get close to a t above (h + c) / 2?',
        'Every even count gives exactly (h + c) / 2, so if t ≤ (h + c) / 2 the answer is 2. Otherwise only odd counts matter, and their temperature ((k + 1)h + kc) / (2k + 1) decreases towards (h + c) / 2 as k grows: monotone in k, so binary search on k.',
        'Find the largest k with (k + 1)h + kc ≥ t(2k + 1), then compare k and k + 1 by cross-multiplying the two distances to t, all in long long, and print 2k + 1 or 2k + 3 (on a tie, the smaller).',
      ],
      solution: 'If 2t ≤ h + c, print 2. Otherwise binary search k in [0, 10^6] for the last k whose temperature T_k = ((k + 1)h + kc) / (2k + 1) is still ≥ t (k = 0 always qualifies because h ≥ t). The closest temperature is T_k or T_{k+1}: with d1 = (k + 1)h + kc − t(2k + 1) and d2 = t(2k + 3) − ((k + 2)h + (k + 1)c), choose 2k + 1 iff d1·(2k + 3) ≤ d2·(2k + 1). These products stay below about 10^18, so the comparison is exact in long long; comparing doubles here is the usual WA on ties. Even counts never win, because T_{k+1} already lies strictly between (h + c) / 2 and t.',
    },
    {
      id: '448D',
      name: 'Multiplication Table',
      rating: 1800,
      tier: 'core',
      hints: [
        'The table has up to 2.5·10^11 entries, far too many to list. But for a given number x, can you quickly count how many entries are at most x?',
        'Row i holds i, 2i, ..., m·i, so it has min(m, ⌊x / i⌋) entries ≤ x. That count grows with x, and the k-th smallest entry is the first x whose count reaches k: binary search on the value, not on a position.',
        'Binary search x in [1, n·m] for the smallest x with Σ_i min(m, ⌊x / i⌋) ≥ k; O(n log(nm)). Counts reach 2.5·10^11, so use long long.',
      ],
      solution: 'Let cnt(x) = Σ_{i=1..n} min(m, ⌊x / i⌋), the number of table entries ≤ x; it never decreases as x grows. The answer is the smallest x with cnt(x) ≥ k, found by binary search over [1, n·m] in about 38 rounds of O(n). That smallest x always appears in the table: otherwise cnt(x − 1) = cnt(x) and x − 1 would qualify too. Keep x, k and the count in long long, since n·m reaches 2.5·10^11.',
    },
    {
      id: '578C',
      name: 'Weakness and Poorness',
      rating: 2000,
      tier: 'challenge',
      hints: [
        'For a fixed x, how do you compute the weakness in O(n)? Then think about how it changes as x moves from very negative to very positive.',
        'For fixed x the weakness is max(largest subarray sum, −smallest subarray sum) of the sequence a_i − x: two Kadane passes. Each segment\'s |sum| is convex in x and a maximum of convex functions is convex, so the weakness is unimodal in x: ternary search on a real x.',
        'Ternary search x over [−10^4, 10^4] for about 100 iterations, evaluating the weakness with Kadane each time: O(100·n). Print the weakness at the final x, not x itself.',
      ],
      solution: 'Each segment sum Σ(a_i − x) = S − len·x is linear in x, so its absolute value is convex, and the weakness, the maximum over all segments, is convex in x. Evaluate it in O(n) as the larger of the maximum subarray sum and minus the minimum subarray sum of a_i − x (Kadane twice), and ternary search x in [−10^4, 10^4] for 100 iterations. The optimum lies in that range because for x below min(a) every term is positive and raising x lowers the total, and symmetrically above max(a). Use a fixed iteration count: 100 rounds of two O(n) scans is 4·10^7 steps, while a while (hi − lo > eps) loop risks never ending.',
    },
  ],
};
