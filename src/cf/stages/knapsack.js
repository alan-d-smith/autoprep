// Knapsack and subset sums: primer and problems.
export default {
  id: 'knapsack',
  title: 'Knapsack and subset sums',
  track: 'dp',
  summary:
    'Recognise a knapsack under any wording, decide what the capacity dimension really measures, and use the right loop direction for 0/1, unbounded and bounded items.',
  primer: {
    idea:
      'A knapsack DP indexes by a small additive resource, dp[c] = best value with c of it used, and adds items one at a time, each in O(C), for O(n·C) overall. The real work is choosing that dimension: it can be weight, elapsed time, the number of items covered, the peak storage in use during a step, a small value when the weight is huge, or a sum shifted by an offset. Loop direction then controls how often an item counts: capacity downwards for 0/1, upwards for unbounded.',
    spot: [
      'You pick a subset of items, each with a cost and a gain, under a total budget that is at most about 10⁵ or can be capped there.',
      '"Can we make exactly S" or "which totals are reachable": subset-sum feasibility, often as a bitset.',
      'One quantity is huge (up to 10⁹) and another is small (total ≤ 10⁵): index by the small one and store the best of the huge one.',
      'A condition such as "ratio equals k" or "the two sums are equal": rewrite it as a sum of per-item differences that must equal 0.',
    ],
    disguises: [
      'Each paid item gives time to take t other items for free, pay as little as possible → each paid item covers t + 1 items; a min-cost knapsack whose capacity is "items covered", capped at n.',
      'Items with a duration and a deadline, maximise the value finished in time → sort by deadline (exchange argument), then a 0/1 knapsack over elapsed time where an item fits only if its finish time is before its deadline.',
      'Total taste divided by total calories must equal k → weight a − k·b per item, possibly negative; a knapsack over that sum with an offset, target exactly 0.',
      'Costs up to 10⁸ but small total happiness, or "maximise min(twos, fives)" → swap the roles: index by the small quantity and store the least (or most) of the large one.',
    ],
    pitfalls: [
      'Wrong loop direction: sweeping capacity upwards in a 0/1 knapsack lets one item be taken many times. With a negative weight the safe direction flips; when unsure, copy the row.',
      '"At most c" versus "exactly c": all zeros means at most, −∞ except dp[0] = 0 means exactly. If you computed exactly, take the maximum over all c ≤ C (or make the table monotone) before reading the answer, otherwise a capacity that cannot be filled exactly looks impossible.',
      'A capacity far larger than the items can use: k up to 10⁶ when the weights can only add up to 12n. Cap the capacity at the total weight before allocating the table.',
    ],
    code: `// dp[c] = best value with total weight at most c (start all zeros; use -INF except dp[0] for "exactly c").
// 0/1: each item once. Sweep c DOWNWARDS so dp[c - w] still means "without this item".
long long knap01(int W, const vector<int>& w, const vector<long long>& v) {
    vector<long long> dp(W + 1, 0);
    for (size_t i = 0; i < w.size(); i++)
        for (int c = W; c >= w[i]; c--) dp[c] = max(dp[c], dp[c - w[i]] + v[i]);
    return dp[W];
}

// Unbounded: any number of copies. Sweep c UPWARDS so dp[c - w] may already include this item.
long long knapUnbounded(int W, const vector<int>& w, const vector<long long>& v) {
    vector<long long> dp(W + 1, 0);
    for (size_t i = 0; i < w.size(); i++)
        for (int c = w[i]; c <= W; c++) dp[c] = max(dp[c], dp[c - w[i]] + v[i]);
    return dp[W];
}

// Bounded: item i at most cnt[i] times. Split into packs of 1, 2, 4, ..., rest and run 0/1 on the packs.
long long knapBounded(int W, const vector<int>& w, const vector<long long>& v, const vector<int>& cnt) {
    vector<int> pw; vector<long long> pv;
    for (size_t i = 0; i < w.size(); i++)
        for (int k = 1, left = cnt[i]; left > 0; k *= 2) {
            int take = min(k, left); left -= take;
            pw.push_back(take * w[i]); pv.push_back(take * v[i]);
        }
    return knap01(W, pw, pv);
}

// Subset-sum feasibility: bit s is set if some subset sums to s. O(n * MAXS / 64).
const int MAXS = 100000;
bitset<MAXS + 1> subsetSums(const vector<int>& a) {
    bitset<MAXS + 1> can; can[0] = 1;
    for (int x : a) can |= can << x;
    return can;
}`,
    resources: [
      { label: 'CP-Algorithms: Knapsack problem', url: 'https://cp-algorithms.com/dynamic_programming/knapsack.html' },
      { label: 'USACO Guide: Knapsack DP', url: 'https://usaco.guide/gold/knapsack' },
      { label: 'CSES: Book Shop', url: 'https://cses.fi/problemset/task/1158' },
      { label: 'CSES: Money Sums', url: 'https://cses.fi/problemset/task/1745' },
    ],
  },
  problems: [
    {
      id: '1633D',
      name: 'Make Them Equal',
      rating: 1600,
      tier: 'warmup',
      hints: [
        'The elements do not interact: turning 1 into b_i takes some minimum number of operations, and you either spend all of them and collect c_i or leave the element alone. What does that make each element?',
        'Each element is a 0/1 knapsack item with weight ops(b_i) and value c_i, and k is the capacity. ops(v) is at most 12 for v ≤ 1000, so k up to 10⁶ is a red herring: cap it at Σ ops(b_i) ≤ 12n.',
        'Precompute ops[v] for v ≤ 1000 by relaxing ops[a + ⌊a/x⌋] from ops[a] + 1 for every a and x. Then run dp[cap] = max(dp[cap], dp[cap − w] + c) with cap going down from min(k, Σw). O(1000² + 12n²).',
      ],
      solution:
        'Compute ops[v], the fewest operations to reach v from 1, by processing a in increasing order and relaxing a + ⌊a/x⌋ for every x ≤ a (values only grow, so this order is safe). Each index i is then a 0/1 item of weight ops[b_i] and value c_i. Cap the capacity at min(k, Σ ops[b_i]), at most about 12n, and run the 1D knapsack with capacity sweeping downwards; the answer is dp at the capped capacity. Without the cap, 10⁶ capacity times 1000 items is too slow.',
    },
    {
      id: '106C',
      name: 'Buns',
      rating: 1700,
      tier: 'warmup',
      hints: [
        'Dough is used by every bun, stuffing i only by buns of type i. Which resource is the knapsack capacity, and what does a stuffing amount really limit?',
        'Dough is the capacity. Stuffing i only caps how many buns of type i you can bake, at most ⌊a_i / b_i⌋, so the stuffed buns are a bounded knapsack and plain buns are an unbounded item.',
        'dp[g] = most money using at most g grams of dough. For each stuffing, for g from n down to 0, try every count q from 1 to ⌊a_i/b_i⌋ with q·c_i ≤ g. Then add plain buns with one upward sweep. O(n·m·100).',
      ],
      solution:
        'Let dp[g] be the most money using at most g grams of dough. Each stuffing type is a bounded item: up to ⌊a_i/b_i⌋ copies of weight c_i and value d_i, handled with a downward sweep over g that tries every copy count, so the type is used once as a group. Plain buns are unbounded, so one upward sweep dp[g] = max(dp[g], dp[g − c0] + d0) adds them. Answer dp[n]. Swapping the two loop directions either reuses stuffing that does not exist or allows only one plain bun.',
    },
    {
      id: '1974E',
      name: 'Money Buys Happiness',
      rating: 1800,
      tier: 'core',
      hints: [
        'Costs and salaries go up to 10⁸, so a table indexed by money is far too large. Which number in the input is small enough to index a DP by?',
        'Total happiness is at most 10⁵, so swap the roles: dp[h] = least money spent to collect exactly h happiness. It is a 0/1 knapsack with value as the index and cost as the stored quantity, plus a budget check that depends on the month.',
        'Process months in order; before month i you have earned x·(i − 1). For h from H down to h_i, if dp[h − h_i] + c_i ≤ x·(i − 1), relax dp[h]. The answer is the largest h with a finite dp[h]. O(m·Σh).',
      ],
      solution:
        'Index by happiness: dp[h] is the least total spent on offers from the months so far that give exactly h happiness (infinity if impossible). Processing months in order, a purchase in month i only needs dp[h − h_i] + c_i ≤ x·(i − 1): earlier purchases were checked in their own months, and keeping the minimum spend only leaves more money for later. Sweep h downwards so each offer is used once, then print the largest reachable h. x·(i − 1) reaches about 5·10⁹, so use 64-bit integers.',
    },
    {
      id: '19B',
      name: 'Checkout Assistant',
      rating: 1900,
      tier: 'core',
      hints: [
        'Bob pays for some items and steals the rest. If he pays for an item with time t, how many items in total does that one payment take care of?',
        'A paid item with time t covers itself plus t stolen items, t + 1 in all, and Bob can always arrange the order. So you want a set of items whose (t_i + 1) add up to at least n at minimum total price: a min-cost 0/1 knapsack whose capacity is "items covered".',
        'dp[j] = least money to cover j items, with j capped at n. For each item, for j from n down to 0: dp[min(n, j + t + 1)] = min(dp[min(n, j + t + 1)], dp[j] + c). Answer dp[n], O(n²) with 64-bit costs.',
      ],
      solution:
        'If Bob pays for a set P, he has Σ t_i seconds over P to steal the other n − |P| items, so the condition is Σ (t_i + 1) ≥ n over the paid items. That is a covering knapsack: dp[j] is the least money for coverage j, capped at n because extra coverage is wasted. Process items with j going downwards and target min(n, j + t_i + 1), then print dp[n]. Prices reach 10⁹ and n = 2000, so the sums need long long.',
    },
    {
      id: '366C',
      name: 'Dima and Salad',
      rating: 1900,
      tier: 'core',
      hints: [
        'The condition Σa / Σb = k is awkward because it is a ratio. Can you turn it into a condition on a single sum?',
        'Σa = k·Σb means Σ(a_i − k·b_i) = 0. So each fruit has weight w_i = a_i − k·b_i (possibly negative) and value a_i, and you need a non-empty set with total weight exactly 0 and maximum value: a knapsack over a sum that can go negative, stored with an offset.',
        'Weights lie in [−999, 99], so sums lie in [−99900, 9900]. Use dp[sum + OFFSET], −∞ except dp[OFFSET] = 0; sweep downwards for w ≥ 0 and upwards for w < 0. Answer dp[OFFSET] if it is positive, else −1. About 10⁷ steps.',
      ],
      solution:
        'Rewrite the ratio as Σ(a_i − k·b_i) = 0 and run an exact-sum 0/1 knapsack over w_i = a_i − k·b_i that maximises Σa_i. Sums can be negative, so store them at index sum + OFFSET with OFFSET ≥ 100·999. For a non-negative weight sweep the index downwards; for a negative weight the source index s − w lies above s, so sweep upwards (or copy the row) to use each fruit once. Every taste is at least 1, so dp[OFFSET] > 0 exactly when a non-empty valid salad exists; otherwise print −1.',
    },
    {
      id: '687C',
      name: 'The Values You Can Make',
      rating: 1900,
      tier: 'core',
      hints: [
        'You pick a set of coins that sums to k, then a subset of that set. For a single coin, what are the possible fates, and which two totals do you need to track?',
        'Each coin is unused, used only in the payment, or used in the payment and also in the sub-sum x. That is a 0/1 knapsack with two capacities, the payment total s and the sub-sum x, both at most k.',
        "can[s][x] says some coins sum to s with a subset summing to x; start from can[0][0]. For each coin c, for s from k down to c: can[s] |= can[s − c] | (can[s − c] << c) with can[s] a bitset over x. O(n·k²/64); print every x with can[k][x].",
      ],
      solution:
        'Let can[s][x] be true when some subset of the processed coins sums to s and has a sub-subset summing to x. A new coin c can go nowhere, into the payment only (s += c), or into both (s += c, x += c); sweeping s downwards keeps it a 0/1 choice. With can[s] as a bitset over x the update is can[s] |= can[s − c] | (can[s − c] << c), about 500·500·500/64 word operations. Output the set bits of can[k]. Computing the reachable x over all coins independently of the payment is the usual wrong answer: x must come from the same coins that pay k.',
    },
    {
      id: '864E',
      name: 'Fire',
      rating: 2000,
      tier: 'core',
      hints: [
        'Suppose you already know which items to save. In what order should you save them so that each finishes before it burns, if that is possible at all?',
        'Save the chosen items in increasing order of d: swapping an adjacent pair that is out of order never makes things worse. Once the order is fixed by sorting, choosing the set is a 0/1 knapsack over total elapsed time, where an item can be added only if the new time is below its d.',
        'Sort by d. dp[i][T] = max value from the first i items finishing at exactly time T: dp[i][T] = max(dp[i−1][T], dp[i−1][T − t_i] + p_i if T < d_i), with T ≤ 2000. Keep the whole table, walk back from the best T, and list the items in sorted order.',
      ],
      solution:
        'By an exchange argument the saved items can be taken in non-decreasing order of d, so sort by d and treat the items as a knapsack in which each new item is appended at the end. dp[i][T] is the best value using some of the first i sorted items with total time exactly T, and taking item i requires T < d_i so it finishes before burning. Keep the 101×2001 table, choose the best T, and walk back: whenever dp[i][T] differs from dp[i−1][T], item i was taken and T drops by t_i. Print the chosen items in sorted order with their original indices; a single rolling row loses the information needed for this walk.',
    },
    {
      id: '1132E',
      name: 'Knapsack',
      rating: 2300,
      tier: 'challenge',
      hints: [
        'W and the counts go up to 10¹⁸, but there are only 8 distinct weights. Is there a number that every weight from 1 to 8 divides, so that groups of equal items become interchangeable?',
        'L = lcm(1..8) = 840. Any 840/i items of weight i weigh exactly 840, so all but fewer than 840/i items of each weight can be treated as identical 840-blocks. The real knapsack is only over the loose remainder, whose weight is below 8·840.',
        'dp[s] = most whole 840-blocks available when the loose items weigh exactly s. For weight i try r = 0..min(cnt_i, 840/i − 1) loose items: s grows by r·i and the blocks grow by ⌊(cnt_i − r) / (840/i)⌋. Answer max over s ≤ W of s + 840·min(dp[s], ⌊(W − s)/840⌋). About 4.5·10⁷ steps.',
      ],
      solution:
        'Write the number of weight-i items taken as r + q·(840/i) with 0 ≤ r < 840/i; each group of 840/i items weighs exactly 840, so only the remainders r need a real knapsack and everything else is a pool of identical 840-blocks. A bounded knapsack over the loose weight s ≤ 8·840 stores the largest number of blocks the leftover items can form. For each reachable s ≤ W, add as many blocks as fit, min(dp[s], ⌊(W − s)/840⌋), and take the best total. Keep r ≤ cnt_i and use 64-bit arithmetic throughout.',
    },
  ],
};
