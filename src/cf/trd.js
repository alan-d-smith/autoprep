// Template code written against the team reference document at
// github.com/alan-d-smith/competitive-programming (trd/), which is based on KACTL.
// Each entry lists the files it relies on: 'trd' files are in that TRD; 'kactl' files are
// KACTL components the TRD doesn't include. Every snippet compiles (g++ -std=c++20) after
// the TRD's template.cpp and the listed headers.

export const TRD_REPO = 'https://github.com/alan-d-smith/competitive-programming/tree/main/trd';

const trd = (file) => ({ file, from: 'trd' });
const kactl = (file) => ({ file, from: 'kactl' });

export const TRD_CODE = {
  'prefix-sums': {
    uses: [trd('template.cpp'), trd('StdMath.cpp')],
    code: `// P[i] = a[0] + ... + a[i-1]; the sum of a[l..r] is P[r+1] - P[l].
vector<ll> prefix(const vector<ll>& a) {
	vector<ll> P(sz(a) + 1);
	partial_sum(all(a), P.begin() + 1); // StdMath.cpp
	return P;
}

// Subarrays with sum exactly k: pairs l < r with P[r] - P[l] == k.
ll countSubarrays(const vector<ll>& a, ll k) {
	map<ll, ll> seen{{0, 1}}; // P[0] = 0 is a valid left end
	ll P = 0, res = 0;
	for (ll x : a) {
		P += x;
		if (auto it = seen.find(P - k); it != seen.end()) res += it->second;
		seen[P]++;
	}
	return res;
}

// S[i][j] = sum of g[0..i-1][0..j-1], the top-left i-by-j block; any rectangle by inclusion-exclusion.
vector<vector<ll>> prefix2D(const vector<vector<ll>>& g) {
	int n = sz(g), m = sz(g[0]);
	vector<vector<ll>> S(n + 1, vector<ll>(m + 1));
	rep(i,0,n) rep(j,0,m) S[i+1][j+1] = g[i][j] + S[i][j+1] + S[i+1][j] - S[i][j];
	return S;
}`,
  },

  'difference-arrays': {
    uses: [trd('template.cpp'), trd('StdMath.cpp'), trd('IntervalContainer.h')],
    code: `// Add v to a[l..r] for each update, then one partial_sum (StdMath.cpp) rebuilds a.
vector<ll> applyRanges(int n, const vector<tuple<int, int, ll>>& ups) {
	vector<ll> d(n + 1);
	for (auto [l, r, v] : ups) d[l] += v, d[r + 1] -= v;
	partial_sum(all(d), d.begin());
	d.pop_back();
	return d;
}

// Covered length of a union of half-open intervals [L, R), merged as they
// arrive by IntervalContainer.h. Pairs are int: for an inclusive [l, r] pass {l, r + 1};
// coordinates up to 10^18 need the event sweep instead.
ll coveredLength(const vector<pii>& segs) {
	set<pii> is;
	for (auto [L, R] : segs) addInterval(is, L, R);
	ll len = 0;
	for (auto [L, R] : is) len += R - L;
	return len;
}`,
  },

  'dp-basics': {
    uses: [trd('template.cpp'), trd('ModBinomial.cpp')],
    code: `// Max sum with never more than K taken in a row.
// dp[s] = best so far, ending in a run of s taken.
ll bestNoLongRun(const vector<ll>& a, int K) {
	const ll NEG = LLONG_MIN / 4;
	vector<ll> dp(K + 1, NEG);
	dp[0] = 0;
	for (ll x : a) {
		vector<ll> nd(K + 1, NEG);
		rep(s,0,K+1) if (dp[s] != NEG) {
			nd[0] = max(nd[0], dp[s]);                    // skip
			if (s < K) nd[s+1] = max(nd[s+1], dp[s] + x); // take
		}
		dp = nd;
	}
	return *max_element(all(dp));
}

// Counting version, mod from ModBinomial.cpp: binary strings of
// length n with never more than K ones in a row.
ll countNoLongRun(int n, int K) {
	vector<ll> dp(K + 1);
	dp[0] = 1;
	rep(i,0,n) {
		vector<ll> nd(K + 1);
		rep(s,0,K+1) {
			nd[0] = (nd[0] + dp[s]) % mod;
			if (s < K) nd[s+1] = (nd[s+1] + dp[s]) % mod;
		}
		dp = nd;
	}
	return accumulate(all(dp), 0LL) % mod;
}`,
  },

  lis: {
    uses: [trd('template.cpp'), trd('LIS.h')],
    code: `// LIS.h: indices of one longest strictly increasing subsequence, O(n log n).
// Non-decreasing: change p{S[i], 0} to p{S[i], i} inside lis (see its comment).
int lisLength(const vector<ll>& a) { return sz(lis(a)); }

// Longest decreasing subsequence: the LIS of the negated values.
int ldsLength(const vector<ll>& a) {
	vector<ll> neg(sz(a));
	rep(i,0,sz(a)) neg[i] = -a[i];
	return sz(lis(neg));
}

// Nesting envelopes (w, h): sort by w, equal w by h descending,
// so two of the same width can't chain, then LIS on h.
int maxNested(vector<pair<ll, ll>> env) {
	sort(all(env), [](auto& p, auto& q) {
		return p.first < q.first || (p.first == q.first && p.second > q.second);
	});
	vector<ll> h;
	for (auto& [w, ht] : env) h.push_back(ht);
	return sz(lis(h));
}

// Fewest non-increasing sequences covering a = lisLength(a) (Dilworth).`,
  },

  lcs: {
    uses: [trd('template.cpp')],
    code: `// The TRD has no LCS: the plain table, written with its macros.
int lcs(const string& a, const string& b) {
	vector<vi> dp(sz(a) + 1, vi(sz(b) + 1));
	rep(i,1,sz(a)+1) rep(j,1,sz(b)+1)
		dp[i][j] = a[i-1] == b[j-1] ? dp[i-1][j-1] + 1
		                            : max(dp[i-1][j], dp[i][j-1]);
	return dp[sz(a)][sz(b)];
}

// Edit distance with two rolling rows: O(nm) time, O(m) memory.
int editDistance(const string& a, const string& b) {
	vi prv(sz(b) + 1), cur(sz(b) + 1);
	iota(all(prv), 0);
	rep(i,1,sz(a)+1) {
		cur[0] = i;
		rep(j,1,sz(b)+1)
			cur[j] = min({prv[j] + 1, cur[j-1] + 1, prv[j-1] + (a[i-1] != b[j-1])});
		swap(prv, cur);
	}
	return prv[sz(b)];
}

// Longest palindromic subsequence = LCS of s and its reverse.
int lps(const string& s) { return lcs(s, string(s.rbegin(), s.rend())); }`,
  },

  knapsack: {
    uses: [trd('template.cpp'), trd('FastKnapsack.h'), trd('StdContainers.cpp')],
    code: `// FastKnapsack.h: the largest subset sum <= t, in O(n * max w).
int bestFill(const vi& w, int t) { return knapsack(w, t); }

// Every reachable subset sum with a bitset (StdContainers.cpp): O(n S / 64).
const int S = 100000;
bitset<S + 1> reachable(const vi& w) {
	bitset<S + 1> can;
	can[0] = 1;
	for (int x : w) can |= can << x;
	return can;
}

// 0/1 knapsack with values: capacity downwards so each item is used once.
ll knapsack01(const vector<pair<int, ll>>& items, int C) {
	vector<ll> dp(C + 1);
	for (auto [wt, val] : items)
		for (int c = C; c >= wt; c--) dp[c] = max(dp[c], dp[c - wt] + val);
	return dp[C];
}`,
  },

  'interval-dp': {
    uses: [trd('template.cpp'), trd('StdMath.cpp'), kactl('KnuthDP.h')],
    code: `// dp[l][r] over intervals, filled by increasing length.
// Longest palindromic subsequence of s[l..r].
int lps(const string& s) {
	int n = sz(s);
	vector<vi> dp(n, vi(n));
	rep(len,1,n+1) rep(l,0,n-len+1) {
		int r = l + len - 1;
		if (len == 1) dp[l][r] = 1;
		else if (s[l] == s[r]) dp[l][r] = (len == 2 ? 0 : dp[l+1][r-1]) + 2;
		else dp[l][r] = max(dp[l+1][r], dp[l][r-1]);
	}
	return n ? dp[0][n-1] : 0;
}

// Cheapest way to merge a[l..r] into one pile, paying each merged pile's size:
// dp[l][r] = min over k of dp[l][k] + dp[k+1][r], plus sum(l, r).
// When the best k only moves right, KACTL's KnuthDP.h makes it O(n^2).
ll mergeCost(const vector<ll>& a) {
	int n = sz(a);
	vector<ll> P(n + 1);
	partial_sum(all(a), P.begin() + 1); // StdMath.cpp
	vector<vector<ll>> dp(n, vector<ll>(n));
	rep(len,2,n+1) rep(l,0,n-len+1) {
		int r = l + len - 1;
		dp[l][r] = LLONG_MAX;
		rep(k,l,r) dp[l][r] = min(dp[l][r], dp[l][k] + dp[k+1][r]);
		dp[l][r] += P[r+1] - P[l];
	}
	return n ? dp[0][n-1] : 0;
}`,
  },

  'bitmask-dp': {
    uses: [trd('template.cpp'), trd('SubsetSums.cpp')],
    code: `// dp[mask][v] = cheapest path visiting exactly the nodes in mask, ending at v.
ll shortestHamiltonPath(const vector<vector<ll>>& d) {
	int n = sz(d);
	const ll INF = LLONG_MAX / 4;
	vector<vector<ll>> dp(1 << n, vector<ll>(n, INF));
	rep(v,0,n) dp[1 << v][v] = 0;
	rep(mask,1,1 << n) rep(v,0,n) if (dp[mask][v] < INF)
		rep(u,0,n) if (!(mask >> u & 1))
			dp[mask | 1 << u][u] = min(dp[mask | 1 << u][u], dp[mask][v] + d[v][u]);
	return *min_element(all(dp[(1 << n) - 1]));
}

// Sums over submasks, as in SubsetSums.cpp: D[m] becomes the sum of D[s] over s inside m.
void sumOverSubsets(vector<ll>& D, int K) {
	rep(b,0,K) rep(i,0,1 << K)
		if (i & 1 << b) D[i] += D[i ^ (1 << b)];
}`,
  },

  'dp-structures': {
    uses: [trd('template.cpp'), trd('SegmentTree.h'), kactl('FenwickTree.h'), kactl('LazySegmentTree.h')],
    code: `// Inversions with KACTL's FenwickTree.h: ft.query(pos) sums [0, pos).
ll inversions(const vi& a) {
	vi xs = a;
	sort(all(xs)), xs.erase(unique(all(xs)), xs.end());
	FT ft(sz(xs));
	ll inv = 0;
	for (int i = sz(a); i--;) {
		int k = lower_bound(all(xs), a[i]) - xs.begin();
		inv += ft.query(k); // later values smaller than a[i]
		ft.update(k, 1);
	}
	return inv;
}

// Heaviest increasing subsequence with the TRD's SegmentTree.h (max, query [b, e)):
// best[i] = w[i] + max best[j] over j < i with a[j] < a[i], keyed by compressed a.
// Tree::T is int; change the typedef to ll when sums can pass 2^31.
int heaviestIncreasing(const vi& a, const vi& w) {
	vi xs = a;
	sort(all(xs)), xs.erase(unique(all(xs)), xs.end());
	Tree t(sz(xs), 0);
	int best = 0;
	rep(i,0,sz(a)) {
		int k = lower_bound(all(xs), a[i]) - xs.begin();
		int cur = max(0, t.query(0, k)) + w[i]; // query(0, 0) is the unit, INT_MIN
		t.update(k, max(t.query(k, k + 1), cur));
		best = max(best, cur);
	}
	return best;
}

// Range add with range max: KACTL's LazySegmentTree.h.
int maxAfterAdd(vi v, int L, int R, int x) {
	Node* tr = new Node(v, 0, sz(v));
	tr->add(L, R, x); // [L, R)
	return tr->query(0, sz(v));
}`,
  },

  dfs: {
    uses: [trd('template.cpp'), trd('GraphBasics.cpp'), trd('UnionFind.h')],
    code: `// GraphBasics.cpp: readGraph() fills g (0-indexed); dfs(u) marks vis.
int countComponents() {
	int c = 0;
	rep(u,0,n) if (!vis[u]) c++, dfs(u);
	return c;
}

// The same with UnionFind.h: no recursion depth to worry about.
int countComponentsUF() {
	UF uf(n);
	int c = n;
	rep(u,0,n) for (int v : g[u]) c -= uf.join(u, v);
	return c;
}

// Bipartite check by 2-colouring, iterative so a 2e5-long path can't overflow the stack.
bool bipartite(vi& col) {
	col.assign(n, -1);
	rep(s,0,n) if (col[s] < 0) {
		col[s] = 0;
		vi st{s};
		while (!st.empty()) {
			int u = st.back(); st.pop_back();
			for (int v : g[u]) {
				if (col[v] < 0) col[v] = col[u] ^ 1, st.push_back(v);
				else if (col[v] == col[u]) return false;
			}
		}
	}
	return true;
}`,
  },

  bfs: {
    uses: [trd('template.cpp'), trd('GraphBasics.cpp'), trd('StdContainers.cpp')],
    code: `// GraphBasics.cpp: vi d = bfs(s); d[v] is -1 if v is unreachable.
int distance(int s, int t) { return bfs(s)[t]; }

// Multi-source: every source starts at distance 0, otherwise the same loop as bfs.
vi multiBfs(const vi& sources) {
	vi dist(n, -1);
	queue<int> q;
	for (int s : sources) dist[s] = 0, q.push(s);
	while (!q.empty()) {
		int u = q.front(); q.pop();
		for (int v : g[u]) if (dist[v] < 0) dist[v] = dist[u] + 1, q.push(v);
	}
	return dist;
}

// 0-1 BFS with a deque (StdContainers.cpp): weight-0 edges go to the front.
vi zeroOneBfs(const vector<vector<pii>>& adj01, int s) {
	vi dist(sz(adj01), INT_MAX);
	deque<int> dq{s};
	dist[s] = 0;
	while (!dq.empty()) {
		int u = dq.front(); dq.pop_front();
		for (auto [v, w] : adj01[u]) if (dist[u] + w < dist[v]) {
			dist[v] = dist[u] + w;
			w ? dq.push_back(v) : dq.push_front(v);
		}
	}
	return dist;
}`,
  },

  trees: {
    uses: [trd('template.cpp'), trd('GraphBasics.cpp'), kactl('LCA.h')],
    code: `// Root the tree in g (GraphBasics.cpp) at r without recursion: the BFS order gives
// parents and depths, and walking it backwards gives subtree sizes.
vi par, dep, sub, order;
void rootTree(int r = 0) {
	par.assign(n, -1), dep.assign(n, 0), sub.assign(n, 1), order = {r};
	rep(i,0,sz(order)) {
		int u = order[i];
		for (int v : g[u]) if (v != par[u])
			par[v] = u, dep[v] = dep[u] + 1, order.push_back(v);
	}
	for (int i = n; i-- > 1;) sub[par[order[i]]] += sub[order[i]];
}

// Preorder times (call after rootTree): the subtree of v is tin[v] .. tin[v] + sub[v] - 1.
vi tin;
void preorder(int r = 0) {
	tin.assign(n, 0);
	int T = 0;
	vi st{r};
	while (!st.empty()) {
		int u = st.back(); st.pop_back();
		tin[u] = T++;
		for (int v : g[u]) if (v != par[u]) st.push_back(v);
	}
}

// LCA queries with KACTL's LCA.h, from adjacency lists with root 0: build it once in
// O(n log n), then each query is O(1). Its DFS recurses, so on a path of 2·10^5 vertices
// raise the stack limit first.
vi lcaAll(vector<vi>& C, const vector<pii>& queries) {
	LCA L(C); // once
	vi res;
	for (auto [a, b] : queries) res.push_back(L.lca(a, b));
	return res;
}`,
  },

  'dsu-mst': {
    uses: [trd('template.cpp'), trd('UnionFind.h')],
    code: `// Kruskal with UnionFind.h: join returns false when an edge would close a cycle.
// Returns the MST weight, or -1 if the graph is disconnected.
ll kruskal(int n, vector<tuple<ll, int, int>> edges) {
	sort(all(edges));
	UF uf(n);
	ll total = 0;
	int used = 0;
	for (auto [w, a, b] : edges)
		if (uf.join(a, b)) total += w, used++;
	return used == n - 1 ? total : -1;
}

// "Build here, or connect to somewhere that's built": a virtual node n joined
// to every i with weight build[i], then kruskal on n + 1 nodes.
ll withVirtualSource(int n, vector<tuple<ll, int, int>> edges, const vector<ll>& build) {
	rep(i,0,n) edges.emplace_back(build[i], i, n);
	return kruskal(n + 1, edges);
}`,
  },

  topo: {
    uses: [trd('template.cpp'), trd('TopoSort.h')],
    code: `// TopoSort.h: topoSort(gr) is missing nodes exactly when there's a cycle.
bool hasCycle(const vector<vi>& gr) { return sz(topoSort(gr)) < sz(gr); }

// Longest path (in edges) ending at each node of a DAG: relax in topological order.
vi longestPath(const vector<vi>& gr) {
	vi order = topoSort(gr), dp(sz(gr));
	for (int v : order) for (int u : gr[v]) dp[u] = max(dp[u], dp[v] + 1);
	return dp; // only meaningful when order has every node
}

// Letter order from "a comes before b" facts: edge a -> b, then topoSort.
string alphabet(const vector<pair<char, char>>& before) {
	vector<vi> gr(26);
	for (auto [a, b] : before) gr[a - 'a'].push_back(b - 'a');
	vi order = topoSort(gr);
	if (sz(order) < 26) return ""; // no valid order: print the problem's own word (510C wants "Impossible")
	string s;
	for (int c : order) s += char('a' + c);
	return s;
}`,
  },

  'shortest-paths': {
    uses: [trd('template.cpp'), trd('GraphBasics.cpp'), trd('Dijkstra.cpp'), kactl('FloydWarshall.h')],
    code: `// Dijkstra.cpp: adj[u] holds {v, w}; dist[v] is LLONG_MAX if unreachable.
ll shortest(int s, int t) {
	dijkstra(s, t); // stops once t is final
	return dist[t] == LLONG_MAX ? -1 : dist[t];
}

// State graphs: node (city, c) becomes city * K + c in adj. Before calling dijkstra, set
// n = N * K, and keep N * K below MAXN (raise MAXN, e.g. to 1e6 + 5, for big state graphs).
int stateId(int city, int c, int K) { return city * K + c; }

// All pairs for n up to about 500: KACTL's FloydWarshall.h.
// m[i][j] = edge weight or inf; afterwards shortest distances (-inf through a negative cycle).
vector<vector<ll>> allPairs(int N, const vector<tuple<int, int, ll>>& edges) {
	vector<vector<ll>> m(N, vector<ll>(N, inf));
	for (auto [a, b, w] : edges) m[a][b] = min(m[a][b], w);
	floydWarshall(m);
	return m;
}`,
  },

  'binary-lifting': {
    uses: [trd('template.cpp'), kactl('BinaryLifting.h')],
    code: `// KACTL's BinaryLifting.h: P[v] is v's parent and the root points to itself.
// tbl = treeJump(P) holds every 2^j-th ancestor; jmp climbs k steps by the bits of k.
int kthAncestor(vector<vi>& tbl, int v, int k) { return jmp(tbl, v, k); }

// Path length between a and b, with depth[] from rooting the tree.
int treeDist(vector<vi>& tbl, vi& depth, int a, int b) {
	return depth[a] + depth[b] - 2 * depth[lca(tbl, depth, a, b)];
}

// Any "next" function (a functional graph), x after k steps for k up to 10^18: treeJump
// only builds about log2(n) levels, so build 60 levels once and reuse them for every query.
vector<vi> stepTable(const vi& next, int levels = 60) {
	vector<vi> up(levels, next);
	rep(j,1,levels) rep(x,0,sz(next)) up[j][x] = up[j-1][up[j-1][x]];
	return up;
}
int afterSteps(const vector<vi>& up, int x, ll k) {
	rep(j,0,sz(up)) if (k >> j & 1) x = up[j][x];
	return x;
}`,
  },

  'answer-search': {
    uses: [trd('template.cpp'), trd('BinarySearch.cpp'), kactl('TernarySearch.h')],
    code: `// Smallest x in [lo, hi] with ok(x), for ok false...false true...true and ok(hi) true.
template<class F> ll firstTrue(ll lo, ll hi, F ok) {
	while (lo < hi) {
		ll mid = lo + (hi - lo) / 2;
		ok(mid) ? hi = mid : lo = mid + 1;
	}
	return lo;
}

// The same with partition_point from BinarySearch.cpp, over a C++20 range of answers.
ll firstTrueRange(ll lo, ll hi, auto ok) {
	auto r = views::iota(lo, hi + 1);
	return *ranges::partition_point(r, [&](ll x) { return !ok(x); });
}

// Peak of an integer unimodal sequence: KACTL's TernarySearch.h.
int peak(const vi& a) { return ternSearch(0, sz(a) - 1, [&](int i) { return a[i]; }); }

// Minimum of a unimodal real function: 100 rounds of ternary search
// (or KACTL's GoldenSectionSearch.h).
double argminReal(double lo, double hi, auto f) {
	rep(it,0,100) {
		double m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
		f(m1) < f(m2) ? hi = m2 : lo = m1;
	}
	return lo;
}`,
  },

  geometry: {
    uses: [trd('Point.h'), trd('sideOf.h'), trd('PolygonArea.h'), trd('OnSegment.h'), trd('InsidePolygon.h')],
    code: `typedef Point<ll> P; // integer coordinates: every test below is exact

// sideOf.h: 1 for a left turn, 0 collinear, -1 for a right turn.
int turn(P a, P b, P c) { return sideOf(a, b, c); }

// PolygonArea.h returns twice the signed area (counter-clockwise is positive). Keep it an
// integer: the area is area2 / 2, plus .5 when area2 is odd (a double loses digits past 2^53).
ll area2(vector<P>& poly) { return abs(polygonArea2(poly)); }

// InsidePolygon.h and OnSegment.h; strict = false counts the boundary as inside.
bool inside(vector<P>& poly, P q) { return inPolygon(poly, q, false); }
bool onEdge(P s, P e, P q) { return onSegment(s, e, q); }`,
  },

  'convex-hull': {
    uses: [trd('Point.h'), trd('ConvexHull.h'), trd('PointInsideHull.h'), trd('HullDiameter.h'), kactl('LineContainer.h')],
    code: `// ConvexHull.h: counter-clockwise, without collinear points (P is Point<ll>).
vector<P> hullOf(vector<P> pts) { return convexHull(pts); }

// PointInsideHull.h: O(log n) per query; strict = false counts the boundary.
bool insideHull(const vector<P>& hull, P q) { return inHull(hull, q, false); }

// HullDiameter.h: the farthest pair of points, squared distance kept exact.
ll diameter2(const vector<P>& pts) {
	auto [a, b] = hullDiameter(convexHull(pts));
	return (a - b).dist2();
}

// Convex hull trick, dp[i] = max over j of k[j] * x[i] + m[j], where m is the intercept:
// KACTL's LineContainer.h keeps the upper envelope. For a minimum, as in MonoCHT, add(-k, -m)
// and negate the query.
ll bestLine(LineContainer& lc, ll x) { return lc.query(x); }`,
  },
};
