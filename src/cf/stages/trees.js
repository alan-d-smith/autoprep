// Trees: DFS order, subtree DP and rerooting: primer and problems.
export default {
  id: 'trees',
  title: 'Trees: DFS order, subtree DP and rerooting',
  track: 'graphs',
  summary: 'Root a tree in O(n), use depth, subtree sizes and DFS order to answer subtree questions, write bottom-up DP on subtrees, reroot it to get an answer for every vertex, and find a diameter with two BFS passes.',
  primer: {
    slides: [
      {
        title: 'Asking about everything below v',
        points: [
          'Sizes, totals and best answers inside a subtree come up constantly.',
          'Walking down from each vertex separately is O(n) per vertex, O(n²) in all.',
          'Fix one shape for the tree and reuse each answer instead.',
        ],
        show: [0, 0],
        note: 'The diagram\'s tree, rooted at 1, before any par, depth, tin or size is filled in.',
        say: 'Many tree questions are about "everything below v": how many vertices it holds, their total weight, the best answer found inside it. Working that out by walking down from each vertex separately costs O(n) per vertex and O(n²) in all, too slow for n = 2·10^5. The way out is to fix one shape for the tree and reuse each answer instead of recomputing it.',
      },
      {
        title: 'Root the tree',
        points: [
          'Pick a root r. Every other vertex gets one parent par[v] and a depth depth[v].',
          'v\'s subtree is v plus everything below it: v plus its children\'s subtrees.',
        ],
        show: [0, 5],
        note: 'Rooted at 1: 2\'s children 4 and 5 get par = 2 and depth = depth[2] + 1 = 2.',
        say: 'So first root the tree: pick any vertex r as the root. Every other vertex now has exactly one parent par[v], its neighbour on the way back to r, a depth depth[v], and a subtree: v together with everything below it. "Below" was meaningless in an unrooted tree; now it is well defined, and a vertex\'s subtree is just itself plus its children\'s subtrees.',
      },
      {
        title: 'Children before parents',
        points: [
          'A DFS lists the vertices in preorder, `order`; each comes after its parent.',
          'Walk `order` backwards and every child is finished first, so size[v] and any subtree DP down[v] take one O(n) pass.',
        ],
        show: [0, 15],
        note: 'Walking `order` backwards: 2\'s children 4 and 5 come later and have already been added, so size[2] = 5 is final.',
        say: 'Next, an order that finishes children before parents. A DFS from r writes the vertices down in the order it enters them, the preorder `order`. Every vertex appears after its parent, so walking `order` backwards meets each child before its parent. When the backward walk reaches v, every child\'s answer is already final, so size[v] = 1 + the sizes of v\'s children, and any subtree DP down[v] built from its children\'s values takes one O(n) pass.',
      },
      {
        title: 'A subtree is a block of the preorder',
        points: [
          'The DFS doesn\'t leave v until it has seen everything below it.',
          'So v\'s subtree is order[tin[v] .. tin[v] + size[v] − 1], and subtree questions become range questions.',
        ],
        show: [0, 18],
        note: '2\'s subtree {2, 4, 5, 7, 8} is the block order[3..7]. The stack took 3\'s subtree first, as 3 was pushed last; any child order keeps blocks.',
        say: 'The same order makes subtrees easy to query. A DFS that enters v does not leave until it has seen everything below v, so v\'s subtree sits in consecutive slots of `order`: from tin[v], v\'s own slot, for size[v] entries. "Is u inside v\'s subtree?" becomes tin[v] ≤ tin[u] < tin[v] + size[v], and "the total over v\'s subtree" becomes a range sum over `order`, which prefix sums or a Fenwick tree answer quickly.',
      },
      {
        title: 'Every vertex as the root',
        points: [
          'Compute ans[r] once for one root.',
          'Moving the root across one edge, from p to its child v, changes the answer by an O(1) correction.',
          'Walking `order` forwards gives every answer in O(n): rerooting.',
        ],
        say: 'Some problems ask for an answer with every vertex as the root. Recomputing per root is O(n²) again. Instead compute ans[r] for one root, then move the root one edge at a time, from a parent p to its child v. Only p and v swap roles, v becoming p\'s parent; every other vertex keeps its parent, so ans[v] follows from ans[p] with an O(1) correction: take out what v\'s subtree contributed and add what the rest of the tree now contributes through p. This is rerooting, and walking `order` forwards gives every vertex its answer in O(n) total.',
      },
      {
        title: 'The diameter in two BFS passes',
        points: [
          'BFS from any vertex; the farthest vertex a is an end of a longest path.',
          'BFS again from a; the farthest vertex b gives the diameter a to b.',
        ],
        say: 'One more classic: the diameter, the longest path in the tree. A BFS from any vertex ends at a vertex a that is an end of some longest path, and a second BFS from a reaches the farthest vertex b; the path from a to b is a diameter. Two O(n) passes.',
      },
    ],
    // Grouped by technique: a problem uses the rooting names plus the groups it needs.
    terms: [
      {
        group: 'Rooting the tree',
        note: 'Always needed.',
        items: [
          'par[v]: v\'s parent once the tree is rooted; the root has none (−1).',
          'depth[v]: the number of edges from the root down to v.',
          '`order`: the vertices in DFS preorder, each after its parent. Walk it backwards for children first, forwards for parents first.',
          '`st`: the template\'s stack, used instead of recursion. A vertex gets par and depth when pushed and joins `order` when popped.',
        ],
      },
      {
        group: 'Subtree DP',
        items: [
          'size[v]: how many vertices are in v\'s subtree, v included; the simplest subtree DP.',
          'down[v]: the value a problem needs for v\'s subtree alone, built from its children\'s values.',
        ],
      },
      {
        group: 'A subtree as a range',
        note: 'Also needs size.',
        items: [
          'tin[v]: v\'s position in `order`, its entry time. v\'s subtree is order[tin[v] .. tin[v] + size[v] − 1].',
        ],
      },
      {
        group: 'Rerooting',
        note: 'Also needs `order` and a subtree DP such as size.',
        items: [
          'ans[v]: the answer with v as the root. Work out ans for the root directly, then fill parents first, each ans[v] from ans[par[v]].',
        ],
      },
      {
        group: 'In the TRD version',
        items: [
          '`dep`, `sub`: what this page calls depth and size.',
          '`rootTree()`: fills par, dep, sub and `order`, but `order` is a BFS order, so it gives no subtree ranges.',
          '`preorder()`: fills tin from a separate DFS, for subtree ranges.',
        ],
      },
    ],
    worked: {
      title: 'sums of distances',
      question: 'A tree has n = 6 vertices and the edges 1–2, 1–3, 2–4, 2–5 and 3–6. For every vertex v, find the sum of the distances from v to all the other vertices, where a distance counts edges. The real version has n up to 2·10^5.',
      steps: [
        'Recognise it: one answer per vertex, where each answer is "the same quantity with v as the root". A BFS from every vertex is O(n²), about 4·10^10 steps at full size, so this is rerooting.',
        'Root the tree at 1 and fill depth[] and size[] with one DFS. Depths: vertex 1 is 0, vertices 2 and 3 are 1, vertices 4, 5 and 6 are 2. Sizes, children first: size[4] = size[5] = size[6] = 1, size[2] = 1 + 1 + 1 = 3, size[3] = 1 + 1 = 2, size[1] = 6.',
        'The answer for the root is the sum of the depths: ans[1] = 0 + 1 + 1 + 2 + 2 + 2 = 8.',
        'Move the root from p to a child v. The size[v] vertices in v\'s subtree each get one edge closer, and the other n − size[v] each get one edge farther, so ans[v] = ans[p] − size[v] + (n − size[v]) = ans[p] + n − 2·size[v].',
        'Apply it parents first: ans[2] = 8 + 6 − 6 = 8, ans[3] = 8 + 6 − 4 = 10, ans[4] = ans[5] = 8 + 6 − 2 = 12, ans[6] = 10 + 6 − 2 = 14. Check one directly: from 6 the distances are 2, 3, 1, 4 and 4, which sum to 14.',
        'Answer: 8, 8, 10, 12, 12, 14. One DFS plus one pass in preorder is O(n), and the sums reach about n²/2 ≈ 2·10^10, so store them as long long.',
      ],
    },
    spot: [
      'n vertices and n − 1 edges, "connected and acyclic", or parents given as p_i < i: it is a tree, and once rooted every vertex has a well-defined subtree.',
      'The value at a vertex depends only on what lies below it (counts, sums, the best choice among children): a subtree DP processed children-first.',
      '"For every vertex v, if v were the root / capital / meeting point" or "choose v to maximise Σ dist(i, v)·a_i": rerooting.',
      '"Farthest pair", "longest path" or "pick vertices so their paths cover the most edges": the diameter, found by two BFS passes.',
    ],
    disguises: [
      'A command or search spreading from v in DFS order, asked for its k-th step → the preorder slice of length size[v] starting at tin[v]; one DFS from the root answers every query (1006E).',
      'Pick k cities whose envoys walk to the capital and score the unpicked cities they pass → each city is worth depth − (subtree size − 1); sort and take the k largest (1336A).',
      'Choose the best centre for a weighted sum of distances → compute the sum for root 1, then reroot: moving from p to its child v changes it by S − 2·W(v), where S is the total of all the weights and W(v) the total weight inside v\'s subtree (1092F). This is the "move to a neighbour with an O(1) update" step in UKIEPC 2024 Jabber Network.',
      'Infection spreading down from the root while you delete one vertex per step → a subtree DP that decides at each vertex which child to sacrifice (1689C).',
    ],
    pitfalls: [
      'Recursive DFS on a path of 2·10^5 vertices can overflow the stack, especially on Windows-based judges; use an explicit stack for the preorder and loop over it backwards for bottom-up passes.',
      'Calling every degree-1 vertex a leaf also catches the root when it has a single child; a leaf is a non-root vertex with no children.',
      'In the rerooting pass, the upward value for child v must use the parent\'s full answer with v\'s own contribution removed (for example ans[p] − max(0, down[v])), not down[p], which ignores everything above p. Distance sums like Σ dist·a_i reach 10^15 and need long long.',
    ],
    code: `// Root the tree at r without recursion. order is a DFS preorder, so the subtree of v
// is the contiguous block order[tin[v] .. tin[v] + size[v] - 1]. The stack pops the child
// pushed last first, so children come in reverse order of g[v]; any order keeps the blocks.
struct RootedTree {
    vector<int> par, depth, size, tin, order;
    RootedTree(const vector<vector<int>>& g, int r)
        : par(g.size(), -1), depth(g.size(), 0), size(g.size(), 1), tin(g.size(), -1) {
        vector<int> st = {r};
        while (!st.empty()) {
            int v = st.back(); st.pop_back();
            tin[v] = order.size(); order.push_back(v);
            for (int u : g[v]) if (u != par[v]) { par[u] = v; depth[u] = depth[v] + 1; st.push_back(u); }
        }
        // reverse preorder finishes every child before its parent: bottom-up DP goes here
        for (int i = (int)order.size() - 1; i > 0; i--) size[par[order[i]]] += size[order[i]];
    }
    bool inSubtree(int u, int v) const { return tin[v] <= tin[u] && tin[u] < tin[v] + size[v]; }
};
// Rerooting: compute ans[r] directly, then walk order[1..] (parents before children) and get
// ans[v] from ans[par[v]] in O(1), e.g. sum of distances: ans[v] = ans[par[v]] + n - 2 * size[v].

// BFS from s; the last vertex dequeued is a farthest one. Diameter: farthest(farthest(any)).
pair<int, int> farthest(const vector<vector<int>>& g, int s, vector<int>& d) {
    d.assign(g.size(), -1); d[s] = 0;
    queue<int> q; q.push(s); int last = s;
    while (!q.empty()) {
        int v = q.front(); q.pop(); last = v;
        for (int u : g[v]) if (d[u] < 0) { d[u] = d[v] + 1; q.push(u); }
    }
    return {last, d[last]};
}`,
    resources: [
      { label: 'USACO Guide: Introduction to Tree Algorithms', url: 'https://usaco.guide/silver/intro-tree' },
      { label: 'USACO Guide: Euler Tour Technique', url: 'https://usaco.guide/gold/tree-euler' },
      { label: 'USACO Guide: DP on Trees, Introduction', url: 'https://usaco.guide/gold/dp-trees' },
      { label: 'USACO Guide: DP on Trees, Solving For All Roots', url: 'https://usaco.guide/gold/all-roots' },
      { label: 'CSES: Tree Diameter', url: 'https://cses.fi/problemset/task/1131' },
    ],
  },
  problems: [
    {
      id: '1676G',
      name: 'White-Black Balanced Subtrees',
      rating: 1300,
      tier: 'warmup',
      hints: [
        'A subtree is balanced when (whites − blacks) is 0. How does that difference for vertex u relate to the same difference for each of its children?',
        'This is the simplest subtree DP: bal(u) = (+1 if u is white, −1 if black) + Σ bal(child). Because a_i < i, every child has a larger label than its parent, so the labels already give a children-first order.',
        'Set bal[i] = ±1, then for i from n down to 2 add bal[i] into bal[a_i]; count the vertices whose final bal is 0. O(n) per test case.',
      ],
      solution: 'Store bal[i] = +1 for W and −1 for B. Loop i = n down to 1: if bal[i] == 0 count it, then (for i > 1) add bal[i] to bal[a_i]. Since parents have smaller labels, each vertex is complete before it is added to its parent, so no DFS is needed. O(n) per test case; reset the arrays for each of the up to 10^4 test cases.',
    },
    {
      id: '580C',
      name: 'Kefa and Park',
      rating: 1500,
      tier: 'warmup',
      hints: [
        'Walking down from the house at vertex 1, what single number do you need to carry to know whether the path so far is still acceptable?',
        'Carry the length of the current run of consecutive cats: it becomes run + 1 at a cat vertex and resets to 0 at a cat-free one. This is a top-down DFS where each vertex\'s state depends only on its parent\'s.',
        'Iterative DFS from vertex 1 with (vertex, parent, run), starting from run = a_1. If run > m, do not descend further. Count reached vertices with no neighbour other than their parent. O(n).',
      ],
      solution: 'DFS from vertex 1 with run(1) = a_1 and run(child) = a_child ? run(parent) + 1 : 0. As soon as run exceeds m, prune that whole subtree, since every restaurant below shares the bad stretch. A reached vertex whose only neighbour is its parent is a restaurant; count it. O(n). Common WAs: tracking the total number of cats on the path instead of the current consecutive run, and counting the root as a leaf when it has degree 1.',
    },
    {
      id: '1006E',
      name: 'Military Problem',
      rating: 1600,
      tier: 'core',
      hints: [
        'The command spreads exactly like a DFS that always picks the smallest child first. How does the order starting from officer u relate to the order starting from the commander?',
        'In a DFS preorder every subtree is a contiguous block: the order from u is the slice of the commander\'s order that starts at u\'s position and has length size(u). One DFS from the root answers every query.',
        'Build children lists in increasing index (reading p_2..p_n in order already sorts them), run one iterative preorder from 1 recording tin[v] and order[], compute subtree sizes, and answer (u, k) with order[tin[u] + k − 1] if k ≤ sz[u], else −1. O(n + q).',
      ],
      solution: 'Children are appended in increasing index as p_i is read for i = 2..n. One preorder DFS from 1 (iterative, pushing children in reverse so the smallest is popped first) gives order[] and tin[]; walking order[] backwards gives subtree sizes. For query (u, k), print −1 if k > size[u], otherwise order[tin[u] + k − 1]. O(n + q). Simulating the spread per query is O(nq) and times out, and a recursive DFS on a 2·10^5 chain risks a stack overflow.',
    },
    {
      id: '1336A',
      name: 'Linova and Kingdom',
      rating: 1600,
      tier: 'core',
      hints: [
        'When you turn a city into an industry city, whose happiness changes besides its own envoy\'s?',
        'Choosing v gives its envoy depth(v) tourism cities if nothing above is industrial, but v stops counting for every industry city below it. It is never worse to pick a child before its parent, so an optimal choice takes whole subtrees and each chosen v is worth depth(v) − (sz(v) − 1), independently of the others.',
        'Root at city 1 (depth 0), compute depth and subtree size for every city, form depth(v) − sz(v) + 1, sort in decreasing order and add up the k largest in long long. O(n log n).',
      ],
      solution: 'Swapping an industrial parent with a tourism child never lowers the total, so an optimal set is closed under taking descendants, and then each chosen city v contributes depth(v) minus the sz(v) − 1 chosen cities below it. The values depth(v) − (sz(v) − 1) are independent, and a child\'s value is always larger than its parent\'s, so taking the k largest automatically respects the closure. Sort and sum the top k. The sum reaches about 10^10, so use long long. O(n log n).',
    },
    {
      id: '1689C',
      name: 'Infected Tree',
      rating: 1600,
      tier: 'core',
      hints: [
        'When the infection reaches a vertex with two healthy children, you can delete only one of them before it spreads. What happens to each child\'s subtree depending on that choice?',
        'At every moment the infection front is a single vertex v, and the situation inside v\'s subtree repeats itself one level lower: a subtree DP. Let dp[v] be the most vertices you can save in v\'s subtree once v has just been infected.',
        'Root at 1 and compute subtree sizes. A leaf has dp = 0; with one child c, dp = sz(c) − 1; with children c1, c2, dp = max(sz(c1) − 1 + dp[c2], sz(c2) − 1 + dp[c1]). Print dp[1]. O(n) per test case.',
      ],
      solution: 'Each turn you delete one child of the currently infected vertex v: the deleted child\'s subtree minus the child itself is saved, and the infection continues into the other child, where the same choice appears. Process vertices in reverse DFS order with dp[v] = 0 for a leaf, sz(c) − 1 for a single child, and the better of the two deletions for two children. Print dp[1]. The −1 is because a deleted vertex does not count as saved. O(n) per test case.',
    },
    {
      id: '1324F',
      name: 'Maximum White Subtree',
      rating: 1800,
      tier: 'core',
      hints: [
        'Score a white vertex as +1 and a black one as −1. If the tree were rooted at v and you only had to answer for v, which child subtrees would you attach?',
        'For one root it is a subtree DP: down[v] = w(v) + Σ max(0, down[c]). You need the answer with every vertex as the root, so reroot: the best set containing v either stays below v or also extends through the edge to its parent.',
        'First pass in reverse DFS order computes down[v]. Second pass in DFS order (parents first): ans[1] = down[1], and ans[v] = down[v] + max(0, ans[p] − max(0, down[v])), where the subtraction removes v\'s own contribution from its parent\'s answer. O(n).',
      ],
      solution: 'Map a_v to w(v) = +1 or −1. Bottom-up, down[v] = w(v) + Σ max(0, down[c]) is the best connected set containing v inside its subtree. Top-down, ans[1] = down[1], and for a child v of p the upward part is the best set containing p without v\'s branch, ans[p] − max(0, down[v]), attached only if positive: ans[v] = down[v] + max(0, ans[p] − max(0, down[v])). Two O(n) passes. Using down[p] instead of ans[p] in the second pass misses everything above p.',
    },
    {
      id: '1092F',
      name: 'Tree with Maximum Cost',
      rating: 1900,
      tier: 'challenge',
      hints: [
        'Computing the cost for v = 1 is one DFS. If you then move v across one edge to a neighbour, which distances grow by one and which shrink by one?',
        'This is rerooting with an O(1) update: moving the chosen vertex from p to its child v brings every vertex in v\'s subtree one step closer and pushes everything else one step away, so cost(v) = cost(p) + S − 2·W(v), where S = Σ a_i and W(v) is the sum of a over v\'s subtree.',
        'Root at 1, compute depths and subtree sums in one pass, set cost(1) = Σ depth(i)·a_i, then walk the DFS order applying cost(v) = cost(par(v)) + S − 2·W(v) and take the maximum. Use long long; O(n).',
      ],
      solution: 'Compute cost(1) = Σ dist(i, 1)·a_i and the subtree sums W(v) with vertex 1 as root. Moving from parent p to child v changes the cost by (S − W(v)) − W(v), so in DFS order cost(v) = cost(p) + S − 2·W(v); the answer is the maximum over all v. Costs exceed 10^15, so everything must be long long, and n = 1 prints 0. O(n).',
    },
    {
      id: '1294F',
      name: 'Three Paths on a Tree',
      rating: 2000,
      tier: 'challenge',
      hints: [
        'Solve the two-vertex version first: which pair of vertices covers the most edges? Then ask where the third vertex should hang off that path.',
        'Some optimal answer contains both ends a, b of a diameter (an exchange argument: replacing an endpoint by a diameter end never loses edges). Then the covered edges are the path a–b plus the path from c to the nearest vertex of that path, so c should be the vertex farthest from the diameter path.',
        'BFS from any vertex to find a, BFS from a to find b and record parents, then run one multi-source BFS seeded with every vertex on the a–b path and choose c ≠ a, b with the largest distance. Answer dist(a, b) + d(c). O(n).',
      ],
      solution: 'Find a diameter a–b with two BFS passes and recover the path from the parent pointers. A multi-source BFS from all path vertices gives every vertex its distance to the path; pick c as the farthest vertex other than a and b. Print dist(a, b) + d(c) followed by a, b, c. When the tree itself is a path all those distances are 0, so make sure c is still a third distinct vertex rather than a or b. O(n).',
    },
  ],
};
