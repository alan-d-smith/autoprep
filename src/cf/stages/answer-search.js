// Binary and ternary search on the answer: primer and problems.
export default {
  id: 'answer-search',
  title: 'Binary and ternary search on the answer',
  track: 'geometry',
  summary: 'Turn "find the best value" into "is this value achievable?" and binary search the boundary, or ternary search a convex cost over one free parameter.',
  primer: {
    slides: [
      {
        title: 'Asking for the best value outright',
        points: [
          'The most cookies, the least meeting time, the largest gap: often there is no formula.',
          'The answer can be anywhere up to 2·10^9, and checking each candidate with an O(n) pass over n = 2·10^5 items costs about 4·10^14 steps.',
        ],
        say: 'Some questions ask for the best value outright: the most cookies you can bake, the least time in which everyone can meet, the largest gap you can keep between chosen points. There is often no formula, and trying candidates one by one is too slow: the answer can be anywhere up to 2·10^9, and if checking one candidate is an O(n) pass over n = 2·10^5 items, a scan costs about 4·10^14 steps.',
      },
      {
        title: 'Ask instead: is x achievable?',
        points: [
          'Write ok(x) for that check; it is usually a short greedy pass.',
          'It is monotone: if x is achievable, so is every smaller x, so ok(x) reads true…true, false…false and the answer is the last true.',
          'For a minimum, such as the least time, it reads false…false, true…true and the answer is the first true.',
        ],
        show: [0, 14],
        note: 'ok(x) is x² ≤ 120 on 0 to 15: true up to 10, false from 11, so the answer is the last true, 10.',
        say: 'Ask an easier question instead: is x achievable? Write ok(x) for that check. It is usually a short greedy pass, and it is monotone: if the answer can be at least x, it can be at least every smaller x, so as x grows ok(x) reads true…true, false…false and the answer is the last true. For a minimum, such as the least time, it reads false…false, true…true and the answer is the first true.',
      },
      {
        title: 'Binary search finds the switch',
        points: [
          'Keep `lo` and `hi` with the answer between them, and test the middle value `mid`.',
          'If ok(mid) is true, set `lo = mid`; if false, everything from `mid` up fails, so set `hi = mid − 1`.',
          'Each check halves the range: about 31 checks for 2·10^9 candidates. `lastTrue` in the template is this loop.',
        ],
        show: [0, 6],
        note: 'Two checks in: ok(8) was true, so lo = 8; ok(12) was false, so hi = 11. Two more checks find 10.',
        say: 'Finding where a monotone sequence switches is binary search. Keep two numbers `lo` and `hi` with the answer between them, and test the middle value `mid`. If ok(mid) is true the answer is at least mid, so set lo = mid; if it is false, everything from mid up fails, so set hi = mid − 1. Each check halves the range, so 2·10^9 candidates need about 31 checks; `lastTrue` in the template is this loop.',
      },
      {
        title: 'The invariant, and why mid rounds up',
        points: [
          'Invariant: ok(lo) is true and everything above `hi` is false. Start `lo` where ok is known to hold.',
          'Each step keeps it and shrinks the range, so the loop ends with `lo = hi` on the boundary.',
          'The true branch sets `lo = mid`, so round up: `mid = lo + (hi − lo + 1) / 2`. Rounding down sticks once hi = lo + 1.',
        ],
        show: [0, 10],
        note: 'lo = 10, hi = 11: ok(lo) is true and 12 to 15 are false. mid rounds up to 11; rounded down, 10 = lo would never move.',
        say: 'It is correct because of an invariant: ok(lo) is true and everything above hi is false. Start lo where ok is known to hold (or check it first), and each step keeps the invariant while shrinking the range, so the loop ends with lo = hi on the boundary. The true branch sets lo = mid, so mid must round up, mid = lo + (hi − lo + 1) / 2, because rounding down gives mid = lo once hi = lo + 1 and the loop never ends.',
      },
      {
        title: 'Real answers: a fixed number of halvings',
        points: [
          'In total, O(log range) checks of O(n) each: O(n log range).',
          'For a real answer, run a fixed 60 to 100 halvings, as `firstTrueReal` does.',
          'Don\'t loop until hi − lo < eps: near 10^9 doubles are about 10^-7 apart, so with eps = 10^-9 it never ends.',
        ],
        say: 'In total that is O(log range) checks of O(n) each, so O(n log range). When the answer is a real number, such as a time printed to 10^-6, run a fixed 60 to 100 halvings, as `firstTrueReal` does, instead of looping until hi − lo < eps. Near 10^9 neighbouring doubles are about 10^-7 apart, so with eps = 10^-9 the gap never gets that small and the loop never ends.',
      },
      {
        title: 'Ternary search for a valley',
        points: [
          'To minimise a cost f(x) that falls then rises, compare f at `m1` < `m2`, a third and two thirds of the way across.',
          'If f(m1) < f(m2) the minimum is not right of m2, otherwise not left of m1. `argminReal` runs 100 such rounds.',
          'On integers, `argminInt` binary searches for the first x with f(x) ≤ f(x + 1). f must not be flat away from the minimum.',
        ],
        show: [1, 5],
        note: 'f(m1) < f(m2), so the minimum cannot lie right of m2, where f only rises.',
        say: 'Ternary search handles a different shape: you choose one parameter x, such as a meeting point or a shift, to minimise a cost f(x) that falls and then rises, often a max or sum of convex (V- or U-shaped) pieces like |a_i − x|. There is no yes/no check, but comparing f at two probe points `m1` < `m2`, a third and two thirds of the way from lo to hi, shows which part to drop: if f(m1) < f(m2) the minimum is not right of m2, otherwise it is not left of m1. Each round keeps 2/3 of the range, so `argminReal` runs 100 rounds. On integers, `argminInt` binary searches for the first x with f(x) ≤ f(x + 1), the sign of f(x + 1) − f(x). Either way f must have no flat stretch away from the minimum.',
      },
    ],
    terms: [
      'ok(x): the check "is x achievable?"; it must be monotone, true up to some point and false after it (or the reverse when minimising).',
      '`lo`, `hi`: the ends of the range that still holds the answer. In `lastTrue` ok(lo) is true and everything above hi is false; in `firstTrueReal` (and the TRD\'s `firstTrue`) ok(hi) is true and everything below lo is false.',
      '`mid`: the candidate tested in one round, halfway between lo and hi (rounded up in `lastTrue`).',
      '`lastTrue`: the largest x in [lo, hi] with ok(x) true (the TRD version has `firstTrue` instead: the smallest x with ok(x) true, for a check that goes false…false, true…true).',
      '`firstTrueReal`: the smallest real x with ok(x) true, found with 100 halvings.',
      'f(x): in ternary search, the cost being minimised, which falls and then rises.',
      'a_i: the i-th number in the input, such as a person\'s position or how much of an ingredient one cookie needs.',
      '`m1`, `m2`: the two probe points, a third and two thirds of the way from lo to hi.',
      '`argminReal`: ternary search for the real x that minimises f.',
      '`argminInt`: the integer version, the first x with f(x) ≤ f(x + 1) (the TRD version\'s `peak` uses KACTL\'s `ternSearch` instead, written for a maximum).',
    ],
    worked: {
      problem: { source: 'kattis', id: 'freighttrain', name: 'Freight Train', difficulty: '4.5' },
      slides: [
        {
          title: 'Cut the train; keep Luxembourg trains short',
          points: [
            'A train of N ≤ 10^9 wagons stands in a row, and W ≤ 10^4 of them, given in order, hold freight for Luxembourg.',
            'Cut it into at most L ≤ 10^4 runs of consecutive wagons. A run with freight goes to Luxembourg; a run of empty wagons can go back.',
            'Print the smallest possible length of the longest train to Luxembourg.',
          ],
          show: [0, 0],
          note: 'Sample case 1: freight in wagons 1 and 2, L = 2. Wagons 1–2 go to Luxembourg and 3–6 go back, so the answer is 2.',
          say: 'A freight train of N wagons, up to 10^9, stands in Belgium. W of the wagons, at most 10^4 and given in increasing order, hold freight that must go to Luxembourg, and the rest are empty. Each of the L locomotives, at most 10^4, takes a run of consecutive wagons, so the train is cut into at most L trains. A train with any freight in it goes to Luxembourg, where shorter is faster, and a train of only empty wagons can go back to the Netherlands at any length. Print the smallest possible length of the longest train to Luxembourg. In the first sample case there are 6 wagons, freight in wagons 1 and 2, and two locomotives: wagons 1 and 2 go to Luxembourg and wagons 3 to 6 go back, so the answer is 2.',
        },
        {
          title: 'Too many wagons, too many lengths',
          points: [
            'N reaches 10^9, so the solution can\'t touch every wagon, let alone try every way to place the cuts.',
            'Trying D = 1, 2, 3, … until some cut keeps every Luxembourg train within D wagons can take 10^9 checks, in each of up to 100 test cases.',
          ],
          say: 'N reaches 10^9, so a solution can\'t even look at every wagon, let alone try every way to place the cuts. Asking, for D = 1, 2, 3 and so on, whether some cut keeps every train to Luxembourg within D wagons, and stopping at the first D that works, can take 10^9 checks, and there are up to 100 test cases.',
        },
        {
          title: 'Fix D and ask: does it fit?',
          points: [
            'ok(D): can at most L trains carry everything with every train to Luxembourg at most D wagons long?',
            'A cut that works for D also works for D + 1, so ok reads false…false, true…true. The answer is the first true.',
            'Keep ok(hi) true and everything below `lo` false: `hi = mid` on true, `lo = mid + 1` on false, so `mid` rounds down.',
          ],
          say: 'The statement asks for the smallest possible longest train, and a fixed limit is much easier to test. Let ok(D) say whether at most L trains can carry everything with every train to Luxembourg at most D wagons long. A cut that works for D also works for D + 1, so ok reads false…false, true…true, and the answer is the first true. That mirrors `lastTrue`: keep ok(hi) true and everything below lo false, starting from lo = 1 and hi = N, because one train of all N wagons always works. A true check moves hi down to mid and a false one moves lo up to mid + 1, so mid rounds down: rounded up, mid would equal hi once hi = lo + 1, and a true check would leave hi where it was.',
        },
        {
          title: 'ok(D): end each train as late as possible',
          points: [
            'From the first wagon p not yet in a train, the next train takes D wagons, or every empty wagon before next, the next freight wagon.',
            'Take whichever ends later: p = max(p + D, next). ok(D) is true if this needs at most L trains.',
            'Ending a train later never hurts: any cut of the wagons after an earlier end, trimmed, also cuts the wagons after a later one.',
          ],
          show: [0, 1],
          note: 'First check of the search: lo = 1, hi = 6, mid = 3. Trains 1–3 and 4–6 make 2 ≤ L, so ok(3) is true and hi = 3.',
          say: 'ok(D) builds the trains from the front. Let p be the first wagon not yet in a train. The next train can take D wagons, which is always allowed, or every empty wagon before next, the next freight wagon, which is allowed at any length because it goes back. Take whichever reaches further: p becomes the larger of p + D and next. Ending a train later never hurts, because any cut of the wagons after an earlier end, with its first train trimmed, also cuts the wagons after a later end. Count the trains until p passes N; ok(D) is true if there are at most L. On the first sample case the search starts with lo = 1 and hi = 6 and checks mid = 3: one train takes wagons 1 to 3, the next takes 4 to 6, two trains in all, so ok(3) is true and hi = 3.',
        },
        {
          title: 'ok(2): an empty train can be long',
          points: [
            'mid = 2: wagons 1–2 make one train, and 3–6 hold no freight, so one train takes all four back.',
            'That is 2 trains, so ok(2) is true and hi = 2. Only trains to Luxembourg must be at most D long.',
          ],
          show: [0, 2],
          note: 'Second check: ok(2) is true with 2 trains, so hi = 2. The train 3–6 is longer than D, which is fine because it goes back.',
          say: 'Next, mid = 1 + (3 − 1) / 2 = 2. The first train takes wagons 1 and 2. From wagon 3 there is no freight left, so the next train takes all four remaining wagons back to the Netherlands. That is longer than D, which is fine, since only trains to Luxembourg are limited. Two trains, so ok(2) is true and hi = 2.',
        },
        {
          title: 'ok(1) fails, so the answer is 2',
          points: [
            'mid = 1: wagons 1 and 2 need a train each and 3–6 make a third, more than L = 2. So ok(1) is false and lo = 2.',
            'Now lo = hi = 2, the answer, after 3 checks. The other two sample cases give 3 and 2 the same way.',
          ],
          show: [0, 3],
          note: 'Last check: the third train passes L = 2, so ok(1) is false, lo = 2 = hi, and the search stops.',
          say: 'Then mid = 1 + (2 − 1) / 2 = 1. With trains of one wagon, wagons 1 and 2 need a train each, and wagons 3 to 6 make a third, one more than the two locomotives. So ok(1) is false and lo = 2. Now lo and hi are both 2, and the answer is 2 after three checks. The other two sample cases give 3 and 2 the same way.',
        },
        {
          title: 'Cost and edge cases',
          points: [
            'About 30 checks cover 1 to 10^9. Each makes at most L + 1 trains and passes each freight wagon once: O((W + L) log N) per case.',
            'After the last freight wagon, next = N + 1, so one train takes every remaining wagon back.',
            'p + D reaches 2·10^9, just under the int limit of about 2.1·10^9, so the solution keeps positions in long long to be safe.',
          ],
          say: 'About 30 checks cover every D from 1 to 10^9. Each check stops after L + 1 trains and moves past each freight wagon once, so it costs O(W + L), and a test case costs O((W + L) log N): about 6·10^5 steps, and 6·10^7 for 100 cases. After the last freight wagon there is nothing left to carry, so next is N + 1 and one train takes all the remaining wagons back, as wagons 3 to 6 did in the sample. p + D can reach 2·10^9, just under the int limit of about 2.1·10^9, so the solution keeps positions in long long to be safe.',
        },
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false); cin.tie(nullptr);
  int T; cin >> T;
  while (T--) {
    long long N; int W, L; cin >> N >> W >> L;
    vector<long long> a(W);
    for (auto& x : a) cin >> x;
    // ok(D): at most L trains, and every train with freight at most D wagons long
    auto ok = [&](long long D) {
      long long p = 1;
      int trains = 0, i = 0;
      while (p <= N) {
        while (i < W && a[i] < p) i++;
        long long next = i < W ? a[i] : N + 1;
        p = max(p + D, next);
        if (++trains > L) return false;
      }
      return true;
    };
    long long lo = 1, hi = N;  // ok(hi) is true; everything below lo is false
    while (lo < hi) {
      long long mid = lo + (hi - lo) / 2;
      if (ok(mid)) hi = mid; else lo = mid + 1;
    }
    cout << lo << '\\n';
  }
}`,
    },
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
      solution: 'Sort a. The median is at least M exactly when every element from index n/2 to the end is at least M, and the cheapest way there raises each such a_i < M up to M, costing the sum of max(0, M − a_i) over i ≥ n/2. This cost grows with M, so binary search the largest M in [a_{n/2}, a_{n/2} + k] whose cost is at most k. Use long long: M can reach 2·10^9, and stopping the sum as soon as it passes k keeps it small. O(n log n + n log k).',
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
      solution: 'For c cookies ingredient i needs a_i·c grams, so the powder required is the sum of max(0, a_i·c − b_i), which never decreases as c grows. Run lastTrue with lo = 0, which is always feasible, and hi = 2·10^9, where ok(c) says the requirement is at most k; each check is O(n), so the total is O(n log 2·10^9). The usual bug is overflow: a_i·c is up to 2·10^18, and the running sum overflows if you keep adding after it passes k, so stop early.',
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
      solution: 'Within time T friend i can stand anywhere in [x_i − v_i·T, x_i + v_i·T], so all of them can meet exactly when the largest left end is at most the smallest right end. This only gets easier as T grows, so binary search T over [0, 10^9] (distance ≤ 10^9, speed ≥ 1) for 100 iterations and print hi with 12 decimals. The fixed iteration count avoids an endless loop when hi − lo stops shrinking in floating point. Ternary search on the meeting point also works, since the time to gather at p is max_i |x_i − p| / v_i, a convex function of p.',
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
      solution: 'If 2t ≤ h + c, print 2. Otherwise binary search k in [0, 10^6] for the last k whose temperature T_k = ((k + 1)h + kc) / (2k + 1) is still ≥ t (k = 0 always qualifies because h ≥ t). The closest temperature is T_k or T_{k+1}: with d1 = (k + 1)h + kc − t(2k + 1) and d2 = t(2k + 3) − ((k + 2)h + (k + 1)c), choose 2k + 1 exactly when d1·(2k + 3) ≤ d2·(2k + 1). These products stay below about 10^18, so the comparison is exact in long long; comparing doubles here gives wrong answers on ties. Even counts never win, because T_{k+1} already lies strictly between (h + c) / 2 and t.',
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
        'For fixed x the weakness is max(largest subarray sum, −smallest subarray sum) of the sequence a_i − x: two Kadane passes. Each segment\'s |sum| is convex in x and a maximum of convex functions is convex, so the weakness falls then rises in x: ternary search on a real x.',
        'Ternary search x over [−10^4, 10^4] for about 100 iterations, evaluating the weakness with Kadane each time: O(100·n). Print the weakness at the final x, not x itself.',
      ],
      solution: 'Each segment sum Σ(a_i − x) = S − len·x is linear in x, so its absolute value is convex, and the weakness, the maximum over all segments, is convex in x. Evaluate it in O(n) as the larger of the maximum subarray sum and minus the minimum subarray sum of a_i − x (Kadane twice), and ternary search x in [−10^4, 10^4] for 100 iterations. The optimum lies in that range because for x below min(a) every term is positive and raising x lowers the total, and symmetrically above max(a). Use a fixed iteration count: 100 rounds of two O(n) scans is 4·10^7 steps, while a while (hi − lo > eps) loop risks never ending.',
    },
  ],
};
