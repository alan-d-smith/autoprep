// LCS, edit distance and two-sequence DP: primer and problems.
export default {
  id: 'lcs',
  title: 'LCS, edit distance and two-sequence DP',
  track: 'dp',
  summary:
    'Set up dp[i][j] over prefixes of two sequences to align, count, score or edit them, and spot the hidden second sequence when it is a reverse, a permutation order or a pattern automaton.',
  primer: {
    slides: [
      {
        title: 'The longest subsequence both sequences contain',
        points: [
          'The LCS of a and b is the longest sequence both contain, in order but not necessarily adjacent.',
          'Testing every subsequence of a costs 2^n, about 10^9 already at n = 30.',
          'Greedy fails: for a = XAB and b = ABX, matching X first finds 1 instead of 2.',
        ],
        say: 'This stage compares two sequences, a with n items and b with m. The model question is the longest common subsequence (LCS): the longest sequence that both contain, its items in order but not necessarily adjacent. Testing every subsequence of a against b costs 2^n, about 10^9 already when n is 30. Matching greedily goes wrong: for a = XAB and b = ABX, matching X first leaves nothing after it for A and B, so it finds 1 instead of 2.',
      },
      {
        title: 'Look only at the last items',
        points: [
          'If a and b end with the same item, some LCS pairs them: 1 plus the LCS of the rest.',
          'If they differ, one of them is unused: take the better of dropping either last item.',
          'Either way a prefix of a meets a prefix of b, and there are only (n + 1)(m + 1) such pairs.',
        ],
        show: [0, 13],
        note: 'Equal last letters, C and C: dp[3][3] extends the diagonal, dp[2][2] + 1 = 2.',
        say: 'Look only at the last items. If a and b end with the same item, some LCS pairs those two, so the answer is 1 plus the LCS of what is left of both. If they differ, at least one of the two is not used, so the answer is the better of dropping the last item of a or the last item of b. Either way what remains is again a prefix of a against a prefix of b, and there are only (n + 1)(m + 1) such pairs.',
      },
      {
        title: 'Fill dp[i][j] row by row',
        points: [
          'dp[i][j] is the answer for `a[0..i)` and `b[0..j)`; row 0 and column 0 are 0.',
          'Equal last items give dp[i − 1][j − 1] + 1; otherwise take max(dp[i − 1][j], dp[i][j − 1]).',
          'dp[n][m] is the LCS length, and walking back from (n, m) prints one LCS.',
        ],
        show: [0, 14],
        note: 'Different last letters: dp[3][4] takes the better of the cell above and the cell to the left.',
        say: 'So let dp[i][j] be the answer for the prefixes `a[0..i)` and `b[0..j)`, the first i items of a and the first j of b; row 0 and column 0 are the empty prefixes, worth 0. Cell (i, j) compares the last items a[i − 1] and b[j − 1]: if they are equal, dp[i][j] = dp[i − 1][j − 1] + 1, otherwise dp[i][j] = max(dp[i − 1][j], dp[i][j − 1]). Filling the rows top to bottom, each left to right, has those neighbours ready in time, and dp[n][m] is the LCS length. To print an LCS, walk back from (n, m): when the two last items match, take the item and move diagonally, otherwise move to the neighbour holding the larger value.',
      },
      {
        title: 'Pairing equal last items never loses',
        points: [
          'When a[i − 1] = b[j − 1], any common subsequence can move its last pair onto them, or gain them.',
          'When they differ, pairing each with something earlier would make the pairs cross.',
          'So at least one of them is unused, and dropping it loses nothing.',
        ],
        say: 'Why the rule is right: when a[i − 1] = b[j − 1], any common subsequence of the two prefixes can have its last matched pair moved onto these two items, or gain them as a new last pair, so pairing them never loses. When they differ they cannot be paired with each other, and pairing each with something earlier would make the two pairs cross, so at least one of them is unused and dropping it loses nothing.',
      },
      {
        title: 'Edit distance uses the same table',
        points: [
          'dp[i][j] is now the fewest inserts, deletes and replacements turning `a[0..i)` into `b[0..j)`.',
          'Deleting a[i − 1] or inserting b[j − 1] costs 1; turning a[i − 1] into b[j − 1] costs 1 only if they differ.',
          'Row 0 costs j insertions and column 0 costs i deletions.',
        ],
        say: 'Edit distance, the fewest single-item inserts, deletes and replacements that turn a into b, uses the same table. dp[i][j] is now the fewest operations turning `a[0..i)` into `b[0..j)`. The three neighbours become: delete a[i − 1] (from (i − 1, j), plus 1), insert b[j − 1] (from (i, j − 1), plus 1), or turn a[i − 1] into b[j − 1] (from (i − 1, j − 1), plus 1 only if they differ). Row 0 costs j insertions and column 0 costs i deletions.',
      },
      {
        title: 'O(nm) time, two rows of memory',
        points: [
          'Both tables take O(nm) time: quick at 5000 by 5000, but a full table of int is then 100 MB.',
          'For the value alone keep two rows, `prv` and `cur`; keep the full table only to walk back.',
          'Twists change what a cell stores, and the second sequence may be hidden: the first reversed, another permutation, a pattern automaton.',
        ],
        show: [0, 32],
        note: 'The finished table: the green matches on the walk-back path spell one LCS, BCB, of length 3.',
        say: 'Both tables take O(nm) time: 2.5·10^7 cells when both lengths are 5000, which is quick, but a full table of int is then 100 MB. When only the value is needed, keep two rows, `prv` and `cur`, for O(m) memory, and keep the full table only to walk back. Twists change what a cell stores (a count, a score, a piece counter, an automaton state), not the shape of the table, and the second sequence may be hidden: the reverse of the first, the order of another permutation, or a pattern automaton.',
      },
    ],
    terms: [
      'a[i]: the item at position i of the first sequence, counting from 0; a has n items, also written |a| (the diagram calls it s and runs it down the rows).',
      'b[j]: the item at position j of the second sequence, which has m items, also written |b| (t in the diagram, along the columns).',
      '`a[0..i)`: the prefix of a made of its first i items, a[0] to a[i − 1]; `b[0..j)` is the same for b.',
      'dp[i][j]: the answer for the prefixes `a[0..i)` and `b[0..j)`, so the table has (n + 1) × (m + 1) cells and cell (i, j) looks at a[i − 1] and b[j − 1]. For LCS it is the length of a longest common subsequence; for edit distance, the fewest operations.',
      '`prv`, `cur`: the previous and current rows of the table in the rolling version, swapped after each row.',
    ],
    worked: {
      title: 'from TEAMS to MEATS',
      question:
        'You may delete any character of a string, or insert any character at any position, each at a cost of 1; replacing is not allowed. Let a be TEAMS and b be MEATS: what is the least cost to turn a into b? In the real version each string has up to 5000 characters, and only the cost is printed.',
      steps: [
        'Recognise it: the characters of a that are never deleted must match, in order, characters of b that are never inserted, so they form a common subsequence. Keeping k characters costs (n − k) deletions plus (m − k) insertions, so the answer is n + m − 2·LCS(a, b). Trying every set of kept characters is 2^n, and greedy matching keeps too few: T grabs the T of MEATS, after which only S still fits, so it keeps 2.',
        'Model it: dp[i][j] is the LCS length of `a[0..i)` and `b[0..j)`, with row 0 and column 0 all 0. If a[i − 1] = b[j − 1] then dp[i][j] = dp[i − 1][j − 1] + 1, otherwise dp[i][j] = max(dp[i − 1][j], dp[i][j − 1]).',
        'Fill it row by row, with the columns M, E, A, T, S: row T is 0, 0, 0, 1, 1; row E is 0, 1, 1, 1, 1; row A is 0, 1, 2, 2, 2; row M is 1, 1, 2, 2, 2; row S is 1, 1, 2, 2, 3. So dp[5][5] = 3.',
        'Walk back from (5, 5) to see what is kept. S = S, so keep S and move to (4, 4). There M ≠ T and the cell above holds 2, as much as the cell to the left, so move up to (3, 4); there A ≠ T and the cell above holds 1, less than the 2 to the left, so move left to (3, 3). A = A and then E = E are kept, and at (1, 1) T ≠ M sends the walk to row 0, where it stops. The kept characters are E, A, S.',
        'Answer: 5 + 5 − 2·3 = 4. Delete T and M, then insert M at the front and T before the S, so TEAMS becomes EAMS, EAS, MEAS and then MEATS. The table is O(nm), 2.5·10^7 cells at full size, and only the cost is printed, so two rolling rows of int, O(m) memory, are enough; printing the operations would need the full table to walk back.',
      ],
    },
    spot: [
      'Two strings or arrays of length up to about 5000, and the statement talks about subsequences, matching, aligning, merging or interleaving them.',
      'Operations insert, delete and replace, or "fewest characters to change or remove so that A becomes B".',
      'A score that rewards matched characters and penalises unmatched ones, often over substrings rather than whole strings.',
      'Palindromes, or a process that grows outwards from a point: compare the sequence with its own reverse.',
    ],
    disguises: [
      'Fewest deletions from both strings to make them equal → |a| + |b| − 2·LCS(a, b).',
      'Fewest insertions to make a string a palindrome, or the longest palindromic subsequence → LCS of the string and its reverse.',
      'Longest common subsequence of several permutations → a common subsequence is a chain in the order "x before y in every permutation", so it is a longest path in a DAG; with two permutations, relabel by positions and it becomes LIS.',
      'Longest common subsequence that must avoid (or contain) a pattern P → add a third index, the KMP automaton state: how much of P the chosen characters currently end with.',
    ],
    pitfalls: [
      'Off-by-one between table and string indices: with an (n+1)×(m+1) table, cell (i, j) compares a[i−1] with b[j−1], and row 0 and column 0 are the empty-prefix base cases (0 for LCS, i or j for edit distance).',
      'Substring versus subsequence: for substrings a mismatch resets the cell (to 0 or −∞) instead of inheriting max(dp[i−1][j], dp[i][j−1]), and "best over all substring pairs" is the maximum over every cell, not dp[n][m].',
      'Memory: a 5000×5000 int table is 100 MB. Keep two rows when you only need the value, and the full table only when you must walk back to reconstruct the answer.',
    ],
    code: `// dp[i][j] = answer for the prefixes a[0..i) and b[0..j). LCS, rebuilt by walking the table back.
string lcs(const string& a, const string& b) {
    int n = a.size(), m = b.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] + 1
                                            : max(dp[i - 1][j], dp[i][j - 1]);
    string res;
    for (int i = n, j = m; i > 0 && j > 0;) {
        if (a[i - 1] == b[j - 1]) { res += a[i - 1]; i--; j--; }
        else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
        else j--;
    }
    reverse(res.begin(), res.end());
    return res;
}

// Edit distance (insert, delete, replace all cost 1) with two rolling rows: O(nm) time, O(m) memory.
int editDistance(const string& a, const string& b) {
    int n = a.size(), m = b.size();
    vector<int> prv(m + 1), cur(m + 1);
    iota(prv.begin(), prv.end(), 0);  // from an empty prefix of a: j inserts
    for (int i = 1; i <= n; i++) {
        cur[0] = i;                   // to an empty prefix of b: i deletes
        for (int j = 1; j <= m; j++)
            cur[j] = min({prv[j - 1] + (a[i - 1] != b[j - 1]), prv[j] + 1, cur[j - 1] + 1});
        swap(prv, cur);
    }
    return prv[m];
}`,
    resources: [
      { label: 'USACO Guide: Paths on grids (includes LCS)', url: 'https://usaco.guide/gold/paths-grids' },
      { label: 'CSES: Edit Distance', url: 'https://cses.fi/problemset/task/1639' },
      { label: 'CSES: Longest Common Subsequence', url: 'https://cses.fi/problemset/task/3403' },
      { label: 'CP-Algorithms: Prefix function and the KMP automaton', url: 'https://cp-algorithms.com/string/prefix-function.html' },
    ],
  },
  problems: [
    {
      id: '2050E',
      name: 'Three Strings',
      rating: 1500,
      tier: 'warmup',
      hints: [
        'Every prefix of c was built from some prefix of a and some prefix of b. If c[0..i+j) used exactly i characters of a and j of b, where can its last character have come from?',
        'This is a two-sequence DP over prefixes, shaped like edit distance: the state (i, j) says how much of a and b is used, which fixes the position i + j − 1 in c. The "until one runs out" rule changes nothing, since appending the rest of the other string is also an interleaving.',
        'dp[i][j] = fewest changed characters in c[0..i+j) = min(dp[i−1][j] + [a[i−1] ≠ c[i+j−1]], dp[i][j−1] + [b[j−1] ≠ c[i+j−1]]), with dp[0][0] = 0. Answer dp[|a|][|b|], O(|a|·|b|) per test.',
      ],
      solution:
        'Let dp[i][j] be the fewest changes so that c[0..i+j) is an interleaving of a[0..i) and b[0..j). The last character c[i+j−1] came either from a[i−1] (cost 1 if it differs) or from b[j−1], so take the minimum of those two transitions, guarding i > 0 and j > 0 on the borders. The answer is dp[|a|][|b|]; the length limits keep the total work across tests to about 2·10⁶ cells. Greedily matching c against whichever string fits fails when a and b offer the same letter.',
    },
    {
      id: '163A',
      name: 'Substring and Subsequence',
      rating: 1700,
      tier: 'warmup',
      hints: [
        'Fix where the substring x ends in s and where the subsequence y takes its last character in t. What must hold for the characters of x and y before those?',
        'It is LCS-style counting over prefixes with an asymmetry: x is contiguous, so its previous character is exactly s[i−1], while the previous character of y can be at any earlier position of t. So the state should mean "x ends exactly at s[i]" and "y lies inside t[1..j]".',
        'Let f[i][j] count pairs whose substring ends exactly at s[i] and whose subsequence uses only t[1..j]. Then f[i][j] = f[i][j−1] + (s[i] = t[j] ? 1 + f[i−1][j−1] : 0). Answer Σᵢ f[i][|t|] mod 10⁹+7, in O(|s|·|t|) with two rows.',
      ],
      solution:
        'Define f[i][j] as the number of pairs whose substring ends exactly at s[i] and whose subsequence uses positions of t up to j. Either the subsequence does not use t[j] (f[i][j−1]), or it ends at t[j], which needs s[i] = t[j]: then it is the one-letter pair (s[i], t[j]) or it extends any pair counted in f[i−1][j−1]. Sum f[i][|t|] over all i. That is 25·10⁶ cells, so keep two int rows and reduce modulo 10⁹+7 at every step. Letting the s index also mean "anywhere inside s[1..i]" counts subsequences of s as well and overcounts; the second sample exposes it.',
    },
    {
      id: '1446B',
      name: 'Catching Cheaters',
      rating: 1800,
      tier: 'core',
      hints: [
        'Read the score 4·LCS − |C| − |D| one character at a time along the alignment: what does a matched pair contribute, and what does a character left unmatched in C or D contribute?',
        'A matched pair adds 4 − 1 − 1 = +2 and every unmatched character costs −1, so this is LCS with scores over substrings (local alignment). Substrings mean you may start fresh anywhere with score 0 and stop anywhere, taking the best cell.',
        'Let dp[i][j] be the best score of substrings ending at A[i] and B[j]: dp[i][j] = max(0, dp[i−1][j] − 1, dp[i][j−1] − 1, dp[i−1][j−1] + 2 if A[i] = B[j]). The answer is the maximum over all cells, O(nm).',
      ],
      solution:
        'For fixed C and D the score equals the best alignment value with +2 per matched pair and −1 per other character, so maximising over substrings and alignments together gives the answer. dp[i][j] = best value over substrings ending at A[i] and B[j]: leave A[i] or B[j] unmatched (−1 from the left or upper cell), match them when equal (+2 from the diagonal), or start empty (0). Output the maximum over all cells, not dp[n][m]. 2.5·10⁷ cells run fast; two rolling rows keep memory small.',
    },
    {
      id: '1114D',
      name: 'Flood Fill',
      rating: 1900,
      tier: 'core',
      hints: [
        'First merge runs of equal colours, so neighbouring squares always differ. The component grows outwards from the starting square; when can one turn swallow a new run on both sides at once?',
        'With m runs you need m − 1 absorptions, and a turn takes two runs exactly when the runs bordering the component on the left and right have the same colour. Those saved pairs are nested around the start, so they form a palindromic subsequence: this is LCS of the run sequence with its own reverse.',
        'Compress to m runs, compute L = LCS(a, reverse(a)) in O(m²) with rolling rows, and answer m − 1 − ⌊L/2⌋.',
      ],
      solution:
        'After compressing equal neighbours into m runs, every turn absorbs at least one run, and absorbs one on each side exactly when the two bordering runs share a colour. The double turns pair up equal colours nested around the starting run, i.e. a palindromic subsequence, and L = LCS(a, reverse a) is the longest one. All ⌊L/2⌋ of its pairs can be used, because after compression the innermost equal pair is never adjacent, so a starting run fits between them. Answer m − 1 − ⌊L/2⌋ in O(m²). Skipping the compression breaks inputs such as 3 3 3, whose answer is 0.',
    },
    {
      id: '463D',
      name: 'Gargari and Permutations',
      rating: 1900,
      tier: 'core',
      hints: [
        'Each permutation contains every number exactly once. For two numbers x and y, when can y come right after x in a common subsequence?',
        'y can follow x exactly when x is before y in all k permutations. That relation has no cycles, so the longest common subsequence is a longest path in a DAG on n vertices, not a k-dimensional LCS table.',
        'Store pos[t][v] for every permutation. Walk the first permutation in order and set dp[v] = 1 + max dp[u] over earlier u with pos[t][u] < pos[t][v] for every t. O(n²·k), about 5·10⁶ checks.',
      ],
      solution:
        'Record the position of each number in every permutation. A sequence is a common subsequence exactly when every consecutive pair (x, y) has x before y in all k permutations, so the answer is the longest path in that DAG. The first permutation is a topological order of it, so dp[i] = 1 + max dp[j] over j < i in the first permutation whose number precedes perm[0][i] in every other permutation. Answer max dp, O(n²k). A k-dimensional LCS table would have 1000⁵ cells; each value appearing once keeps the problem small.',
    },
    {
      id: '682D',
      name: 'Alyona and Strings',
      rating: 1900,
      tier: 'core',
      hints: [
        'Forget k for a moment: with any number of pieces of any length, what is the maximum total length? Then ask what extra information a cell needs so you can count pieces.',
        'Without k this is plain LCS. With k, add a third index c = pieces used so far, and separate "piece c ends exactly at s[i] and t[j]" (the next equal pair may extend it, keeping c) from "the best anywhere inside these prefixes".',
        'end[c][i][j] = 1 + max(end[c][i−1][j−1], best[c−1][i−1][j−1]) if s[i] = t[j], else −∞; best[c][i][j] = max(best[c][i−1][j], best[c][i][j−1], end[c][i][j]). Answer best[k][n][m], O(nmk) ≈ 10⁷.',
      ],
      solution:
        'Keep two tables per piece count c: end[c][i][j], the best total when piece c finishes exactly with s[i] and t[j], and best[c][i][j], the best total within s[1..i] and t[1..j]. An equal pair either extends the current piece (end[c][i−1][j−1]) or opens piece c after the best placement of c − 1 pieces (best[c−1][i−1][j−1]); best then also allows skipping a character of s or t. Answer best[k][n][m] in O(nmk). Initialise everything to −∞ except best[0][·][·] = 0, otherwise fewer than k pieces sneak in; rolling the i dimension keeps memory to a few small arrays.',
    },
    {
      id: '346B',
      name: 'Lucky Common Subsequence',
      rating: 2000,
      tier: 'challenge',
      hints: [
        'A plain LCS table does not know which letters were chosen last, so it cannot tell whether the next letter completes the virus. What is the smallest summary of the chosen letters that answers that question?',
        'The summary is the KMP state: the length of the longest prefix of the virus that is a suffix of the subsequence built so far. Add it as a third index of the LCS DP and forbid any transition that reaches state |virus|.',
        'Build the automaton go[state][letter] from the prefix function. f[i][j][s] = longest valid continuation from s1[i..], s2[j..] in state s = max(f[i+1][j][s], f[i][j+1][s], 1 + f[i+1][j+1][go[s][c]] when s1[i] = s2[j] = c and go[s][c] < |virus|). Answer f[0][0][0] over about 10⁶ states, then walk the table to print it.',
      ],
      solution:
        'Precompute the prefix function of the virus and go[s][c], the state after appending letter c in state s. Fill f[i][j][s] over suffixes so that reconstruction walks forwards from (0, 0, 0): take the common letter when s1[i] = s2[j], the new state is below |virus| and the value matches, otherwise step i or j to a cell with the same value. Print 0 if the best length is 0. Tracking only "how many virus letters are matched" without failure links is the common bug: for virus AAB, after AAA the state is still 2, not reset to 0 or 1.',
    },
    {
      id: '56D',
      name: 'Changing a String',
      rating: 2100,
      tier: 'challenge',
      hints: [
        'The minimum number of moves is a standard table; the new part is printing moves whose positions are valid when each is applied. In what order can you emit them so that earlier moves never shift the positions used by later ones?',
        'This is edit distance with reconstruction. Walking the table back from (|s|, |t|) and printing each operation as you meet it edits the string from right to left, so positions 1..i still hold the original s[1..i].',
        'dp[i][j] = min(dp[i−1][j−1] + [s[i] ≠ t[j]], dp[i−1][j] + 1, dp[i][j−1] + 1). Backtrack from (n, m): skip free diagonal steps, otherwise print REPLACE i t[j], DELETE i or INSERT i+1 t[j] for the transition taken. O(nm) with the full table.',
      ],
      solution:
        'Fill the standard edit distance table over prefixes, keeping all 1001×1001 cells. Backtrack from (|s|, |t|): a diagonal step with equal letters is free, a diagonal step costing 1 is REPLACE i t[j], coming from (i−1, j) is DELETE i, and coming from (i, j−1) is INSERT i+1 t[j]. Printed in backtrack order, every later move sits at a position ≤ i, left of everything already changed, so its index refers to the untouched original prefix. Positions are 1-based; INSERT i+1 with i = |s| appends at the end, which the statement allows.',
    },
  ],
};
