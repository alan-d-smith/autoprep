// BFS, multi-source BFS and state graphs: primer and problems.
export default {
  id: 'bfs',
  title: 'BFS, multi-source BFS and state graphs',
  track: 'graphs',
  summary: 'Find fewest-move answers in O(V + E) with BFS: from one source or many, on the reversed graph, with 0/1 move costs, and on graphs whose vertices are states (position plus whatever else matters) that you build from the statement.',
  primer: {
    slides: [
      {
        title: 'Fewest moves, all of equal cost',
        points: [
          'Clicks on a device, steps on a grid, minutes of a spreading fire.',
          'Trying move sequences is exponential: 4^20 ≈ 10^12 sequences of just 20 grid steps.',
          'DFS finds some path, not the shortest; DP needs a fill order, which a graph with cycles lacks.',
        ],
        say: 'Many problems ask for the fewest moves when every move costs the same: clicks on a device, steps on a grid, minutes of a spreading fire. Trying move sequences is exponential: there are 4^20, about 10^12, sequences of just 20 grid steps. A DFS finds some path but not necessarily the shortest, and DP needs an order in which to fill its states, which a graph with cycles does not have.',
      },
      {
        title: 'Reach vertices layer by layer',
        points: [
          'Distance d + 1 is exactly the not-yet-reached neighbours of the vertices at distance d.',
          'Reaching vertices nearest first, the first visit to a vertex is along a shortest path, so its distance is final.',
        ],
        show: [0, 21],
        note: 'Grey squares are walls. The BFS reaches the target T at distance 10 and can stop there: its first visit is final.',
        say: 'The vertices at distance 1 from the start are its neighbours, and the vertices at distance d + 1 are exactly the not-yet-reached neighbours of the vertices at distance d. So if you reach vertices layer by layer, nearest first, the first time a vertex is reached is along a shortest path, and its distance never needs revising.',
      },
      {
        title: 'A queue produces that order',
        points: [
          'dist[s] = 0 and s goes into `q`; every other dist[v] starts at −1.',
          'Take u from the front; each neighbour v in adj[u] with dist[v] = −1 gets dist[u] + 1 and joins the back.',
          'Setting dist on push, not on pop, puts each vertex in the queue once.',
        ],
        show: [0, 2],
        note: 'Early on: (1, 0) at distance 1 adds its unreached neighbours, at distance 2, to the back.',
        say: 'A first-in, first-out queue `q` produces that order. adj[u] lists the vertices one move from u, and dist[v] is −1 until v is first reached and then holds its distance; the start s gets dist[s] = 0 and goes into `q`. Repeatedly take u from the front of `q`, and for every neighbour v of u with dist[v] = −1, set dist[v] = dist[u] + 1 and add v at the back. Setting dist when a vertex is pushed, not when it is popped, means each vertex enters the queue once.',
      },
      {
        title: 'The queue stays sorted by distance',
        points: [
          'The queue holds vertices at distance d, then at d + 1, since popping d only adds d + 1 at the back.',
          'So vertices leave in order of distance, each first reached from the layer before, and its dist is final.',
          'Each vertex is pushed once and each edge examined from its start: O(V + E).',
        ],
        show: [0, 4],
        note: 'The queue holds one cell at distance 2, then two at distance 3, in order.',
        say: 'Why it is right: at every moment the queue holds some vertices at distance d followed by some at distance d + 1, because a vertex popped at distance d only adds vertices at d + 1 to the back. So vertices leave in order of distance, every vertex is first reached from a vertex in the layer before it, and its dist is final. Each vertex is pushed once and each edge examined once from its start (twice for an undirected edge), so the cost is O(V + E) for V vertices and E edges.',
      },
      {
        title: 'Multi-source BFS and 0-1 BFS',
        points: [
          'Start all `sources` at distance 0, and one pass gives each vertex its distance to the nearest.',
          'When moves cost w = 0 or 1, use a deque `dq`: 0-cost moves go to the front, 1-cost ones to the back.',
          'A vertex can now improve after it is reached, so update dist[v] when dist[u] + w < dist[v] instead of testing −1.',
        ],
        say: 'Put many `sources` in the queue at distance 0 and one pass gives every vertex its distance to the nearest of them (multi-source BFS), exactly like a BFS from one imaginary vertex joined to all of them, with every distance one smaller. To get every vertex\'s distance to a target set, reverse every edge and run one multi-source BFS from the targets. When each move costs w = 0 or w = 1, use a deque `dq` instead: a 0-cost move goes to the front and a 1-cost move to the back, which keeps it sorted by distance (0-1 BFS). A vertex can now improve after it was first reached, so update dist[v] when dist[u] + w < dist[v] instead of testing for −1.',
      },
      {
        title: 'The vertex is the whole state',
        points: [
          'If a move depends on more than where you are (direction, turns used, time), the vertex is the whole tuple.',
          'Generate moves from the rules, and number each state as one integer `id`, such as cell·4 + direction.',
          'Count the states before coding: the cost is O(states + moves).',
        ],
        say: 'The modelling step is choosing the vertices. When whether a move is allowed, or what it costs, depends on more than where you are (the direction you face, the turns used, the previous city, the time), the vertex is the tuple of all of it, and the moves are generated from the rules instead of being stored. Number each state as one integer `id`, such as cell·4 + direction, keep a flat dist array, and count the states before coding, since the cost is now O(states + moves).',
      },
    ],
    terms: [
      'adj[u]: the vertices one move from u; in the 0-1 version, pairs {v, w} of a vertex and the move\'s cost (`g` in the TRD version, and `adj01` for 0-1 BFS).',
      'dist[v]: the fewest moves from the source, or from the nearest source, to v; −1 until v is reached (INT_MAX in the 0-1 version).',
      '`q`: the first-in, first-out queue of reached vertices whose neighbours have not been scanned yet.',
      '`sources`: the vertices that start at distance 0; a single source gives the ordinary BFS (the argument of `multiBfs` in the TRD version, whose GraphBasics `bfs(s)` takes one source).',
      'w: the cost of a move in 0-1 BFS, 0 or 1.',
      '`dq`: the deque in the template\'s `bfs01`, with 0-cost moves pushed to the front and 1-cost moves to the back (`bfs01` is `zeroOneBfs` in the TRD version, with the same `dq`).',
      '`id`: a state numbered as one integer, such as cell·4 + direction, so that dist stays a flat array.',
    ],
    worked: {
      problem: { source: 'kattis', id: 'fire2', name: 'Fire', difficulty: '3.1' },
      slides: [
        {
          title: 'Run from a spreading fire',
          points: [
            'A w × h map, with w, h ≤ 1000, has walls, burning squares and your start; there are up to 100 maps.',
            'Each second the fire spreads to the four neighbours of every burning square, and you run to one neighbour.',
            'You may not enter a square that is burning or just catching fire. Print the fewest seconds to get off the map, or IMPOSSIBLE.',
          ],
          show: [0, 0],
          note: 'Sample map 2: two fires (*), your start (@), and one open square on the edge, (0, 3), the only way out.',
          say: 'Each test is a w by h map of up to 1000 by 1000 squares: walls, open squares, some squares on fire, and your start, with up to 100 maps. Every second the fire spreads to the four side neighbours of every burning square, and you run to one of your four neighbours. Neither of you crosses a wall. You may not run into a square that is burning or is just catching fire, but you may leave a square at the moment it catches fire. From an open square on the edge, one more second takes you out. Print the fewest seconds to get out, or IMPOSSIBLE.',
        },
        {
          title: 'Simulating second by second is too slow',
          points: [
            'Spreading the fire and moving every position you could be in rescans all 10^6 squares each second.',
            'In a winding maze the way out can take about 5·10^5 seconds: about 5·10^11 steps for one map.',
            'Instead, find once when each square catches fire.',
          ],
          say: 'The direct approach simulates second by second: spread the fire one step, then move every position you could be in one step. Each second rescans the 10^6 squares of a 1000 by 1000 map, and in a winding maze the way out can be about 5·10^5 squares long, so that is about 5·10^11 steps for one map, and there can be 100 maps. Instead, work out once when each square catches fire, and then search your own moves once.',
        },
        {
          title: 'One BFS from all the fires at once',
          points: [
            'fire[v] is the second square v catches fire: its fewest steps from the nearest fire, or −1 if never.',
            'Put every burning square in `q` at distance 0, as the `sources`: one O(wh) pass fills fire[v] for every square.',
            'Your moves also take a second each, so a second BFS gives your arrival times, dist[v].',
          ],
          show: [0, 1],
          note: 'fire[v] for every open square, from one BFS that starts with both fires at time 0. Your dist is 0 at the start only.',
          say: 'Fire spreads exactly like a BFS: a square catches fire one second after its first burning neighbour, so fire[v], the second at which square v catches fire, is its distance from the nearest fire, or −1 if no fire ever reaches it. That is a multi-source BFS: put every burning square in the queue `q` at distance 0, as the `sources`, and one O(wh) pass fills fire[v] for the whole map. Your own moves also take one second each, so your earliest arrival times come from a second BFS, whose distances are dist.',
        },
        {
          title: 'Your BFS, with a deadline on every square',
          points: [
            'From u, enter a neighbour v only if fire[v] = −1 or dist[u] + 1 < fire[v].',
            'Arriving earlier never hurts, since the fire only grows, so the state is the square alone, without the time.',
            'From a reached square on the edge you are out a second later: the answer is the least such dist + 1.',
          ],
          say: 'Your BFS is the template\'s with one extra test: from u you may enter a neighbour v at time dist[u] + 1 only if v never burns or catches fire later, that is, fire[v] = −1 or dist[u] + 1 < fire[v]. Leaving u as it catches fire is allowed, so u itself needs no test. The time does not need to be part of the state: the fire only grows, so being somewhere earlier is never worse than being there later, and BFS reaches every square at its earliest possible time. So the state is just the square. From any reached square on the edge you step out one second later, so the answer is the smallest dist + 1 over those squares, or IMPOSSIBLE if you reach none.',
        },
        {
          title: 'Sample: the fire closes in from both sides',
          points: [
            'You start at (4, 3). Popping (2, 3) at time 2, you may enter (1, 3) at 3, before its fire at 4.',
            '(2, 2) and (2, 4) are refused: the fire is there at 2, before you could arrive at 3.',
          ],
          show: [0, 2],
          note: 'Your BFS mid-run: popping (2, 3) at time 2 accepts (1, 3), as 3 < 4, and refuses (2, 2) and (2, 4), which burn at 2.',
          say: 'In sample map 2, with rows and columns numbered from 0, the fires start at (1, 1) and (1, 5), you start at (4, 3), and the only open square on the edge is (0, 3). Your BFS reaches three squares at time 1 and five more at time 2. In the picture it pops (2, 3), reached at time 2. It accepts (1, 3), since you would arrive at 3 and the fire only at 4. It refuses (2, 2) and (2, 4): the fire arrives there at 2, before you could at 3.',
        },
        {
          title: 'One step ahead of the fire',
          points: [
            'Up column 3 you reach (2, 3), (1, 3) and (0, 3) at 2, 3 and 4; the fire reaches them at 3, 4 and 5.',
            '(0, 3) is on the edge, so you are out at 4 + 1 = 5, the sample\'s answer for this map.',
          ],
          show: [0, 3],
          note: 'The end of your BFS: the way out (green) enters every square before it burns, from (2, 3) on by one second.',
          say: 'Your BFS goes up column 3, reaching (3, 3), (2, 3), (1, 3) and (0, 3) at times 1, 2, 3 and 4, while the fire reaches them at 4, 3, 4 and 5. Every square on the way is entered strictly before it burns. (0, 3) is on the edge, so you step out one second later, at 5, which is the sample\'s answer for this map.',
        },
        {
          title: 'When the fire wins, and the cost',
          points: [
            'In map 3 your only way to the edge passes (1, 3), which burns at 2, before you could reach it at 3: IMPOSSIBLE.',
            'Two BFS passes are O(wh) per map: about 2·10^8 steps over 100 maps of 10^6 squares.',
            'Starting on the edge gives 1. A square no fire reaches keeps fire[v] = −1 and never blocks you.',
          ],
          show: [0, 4],
          note: 'Sample map 3 at the end: the fire reaches (1, 3) and (2, 4) before you could (red), and no square you reach is on the edge.',
          say: 'In sample map 3 your only way to the edge is through (1, 3) to (0, 3), but the fire reaches (1, 3) at 2, and you could get there at 3 at the earliest. No square you reach is on the edge, so the answer is IMPOSSIBLE. Each BFS handles every square once, so a map costs O(wh), about 2·10^8 steps over 100 maps of 10^6 squares. If you start on the edge, the answer is 1. A square v that no fire can reach keeps fire[v] = −1 and never blocks you.',
        },
      ],
      code: `#include <bits/stdc++.h>
using namespace std;

int w, h;
vector<string> g;
const int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};

// Multi-source BFS over open squares, id = r * w + c. A square v may only be entered
// at time t < fire[v] (fire[v] = -1: it never burns). With no fire limit, this is plain BFS.
vector<int> bfs(const vector<int>& sources, const vector<int>& fire) {
    vector<int> dist(w * h, -1);
    queue<int> q;
    for (int s : sources) { dist[s] = 0; q.push(s); }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int r = u / w + dr[k], c = u % w + dc[k], v = r * w + c;
            if (r < 0 || r >= h || c < 0 || c >= w || g[r][c] == '#' || dist[v] != -1) continue;
            if (fire[v] != -1 && dist[u] + 1 >= fire[v]) continue;
            dist[v] = dist[u] + 1;
            q.push(v);
        }
    }
    return dist;
}

int main() {
    int tests;
    cin >> tests;
    while (tests--) {
        cin >> w >> h;
        g.assign(h, "");
        for (auto& row : g) cin >> row;
        vector<int> fires, me;
        for (int r = 0; r < h; r++)
            for (int c = 0; c < w; c++) {
                if (g[r][c] == '*') fires.push_back(r * w + c);
                if (g[r][c] == '@') me.push_back(r * w + c);
            }
        vector<int> fire = bfs(fires, vector<int>(w * h, -1));
        vector<int> dist = bfs(me, fire);
        int best = INT_MAX;  // leave from any reached square on the edge, one second later
        for (int r = 0; r < h; r++)
            for (int c = 0; c < w; c++)
                if ((r == 0 || r == h - 1 || c == 0 || c == w - 1) && dist[r * w + c] != -1)
                    best = min(best, dist[r * w + c] + 1);
        if (best == INT_MAX) cout << "IMPOSSIBLE\\n";
        else cout << best << "\\n";
    }
}`,
    },
    spot: [
      '"Minimum number of moves, clicks, steps or minutes" where every move costs the same: BFS, not DP or Dijkstra.',
      'Many starting points spreading at once (fires, infections, shops), or "distance to the nearest X" for every cell: multi-source BFS.',
      'A distance asked for every starting vertex but towards a fixed set of targets: reverse the edges and run one BFS from the targets.',
      'Whether a move is allowed, or what it costs, depends on history (direction, turns used, previous city, time of day): BFS over states (position, extra info); if some moves are free and others cost 1, use 0-1 BFS.',
    ],
    disguises: [
      'A device whose buttons change a number → BFS over the numbers it can display, capped at the largest useful value (520B), or the same search run backwards from the target.',
      '"For each i, the fewest jumps to any position with property P" → reverse every jump and run one multi-source BFS from all positions with P (1272E).',
      '"Cheapest s different types of goods for every town" with only k ≤ 100 types → k multi-source BFS passes, one per type, instead of n single-source ones (986A).',
      'Forbidden triples of consecutive cities, a limit on turns or a timetable → the vertex is (previous city, city), (cell, direction) or (place, time) (59E, 793B). UKIEPC 2023 Journey of Recovery searches such a time-expanded graph backwards from the destination.',
    ],
    pitfalls: [
      'Marking a vertex visited when it is popped instead of when it is pushed lets the queue hold many copies of it (up to O(E)), which runs out of time or memory. Set dist when you push.',
      'Count the states before coding: 10^6 cells × 4 directions is fine, × 4 directions × 10^3 times is not. Store a state as one integer id with a flat dist array, not a map of tuples.',
      'Plain BFS (first visit is final) gives wrong distances once moves have different costs. 0/1 costs need a deque (0-1 BFS) or Dijkstra; re-pushing improved vertices to the back of an ordinary queue is correct but can be slow.',
    ],
    code: `// Multi-source BFS: every source starts at distance 0. One source is the usual BFS.
// For a state graph, number the states (e.g. id = cell * 4 + direction) and
// generate neighbours on the fly instead of storing adj.
vector<int> bfs(const vector<vector<int>>& adj, const vector<int>& sources) {
    vector<int> dist(adj.size(), -1);
    queue<int> q;
    for (int s : sources) if (dist[s] == -1) { dist[s] = 0; q.push(s); }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u])
            if (dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); }
    }
    return dist;  // -1 = unreachable
}
// 0-1 BFS: every edge costs 0 or 1. adj[u] holds {v, w}.
vector<int> bfs01(const vector<vector<pair<int, int>>>& adj, int s) {
    vector<int> dist(adj.size(), INT_MAX);
    deque<int> dq;
    dist[s] = 0; dq.push_back(s);
    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();
        for (auto [v, w] : adj[u])
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.push_front(v); else dq.push_back(v);
            }
    }
    return dist;
}`,
    resources: [
      { label: 'CP-Algorithms: Breadth-first search', url: 'https://cp-algorithms.com/graph/breadth-first-search.html' },
      { label: 'CP-Algorithms: 0-1 BFS', url: 'https://cp-algorithms.com/graph/01_bfs.html' },
      { label: 'USACO Guide: Unweighted Shortest Paths', url: 'https://usaco.guide/gold/unweighted-shortest-paths' },
      { label: 'CSES: Labyrinth (BFS with path recovery)', url: 'https://cses.fi/problemset/task/1193' },
      { label: 'CSES: Monsters (multi-source BFS)', url: 'https://cses.fi/problemset/task/1194' },
    ],
  },
  problems: [
    {
      id: '520B',
      name: 'Two Buttons',
      rating: 1400,
      tier: 'warmup',
      hints: [
        'Each click turns the displayed number x into 2x or x − 1, and every click costs the same. What graph are you walking on?',
        'The numbers are vertices and the buttons are edges, so the fewest clicks is the BFS distance from n to m. The graph is infinite, but an optimal sequence never shows a number above max(n, 2m), so the numbers 1..2·10^4 are enough.',
        'BFS from n over 1..20000 with neighbours 2x and x − 1 (staying ≥ 1) and print dist[m]. Alternatively, work backwards from m: add 1 if it is odd, halve it if it is even, until it is ≤ n, then add n − m; each step is one click.',
      ],
      solution: 'Treat each number 1..20000 as a vertex with edges x → 2x and x → x − 1, BFS from n, and print dist[m]; the cap is safe because doubling a number that is already ≥ m only creates extra subtractions, so no optimal sequence goes above max(n, 2m). O(10^4). The backwards greedy (from m: +1 if odd, halve if even, until ≤ n, then add the difference) is the same search on the reversed operations, where the choice is forced.',
    },
    {
      id: '35C',
      name: 'Fire Again',
      rating: 1500,
      tier: 'warmup',
      hints: [
        'The fire spreads one tree per minute in four directions, starting from K trees at once. When does a given tree start burning, in terms of the K starting trees?',
        'A tree ignites at its distance to the nearest starting tree, so this is multi-source BFS: put all K burning trees in the queue at distance 0 and run a single BFS. BFS takes cells out in order of distance, so the last cell taken out is a correct answer.',
        'Run that BFS on the N × M grid (up to 4·10^6 cells) with flat int arrays for dist and the queue, and print the last cell dequeued. Read from input.txt and write to output.txt, as the statement says.',
      ],
      solution: 'Push all K sources at distance 0 and run one BFS over the grid; the last cell dequeued has the largest distance to its nearest source. O(NM) with N, M ≤ 2000; flat int arrays for dist and the queue (32 MB together) keep you under the 64 MB limit. With no obstacles, min over sources of |x − x_i| + |y − y_i| for every cell (O(NMK)) also passes. The most common mistake is reading standard input: this problem uses input.txt and output.txt.',
    },
    {
      id: '986A',
      name: 'Fair',
      rating: 1600,
      tier: 'core',
      hints: [
        'For a fixed town v, what does it cost to bring goods of type t? You need that number for every pair (town, type).',
        'The cost for (v, t) is the distance from v to the nearest town that produces t. A BFS from each of the n towns is too slow, but there are only k ≤ 100 types, and one multi-source BFS from all towns of type t gives that distance for every v at once.',
        'Run k BFS passes, pass t starting from every town of type t, to fill dist[t][v]. For each town take the s smallest of its k values (nth_element or sort) and add them up. O(k·(n + m) + n·k).',
      ],
      solution: 'For each type t, run a BFS seeded with all towns producing t, so dist[t][v] is the cost of the nearest unit of type t for town v. The types are chosen independently, so the answer for v is the sum of the s smallest dist[t][v] over the k types. That is at most 100 BFS passes over 10^5 vertices and edges, about 2·10^7 steps, plus nth_element per town. dist takes k·n ints (40 MB), well within 512 MB.',
    },
    {
      id: '793B',
      name: 'Igor and his way to work',
      rating: 1600,
      tier: 'core',
      hints: [
        'Knowing only which cell Igor is in does not tell you whether his next move is a turn. What else must you remember?',
        'Make the state (cell, direction he is moving). Stepping forward in the same direction costs no turn and changing direction costs one turn, so this is a shortest path on a state graph with edge costs 0 and 1.',
        'Run 0-1 BFS from the four states (S, d) with 0 turns: forward steps go to the front of the deque, direction changes to the back. Print YES if some (T, d) needs at most 2 turns. 4·n·m ≤ 4·10^6 states, O(nm).',
      ],
      solution: 'States are (cell, direction), 4·n·m of them. From (c, d) you can step to the next cell in direction d if it has no road works (cost 0) or switch to another direction in place (cost 1); the four states at S start with cost 0. 0-1 BFS gives the minimum number of turns for every state, and the answer is YES exactly when min over d of turns(T, d) ≤ 2. O(nm). A plain BFS over (cell, direction, turns used ≤ 2) also works with 3 times as many states and no deque.',
    },
    {
      id: '1063B',
      name: 'Labyrinth',
      rating: 1800,
      tier: 'core',
      hints: [
        'Suppose a path ends in column j after L moves left and R moves right. What is R − L, whichever path you took?',
        'R − L = j − c is fixed by the target column, so the path with the fewest left moves also has the fewest right moves. Up and down moves are free, so this is a shortest path where a left move costs 1 and every other move costs 0: 0-1 BFS.',
        '0-1 BFS from (r, c), with left moves pushed to the back of the deque and up, down and right moves to the front, gives the minimum L for every cell. A cell counts exactly when L ≤ x and L + (j − c) ≤ y. O(nm) for up to 4·10^6 cells.',
      ],
      solution: 'Because rights − lefts equals j − c on every path to column j, minimising left moves minimises both counts at once. A 0-1 BFS (cost 1 for left, 0 otherwise) computes the minimum number of left moves L for every free cell; count the cells with L ≤ x and L + j − c ≤ y. O(nm). A plain BFS by number of steps is wrong: the shortest path to a cell may use more left moves than a longer detour that goes up and around an obstacle.',
    },
    {
      id: '1272E',
      name: 'Nearest Opposite Parity',
      rating: 1900,
      tier: 'core',
      hints: [
        'A BFS from every position i is O(n²). But every odd-valued position is looking for the same kind of target. Can you search in the other direction?',
        'Reverse the jumps: add an edge j → i whenever i can jump to j. The distance from i to the nearest even-valued position is then the distance from the set of all even-valued positions to i in the reversed graph: one multi-source BFS. Do it once with even sources and once with odd sources.',
        'Build radj with i added to radj[i − a_i] and radj[i + a_i] (when in range). BFS from all even-valued positions at distance 0 and read the answer for the odd-valued ones; repeat with odd sources for the even-valued ones. Unreached positions get −1. O(n).',
      ],
      solution: 'Each position has at most two jumps, so the reversed graph has at most 2n edges. A multi-source BFS from all positions with even a_j on the reversed graph gives every position its fewest forward jumps to some even-valued position; record it for the odd-valued positions, then repeat with odd-valued sources for the even-valued ones. O(n). A BFS from the targets on the original (non-reversed) edges computes the wrong direction: it measures jumps from the targets, not to them.',
    },
    {
      id: '59E',
      name: 'Shortest Path',
      rating: 2000,
      tier: 'challenge',
      hints: [
        'Whether you may go from city v to city w depends on the city you were in just before v. What must a vertex of your search remember?',
        'Make the state the last road taken, (u, v) with u the previous city. From (u, v) you may go to (v, w) for each neighbour w unless (u, v, w) is forbidden. Every road costs the same, so BFS over the 2m directed roads gives the shortest valid route, and a city may appear twice on it (sample 3).',
        'Seed the queue with every road (1, w) at distance 1, keep the forbidden triples in a sorted vector of encoded integers, store a parent per state, and stop at the first popped state that ends in n; print −1 if there is none. Check whether (v, w) is already visited before looking up the triple.',
      ],
      solution: 'BFS on directed roads: state (u, v) means "in v, arrived from u". Start from every road (1, w) at distance 1; from (u, v) move to an unvisited (v, w) unless (u, v, w) is forbidden; the first popped state with v = n gives the distance, and parent pointers rebuild the path. Checking visited first means at most k + 2m triple lookups, and the remaining work is Σ deg(v)², at most about 1.2·10^8 cheap array checks, fine in 3 seconds. A BFS on cities alone is wrong: the shortest way into a city may be blocked for the next step while a longer way in is not.',
    },
    {
      id: '1520G',
      name: 'To Go Or Not To Go?',
      rating: 2200,
      tier: 'challenge',
      hints: [
        'Can it ever help to use the portals twice? Compare jumping a → b and later c → d with jumping a → d directly.',
        'One portal jump is always enough: a → b then c → d costs a + b + c + d, more than a → d. So the route is either a pure walk, or walk to a portal, jump once, and walk from another portal. Walking costs w per step, which is BFS from the start and BFS from the end.',
        'BFS from (1, 1) and from (n, m) over free cells. Let bestS = min over portals p reachable from the start of distS(p)·w + a_p, and bestT the same with distT. The answer is min(distS(n, m)·w, bestS + bestT), or −1. Use long long throughout. O(nm).',
      ],
      solution: 'One portal jump always suffices, since two jumps a → b, c → d cost more than the single jump a → d. BFS from both corners gives step counts distS and distT; the answer is the minimum of distS(n, m)·w and min_p(distS(p)·w + a_p) + min_q(distT(q)·w + a_q), each minimum taken over portals reachable from that side. If both minima pick the same portal the sum is still at least the walk through it, so no special case is needed. O(nm) with long long: 4·10^6 steps × 10^9 overflows int, and 4·10^6 numbers of input want fast reading.',
    },
  ],
};
