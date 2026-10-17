// DP with Fenwick and segment trees: primer and problems.
export default {
  id: 'dp-structures',
  title: 'DP with Fenwick and segment trees',
  track: 'dp',
  summary: 'Turn O(n²) transitions of the form "best or total over earlier items with a smaller key" into O(n log n) with a Fenwick tree over compressed keys, count ordered pairs and chains, and write segment trees with custom merges and lazy range updates.',
  primer: {
    slides: [
      {
        title: 'Looking back at every earlier item',
        points: [
          'dp[i] = w[i] + the best dp[j] over j < i with key[j] < key[i], or a sum when counting.',
          'Checking every earlier j is O(n²), about 2·10^10 checks at n = 2·10^5.',
          'The LIS binary search fails: with weights, a longer chain is not always the better one to extend.',
        ],
        say: 'Several DPs from earlier stages look back at every earlier item: dp[i] = w[i] + the best dp[j] over j < i with key[j] < key[i], or a sum instead of a best when counting. That is the LIS DP with each item worth its weight w[i] instead of 1. Checking every earlier j is O(n²), about 2·10^10 checks at n = 2·10^5. The binary search from the LIS stage no longer applies, because with weights a longer chain is not always the better one to extend.',
      },
      {
        title: 'Two conditions, and neither needs a loop',
        points: [
          'j < i is time: process items in index order, and insert dp[i] only once it is computed.',
          'key[j] < key[i] is position: store each dp at its key\'s position, and the candidates form a prefix.',
        ],
        say: 'The transition has two conditions, and neither needs a loop. The condition j < i is a matter of time: process the items in index order and insert dp[i] only once it is computed, so whatever has been inserted came earlier. The condition key[j] < key[i] is a matter of position: store each dp at the position of its key, and the earlier items with a smaller key are exactly a prefix of the positions.',
      },
      {
        title: 'Compress keys, then use a Fenwick tree',
        points: [
          'Keys reach 10^9, so replace each by its rank r in s, the sorted distinct keys, counted from 1.',
          'A Fenwick tree (MaxBIT) answers query(i), the maximum over positions 1..i, and update(i, v), each in O(log n).',
          'Per item: dp[i] = w[i] + max(0, query(r − 1)), then update(r, dp[i]).',
        ],
        show: [0, 21],
        note: 'A Fenwick tree over 8 positions, built with 8 updates of at most 4 bars each (the diagram keeps sums, not maxima).',
        say: 'Keys can be as large as 10^9, so first compress them: s is the sorted list of distinct keys, and the rank r of a key is its position in s counted from 1, so equal keys share a rank. A Fenwick tree (binary indexed tree), MaxBIT in the template, answers query(i), the maximum over positions 1..i, and update(i, v), which raises position i to at least v, each in O(log n). Each item then costs one query and one update: dp[i] = w[i] + max(0, query(r − 1)), then update(r, dp[i]).',
      },
      {
        title: 'Each entry covers lowbit(i) positions',
        points: [
          't[i] holds the maximum over the lowbit(i) positions ending at i: t[4] covers 1..4, t[6] covers 5..6, t[7] only 7.',
          'query(7) reads t[7], t[6] and t[4], removing the lowest bit each time; an update climbs by adding it.',
          'Either walk touches at most log₂ n + 1 entries. The diagram keeps sums; the DP keeps maxima.',
        ],
        show: [0, 24],
        note: 'query(7) reads t[7], t[6] and t[4], whose bar covers 1 to 4, then stops: three bars.',
        say: 'The tree is an array t in which t[i] holds the maximum over the lowbit(i) positions that end at i, where lowbit(i) is the lowest set bit of i: t[4] covers positions 1..4, t[6] covers 5..6 and t[7] only 7. So query(7) reads t[7], t[6] and t[4], removing the lowest bit each time, and an update climbs by adding it, so either touches at most log₂ n + 1 entries.',
      },
      {
        title: 'The tree holds exactly the earlier items',
        points: [
          'When item i is reached, the tree holds the dp of exactly the earlier items, each at its key\'s rank.',
          'So query(r − 1) is the best earlier item with a strictly smaller key; query(r) would admit equal keys.',
          'A prefix maximum works because values only go up, and max(0, …) lets item i start a new chain.',
        ],
        say: 'When item i is reached, the tree holds the dp of exactly the earlier items, each at its key\'s rank, so query(r − 1) is the best of the earlier items with a strictly smaller key, while query(r) would also admit equal keys. A prefix maximum can be kept this way because the value at a position only ever goes up, and the max(0, …) lets item i start a new chain on its own.',
      },
      {
        title: 'Two O(log n) walks per item',
        points: [
          'So the DP is O(n log n). With + instead of max, the same sweep counts inversions, pairs or chains.',
          'A segment tree answers any range, not just a prefix, for any associative merge, such as a minimum.',
          'Lazy propagation keeps a range update as a pending tag, passed to the children only when needed: still O(log n).',
        ],
        say: 'Each item costs two O(log n) walks, so the DP is O(n log n); UKIEPC 2024 Eradication Sort was an LIS-like DP sped up this way. With + instead of max the same sweep counts: inversions, ordered pairs, or chains of length k with one tree per length. A segment tree answers any range, not just a prefix, for any associative merge (minimum, per-bit counts, a bracket summary). Lazy propagation adds updates to a whole range: a node lying inside the range keeps the update as a pending tag and hands it to its two children only when an operation must go below it, so each operation stays O(log n). UKIEPC 2023 History in Numbers needed such a lazy segment tree.',
      },
    ],
    terms: [
      'dp[i]: the best total weight of a chain that ends with item i, or in a counting DP the number of chains that end there (`cur` in the TRD version).',
      'key[i]: the value that orders a chain: item j may come before item i only when j < i and key[j] < key[i] (`a` in the TRD version).',
      'w[i]: the weight that item i adds to a chain.',
      's: the distinct keys in increasing order, from sort and unique (`xs` in the TRD version).',
      'r: the rank of a key, its position in s counted from 1, found with lower_bound; equal keys share a rank (`k`, counted from 0, in the TRD version).',
      'MaxBIT: the template\'s Fenwick tree for prefix maxima over the ranks (the TRD version uses the segment tree `Tree` for maxima and KACTL\'s `FT` for sums).',
      'query(i): the maximum stored at positions 1..i, or LLONG_MIN while there is none; in the diagram\'s sum version, the total of x[1..i]. The TRD version counts ranks from 0 and asks its segment tree for [0, k), so there query(r − 1) is `t.query(0, k)`.',
      'update(i, v): raises the value at position i to v if v is larger; in the diagram\'s sum version, adds v to position i.',
      'x[i]: in the diagram, the number added at position i. The diagram\'s t[i] holds a sum of x, where the DP\'s tree holds a maximum of dp.',
      't[i]: the Fenwick tree\'s array: the maximum (or, for counting, the sum) over the lowbit(i) positions that end at i.',
      'lowbit(i): the lowest set bit of i, i & −i in code: lowbit(6) = 2, lowbit(7) = 1 and lowbit(8) = 8.',
      'P[i]: a prefix sum, the total of the first i elements of the array, with P[0] = 0.',
    ],
    worked: {
      title: 'the heaviest rising chain',
      question: 'Six items arrive in order with keys 30, 10, 50, 30, 40, 20 and weights 5, 3, 2, 4, 1, 9. Choose some of them, keeping their order, so that each chosen key is strictly larger than the one chosen before it, and maximise the total weight. The real version has n up to 2·10^5, with keys and weights up to 10^9.',
      steps: [
        'Recognise it: this is the LIS DP with weights, dp[i] = w[i] + the best dp[j] over j < i with key[j] < key[i]. Checking every earlier j is about 2·10^10 checks at full size, and the LIS binary search does not apply because a longer chain need not be heavier, so keep the dp values in a Fenwick tree of prefix maxima over the keys.',
        'Model it: the distinct keys in order are s = 10, 20, 30, 40, 50, so the six items have ranks 3, 1, 5, 3, 4, 2, and both 30s share rank 3. For each item in turn, dp[i] = w[i] + max(0, query(r − 1)), then update(r, dp[i]). With five ranks, t[4] covers ranks 1..4, t[2] covers 1..2, and t[1], t[3] and t[5] cover only themselves.',
        'Items 1 to 3. Item 1 (rank 3): query(2) finds no earlier item, so dp[1] = 5 + 0 = 5, and update(3, 5) sets t[3] and t[4] to 5. Item 2 (rank 1): dp[2] = 3, and update(1, 3) sets t[1] and t[2] to 3 while t[4] keeps 5. Item 3 (rank 5): query(4) reads only t[4] = 5, so dp[3] = 2 + 5 = 7.',
        'Item 4 has key 30 again, rank 3: query(2) reads t[2] = 3, so dp[4] = 4 + 3 = 7, extending item 2. Querying rank 3 instead would reach item 1\'s 5 and give 9, from the chain 30, 30, which does not rise. Then update(3, 7) raises t[3] and t[4] to 7.',
        'Items 5 and 6. Item 5 (rank 4): query(3) reads t[3] = 7 and t[2] = 3, so dp[5] = 1 + 7 = 8, the chain 10, 30, 40. Item 6 (rank 2): query(1) reads t[1] = 3, so dp[6] = 9 + 3 = 12.',
        'Answer: 12, from items 2 and 6 (keys 10 and 20), although the longest chain, 10, 30, 40, has three items and weighs only 8. Sorting plus one query and one update per item is O(n log n), and totals reach 2·10^14, so use long long.',
      ],
    },
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
      solution: 'Build a segment tree over the 2^n numbers in which a node at height h (leaves at height 0) combines its children with OR when h is odd and XOR when h is even, which mirrors Xenia\'s iterations exactly, so the root holds v. A query changes one leaf, so recompute only the n nodes on its path to the root: O(2^n + m·n) in total. A common bug is choosing the operation by distance from the root instead of from the leaves: the root uses OR when n is odd and XOR when n is even.',
    },
    {
      id: '61E',
      name: 'Enemy is weak',
      rating: 1900,
      tier: 'warmup',
      hints: [
        'A triplet i < j < k with a_i > a_j > a_k has a middle man j. Once j is fixed, do the choices of i and of k depend on each other?',
        'They are independent, so the count for a fixed j is (stronger men to the left of j) × (weaker men to the right of j). Each factor is an inversion-style count that a Fenwick tree over the powers answers in O(log n).',
        'Compress the powers to ranks 1..n. Sweep left to right with j counted from 1: left[j] = (j − 1) − (earlier ranks below rank_j), the earlier men minus the weaker ones. Sweep right to left: right[j] = later ranks below rank_j. Add left[j] · right[j] in long long. O(n log n).',
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
        'Cake i may only go on an earlier cake with strictly smaller volume, and you maximise the total volume of the stack. Which subsequence problem is this, and what is different about it?',
        'It is a longest strictly increasing subsequence in which each cake is worth its volume instead of 1: dp_i = V_i + max dp_j over j < i with V_j < V_i. The O(n²) transition becomes a prefix-maximum query on a Fenwick tree indexed by the rank of the volume.',
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
        'Range add with range minimum is a lazy segment tree: a node lying fully inside the update adds v to its minimum and keeps v as a pending tag for its children. The circular part is only input handling.',
        'If lf ≤ rg use [lf, rg]; otherwise split into [lf, n−1] and [0, rg], apply an inc to both parts and take the min of both for rmq. Read each operation as a whole line and count its numbers (2 means rmq, 3 means inc). Use long long. O((n + m) log n).',
      ],
      solution: 'Use a segment tree of range minima with an additive lazy tag: an inc covering a node adds v to its minimum and to its tag, the tag is pushed to the children before any descent, and the minimum is recomputed after the recursion. A circular segment with lf > rg is the union of [lf, n−1] and [0, rg]. The operation type is the number of integers on the line, so read lines (getline, or fgets with sscanf) instead of a fixed number of tokens. Values reach 10^6 + 2·10^5·10^6, so use long long; O((n + m) log n) overall.',
    },
  ],
};
