// Prefix and suffix sums: primer and problems.
export default {
  id: 'prefix-sums',
  title: 'Prefix and suffix sums',
  track: 'dp',
  summary: 'Answer any range-sum question in O(1) after one O(n) pass, combine best-from-the-left with best-from-the-right around a split, and turn "count the subarrays with property X" into counting equal prefix values.',
  primer: {
    idea: 'Store P[i] = a[0] + … + a[i−1] once; the sum of any block a[l..r] is then P[r+1] − P[l], so each query costs O(1) after O(n) work, and the same holds on a grid with inclusion–exclusion. The bigger payoff is that a condition on a subarray becomes a condition on a pair of prefix values: "this block sums to zero" means P[r+1] = P[l], so finding or counting such blocks is finding or counting equal values, in O(n log n) with a sort or a map. Suffix arrays are the mirror image: precompute the best answer ending at each index (left to right) and starting at each index (right to left), then try every split point in O(1) each.',
    spot: [
      'Many queries for the sum or count of something over a range [l, r], with no updates in between.',
      'Count (or find) subarrays whose sum is k, whose sum equals their length, or whose two kinds of items balance out.',
      'Remove one element, cut the array once or choose a pivot: the answer combines something about everything to the left with something about everything to the right.',
      'A small grid (up to about 1000 × 1000) with many rectangle-sum queries.',
    ],
    disguises: [
      'Count adjacent equal pairs, or positions with some property, inside [l, r] → prefix count of a 0/1 indicator array',
      'Subarray whose sum equals its length, or where two kinds of items balance → subtract 1 from every element (or negate one kind), then look for two equal prefix sums',
      'Delete one element / cut the array into parts / choose a pivot → best-from-the-left and best-from-the-right arrays, then try every split in O(n)',
      'Best block to reverse, flip or swap → write down the gain of each position, then maximise P[r] − min P[l] over l ≤ r (maximum subarray sum)',
    ],
    pitfalls: [
      'Off-by-one between inclusive ranges and P: with P of size n+1, sum a[l..r] is P[r+1] − P[l]. Forgetting P[0] = 0 also forgets every subarray that starts at the first element.',
      'Overflow: 2·10^5 values of 10^9 already pass 2^31, and counts of pairs reach n²/2, so keep prefix sums and answers in long long.',
      'unordered_map keyed on prefix sums can be broken by anti-hash tests on Codeforces; sort the prefix array, use map, or use a plain array shifted by an offset when the range of values is small.',
    ],
    code: `// P[i] = a[0] + ... + a[i-1], so sum of a[l..r] (inclusive) = P[r+1] - P[l]
vector<long long> prefix(const vector<long long>& a) {
    vector<long long> P(a.size() + 1, 0);
    for (size_t i = 0; i < a.size(); i++) P[i + 1] = P[i] + a[i];
    return P;
}

// S[i][j] = sum of g[0..i-1][0..j-1]; any rectangle by inclusion-exclusion
struct Prefix2D {
    vector<vector<long long>> S;
    Prefix2D(const vector<vector<long long>>& g)
        : S(g.size() + 1, vector<long long>(g[0].size() + 1, 0)) {
        for (size_t i = 0; i < g.size(); i++)
            for (size_t j = 0; j < g[0].size(); j++)
                S[i + 1][j + 1] = g[i][j] + S[i][j + 1] + S[i + 1][j] - S[i][j];
    }
    long long query(int r1, int c1, int r2, int c2) const {  // inclusive corners
        return S[r2 + 1][c2 + 1] - S[r1][c2 + 1] - S[r2 + 1][c1] + S[r1][c1];
    }
};

// Subarrays with sum exactly k = pairs l < r with P[r] - P[l] == k
long long countSubarrays(const vector<long long>& a, long long k) {
    map<long long, long long> seen{{0, 1}};  // P[0] = 0 is a valid left end
    long long P = 0, res = 0;
    for (long long x : a) {
        P += x;
        auto it = seen.find(P - k);
        if (it != seen.end()) res += it->second;
        seen[P]++;
    }
    return res;
}`,
    resources: [
      { label: 'USACO Guide: Introduction to prefix sums', url: 'https://usaco.guide/silver/prefix-sums' },
      { label: 'USACO Guide: More on prefix sums (2D, max subarray sum)', url: 'https://usaco.guide/silver/more-prefix-sums' },
      { label: 'CSES: Subarray Sums II (prefix sums + map)', url: 'https://cses.fi/problemset/task/1661' },
      { label: 'CSES: Forest Queries (2D prefix sums)', url: 'https://cses.fi/problemset/task/1652' },
    ],
  },
  problems: [
    {
      id: '313B',
      name: 'Ilya and Queries',
      rating: 1100,
      tier: 'warmup',
      hints: [
        'Each query counts positions i in [l, r) with s_i = s_{i+1}. Whether a single position i counts does not depend on the query at all.',
        'Mark c_i = 1 when s_i = s_{i+1}. Every query is then a sum of c over a range, the textbook prefix-sum query; with 10^5 queries you cannot rescan the string each time.',
        'Build P[k] = c_1 + … + c_k with P[0] = 0 and answer each query with P[r−1] − P[l−1]. O(n + m) overall.',
      ],
      solution: 'Let c_i = 1 if s_i = s_{i+1} (1 ≤ i < n) and P[k] = c_1 + … + c_k. A query counts i from l to r−1, which is P[r−1] − P[l−1]. Using P[r] instead of P[r−1] is the usual wrong answer: it also counts the pair (r, r+1), which lies outside the query. O(n + m).',
    },
    {
      id: '433B',
      name: "Kuriyama Mirai's Stones",
      rating: 1200,
      tier: 'warmup',
      hints: [
        'Both question types ask for the total cost of stones l..r, once in the original order and once in sorted order. The stones never change between questions.',
        'Two fixed orders means two prefix-sum arrays: one over the costs as given, one over the costs sorted. Each question is then a single subtraction.',
        'Copy v, sort the copy, build P over v and Q over the sorted copy, and print P[r] − P[l−1] or Q[r] − Q[l−1]. Keep the sums in 64 bits: 10^5 stones of cost 10^9 overflow int.',
      ],
      solution: 'Build prefix sums P over the original costs and Q over the sorted costs. Type 1 prints P[r] − P[l−1] and type 2 prints Q[r] − Q[l−1]. O(n log n + m). The totals reach 10^14, so both arrays and the output must be long long; that is the only common wrong answer.',
    },
    {
      id: '1915E',
      name: 'Romantic Glasses',
      rating: 1300,
      tier: 'core',
      hints: [
        'Iulia’s juice equals her date’s juice exactly when (odd-glass juice) − (even-glass juice) is zero over the chosen range. What if every even-numbered glass counted with a minus sign?',
        'With b_i = a_i for odd i and b_i = −a_i for even i, you need a non-empty block of b with sum 0. A block sum P[r] − P[l−1] is zero exactly when two prefix sums are equal, so the question becomes "does the prefix array contain a repeated value?".',
        'Compute P[0] = 0 and P[1..n] with the signed amounts, sort the n+1 values (or insert them into a set) and check for a duplicate. O(n log n) per test; avoid unordered_map here, it is a known anti-hash target.',
      ],
      solution: 'Negate the even-numbered glasses: b_i = a_i for odd i, −a_i for even i. A range l..r is balanced iff b_l + … + b_r = 0 iff P[r] = P[l−1]. So the answer is YES iff the values P[0..n] contain a duplicate; sort them and compare neighbours. The sums reach 2·10^14, so use long long, and leaving out P[0] misses ranges that start at the first glass.',
    },
    {
      id: '1272D',
      name: 'Remove One Element',
      rating: 1500,
      tier: 'core',
      hints: [
        'If you remove a_i, the new increasing run through the gap is a run ending at a_{i−1} glued to a run starting at a_{i+1}, provided a_{i−1} < a_{i+1}. How could you know those two run lengths instantly for every i?',
        'This is the left/right precomputation pattern: L[i] is the length of the strictly increasing run ending at i (filled left to right) and R[i] the length of the run starting at i (filled right to left). With both arrays, each possible removal is evaluated in O(1).',
        'Answer = max(max over i of L[i], max over interior i with a_{i−1} < a_{i+1} of L[i−1] + R[i+1]). Two passes to build L and R and one scan to combine them: O(n).',
      ],
      solution: 'Compute L[i] = L[i−1] + 1 if a_{i−1} < a_i else 1, and R[i] symmetrically from the right. With no removal the answer is max L[i]. Removing an interior a_i joins the two runs when a_{i−1} < a_{i+1}, giving L[i−1] + R[i+1]. Take the maximum of all candidates in O(n). The common miss is forgetting the no-removal case, which is the answer for an already increasing array such as the second sample.',
    },
    {
      id: '835C',
      name: 'Star sky',
      rating: 1600,
      tier: 'core',
      hints: [
        'Brightness changes with time, so one 2D prefix sum of brightness cannot serve every view. But c ≤ 10, and each star’s brightness cycles with period c+1. What do all stars that start with the same brightness have in common at time t?',
        'Group the stars by initial brightness s (at most 11 groups). Every star in group s has brightness (s + t) mod (c+1) at time t, so for each group you only need how many of its stars lie in the rectangle: one 2D prefix count per group on the 100 × 100 sky.',
        'Build cnt[s][x][y] and turn each layer into a 2D prefix sum. For a view, for every s get the rectangle count k_s by inclusion–exclusion and add k_s · ((s + t) mod (c+1)). O(c · 100² + q · c).',
      ],
      solution: 'Let cnt[s][x][y] count the stars at (x, y) with initial brightness s, and make each of the c+1 layers a 2D prefix sum. A view (t, x1, y1, x2, y2) adds, for each s from 0 to c, k = S[x2][y2] − S[x1−1][y2] − S[x2][y1−1] + S[x1−1][y1−1] times (s + t) mod (c+1). Several stars can share a point, so count rather than mark, and the rectangle includes its border. O(c · 100² + q · c).',
    },
    {
      id: '1398C',
      name: 'Good Subarrays',
      rating: 1600,
      tier: 'core',
      hints: [
        'The condition "sum equals length" compares two quantities that both grow with the subarray. Can you charge the length to the elements one at a time?',
        'The sum of a_l..a_r equals r−l+1 exactly when the sum of (a_i − 1) over l..r is 0. With prefix sums P of a_i − 1 that means P[r] = P[l−1], so you are counting pairs of equal prefix values.',
        'Walk left to right with a count of every prefix value seen so far, starting with P[0] = 0 seen once; at each r add the count of P[r], then record P[r]. P stays within [−n, 8n], so an array shifted by n works. O(n) per test, answer in long long.',
      ],
      solution: 'Replace each digit a_i with a_i − 1; a good subarray is then a block with sum 0, i.e. a pair l−1 < r with P[l−1] = P[r]. Count equal pairs in one pass with a frequency table seeded with P[0] = 0. The answer can reach about n²/2 = 5·10^9, so use long long. Forgetting the initial P[0] drops every good prefix: the second sample then gives 4 instead of 6.',
    },
    {
      id: '1373D',
      name: 'Maximum Sum on Even Positions',
      rating: 1600,
      tier: 'challenge',
      hints: [
        'Reverse a block of odd length: does any element change the parity of its position? Then reverse a block of even length and watch what happens to neighbouring pairs.',
        'An odd-length reversal keeps every element on its parity, so it never helps. An even-length reversal starting at l has the same effect on the even-position sum as swapping each pair (l, l+1), (l+2, l+3), …, so each pair has a fixed gain and you want the contiguous run of pairs with the largest total gain: a maximum subarray sum.',
        'Build two gain arrays: pairs (0,1), (2,3), … with gain a[2i+1] − a[2i], and pairs (1,2), (3,4), … with gain a[2i−1] − a[2i]. For each, the best block is max over r of P[r] − min over l ≤ r of P[l] (at least 0, the empty block). Add the larger one to the initial even sum. O(n).',
      ],
      solution: 'Start from base = a_0 + a_2 + …. Only even-length reversals matter, and they act as swaps of aligned pairs. Blocks starting at an even index give gains a_{2i+1} − a_{2i}; blocks starting at an odd index give gains a_{2i−1} − a_{2i}. The answer is base plus the larger maximum subarray sum (empty allowed, so never negative) of the two gain arrays, each computed with a running prefix minimum in O(n). Sums reach 2·10^14, so use long long.',
    },
    {
      id: '466C',
      name: 'Number of Ways',
      rating: 1700,
      tier: 'challenge',
      hints: [
        'If the whole array sums to S, what must each of the three parts sum to? What does that force the prefix sum to be at each of the two cut points?',
        'The parts are equal iff S is divisible by 3, the first part ends at some p with P[p] = S/3, and the second ends at some q > p with P[q] = 2S/3 (the third part then sums to S/3 automatically). So you are counting pairs p < q, which one left-to-right pass with a running count handles.',
        'If S mod 3 ≠ 0, print 0. Otherwise scan q from 2 to n−1: first add 1 to cnt if P[q−1] = S/3 (p = q−1 becomes available), then if P[q] = 2S/3 add cnt to the answer. O(n), answer in long long.',
      ],
      solution: 'Let P be the prefix sums and S = P[n]. If S is not divisible by 3 the answer is 0. Otherwise count pairs 1 ≤ p < q ≤ n−1 with P[p] = S/3 and P[q] = 2S/3 by sweeping q and keeping how many valid p lie strictly before it. The strict p < q matters when S = 0 (then S/3 = 2S/3, as in an all-zero array), q must stop at n−1 so the third part is non-empty, and the count reaches about n²/2, so use long long. O(n).',
    },
  ],
};
