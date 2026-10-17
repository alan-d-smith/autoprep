// DSU and minimum spanning trees: primer and problems.
export default {
  id: 'dsu-mst',
  title: 'DSU and minimum spanning trees',
  track: 'graphs',
  summary: 'Maintain components under edge additions with union-find, answer threshold questions by adding edges offline in sorted order, and build minimum spanning trees with Kruskal or dense Prim, including a virtual vertex for "build here or connect" costs.',
  primer: {
    slides: [
      {
        title: 'Growing graphs and cheapest connections',
        points: [
          'Edges are only added, and between additions you ask: are two vertices connected, how big, how many components?',
          'A fresh search after each of 2·10^5 additions costs about 8·10^10 steps.',
          'Or keep some edges so all n vertices stay connected at the least total weight; trying subsets is hopeless.',
        ],
        say: 'In one kind of question, edges (friendships, merges, cables) are only ever added, and between additions you must say whether two vertices are connected, how big a component is or how many there are. Re-running a search after each of 2·10^5 additions on a graph with 2·10^5 vertices costs about 8·10^10 steps. In another, you must keep some of the m edges so that all n vertices stay connected at the least total weight, and trying subsets of edges is out of the question.',
      },
      {
        title: 'Components only merge: use a DSU',
        points: [
          'A disjoint set union stores each component as a rooted tree: p[x] is x\'s parent, and a root has p[x] = x.',
          'find(x) climbs to the root, so u and v are connected exactly when find(u) == find(v).',
          'unite(a, b) finds both roots and, if they differ, hangs one under the other.',
        ],
        show: [0, 3],
        note: 'In the Kruskal run used on this page, the first union is the lightest edge D–F: D and F are separate roots, so F goes under D.',
        say: 'When edges are only added, components only ever merge, so all you need is a fast answer to "which component is x in?" and a fast merge. A disjoint set union (DSU) stores each component as a rooted tree whose root is its representative: p[x] is x\'s parent, and a root has p[x] = x. find(x) follows parents up to the root, so u and v are connected exactly when find(u) == find(v). unite(a, b) finds both roots and, if they differ, hangs one under the other.',
      },
      {
        title: 'Two rules keep the trees shallow',
        points: [
          'Union by size: the smaller tree, by sz[r], goes under the larger, so every depth stays at most log n.',
          'Path halving: find(x) repoints the vertex it is on to its grandparent and jumps there, x = p[x] = p[p[x]].',
          'Together, find and unite cost amortised O(α(n)), an average over all calls, and α(n) ≤ 4 in practice: effectively constant.',
        ],
        show: [0, 14],
        note: 'find(F) climbs F → D → A in the DSU\'s trees at the bottom, not along graph edges, and path halving repoints F to its grandparent A (green arrow).',
        say: 'Two rules keep the trees shallow. Union by size: sz[r] counts the vertices in the tree rooted at r, and the smaller tree goes under the larger, so a vertex only gets deeper when its tree at least doubles, which keeps every depth at most log n. Path halving, a form of path compression: as find(x) climbs, it repoints the vertex it is on to its grandparent and jumps there, x = p[x] = p[p[x]], which roughly halves the path for later calls. Together they make find and unite amortised O(α(n)), where α is the inverse Ackermann function, at most 4 for any n you will meet: effectively constant.',
      },
      {
        title: 'Kruskal: lightest edges first, skip cycles',
        points: [
          'A minimum spanning tree (MST) connects all n vertices with n − 1 edges of least total weight.',
          'Sort the edges by weight and keep one exactly when unite returns true: its ends were in different components.',
          'An edge inside one component would close a cycle, so skip it; stop once n − 1 edges are kept.',
        ],
        show: [0, 18],
        note: 'A–B (6) is the 5th kept edge, n − 1, so the run stops; the dashed E–F (5) was skipped, as E and F already shared the root A.',
        say: 'A spanning tree keeps n − 1 of the edges and still connects all n vertices; a minimum spanning tree (MST) is one of least total weight. Kruskal builds one greedily with a DSU: sort the edges by weight and, from the lightest up, keep an edge exactly when unite returns true, that is, when its ends are still in different components. An edge whose ends are already connected would only close a cycle, so it is skipped, and the loop can stop once n − 1 edges are kept.',
      },
      {
        title: 'Some MST contains every kept edge',
        points: [
          'When Kruskal keeps an edge e, it joins two components; call either of them C. No lighter edge leaves C.',
          'Suppose an MST T holds every edge kept before e, but not e. Adding e closes a cycle that leaves C again by an edge f, not kept and no lighter than e.',
          'Swapping f for e gives an MST holding every kept edge so far; step by step, the kept edges end up as an MST.',
        ],
        say: 'Why the greedy choice is safe: when Kruskal reaches an edge e that joins two different components, every lighter edge has already been kept or skipped, so no lighter edge leaves C, either of the two components e joins. If an MST contains the edges kept so far but not e, adding e closes a cycle that must leave C again through some other edge f, which is not lighter than e. Swapping f for e gives a spanning tree, no heavier, that contains them all. So at every step some MST contains every kept edge, and at the end the kept edges are an MST.',
      },
      {
        title: 'Sweeping sorted edges answers threshold queries',
        points: [
          'Sort queries by q and sweep with the edges: once every edge ≤ q is in, the DSU holds that graph\'s components.',
          '"Pay c_i to serve i alone, or connect it" becomes an MST once a vertex 0 joins each i at weight c_i.',
          'Kruskal is O(m log m); on a complete graph with n ≈ 2000, O(n²) Prim avoids sorting n²/2 edges.',
        ],
        show: [0, 12],
        note: 'Partway through the sweep: with only the edges of weight ≤ 4, B is still on its own. It joins at weight 6.',
        say: 'Sorting dominates, so Kruskal is O(m log m). The same "add edges in sorted order" loop answers threshold questions offline: once every edge of weight ≤ q is in, the DSU holds exactly the components of the graph restricted to those edges. So sort the queries by q and sweep them together with the edges, counting x·y new connected pairs whenever components of sizes x and y merge. "Pay c_i to serve i on its own, or connect it to something served" becomes an ordinary MST after adding a virtual vertex 0 joined to every i by an edge of weight c_i. On a complete graph with n ≈ 2000, skip sorting n²/2 edges and use O(n²) Prim instead: grow one tree from any vertex, keep for every outside vertex its cheapest edge into the tree, and repeatedly attach the outside vertex whose edge is cheapest.',
      },
    ],
    terms: [
      'p[x]: x\'s parent in the tree that stores its set; a root has p[x] = x and is the set\'s representative (in the TRD\'s `UF`, e[x] holds the parent, or minus the set\'s size when x is a root).',
      'sz[r]: the number of vertices in the set whose root is r, only meaningful while r is a root (−e[r] in the TRD version, read with size(x)).',
      'find(x): the root of x\'s set, so a and b are connected exactly when find(a) == find(b).',
      'unite(a, b): merges the sets of a and b and returns true, or returns false if they were already one set (`join` in the TRD version).',
      'α(n): the inverse Ackermann function, at most 4 for any practical n; DSU operations cost amortised O(α(n)).',
      '`kruskal`: sorts the edges, stored as {w, u, v} with weight w first, and returns the total weight of the kept edges, or of a spanning forest if the graph is disconnected (the TRD version returns −1 then).',
      'best[v], from[v]: in O(n²) Prim for dense graphs, the cheapest edge from v, not yet in the tree, into the tree, and that edge\'s tree end. Repeatedly attach the outside v with the smallest best[v], then update every other best[] through v.',
      'vertex 0: the virtual vertex for "build here or connect" problems, joined to every i by an edge whose weight c_i is the cost of serving i on its own (vertex n in the TRD\'s `withVirtualSource`, with the costs in `build`).',
    ],
    worked: {
      problem: { source: 'kattis', id: 'ladice', name: 'Ladice', difficulty: '3.8' },
      slides: [
        {
          title: 'Two possible drawers for every item',
          points: [
            'N items and L drawers, both up to 3·10^5. Item i may go only in drawer A_i or B_i, and a drawer holds one item.',
            'Items come in order. If A_i and B_i are both full, Mirko tries to make space by shifting items along a chain, first from A_i, then from B_i.',
            'Print LADICA for each item that ends up in a drawer and SMECE for each one thrown away.',
          ],
          say: 'Mirko has N items and L drawers, both up to 3·10^5. Each drawer holds one item, and item i may only go in one of two drawers, A_i or B_i. He stores the items in order. If A_i is empty the item goes there, and otherwise, if B_i is empty, it goes there. If both are full, he tries to free A_i: he moves its item to that item\'s other drawer, and if that drawer is full too, moves its item on, and so on, until a move reaches an empty drawer or comes back to a drawer already seen. If that fails, he tries the same from B_i, and if that fails too, he throws the item away. For every item, print LADICA if it is stored and SMECE if it is thrown away.',
        },
        {
          title: 'Following every chain is too slow',
          points: [
            'A chain can pass through every drawer, and an item that is thrown away has walked two chains.',
            'With 10^5 drawers full in one ring, each of 2·10^5 more items walks two chains of 10^5 moves: about 4·10^10 moves.',
            'So decide whether a chain would succeed without walking it.',
          ],
          say: 'Simulating the rules gives the right answer, but slowly. A chain can pass through every drawer, and an item that is thrown away has walked two chains. Suppose the first 10^5 items fill 10^5 drawers in a ring, each item joining a drawer to the next. Then each of 2·10^5 more items with both drawers on that ring walks two chains of about 10^5 moves before it is thrown away: about 4·10^10 moves. So we need to know whether a chain would succeed without walking it.',
        },
        {
          title: 'Drawers are vertices, stored items are edges',
          points: [
            'Make each drawer a vertex and each stored item an edge between its two drawers.',
            'A chain moves items only along these edges, so whether item i fits depends only on the components of A_i and B_i.',
            'A stored item is never removed, so components only merge: keep them in a DSU over the drawers.',
          ],
          show: [0, 0],
          note: 'Sample 1 at the start: three drawers, each a set of its own, and five items to come, listed by their two drawers.',
          say: 'Think of each drawer as a vertex and each stored item as an edge between its two drawers. A chain of moves only shifts an item to its other drawer, along its own edge, so it stays inside one connected component of this graph. Whether item i can be stored therefore depends only on the components of A_i and B_i. A stored item may move, but it is never removed, so edges are only added and components only merge: the setting for a DSU over the drawers.',
        },
        {
          title: 'A tree has exactly one empty drawer',
          points: [
            'Each drawer starts alone and empty. An item across two trees makes one tree; an item inside a tree closes a cycle and fills its last drawer.',
            'Root a tree at its empty drawer: every other drawer holds the item on the edge to its parent, so any chain climbs to the root.',
            'With a cycle, every drawer is full and every chain loops. So keep room[r]: 1 while r\'s set is a tree, 0 once it has a cycle.',
          ],
          show: [0, 2],
          note: 'After items 1 and 2: three drawers and two items form one tree, so one drawer is empty and room[1] = 1. Only a root\'s room counts.',
          say: 'Every component has at most one empty drawer. At the start each drawer is a component on its own: a tree with one empty drawer. Storing an item between two trees joins them into one tree, which still has one empty drawer, and storing an item inside a tree closes a cycle and fills its last drawer. Root a tree at its empty drawer. A leaf must hold the item on its only edge, and working inwards, every drawer holds the item on the edge to its parent. So a chain from any drawer climbs towards the root and ends in the empty drawer. In a component with a cycle every drawer is full, so a chain can only come back to a drawer it has seen. For each root r, keep room[r]: 1 while r\'s set is a tree, and 0 once it has a cycle.',
        },
        {
          title: 'The rules become one check per item',
          points: [
            'Let a = find(A_i) and b = find(B_i). If room[a] and room[b] are both 0, every chain loops: print SMECE.',
            'Otherwise print LADICA. If a ≠ b, hang the smaller set under the larger and add their room; then subtract 1 for the new item.',
            'Two trees give room 1 + 1 − 1 = 1. An item inside a tree, or joining a tree to a full set, leaves room 0.',
          ],
          show: [0, 1],
          note: 'Item 1 (1–2) joins the trees of drawers 1 and 2: p[2] = 1 and room[1] = 1 + 1 − 1 = 1.',
          say: 'So each item needs one check. Let a = find(A_i) and b = find(B_i). If room[a] and room[b] are both 0, both components are full, every chain loops, and the item is thrown away: SMECE. Otherwise it is stored: LADICA. If a and b differ, hang the smaller set under the larger, as unite does, and add their room; then subtract 1, because the new item fills an empty drawer. Two trees give room 1 + 1 − 1 = 1, a tree again. An item inside a tree, or one that joins a tree to a full set, leaves room 0. An item that is thrown away changes nothing.',
        },
        {
          title: 'Sample 1: the third item closes a cycle',
          points: [
            'Items 1 and 2 join drawers 1, 2 and 3 into one tree: p[2] = 1, p[3] = 1 and room[1] = 1.',
            'Item 3 (1–2) has both ends in set 1, which has room 1, so it is stored and room[1] becomes 0.',
            'Three drawers now hold three items, and items 1 and 3, both on drawers 1 and 2, form a cycle.',
          ],
          show: [0, 3],
          note: 'After item 3: items 1 and 3 form a cycle between drawers 1 and 2, and room[1] = 0.',
          say: 'Sample 1 has 3 drawers and 5 items. Item 1 joins drawers 1 and 2, two trees with room 1, so it is stored, p[2] = 1 and room[1] = 1 + 1 − 1 = 1. Item 2 joins that tree to drawer 3 in the same way: p[3] = 1, and room[1] stays 1. Item 3 again needs drawer 1 or 2. Both ends have root 1, whose room is 1, so it is stored and room[1] becomes 0. Three drawers now hold three items, and items 1 and 3, both between drawers 1 and 2, form a cycle.',
        },
        {
          title: 'Items 4 and 5 are thrown away',
          points: [
            'Items 4 (1–3) and 5 (1–2) find root 1 at both ends, with room 0, so both print SMECE.',
            'The output LADICA, LADICA, LADICA, SMECE, SMECE matches the sample.',
            'Two finds per item: O(L + N α(L)). Collect the up to 3·10^5 lines in one string and print it once.',
          ],
          show: [0, 6],
          note: 'The end of sample 1: items 1 to 3 are stored, and items 4 and 5, thrown away, never enter the DSU.',
          say: 'Item 4 needs drawer 1 or 3, and item 5 drawer 1 or 2. In both cases both ends have root 1, whose room is 0: every drawer in the set is full, so any chain of moves goes round the cycle, and both items are thrown away. The output, LADICA three times and then SMECE twice, matches the sample. Each item costs two finds, so the whole run is O(L + N α(L)). With up to 3·10^5 lines of output, collect them in one string and print it once.',
        },
      ],
    code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, L;
    scanf("%d %d", &n, &L);
    // Drawers are vertices, stored items are edges. room[r]: empty drawers in r's set, always 0 or 1.
    vector<int> p(L + 1), sz(L + 1, 1), room(L + 1, 1);
    iota(p.begin(), p.end(), 0);
    auto find = [&](int x) {
        while (p[x] != x) x = p[x] = p[p[x]];
        return x;
    };
    string out;
    for (int i = 0; i < n; i++) {
        int a, b;
        scanf("%d %d", &a, &b);
        a = find(a), b = find(b);
        if (!room[a] && !room[b]) { out += "SMECE\\n"; continue; }
        if (a != b) {
            if (sz[a] < sz[b]) swap(a, b);
            p[b] = a, sz[a] += sz[b], room[a] += room[b];
        }
        room[a]--;
        out += "LADICA\\n";
    }
    fputs(out.c_str(), stdout);
}`,
    },
    spot: [
      'Edges or "same group" relations are only ever added, and you need connectivity, component sizes or the number of components along the way.',
      '"Connect everything at minimum total cost", or keep a subset of edges so everything stays connected and the total is minimal: a minimum spanning tree.',
      'A threshold in the question, such as "using only edges of weight ≤ q" or "the largest edge on the path is at most q": sort the edges and the queries so that edges are only ever added, increasing for "weight ≤ q" and decreasing for "limit ≥ x".',
      'Each object either pays its own fixed cost or links to another object that is already served: add a virtual vertex 0 with an edge (0, i) of weight c_i.',
    ],
    disguises: [
      'Guests each want two shared items and you minimise the unhappy ones → items are vertices, guests are edges, and the unhappy guests are the edges that close a cycle in the DSU (1209D).',
      'Count pairs (u, v) whose path maximum is ≤ q → union edges in increasing weight; merging components of sizes x and y adds x·y pairs, the same loop as Kruskal (1213G).',
      'Minimise (highest − lowest) height on a walk between two hills → try each lowest allowed height, then add the allowed trails by their higher end with a DSU until the two hills join (UKIEPC 2025 Fell Walking).',
      'Every city builds a power station for c_i or wires to a powered neighbour → an MST on n + 1 vertices with a virtual power-station vertex (1245D).',
      'A complete graph where connecting x and y costs a_x + a_y → an MST never needs an a_x + a_y edge outside the star from the vertex with the smallest a, so the star plus the m offers, O(n + m) edges, is enough (1095F).',
    ],
    pitfalls: [
      'Comparing p[a] with p[b] instead of find(a) with find(b), or merging a and b instead of their roots, silently corrupts the sets.',
      'Pair counts (x·y, or s(s − 1)/2 for a component of size s) and MST totals overflow int long before n reaches 2·10^5; keep them in long long.',
      'Storing all n(n − 1)/2 edges of a dense graph costs memory and a large sort; for complete graphs with n ≈ 2000 use O(n²) Prim with plain arrays, or prove that only O(n) of the edges can ever be chosen.',
    ],
    code: `struct DSU {
    vector<int> p, sz;
    DSU(int n) : p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); }
    int find(int x) {                       // path halving: each step skips a level
        while (p[x] != x) x = p[x] = p[p[x]];
        return x;
    }
    bool unite(int a, int b) {              // false: a and b were already connected
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);      // union by size keeps trees shallow
        p[b] = a; sz[a] += sz[b];
        return true;
    }
};
// Kruskal: cheapest edge first, keep it only if it joins two components. O(m log m).
// Returns the MST weight (spanning forest weight if the graph is disconnected).
long long kruskal(int n, vector<array<long long, 3>> edges) {  // {w, u, v}
    sort(edges.begin(), edges.end());
    DSU d(n);
    long long total = 0;
    for (auto& [w, u, v] : edges) if (d.unite(u, v)) total += w;
    return total;
}
// Virtual source: "open a station at i for c_i" is an edge to an extra vertex 0. Number the
// real vertices 1..n, push {c_i, 0, i} for every i (weight first), and call kruskal(n + 1, edges).`,
    resources: [
      { label: 'CP-Algorithms: Disjoint Set Union', url: 'https://cp-algorithms.com/data_structures/disjoint_set_union.html' },
      { label: 'CP-Algorithms: Minimum spanning tree, Kruskal with DSU', url: 'https://cp-algorithms.com/graph/mst_kruskal_with_dsu.html' },
      { label: 'CP-Algorithms: Minimum spanning tree, Prim\'s algorithm', url: 'https://cp-algorithms.com/graph/mst_prim.html' },
      { label: 'USACO Guide: Disjoint Set Union', url: 'https://usaco.guide/gold/dsu' },
      { label: 'USACO Guide: Minimum Spanning Trees', url: 'https://usaco.guide/gold/mst' },
    ],
  },
  problems: [
    {
      id: '1249B2',
      name: 'Books Exchange (hard version)',
      rating: 1300,
      tier: 'warmup',
      hints: [
        'Follow one book: kid i → p_i → p_{p_i} → …. Since p is a permutation, where must this walk end, and which other kids lie on the same walk?',
        'A permutation splits into disjoint cycles, and a book comes back after exactly the length of its owner\'s cycle. Uniting i with p_i in a DSU turns each cycle into one component.',
        'For each query build a DSU on 1..n, unite(i, p_i) for every i, and print the size of find(i) for each kid. O(n α(n)) per query.',
      ],
      solution: 'The graph i → p_i of a permutation is a disjoint union of cycles, and kid i gets the book back after the length of the cycle through i. Unite i with p_i for every i; the component of i is exactly its cycle, so print sz[find(i)]. Simulating day by day is O(n²) on one long cycle. Build the DSU per query with that query\'s n, since only the sum of n is bounded.',
    },
    {
      id: '771A',
      name: 'Bear and Friendship Condition',
      rating: 1500,
      tier: 'warmup',
      hints: [
        'X–Y and Y–Z force X–Z. What does that imply for two members joined by a longer chain of friendships, say X–Y–Z–W?',
        'Applying the rule repeatedly, any two members in the same connected component must be direct friends: every component has to be a clique. A DSU finds the components, and a component with s members is a clique exactly when it holds s(s − 1)/2 friendships.',
        'Unite the ends of every friendship, then count friendships per root (edge (a, b) belongs to find(a)) and compare each root\'s count with sz·(sz − 1)/2 computed in long long. O((n + m) α(n)).',
      ],
      solution: 'The condition makes friendship transitive inside each component, so the network is reasonable exactly when every component is complete. Build components with a DSU, count the edges in each, and print NO if some component of size s has fewer than s(s − 1)/2 edges (pairs are distinct, so it can never have more). s(s − 1)/2 is about 1.1·10^10 for s = 150000, so an int comparison overflows.',
    },
    {
      id: '1702E',
      name: 'Split Into Two Sets',
      rating: 1600,
      tier: 'core',
      hints: [
        'Treat each number as a vertex and each domino as an edge between its two numbers. What must a vertex look like for a split to be possible, and what does a valid split mean for two dominoes that share a number?',
        'A domino {x, x} or a number on three dominoes makes it impossible. Otherwise n dominoes carry 2n numbers, so every number appears exactly twice and the graph is a disjoint union of cycles. Dominoes sharing a number must go to different sets, so the sets alternate around each cycle, which works exactly when every cycle has even length.',
        'Reject a_i = b_i or any count above 2. Otherwise unite a_i with b_i in a DSU; a component with s numbers is a cycle of s dominoes, so answer YES exactly when every component size is even. O(n α(n)) per test case.',
      ],
      solution: 'Count how often each number appears; a double or a count above 2 means NO. Then every number has degree exactly 2 in the number graph, so its components are cycles whose dominoes must alternate between the two sets. Unite the two numbers of each domino and answer YES exactly when every component has an even number of vertices. Equivalently, check that the graph "dominoes sharing a number" is bipartite with a DSU that stores parity.',
    },
    {
      id: '1209D',
      name: 'Cow and Snacks',
      rating: 1700,
      tier: 'core',
      hints: [
        'Draw the flavours as vertices and the guests as edges. In one connected group with s flavours, how many guests can possibly eat something?',
        'Every happy guest removes at least one new flavour and the first removes two, so a component with s flavours makes at most s − 1 guests happy, and ordering the guests along a spanning tree achieves that. The sad guests are exactly the edges that are not needed for a spanning forest.',
        'Unite x_i and y_i for each guest in input order and count the unite calls that return false (both flavours already connected). O((n + k) α(n)).',
      ],
      solution: 'Model flavours as vertices and guests as edges. In a component with s flavours, at most s − 1 guests can be happy, and lining guests up in BFS order of a spanning tree makes exactly s − 1 happy. So the minimum number of sad guests is k − (n − number of components) = the number of guests whose two flavours are already connected when processed. Count failed unions. O((n + k) α(n)).',
    },
    {
      id: '1213G',
      name: 'Path Queries',
      rating: 1800,
      tier: 'core',
      hints: [
        'For one query q, delete every edge heavier than q. Which pairs (u, v) are counted, in terms of the pieces that remain?',
        'A pair counts exactly when u and v are in the same component of the forest of edges with weight ≤ q, so the answer is Σ s(s − 1)/2 over those components. As q grows edges are only added, which is the Kruskal loop run offline: sort edges by weight and union them in that order.',
        'Sort the edges; keep a running total and, when an edge joins components of sizes x and y, add x·y. Record the total after all edges of weight ≤ w for each w up to 2·10^5 (or sort the queries with their indices) and answer by lookup. O(n log n + m + max w).',
      ],
      solution: 'The largest edge on the u–v path is ≤ q exactly when u and v are connected using only edges of weight ≤ q. Sort the edges and sweep q upwards, uniting each edge once q reaches its weight; merging components of sizes x and y creates x·y new valid pairs. Store the running count per weight value and print the answers in input order. The count reaches n(n − 1)/2 ≈ 2·10^10, so use long long; with n = 1 there are no edges and every answer is 0.',
    },
    {
      id: '1095F',
      name: 'Make It Connected',
      rating: 1900,
      tier: 'core',
      hints: [
        'Without special offers, any two vertices can be joined for a_x + a_y. If you had to connect everything with only such edges, which vertex would you put at the centre?',
        'Let r be the vertex with the smallest a. For any x, y the edge (x, y) at a_x + a_y is the heaviest edge of the triangle x, y, r, so by the cycle property an MST never needs it. Only the n − 1 star edges (r, i) plus the special offers matter, and the problem becomes a plain MST.',
        'Find r = argmin a, build the edge list from the m special offers plus (r, i, a_r + a_i) for every i ≠ r, and run Kruskal with a DSU, summing in long long. O((n + m) log(n + m)).',
      ],
      solution: 'Let r be the vertex with the smallest a. For a pair x, y, the cost a_x + a_y is at least both a_r + a_x and a_r + a_y, so the direct edge is the heaviest in the triangle with r and can be dropped. Build the star from r together with all special offers, sort by cost and run Kruskal. a_i and w go up to 10^12 and the total to about 4·10^17, so read and sum everything in long long. n = 1 prints 0.',
    },
    {
      id: '1245D',
      name: 'Shichikuji and Power Grid',
      rating: 1900,
      tier: 'core',
      hints: [
        'Building a station costs c_i and involves no other city. Can you make that option look like an edge, so that every decision is "pick some edges"?',
        'Add a virtual vertex 0, the power source, with an edge (0, i) of weight c_i. A city has electricity exactly when it is connected to 0, so the cheapest plan is a minimum spanning tree on n + 1 vertices: tree edges at 0 are stations, all other tree edges are wires.',
        'The graph is complete with about 2·10^6 edges, so run O(n²) Prim from vertex 0 with arrays best[] and from[] and no heap, computing (k_i + k_j)·(|x_i − x_j| + |y_i − y_j|) on the fly. Record from[v] for each vertex you attach. O(n²).',
      ],
      solution: 'Vertex 0 stands for "has a power station" with edge weights c_i; wires cost (k_i + k_j) times the Manhattan distance. A plan is valid exactly when every city is connected to 0, so the optimum is an MST of this complete graph on n + 1 vertices. Dense Prim repeatedly attaches the cheapest unattached vertex and updates best[] for the rest; a vertex attached from 0 gets a station, any other attachment is a wire. Wire costs reach about 4·10^15, so use long long. O(n²) time, O(n) memory; Kruskal on all pairs also passes but is slower.',
    },
    {
      id: '1513D',
      name: 'GCD and MST',
      rating: 2000,
      tier: 'challenge',
      hints: [
        'Kruskal would take the cheapest edges first. Which edges cost less than p, and which array value is responsible for an edge of weight a_i?',
        'An edge of weight a_i joins j and k exactly when every element of a[j..k] is a multiple of a_i and a_i lies inside, so a_i reaches a contiguous run of multiples around position i. Run Kruskal by hand: process positions in increasing a_i and greedily connect i to its neighbours along that run at cost a_i per new connection.',
        'Sort positions by a. For each i with a_i < p, walk left and right while the next element is divisible by a_i and the gap between it and its neighbour is not yet bridged, marking the gap and adding a_i. Stop at a bridged gap; finally add p for every gap still unbridged. Each gap is bridged once, so the walks cost O(n) after the O(n log n) sort.',
      ],
      solution: 'Components stay contiguous, so track which of the n − 1 gaps (j, j + 1) are bridged. In increasing order of a_i, while a_i < p, extend from i to the left while a_j % a_i == 0 and gap j is unbridged, bridging it for a_i (the edge (j, i) exists because all of a[j..i] are multiples of a_i), then do the same to the right. Stopping at a bridged gap is safe because an earlier walk with a value ≤ a_i got there first and anything further that a_i could reach is already in that component. Every remaining gap costs p. Values with a_i ≥ p are skipped since the adjacent p-edges are never worse. Sum in long long.',
    },
  ],
};
