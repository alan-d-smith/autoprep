// Prefix and suffix sums: primer and problems.
export default {
  id: 'prefix-sums',
  title: 'Prefix and suffix sums',
  track: 'dp',
  summary: 'Answer any range-sum question in O(1) after one O(n) pass, combine best-from-the-left with best-from-the-right around a split, and turn "count the subarrays with property X" into counting equal prefix values.',
  primer: {
    slides: [
      {
        title: 'Questions about blocks of consecutive values',
        points: [
          'Many questions ask for the total from l to r, or how many blocks sum to exactly k.',
          'Adding up each block from scratch is O(n): about 4·10^10 steps for 2·10^5 questions.',
          'The blocks overlap, so almost all of that adding is repeated work.',
        ],
        say: 'Many questions ask about blocks of consecutive values: the total from position l to position r, how many marked positions lie between them, or how many blocks add up to exactly k. Adding a block up from scratch costs O(n), so 2·10^5 such questions on 2·10^5 values take about 4·10^10 steps. Testing all n²/2 blocks one by one, about 2·10^10 of them, is no better. The blocks overlap, so almost all of that adding is repeated work.',
      },
      {
        title: 'Every block is a difference of prefixes',
        points: [
          'A prefix is a block that starts at the beginning.',
          'The values from l to r are the first r + 1 values with the first l taken away.',
          'Know the sum of every prefix, and any block\'s sum is one subtraction.',
        ],
        show: [0, 10],
        note: 'The block a[2..5] sums to P[6] − P[2] = 23 − 4 = 19.',
        say: 'Every block is the difference of two prefixes, the blocks that start at the beginning. The values from l to r are the first r + 1 values with the first l taken away, so once the sum of every prefix is known, the sum of any block is one subtraction.',
      },
      {
        title: 'One pass fills P',
        points: [
          'P[i] is the sum of the first i values: P[0] = 0, then P[i+1] = P[i] + a[i].',
          'The block a[l..r] sums to P[r+1] − P[l], so after the O(n) pass each question is O(1).',
          'On a grid, S[i][j] gives any rectangle in four lookups by inclusion–exclusion.',
        ],
        show: [0, 7],
        note: 'The pass has just filled P[7] = P[6] + a[6] = 25, the total of the whole array.',
        say: 'Call the input a, indexed from 0, and let P[i] be the sum of its first i values, a[0] + … + a[i−1]. One left-to-right pass fills all n + 1 entries: P[0] = 0 for the empty prefix, then P[i+1] = P[i] + a[i]. The block a[l..r], from index l to index r with both ends included, sums to P[r+1] − P[l], so after that O(n) pass every question costs O(1). A grid works the same way with S[i][j], the sum of the top-left block of i rows by j columns. Any rectangle takes four lookups by inclusion–exclusion: the top-left block that ends at the rectangle\'s bottom-right cell, minus the blocks above it and to its left, plus the block above and to the left that was subtracted twice.',
      },
      {
        title: 'The shared prefix cancels',
        points: [
          'P[r+1] and P[l] both contain a[0] + … + a[l−1], and the subtraction removes exactly those.',
          'P[0] = 0 lets a block that starts at index 0 use the same formula.',
          'So any condition on a block becomes a condition on two prefix values.',
        ],
        show: [0, 9],
        note: 'P[2] = 4 is the part before the block, so subtracting it leaves exactly a[2..5].',
        say: 'Why it is right: P[r+1] and P[l] both contain a[0] + … + a[l−1], and the subtraction cancels exactly those terms, leaving a[l] + … + a[r]. The empty prefix, P[0] = 0, lets a block that starts at index 0 use the same formula. Since the identity holds for every pair l ≤ r, any condition on a block can be rewritten as a condition on two prefix values.',
      },
      {
        title: 'Count blocks by matching prefix values',
        points: [
          'a[l..r] sums to k exactly when P[r+1] − P[l] = k: count pairs i < j with P[i] = P[j] − k.',
          'Walk j with `seen`, seeded with 0 once: add the count of P[j] − k, then record P[j].',
          'Many conditions reduce to this: "the sum equals the length" is "the values a_i − 1 sum to 0".',
        ],
        show: [0, 16],
        note: 'The case k = 0 on a new array a: P[5] = P[0] = 0, so the block a[0..4] sums to 0.',
        say: '"The block a[l..r] sums to k" becomes P[r+1] − P[l] = k, so counting such blocks means counting pairs of prefix positions i < j with P[i] = P[j] − k. Walk j from 1 to n with `seen`, a map from each prefix value met so far to how often it occurred, seeded with the value 0 once for P[0]: at each j add the count of P[j] − k, then record P[j]. That is one O(n log n) pass. When k is 0 it is a search for equal prefix values, and sorting them and comparing neighbours works too. Many conditions turn into this one: "the sum equals the length" is "the values a_i − 1 sum to 0", and "two kinds of item balance" is "the sum is 0 once one kind is negated".',
      },
      {
        title: 'Splits combine a left and a right',
        points: [
          'Fill L[i], the best part ending at i, left to right, and R[i], the best part starting at i, right to left.',
          'Removing one element, cutting once or picking a pivot then costs O(1) per choice, O(n) in all.',
          'Maximum subarray sum: maximise P[r] − P[l] over l < r, keeping the running minimum of P.',
        ],
        say: 'Prefix values have a mirror image, suffix values computed from the right, and the two together handle splits. Fill L[i], the best answer for a part that ends at index i, from left to right, and R[i], the best for a part that starts at i, from right to left. When the question removes one element, cuts the array once or picks a pivot, each choice combines a left part with a right part, so it costs O(1) from L and R and trying them all is O(n). The maximum subarray sum fits the same pattern: maximise P[r] − P[l] over l < r, a non-empty block, by keeping the running minimum of P from the left.',
      },
    ],
    terms: [
      'a[i]: the input value at index i, counting from 0; a[l..r] is the block from index l to index r, both ends included.',
      'P[i]: the sum of the first i values, a[0] + … + a[i−1], with P[0] = 0; it has n + 1 entries, and a[l..r] sums to P[r+1] − P[l]. In `countSubarrays`, P is a single running total, the prefix sum so far.',
      'S[i][j]: on a grid g, the sum of the top-left block of i rows by j columns, g[0..i−1][0..j−1]; `query(r1, c1, r2, c2)` returns the rectangle with those inclusive corners (the TRD version, `prefix2D`, returns S itself, without `query`).',
      '`seen`: in `countSubarrays`, a map from each prefix value met so far to how many times it occurred, seeded with 0 once for P[0].',
      'L[i]: the best answer for a part of the array that ends at index i, filled left to right; what "best" means depends on the problem, such as the longest increasing run ending at i.',
      'R[i]: the mirror image of L[i], the best answer for a part that starts at index i, filled right to left.',
    ],
    worked: {
      title: 'blocks that sum to k',
      question: 'An array a holds the n = 6 values 1, 2, −1, 3, −2, 3, and k = 3. Count the blocks of consecutive values whose sum is exactly k. The real version has n up to 2·10^5, values between −10^9 and 10^9, and |k| ≤ 2·10^14.',
      steps: [
        'Recognise it: a count of blocks with a condition on their sum. At full size there are about n²/2 ≈ 2·10^10 blocks, too many to try, and the negative values rule out a sliding window, because making a block longer can lower its sum. So rewrite the condition with prefix sums.',
        'Model it: the block that starts at index i and ends just before index j sums to P[j] − P[i], so it sums to k exactly when P[i] = P[j] − k. For each j from 1 to n, count the earlier positions i < j with that prefix value; `seen` holds those counts.',
        'The prefix sums P[0] to P[6] are 0, 1, 3, 2, 5, 3, 6. Start with `seen` holding the value 0 once, for P[0].',
        'Walk j, looking up P[j] − 3 before recording P[j]. j = 1: P[1] = 1, look for −2: none. j = 2: P[2] = 3, look for 0: once, the block a[0..1]. j = 3: P[3] = 2, look for −1: none. j = 4: P[4] = 5, look for 2: once, a[3..3]. j = 5: P[5] = 3, look for 0: once, a[0..4].',
        'j = 6: P[6] = 6, look for 3, which `seen` holds twice, from P[2] and P[5]. One lookup finds two blocks, a[2..5] and a[5..5], which is why `seen` counts occurrences rather than just marking values.',
        'Answer: 1 + 1 + 1 + 2 = 5 blocks. The single pass with a map is O(n log n). Prefix sums reach 2·10^14 and the count reaches about 2·10^10 (all zeros with k = 0), so both need long long. Without the starting 0 for P[0] the walk finds only 3, missing a[0..1] and a[0..4].',
      ],
    },
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
      'Best block to reverse, flip or swap → write down the gain of each position, then maximise P[r] − min P[l] over l ≤ r, a maximum subarray sum in which l = r is the empty block (gain 0, for when changing nothing is allowed)',
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
        'Mark c_i = 1 when s_i = s_{i+1}. Every query is then a sum of c over a range, a prefix-sum query; with 10^5 queries you cannot rescan the string each time.',
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
      solution: 'Negate the even-numbered glasses: b_i = a_i for odd i, −a_i for even i. A range l..r is balanced exactly when b_l + … + b_r = 0 exactly when P[r] = P[l−1]. So the answer is YES exactly when the values P[0..n] contain a duplicate; sort them and compare neighbours. The sums reach 2·10^14, so use long long, and leaving out P[0] misses ranges that start at the first glass.',
    },
    {
      id: '1272D',
      name: 'Remove One Element',
      rating: 1500,
      tier: 'core',
      hints: [
        'If you remove a_i, the new increasing run through the gap is a run ending at a_{i−1} glued to a run starting at a_{i+1}, provided a_{i−1} < a_{i+1}. How could you know those two run lengths in O(1) for every i?',
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
        'The parts are equal exactly when S is divisible by 3, the first part ends at some p with P[p] = S/3, and the second ends at some q > p with P[q] = 2S/3 (the third part then sums to S/3 automatically). So you are counting pairs p < q, which one left-to-right pass with a running count handles.',
        'If S mod 3 ≠ 0, print 0. Otherwise scan q from 2 to n−1: first add 1 to cnt if P[q−1] = S/3 (p = q−1 becomes available), then if P[q] = 2S/3 add cnt to the answer. O(n), answer in long long.',
      ],
      solution: 'Let P be the prefix sums and S = P[n]. If S is not divisible by 3 the answer is 0. Otherwise count pairs 1 ≤ p < q ≤ n−1 with P[p] = S/3 and P[q] = 2S/3 by sweeping q and keeping how many valid p lie strictly before it. The strict p < q matters when S = 0 (then S/3 = 2S/3, as in an all-zero array), q must stop at n−1 so the third part is non-empty, and the count reaches about n²/2, so use long long. O(n).',
    },
  ],
};
