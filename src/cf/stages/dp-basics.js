// DP: states and transitions: primer and problems.
export default {
  id: 'dp-basics',
  title: 'DP: states and transitions',
  track: 'dp',
  summary: 'Write a DP state as one sentence, add the small extra index the next step needs (last action, run length, time of day), and fill the table with take/skip or count-the-ways transitions.',
  primer: {
    idea: 'A DP state is a sentence: "dp[i][s] = the best answer for the first i positions, given that position i ended in situation s". The extra index s holds exactly what the next step needs to know about the past and nothing more: the last action, which row the last pick came from, the current run length, or the time of day mod h. The cost is (number of states) × (choices per state), so n positions with 3 extra states is O(n) and n sleeps on an h-hour clock is O(n · h). Counting problems use the same table with + instead of max, start from one way to build the empty prefix, and reduce modulo p after every addition.',
    spot: [
      'Choices are made left to right (days, trees, students in a row) and each choice only restricts the next one or two',
      'The rule mentions the previous step: not the same activity two days running, not the same row twice in a row, at most k in a row',
      'Count the ways, modulo 10^9 + 7, to build something of length n from blocks or moves',
      'A greedy rule fails on a small hand example, and the number of (position, extra state) pairs is at most about 10^7',
    ],
    disguises: [
      'Deleting a value also deletes every v − 1 and v + 1 → group equal values, then run the no-two-adjacent take/skip DP over the value axis (house robber)',
      'Count walks of length n on a small fixed graph → DP over steps whose state is the current vertex, or a class of vertices that symmetry makes interchangeable',
      'Count strings built from fixed-size blocks → ways[i] = ways[i − 1] + ways[i − k], plus prefix sums when the question asks about a range of lengths',
      'A schedule that keeps drifting around a clock → the state is the time mod h, not the absolute time',
    ],
    pitfalls: [
      'Initialising unreachable states to 0 when maximising. A length that cannot be cut exactly, or a day that cannot end in sport, must start at −∞ (or a sentinel you skip) so it never feeds a later state.',
      'Leaving a fact out of the state. If the transition at i depends on what happened at i − 1 (which way a tree fell, which row the last student came from), that fact must be an index of dp.',
      'Overflow and negative remainders: sums of 10^5 heights of 10^9 need long long, and (pre[b] − pre[a − 1]) % MOD can be negative in C++, so add MOD before the final %.',
    ],
    code: `// DP over positions with a small extra state s = how many items in a row were
// just taken. dp[s] describes the prefix so far; each step builds the next row.
const long long MOD = 1e9 + 7, NEG = LLONG_MIN / 4;

// Maximise the sum of taken a[i] with never more than K taken in a row.
long long bestNoLongRun(const vector<long long> &a, int K) {
  vector<long long> dp(K + 1, NEG);
  dp[0] = 0;                                    // empty prefix, run length 0
  for (long long x : a) {
    vector<long long> nd(K + 1, NEG);
    for (int s = 0; s <= K; s++) {
      if (dp[s] == NEG) continue;               // unreachable state
      nd[0] = max(nd[0], dp[s]);                // skip: run resets
      if (s < K) nd[s + 1] = max(nd[s + 1], dp[s] + x);  // take: run grows
    }
    dp = nd;
  }
  return *max_element(dp.begin(), dp.end());
}

// Same skeleton, counting: + instead of max, and 1 way to build the empty prefix.
// Number of 0/1 strings of length n with never more than K ones in a row.
long long countNoLongRun(int n, int K) {
  vector<long long> dp(K + 1, 0);
  dp[0] = 1;
  for (int i = 0; i < n; i++) {
    vector<long long> nd(K + 1, 0);
    for (int s = 0; s <= K; s++) {
      nd[0] = (nd[0] + dp[s]) % MOD;                      // write 0
      if (s < K) nd[s + 1] = (nd[s + 1] + dp[s]) % MOD;   // write 1
    }
    dp = nd;
  }
  return accumulate(dp.begin(), dp.end(), 0LL) % MOD;
}`,
    resources: [
      { label: 'CP-Algorithms: Introduction to dynamic programming', url: 'https://cp-algorithms.com/dynamic_programming/intro-to-dp.html' },
      { label: 'USACO Guide: Introduction to DP', url: 'https://usaco.guide/gold/intro-dp' },
      { label: 'CSES: Dice Combinations (counting ways mod p)', url: 'https://cses.fi/problemset/task/1633' },
    ],
  },
  problems: [
    {
      id: '189A',
      name: 'Cut Ribbon',
      rating: 1300,
      tier: 'warmup',
      hints: [
        'Suppose you already knew the best answer for every length shorter than n. What does the last piece you cut leave behind?',
        'Let dp[len] = the most pieces whose lengths add up to exactly len. The last piece is a, b or c, so dp[len] is one more than the best of dp[len − a], dp[len − b], dp[len − c]. Greedy (cut as many of the shortest piece as possible) fails because the leftover may not be cuttable: n = 7 with pieces 5, 5, 2 leaves 1 after three 2s.',
        'Set dp[0] = 0 and every other entry to −∞, then for len = 1..n take the max of dp[len − p] + 1 over p in {a, b, c} with p ≤ len and dp[len − p] reachable. Print dp[n]; O(n).',
      ],
      solution: 'dp[len] is the maximum number of pieces whose lengths sum to exactly len, with dp[0] = 0 and all other entries −∞ (unreachable). For len from 1 to n, dp[len] = max(dp[len − a], dp[len − b], dp[len − c]) + 1, skipping a piece that is longer than len or whose source is unreachable. The statement guarantees dp[n] is reachable, so print it; O(n). Initialising with 0 instead of −∞ is the usual WA: it lets an uncuttable leftover count as zero pieces.',
    },
    {
      id: '1195C',
      name: 'Basketball Exercise',
      rating: 1400,
      tier: 'warmup',
      hints: [
        'Walk the columns from left to right. To know whether you may take the top or the bottom student of column i, what is the only fact you need about the team chosen so far?',
        'Only the row of the last chosen student matters, so put it in the state: a take/skip DP over columns with the row of the last pick as the extra index. Taking the taller student greedily fails: with columns (5 over 4) and (10 over 1), taking 5 first forces you to 1, while 4 then 10 gives 14.',
        'Let r1[i] / r2[i] = the largest total from columns 1..i whose last chosen student is in row 1 / row 2 (the empty team counts as 0 for both). Then r1[i] = max(r1[i − 1], r2[i − 1] + h1[i]) and r2[i] = max(r2[i − 1], r1[i − 1] + h2[i]); print max(r1[n], r2[n]). O(n).',
      ],
      solution: 'Define r1[i] and r2[i] as the maximum total height of a valid team drawn from columns 1..i whose last chosen student is in row 1 or row 2, with r1[0] = r2[0] = 0. Either the team does not use column i, or its last pick is in column i and the pick before it is in the other row, which gives r1[i] = max(r1[i − 1], r2[i − 1] + h1[i]) and symmetrically r2[i] = max(r2[i − 1], r1[i − 1] + h2[i]). Print max(r1[n], r2[n]). Heights reach 10^9 and n reaches 10^5, so use long long; two rolling variables give O(n) time and O(1) memory.',
    },
    {
      id: '698A',
      name: 'Vacations',
      rating: 1400,
      tier: 'core',
      hints: [
        'The only rule links today to yesterday. If you knew what Vasya did yesterday, which of today\'s options would be open?',
        'Make the last day\'s activity part of the state: dp[i][s] with s in {rest, contest, sport}. Greedily doing any available activity fails: on input 3 2, doing sport on day 1 forces a rest on day 2, while a contest on day 1 avoids it.',
        'dp[i][rest] = min over all s of dp[i − 1][s] + 1; dp[i][contest] = min(dp[i − 1][rest], dp[i − 1][sport]) if a_i is 1 or 3; dp[i][sport] = min(dp[i − 1][rest], dp[i − 1][contest]) if a_i is 2 or 3; every other state is +∞. Start from dp[0][rest] = 0 and print the minimum at day n; O(n).',
      ],
      solution: 'Let dp[i][s] be the fewest rest days among the first i days when day i ends in state s (rest, contest, sport), with dp[0][rest] = 0 and unavailable states +∞. Resting costs one and may follow anything; a contest may follow rest or sport when a_i has bit 0 set (a_i = 1 or 3); sport may follow rest or contest when a_i has bit 1 set (a_i = 2 or 3). Print the minimum of the three states after day n; O(n). Reading a_i as two bits avoids case-by-case mistakes for a_i = 3.',
    },
    {
      id: '455A',
      name: 'Boredom',
      rating: 1500,
      tier: 'core',
      hints: [
        'The positions in the sequence do not matter at all. If you take one copy of the value v, is there any reason not to take every copy of v?',
        'Taking v deletes all copies of v − 1 and v + 1 but no other copy of v, so the game is really: choose a set of values, no two consecutive, each worth v · cnt[v]. That is the no-two-adjacent take/skip DP (house robber), run over the values 1..10^5 instead of over the array.',
        'Count cnt[v], then dp[v] = max(dp[v − 1], dp[v − 2] + v · cnt[v]) for v up to the largest value, and print the last entry. Use long long: the score can reach 10^5 · 10^5 = 10^10.',
      ],
      solution: 'Taking one copy of v removes every v − 1 and v + 1 but leaves the other copies of v, which you then take as well, so the answer is the best set of values with no two consecutive, where value v is worth v · cnt[v]. Let dp[v] be the best score using only values 1..v: dp[v] = max(dp[v − 1], dp[v − 2] + v · cnt[v]). Iterate over every v up to 10^5, including values with count 0, for O(n + max a) total. The answer reaches 10^10, so an int accumulator overflows.',
    },
    {
      id: '545C',
      name: 'Woodcutters',
      rating: 1500,
      tier: 'core',
      hints: [
        'Process the trees from left to right. When you decide what tree i does, which earlier tree can get in its way, and what do you need to know about it?',
        'Tree i can only collide with tree i − 1 (on its left) and with the point of tree i + 1 (on its right). The one fact about the past that matters is where tree i − 1\'s occupied stretch ends, which depends only on whether it fell right. So use a DP with state "did tree i fall right".',
        'Keep stay[i] (tree i stands or fell left, so it occupies up to x_i) and right[i] (fell right, occupying up to x_i + h_i; allowed only if x_i + h_i < x_{i+1} or i is the last tree). Tree i may fall left only if x_i − h_i is strictly greater than the end of the stretch in the state you come from. O(n).',
      ],
      solution: 'Let stay[i] be the most trees felled among the first i when tree i ends at x_i (standing or fallen left), and right[i] the same when tree i fell right. stay[i] = max(stay[i − 1], right[i − 1]) for standing, improved to stay[i − 1] + 1 if x_i − h_i > x_{i − 1} and to right[i − 1] + 1 if x_i − h_i > x_{i − 1} + h_{i − 1}; right[i] = max(stay[i − 1], right[i − 1]) + 1 when i = n or x_i + h_i < x_{i + 1}, and −∞ otherwise. The first tree can always fall left, and all comparisons are strict because a fallen tree may not touch an occupied point. Print max(stay[n], right[n]); x_i + h_i reaches 2·10^9, so use long long.',
    },
    {
      id: '166E',
      name: 'Tetrahedron',
      rating: 1500,
      tier: 'core',
      hints: [
        'To count walks that end at D you do not need to know which of A, B, C the ant is on, only whether it is on D. Why are A, B and C interchangeable?',
        'This is counting DP over steps with a two-value state: d[k] = walks of length k that end at D, o[k] = walks of length k that end at any of A, B, C. Symmetry collapses four vertices into two classes, so each step is O(1).',
        'From D there are 3 moves, all into the other class; from each of A, B, C there is 1 move to D and 2 moves inside the class. So d[k] = o[k − 1] and o[k] = 3 · d[k − 1] + 2 · o[k − 1], starting from d[0] = 1, o[0] = 0, all modulo 10^9 + 7. Keep only the previous step: n is 10^7.',
      ],
      solution: 'Let d be the number of walks of the current length that end at D and o the number that end at A, B or C. One step maps (d, o) to (o, 3d + 2o), starting from (1, 0), with each value reduced modulo 10^9 + 7. After n steps print d; n = 2 gives 3 and n = 4 gives 21, matching the samples. The loop is O(n) with n = 10^7, which is fast; keep two variables rather than arrays of length 10^7, and do the multiplication in long long.',
    },
    {
      id: '474D',
      name: 'Flowers',
      rating: 1700,
      tier: 'core',
      hints: [
        'Look at the end of a tasty dinner of length i. If the last flower is red, what is left before it? If it is white, how many flowers at the end must be white together?',
        'A tasty dinner is a sequence of blocks, each one red flower or exactly k white flowers, so counting them is counting DP over the length: ways[i] = ways[i − 1] + ways[i − k]. Each query asks for a sum of ways over a range of lengths, which is exactly what prefix sums answer in O(1).',
        'Precompute ways[0] = 1 and ways[i] = ways[i − 1] + (i ≥ k ? ways[i − k] : 0) modulo 10^9 + 7 for i up to 10^5, then pre[i] = pre[i − 1] + ways[i]. Answer each test with (pre[b] − pre[a − 1] + MOD) % MOD; O(10^5 + t).',
      ],
      solution: 'Split a tasty dinner at its last block: either one red flower or k white ones, so ways[i] = ways[i − 1] + ways[i − k] with ways[0] = 1 (the empty dinner) and the second term only when i ≥ k. Build ways and its prefix sums once up to 10^5, then each test prints pre[b] − pre[a − 1]. After reducing modulo 10^9 + 7 the difference can be negative, so add MOD before the final %. With t up to 10^5 use fast I/O; total O(10^5 + t).',
    },
    {
      id: '1324E',
      name: 'Sleeping Schedule',
      rating: 1700,
      tier: 'challenge',
      hints: [
        'The absolute time keeps growing, but whether a sleep is good depends only on the hour of the day. What is the smallest description of "where Vova is" after i sleeps?',
        'Each sleep lasts exactly h hours, so Vova wakes at the same hour he fell asleep. The state is (number of sleeps so far, current hour mod h), and each sleep has two choices, a_i or a_i − 1 hours: a DP over positions whose extra state is the clock. There are only n · h ≤ 4·10^6 states, so try them all instead of guessing.',
        'dp[i][t] = most good sleeps among the first i when sleep i starts at hour t, −∞ if unreachable, with dp[0][0] = 0. For each reachable state and each d in {a_{i+1}, a_{i+1} − 1}, set t\' = (t + d) mod h and dp[i + 1][t\'] = max(dp[i + 1][t\'], dp[i][t] + [l ≤ t\' ≤ r]). Print the maximum of dp[n][·]; O(n · h).',
      ],
      solution: 'Because each sleep lasts exactly h hours, the next sleep starts at (t + a_i) or (t + a_i − 1) mod h, where t is the hour the previous sleep started. Let dp[i][t] be the most good sleeps among the first i when sleep i starts at hour t, with dp[0][0] = 0 and −∞ elsewhere; push every reachable state forward with both choices, adding 1 when l ≤ t\' ≤ r. Print the maximum over t of dp[n][t]. This is O(n · h) = 4·10^6 updates with two rolling rows; the −∞ initialisation keeps unreachable hours from leaking into the answer.',
    },
  ],
};
