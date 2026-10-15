// LIS, LDS and their disguises: primer and problems.
export default {
  id: 'lis',
  title: 'LIS, LDS and their disguises',
  track: 'dp',
  summary: 'Compute longest increasing, non-decreasing and decreasing subsequences in O(n log n), rebuild one, and recognise LIS behind problems about removing, nesting, crossing or colouring.',
  primer: {
    idea: 'The longest increasing subsequence (LIS) is the largest set of elements you can keep, in their original order, so that they increase. The O(n²) DP dp[i] = 1 + max dp[j] over j < i with a[j] < a[i] is fine up to n ≈ 5000 and works for any "can follow" test, such as nesting in two dimensions; the O(n log n) method keeps tails[k], the smallest last value of an increasing subsequence of length k + 1, and places each a[i] by binary search. The variants are small switches on this one routine: strict versus non-strict is lower_bound versus upper_bound, decreasing is LIS of the negated values, and by Dilworth\'s theorem the fewest non-decreasing subsequences that cover an array equals its longest strictly decreasing subsequence (and the fewest non-increasing ones equals the LIS).',
    spot: [
      'Keep, or remove, as many items as possible so that what is left is in order',
      'Items are pairs such as (width, height) or (entry hole, exit hole), and one item fits inside, follows or crosses another',
      'A graph whose edges join inverted pairs (a bigger value before a smaller one): its independent sets are increasing subsequences and its cliques are decreasing ones',
      'The fewest groups, colours or passes such that each group on its own is sorted',
    ],
    disguises: [
      'Fewest items to remove or move so the rest is sorted → n minus the longest non-decreasing subsequence',
      'Nest envelopes, boxes or dolls → sort by one dimension, then LIS on the other (equal first coordinates must not chain)',
      'Largest group of pairwise crossing segments between two parallel lines → longest decreasing subsequence of exit positions listed in entry order (pairwise non-crossing → LIS)',
      'Fewest colours so that each colour class is sorted → length of the longest strictly decreasing subsequence (Dilworth)',
    ],
    pitfalls: [
      'Mixing up strict and non-strict: lower_bound builds a strictly increasing subsequence, upper_bound a non-decreasing one. "Remove the fewest so the rest is sorted" usually allows equal values, so it needs upper_bound.',
      'Treating tails as an actual subsequence. It only certifies the length; to rebuild one, store for each i the index that ended the previous length (par[i]) and walk back from the end of the longest.',
      'Sorting pairs by the first coordinate and running LIS on the second when equal first coordinates may not chain. Sort ties by the second coordinate descending, or compare both coordinates in an O(n²) DP.',
    ],
    code: `// O(n log n) LIS that also returns the indices of one longest subsequence.
// tails[k] = smallest last value of an increasing subsequence of length k + 1.
// strict = true:  strictly increasing (lower_bound)
// strict = false: non-decreasing      (upper_bound)
// Longest decreasing subsequence: call it on the negated values.
vector<int> lis(const vector<long long> &a, bool strict = true) {
  int n = a.size();
  vector<long long> tails;
  vector<int> tailIdx, par(n, -1);   // tailIdx[k] = index holding tails[k]
  for (int i = 0; i < n; i++) {
    auto it = strict ? lower_bound(tails.begin(), tails.end(), a[i])
                     : upper_bound(tails.begin(), tails.end(), a[i]);
    int k = it - tails.begin();       // a[i] ends a subsequence of length k + 1
    if (k > 0) par[i] = tailIdx[k - 1];
    if (it == tails.end()) tails.push_back(a[i]), tailIdx.push_back(i);
    else *it = a[i], tailIdx[k] = i;
  }
  vector<int> idx;
  for (int i = tailIdx.empty() ? -1 : tailIdx.back(); i != -1; i = par[i]) idx.push_back(i);
  reverse(idx.begin(), idx.end());
  return idx;                         // idx.size() is the length
}`,
    resources: [
      { label: 'CP-Algorithms: Longest increasing subsequence', url: 'https://cp-algorithms.com/sequences/longest_increasing_subsequence.html' },
      { label: 'USACO Guide: Longest Increasing Subsequence', url: 'https://usaco.guide/gold/lis' },
      { label: 'CSES: Increasing Subsequence', url: 'https://cses.fi/problemset/task/1145' },
    ],
  },
  problems: [
    {
      id: '1682C',
      name: 'LIS or Reverse LIS?',
      rating: 1400,
      tier: 'warmup',
      hints: [
        'LIS of the reversed array is the longest strictly decreasing subsequence of a. How many positions can a strictly increasing and a strictly decreasing subsequence of the same array have in common?',
        'At most one, the peak where they meet. Each also uses any value at most once, so a value that occurs twice or more can serve both sides (one copy each), while a value that occurs once serves only one side, apart from that single shared position.',
        'With d values occurring at least twice and s occurring exactly once, LIS(a) + LIS(a′) ≤ 2d + s + 1, so the beauty is at most d + ⌈s/2⌉, and this bound is reachable (1 1 3 5 5 → 1 5 3 5 1 gives 3 both ways). Count frequencies and print d + (s + 1) / 2.',
      ],
      solution: 'A strictly increasing and a strictly decreasing subsequence share at most one position, and each uses every value at most once. So with d values that occur at least twice and s that occur once, LIS(a) + LIS(a′) ≤ 2d + s + 1 and the minimum of the two is at most d + ⌈s/2⌉; a suitable arrangement reaches it, for example 1 1 3 5 5 → 1 5 3 5 1. Count frequencies with a map (or after sorting) and print d + (s + 1) / 2; O(n log n) per test. Values that occur three or more times still count only once in d, because strictness lets each side use one copy.',
    },
    {
      id: '340D',
      name: 'Bubble Sort Graph',
      rating: 1500,
      tier: 'warmup',
      hints: [
        'Which pairs of values does bubble sort ever swap? Try a few permutations: does 3 get an edge to 1 when 3 starts before 1? When 1 starts before 3?',
        'Two values are swapped, and so joined by an edge, exactly when they form an inversion: the larger one starts on the left. A set with no edges therefore has no inversions, so its values appear in increasing order. The maximum independent set is the longest increasing subsequence.',
        'Do not simulate bubble sort, which is O(n²) for n = 10^5. Run the O(n log n) tails method on the permutation with lower_bound and print the length.',
      ],
      solution: 'Bubble sort only swaps adjacent values that are out of order, and a pair that starts inverted can only change its relative order by being swapped directly, which must happen for the array to end sorted. So G has an edge exactly between the inverted pairs (i < j, a_i > a_j). A set of vertices with no edge between them contains no inversion, so it is an increasing subsequence, and every increasing subsequence is independent; the answer is the LIS. Compute it in O(n log n) with tails; the values are distinct, so strict and non-strict agree.',
    },
    {
      id: '977F',
      name: 'Consecutive Subsequence',
      rating: 1700,
      tier: 'core',
      hints: [
        'This is LIS with a stricter rule: the next element must be exactly one more than the previous. For an occurrence of v at position i, which earlier elements could come right before it?',
        'Only an earlier occurrence of v − 1. So the LIS-style state "longest chain ending at this element" needs no binary search: dp[v] = the longest chain x, x + 1, ..., v ending at an occurrence of v seen so far, and reading v sets dp[v] = dp[v − 1] + 1.',
        'Scan left to right with a map<int, int> dp (values reach 10^9), updating dp[a_i] = max(dp[a_i], dp[a_i − 1] + 1) and remembering the best length k and its last value x. To print indices, scan from the right taking x, then x − 1, and so on until you have k, then print them in increasing order. O(n log n).',
      ],
      solution: 'Process the array in order and keep dp[v] = the length of the longest chain x, x + 1, ..., v ending at an occurrence of v seen so far; reading a_i sets dp[a_i] = max(dp[a_i], dp[a_i − 1] + 1). Let k be the best length and x its last value. Rebuild from the right: scan i from n down to 1 and take i whenever a_i equals the value you are waiting for (x first, then x − 1, ...), stopping after k picks, then reverse; taking the rightmost possible occurrence each time always leaves room for the rest. Use map, or a sorted copy of the values; unordered_map can be slowed down by anti-hash tests. O(n log n).',
    },
    {
      id: '4D',
      name: 'Mysterious Present',
      rating: 1700,
      tier: 'core',
      hints: [
        'First throw away the envelopes the card does not fit into. Listing a chain from the smallest envelope up, in what order do the widths appear, and what does that suggest doing before anything else?',
        'A chain is strictly increasing in both width and height. After sorting the envelopes by width, every chain appears in that order, so the task is a longest increasing subsequence where "j can come before i" means w_j < w_i and h_j < h_i. With n ≤ 5000 the O(n²) LIS handles this two-dimensional test directly.',
        'dp[i] = 1 + max dp[j] over earlier j (in sorted order) with w_j < w_i and h_j < h_i, recording par[i] = the best j. Take the i with the largest dp, follow par back, reverse, and print the original numbers; print 0 if no envelope fits the card. O(n²).',
      ],
      solution: 'Keep only envelopes with w_i > w and h_i > h, remembering their original numbers, and print 0 if none remain. Sort them by width, so any chain is a subsequence of the sorted list, and compute dp[i] = 1 + max dp[j] over earlier j with strictly smaller width and strictly smaller height, recording the parent. Follow parents from the best end, reverse, and print the numbers from the smallest envelope up. Equal widths end up next to each other but cannot nest, which is why the test compares widths explicitly; an O(n log n) version sorts ties by height descending and runs a strict LIS on heights.',
    },
    {
      id: '269B',
      name: 'Greenhouse Effect',
      rating: 1700,
      tier: 'core',
      hints: [
        'The coordinates are a distraction: a replanted plant can go anywhere. Think about the plants you never touch. What must be true of their species, read from left to right?',
        'The untouched plants keep their order, and for the borders to exist that order must be all 1s, then all 2s, and so on: a non-decreasing subsequence of the species list. Any such subsequence can be kept (move every other plant into a free spot in its section), so the answer is n minus the longest non-decreasing subsequence.',
        'Read s_i and skip x_i (read it as a string). Run the tails method with upper_bound, because equal species may stay side by side, and print n − length. O(n log n); O(n²) also fits for n = 5000.',
      ],
      solution: 'A plant that is not replanted stays where it is, so the kept plants must already read 1...1 2...2 ... m...m from left to right, which is a non-decreasing subsequence of s. Conversely any non-decreasing subsequence can be kept, because real coordinates leave room to place each moved plant inside its own section. The answer is n − LNDS(s), computed with tails and upper_bound. Using lower_bound computes the strictly increasing version and overcounts the moves whenever a species repeats (sample 3: species 1 2 1 3 1 1 needs 2 moves, not 3). The positions are never needed.',
    },
    {
      id: '67D',
      name: 'Optical Experiment',
      rating: 1900,
      tier: 'core',
      hints: [
        'Describe each ray by its entry hole and its exit hole. When do two rays cross? Compare their order on the entry side with their order on the exit side.',
        'Rays p and q cross exactly when their orders disagree: p enters before q but exits after it. List the rays in entry order and write down each one\'s exit position; a group in which every pair crosses is a strictly decreasing subsequence of that list, so the answer is the longest decreasing subsequence.',
        'Store exitPos[ray] from the third line, form b_i = exitPos[x_i] for i = 1..n, and compute the LIS of −b_i with tails and lower_bound. n is 10^6, so the O(n²) DP is far too slow and input must be read with scanf or a fast cin.',
      ],
      solution: 'Two rays cross iff their entry order and exit order disagree. Let b_i be the exit hole of the ray that enters at hole i (b_i = position of x_i in the third line); a group of pairwise crossing rays is then a set whose exit holes strictly decrease in entry order, so the answer is the longest strictly decreasing subsequence of b. All b_i are distinct, so strict versus non-strict does not matter; negate and run the O(n log n) LIS. The O(n²) DP is too slow for n = 10^6, and reading two million numbers needs fast input.',
    },
    {
      id: '1296E2',
      name: 'String Coloring (hard version)',
      rating: 2000,
      tier: 'core',
      hints: [
        'Two characters of the same colour can never swap past each other. So what must be true of the characters of one colour, read left to right, if the string is to end up sorted?',
        'Each colour class must already be non-decreasing, and that is also enough: every adjacent inversion then has two different colours, so bubble sort can finish. The question is the fewest non-decreasing subsequences that cover the string, which by Dilworth\'s theorem equals the length of the longest strictly decreasing subsequence: those characters all need different colours, and that many colours suffice.',
        'Let dp[i] = the length of the longest strictly decreasing subsequence ending at i = 1 + max dp[j] over j < i with s_j > s_i. Keep best[c] = the largest dp at an earlier position holding letter c, so each step scans the letters above s_i. Colour position i with dp[i] and print the maximum; O(26 · n).',
      ],
      solution: 'A colour class keeps its internal order, so it must be non-decreasing; conversely, if every class is non-decreasing, any adjacent pair that is out of order has two colours and can be swapped, so the string can be bubble-sorted. The fewest non-decreasing classes equals the longest strictly decreasing subsequence (Dilworth). Colour position i with dp[i], the length of the longest strictly decreasing subsequence ending at i: two positions j < i with s_j > s_i always get dp[i] > dp[j], so equal colours are non-decreasing, and the number of colours is max dp. With best[c] over the 26 letters this runs in O(26 · n).',
    },
    {
      id: '486E',
      name: 'LIS of Sequence',
      rating: 2200,
      tier: 'challenge',
      hints: [
        'For index i to lie on some longest increasing subsequence, the best increasing run ending at i and the best one starting at i must fit together. How long must they be together?',
        'Compute f[i] = the LIS ending at i and g[i] = the LIS starting at i (the LIS ending at the matching position of the reversed, negated array). Index i is on some LIS iff f[i] + g[i] − 1 = L. In any LIS the k-th element has f exactly k, so i is on every LIS iff it is the only index on some LIS with its value of f.',
        'Run the tails routine twice, on a and on the reversed −a, reading f[i] as the position lower_bound returns plus one. Print 1 when f[i] + g[i] − 1 < L; otherwise count cnt[f[i]] over the indices that qualify and print 3 if cnt[f[i]] = 1, else 2. O(n log n).',
      ],
      solution: 'f[i], the length of the LIS ending at i, is one more than the position lower_bound finds in tails; g[i], the LIS starting at i, comes from the same routine on the reversed array with negated values. If f[i] + g[i] − 1 < L, index i is in group 1. Every LIS takes exactly one index from each level f = 1..L, and every qualifying index at level k extends to a full LIS, so a qualifying i is in group 3 iff it is alone at its level and in group 2 otherwise. O(n log n). Using upper_bound breaks strictness when values repeat, and reversing without negating measures decreasing runs instead of increasing ones.',
    },
  ],
};
