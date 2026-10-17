// Difference arrays and sweeps: primer and problems.
export default {
  id: 'difference-arrays',
  title: 'Difference arrays and sweeps',
  track: 'dp',
  summary: 'Apply many range updates in O(1) each and read the result with one prefix pass, stack two levels when the updates come in ranges themselves, and sweep sorted events when coordinates are too large for an array.',
  primer: {
    slides: [
      {
        title: 'Many range updates, one read at the end',
        points: [
          'Each update adds v to every element from l to r, and the array is read only at the end.',
          'Cell by cell, that is up to n steps per update: about 4·10^10 in all.',
          'Inside a range every cell changes like its neighbour, so most of that work records nothing new.',
        ],
        say: 'The typical question applies many updates of the form "add v to every element from l to r" and reads the array only once they are all done. Applied cell by cell, each update costs up to n steps, so m updates on n elements, both 2·10^5, take about 4·10^10. Yet inside a range every cell changes in the same way as its neighbour, so most of that work records nothing new.',
      },
      {
        title: 'A range update changes two differences',
        points: [
          'Adding v to a block makes the step into it, from l − 1 to l, larger by v.',
          'The step out of it, from r to r + 1, gets smaller by v.',
          'Inside the block neighbours rise together, so their differences do not change.',
        ],
        show: [0, 2],
        note: 'd holds the steps between neighbours (next slide): +3 on a[1..4] raises the step into a[1], d[1], and lowers the step out after a[4], d[5].',
        say: 'So look at the differences between neighbours instead of the values. Adding v to the block from l to r makes the step into it, from position l − 1 to l, larger by v, and the step out of it, from r to r + 1, smaller by v. Inside the block both neighbours rise together, so their difference does not change. A range update, however long, changes only two differences.',
      },
      {
        title: 'Two writes in d per update',
        points: [
          'The difference array is d[i] = a[i] − a[i−1], with d[0] = a[0].',
          'Adding v to a[l..r] is d[l] += v and d[r+1] −= v, so d needs a spare cell past the end.',
          'To read a, take prefix sums of d in one left-to-right pass (`build`).',
        ],
        show: [0, 8],
        note: 'd after +3 on a[1..4], +2 on a[3..6] and +1 on a[0..2], six writes (d[3] = 2 − 1); rebuilding, a[1] = a[0] + d[1] = 1 + 3 = 4.',
        say: 'Store those differences in the difference array d: d[i] = a[i] − a[i−1], with d[0] = a[0] as if a[−1] were 0. Adding v to a[l..r] is then two writes, d[l] += v and d[r+1] −= v. The second lands just past the range, possibly one past the end of a, so d needs a spare cell. To read the array, take prefix sums of d: a[i] = d[0] + d[1] + … + d[i], one left-to-right pass with a running total (`build` in the template).',
      },
      {
        title: 'The prefix sums telescope',
        points: [
          'In d[0] + … + d[i], every earlier a[j] is added once and taken away once, leaving a[i].',
          'So d[l] += v adds v to every a[i] with i ≥ l, and d[r+1] −= v takes it back from i ≥ r + 1.',
          'Updates only add, so they can arrive in any order and add up in d.',
        ],
        show: [0, 12],
        note: 'Still rebuilding: a[5] = a[4] + d[5] = 5 − 3 = 2.',
        say: 'Why it is right: the prefix sums telescope, d[0] + … + d[i] = a[0] + (a[1] − a[0]) + … + (a[i] − a[i−1]) = a[i]. Seen from that pass, d[l] += v adds v to every a[i] with i ≥ l, and d[r+1] −= v takes it back from every i ≥ r + 1, so exactly a[l..r] gains v. Updates only add, so they can arrive in any order and add up in d.',
      },
      {
        title: 'O(n + m), and it stacks',
        points: [
          'm updates cost O(1) each plus one O(n) pass: O(n + m) instead of O(n·m).',
          'If a query runs a range of operations, a difference array over operation numbers counts how often each one runs.',
          'Adding 1, 2, …, k to a segment is second order: record it in dd and take prefix sums twice (`addProgression`).',
        ],
        show: [0, 15],
        note: 'The finished array after 3 updates and one prefix pass; a[1..4] (green) each collected two, such as a[1] = 3 + 1 and a[3] = 3 + 2.',
        say: 'That makes m updates cost O(1) each plus one O(n) pass, O(n + m) instead of O(n·m). When the updates themselves come in ranges, use two levels: if a query runs a whole range of operations, a first difference array over operation numbers counts how often each operation runs, and only after its prefix pass is each operation applied, once, with that weight. Adding the progression 1, 2, …, k to a segment is second order: its differences are constant on the segment, so record them in dd, a difference array of d, and take prefix sums twice (`addProgression`).',
      },
      {
        title: 'Huge coordinates: sort the events and sweep',
        points: [
          'With coordinates up to 10^18 there is no array, so keep the events: +v at l and −v at r + 1.',
          'Sort them and sweep: each gap between events is a block of identical points, so add its length.',
          '`coverage` tracks `cover` and fills len[c], the points covered by exactly c segments, in O(m log m).',
        ],
        say: 'When coordinates reach 10^9 or 10^18 there is no array to index. Keep the same events, +v at l and −v at r + 1, sort them by coordinate and sweep. Between two consecutive event coordinates nothing changes, so each gap is a block of identical points: add its length instead of visiting its points. `coverage` does this for m segments in O(m log m), tracking `cover`, the number of segments over the current point, and filling len[c], the number of points covered by exactly c segments.',
      },
    ],
    terms: [
      'a[i]: the array being updated, indexed from 0, and read only after all the updates; a[l..r] is the block from index l to index r, both ends included.',
      'd[i]: the difference array, d[i] = a[i] − a[i−1] with d[0] = a[0]; adding v to a[l..r] is d[l] += v and d[r+1] −= v (`add` in the template), and its prefix sums give back a (`build`). The template sizes it n + 2; the TRD version, `applyRanges`, uses n + 1 and rebuilds a inside d with `partial_sum`.',
      'dd[i]: a second-order difference array, the differences of d: one prefix pass turns it into d and a second turns it into a. `addProgression` adds 1, 2, …, r − l + 1 on [l, r] with three writes to it.',
      '`cover`: during a sweep, the number of segments that contain the current point.',
      'len[c]: in `coverage`, how many integer points are covered by exactly c of the segments. The TRD version, `coveredLength`, merges the segments with IntervalContainer.h and returns only the total length covered at least once; it takes half-open int pairs, so an inclusive [l, r] goes in as {l, r + 1}, and coordinates up to 10^18 need `coverage`\'s event sweep instead.',
    ],
    worked: {
      problem: { source: 'kattis', id: 'landscape', name: 'Landscape Generator', difficulty: '3.3' },
      slides: [
        {
          title: 'A landscape built from range edits',
          points: [
            'n points start at height 0, then k edits follow, with n and k up to 2·10^5. Print every final height.',
            'Raise and Depress add +1 or −1 at every point from x1 to x2.',
            'Hill adds 1 at x1 and x2, 2 one point further in, and so on up to the middle; Valley subtracts the same shape.',
          ],
          show: [1, 0],
          note: 'Sample 1: the final heights of its 20 points after 13 edits, the output to print.',
          say: 'The landscape is n points, all at height 0 to begin with, and k edits follow, with n and k up to 2·10^5. Raise adds 1 at every point from x1 to x2, and Depress subtracts 1. Hill adds a tent shape: 1 at x1 and x2, 2 one point further in, and so on up to the middle. Valley subtracts the same shape. The output is every final height; the picture shows the first sample\'s 20 heights after its 13 edits.',
        },
        {
          title: 'Point by point is 4·10^10 steps',
          points: [
            'One edit can touch all n points, so applying the edits one by one is O(n·k), up to 4·10^10 steps.',
            'The heights are read only after the last edit, so each edit can be recorded in O(1) and the heights rebuilt once.',
          ],
          say: 'An edit can cover all n points, so applying the edits one at a time costs O(n·k): with both at 2·10^5, about 4·10^10 steps. But the heights are read only once all the edits are in, which is the situation a difference array is for: record each edit in O(1), then rebuild every height in one pass at the end.',
        },
        {
          title: 'A hill\'s steps are constant in stretches',
          points: [
            'Raise and Depress are range adds: d[x1] += v and d[x2+1] −= v, with v = +1 or −1.',
            'A hill changes every point by a different amount, so recording it in d would take a write per point.',
            'Its steps between neighbours are +1 up to the middle and −1 after it, with a 0 between two middle points.',
          ],
          show: [0, 0],
          note: 'Sample 2\'s hill, H 1 6, and the step into each point: the shape to record, shown before any writes.',
          say: 'Raise and Depress are the stage\'s range add: d[x1] += v and d[x2 + 1] −= v, with v = 1 for Raise and −1 for Depress. A hill is harder: every point changes by a different amount, so recording it in d would take one write per point. Look at its steps instead, the change from one point to the next. On the hill 1, 2, 3, 3, 2, 1 they are +1, +1, +1, then 0 between the two middle points, then −1 until the height is back to 0. The steps are constant in stretches, so they can go in a difference array of their own: the second-order difference array dd.',
        },
        {
          title: 'Four writes in dd per hill',
          points: [
            'dd holds the changes of the step: +1 at x1, −1 just after each middle point, and +1 at x2 + 2.',
            'dd[x1] += 1, dd[(x1+x2)/2 + 1] −= 1, dd[(x1+x2+1)/2 + 1] −= 1 and dd[x2+2] += 1; a valley swaps every sign.',
            'With an odd number of points both middles are the same point, so that cell drops by 2.',
          ],
          show: [0, 1],
          note: 'Sample 2 after its only edit, before the pass: the four writes, at dd[1], dd[4], dd[5] and dd[8].',
          say: 'So dd records where the step changes. A hill from x1 to x2 starts a step of +1 at x1. With integer division, (x1 + x2) / 2 and (x1 + x2 + 1) / 2 are the middle points, the same point when the hill has an odd number of points, and just after each of them the step drops by 1. The last step down is into x2 + 1, where the height is back to 0, so at x2 + 2 the step returns to 0. That makes four writes: dd[x1] += 1, dd[(x1 + x2) / 2 + 1] −= 1, dd[(x1 + x2 + 1) / 2 + 1] −= 1 and dd[x2 + 2] += 1. A valley makes the same writes with every sign swapped.',
        },
        {
          title: 'One pass with two running sums',
          points: [
            '`slope` adds up dd, so it is the step that hills and valleys make into point i.',
            '`h` adds d[i] + `slope`, the full step, so it is the height at point i, printed as soon as it is known.',
          ],
          show: [0, 2],
          note: 'Partway through the pass, at point 4: dd[4] = −1 takes slope from 1 to 0, so h stays at 3.',
          say: 'One left-to-right pass rebuilds everything. slope is the running sum of dd, which is the step that the hills and valleys make into point i. Adding d[i] for the raises and depressions gives the full step, and h, the running sum of the steps, is the height at point i, printed as soon as it is known. At point 4 of the second sample, dd[4] = −1 takes slope from 1 down to 0, so the height stays at 3.',
        },
        {
          title: 'Sample 2 rebuilt',
          points: [
            'The pass gives 1, 2, 3, 3, 2, 1, 0, the sample\'s output.',
            'A hill ending at x2 = n writes dd[n + 2], so dd needs n + 3 cells, though the pass never reads past n.',
          ],
          show: [0, 3],
          note: 'The finished pass for sample 2: the heights match the expected output; dd[8] is never read.',
          say: 'When the pass ends, the heights are 1, 2, 3, 3, 2, 1, 0, exactly the second sample\'s output. The last write, dd[8], lies past the last point and is never read. It is still needed: a hill that ends at the last point, x2 = n, puts its fourth write at n + 2, so d and dd get n + 3 cells.',
        },
        {
          title: 'O(n + k), with heights in long long',
          points: [
            'Each edit is 2 or 4 writes and the pass is O(n), so the whole solution is O(n + k).',
            'Hills over the whole range can stack 2·10^5 deep with middles of 10^5, so heights reach 2·10^10: use long long.',
            'A one-point hill, x1 = x2, writes +1, −2 and +1 and raises only that point, by 1.',
          ],
          say: 'Every edit costs two or four writes and the pass costs O(n), so the whole solution is O(n + k), around 10^6 steps. The heights get large: 2·10^5 hills over the whole range each add up to 10^5 in the middle, so a height can reach 2·10^10, past the range of int. Keep d, dd, slope and h in long long. A hill on a single point, x1 = x2, writes +1, −2 and +1 into three cells in a row and raises only that point, by 1, as the statement says.',
        },
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    vector<long long> d(n + 3, 0), dd(n + 3, 0);  // a hill ending at n writes dd[n + 2]
    while (k--) {
        char c;
        int x1, x2;
        cin >> c >> x1 >> x2;
        int v = (c == 'R' || c == 'H') ? 1 : -1;
        if (c == 'R' || c == 'D') {
            d[x1] += v;
            d[x2 + 1] -= v;
        } else {  // the step is +v from x1, drops after each middle point, is 0 from x2 + 2
            dd[x1] += v;
            dd[(x1 + x2) / 2 + 1] -= v;
            dd[(x1 + x2 + 1) / 2 + 1] -= v;
            dd[x2 + 2] += v;
        }
    }
    long long slope = 0, h = 0;
    for (int i = 1; i <= n; i++) {
        slope += dd[i];
        h += d[i] + slope;
        cout << h << '\\n';
    }
}`,
    },
    spot: [
      'Many "add v to every element from l to r" operations, and the values are only read after all of them.',
      'For each point, how many intervals cover it, or how many points are covered by exactly k intervals.',
      'You choose one value x from a large range, and each item contributes a cost that is constant on a few intervals of x.',
      'Operations applied over a range of operation numbers, or operations that add an arithmetic progression to a segment.',
    ],
    disguises: [
      'Reorder the array to maximise the total of fixed range-sum queries → count how many queries cover each index with a difference array, then give the largest values to the most-covered indices',
      'Choose one common target (a pair sum, a temperature, a level) and minimise the changes → each item adds its cost on a few intervals of the target; build a difference array over the target and scan every candidate',
      'Count triples (x, y, z) under an inequality → for each x add +1 over the range of possible sums x + y, then combine the sum counts with z in one scan',
      'A process where each source is used up by consecutive consumers → prefix sums plus binary search find where each source runs out, and a difference array records the range of consumers it served in full',
    ],
    pitfalls: [
      'The closing update d[r+1] lands one past the last index, so d needs n + 1 cells when a is indexed from 0, and n + 2 (or the largest coordinate + 2) when it is indexed from 1. The template allocates n + 2, which also fits the r + 2 write of `addProgression`.',
      'Coordinates up to 10^9 or 10^18 do not fit in an array: switch to sorted (coordinate, ±v) events with r+1 as the closing point, and keep r+1 and the lengths in long long.',
      'With two levels (how often each operation runs, then what the operations do), finish the prefix pass of the first level before you apply the second.',
    ],
    code: `// Range add in O(1) each; one prefix pass recovers the values. 0-indexed, inclusive.
struct Diff {
    vector<long long> d;
    explicit Diff(int n) : d(n + 2, 0) {}
    void add(int l, int r, long long v) { d[l] += v; d[r + 1] -= v; }
    vector<long long> build() const {
        vector<long long> a(d.size() - 2);
        long long run = 0;
        for (size_t i = 0; i < a.size(); i++) a[i] = run += d[i];
        return a;
    }
};

// Second order: add 1, 2, ..., r-l+1 on [l, r]. dd has size n + 2; prefix it twice.
void addProgression(vector<long long>& dd, int l, int r) {
    long long len = r - l + 1;
    dd[l] += 1; dd[r + 1] -= len + 1; dd[r + 2] += len;
}

// Sweep over sorted events instead of an array (coordinates up to 1e18):
// len[c] = number of integer points covered by exactly c of the segments [l, r].
vector<long long> coverage(const vector<pair<long long, long long>>& segs) {
    vector<pair<long long, int>> ev;
    for (auto [l, r] : segs) { ev.push_back({l, +1}); ev.push_back({r + 1, -1}); }
    sort(ev.begin(), ev.end());
    vector<long long> len(segs.size() + 1, 0);
    int cover = 0;
    for (size_t i = 0; i < ev.size(); i++) {
        if (i > 0) len[cover] += ev[i].first - ev[i - 1].first;
        cover += ev[i].second;
    }
    return len;
}`,
    resources: [
      { label: 'USACO Guide: More on prefix sums (difference arrays)', url: 'https://usaco.guide/silver/more-prefix-sums' },
      { label: 'CSES: Restaurant Customers (event sweep)', url: 'https://cses.fi/problemset/task/1619' },
      { label: 'Competitive Programmer’s Handbook (CSES book), ch. 9: Range queries', url: 'https://cses.fi/book/book.pdf' },
    ],
  },
  problems: [
    {
      id: '816B',
      name: 'Karen and Coffee',
      rating: 1400,
      tier: 'warmup',
      hints: [
        'There are up to 2·10^5 recipes, each covering a range of temperatures. Adding 1 to every temperature of every recipe is too slow; what is the cheapest way to record "+1 on [l, r]"?',
        'Record each recipe as d[l] += 1, d[r+1] −= 1; one prefix pass over d gives how many recipes recommend each temperature. A question then asks how many temperatures in [a, b] are admissible, which is an ordinary prefix sum over 0/1 admissible flags.',
        'Temperatures are at most 200000, so plain arrays work. In one pass: cover[t] = cover[t−1] + d[t] and good[t] = good[t−1] + (cover[t] ≥ k). Answer good[b] − good[a−1]. O(n + q + 200000).',
      ],
      solution: 'Mark every recipe in a difference array (d[l]++, d[r+1]−−), prefix it to get the number of recipes per temperature, turn that into a 0/1 admissible flag, and prefix the flags. Each question is good[b] − good[a−1]. Allocate room for index 200001, where the closing update of a recipe ending at 200000 lands. O(n + q + T) with T = 200000.',
    },
    {
      id: '295A',
      name: 'Greg and Array',
      rating: 1400,
      tier: 'warmup',
      hints: [
        'Each query applies a whole range of operations, and each operation adds to a whole range of the array. What single number do you need to know about each operation before touching the array?',
        'Two levels of range updates: a difference array over operation numbers counts how many times each operation i runs (times[i]); then operation i is one range update of times[i] · d_i on the array, recorded in a second difference array.',
        'For each query do times[x]++, times[y+1]−−, and prefix it. Then for each operation add times[i]·d_i at l_i and subtract it at r_i + 1 in the array’s difference array, prefix that and add it to a. O(n + m + k), all in long long.',
      ],
      solution: 'First difference array over operations: each query (x, y) does times[x]++, times[y+1]−−; after a prefix pass times[i] is how often operation i runs. Second difference array over the array: operation i adds times[i]·d_i on [l_i, r_i]. Prefix it and add the initial a. Values reach 10^5 · 10^5 · 10^5 = 10^15, so 32-bit ints overflow; that is the common wrong answer. O(n + m + k).',
    },
    {
      id: '276C',
      name: 'Little Girl and Maximum Sum',
      rating: 1500,
      tier: 'core',
      hints: [
        'Write the total of all query answers as a sum over positions: each position contributes its value times the number of queries that cover it. Which positions deserve the biggest values?',
        'How often each position is covered depends only on the queries, and one difference array (+1 at l, −1 at r+1, then prefix) gives all those counts. What is left is a rearrangement problem: put the largest value on the most-covered position.',
        'Compute freq[i] with the difference array, sort freq and sort a, and add a[i]·freq[i] at matching ranks. O(n log n + q), answer in long long.',
      ],
      solution: 'The total equals Σ a_i · freq_i, where freq_i is the number of queries covering position i. Compute freq with a difference array, then sort both freq and the values and multiply them rank by rank (largest with largest). Filling freq by looping over every query range is O(n·q) and times out, and the answer reaches about 8·10^15, so use long long.',
    },
    {
      id: '1795C',
      name: 'Tea Tasting',
      rating: 1500,
      tier: 'core',
      hints: [
        'Follow one sort of tea instead of one taster: tea i is offered to tasters i, i+1, i+2, … in that order, each taking up to b_j. When does it run out?',
        'With prefix sums B of b, tasters i..j all drink their full b_j from tea i as long as B[j] − B[i−1] ≤ a_i; binary search finds the last such j, and taster j+1 gets whatever is left. "Tasters i..j each drink their full amount once more" is a range update, so record it in a difference array of counts.',
        'For each tea i: find the largest j with B[j] ≤ B[i−1] + a_i, do cnt[i]++, cnt[j+1]−−, and if j < n add a_i − (B[j] − B[i−1]) to extra[j+1]. After prefixing cnt, taster k drinks cnt_k · b_k + extra_k. O(n log n).',
      ],
      solution: 'Each tea i is drunk by tasters i, i+1, … in order. Using prefix sums B of b, binary search the largest j ≥ i−1 with B[j] − B[i−1] ≤ a_i: tasters i..j drink in full (range +1 on a count difference array) and, if j < n, taster j+1 drinks the remainder a_i − (B[j] − B[i−1]). Taster k’s total is (prefix of counts at k)·b_k + remainder_k. Totals reach about 2·10^14, so use long long; simulating the steps directly is O(n²).',
    },
    {
      id: '1000C',
      name: 'Covered Points Count',
      rating: 1700,
      tier: 'core',
      hints: [
        'Coordinates go up to 10^18, so you cannot keep a counter for every point. Between two consecutive segment endpoints, can the number of covering segments change?',
        'This is a difference array without the array: each segment contributes +1 at l and −1 at r+1, and coverage only changes at those 2n event coordinates. Sort the events and sweep; each gap between consecutive event coordinates is a block of points with the same coverage.',
        'Sort pairs (coordinate, ±1) with the closing event at r+1. Walk them while tracking cover; before applying event i, add x_i − x_{i−1} to cnt[cover]. O(n log n), lengths in long long.',
      ],
      solution: 'Create events (l, +1) and (r+1, −1), sort by coordinate and sweep. Between consecutive events x_{i−1} and x_i the coverage is constant, so do cnt[cover] += x_i − x_{i−1} before applying event i, then print cnt[1..n]. Closing at r instead of r+1 drops every right endpoint, and r+1 can be 10^18 + 1, so use long long. O(n log n).',
    },
    {
      id: '1343D',
      name: 'Constant Palindrome Sum',
      rating: 1700,
      tier: 'core',
      hints: [
        'Fix the target sum x. For one pair (a_i, a_{n−i+1}), how many of its two numbers must be replaced: 0, 1 or 2? How does that depend on x?',
        'For a pair with lo = min and hi = max: cost 0 when x = lo + hi, cost 1 when x is in [lo+1, hi+k] (keep one number, set the other to x minus it), otherwise 2. That is a constant cost plus a range update and a point update over x, so a difference array over x in [2, 2k] gives the total cost for every x at once.',
        'Start every x at n (2 per pair). For each pair add −1 on [lo+1, hi+k] and another −1 at x = lo + hi. Prefix over x from 2 to 2k and take the minimum. O(n + k) per test.',
      ],
      solution: 'Each x in [2, 2k] costs 2 per pair by default. A pair (u, v) with lo ≤ hi needs one replacement when lo+1 ≤ x ≤ hi+k (the kept number plus a new value in [1, k] reaches x) and none when x = u + v. Encode the −1 range and the −1 point in a difference array over x, prefix it, and take the minimum of n + diff over all x. Size the array 2k+2 so the closing index hi+k+1 fits. O(n + k) per test, which is fine because Σk ≤ 2·10^5.',
    },
    {
      id: '1355C',
      name: 'Count Triangles',
      rating: 1800,
      tier: 'challenge',
      hints: [
        'Because x ≤ y ≤ z, the only triangle inequality that can fail is x + y > z. So a choice of (x, y) matters only through s = x + y. How many pairs (x, y) give each sum s?',
        'For a fixed x, y ranges over [B, C], so x adds +1 to every s in [x+B, x+C]: a range update. A difference array over s (at most B + C ≤ 10^6) gives ways[s] for every s after one prefix pass.',
        'For each s the valid z are C ≤ z ≤ min(D, s−1), so add ways[s] · max(0, min(D, s−1) − C + 1). O(B + C), answer in long long.',
      ],
      solution: 'With x ≤ y ≤ z the triangle condition reduces to x + y > z. For each x in [A, B] add +1 on the sums [x+B, x+C] in a difference array; prefixing gives ways[s], the number of (x, y) pairs with sum s. The answer is Σ over s of ways[s] · max(0, min(D, s−1) − C + 1). The count can be around 10^15, so use long long. O(B + C).',
    },
    {
      id: '1661D',
      name: 'Progressions Covering',
      rating: 1900,
      tier: 'challenge',
      hints: [
        'Look at the last element b_n. Which progressions reach it, and which of them adds the most to it? Once b_n is satisfied, does the same argument work for b_{n−1}?',
        'Greedy from the right: the rightmost unsatisfied position i should get progressions that end exactly at i (or at k when i < k), because they add the maximum possible amount to i and as much as possible to the positions on its left. Applying "k, k−1, …, 1" fast is a range update of a range update: track how many progressions are active and their total at the current position.',
        'Sweep i from n down to 1 keeping sum (amount added at i) and cnt (active progressions). Moving left, sum −= cnt, then cnt drops by the progressions whose left end was i+1 (kept in a close array). If b_i > sum, place x = ⌈(b_i − sum)/g⌉ progressions with g = min(i, k), and update the answer, sum, cnt and the close array. O(n).',
      ],
      solution: 'Process positions from right to left. At position i every active progression adds one less than at i+1, so sum −= cnt, then remove the progressions whose left end was i+1. If b_i − sum > 0, place x = ⌈(b_i − sum)/g⌉ progressions with right end max(i, k) (1-indexed), where g = min(i, k) is what each adds at i; add x to the answer, x·g to sum and x to cnt, and schedule their removal at their left end. A progression ending further left gives i less and does nothing for positions to the right, so the greedy is optimal. O(n), with b up to 10^12 so use long long throughout.',
    },
  ],
};
