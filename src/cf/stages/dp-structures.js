// DP with Fenwick and segment trees: primer and problems.
export default {
  id: 'dp-structures',
  title: 'DP with Fenwick and segment trees',
  track: 'dp',
  summary: 'Turn O(n²) transitions of the form "best or total over earlier items with a smaller key" into O(n log n) with a Fenwick tree over compressed keys, count ordered pairs and chains, and write segment trees with custom merges and lazy range updates.',
  primer: {
    idea: 'Many quadratic DPs have the transition dp[i] = w[i] + best dp[j] over j < i with key[j] < key[i] (or a sum instead of a best). Process the items in index order and keep a Fenwick tree indexed by the compressed key: only earlier items have been inserted, so j < i holds automatically, key[j] < key[i] becomes a prefix query, and the whole DP runs in O(n log n). A segment tree does the same for any associative merge (minimum, per-bit counts, a bracket summary), and lazy propagation adds range updates in O(log n) each. UKIEPC 2024 Eradication Sort was an LIS-like DP sped up with a Fenwick tree, and UKIEPC 2023 History in Numbers needed a lazy segment tree.',
    spot: [
      'An O(n²) DP whose transition takes the max or sum of dp[j] over earlier j with a smaller (or larger) value, and n is 10^5 to 10^6.',
      'Count pairs, triples or length-k chains of indices whose values are ordered: inversions, decreasing triples, increasing subsequences of length k.',
      'Point or range updates interleaved with range questions (sum, minimum, or a summary that two halves can combine).',
      'An update that changes a whole range at once (add v, xor x, assign) followed by range queries: lazy propagation.',
    ],
    disguises: [
      'Stack cakes, boxes or envelopes so that each is strictly larger than the one below and maximise the total → a weighted LIS, dp[i] = vol_i + max dp[j] over earlier strictly smaller volumes, one prefix-max Fenwick query per item (629D)',
      'Count triples i < j < k with a_i > a_j > a_k → fix the middle: (larger values to the left) × (smaller values to the right), two Fenwick sweeps (61E)',
      'Cut an array into segments scored by the sign of their sum → a DP over prefix sums where the sign of P[i] − P[j] chooses the formula, so each case is a max over smaller, equal or larger compressed keys (1667B)',
      'Longest correct bracket subsequence inside many ranges → a segment tree whose nodes store (matched pairs, unmatched "(", unmatched ")") and merge in O(1) (380C)',
    ],
    pitfalls: [
      'Strict versus non-strict: when equal keys share a compressed rank, query rank − 1 for "strictly smaller" and rank for "smaller or equal". Inserting dp[i] before computing it lets i be its own predecessor.',
      'Lazy propagation: push the pending tag to both children before recursing into them and recompute the node from its children afterwards. If a node\'s stored value already includes its own tag, applying the tag again on the way down double-counts it.',
      'Overflow: counts of triples reach n³/6 and sums of 10^5 values of 10^12 need long long. If intermediate counts can pass 2^63 while the final answer is guaranteed small, unsigned long long wraps mod 2^64 and still produces the exact answer.',
    ],
    code: `// Fenwick tree for prefix maximum (1-based). For counting DPs, swap max for + and LLONG_MIN for 0.
struct MaxBIT {
    int n; vector<long long> t;
    MaxBIT(int n) : n(n), t(n + 1, LLONG_MIN) {}
    void update(int i, long long v) { for (; i <= n; i += i & -i) t[i] = max(t[i], v); }
    long long query(int i) { long long r = LLONG_MIN; for (; i > 0; i -= i & -i) r = max(r, t[i]); return r; }
};
// dp[i] = w[i] + max(0, max dp[j] over j < i with key[j] < key[i]): a weighted strictly increasing chain.
long long bestChain(const vector<long long> &key, const vector<long long> &w) {
    vector<long long> s = key;                       // coordinate-compress the keys
    sort(s.begin(), s.end());
    s.erase(unique(s.begin(), s.end()), s.end());
    MaxBIT bit(s.size());
    long long best = LLONG_MIN;
    for (size_t i = 0; i < key.size(); i++) {
        int r = lower_bound(s.begin(), s.end(), key[i]) - s.begin() + 1; // equal keys share a rank
        long long dp = w[i] + max(0LL, bit.query(r - 1));               // r - 1: strictly smaller keys
        bit.update(r, dp);
        best = max(best, dp);
    }
    return best;
}`,
    resources: [
      { label: 'CP-Algorithms: Fenwick tree', url: 'https://cp-algorithms.com/data_structures/fenwick.html' },
      { label: 'CP-Algorithms: Segment tree (including lazy propagation)', url: 'https://cp-algorithms.com/data_structures/segment_tree.html' },
      { label: 'USACO Guide: Point Update Range Sum', url: 'https://usaco.guide/gold/PURS' },
      { label: 'USACO Guide: Range Update Range Query', url: 'https://usaco.guide/plat/RURQ' },
    ],
  },
  problems: [
    {
      id: '339D',
      name: 'Xenia and Bit Operations',
      rating: 1700,
      tier: 'warmup',
      hints: [
        'Draw the iterations as a tree: the 2^n numbers are the leaves and every later number sits above the two it was computed from. Which numbers change when one a_p is overwritten?',
        'This is a segment tree whose merge depends on the level: the level right above the leaves uses OR, the next XOR, and so on. Changing a_p only changes its n ancestors.',
        'Store the tree in an array of size 2^(n+1) with leaf i at 2^n + i. To update, set the leaf and walk i /= 2 up to the root, recomputing t[i] from t[2i] and t[2i+1] with OR when the height above the leaves is odd and XOR when it is even. Print t[1]. O(n) per query.',
      ],
      solution: 'Build a segment tree over the 2^n numbers in which a node at height h (leaves at height 0) combines its children with OR when h is odd and XOR when h is even, which mirrors Xenia\'s iterations exactly, so the root holds v. A query changes one leaf, so recompute only the n nodes on its path to the root: O(2^n + m·n) in total. A common WA is choosing the operation by distance from the root instead of from the leaves: the root uses OR when n is odd and XOR when n is even.',
    },
    {
      id: '61E',
      name: 'Enemy is weak',
      rating: 1900,
      tier: 'warmup',
      hints: [
        'A triplet i < j < k with a_i > a_j > a_k has a middle man j. Once j is fixed, do the choices of i and of k depend on each other?',
        'They are independent, so the count for a fixed j is (stronger men to the left of j) × (weaker men to the right of j). Each factor is an inversion-style count that a Fenwick tree over the powers answers in O(log n).',
        'Compress the powers to ranks 1..n. Sweep left to right: left[j] = j − (earlier ranks below rank_j). Sweep right to left: right[j] = later ranks below rank_j. Add left[j] · right[j] in long long. O(n log n).',
      ],
      solution: 'For each j multiply the number of i < j with a_i > a_j by the number of k > j with a_k < a_j and sum the products. Compress the powers (up to 10^9) to ranks and get both counts with a Fenwick tree in two sweeps, O(n log n) for n = 10^6. The answer reaches about 1.7·10^17, so the product and the sum must be long long, and the million numbers should be read with scanf or fast cin.',
    },
    {
      id: '597C',
      name: 'Subsequences',
      rating: 1900,
      tier: 'core',
      hints: [
        'How many increasing subsequences of length len end exactly at position i? Express it through shorter subsequences that end at earlier positions.',
        'cnt[len][i] = Σ cnt[len−1][j] over j < i with a_j < a_i. Among the earlier positions this is a prefix sum over values, so keep one Fenwick tree per length, indexed by value (the values are already distinct and between 1 and n).',
        'Go left to right. For a_i set cnt[1] = 1 and cnt[len] = prefix sum of tree len−1 up to a_i − 1 for len = 2..k+1, then add each cnt[len] at index a_i of tree len. The answer is the sum of all cnt[k+1]. O(n·k·log n).',
      ],
      solution: 'Let cnt[len][i] be the number of increasing subsequences of length len ending at position i; it is the sum of cnt[len−1][j] over earlier j with a smaller value. Keep k + 1 Fenwick trees indexed by value: at position i query tree len−1 on the prefix a_i − 1, insert the result into tree len, and add cnt[k+1][i] to the answer, O(n·k·log n) in total. Counts for shorter lengths can exceed 2^63 even though the final answer fits, so use unsigned long long: every operation is an addition, so wrapping mod 2^64 still gives the exact final answer. k = 0 is allowed, and then the answer is n.',
    },
    {
      id: '629D',
      name: 'Babaei and Birthday Cake',
      rating: 2000,
      tier: 'core',
      hints: [
        'Cake i may only go on an earlier cake with strictly smaller volume, and you maximise the total volume of the stack. Which classic subsequence problem is this, and what is different about it?',
        'It is a longest strictly increasing subsequence in which each cake is worth its volume instead of 1: dp[i] = V_i + max dp[j] over j < i with V_j < V_i. The O(n²) transition becomes a prefix-maximum query on a Fenwick tree indexed by the rank of the volume.',
        'Work with r²·h as an exact integer (up to 10^12) and multiply by π only when printing. Compress the volumes; for each cake in input order query the prefix max over ranks below rank(V_i), set dp_i = V_i + that max, and update position rank(V_i) with dp_i. O(n log n).',
      ],
      solution: 'This is a weighted strictly increasing subsequence over the volumes in input order. Compress the integer volumes r²·h, keep a Fenwick tree of prefix maxima over the ranks, compute dp_i = r_i²·h_i + query(rank_i − 1) and then update rank_i with dp_i; print the largest dp times π with at least 6 decimals. Equal volumes share a rank, so querying rank − 1 enforces the strict inequality. Comparing floating-point volumes π·r²·h instead of the integers can make two equal volumes compare as different and break that strictness.',
    },
    {
      id: '380C',
      name: 'Sereja and Brackets',
      rating: 2000,
      tier: 'core',
      hints: [
        'For one fixed string the longest correct bracket subsequence is greedy: scan with a counter of unmatched "(" and match each ")" when the counter is positive. What does a piece of the string leave unmatched after this greedy?',
        'Every piece reduces to some matched pairs plus ")))…(((": unmatched closes followed by unmatched opens. Two such summaries combine in O(1), which is exactly what a segment tree node needs.',
        'Node = (pairs, open, close). Merging L then R: t = min(L.open, R.close); pairs = L.pairs + R.pairs + t, open = L.open + R.open − t, close = L.close + R.close − t. The answer is 2·pairs of the merged range; keep the left-to-right order when combining the pieces of a query. O(n + m log n).',
      ],
      solution: 'Greedy matching shows that the best subsequence of a segment is twice the number of pairs a stack would match, and the unmatched rest looks like ")…)(…(". Store (pairs, unmatched open, unmatched close) in a segment tree; merging L then R creates t = min(L.open, R.close) new pairs. Each query merges O(log n) nodes, so the total is O(n + m log n) for n up to 10^6. The merge is not commutative: in an iterative bottom-up query keep a left accumulator and a right accumulator and join them in order at the end.',
    },
    {
      id: '242E',
      name: 'XOR on Segment',
      rating: 2000,
      tier: 'core',
      hints: [
        'The query asks for a sum but the update is an xor. If you only know the sum of a range, can you tell how it changes after xor with x? What extra information per range would be enough?',
        'Split by bits: a sum equals Σ 2^b · (number of elements with bit b set). Xor with x flips bit b of every element in the range when bit b of x is 1, so that count becomes length − count. With 20 per-bit counts in each node, a range xor is a lazy tag on a segment tree.',
        'Each node stores ones[b] for b < 20 and a pending xor mask. Applying a mask sets ones[b] = len − ones[b] for each set bit, and tags combine by xor. Push before descending, recompute from the children afterwards, and answer a sum as Σ ones[b]·2^b over the covered nodes. O((n + m)·20·log n).',
      ],
      solution: 'Keep a segment tree in which each node stores, for each of the 20 bits, how many elements of its range have that bit set, plus a lazy xor mask. Applying x to a node replaces ones[b] by len − ones[b] for every bit set in x and xors x into the tag; pushing hands the tag to both children. A sum query adds ones[b]·2^b over the O(log n) covering nodes. This runs in O((n + m)·20·log n), and sums reach about 10^11, so the answer needs long long.',
    },
    {
      id: '1667B',
      name: 'Optimal Partition',
      rating: 2100,
      tier: 'challenge',
      hints: [
        'Let dp[i] be the best total for the first i elements and look at the last segment (j, i]. Its value depends on the sign of its sum. How do prefix sums express that sign?',
        'With prefix sums P, the last segment is positive when P[j] < P[i], zero when they are equal and negative when P[j] > P[i]. So dp[i] = max of (max dp[j] − j over P[j] < P[i]) + i, (max dp[j] over P[j] = P[i]) and (max dp[j] + j over P[j] > P[i]) − i: three "best earlier value with a smaller, equal or larger key" queries.',
        'Compress P[0..n]. Keep a prefix-max Fenwick tree of dp[j] − j, a Fenwick tree over reversed ranks of dp[j] + j, and an array of the best dp[j] per rank. Insert j = 0 with dp = 0, then for i = 1..n query all three, take the best and insert i. O(n log n) per test.',
      ],
      solution: 'dp[i] = max over j < i of dp[j] + sign(P[i] − P[j])·(i − j). Splitting by the sign, the positive case needs max(dp[j] − j) over smaller prefix sums, the negative case max(dp[j] + j) over larger ones and the zero case max dp[j] over equal ones; two max Fenwick trees over compressed prefix sums and one array give O(n log n). Include j = 0 with P[0] = 0, keep prefix sums in long long (up to 5·10^14), and size the structures by each test\'s n, since t can be 5·10^5 and only the sum of n is bounded.',
    },
    {
      id: '52C',
      name: 'Circular RMQ',
      rating: 2200,
      tier: 'challenge',
      hints: [
        'Both operations act on a whole segment. What would inc cost on a segment tree with only point updates, and how could a node avoid touching every element below it?',
        'Range add with range minimum is the textbook lazy segment tree: a node lying fully inside the update adds v to its minimum and keeps v as a pending tag for its children. The circular part is only input handling.',
        'If lf ≤ rg use [lf, rg]; otherwise split into [lf, n−1] and [0, rg], apply an inc to both parts and take the min of both for rmq. Read each operation as a whole line and count its numbers (2 means rmq, 3 means inc). Use long long. O((n + m) log n).',
      ],
      solution: 'Use a segment tree of range minima with an additive lazy tag: an inc covering a node adds v to its minimum and to its tag, the tag is pushed to the children before any descent, and the minimum is recomputed after the recursion. A circular segment with lf > rg is the union of [lf, n−1] and [0, rg]. The operation type is the number of integers on the line, so read lines (getline, or fgets with sscanf) instead of a fixed number of tokens. Values reach 10^6 + 2·10^5·10^6, so use long long; O((n + m) log n) overall.',
    },
  ],
};
