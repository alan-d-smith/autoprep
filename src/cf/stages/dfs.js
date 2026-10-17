// DFS, components and cycles: primer and problems.
export default {
  id: 'dfs',
  title: 'DFS, components and cycles',
  track: 'graphs',
  summary: 'Turn a statement into a graph, label its connected components in O(n + m), and use the same traversal to detect cycles and 2-colour (bipartite) structure, on explicit graphs and on grids.',
  primer: {
    slides: [
      {
        title: 'Many problems ask who reaches whom',
        points: [
          'Skaters between drifts, news between users, rooms in a floor plan: statements rarely say "graph".',
          'Building it is the hard part: choose the vertices, and when two of them share an edge.',
          'One search is O(n + m); one per question is about 8·10^10 steps for 2·10^5 questions at n = m = 2·10^5.',
        ],
        say: 'Many statements ask who can reach whom: can a skater get from any snow drift to any other, how many users eventually hear a piece of news, how many separate rooms a floor plan has. They rarely say "graph", and building one is usually the hard part: decide what the vertices are (people, grid cells, drifts) and when two of them share an edge (friends, a common side, a common row or column, the same group in a list of members). With n vertices and m edges one search costs O(n + m), so a fresh search for every vertex or every question costs about 8·10^10 steps when n, m and the number of questions are all 2·10^5.',
      },
      {
        title: 'Reachability splits vertices into components',
        points: [
          'Reachability is transitive and edges go both ways, so the vertices split into connected components.',
          'Inside a component everyone reaches everyone, and no edge leaves it.',
          'Label each vertex with its component once: "can u reach v?" becomes "same label?"',
        ],
        show: [0, 22],
        note: 'The finished search: comp[v] puts {1, 2, 3, 4, 5} in component 0, {6, 7, 8} in component 1 and {9} in component 2.',
        say: 'Reachability in an undirected graph sorts the vertices into groups. If u reaches v and v reaches w then u reaches w, and every edge can be walked both ways, so the vertices split into connected components: inside one, everyone reaches everyone, and no edge leaves it. One search started anywhere in a component finds exactly that component, so label every vertex with its component once, and "can u reach v?" becomes "do u and v have the same label?".',
      },
      {
        title: 'One pass labels every component',
        points: [
          'For each s with comp[s] = −1, set comp[s] = `id` and push s onto the stack `st`.',
          'Pop u and give each unlabelled neighbour in adj[u] the same label, pushing it; when `st` empties, `id` goes up.',
          'The explicit stack replaces recursion, which can go 2·10^5 calls deep and overflow.',
        ],
        show: [0, 3],
        note: 'Popping 1 labels both its neighbours, 2 and 3, with component 0 and pushes them; 3, now on top, is popped next.',
        say: 'The template\'s `explore` labels every component in one pass. adj[u] lists the neighbours of u, comp[v] is the number of v\'s component (−1 while v is unvisited), and `id` is the next unused number. `explore` tries every vertex s in turn; if comp[s] is still −1, it sets comp[s] = id, pushes s onto a stack `st`, and then repeatedly pops a vertex u and gives every unlabelled neighbour v of u the same label, pushing v in turn. When `st` is empty the component is complete and `id` goes up by one. The explicit stack replaces recursion, which can go 2·10^5 calls deep and overflow the call stack.',
      },
      {
        title: 'Nothing is missed, in O(n + m)',
        points: [
          'When `st` empties, every labelled vertex has its neighbours labelled, so no edge leads to an unlabelled vertex.',
          'Each vertex is pushed once and each edge scanned from both ends: O(n + m). A queue (BFS) works too.',
          'On an R × C grid, cell (r, c) is vertex r·C + c + 1, numbered from 1 like adj; `dr` and `dc` give its neighbours: O(RC).',
        ],
        show: [0, 12],
        note: '`st` is empty: everything reachable from 1 is labelled, so component 0 is complete and `id` becomes 1. The dashed edge 2–4 closed a cycle.',
        say: 'Nothing is missed: a vertex is labelled when it is pushed and its neighbours are scanned when it is popped, so once `st` is empty every labelled vertex has all its neighbours labelled. A path from s to an unlabelled vertex would need an edge from a labelled vertex to an unlabelled one, which cannot exist. The order in which vertices leave the stack does not matter, so a queue (BFS) finds the same components. Each vertex is pushed once and each edge scanned once from each end, so the labelling is O(n + m). On an R × C grid, cell (r, c) is vertex r·C + c + 1, so the cells are numbered 1 to R·C like the template\'s adj. A cell\'s neighbours come from the offsets `dr` and `dc`, and a flood fill is O(RC).',
      },
      {
        title: 'Edge counts reveal cycles',
        points: [
          'The same pass can record each component\'s size, degrees and edge count (half the degree sum).',
          'With V vertices it holds a cycle exactly when it has at least V edges; a single ring if every degree is 2.',
          'During the search, a cycle shows up as a labelled neighbour that is not the parent, the vertex that labelled the current one.',
        ],
        show: [0, 6],
        note: 'From 4 the search meets 2, labelled but not 4\'s parent 3, so the edge 4–2 closes the cycle 4–3–1–2–4.',
        say: 'The same pass can record facts per component, such as its size, its degrees and its edge count (half the sum of its degrees), and these settle cycle questions without a second algorithm. A connected component with V vertices has at least V − 1 edges, exactly V − 1 when it is a tree, so it contains a cycle exactly when it has at least V edges. It is a single ring exactly when every vertex in it has degree 2. During the search a cycle also shows up directly, as an already labelled neighbour that is not the parent, the vertex that labelled the current one; the edge back to the parent is not a cycle.',
      },
      {
        title: 'Two-colour each component while searching',
        points: [
          's gets side 0; each newly labelled vertex gets side[u] ^ 1, opposite the vertex u that found it.',
          'So a component has exactly two valid splits, or none.',
          'An edge joining two vertices on the same side means an odd cycle, so `bipartite` becomes false.',
        ],
        say: 'For "split into two sides so that every edge goes across", side[v] is 0 or 1: s gets side 0, and each newly labelled vertex gets the side opposite to the vertex that found it, side[u] ^ 1. Once s is placed every other side in its component is forced, so a component has exactly two valid splits (swap the sides) or none. Every edge is checked when its ends are scanned, and if one joins two vertices on the same side, `bipartite` becomes false. The search paths from s to its two ends have lengths of equal parity, so with that edge they form a closed walk of odd length, which contains an odd cycle. An odd cycle cannot alternate between two sides.',
      },
    ],
    terms: [
      '`explore`: the template function that labels the components and 2-colours them in one pass, returning `bipartite` (the TRD version splits this into `countComponents` and `bipartite`).',
      'adj[u]: the neighbours of u, with vertices numbered from 1 (`g` in the TRD version, numbered from 0).',
      'comp[v]: the number of v\'s connected component, −1 until v is visited (the TRD version only marks visited vertices, in `vis`, and counts the components).',
      '`id`: the number the next new component gets; at the end it equals the number of components.',
      '`st`: the stack of labelled vertices whose neighbours have not been scanned yet.',
      'side[v]: v\'s side in the 2-colouring, 0 or 1 (`col` in the TRD version).',
      '`bipartite`: true while every edge found joins two different sides; false once an edge inside one side, and so an odd cycle, turns up.',
      '`dr`, `dc`: the row and column offsets of a grid cell\'s four side neighbours; cell (r, c) of an R × C grid is vertex r·C + c + 1, so the template sees R·C vertices numbered from 1.',
    ],
    worked: {
      problem: { source: 'kattis', id: 'hoppers', name: 'Hoppers', difficulty: '3.5' },
      slides: [
        {
          title: 'A hopper jumps two links at a time',
          points: [
            'A network has n hosts and m two-way links, with n and m up to 5·10^5.',
            'A hopper on host u infects every host two links from u, and each newly infected host spreads it the same way.',
            'Print the fewest new links after which infecting a single host infects them all.',
          ],
          show: [0, 0],
          note: 'Sample 1: a hopper on 1 hops over 2 to 3, and from 3 only back to 1, so 2 is never infected.',
          say: 'A network has n hosts joined by m two-way links, with n and m up to 5·10^5. A hopper on host u infects every host two links from u, a neighbour of a neighbour, and each newly infected host spreads it the same way. You may add links, and want the fewest new links after which a hopper on some single host infects the whole network. In the first sample, 1–2–3, a hopper on 1 hops over 2 to 3 and back, and never infects 2. One new link, 1–3, fixes that, so the answer is 1.',
        },
        {
          title: 'Searching over new links is hopeless',
          points: [
            'About n²/2 ≈ 1.25·10^11 pairs of hosts could get a new link, far too many sets to try.',
            'Even testing one network by simulation means a run from each of its 5·10^5 hosts.',
            'So work out exactly which hosts a hopper infects, then count.',
          ],
          say: 'With n = 5·10^5 there are about n²/2, roughly 1.25·10^11, pairs of hosts that a new link could join, so trying sets of new links is out of the question. Even testing one network by simulation means a run from each of its 5·10^5 hosts. So first work out exactly which hosts a hopper infects, and count the links from that.',
        },
        {
          title: 'Hops follow walks of even length',
          points: [
            'A hopper on u infects w exactly when some walk from u to w uses an even number of links.',
            'In a bipartite component every link changes side, so u infects exactly the hosts on its own side.',
            'An odd cycle lets a walk switch between odd and even length, so then u infects its whole component.',
          ],
          show: [0, 1],
          note: 'Sample 1 after `explore`: 1 and 3 have side 0 and 2 has side 1, so a hopper on 1 infects exactly side 0.',
          say: 'A hop covers two links, so a hopper on u infects host w exactly when some walk from u to w, which may revisit hosts, uses an even number of links. Such a walk never leaves u\'s component. If the component is bipartite, every link changes side, so an even walk always ends on u\'s side, and the hopper infects that side and nothing else. If the component has an odd cycle, a walk can go once round it to turn an odd length into an even one, so every host in the component has an even walk from u and is infected.',
        },
        {
          title: 'Count components and look for an odd cycle',
          points: [
            'One run of `explore` gives `id`, the number of components, and `bipartite`, which is false once an odd cycle turns up.',
            'A hopper never leaves its component, so at least id − 1 new links are needed, and links between components close no cycle.',
            'Answer: id − 1 if `bipartite` is false; otherwise one more link must close an odd cycle, so id.',
          ],
          say: 'One run of the template\'s `explore` gives both facts: `id` ends as the number of components, and `bipartite` becomes false as soon as a link joins two hosts on the same side, which happens exactly when some component has an odd cycle. A hopper never leaves its component, so the network must end up connected, which takes at least id − 1 new links. If some component already has an odd cycle, id − 1 links joining the components into one are enough. If none has, a link between two components closes no cycle, so after id − 1 links the network is still bipartite and a hopper infects only its own side. With n ≥ 3 one side has two hosts, which are never linked already, and a link between them closes an odd cycle. So the answer is id − 1 when `bipartite` is false and id when it is true.',
        },
        {
          title: 'Sample 3: explore labels three components',
          points: [
            'Host 1 has no links, so it is component 0 on its own.',
            'From 2, the ring 2–3–4–5 becomes component 1, with sides 0, 1, 0, 1 going round.',
            'From 6, each host found takes the side opposite the host that found it.',
          ],
          show: [0, 2],
          note: 'Mid-run, in component 2: popping 12, on side 0, finds 7 already labelled with side 1, so the link 12–7 crosses sides.',
          say: 'Sample 3 has 12 hosts and 13 links. `explore` starts with s = 1, which has no links, so host 1 is component 0 by itself. From s = 2 the ring 2–3–4–5 becomes component 1, with sides 0, 1, 0, 1 going round it. From s = 6 the remaining hosts become component 2, each taking the side opposite the host that found it. In the picture 12, on side 0, has just been popped; its neighbour 7 is already labelled with side 1, so the link 12–7 joins different sides and `bipartite` stays true.',
        },
        {
          title: 'Every link crosses sides, so answer 3',
          points: [
            'All 13 links join side 0 to side 1, so `bipartite` stays true, and id = 3.',
            'Two new links join the three components; the network stays bipartite, so a third link must close an odd cycle.',
            'The answer is id = 3, as in the sample output.',
          ],
          show: [0, 3],
          note: 'The end of `explore` on sample 3: three components, and no link has both ends on the same side.',
          say: 'When `explore` finishes, every one of the 13 links joins a side-0 host to a side-1 host, so `bipartite` is still true, and `id` is 3. Two new links join the three components into one, but the result is still bipartite, so a hopper would infect only its own side. A third link, between two hosts on the same side, closes an odd cycle. So the answer is id = 3, which matches the sample output.',
        },
        {
          title: 'An odd cycle saves a link',
          points: [
            'In sample 2 every pair of the 5 hosts is linked. Popping 4 finds 3 on its own side: the triangle 1–3–4.',
            '`bipartite` becomes false and id = 1, so the answer is id − 1 = 0.',
            'O(n + m) in all. A host with no links is a component of its own; the explicit stack avoids deep recursion.',
          ],
          show: [0, 4],
          note: 'Sample 2, mid-run: 4 and 3 both have side 1, so the link 4–3 closes an odd cycle and `bipartite` becomes false.',
          say: 'In sample 2 every pair of the 5 hosts is linked. Popping host 1 gives 2, 5, 3 and 4 side 1; popping 4 then finds 3, also on side 1, so the link 4–3 closes the triangle 1–3–4, an odd cycle, and `bipartite` becomes false. There is one component, so the answer is id − 1 = 0: a hopper on any host already infects every host. `explore` is O(n + m), for n and m up to 5·10^5. A host with no links counts as a component of its own, and the explicit stack avoids recursion 5·10^5 calls deep.',
        },
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        scanf("%d %d", &u, &v);
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    // The template's explore: label components and 2-colour them with an explicit stack.
    vector<int> comp(n + 1, -1), side(n + 1, -1);
    bool bipartite = true;
    int id = 0;
    for (int s = 1; s <= n; s++) {
        if (comp[s] != -1) continue;
        vector<int> st = {s};
        comp[s] = id; side[s] = 0;
        while (!st.empty()) {
            int u = st.back(); st.pop_back();
            for (int v : adj[u]) {
                if (comp[v] == -1) {
                    comp[v] = id; side[v] = side[u] ^ 1;
                    st.push_back(v);
                } else if (side[v] == side[u]) bipartite = false;
            }
        }
        id++;
    }
    // id - 1 links join the components; with no odd cycle anywhere, one more link makes one.
    printf("%d\\n", bipartite ? id : id - 1);
}`,
    },
    spot: [
      'Symmetric reachability questions: "can he get from any X to any Y", "how many users will hear the news", "how many separate regions": connected components.',
      'A grid of cells with walls or colours and a question about areas, rooms or connected regions: flood fill, with cells as vertices and shared sides as edges.',
      '"Split into two groups so that every edge goes across", "every edge joins an odd and an even number", "no two adjacent vertices get the same label": 2-colouring (bipartite check).',
      'The question is whether some loop exists, or whether a component is a single ring: detect a non-parent visited neighbour during DFS, or compare edges with vertices per component.',
    ],
    disguises: [
      'Fewest new objects or roads so that everything becomes mutually reachable → number of components − 1, since one new link can merge two components (217A: drifts sharing an x or y coordinate are adjacent).',
      'Groups or cliques given as member lists → link consecutive members of each list; for a group of k, k − 1 path edges give the same components as the k(k − 1)/2 pairs (1167C).',
      'Orient edges, assign parities or label vertices so that every edge joins two different kinds → 2-colour the graph; it is possible exactly when there is no odd cycle (1144F, 1093D).',
      'Remove k cells and keep the rest connected → of the s empty cells, keep the first s − k a search discovers (they form a tree), or remove DFS-tree leaves first (377A).',
    ],
    pitfalls: [
      'Recursive DFS on 2·10^5 vertices, or on a 500 × 500 grid whose empty cells form one long snake, can overflow the stack; use an explicit stack or BFS when the depth can be large.',
      'With many test cases, allocate the adjacency lists and visited arrays for this test (size n) instead of clearing a global array of the maximum size maxN, which costs O(t · maxN) over t test cases when t is 3·10^5.',
      'In an undirected graph the edge back to the parent is not a cycle. Skip the parent (by edge id if multi-edges exist), or use the count rule: a component contains a cycle exactly when its edge count is at least its vertex count.',
    ],
    code: `// Components and 2-colouring with an explicit stack (no recursion depth limit).
// adj is 1-indexed. After the call: comp[v] = component id, side[v] = 0 or 1.
// Returns false if some edge joins two vertices on the same side (odd cycle).
bool explore(int n, const vector<vector<int>>& adj, vector<int>& comp, vector<int>& side) {
    comp.assign(n + 1, -1);
    side.assign(n + 1, -1);
    bool bipartite = true;
    int id = 0;
    for (int s = 1; s <= n; s++) {
        if (comp[s] != -1) continue;
        vector<int> st = {s};
        comp[s] = id; side[s] = 0;
        while (!st.empty()) {
            int u = st.back(); st.pop_back();
            for (int v : adj[u]) {
                if (comp[v] == -1) {
                    comp[v] = id; side[v] = side[u] ^ 1;
                    st.push_back(v);
                } else if (side[v] == side[u]) bipartite = false;
            }
        }
        id++;  // per-component facts (size, edge count, degrees) are gathered here
    }
    return bipartite;
}
// Grid version: an R x C grid has R * C vertices. Cell (r, c) is vertex r * C + c + 1,
// numbered from 1 like adj; its neighbours use these offsets. Call explore(R * C, ...).
const int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};`,
    resources: [
      { label: 'CP-Algorithms: Depth First Search', url: 'https://cp-algorithms.com/graph/depth-first-search.html' },
      { label: 'CP-Algorithms: Search for connected components', url: 'https://cp-algorithms.com/graph/search-for-connected-components.html' },
      { label: 'CP-Algorithms: Check whether a graph is bipartite', url: 'https://cp-algorithms.com/graph/bipartite-check.html' },
      { label: 'USACO Guide: Graph Traversal', url: 'https://usaco.guide/silver/graph-traversal' },
      { label: 'USACO Guide: Flood Fill', url: 'https://usaco.guide/silver/flood-fill' },
      { label: 'CSES: Building Teams (bipartite check)', url: 'https://cses.fi/problemset/task/1668' },
    ],
  },
  problems: [
    {
      id: '500A',
      name: 'New Year Transportation',
      rating: 1000,
      tier: 'warmup',
      hints: [
        'From cell i there is exactly one portal, and it only moves you to the right. How many different routes can start at cell 1?',
        'The portals form a directed graph in which every cell has one outgoing edge, so the cells reachable from 1 are a single chain 1 → 1 + a_1 → … . Reachability here is following that chain.',
        'Start at cur = 1 and repeat cur += a[cur] while cur < t. Print YES exactly when you stop on t. O(n).',
      ],
      solution: 'Follow the only path: cur = 1, then cur = cur + a[cur] while cur < t. Every jump moves strictly right, so the walk either lands on t or jumps past it; print YES exactly when cur == t. O(n). A general DFS over the n − 1 directed portal edges gives the same answer; the point is to read the portals as a graph.',
    },
    {
      id: '217A',
      name: 'Ice Skating',
      rating: 1200,
      tier: 'warmup',
      hints: [
        'When can Bajtek get from one drift directly towards another? Does it matter if a third drift lies between them?',
        'Make each drift a vertex and join two drifts when they share an x or a y coordinate. A drift in between only splits the slide into two moves inside the same component, so "can get from A to B" means "same connected component".',
        'Count the components c with a DFS over the n ≤ 100 drifts (checking all pairs, O(n²)). The answer is c − 1: a new drift at (x of one drift, y of another) merges two components.',
      ],
      solution: 'Vertices are drifts, with an edge when x_i = x_j or y_i = y_j; a slide stops at the first drift in its way, which is in the same row or column, so reachability is exactly connectivity. Count components c by DFS in O(n²) and print c − 1. A new drift is adjacent only to drifts in its row and its column, and each of those groups already lies inside one component, so it merges at most two components; placing it at (x_a, y_b) for drifts a and b in different components does merge two, so c − 1 drifts are needed and enough.',
    },
    {
      id: '1167C',
      name: 'News Distribution',
      rating: 1400,
      tier: 'core',
      hints: [
        'The news spreads along friendships until it cannot spread further. So the answer for user x is the size of what?',
        'It is the size of the connected component of x in the friendship graph. But a group of k users is a clique with k(k − 1)/2 edges, far too many to build when k = 5·10^5.',
        'You only need connectivity, not every friendship: join each group member to the next one in its list (k − 1 edges). Label components with an iterative DFS (or DSU), record each component size, and print size[comp[i]]. O(n + Σk).',
      ],
      solution: 'Replace each group by a path through its members; a path connects the same users as the clique, so the components are unchanged and the graph has fewer than Σk edges. Label components with an iterative DFS, count their sizes, and print size[comp[i]] for every user. Groups with k = 0 or k = 1 add no edges. O(n + Σk); a recursive DFS can overflow the stack on a chain of 5·10^5 users.',
    },
    {
      id: '977E',
      name: 'Cyclic Components',
      rating: 1500,
      tier: 'core',
      hints: [
        'Look at a component that is a single cycle. What is the degree of each of its vertices? Does the converse also hold?',
        'A connected component is a cycle exactly when every vertex in it has degree 2: a connected graph with all degrees equal to 2 is one closed ring, and without loops or multi-edges it has at least 3 vertices. So this is "find components, then check one property per component".',
        'Store degrees, then run DFS from each unvisited vertex with a flag that becomes false if any visited vertex has degree other than 2. Count the components whose flag stays true. O(n + m).',
      ],
      solution: 'Label components with an iterative DFS; for each component check that all its vertices have degree exactly 2, and count the components that pass. All degrees 2 and connected means edges = vertices and a single ring; isolated vertices and paths fail the check. O(n + m). Do not abandon the traversal when you meet a bad vertex: the unvisited rest of that component would later be counted as a new component.',
    },
    {
      id: '510B',
      name: 'Fox And Two Dots',
      rating: 1500,
      tier: 'core',
      hints: [
        'Look only at the dots of one colour and the edges between side-adjacent dots of that colour. What does "a cycle of at least 4 dots" mean in that graph?',
        'It is cycle detection in an undirected graph, and the length needs no check: a grid has no triangles (it is bipartite), so every cycle has at least 4 cells. A DFS finds a cycle exactly when it reaches an already visited cell that is not the cell it just came from.',
        'For each unvisited cell run dfs(cell, parent) that moves only to same-coloured neighbours; if a neighbour other than the parent is already visited, print Yes. O(nm). Equivalently, count cells V and same-colour adjacent pairs E per component: a cycle exists exactly when E ≥ V.',
      ],
      solution: 'Each colour class is an undirected graph on cells with edges between side-adjacent cells. Run a DFS that remembers the cell it came from; reaching a visited neighbour other than that parent closes a cycle, and every grid cycle has length at least 4 because the grid has no odd cycles. O(nm) with n, m ≤ 50. The usual mistake is counting the step back to the parent as a cycle, which makes any two adjacent same-coloured dots look like a cycle.',
    },
    {
      id: '377A',
      name: 'Maze',
      rating: 1600,
      tier: 'core',
      hints: [
        'Instead of choosing which k cells to wall up, choose which s − k cells to keep. What kind of set of cells is always connected?',
        'Any search from one empty cell discovers each new cell from a cell it has already discovered, so the first s − k cells it discovers form a tree and are connected. (Equivalently: removing a leaf of a DFS tree never disconnects the rest.)',
        'Count s, run DFS or BFS from any empty cell, and stop once s − k cells have been discovered; turn every other empty cell into X. O(nm).',
      ],
      solution: 'Run an iterative DFS or BFS from any empty cell and mark cells as kept when they are discovered, stopping after s − k cells. Every kept cell after the first was discovered from an earlier kept cell, so the kept cells form a connected tree; print X for every other empty cell. Deleting the first k cells in DFS post-order (children before parents) works for the same reason. O(nm) with up to 250 000 cells, so prefer an explicit stack or BFS to deep recursion.',
    },
    {
      id: '1144F',
      name: 'Graph Without Long Directed Paths',
      rating: 1700,
      tier: 'core',
      hints: [
        'Take any vertex v. If no directed path of length 2 may exist, can v have both an incoming and an outgoing edge?',
        'Every vertex must be all-out or all-in, and every edge must go from an all-out vertex to an all-in vertex. That is a 2-colouring: an orientation exists exactly when the graph is bipartite.',
        '2-colour the graph with DFS from vertex 1; if some edge joins two vertices of the same colour, print NO. Otherwise direct every edge from colour 0 to colour 1: character i is 0 if u_i has colour 0, else 1. O(n + m).',
      ],
      solution: 'A path of length 2 needs a vertex with an in-edge and an out-edge, so each vertex is a pure source or a pure sink, and every edge joins a source to a sink: a bipartition. 2-colour the connected graph with an iterative DFS; an edge inside one colour (an odd cycle) means NO. Otherwise print YES and, for each edge in input order, 0 when u_i is on side 0 and 1 otherwise. O(n + m). The sample output is the mirror image of this orientation; any valid answer is accepted.',
    },
    {
      id: '1093D',
      name: 'Beautiful Graph',
      rating: 1700,
      tier: 'challenge',
      hints: [
        'When is a + b odd for a, b ∈ {1, 2, 3}? What does that force for the two endpoints of every edge?',
        'Each edge must join an odd number (1 or 3) and an even number (2), so the vertices split into an odd side and an even side with every edge going across: a 2-colouring. A component that is not bipartite makes the answer 0, and a bipartite component has exactly two colourings (swap the sides).',
        'For each component, 2-colour it and count the vertices a and b on its two sides. If the first side is odd there are 2^a labellings (1 or 3 each, the other side all 2); if the second side is odd, 2^b. Multiply (2^a + 2^b) over all components mod 998244353.',
      ],
      solution: 'An odd sum means one endpoint is 2 and the other is 1 or 3, so a valid labelling is a 2-colouring in which the odd side has 2 choices per vertex. Colour each component with an iterative DFS; on a conflict the answer is 0. Otherwise a component with sides of sizes a and b has 2^a + 2^b labellings (an isolated vertex gives 3), and the answer is the product over components mod 998244353 with precomputed powers of 2. There are up to 3·10^5 tests, so allocate arrays of size n per test rather than resetting a maximum-size array each time.',
    },
  ],
};
