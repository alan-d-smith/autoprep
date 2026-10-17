// Knapsack and subset sums: primer and problems.
export default {
  id: 'knapsack',
  title: 'Knapsack and subset sums',
  track: 'dp',
  summary:
    'Recognise a knapsack under any wording, decide what the capacity dimension measures, and use the right loop direction for 0/1, unbounded and bounded items.',
  primer: {
    slides: [
      {
        title: 'Most value within a weight limit',
        points: [
          'Item i has weight w[i] and value v[i]: choose a set of weight at most W with the most value.',
          'Each item is used at most once (0/1), and trying every subset is 2^n, about 10^30 for n = 100.',
          'Greedy by value per weight fails: with W = 4 it takes (3, 5) and scores 5, but the two (2, 3) items score 6.',
        ],
        say: 'The model question: n items, item i with weight w[i] and value v[i], and a capacity W. Choose a set of total weight at most W with the largest total value, each item used at most once (the 0/1 knapsack). Trying every subset costs 2^n, about 10^30 when n is 100. Greedy by value per unit of weight fails: with a capacity of 4 and items of (weight, value) (3, 5), (2, 3) and (2, 3), it takes the first, has no room left and scores 5, while the two small items score 6.',
      },
      {
        title: 'Only the weight used matters',
        points: [
          'What a partial choice leaves for the other items depends only on how much weight it used.',
          'Of two choices with the same weight, keep the one with more value.',
          'With integer weights there are W + 1 amounts, so the work grows with W, not 2^n.',
        ],
        say: 'What a partial choice leaves for the remaining items depends only on how much weight it has used. Two choices that used the same weight face exactly the same future, so only the one with more value is worth keeping. With integer weights there are only W + 1 possible amounts, so the work grows with W, not with 2^n.',
      },
      {
        title: 'One pass over c per item',
        points: [
          'dp[c] is the best value of a set so far with weight at most c; before any item it is 0.',
          'Item i sets dp[c] = max(dp[c], dp[c − w[i]] + v[i]) for every c ≥ w[i]: skip it or take it.',
          'After the last item, dp[W] is the answer.',
        ],
        show: [0, 7],
        note: 'Each row is one item\'s pass over c. Item B at capacity 5: taking it (3 + 4 = 7) beats skipping it (3).',
        say: 'Let dp[c] be the best value of a set of the items considered so far with total weight at most c; before any item, every dp[c] is 0. Item i is added in one pass over c: dp[c] = max(dp[c], dp[c − w[i]] + v[i]) for every c ≥ w[i], which either skips the item or puts it on top of the best set that leaves w[i] free. After the last item, dp[W] is the answer.',
      },
      {
        title: 'Sweep c downwards for 0/1',
        points: [
          'The update is right only if dp[c − w[i]] still means "without item i".',
          'Downwards, that smaller index is untouched in this pass, so dp[c] is the best over the first i items.',
          'Upwards, the item can be taken again and again: wrong for 0/1, right for the unbounded knapsack.',
        ],
        show: [0, 14],
        note: 'Row C runs from capacity 5 down, as in the code: taking C at 4 reads capacity 0, which this pass hasn\'t reached, so it is still without C.',
        say: 'The update is right only if dp[c − w[i]] still means "without item i". Sweeping c downwards guarantees that, because the smaller index has not been touched yet in this pass. So after item i, each dp[c] is the best over subsets of the first i items, and that is the whole proof. Sweeping upwards, dp[c − w[i]] may already include item i, so the item can be taken again and again: wrong for 0/1, and exactly right when every item has unlimited copies (the unbounded knapsack).',
      },
      {
        title: 'Exact weights, copies and bitsets',
        points: [
          'The DP is O(n·W) time and O(W) memory; starting from −∞ except dp[0] = 0 means "weight exactly c".',
          'An item with cnt[i] copies splits into packs of 1, 2, 4, … plus a remainder, each run as a 0/1 item.',
          'For feasibility alone, the bitset `can` takes each item with `can |= can << w[i]` in O(MAXS/64).',
        ],
        say: 'Each item costs O(W), so the DP is O(n·W) time and O(W) memory. Starting from 0 everywhere means "weight at most c"; starting from dp[0] = 0 and −∞ everywhere else means "weight exactly c". An item with cnt[i] copies is split into packs of 1, 2, 4 and so on copies plus a remainder, each run as a 0/1 item. When only feasibility matters, a bitset `can`, whose bit s says some subset sums to s, takes each item with `can |= can << w[i]` in O(MAXS/64).',
      },
      {
        title: 'Choose what the index measures',
        points: [
          'The index must be additive over the chosen items and small enough to loop over.',
          'Weight, time, items covered or peak storage all work; with huge weights, index by value and store the least weight.',
          'When per-item amounts can be negative, shift the sum by an offset.',
        ],
        say: 'The real work is choosing what the index measures. It must be additive over the chosen items and small enough to loop over: weight, elapsed time, the number of items covered, the peak storage in use during a step, a small total value when the weights are huge (then store the least weight for each value), or a sum shifted by an offset when per-item amounts can be negative.',
      },
    ],
    terms: [
      'w[i]: the weight of item i (in the TRD version each item is a pair, and its weight is `wt`).',
      'v[i]: the value of item i (`val` in the TRD version).',
      'W: the capacity, the largest total weight allowed (`C` in the TRD version).',
      'dp[c]: the best total value of a set of the items processed so far with total weight at most c, or exactly c with the −∞ start. The diagram keeps one row per item, dp[i][c] for the first i items; the code keeps only the latest row.',
      'cnt[i]: how many copies of item i exist, in the bounded version.',
      '`can`: the subset-sum bitset; bit s is set when some subset sums to exactly s (built by `reachable` in the TRD version).',
      '`MAXS`: the largest sum the bitset tracks (`S` in the TRD version).',
    ],
    worked: {
      problem: { source: 'kattis', id: 'amusicalquestion', name: 'A Musical Question', difficulty: '4.8' },
      slides: [
        {
          title: 'Two CDs, as much music as possible',
          points: [
            'Each of two CDs holds W ≤ 1000 minutes, and n ≤ 1000 songs last up to 1000 minutes each.',
            'Put whole songs on the CDs, each at most once, to get the most minutes in total.',
            'Among the best totals, the CDs should differ least; print the fuller CD first.',
          ],
          say: 'The problem is A Musical Question. Bob has two CDs that each hold W minutes (c in the statement), with W up to 1000, and n songs, up to 1000 of them, each at most 1000 minutes long. Each song goes whole onto one CD or is left out, and he wants as many minutes as possible on the two CDs together. Among the best totals, the two CDs should differ as little as possible, and the output gives the fuller CD first. In the second sample W = 100 and the songs last 10, 20, 30, 40 and 50 minutes: all 150 minutes fit, split 80 and 70.',
        },
        {
          title: 'Filling one CD first can lose',
          points: [
            'Each song goes on CD 1, on CD 2 or nowhere: 3^n choices, about 10^477 for n = 1000.',
            'With W = 8 and songs 2, 2, 4, 5, 5, filling CD 1 to 8 takes 2 + 2 + 4 and leaves room for one 5: 13.',
            '5 + 2 on each CD makes 14, so the two CDs must be filled together.',
          ],
          say: 'Each song goes on the first CD, on the second or nowhere, so there are 3^n choices, about 10^477 when n is 1000. Filling one CD as full as possible and then the other is not safe either. With W = 8 and songs of 2, 2, 4, 5 and 5 minutes, the only way to fill the first CD to 8 is 2 + 2 + 4, and then the second CD takes one 5: 13 minutes. Putting 5 + 2 on each CD makes 14. Even when the total comes out right, the split can be wrong: on sample 2 this gives 100 and 50 instead of 80 and 70.',
        },
        {
          title: 'Index by the minutes on both CDs',
          points: [
            'What the remaining songs can still do depends only on the minutes c1 and c2 already on each CD.',
            'Bit c2 of the bitset can[c1] is set when some songs fill the CDs with exactly c1 and c2 minutes.',
            'That is (W + 1)², about 10^6 states; at the start only can[0][0] is set.',
          ],
          show: [0, 2],
          note: 'Midway through sample 2, after songs 10 and 20: blue pairs are new with 20. Only multiples of 10 are drawn, since no other pair can be reached.',
          say: 'This is a 0/1 knapsack whose weight is a pair. What the remaining songs can still achieve depends only on the minutes already on each CD, c1 on the first and c2 on the second, so that pair is the state. Only reachability matters, so keep it in bitsets: bit c2 of can[c1] is set when some songs fill the CDs with exactly c1 and c2 minutes. That is (W + 1)² states, about 10^6, and before any song only can[0][0] is set.',
        },
        {
          title: 'One downward pass per song',
          points: [
            'Song i on CD 2 shifts the row, `can[c1] << w[i]`; on CD 1 it reads the row `can[c1 − w[i]]`.',
            'Sweep c1 from W down, so can[c1 − w[i]] is still without song i, and each song is used once.',
            'In all O(n·W²/64), about 1.6·10^7 word operations; a plain bool table would take 10^9.',
          ],
          show: [0, 3],
          note: 'Midway through song 30\'s pass: row 30 is rebuilt from the amber cells of row 0 (song on CD 1) and of row 30 itself, shifted 30 right (song on CD 2).',
          say: 'Song i, of length w[i], is added in one pass over the rows. Putting it on the second CD shifts a row by w[i]: can[c1] << w[i]. Putting it on the first CD takes the row w[i] lower: can[c1 − w[i]]. So can[c1] |= (can[c1] << w[i]) | can[c1 − w[i]]. Sweeping c1 from W downwards means the lower row has not been touched in this pass yet, and the shift is taken from the row\'s old value, so each song is used at most once. With 64 bits to a word, this is O(n·W²/64), about 1.6·10^7 operations, where a plain bool table would take 10^9.',
        },
        {
          title: 'Sample 2, song by song',
          points: [
            'Song 50 adds pairs such as (100, 50): 10 + 40 + 50 on CD 1 and 20 + 30 on CD 2.',
            'Shifts also set bits above W, such as bit 110 of can[0]; they are never read, so need no clearing.',
          ],
          show: [0, 6],
          note: 'After all five songs: green pairs were reachable before song 50, blue ones are new with it.',
          say: 'Each song only adds pairs. After song 30, for example, (30, 30) is reachable, with 10 + 20 on one CD and 30 on the other. Song 50 adds pairs such as (100, 50): 10 + 40 + 50 on the first CD and 20 + 30 on the second. The shifts also set bits above W, such as bit 110 of can[0], from 10 + 20 + 30 + 50 on the second CD. Those bits are never read, so they need no clearing.',
        },
        {
          title: 'Read off the best pair',
          points: [
            'The largest c1 + c2 is 150, on the diagonal from (100, 50) to (50, 100).',
            'Of those, (80, 70) and (70, 80) differ least, so the output is 80 70.',
            'Scan only c2 ≤ c1: the table is symmetric, and the fuller CD comes first.',
          ],
          show: [0, 7],
          note: 'The end: the total 150 lies on one diagonal (amber), and (80, 70) and (70, 80) differ least (blue).',
          say: 'After the last song, read the answer off the table. The largest total c1 + c2 is 150, on the diagonal from (100, 50) to (50, 100). Of those pairs, (80, 70) and (70, 80) differ least, so the output is 80 70. The table is symmetric, because the two CDs can swap, so it is enough to scan c2 ≤ c1, which also puts the fuller CD first. A song longer than W fits on neither CD: its shift only sets bits above W, and c1 ≥ w[i] never holds.',
        },
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int W, n;
    cin >> W >> n;
    vector<int> w(n);
    for (int &x : w) cin >> x;
    // Bit c2 of can[c1]: some songs fill the CDs with exactly c1 and c2 minutes.
    vector<bitset<1001>> can(W + 1);
    can[0][0] = 1;
    for (int i = 0; i < n; i++)
        for (int c1 = W; c1 >= 0; c1--)    // downwards, so each song is used once
            can[c1] |= (can[c1] << w[i]) | (c1 >= w[i] ? can[c1 - w[i]] : bitset<1001>());
    int best1 = 0, best2 = 0;
    for (int c1 = 0; c1 <= W; c1++)
        for (int c2 = 0; c2 <= c1; c2++)   // can is symmetric, so let c1 be the fuller CD
            if (can[c1][c2] && pair(c1 + c2, c2 - c1) > pair(best1 + best2, best2 - best1))
                best1 = c1, best2 = c2;
    cout << best1 << " " << best2 << "\\n";
}`,
    },
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
      '"At most c" versus "exactly c": all zeros means at most, −∞ except dp[0] = 0 means exactly. If you computed exactly, take the maximum over all c ≤ W (or make the table monotone) before reading the answer, otherwise a capacity that cannot be filled exactly looks impossible.',
      'A capacity W far larger than the total weight Σw[i] of all the items: cap W at Σw[i] before allocating the table. In 1633D the capacity reaches 10⁶, but the weights add up to at most 12n.',
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
        'Each element is a 0/1 knapsack item with weight ops[b_i] and value c_i, and k is the capacity. ops[v] is at most 12 for v ≤ 1000, so k up to 10⁶ is a red herring: cap it at Σ ops[b_i] ≤ 12n.',
        'Precompute ops[v] for v ≤ 1000: for every a and x, set ops[a + ⌊a/x⌋] to ops[a] + 1 if that is smaller. Then run dp[cap] = max(dp[cap], dp[cap − w] + c) with cap going down from min(k, Σw). O(1000² + 12n²).',
      ],
      solution:
        'Compute ops[v], the fewest operations to reach v from 1, by processing a in increasing order and updating ops[a + ⌊a/x⌋] for every x ≤ a (values only grow, so this order is safe). Each index i is then a 0/1 item of weight ops[b_i] and value c_i. Cap the capacity at min(k, Σ ops[b_i]), at most about 12n, and run the 1D knapsack with capacity sweeping downwards; the answer is dp at the capped capacity. Without the cap, 10⁶ capacity times 1000 items is too slow.',
    },
    {
      id: '106C',
      name: 'Buns',
      rating: 1700,
      tier: 'warmup',
      hints: [
        'Dough is used by every bun, stuffing i only by buns of type i. Which resource is the knapsack capacity, and what does a stuffing amount limit?',
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
        'Process months in order; before month i you have earned x·(i − 1). For h from H down to h_i, if dp[h − h_i] + c_i ≤ x·(i − 1), set dp[h] = min(dp[h], dp[h − h_i] + c_i). The answer is the largest h with a finite dp[h]. O(m·Σh).',
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
        'dp[s] = most whole 840-blocks available when the loose items weigh exactly s. For weight i try r = 0..min(cnt_i, 840/i − 1) loose items: s grows by r·i and the blocks grow by ⌊(cnt_i − r) / (840/i)⌋. Answer max over s ≤ W of s + 840·min(dp[s], ⌊(W − s)/840⌋). With s ≤ 8·840 = 6720, that is about 6721 · (840/1 + 840/2 + … + 840/8) ≈ 1.5·10⁷ steps.',
      ],
      solution:
        'Write the number of weight-i items taken as r + q·(840/i) with 0 ≤ r < 840/i; each group of 840/i items weighs exactly 840, so only the remainders r need a real knapsack and everything else is a pool of identical 840-blocks. A bounded knapsack over the loose weight s ≤ 8·840 stores the largest number of blocks the leftover items can form. For each reachable s ≤ W, add as many blocks as fit, min(dp[s], ⌊(W − s)/840⌋), and take the best total. Keep r ≤ cnt_i and use 64-bit arithmetic throughout.',
    },
  ],
};
