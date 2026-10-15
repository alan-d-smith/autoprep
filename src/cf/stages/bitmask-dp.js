// Bitmask DP and meet in the middle: primer and problems.
export default {
  id: 'bitmask-dp',
  title: 'Bitmask DP and meet in the middle',
  track: 'dp',
  summary: 'Read n ≤ 20 (or n ≤ 40) as an invitation to enumerate subsets, and write dp[mask], dp[mask][last], submask loops, sum-over-subsets and meet-in-the-middle solutions.',
  primer: {
    idea: 'When n is around 15 to 20, a set of chosen items fits in an int, and a DP indexed by that set replaces n! orderings with 2^n · n states, because the future depends only on which items are used and which one came last: dp[mask][last] runs in O(2^n · n^2). Splitting every mask into two disjoint parts costs O(3^n) in total with the submask loop, and sum over subsets (SOS) aggregates over all submasks of every mask in O(B · 2^B). When n is around 35 to 40, 2^n is too slow but 2^(n/2) is fine: enumerate each half on its own and combine the two lists by sorting and binary search (meet in the middle); UKIEPC 2023 Enchanted Fortress combined bitmasks with exactly this.',
    spot: [
      'n ≤ 16, 18 or 20 with an ordering or a selection to optimise: 2^20 · 20 ≈ 2·10^7, so the constraint itself is the hint.',
      'n ≤ 35 or 40 with a subset to choose, where 2^n is hopeless but 2^(n/2) ≈ 2·10^5 to 10^6 is not.',
      'The cost of the next item depends only on the previous one (adjacent pairs, compatible neighbours, chains of transitions).',
      'Values below 2^20 to 2^22 and a question about AND/OR relations against the whole array (is there a y with x & y = 0, how many elements are submasks of x).',
    ],
    disguises: [
      'Reorder songs, dishes or rows so that every adjacent pair is compatible or scores a bonus → a Hamiltonian path, dp[mask][last] over the items placed so far',
      'Order matrix rows to maximise the minimum difference between neighbours in a column-by-column traversal → precompute one cost per pair of rows, then a Hamiltonian-path DP with a fixed first row that maximises a minimum instead of a sum',
      'For every x find an array element y with x & y = 0, which means y is a submask of the complement of x, so an SOS DP that stores one witness per mask answers all queries',
      'Pick a subset of up to 35 numbers to maximise the sum modulo m → split into halves, list the 2^17 or 2^18 subset sums of each, sort one list and binary search a partner for each sum in the other',
    ],
    pitfalls: [
      'Operator precedence: mask & 1 << i == 0 parses as mask & ((1 << i) == 0). Write (mask >> i & 1) or bracket everything.',
      'Memory: dp[1 << 20][20] of long long is 160 MB. Use int when values allow, or store a boolean dp[mask][last] as one bitmask of possible last items per mask.',
      'The loop for (s = mask; s > 0; s = (s - 1) & mask) skips the empty submask; handle s = 0 separately when it matters, and never write s >= 0 as the condition, since (0 - 1) & mask brings you back to mask and the loop never ends.',
    ],
    code: `// dp[mask][v] = cheapest path that visits exactly the vertices in mask and ends at v.
// O(2^n * n^2), fine for n <= 18 or so.
long long cheapestHamiltonPath(const vector<vector<long long>>& w) {
    int n = w.size();
    const long long INF = LLONG_MAX / 4;
    vector<vector<long long>> dp(1 << n, vector<long long>(n, INF));
    for (int v = 0; v < n; v++) dp[1 << v][v] = 0;
    for (int mask = 1; mask < (1 << n); mask++)   // submasks are numerically smaller: ready
        for (int v = 0; v < n; v++) {
            if (!(mask >> v & 1) || dp[mask][v] == INF) continue;
            for (int u = 0; u < n; u++)
                if (!(mask >> u & 1))
                    dp[mask | 1 << u][u] = min(dp[mask | 1 << u][u], dp[mask][v] + w[v][u]);
        }
    return *min_element(dp[(1 << n) - 1].begin(), dp[(1 << n) - 1].end());
}

// All non-empty submasks s of mask, largest first. Over all masks this is 3^n steps.
//   for (int s = mask; s > 0; s = (s - 1) & mask) { ... }

// Sum over subsets: afterwards f[mask] = sum of the original f[s] over all s inside mask.
// O(B * 2^B) instead of 3^B.
void sumOverSubsets(vector<long long>& f, int B) {
    for (int b = 0; b < B; b++)
        for (int mask = 0; mask < (1 << B); mask++)
            if (mask >> b & 1) f[mask] += f[mask ^ (1 << b)];
}`,
    resources: [
      { label: 'USACO Guide: Bitmask DP', url: 'https://usaco.guide/gold/dp-bitmasks' },
      { label: 'CP-Algorithms: Enumerating submasks of a bitmask', url: 'https://cp-algorithms.com/algebra/all-submasks.html' },
      { label: 'USACO Guide: Sum over Subsets DP', url: 'https://usaco.guide/plat/dp-sos' },
      { label: 'USACO Guide: Meet in the Middle', url: 'https://usaco.guide/gold/meet-in-the-middle' },
      { label: 'CSES: Hamiltonian Flights (dp[mask][last] practice)', url: 'https://cses.fi/problemset/task/1690' },
    ],
  },
  problems: [
    {
      id: '1829H',
      name: "Don't Blame Me",
      rating: 1700,
      tier: 'warmup',
      hints: [
        'Every a_i is at most 63, so the AND of any subsequence is one of only 64 numbers. What if you count subsequences grouped by their AND value instead of listing them?',
        'Recognition: a DP whose state is a 6-bit mask, the AND so far. Going left to right, a subsequence either skips a_i, starts at a_i, or extends an existing subsequence whose AND v becomes v & a_i.',
        'Approach: dp[v] = number of non-empty subsequences of the prefix with AND exactly v. For each a: copy dp to nd, add 1 to nd[a], and add dp[v] to nd[v & a] for every v. Finally sum dp[v] over v with popcount(v) = k, modulo 10^9+7. O(64 · n).',
      ],
      solution: 'Keep dp[v] for v in 0..63: the number of non-empty subsequences of the prefix whose AND is v. Adding a_i keeps every old subsequence (skip a_i), starts the new subsequence {a_i}, and moves a copy of each old count dp[v] to v & a_i (append a_i); write into a copy so a_i is not used twice. The answer is the sum of dp[v] over v with exactly k set bits. O(64 · n) per test; reset dp for each test case.',
    },
    {
      id: '580D',
      name: 'Kefa and Dishes',
      rating: 1800,
      tier: 'warmup',
      hints: [
        'n ≤ 18. If you know which dishes Kefa has already eaten, what one extra fact do you need to score the next dish correctly?',
        'Recognition: only the set of dishes eaten and the last dish matter, because a rule only fires for the dish eaten immediately before. That is the dp[mask][last] state of a Hamiltonian-path DP, stopped at m dishes.',
        'Approach: dp[mask][last] = best satisfaction having eaten exactly mask and ending with last. Go to dp[mask | 1<<nx][nx] adding a[nx] + bonus[last][nx]. The answer is the max over masks with popcount m. O(2^n · n^2), in long long.',
      ],
      solution: 'Let dp[mask][last] be the best satisfaction after eating exactly the dishes in mask, ending with dish last; start from dp[1<<i][i] = a_i. Appending an unused dish nx adds a_nx + c(last, nx), with c = 0 when there is no rule. Iterate masks in increasing order (an extension always has a larger mask) and take the max of dp over masks with exactly m bits. That is 2^18 · 18 · 18 ≈ 8.5·10^7 simple steps; totals reach about 3.5·10^10, so use 64-bit values.',
    },
    {
      id: '888E',
      name: 'Maximum Subsequence',
      rating: 1800,
      tier: 'core',
      hints: [
        'You want the subset whose sum modulo m is largest. 2^35 subsets is far too many, but 2^17 or 2^18 is small. What if you choose a subset of each half of the array separately?',
        'Recognition: meet in the middle. List all subset sums modulo m of each half; the answer combines one sum x from the left with one sum y from the right, and since both are below m, (x + y) mod m is either x + y or x + y - m.',
        'Approach: sort the right list. For each x, binary search the largest y < m - x and take x + y. The wrapped case x + y - m is always below x itself (the empty subset gives y = 0), so it never wins. O(2^(n/2) · n).',
      ],
      solution: 'Split a into halves of n/2 and n - n/2 elements and list all subset sums of each modulo m (at most 2^18 each). For a left sum x the best right partner is the largest y with x + y < m, found by binary search in the sorted right list; y = 0 always qualifies, and a wrapped total x + y - m is smaller than x, so it never beats that. The answer is the max of x + y over all x, and it is 0 for the empty choice. O(2^(n/2) · log) time.',
    },
    {
      id: '1950G',
      name: 'Shuffling Songs',
      rating: 1900,
      tier: 'core',
      hints: [
        'Forget the strings for a moment: for each pair of songs you only need to know whether they may stand next to each other. What object does that describe?',
        'Recognition: songs are vertices, an edge joins two songs with the same genre or the same writer, and an exciting playlist is a path visiting each kept song once. With n ≤ 16 you want the largest set of songs that has a Hamiltonian path, which is dp[mask][last].',
        'Approach: compare the strings once to build adj[i] as a bitmask. ok[mask] = bitmask of songs that can end a valid ordering of exactly mask; from each possible last, extend by any song in adj[last] outside mask. The answer is n minus the largest popcount with ok[mask] ≠ 0. O(2^n · n^2).',
      ],
      solution: 'Build the compatibility graph (same genre or same writer) by comparing strings once per pair, or after mapping each string to an integer id. A boolean dp[mask][last], stored as one bitmask of possible last songs per mask, marks which subsets can be arranged into an exciting order ending at last; extend from last to any unused neighbour. The answer is n - max popcount(mask) over reachable masks. The bound on the sum of 2^n keeps the total O(2^n · n^2) small, as long as no 10^4-character string comparison happens inside the DP loop.',
    },
    {
      id: '16E',
      name: 'Fish',
      rating: 1900,
      tier: 'core',
      hints: [
        'At any moment the lake is described by the set of fish still alive. How many such sets are there, and does what happens next depend on how the lake got there?',
        'Recognition: a probability DP over subsets. From a set of k alive fish, each of the k(k-1)/2 pairs meets with equal probability, and the next state is the same set minus the fish that was eaten. Sets only shrink, so process masks from the full set downward.',
        'Approach: p[full] = 1. For each mask with k ≥ 2 fish and each ordered pair (i, j) of fish in it, add p[mask] · a[i][j] / (k(k-1)/2) to p[mask without j]. The answer for fish i is p[1<<i]. O(2^n · n^2).',
      ],
      solution: 'p[mask] is the probability that at some moment exactly the fish in mask are alive. Starting from p[full] = 1, visit masks in decreasing order (every meeting removes one fish, so it leads to a smaller mask): for each ordered pair i ≠ j both in mask, fish i eats fish j with probability a[i][j] / (k(k-1)/2), which moves that share of p[mask] to mask without j. The answer for fish i is p[1<<i], and for n = 1 it is 1. About 2^18 · 18^2 ≈ 8.5·10^7 floating-point steps, fine in 3 s; print at least 6 decimals.',
    },
    {
      id: '1209E1',
      name: 'Rotate Columns (easy version)',
      rating: 2000,
      tier: 'core',
      hints: [
        'Process the columns one at a time. When you fix a rotation for a column, decide which rows will take their maximum from this column. What is the only thing about earlier columns that later columns need to know?',
        'Recognition: a DP over the set of rows already served. A column serves some subset s of the rows not yet served, and the most it can give them is its best rotation for exactly those rows; combining columns means splitting the full row mask into disjoint submasks, so this is a submask-enumeration DP.',
        'Approach: for each column precompute best[s] = max over the n rotations of the sum of the rows in s. Then nd[mask] = max(dp[mask], max over non-empty submasks s of mask of dp[mask ^ s] + best[s]). The answer is dp[full]. O(m · (3^n + n^2 · 2^n)).',
      ],
      solution: 'Assign each row to the column its maximum comes from; a column serving the row set s contributes best[s], the largest sum over its n rotations of the entries in rows s. Run dp over columns with state "rows already served": nd[mask] = max(dp[mask], dp[mask ^ s] + best[s]) over non-empty submasks s, using s = (s - 1) & mask. An assignment can only underestimate the true row maxima, and the optimal answer is itself one assignment, so the DP is exact. With n ≤ 4 this is tiny; the hard version (n ≤ 12, m ≤ 2000) runs the same DP after keeping only the n columns with the largest maxima.',
    },
    {
      id: '1102F',
      name: 'Elongated Matrix',
      rating: 2000,
      tier: 'challenge',
      hints: [
        'The traversal compares two kinds of neighbours: consecutive rows within a column, and the bottom row of one column with the top row of the next. For a pair of rows (i, j), can you summarise every comparison they cause with one number?',
        'Recognition: precompute down[i][j] = min over columns c of |a[i][c] - a[j][c]| and wrap[i][j] = min over c of |a[i][c] - a[j][c+1]|. A row order is then a Hamiltonian path scored by its smallest down edge, plus one wrap edge from the last row back to the first: a dp[mask][last] with the first row fixed.',
        'Approach: for each first row s, dp[mask][last] = the largest possible minimum down edge over orders of mask that start at s and end at last; transition with min(dp[mask][last], down[last][nx]). The answer is the max over s and last of min(dp[full][last], wrap[last][s]). O(n^2 · m + n^3 · 2^n).',
      ],
      solution: 'Precompute down[i][j] (row j directly below row i, min over all columns) and wrap[i][j] (i is the bottom row and j the top row, min over c of |a[i][c] - a[j][c+1]|) in O(n^2 · m). Fix the first row s and run dp[mask][last] = max over orders of the min down edge, extending with min(dp, down[last][nx]); the answer is the max over s and last of min(dp[full][last], wrap[last][s]). That is about 16 · 2^15 · 16^2 ≈ 1.3·10^8 simple steps, fine in 4 s; a binary search on k with a boolean DP also works. When m = 1 there are no wrap edges, so wrap must start at infinity, and when n = 1 the answer is just wrap[0][0].',
    },
    {
      id: '165E',
      name: 'Compatible Numbers',
      rating: 2200,
      tier: 'challenge',
      hints: [
        'x & y = 0 means every set bit of y is a zero bit of x. Describe the set of all valid y for a given x as one mask.',
        'Recognition: y must be a submask of the complement of x within 22 bits (4·10^6 < 2^22). So you need, for every mask, any array element that is a submask of it: a sum-over-subsets DP that keeps one witness instead of a sum.',
        'Approach: f[mask] = -1 everywhere, f[a_i] = a_i; then for each bit b and each mask containing b, if f[mask] = -1 copy f[mask ^ (1<<b)]. The answer for x is f[(2^22 - 1) ^ x]. O(22 · 2^22).',
      ],
      solution: 'y is compatible with x exactly when y is a submask of the 22-bit complement of x. Put each array value into f[a_i], then run SOS DP over the 22 bits so that f[mask] holds some array element that is a submask of mask, or -1. Each answer is f[full ^ x]; x can never be its own partner because x & x = x ≠ 0. About 9·10^7 steps and a 16 MB table; use fast input and output for 10^6 numbers.',
    },
  ],
};
