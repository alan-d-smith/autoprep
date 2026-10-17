// Topological sort and DAG DP: primer and problems.
export default {
  id: 'topo',
  title: 'Topological sort and DAG DP',
  track: 'graphs',
  summary: 'Turn "x before y" constraints into a directed graph, find an order or prove none exists, and run DP along that order for longest paths, path counts and minimal layer numbers.',
  primer: {
    slides: [
      {
        title: 'Rules that say x before y',
        points: [
          'Prerequisites, dependencies and unknown alphabets give rules "x must come before y".',
          'The task: an order obeying every rule, proof that none exists, or a value computed along the rules.',
          'Trying orders is hopeless (26 letters have about 4·10^26); label order needn\'t obey the rules, and re-sweeping them can take 10^10 steps.',
        ],
        say: 'Some statements hand you rules of the form "x must come before y": prerequisites, dependencies, a list sorted under an unknown alphabet. They ask for an order that obeys every rule, or a proof that none exists, or something computed along the rules, such as the longest chain or the number of routes from a start. Trying orders one by one is hopeless: 26 letters can be ordered in about 4·10^26 ways. A computation along the rules must handle each item after everything that has to precede it, and input order or label order does not promise that. Sweeping over all the rules until nothing changes can take n sweeps, about 10^10 steps for n = 10^5 items and m = 10^5 rules.',
      },
      {
        title: 'Without a cycle, something can go first',
        points: [
          'Each rule "x before y" is an edge x → y; a topological order has every edge pointing forward.',
          'One exists exactly when there is no cycle: on a cycle, each vertex would have to precede itself.',
          'With no cycle, some vertex has no incoming edges: otherwise walking backwards would repeat a vertex and close a cycle. It goes first.',
        ],
        show: [0, 0],
        note: 'b and e have no incoming edges, so Kahn\'s queue starts with them; a, first in the alphabet, must wait for both.',
        say: 'Make each item a vertex and each rule "x before y" a directed edge x → y. An order of the vertices in which every edge points forward is a topological order, and one exists exactly when the graph has no cycle: on a cycle, each vertex would have to come before itself. A graph without a cycle always has a vertex with no incoming edges, because walking backwards along incoming edges would otherwise repeat a vertex within n steps and close a cycle. Such a vertex can safely go first.',
      },
      {
        title: 'Kahn\'s algorithm places ready vertices',
        points: [
          'Keep adj[v], indeg[v] (edges in from unplaced vertices) and a queue `q` of vertices whose `indeg` is 0.',
          'Pop v, append it to `order`, and for each u in adj[v] decrease indeg[u], pushing u when it reaches 0.',
          'Each vertex and edge is handled once: O(n + m). Reversed DFS finishing order also works.',
        ],
        show: [0, 5],
        note: 'Placing e deletes e → a and e → c (b → a went when b was placed), so a and c reach in 0 and join the queue.',
        say: 'Kahn\'s algorithm applies that observation over and over. Keep adj[v], the vertices that v has an edge to; indeg[v], the number of edges into v from vertices not yet placed; and a queue q of the vertices whose indeg has reached 0. Pop a vertex v, append it to `order`, and delete its outgoing edges: for each u in adj[v], decrease indeg[u] and push u when it reaches 0. Each vertex and each edge is handled once, so this is O(n + m). Listing the vertices in reverse order of when a DFS finishes them also gives a topological order.',
      },
      {
        title: 'Fewer than n placed means a cycle',
        points: [
          'A vertex is placed only after every vertex pointing into it, so every edge points forward.',
          'Removing a vertex from a graph with no cycle still leaves no cycle, so another vertex is ready and the queue never runs dry early.',
          'On a cycle no vertex reaches `indeg` 0, nor does anything after it: `order` ends short, the "impossible" or −1 case.',
        ],
        show: [0, 16],
        note: 'All 7 vertices placed, in the order b, e, a, c, g, d, f, with every edge pointing forward; alphabetical order would break b → a.',
        say: 'Why it works: a vertex enters `order` only once all its incoming edges are deleted, that is, after every vertex that points into it, so every edge points forward. Removing a vertex from a graph with no cycle leaves a graph that still has no cycle, so by the observation another vertex is always ready, the queue never runs dry early, and all n vertices are placed. With a cycle, no vertex on it ever reaches indeg 0, and neither does anything reachable from it, so `order` ends with fewer than n vertices: that is the "impossible", −1 or "infinite" case.',
      },
      {
        title: 'One DP pass along the order',
        points: [
          'Visit each v in `order` and push its value along each edge v → u.',
          'len[u] = max(len[u], len[v] + 1) gives the longest path ending at u; ways[u] += ways[v] counts paths from `src`.',
          'Everything pointing into u comes earlier, so u\'s value is final before u passes it on.',
        ],
        say: 'Once you have `order`, any DP whose transitions follow edges takes one pass over it. Visit each v in `order` and push its value along each edge v → u: len[u] = max(len[u], len[v] + 1) gives the longest path, counted in edges, ending at u, and ways[u] += ways[v] (mod 10^9 + 7) counts the paths from a start vertex `src`. Every vertex that points into u comes earlier in `order`, so u\'s value is final before u passes it on, the same argument as the children-first pass on a rooted tree.',
      },
      {
        title: 'Vary what the pass pushes along edges',
        points: [
          'Costs of 0 or 1 per edge count rounds. After merging equal items with DSU, the smallest values obeying every a < b are longest-path layers.',
          'Shortest paths from `src`: start at 0 there and ∞ elsewhere, skip vertices still at ∞, and push min instead of max. Negative weights are fine.',
          'A min-heap in place of the queue gives the lexicographically smallest order, in O((n + m) log n).',
        ],
        say: 'Each pass is O(n + m). The variations change what is pushed along an edge, and sometimes where the values start. A cost of 0 or 1 per edge counts passes or rounds. Once the items that must be equal are merged with DSU, the smallest values that satisfy every rule a < b are longest-path layers. For shortest paths from `src` in a DAG, start with 0 at `src` and infinity everywhere else, skip any vertex still at infinity when its turn comes, and push min instead of max; negative weights are fine, because a vertex is only used once everything before it is final. A min-heap in place of the queue gives the lexicographically smallest order, in O((n + m) log n).',
      },
    ],
    terms: [
      'adj[v]: the vertices u with an edge v → u, that is, the items that v must come before (`gr` in the TRD version).',
      'indeg[v]: how many edges into v come from vertices not yet placed; v can be placed once it is 0 (in[v] in the diagram).',
      '`q`: the queue of vertices whose indeg has reached 0 and that wait to be placed (in the TRD version\'s `topoSort`, one list `q` is both the queue and the returned order).',
      '`order`: the topological order, the vertices in the order Kahn\'s algorithm removes them; it has fewer than n entries exactly when the graph has a cycle (returned by `topoSort` in the TRD version).',
      'len[v]: the most edges on any path that ends at v (`dp` in the TRD version\'s `longestPath`).',
      'ways[v]: the number of paths from `src` to v, mod 10^9 + 7.',
      '`src`: the start vertex; ways[v] counts the paths that begin there.',
    ],
    worked: {
      problem: { source: 'kattis', id: 'brexitnegotiations', name: 'Brexit Negotiations', difficulty: '5.3' },
      slides: [
        {
          title: 'Each meeting starts with a longer recap',
          points: [
            'n ≤ 4·10^5 topics, each settled in its own meeting, one at a time. Topic i needs e_i minutes and lists topics that must come before it.',
            'A meeting first spends a minute recapping each earlier meeting, so the meeting at position pos, from 0, lasts e_i + pos.',
            'The rules have no cycle. Print the least possible length of the longest meeting, over all orders that obey them.',
          ],
          say: 'There are n topics, up to 4·10^5, each settled in its own meeting, one meeting at a time. Topic i needs e_i minutes, up to 10^6, and lists the topics that must be discussed before it. There are at most 4·10^5 such rules, and they have no cycle. Each meeting starts with a recap of one minute per meeting already held, so the meeting at position pos, counting from 0, lasts e_i + pos. Print the shortest possible length of the longest meeting, over all orders that obey the rules.',
        },
        {
          title: 'Longest first, from the front, can fail',
          points: [
            'Trying orders is hopeless: 10 topics with no rules already have 10! ≈ 3.6·10^6 orders.',
            'Holding the longest ready topic next fails: if A (1) must precede B (100), and C takes 50, it runs C, A, B, and B lasts 102.',
            'The order A, B, C does better: B lasts 101 and C lasts 52.',
          ],
          say: 'Trying every order is hopeless: 10 topics with no rules can already be ordered in 10!, about 3.6·10^6, ways. A natural greedy goes from the front and always holds the longest ready topic next, since later meetings carry more recap. It fails. Say topic A takes 1 minute and must come before B, which takes 100, and C takes 50. The ready topics are A and C, so the greedy holds C first, then A, then B, which lasts 100 + 2 = 102. The order A, B, C does better: B lasts 101 and C lasts 52. From the front, the greedy cannot see the long topic waiting behind a short one.',
        },
        {
          title: 'Decide the last meeting first',
          points: [
            'The rules ask for a topological order. The last meeting has the largest recap, n − 1 minutes, so choose it first.',
            'The last topic must be one that no other topic needs. Among those, put the shortest last.',
            'If an optimal order ends with topic s, but a shorter topic t that nothing needs comes earlier, moving t to the end keeps the rules and makes no meeting longer.',
          ],
          say: 'An order that obeys "this before that" rules is a topological order, so the question is which ready topic goes where. The recap grows with position, and the last meeting has the largest, n − 1 minutes, so decide it first. The last topic must be one that no other topic needs, and among those, put the shortest last. Suppose an optimal order ends with such a topic s, while a shorter one, t, comes earlier. Move t to the end. Nothing needs t, so the order still obeys the rules. Every meeting after t\'s old place moves one slot earlier and gets a minute shorter, and t now lasts e_t + n − 1, less than s did. So the longest meeting does not grow, and the same choice repeats for the n − 1 topics left.',
        },
        {
          title: 'Kahn\'s algorithm on the reversed rules',
          points: [
            'Reverse every rule: adj[v] lists the topics v needs first, and indeg[b] counts the unplaced topics that need b.',
            'Topics with indeg 0 wait in q, a min-heap by e. Fill pos from n − 1 down to 0, each with the topic popped from q.',
            'Placing v deletes its arrows: each b in adj[v] loses 1 from indeg[b] and joins q at 0. The answer is the largest e_v + pos.',
          ],
          show: [0, 0],
          note: 'Sample 2 at the start: no topic needs 1 or 6, so they wait in q. Each arrow points to a topic that must come earlier.',
          say: 'This is Kahn\'s algorithm run backwards. Reverse every rule: adj[v] lists the topics that v needs first, and indeg[b] counts the unplaced topics that need b. A topic with indeg 0 can take the latest free position, so it waits in q, a min-heap ordered by e. Fill the positions from n − 1 down to 0, each time with the topic popped from q, and record e_v + pos. Placing v deletes its arrows: each b in adj[v] loses 1 from indeg[b], and joins q when it reaches 0. The answer is the largest e_v + pos.',
        },
        {
          title: 'Sample 2: the last two meetings',
          points: [
            'q holds 1 (e 2) and 6 (e 4), so 1 takes pos 5 and lasts 2 + 5 = 7. Putting 6 there would cost 4 + 5 = 9.',
            'Deleting 1\'s arrows lowers indeg[4] and indeg[3] to 1, so only 6 is ready.',
            '6 takes pos 4 and lasts 4 + 4 = 8. Its arrow to 3 was the last one into 3, so 3 joins q.',
          ],
          show: [0, 2],
          note: 'After two steps: 1 and 6 hold the last two positions, and 3, now needed by no unplaced topic, waits in q.',
          say: 'In sample 2, no topic needs topic 1 or topic 6, so q starts with both. Topic 1 is shorter, so it takes pos 5 and lasts 2 + 5 = 7; putting 6 there instead would cost 4 + 5 = 9. Deleting 1\'s arrows lowers indeg[4] and indeg[3] to 1, so only 6 is ready. It takes pos 4 and lasts 4 + 4 = 8. Deleting its arrow to 3 brings indeg[3] to 0, and 3 joins q.',
        },
        {
          title: 'Sample 2: the shorter ready topic goes later',
          points: [
            'Topic 3 takes pos 3 and lasts 1 + 3 = 4. Deleting its arrows frees both 2 and 4.',
            'q holds 4 (e 3) and 2 (e 4). The shorter, 4, takes pos 2 and lasts 3 + 2 = 5.',
            'Then 2 takes pos 1 and lasts 4 + 1 = 5, and 5 takes pos 0 and lasts 2.',
          ],
          show: [0, 4],
          note: 'Mid-run: 4 has taken pos 2 ahead of the longer 2, which waits in q for pos 1.',
          say: 'Topic 3 takes pos 3 and lasts 1 + 3 = 4. Deleting its arrows frees both 2 and 4, so q holds 4, with e = 3, and 2, with e = 4. The shorter, 4, takes pos 2 and lasts 3 + 2 = 5. Then 2 takes pos 1 and lasts 4 + 1 = 5, which frees topic 5, and 5 takes pos 0 and lasts 2 + 0 = 2.',
        },
        {
          title: 'The longest meeting lasts 8',
          points: [
            'The order is 5, 2, 4, 3, 6, 1, and the meetings last 2, 5, 5, 4, 8 and 7 minutes: the answer is 8, as in the sample.',
            'With m rules, each topic enters and leaves q once and each rule is handled once: O((n + m) log n).',
            'Ready topics with equal e can go in either order. Lengths stay below 1.4·10^6, so int is enough.',
          ],
          show: [0, 7],
          note: 'The end: topic 6, at pos 4, has the longest meeting, 8 minutes.',
          say: 'The order is 5, 2, 4, 3, 6, 1, and the meetings last 2, 5, 5, 4, 8 and 7 minutes, so the answer is 8, as in the sample. With m rules, every topic enters and leaves the heap once and every rule is handled once, so the run is O((n + m) log n). When two ready topics have the same e, either can go later. Lengths stay below 1.4·10^6, so int is enough.',
        },
      ],
    code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    scanf("%d", &n);
    vector<int> e(n + 1), indeg(n + 1, 0);
    vector<vector<int>> adj(n + 1);  // reversed rules: adj[v] lists the topics that must come before v
    for (int v = 1; v <= n; v++) {
        int d;
        scanf("%d %d", &e[v], &d);
        while (d--) {
            int b;
            scanf("%d", &b);
            adj[v].push_back(b);
            indeg[b]++;
        }
    }
    // Kahn's algorithm from the last meeting back; among the ready topics, the shortest goes last.
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> q;
    for (int v = 1; v <= n; v++) if (indeg[v] == 0) q.push({e[v], v});
    int ans = 0;
    for (int pos = n - 1; pos >= 0; pos--) {
        auto [ev, v] = q.top(); q.pop();
        ans = max(ans, ev + pos);
        for (int u : adj[v]) if (--indeg[u] == 0) q.push({e[u], u});
    }
    printf("%d\\n", ans);
}`,
    },
    spot: [
      'The statement gives pairwise constraints: "a must come before b", "x is smaller than y", prerequisites, dependencies, or a list that is sorted under some unknown order.',
      'You must answer "impossible", -1 or "infinite" when the requirements contradict each other or a walk could repeat forever: that is cycle detection.',
      'The graph is promised to be acyclic ("no cyclic routes", "a task never depends on itself") and you want the best or the number of paths.',
      'You must give items the smallest ranks, levels or values that respect a set of < and = relations.',
    ],
    disguises: [
      'Find an alphabet or ranking under which a given list is sorted → compare neighbouring items; each first difference gives one edge "x before y", and any topological order of the letters is an answer.',
      'How many passes, rounds or semesters until everything is done → longest path in the dependency DAG, where an edge costs 1 when it forces a new pass and 0 otherwise.',
      'Assign the smallest positive values satisfying a < b and a = b → merge the = groups with DSU, then a group\'s value is 1 + the longest chain of < edges ending at it; a cycle, or a < inside one group, means no assignment.',
      'Orient undirected edges, or choose which edges to keep, so that no cycle appears → fix one vertex order (a topological order of the forced edges) and point everything forward in it; edges that all go forward in one order can never form a cycle.',
    ],
    pitfalls: [
      'Not checking for a cycle: after Kahn\'s algorithm, compare the number of removed vertices with n. With DFS you need three colours (unvisited, on the stack, finished); a plain visited flag cannot tell a back edge from a harmless cross edge.',
      'Running the DP in input order or vertex-number order, or starting Kahn\'s algorithm only from the source: start from every vertex with in-degree 0, or vertices fed by unreachable ones are never processed.',
      'In "sorted under some order" problems, a word followed by its own proper prefix ("care" before "car") can never be sorted, and it produces no letter edge, so it must be checked separately.',
    ],
    code: `// Kahn's algorithm on vertices 0..n-1. Returns a topological order;
// if it has fewer than n vertices, the graph has a cycle.
vector<int> topoOrder(const vector<vector<int>>& adj) {
    int n = adj.size();
    vector<int> indeg(n, 0), order;
    for (int v = 0; v < n; v++)
        for (int u : adj[v]) indeg[u]++;
    queue<int> q;  // a min-heap here gives the lexicographically smallest order
    for (int v = 0; v < n; v++) if (indeg[v] == 0) q.push(v);
    while (!q.empty()) {
        int v = q.front(); q.pop();
        order.push_back(v);
        for (int u : adj[v]) if (--indeg[u] == 0) q.push(u);
    }
    return order;
}

// DAG DP along the order: longest path (in edges) ending at each vertex,
// and the number of paths from src, mod 1e9+7. Returns false on a cycle.
bool dagDP(const vector<vector<int>>& adj, int src, vector<int>& len, vector<long long>& ways) {
    const long long MOD = 1e9 + 7;
    int n = adj.size();
    vector<int> order = topoOrder(adj);
    if ((int)order.size() < n) return false;
    len.assign(n, 0);
    ways.assign(n, 0);
    ways[src] = 1;
    for (int v : order)  // every predecessor of v is final before v is used
        for (int u : adj[v]) {
            len[u] = max(len[u], len[v] + 1);
            ways[u] = (ways[u] + ways[v]) % MOD;
        }
    return true;
}`,
    resources: [
      { label: 'CP-Algorithms: Topological sorting', url: 'https://cp-algorithms.com/graph/topological-sort.html' },
      { label: 'USACO Guide: Topological sort (with DAG DP)', url: 'https://usaco.guide/gold/toposort' },
      { label: 'CP-Algorithms: Finding a cycle', url: 'https://cp-algorithms.com/graph/finding-cycle.html' },
      { label: 'CSES: Longest Flight Route (longest path with reconstruction)', url: 'https://cses.fi/problemset/task/1680' },
    ],
  },
  problems: [
    {
      id: '510C',
      name: 'Fox And Names',
      rating: 1600,
      tier: 'warmup',
      hints: [
        'Two neighbouring names in a sorted list tell you something only at their first differing position. What does "rivest" before "shamir" say about the alphabet?',
        'Each neighbouring pair gives at most one constraint "letter x comes before letter y". You need an order of the 26 letters that respects all of them, which is a topological order of a 26-vertex graph; a cycle in that graph means Impossible.',
        'For each i, find the first position k where name[i] and name[i+1] differ and add the edge name[i][k] → name[i+1][k]. If there is no such position and name[i] is the longer one, print Impossible at once. Run Kahn\'s algorithm on the letters: fewer than 26 removed means Impossible, otherwise print the removal order.',
      ],
      solution: 'Only adjacent names need comparing, since lexicographic order is transitive. Each adjacent pair contributes the edge name[i][k] → name[i+1][k] at its first differing position k; when one name is a prefix of the other there is no edge, but a longer name followed by its own prefix ("care" then "car") is Impossible under any alphabet, which is the case most wrong answers miss. Kahn\'s algorithm on the 26 letters then gives a valid alphabet, or stops early on a cycle. O(total length + 26²).',
    },
    {
      id: '919D',
      name: 'Substring',
      rating: 1700,
      tier: 'warmup',
      hints: [
        'When can the value be arbitrarily large? And once you rule that out, what kind of graph is left?',
        'Any cycle (a self-loop counts) can be walked around forever, so its letters repeat without bound and the answer is -1. Otherwise the graph is a DAG, and the best path in a DAG is DP over a topological order. You do not know which letter wins, so track all 26.',
        'Run Kahn\'s algorithm; if not all n nodes are removed, print -1. Keep dp[v][c] = the most occurrences of letter c on a path ending at v: when v is removed, add 1 to dp[v][s[v]], then for each edge v → u set dp[u][c] = max(dp[u][c], dp[v][c]) for all c. The answer is the largest entry, O(26·(n + m)).',
      ],
      solution: 'If the graph has a cycle the answer is -1; Kahn\'s algorithm detects it, including self-loops x → x, because those nodes never reach in-degree 0. In a DAG, fixing the letter c turns the question into a longest path that counts nodes labelled c, so dp[v][c] for all 26 letters at once, filled in topological order, gives the answer in O(26·(n + m)) time and 26·n ints of memory. Multiple edges and disconnected parts need no special handling.',
    },
    {
      id: '721C',
      name: 'Journey',
      rating: 1800,
      tier: 'core',
      hints: [
        'There are two quantities: showplaces visited (to maximise) and time spent (at most T). Times go up to 10^9, so they cannot be a DP index, but the number of showplaces is at most 5000.',
        'Swap the roles: for each showplace v and count k, store the least time needed to stand at v having visited exactly k showplaces. The roads form a DAG, so this table fills in topological order, each road turning a k-showplace route into a (k+1)-showplace route.',
        'Set dp[1][1] = 0. For v in topological order and each road v → u with time t, set dp[u][k+1] = min(dp[u][k+1], dp[v][k] + t) and record par[u][k+1] = v. The answer is the largest k with dp[n][k] ≤ T; follow par back from (n, k) to print the route. O(n·(n + m)).',
      ],
      solution: 'dp[v][k] = least time to reach showplace v from 1 visiting k showplaces, filled in a topological order of the whole graph (start Kahn\'s algorithm from every in-degree-0 vertex, not only from 1; states unreachable from 1 stay infinite). Along every road v → u, set dp[u][k+1] = min(dp[u][k+1], dp[v][k] + t) and store the parent, then take the largest k with dp[n][k] ≤ T and walk the parents back. The trap is memory: 5001² entries are 100 MB as int, so store times as int (compute the sum in 64 bits and keep it only if ≤ T) and parents as short to stay under 256 MB. Time O(n·(n + m)) ≈ 5·10^7.',
    },
    {
      id: '1572A',
      name: 'Book',
      rating: 1800,
      tier: 'core',
      hints: [
        'Chapter i can be understood in the same reading as a required chapter j only if j appears earlier in the book. What happens when j > i?',
        'Treat each requirement as an edge j → i that costs 0 if j < i and 1 if j > i (you must wait for the next reading). The reading in which chapter i is understood is 1 plus the heaviest path ending at i, so the answer is a longest path in the dependency DAG, and a cycle of requirements means -1.',
        'Run Kahn\'s algorithm on the edges j → i with pass[i] = 1 for every chapter, setting pass[i] = max(pass[i], pass[j] + (j > i ? 1 : 0)). If fewer than n chapters are removed print -1, otherwise print the largest pass. O(n + Σk) per test.',
      ],
      solution: 'Chapter i is understood in reading max over its requirements j of (pass[j] + [j > i]), or reading 1 if it has none: a requirement that sits later in the book is only understood after the reader has passed chapter i, so i waits one more reading. That is a longest path with 0/1 weights, computed in topological order of the requirement graph; chapters on or behind a cycle are never understood, so print -1 if Kahn\'s algorithm does not remove all n. Simulating the readings directly is O(n²) in the worst case (the fifth sample stretched to n chapters needs n readings).',
    },
    {
      id: '1679D',
      name: 'Toss a Coin to Your Graph...',
      rating: 1900,
      tier: 'core',
      hints: [
        'Fix a threshold X and allow only vertices with a_i ≤ X. Can you decide quickly whether k − 1 moves are possible? How does the answer change as X grows?',
        'If X works, every larger X works too, so binary search on X. For a fixed X the allowed vertices form a subgraph: if it contains a cycle the coin can move forever, and if it is a DAG the longest possible walk is its longest path, a DP in topological order.',
        'Binary search over the sorted distinct values of a. check(X): run Kahn\'s algorithm on the vertices with a_i ≤ X; if some allowed vertex is never removed there is a cycle, so return true; otherwise compute the longest path in vertices, starting len = 1 at every allowed vertex (the template starts at 0 because it counts edges), with len[u] = max(len[u], len[v] + 1), and return max len ≥ k. If check(max a) fails print -1. O((n + m) log n).',
      ],
      solution: 'The answer is the smallest X for which the subgraph on vertices with a_i ≤ X contains a walk through k vertices. That holds if the subgraph has a cycle (k is up to 10^18, so only a cycle can give such long walks) or if its longest path has at least k vertices, and one Kahn pass with a longest-path DP answers both. The predicate is monotone in X, so binary search over the distinct a values costs O((n + m) log n). Keep k in 64 bits; k = 1 needs only one vertex, so the answer is never -1 when n ≥ 1 and k = 1.',
    },
    {
      id: '1385E',
      name: 'Directing Edges',
      rating: 2000,
      tier: 'core',
      hints: [
        'Ignore the undirected edges for a moment. If the directed edges alone contain a cycle, can anything save you? And if they do not?',
        'The directed edges must already be acyclic, otherwise the answer is NO. If they are, take one topological order of all n vertices: an edge pointing from an earlier vertex to a later one can never close a cycle, so every undirected edge can be pointed forward in that order.',
        'Run Kahn\'s algorithm on the directed edges only, over all n vertices, and record pos[v]. If not every vertex is removed print NO. Otherwise print directed edges unchanged and each undirected edge x–y as "x y" if pos[x] < pos[y], else "y x". O(n + m).',
      ],
      solution: 'Directing the undirected edges only adds edges, so if the directed part has a cycle the answer is NO. Otherwise take a topological order of the directed part and orient each undirected edge from the earlier endpoint to the later one; every edge now goes forward in one fixed order, so the result is acyclic. Kahn\'s algorithm gives the cycle test and the positions in O(n + m). Reset the adjacency lists and in-degrees for each test case, and include vertices that touch only undirected edges in the order.',
    },
    {
      id: '1131D',
      name: 'Gourmet choice',
      rating: 2000,
      tier: 'challenge',
      hints: [
        'Dishes marked "=" must get the same number, so treat each group of equal dishes as a single item. What do the "<" and ">" entries become between groups?',
        'After merging "=" groups with DSU, every "<" is a directed edge between groups, and the smallest valid numbers are longest-path layers: a group with nothing below it gets 1, any other group gets 1 + the largest value below it. A cycle, or a "<" or ">" between two dishes of the same group, means No.',
        'Union dish i with dish n + j for each "=". For each "<" add the edge find(i) → find(n + j) (">" the reverse), printing No if both ends share a group. Run Kahn\'s algorithm over the group roots with val = 1 at sources and val[u] = max(val[u], val[v] + 1); if not every root is removed print No, else print val[find(x)] for each dish. O(nm).',
      ],
      solution: 'Collapse equal dishes with DSU over all n + m dishes, then build the "strictly better" graph between groups (up to 10^6 edges). An evaluation exists exactly when no "<" or ">" lies inside a group and that graph is acyclic. Giving each group 1 + the longest chain of groups below it is valid and makes every value individually as small as possible (a chain of L groups needs L distinct values), so the maximum is minimal too; it is a longest-path DP in topological order. When checking that Kahn\'s algorithm removed everything, count only DSU roots, not all n + m dishes.',
    },
  ],
};
