// LIS, LDS and their disguises: primer and problems.
export default {
  id: 'lis',
  title: 'LIS, LDS and their disguises',
  track: 'dp',
  summary: 'Compute longest increasing, non-decreasing and decreasing subsequences in O(n log n), rebuild one, and recognise LIS behind problems about removing, nesting, crossing or colouring.',
  primer: {
    slides: [
      {
        title: 'Keep the most numbers, strictly increasing',
        points: [
          'Keep as many of the n numbers as possible, in their order, so that they strictly increase: the LIS.',
          'Every subset is 2^n, and the DP dp[i] = 1 + max dp[j] over j < i with a[j] < a[i] is O(n²).',
          'O(n²) is fine up to n ≈ 5000, but about 2·10^10 comparisons at n = 2·10^5.',
        ],
        say: 'The question: from a sequence a of n numbers, keep as many as possible, in their original order, so that the kept ones strictly increase. They form a longest increasing subsequence (LIS). Trying every subset costs 2^n. The DP dp[i] = 1 + max dp[j] over j < i with a[j] < a[i], where dp[i] is the length of the longest increasing subsequence ending at a[i], costs O(n²): fine up to n ≈ 5000, but about 2·10^10 comparisons when n = 2·10^5.',
      },
      {
        title: 'Only the smallest end matters',
        points: [
          'Of two increasing subsequences of the same length, the one ending lower is at least as useful.',
          'Any later element that can extend the other can extend it too.',
          'So for each length keep one number: the smallest value a subsequence of that length can end with.',
        ],
        show: [0, 3],
        note: 'Partway through the scan: 2 replaces 4 as the end of a length-1 subsequence, leaving more room later.',
        say: 'That DP remembers more than it needs. Of two increasing subsequences of the same length, the one ending on the smaller value is at least as useful, because any later element that can extend the other can extend it too. So for each length only one number matters: the smallest value an increasing subsequence of that length can end with.',
      },
      {
        title: 'Binary-search the sorted tails',
        points: [
          'tails[k] is the smallest end of an increasing subsequence of length k + 1 so far.',
          '`tails` is strictly increasing, so lower_bound finds the first tail ≥ a[i], at position k.',
          'a[i] follows tails[k − 1] and replaces tails[k], or is appended when every tail is smaller.',
        ],
        show: [0, 16],
        note: 'Binary search places 5 at k = 2: it replaces tails[2] = 6 as the smallest end of a length-3 subsequence.',
        say: 'Keep those numbers in an array `tails`, where tails[k] is the smallest end of an increasing subsequence of length k + 1 among the elements read so far (k counts from 0). The array is strictly increasing, because dropping the last element of a subsequence of length k + 2 leaves one of length k + 1 that ends lower. So when a[i] arrives, a binary search with lower_bound finds the first tail ≥ a[i], at position k. a[i] can follow the length-k subsequence that ends at tails[k − 1], so it ends one of length k + 1 and replaces tails[k], or is appended when every tail is smaller.',
      },
      {
        title: 'Follow par back to rebuild it',
        points: [
          '`tails` certifies lengths, but its entries can come from different subsequences.',
          'Keep tailIdx[k], the index of tails[k]; when a[i] lands at k, record par[i] = tailIdx[k − 1].',
          'Walk `par` back from the element in the last tail, then reverse.',
        ],
        show: [0, 27],
        note: 'Following par back from the last tail gives 2, 3, 5, 8, while `tails` ends as 1, 3, 5, 8, not a subsequence, since its 1 is the last value.',
        say: 'The array `tails` certifies lengths but is not itself a subsequence, since its entries can come from different subsequences. To rebuild one, keep tailIdx[k], the index of the element now in tails[k], and when a[i] lands at position k record par[i] = tailIdx[k − 1], the element it followed (−1 when k = 0). Walking `par` back from the element in the last tail, then reversing, gives one longest increasing subsequence.',
      },
      {
        title: 'Only tails[k] can improve',
        points: [
          'The k tails below a[i] show it can end a subsequence of every length up to k + 1, and none longer.',
          'Shorter lengths already end below a[i]; for length k + 1 the old tail was ≥ a[i].',
          'So every entry keeps its meaning, and the final size of `tails` is the LIS length.',
        ],
        show: [0, 19],
        note: '8 replaces tails[3] = 10, the length-4 tail; every other tail keeps its meaning.',
        say: 'Why `tails` stays exact: the k tails below a[i] show that a[i] can end an increasing subsequence of every length up to k + 1, and of none longer, since no subsequence of length k + 1 ends below a[i]. For the shorter lengths the existing tail is already below a[i], and for length k + 1 the old tail was ≥ a[i], so tails[k] is the only entry that improves. Every entry keeps its meaning after every step, so at the end the size of `tails` is the LIS length.',
      },
      {
        title: 'Variants are switches on one routine',
        points: [
          'One binary search per element gives O(n log n); non-decreasing uses upper_bound, and LDS is the LIS of the negated values.',
          'By Dilworth, the fewest non-decreasing subsequences that cover an array equals the length of its longest strictly decreasing one.',
          'When "can follow" compares two coordinates, keep the O(n²) DP or sort by one and run LIS on the other.',
        ],
        say: 'Each element costs one binary search, O(n log n) in all. The variants are switches on this routine: non-decreasing uses upper_bound, which lets a[i] follow a tail equal to it; the longest decreasing subsequence (LDS) is the LIS of the negated values; and by Dilworth\'s theorem the fewest non-decreasing subsequences that cover an array equals the length of its longest strictly decreasing subsequence (and the fewest non-increasing ones equals the LIS length). When "can follow" compares two coordinates, as in nesting, either keep the O(n²) DP, which accepts any such test, or sort by one coordinate and run LIS on the other.',
      },
    ],
    terms: [
      'a[i]: the input sequence, indexed from 0, with n elements (`S` in the TRD version).',
      'dp[i]: in the O(n²) DP, the length of the longest increasing subsequence that ends at a[i].',
      'tails[k]: the smallest value that an increasing subsequence of length k + 1 can end with, among the elements read so far; it increases strictly with k (in the TRD version, `res` stores each tail paired with its index).',
      'tailIdx[k]: the index in a of the element currently stored in tails[k] (the index half of each pair in `res` in the TRD version).',
      'par[i]: the index of the element that a[i] followed when it was placed, or −1 if it started a subsequence (`prev` in the TRD version, which stores 0 there and stops by counting the length down instead).',
      '`strict`: true for strictly increasing (lower_bound), false for non-decreasing (upper_bound). The TRD version is strict only; its comment says to search for the pair (S[i], i) instead of (S[i], 0) to get non-decreasing.',
    ],
    worked: {
      problem: { source: 'kattis', id: 'manhattanmornings', name: 'Manhattan Mornings', difficulty: '4.3' },
      slides: [
        {
          title: 'Pass the most errands on the way',
          points: [
            'Home, work and n ≤ 10^5 errands are points of a street grid, with coordinates up to 10^9.',
            'Walk to work by a shortest route along the streets, passing as many errands as possible.',
          ],
          show: [0, 0],
          note: 'Sample 1: home at (0, 0), work at (6, 6) and three errands. The answer is 2.',
          say: 'The problem is Manhattan Mornings. Home, work and n errands, up to 10^5 of them, are points of a street grid, with coordinates up to 10^9. You walk to work along the streets by a shortest route and want to pass as many errands as possible on the way. In the first sample home is at (0, 0), work is at (6, 6), and the errands are at (5, 4), (2, 6) and (3, 1); the best route passes 2 of them.',
        },
        {
          title: 'Too many corners, too many pairs',
          points: [
            'A shortest route never steps away from work: in sample 1 it only goes up or right.',
            'A DP over every street corner between home and work can touch 10^18 of them.',
            'A DP over errands, each extending the best one it can follow, is O(n²): 5·10^9 pairs.',
          ],
          say: 'A shortest route never steps away from work, so in sample 1 it only goes up or right, and x and y never decrease along it. A DP over every street corner between home and work would follow that rule, but with coordinates up to 10^9 there can be 10^18 corners. A DP over the errands, where each errand extends the best route ending at an errand it can follow, is the O(n²) LIS DP: about 5·10^9 pairs when n is 10^5.',
        },
        {
          title: 'Sort by x, and routes become subsequences',
          points: [
            'Errand j can come before errand i exactly when x_j ≤ x_i and y_j ≤ y_i.',
            'Sort by x, and equal x by y: every route passes its errands in this order.',
            'A route is then a non-decreasing subsequence of the y values, so the answer is the longest one.',
          ],
          show: [0, 1],
          note: 'Sample 1 sorted by x: a = 6, 1, 4. Its longest non-decreasing subsequence is 1, 4.',
          say: 'Errand j can come before errand i on a route exactly when x_j ≤ x_i and y_j ≤ y_i. Sort the errands by x, and equal x by y, and every route passes its errands in that order. A route is then a subsequence of the sorted errands whose y values never decrease, and any such subsequence is a route. So the answer is the longest non-decreasing subsequence of the y values. In sample 1 the sorted errands are (2, 6), (3, 1) and (5, 4), so the y values are 6, 1, 4, and the longest is 1, 4.',
        },
        {
          title: 'Drop far errands and flip the axes',
          points: [
            'An errand outside the rectangle between home and work is never on a shortest route: drop it.',
            'If work is left of home, negate every x; if it is below home, negate every y.',
            'Let a[i] be the y of the i-th errand in sorted order, and run `tails` with upper_bound.',
          ],
          show: [1, 1],
          note: 'Sample 2 sorted after flipping both axes, since work at (0, 0) is left of and below home at (2, 1). The hollow errand at (3, 1) is dropped.',
          say: 'Two steps come before the sort. An errand outside the rectangle between home and work is never on a shortest route, so drop it. And if work is left of home, negate every x, and if work is below home, negate every y; the route then goes up and right as before. Now let a[i] be the y value of the i-th remaining errand in sorted order, and run `tails` on a with upper_bound, because two errands with equal y can both be visited.',
        },
        {
          title: 'Run tails on sample 1',
          points: [
            'a = 6, 1, 4: 6 starts `tails`, then 1 replaces it as the lowest end of a one-errand route.',
            '4 is above every tail, so it is appended: `tails` = 1, 4, and the answer is 2.',
          ],
          show: [0, 3],
          note: 'Midway through sample 1: 1 has replaced 6 in tails[0], so a route through one errand can end as low as y = 1.',
          say: 'In sample 1, a = 6, 1, 4. 6 starts `tails`. 1 is below 6, so upper_bound finds tails[0], and 1 replaces 6: a route through one errand can now end as low as y = 1, which leaves more room above it. 4 is above every tail, so it is appended, and `tails` ends as 1, 4. Its size, 2, is the answer: the route through (3, 1) and then (5, 4).',
        },
        {
          title: 'Equal values must chain: sample 2',
          points: [
            'Flipped and sorted, sample 2 is (−2, −1), (−2, 0), (0, −1), (0, 0), so a = −1, 0, −1, 0.',
            'upper_bound puts the second −1 after the first, and `tails` ends as −1, −1, 0: the answer is 3.',
            'lower_bound, or sorting equal x by y descending, would give 2.',
          ],
          show: [1, 4],
          note: 'Midway through sample 2: the second −1 replaces tails[1] = 0, so it follows the first −1 instead of replacing it.',
          say: 'In sample 2, after flipping both axes and dropping (3, 1), the errands sorted by x and then y are (−2, −1), (−2, 0), (0, −1) and (0, 0), so a = −1, 0, −1, 0. When the second −1 arrives, upper_bound passes over the tail equal to it and lands at tails[1]: an errand can follow another on the same street. `tails` ends as −1, −1, 0, so the answer is 3. With lower_bound the second −1 would replace the first and the answer would be 2, and sorting equal x by y descending would also give 2, because errands on the same avenue could then not chain.',
        },
        {
          title: 'Edge cases and cost',
          points: [
            'Errands at home, at work or on one shared point all count: they lie in the rectangle and chain.',
            'Sorting plus one binary search per errand is O(n log n); coordinates and their negatives fit in int.',
          ],
          show: [1, 6],
          note: 'The end of sample 2: one best route passes the errands at home, at (0, 1) and at work.',
          say: 'Errands at home or at work lie in the rectangle and count, as in sample 2, where the best route passes the errand at home, the one at (0, 1) and the one at work. Errands at the same point give equal pairs, which upper_bound lets chain, so in sample 3 both errands at (100, 100) count. Sorting and one binary search per errand take O(n log n), fast for 10^5 errands, and the coordinates and their negatives fit in int.',
        },
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, xh, yh, xw, yw;
    cin >> n >> xh >> yh >> xw >> yw;
    // Negate an axis when work is left of or below home, so the route goes up and right.
    int fx = xw < xh ? -1 : 1, fy = yw < yh ? -1 : 1;
    vector<pair<int, int>> pts;
    for (int i = 0; i < n; i++) {
        int x, y;
        cin >> x >> y;
        if (min(xh, xw) <= x && x <= max(xh, xw) && min(yh, yw) <= y && y <= max(yh, yw))
            pts.push_back({fx * x, fy * y});
    }
    sort(pts.begin(), pts.end());        // by x, equal x by y
    vector<int> tails;                   // over a[i], the y values in this order
    for (auto [x, y] : pts) {
        auto it = upper_bound(tails.begin(), tails.end(), y);   // non-decreasing
        if (it == tails.end()) tails.push_back(y);
        else *it = y;
    }
    cout << tails.size() << "\\n";
}`,
    },
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
      solution: 'Two rays cross exactly when their entry order and exit order disagree. Let b_i be the exit hole of the ray that enters at hole i (b_i = position of x_i in the third line); a group of pairwise crossing rays is then a set whose exit holes strictly decrease in entry order, so the answer is the longest strictly decreasing subsequence of b. All b_i are distinct, so strict versus non-strict does not matter; negate and run the O(n log n) LIS. The O(n²) DP is too slow for n = 10^6, and reading two million numbers needs fast input.',
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
        'Compute f[i] = the LIS ending at i and g[i] = the LIS starting at i (the LIS ending at the matching position of the reversed, negated array). Index i is on some LIS exactly when f[i] + g[i] − 1 = L. In any LIS the k-th element has f exactly k, so i is on every LIS exactly when it is the only index on some LIS with its value of f.',
        'Run the tails routine twice, on a and on the reversed −a, reading f[i] as the position lower_bound returns plus one. Print 1 when f[i] + g[i] − 1 < L; otherwise count cnt[f[i]] over the indices that qualify and print 3 if cnt[f[i]] = 1, else 2. O(n log n).',
      ],
      solution: 'f[i], the length of the LIS ending at i, is one more than the position lower_bound finds in tails; g[i], the LIS starting at i, comes from the same routine on the reversed array with negated values. If f[i] + g[i] − 1 < L, index i is in group 1. Every LIS takes exactly one index from each level f = 1..L, and every qualifying index at level k extends to a full LIS, so a qualifying i is in group 3 exactly when it is alone at its level and in group 2 otherwise. O(n log n). Using upper_bound breaks strictness when values repeat, and reversing without negating measures decreasing runs instead of increasing ones.',
    },
  ],
};
