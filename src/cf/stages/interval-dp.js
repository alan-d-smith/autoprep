// Grid DP and interval DP: primer and problems.
export default {
  id: 'interval-dp',
  title: 'Grid DP, interval DP and choosing the state',
  track: 'dp',
  summary: 'Design DP states over grid cells, over segments dp[l][r] filled by length, and over small tuples such as the last item on each line, and spot the reorder or delete problems that collapse into one of them.',
  primer: {
    slides: [
      {
        title: 'Listing every walk or merge is hopeless',
        points: [
          'Two shapes: a right-or-down walk across a grid, or a row of items merged, deleted or folded in place.',
          'A 20 × 20 grid has about 3.5·10^10 corner-to-corner paths; 20 piles merge in about 1.2·10^17 different orders.',
        ],
        say: 'The questions here come in two shapes. One is a walk across a grid that moves only right or down and is scored by the cells it visits; the other is a row of items that is merged, deleted or folded in place, where the neighbours close up after every step. Listing the possibilities is hopeless: a 20 × 20 grid has about 3.5·10^10 right/down paths from corner to corner, and a row of 20 piles can be merged into one by about 1.2·10^17 different sequences of merges.',
      },
      {
        title: 'Most possibilities share their future',
        points: [
          'A walk at a cell goes on the same way however it got there, and it arrived from above or the left.',
          'In a row whose neighbours close up, each item comes from a contiguous segment l..r, decided only by its own items.',
          'The last step on l..r splits it into shorter segments that never interact again.',
        ],
        say: 'Most of those possibilities share their future. A walk that has reached a cell can go on in exactly the same ways however it got there, and it can only have arrived from the cell above or the cell to the left. In a row whose neighbours close up, every item on the table is built from a contiguous segment of the original row, so what happens to the segment l..r depends only on the items inside it, and the last step on it splits it into shorter segments that never interact again.',
      },
      {
        title: 'best[i][j] from the cell above or left',
        points: [
          'best[i][j] = g[i][j] + max(best[i−1][j], best[i][j−1]).',
          'Filling row by row has both neighbours ready in time: O(nm) for n rows and m columns.',
          'Passes from the other corners let two paths that meet be glued together at the meeting cell.',
        ],
        say: 'For a grid, let best[i][j] be the best value of a path from the top-left cell (0, 0) to the cell (i, j), and g[i][j] the value written in that cell. Then best[i][j] = g[i][j] + max(best[i−1][j], best[i][j−1]), and filling the table row by row has both neighbours ready in time, O(nm) for n rows and m columns. Running the same pass from the other corners gives the best piece from each corner to every cell, so two paths that meet can be glued together at the meeting cell.',
      },
      {
        title: 'A row splits at its last merge',
        points: [
          'dp[l][r] is the cheapest way to merge piles l..r into one, where each merge costs the new pile\'s size.',
          'The last merge joins l..k and k+1..r, so dp[l][r] = min over k of dp[l][k] + dp[k+1][r], plus the total pre[r+1] − pre[l].',
          'Fill every segment of one length `len` before any longer one, so the shorter segments are final.',
        ],
        show: [0, 12],
        note: 'The diagram finds the longest palindromic subsequence of AGBCBA, not merge costs, but fills in the same order: every shorter segment is final before dp[1][4].',
        say: 'For a row, let dp[l][r] be the best answer for the items l..r on their own. In the template, piles a[0..n−1] are merged until one is left, and each merge costs the size of the new pile. The last merge of l..r joins l..k and k+1..r for some split point k and costs the whole segment\'s total, pre[r+1] − pre[l] from prefix sums, so dp[l][r] is the minimum over k of dp[l][k] + dp[k+1][r], plus that total. The template fills every segment of one length `len` before any longer one, so the shorter segments it reads are already final.',
      },
      {
        title: 'Every merge order has a last merge',
        points: [
          'Any way of merging l..r ends with a last merge at some k, after each half was merged independently.',
          'So for each k the cheapest halves give the cheapest way, and trying every k covers every way.',
          'A state is the smallest description that decides every future move: equal states finish alike, so keep the better.',
        ],
        say: 'Why this is right: every way of merging l..r has some last merge at some k, and the two halves before it were merged independently, so the cheapest way with that k uses the cheapest way for each half, and trying every k covers every way. The same test decides any state: it must be the smallest description of a partial solution that still decides every future move, because two partial solutions with equal states can be finished in exactly the same ways and only the better needs keeping. Examples are the cell a walk has reached, the segment still on the table, or the last item placed on each of three lines (UKIEPC 2025 Klaus).',
      },
      {
        title: 'Usually O(n³), so n ≤ 500',
        points: [
          'O(n²) segments, each trying O(n) split points, make O(n³).',
          'When a segment only looks at its two ends, as for palindromes, it is O(n²) and n can reach 5000.',
          'Cut a circle at one point to get a row; each choice then splits an arc into smaller independent arcs.',
        ],
        show: [0, 21],
        note: 'dp[0][5] = 5: the longest palindromic subsequence of AGBCBA is ABCBA. Each segment took O(1) work, so O(n²) in all.',
        say: 'There are O(n²) segments and trying every split costs O(n) each, so interval DP is usually O(n³), which is why these problems have n ≤ 500. When a segment only looks at its two ends, as for palindromes or a block that grows at one end, it is O(n²) and n can reach 5000. Points on a circle become a row once the circle is cut at one point, and each choice then splits an arc into independent smaller arcs. UKIEPC 2023 Clearing Space also cuts its circle, at the first chosen post, but then runs a chain DP over (last post, posts used) instead of splitting arcs.',
      },
    ],
    terms: [
      'best[i][j]: in a grid DP, the best value of a path from the top-left cell (0, 0) to the cell (i, j) that moves only right or down.',
      'g[i][j]: the value in the grid cell in row i and column j, both counted from 0.',
      'dp[l][r]: in an interval DP, the best answer for the items l..r on their own, as if nothing outside them existed; l and r are the first and last index, both included.',
      'a[i]: item i of the row, counted from 0; in the template, the size of pile i. a[l..r] is the part from index l to index r, both included.',
      's[l..r]: the substring of a string s from index l to index r, both included.',
      'k: the split point, so that the last step joins l..k and k+1..r. In a deletion problem k is instead the later element that is removed together with element l.',
      '`len`: the length r − l + 1 of a segment; every segment of one length is filled before any longer one.',
      'pre[i]: the prefix sum a[0] + … + a[i−1], so the items l..r total pre[r+1] − pre[l] (`P` in the TRD version).',
    ],
    worked: {
      title: 'merging piles',
      question: 'Four piles of stones stand in a row, holding 6, 4, 5 and 5 stones. A move merges two neighbouring piles into one and costs the number of stones in the new pile. Find the smallest total cost of merging all the piles into one. In the real version n ≤ 400 and a pile holds up to 10^9 stones.',
      steps: [
        'Recognise it: after each merge the neighbours close up, so every pile on the table is made from a contiguous segment of the original row, and n ≤ 400 allows O(n³). Trying every sequence of merges is hopeless, since 20 piles already allow about 1.2·10^17 of them. The obvious greedy fails too: merging the cheapest neighbouring pair first takes 4 + 5, then 9 + 5, then 6 + 14, and pays 9 + 14 + 20 = 43.',
        'Model it: dp[l][r] is the cheapest way to merge piles l..r (counted from 0) into one pile, and dp[i][i] = 0. The last merge joins l..k and k+1..r for some split k and costs the segment\'s total pre[r+1] − pre[l], so dp[l][r] is the minimum over k of dp[l][k] + dp[k+1][r], plus that total. Here pre = 0, 6, 10, 15, 20.',
        'Length 2, where the only split is down the middle: dp[0][1] = 6 + 4 = 10, dp[1][2] = 4 + 5 = 9 and dp[2][3] = 5 + 5 = 10.',
        'Length 3: dp[0][2] = min(dp[0][0] + dp[1][2], dp[0][1] + dp[2][2]) + 15 = min(9, 10) + 15 = 24, and dp[1][3] = min(dp[1][1] + dp[2][3], dp[1][2] + dp[3][3]) + 14 = min(10, 9) + 14 = 23.',
        'Length 4, the whole row, with total 20: splitting after pile 0, 1 or 2 gives 0 + 23 = 23, 10 + 10 = 20 or 24 + 0 = 24, so dp[0][3] = 20 + 20 = 40. The best last merge joins 6 + 4 with 5 + 5, which the greedy ruled out when it merged the 4 with a 5.',
        'Answer: 40, by merging 6 and 4 (cost 10), then 5 and 5 (cost 10), then the two piles of 10 (cost 20). There are O(n²) segments with up to n − 1 splits each, so the DP is O(n³), about 1.1·10^7 split checks at n = 400. One merge can cost up to 4·10^11, so use long long.',
      ],
    },
    spot: [
      'n ≤ 500 (or n ≤ 5000 with an O(n^2) DP) and an operation that removes or merges a contiguous block, after which the neighbours close up.',
      'A grid walk with right/down moves where you optimise or test something about the path, or two walkers whose paths interact.',
      'Questions about every substring or subarray: how many palindromes inside s[l..r], can a[l..r] collapse into one element.',
      'Points on a circle or a polygon where choices must not cross: cut the circle once, and each choice splits an arc into independent smaller arcs.',
    ],
    disguises: [
      'Delete palindromes or blocks of equal letters until nothing is left → dp[l][r] where the first element, l, either goes alone or goes with a later equal element k once l+1..k-1 is cleared. What is left is k+1..r when the pair closes a palindrome (607B, where an adjacent pair still costs 1), or k..r when element l rides along with element k\'s later deletion (1132F)',
      'Choose an order that minimises a sum of (max - min) over prefixes → sort first; the items placed so far are always a contiguous block of the sorted array, so dp[l][r] grows the block at one end',
      'Fewest trailing zeros of a product along a grid path → two independent min-sum grid DPs, one counting factors of 2 and one counting factors of 5',
      'Assign items in input order to one of several lines, where the cost depends on the previous item on the same line → dp over the index of the last item on each line; one of them is always the current index - 1, which removes a dimension',
    ],
    pitfalls: [
      'Filling dp[l][r] with l and r both increasing reads dp[l+1][r] before it exists. Loop over the length, or run l downward and r upward.',
      'Transitions such as dp[l+1][k-1] reach empty segments (l > r). Size the table n+2 and leave those entries at 0 (or whatever an empty segment costs) instead of special-casing every branch.',
      'A 5000 × 5000 table of int is 100 MB and of long long is 200 MB. Store flags as bool or char and check the memory limit before choosing the type.',
    ],
    code: `// Interval DP: dp[l][r] = best answer for the segment l..r alone.
// Example: merge adjacent piles until one is left; merging two piles costs their total size.
long long mergePiles(const vector<long long>& a) {
    int n = a.size();
    vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
    vector<vector<long long>> dp(n, vector<long long>(n, 0));  // dp[i][i] = 0
    for (int len = 2; len <= n; len++)            // by length: shorter segments are ready
        for (int l = 0; l + len - 1 < n; l++) {
            int r = l + len - 1;
            dp[l][r] = LLONG_MAX;
            for (int k = l; k < r; k++)           // the last merge joins l..k and k+1..r
                dp[l][r] = min(dp[l][r], dp[l][k] + dp[k + 1][r]);
            dp[l][r] += pre[r + 1] - pre[l];      // that last merge costs the whole segment
        }
    return dp[0][n - 1];
}

// Grid DP: best[i][j] = best path value from (0,0) to (i,j) moving right or down.
long long bestPath(const vector<vector<long long>>& g) {
    int n = g.size(), m = g[0].size();
    vector<vector<long long>> best(n, vector<long long>(m, LLONG_MIN));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++) {
            long long from = (i == 0 && j == 0) ? 0 : LLONG_MIN;
            if (i > 0) from = max(from, best[i - 1][j]);
            if (j > 0) from = max(from, best[i][j - 1]);
            best[i][j] = from + g[i][j];
        }
    return best[n - 1][m - 1];
}`,
    resources: [
      { label: 'USACO Guide: Range DP', url: 'https://usaco.guide/gold/dp-ranges' },
      { label: 'USACO Guide: Paths on Grids', url: 'https://usaco.guide/gold/paths-grids' },
      { label: 'CSES: Removal Game (interval DP practice)', url: 'https://cses.fi/problemset/task/1097' },
      { label: 'CP-Algorithms: Knuth optimization (speeding up interval DP)', url: 'https://cp-algorithms.com/dynamic_programming/knuth-optimization.html' },
    ],
  },
  problems: [
    {
      id: '429B',
      name: 'Working out',
      rating: 1600,
      tier: 'warmup',
      hints: [
        'They share exactly one cell. If Iahub enters that cell from above, from which side can Iahubina enter it without the two paths sharing a second cell?',
        'Recognition: the answer is four ordinary grid path DPs glued at the meeting cell. Around that cell the four path pieces (Iahub in, Iahub out, Iahubina in, Iahubina out) are independent, so precompute the best sum from each of the four corners to every cell.',
        'Approach: d1 = best sum from (1,1) to (i,j), d2 = from (i,j) to (n,m), d3 = from (n,1) to (i,j) moving up/right, d4 = from (i,j) to (1,m). For every interior cell take the larger of d1[i-1][j] + d2[i+1][j] + d3[i][j-1] + d4[i][j+1] (Iahub vertical, Iahubina horizontal) and d1[i][j-1] + d2[i][j+1] + d3[i+1][j] + d4[i-1][j] (the other way round). O(nm).',
      ],
      solution: 'Fill four O(nm) tables of best path sums: from the top-left, to the bottom-right, from the bottom-left (up/right moves) and to the top-right. At the meeting cell one of them passes straight through vertically and the other horizontally, otherwise they would share a second cell, so the answer is the max over 2 ≤ i ≤ n-1, 2 ≤ j ≤ m-1 of the two crossing sums d1[i-1][j] + d2[i+1][j] + d3[i][j-1] + d4[i][j+1] and d1[i][j-1] + d2[i][j+1] + d3[i+1][j] + d4[i-1][j]. The meeting cell itself is never added, and border cells can never be the meeting cell. Totals stay below 4·10^8, but long long costs nothing here.',
    },
    {
      id: '1695C',
      name: 'Zero Path',
      rating: 1700,
      tier: 'warmup',
      hints: [
        'Every path visits exactly n+m-1 cells, so the parity of its sum is fixed. After ruling out the odd case, ask what happens to the sum when you change a path at one corner (right-then-down becomes down-then-right).',
        'Recognition: one corner flip swaps a single visited cell, so the sum changes by -2, 0 or +2, and flips can turn the minimum-sum path into the maximum-sum path step by step. Every even value between the two extremes is therefore reachable, and the extremes are plain grid DPs.',
        'Approach: if n+m-1 is odd, print NO. Otherwise compute mn[i][j] = a[i][j] + min(mn[i-1][j], mn[i][j-1]) and mx the same way with max, and print YES exactly when mn ≤ 0 ≤ mx at (n,m). O(nm) per test.',
      ],
      solution: 'A path has n+m-1 cells of ±1, so an odd count can never sum to 0 (this also handles the 1×1 grid). Otherwise compute the minimum and maximum path sums with two grid DPs in O(nm). Flipping one corner of a path changes exactly one visited cell, so the sum moves by at most 2 and keeps its parity; since corner flips connect the minimum path to the maximum path, every even value in between occurs on some path, and the answer is YES iff min ≤ 0 ≤ max.',
    },
    {
      id: '1509C',
      name: 'The Sports Festival',
      rating: 1800,
      tier: 'core',
      hints: [
        'The last discrepancy d_n is max - min of all speeds no matter what the order is. Which member should run last so that the first n-1 runners have the smallest possible spread?',
        'Recognition: in some optimal order every new runner is a new minimum or a new maximum of those who already ran. After sorting the speeds, the first i runners are then always a contiguous block s[l..r] of the sorted array, and the problem becomes an interval DP over that block.',
        'Approach: sort s. dp[l][r] = minimum sum of discrepancies when the runners so far are exactly s[l..r]; dp[i][i] = 0 and dp[l][r] = s[r] - s[l] + min(dp[l+1][r], dp[l][r-1]). Fill by length; the answer is dp[0][n-1]. O(n^2).',
      ],
      solution: 'Sort the speeds. Some optimal order always adds a runner who is a new minimum or maximum, so the runners so far form a sorted block s[l..r], and the discrepancy at that moment is s[r] - s[l] whatever order they ran in. Hence dp[l][r] = s[r] - s[l] + min(dp[l+1][r], dp[l][r-1]) with dp[i][i] = 0, filled by increasing length, and the answer is dp[0][n-1] in O(n^2) time and memory. Use 64-bit integers: the sum can reach about 2000 · 10^9.',
    },
    {
      id: '245H',
      name: 'Queries for Number of Palindromes',
      rating: 1800,
      tier: 'core',
      hints: [
        'There are only about 12.5 million (l, r) pairs but up to 10^6 queries, so precompute the answer for every substring. How does the count for s[l..r] relate to the counts for the two substrings that drop one end?',
        'Recognition: two interval DPs. First pal[l][r] (is s[l..r] a palindrome) from pal[l+1][r-1]; then the count for s[l..r] by inclusion-exclusion over s[l+1..r] and s[l..r-1], since every palindromic substring except possibly s[l..r] itself lies in one of them.',
        'Approach: cnt[l][r] = cnt[l+1][r] + cnt[l][r-1] - cnt[l+1][r-1] + pal[l][r]. Fill by length (or l downward, r upward) and answer each query in O(1). O(n^2 + q).',
      ],
      solution: 'Compute pal[l][r] = (s[l] == s[r]) and (r - l < 2 or pal[l+1][r-1]) in order of increasing length. Then cnt[l][r] = cnt[l+1][r] + cnt[l][r-1] - cnt[l+1][r-1] + pal[l][r]: the palindromes inside both shorter segments are counted twice and removed once, and the whole segment is the only substring in neither. That is O(n^2) time with a 5000 × 5000 int table (100 MB, within the limit; keep pal as bool). With 10^6 queries, read and write with fast I/O or the time goes into scanf and printf.',
    },
    {
      id: '607B',
      name: 'Zuma',
      rating: 1900,
      tier: 'core',
      hints: [
        'Look at the first gemstone of a segment. It disappears in some second as part of some palindrome. Which other gemstone of the segment could sit at the opposite end of that palindrome?',
        'Recognition: interval DP on dp[l][r] = seconds to clear c[l..r]. If gem l is not removed alone, it is the outer end of a palindrome with some later gem k of the same colour; everything between them is cleared first, and the last palindrome removed there can be extended by gems l and k at no extra cost.',
        'Approach: dp[l][r] = min of 1 + dp[l+1][r]; 1 + dp[l+2][r] if c[l] = c[l+1]; and dp[l+1][k-1] + dp[k+1][r] for every k ≥ l+2 with c[k] = c[l]. Empty segments cost 0; fill by length. O(n^3) with n ≤ 500.',
      ],
      solution: 'dp[l][r] is the answer for gems l..r on their own. Gem l either goes alone (1 + dp[l+1][r]), goes with an equal neighbour (1 + dp[l+2][r]), or wraps the final palindrome of an inner block: for each k > l+1 with c[k] = c[l], clearing l+1..k-1 ends with removing one palindrome, and adding gems l and k around it keeps it a palindrome, giving dp[l+1][k-1] + dp[k+1][r]. Fill by increasing length in O(n^3). The adjacent-pair case needs its own line because its inner block is empty yet still costs one second.',
    },
    {
      id: '2B',
      name: 'The least round way',
      rating: 2000,
      tier: 'core',
      hints: [
        'Trailing zeros of a product equal min(number of factors 2, number of factors 5). Can you avoid tracking both counts at once?',
        'Recognition: run two separate min-sum grid DPs, one on the count of 2s per cell and one on the count of 5s. Every path has min(2s, 5s) ≥ min(best 2s, best 5s), and the path achieving the smaller optimum meets that bound, so the answer is the smaller of the two. The only twist is a 0 in the matrix.',
        'Approach: factor each cell into its 2s and 5s, run both DPs with parent pointers and rebuild the better path. If some cell is 0 and the result is above 1, print 1 and a path through that zero instead. O(n^2).',
      ],
      solution: 'Let A be the fewest 2s and B the fewest 5s on any path, each found by a min-sum grid DP in O(n^2); every path has at least min(A, B) trailing zeros, and the path that attains the smaller one has at most that many, so print it from parent pointers. A 0 makes the product 0, which has exactly one trailing zero: count a 0 as one 2 and one 5 in the DPs, and if a zero exists and min(A, B) > 1, print 1 with a path that goes down to the zero\'s row, right to the last column, then down. Missing the zero case, or giving a 0 no factors at all so that paths through it look free, is the usual WA.',
    },
    {
      id: '1132F',
      name: 'Clear the String',
      rating: 2000,
      tier: 'challenge',
      hints: [
        'Look at the first letter s[l] of a segment. Either it is deleted by an operation of its own, or it is deleted together with some later equal letter. What has to happen to the letters between them first?',
        'Recognition: an interval DP of the same shape as Zuma. If s[l] goes together with s[k] = s[l], the letters strictly between are cleared on their own, after which s[l] simply joins whatever operation deletes s[k] at no extra cost.',
        'Approach: dp[l][r] = min(1 + dp[l+1][r], min over k in (l, r] with s[k] = s[l] of dp[l+1][k-1] + dp[k][r]), with empty segments 0, filled by length. O(n^3) with n ≤ 500.',
      ],
      solution: 'dp[l][r] is the fewest operations to delete s[l..r]. Either s[l] is deleted alone (1 + dp[l+1][r]) or in the same operation as some s[k] = s[l], k > l: first clear l+1..k-1 independently (dp[l+1][k-1]); then s[l] is adjacent to s[k] and rides along for free, leaving dp[k][r]. Keep s[k] inside the right part (dp[k][r], not dp[k+1][r]) so it can still chain with later equal letters. O(n^3), roughly 2·10^7 steps for n = 500.',
    },
    {
      id: '1312E',
      name: 'Array Shrinking',
      rating: 2100,
      tier: 'challenge',
      hints: [
        'Every element of the final array was formed from a contiguous block of the original array. When can a block become a single element, and is the value it becomes fixed?',
        'Recognition: an interval DP followed by a prefix DP. Merging two v into v+1 keeps the sum of 2^a_i, so a block that collapses has a forced value; an interval DP finds, for every a[l..r], whether it collapses and to what. Then cut the array into the fewest collapsible blocks.',
        'Approach: val[i][i] = a[i]; val[l][r] = val[l][k] + 1 if some split k has val[l][k] = val[k+1][r] ≠ -1, else -1 (by length, O(n^3)). Then dp[0] = 0 and dp[i] = min over j < i with val[j][i-1] ≠ -1 of dp[j] + 1; print dp[n].',
      ],
      solution: 'The final array is a partition of the original into contiguous blocks, each merged down to one element. A block collapses iff its last merge joins two collapsed halves with equal values, so val[l][r] = val[l][k] + 1 for a split with val[l][k] = val[k+1][r] ≠ -1; since the sum of 2^a_i is preserved, the value does not depend on the split, and any valid split will do. A prefix DP dp[i] = min(dp[j] + 1) over collapsible blocks a[j..i-1] gives the answer dp[n]. Total O(n^3) for n ≤ 500.',
    },
  ],
};
