// Sources for the competitive programming pages. The primers, diagrams and hints are written for
// autoprep; each source here was opened and checked to contain what it's listed for, and keeps the
// passages that show it so npm run verify:sources can re-check them.

// Per stage: { title, url, supports, quotes }.
export const STAGE_SOURCES = {
  'prefix-sums': [
    {
      title: "USACO Guide: Introduction to Prefix Sums",
      url: "https://usaco.guide/silver/prefix-sums",
      supports: "Building a prefix-sum array once in linear time, starting from a zero entry, so that any range sum is a single subtraction answered in constant time.",
      quotes: [
        "Prefix sums are a technique used to quickly calculate the sum of any subarray.",
        "Instead, we can use prefix sums to process these array sum queries.",
        "Since we are only querying two elements in the prefix sum array, we can calculate subarray sums in",
      ],
    },
    {
      title: "USACO Guide: More on Prefix Sums",
      url: "https://usaco.guide/silver/more-prefix-sums",
      supports: "The maximum subarray sum found by subtracting a running minimum of earlier prefix sums, 2D prefix sums with rectangle queries by inclusion-exclusion, and the warning about off-by-one errors between inclusive and exclusive bounds.",
      quotes: [
        "Thus, we can keep a running minimum to store",
        "This yields the maximum subarray sum for each possible right bound, and the maximum over all these values is our answer.",
        "we add the value of the green square, subtract the values of the red squares, and then add the value of the gray square",
        "We need to be cautious of off-by-one errors, as intervals can be inclusive, exclusive, 1-indexed, etc.",
      ],
    },
    {
      title: "USACO Guide: Solution - Subarray Sums II (CSES)",
      url: "https://usaco.guide/problems/cses-1661-subarray-sums-ii/solution",
      supports: "Counting subarrays with a given sum in one pass by keeping a map of how many times each prefix sum has appeared and looking up the current prefix sum minus the target.",
      quotes: [
        "We are asked to find the number of subarrays that sum up to",
        "We can have a map that keeps track of the prefix sums.",
        "will ensure that we can remove a prefix from our current prefix to build a subarray with sum",
        "After every iteration, we just add our new prefix sum to the map.",
      ],
    },
    {
      title: "USACO Guide: (Optional) Hashmaps",
      url: "https://usaco.guide/gold/hashmaps",
      supports: "The unordered_map pitfall: C++'s built-in integer hashing is vulnerable to pathological tests, which often appear on Codeforces; ordered maps can almost always be used instead, or a plain array when values are small.",
      quotes: [
        "The built-in hashing algorithm for integers in C++ is vulnerable to pathological tests, causing abnormally slow runtimes.",
        "However, these sorts of tests often appear in Codeforces, especially in educational rounds, where open hacking is allowed.",
        "You can almost always use ordered sets and maps instead, but it's good to know that these exist.",
        "Since all the values are quite small, you can use an array instead of a hashmap.",
      ],
    },
    {
      title: "USACO Guide: Solution - Hoof, Paper, Scissors (USACO Silver 2017 January)",
      url: "https://usaco.guide/problems/usaco-691-hoof-paper-scissors/solution",
      supports: "Prefix counts of each kind of item, used to try every split point and combine the best result before the split with the best result after it.",
      quotes: [
        "In order to maximize the amount of wins, we want to find a changing point such that the wins before and wins after are maximized.",
        "We can precompute the number of hooves, papers, and scissors at a certain point using prefix sums.",
        "Then, we maximize the wins before and wins after for every possible changing point and find the greatest number of wins.",
      ],
    },
  ],
  'difference-arrays': [
    {
      title: "USACO Guide: More on Prefix Sums",
      url: "https://usaco.guide/silver/more-prefix-sums",
      supports: "Difference arrays: a range update becomes two point changes at l and r + 1, one prefix-sum pass recovers the values, and the two-level case from Greg and Array, where how often each operation runs is built first and then the operations are applied the same way.",
      quotes: [
        "we can't loop through the interval and increment each value, as that would be",
        "Now, we get the actual array by computing its prefix sum array,",
        "The second part, applying the operations, can be done exactly the same way.",
      ],
    },
    {
      title: "USACO Guide: Solution - Karen and Coffee (CF)",
      url: "https://usaco.guide/problems/cf-karen-and-coffee/solution",
      supports: "Marking every interval with a difference array, then one prefix pass to count how many intervals cover each point, keeping the points covered at least k times.",
      quotes: [
        "Instead of checking each temperature one by one, we use a difference array to quickly mark all temperatures covered by each recipe's range.",
        "Once we've processed all the ranges, we use a prefix sum to count how many recipes recommend each temperature.",
      ],
    },
    {
      title: "USACO Guide: Solution - Little Girl and Maximum Sum (CF)",
      url: "https://usaco.guide/problems/cf-little-girl-and-maximum-sum/solution",
      supports: "The reorder-to-maximise-query-sums disguise: count how many queries cover each index with a difference array, then sort so the largest values go to the most-covered indices.",
      quotes: [
        "We can calculate the contribution of each index in the range query using a difference array technique.",
        "To maximize the sum, sort both the array and frequency array in ascending order",
      ],
    },
    {
      title: "CP-Algorithms: Length of the union of segments",
      url: "https://cp-algorithms.com/geometry/length-of-segments-union.html",
      supports: "Sweeping sorted endpoint events instead of indexing an array: a counter of open segments goes up at left ends and down at right ends, and the gap to each new coordinate is added whenever at least one segment is open, in O(n log n).",
      quotes: [
        "the endpoints of all the segments sorted by their values.",
        "And additionally we store whether it is a left end or a right end of a segment.",
        "Whenever the current element is a left end, we increase this counter, and otherwise we decrease it.",
        "whenever we come to a new coordinate and at least one segment is currently open.",
      ],
    },
  ],
  'dp-basics': [
    {
      title: "CP-Algorithms: Introduction to Dynamic Programming",
      url: "https://cp-algorithms.com/dynamic_programming/intro-to-dp.html",
      supports: "DP as storing subproblem answers so no work is repeated, filled bottom-up from the base cases, with running time equal to work per subproblem times number of subproblems, and memory cut to the last two values when that is all the recurrence reads.",
      quotes: [
        "The essence of dynamic programming is to avoid repeated calculation.",
        "Bottom-up is exactly the opposite of top-down, you start at the bottom (base cases of the recursion), and extend it to more and more values.",
        "The layman's way of analyzing the runtime of a memoized recursive function is:",
        "Secondly, we only need to use the two previous values to calculate the current element.",
      ],
    },
    {
      title: "USACO Guide: Introduction to DP",
      url: "https://usaco.guide/gold/intro-dp",
      supports: "Defining dp[i] for a position, starting from a base case, and filling states either by pulling from earlier states or pushing to later ones, which turns exponential recursion into a linear pass.",
      quotes: [
        "By breaking down the full task into sub-problems, DP avoids the redundant computations of brute force solutions.",
        "Push DP, where we update future states based on the current state",
        "Pull DP, where we calculate the current state based on past states",
        "Therefore, for every additional jump, each branch splits into two, which results in an exponential time complexity.",
      ],
    },
    {
      title: "USACO Guide: Knapsack DP",
      url: "https://usaco.guide/gold/knapsack",
      supports: "Counting the ways to build a total from blocks by summing the counts for each possible last block, starting from one way to build the empty sum, and the warning that classical knapsack problems come with twists and extra state information.",
      quotes: [
        "In competitive programming, you can expect that classical knapsack problems will be given twists, disguises, and extra state information involved.",
        "Counting how many sequences of items will fill the container completely, meaning the total weight is exactly the capacity of the container",
        "let's look at the last dice roll that brings us up to a total sum of",
      ],
    },
    {
      title: "Wikipedia: Dynamic programming",
      url: "https://en.wikipedia.org/wiki/Dynamic_programming",
      supports: "Optimal substructure, solving each subproblem only once, and the bottom-up table that builds answers to bigger subproblems from smaller ones.",
      quotes: [
        "Optimal substructure means that the solution to a given optimization problem can be obtained by the combination of optimal solutions to its sub-problems.",
        "Dynamic programming takes account of this fact and solves each sub-problem only once.",
        "This is also usually done in a tabular form by iteratively generating solutions to bigger and bigger sub-problems by using the solutions to small sub-problems.",
      ],
    },
    {
      title: "USACO Guide: Modular Arithmetic",
      url: "https://usaco.guide/gold/modular",
      supports: "Working modulo a large prime such as 10^9 + 7, taking remainders as you go so the numbers never overflow the built-in types.",
      quotes: [
        "In modular arithmetic, instead of working with integers themselves, we work with their remainders when divided by",
        "will be a large prime, given in the problem; the two most common values are",
        "Modular arithmetic is used to avoid dealing with numbers that overflow built-in data types, because we can take remainders, according to the following formulas:",
      ],
    },
  ],
  'lis': [
    {
      title: "CP-Algorithms: Longest increasing subsequence",
      url: "https://cp-algorithms.com/dynamic_programming/longest_increasing_subsequence.html",
      supports: "The O(n²) DP, the O(n log n) method that keeps the smallest ending value for each length and places each element by binary search, rebuilding one subsequence from stored predecessors, the non-decreasing variant, and the result that the fewest non-increasing subsequences covering an array equals its LIS.",
      quotes: [
        "So far we only learned how to find the length of the subsequence, but not how to find the subsequence itself.",
        "Collecting the elements this way and reversing them at the end gives us a longest increasing subsequence.",
        "We just have to change the inequality signs, and make a slight modification to the binary search.",
        "To solve this, we notice that the minimum number of required colors is equal to the length of the longest increasing subsequence.",
      ],
    },
    {
      title: "USACO Guide: Longest Increasing Subsequence",
      url: "https://usaco.guide/gold/lis",
      supports: "The O(n²) and O(n log n) LIS algorithms, the PCB example where the largest set of non-intersecting segments is an LIS, and covering an array with the fewest increasing subsequences, equal to its longest non-increasing subsequence by Dilworth's theorem.",
      quotes: [
        "If we were asked to find the maximum size of a set of non-intersecting segments, the answer would be the LIS of",
        "Continuing from application 1, we now want to find the minimum number of increasing subsequences required to cover",
        "This algorithm performs exactly the same steps as the algorithm to compute the length of the longest non-increasing subsequence",
        "Alternative Proof: This is just a special case of Dilworth's Theorem.",
      ],
    },
    {
      title: "Wikipedia: Longest increasing subsequence",
      url: "https://en.wikipedia.org/wiki/Longest_increasing_subsequence",
      supports: "The definition (kept elements need not be contiguous), the O(n log n) algorithm with one binary search per element, and that in a permutation graph the largest clique is a longest decreasing subsequence and the largest independent set a longest non-decreasing one.",
      quotes: [
        "This subsequence is not necessarily contiguous or unique.",
        "Because the algorithm performs a single binary search per sequence element, its total time can be expressed using Big O notation as",
        "The largest clique in a permutation graph corresponds to the longest decreasing subsequence of the permutation that defines the graph",
        "Similarly, the maximum independent set in a permutation graph corresponds to the longest non-decreasing subsequence.",
      ],
    },
    {
      title: "Wikipedia: Dilworth's theorem",
      url: "https://en.wikipedia.org/wiki/Dilworth%27s_theorem",
      supports: "Dilworth's theorem: the largest antichain equals the fewest chains needed to cover a finite partial order, together with its dual (largest chain equals fewest antichains).",
      quotes: [
        "the maximum size of an antichain of incomparable elements equals the minimum number of chains needed to cover all elements",
        "the size of the largest chain in a partial order (if finite) equals the smallest number of antichains into which the order may be partitioned",
      ],
    },
  ],
  'lcs': [
    {
      title: "Wikipedia: Longest common subsequence",
      url: "https://en.wikipedia.org/wiki/Longest_common_subsequence",
      supports: "The O(nm) prefix-table DP for two sequences, extending the match when the last characters are equal, keeping only the previous row when only the length is needed, tracing back from the last cell to rebuild one LCS, the link between LCS and insert/delete-only edit distance, and getting the longest palindromic subsequence as the LCS of a string and its reverse.",
      quotes: [
        "If the last characters in the prefixes are equal, they must be in an LCS.",
        "Calculating the LCS of a row of the LCS table requires only the solutions to the current row and the previous row.",
        "The actual subsequences are deduced in a \"traceback\" procedure that follows the arrows backwards, starting from the last cell in the table.",
        "the longest palindromic subsequence of a string could be computed by finding the longest common subsequence between the string and its reversal",
      ],
    },
    {
      title: "Wikipedia: Wagner–Fischer algorithm",
      url: "https://en.wikipedia.org/wiki/Wagner%E2%80%93Fischer_algorithm",
      supports: "Edit distance over all pairs of prefixes as the minimum of insertion, deletion and substitution, with row and column 0 as the base cases, O(m) memory by keeping only the previous and current column, and custom costs for each operation.",
      quotes: [
        "Otherwise, the distance is the minimum of the three possible ways to do the transformation",
        "It is initially true on row and column 0 because",
        "since it only requires that the previous column and current column be stored at any one time",
        "We can give different penalty costs to insertion, deletion and substitution.",
      ],
    },
    {
      title: "USACO Guide: Paths on Grids",
      url: "https://usaco.guide/gold/paths-grids",
      supports: "LCS as a walk on a grid: moving right or down skips a character of one string, and each diagonal move pairs equal characters and adds one to the length, which gives the three-neighbour recurrence.",
      quotes: [
        "We know that this process creates a common subsequence because characters which are common to both strings are found from left to right.",
        "See that each diagonal movement adds one to the length of the common subsequence.",
        "which are also the three possible movements of the path, we can create a DP-recurrence to find the longest common subsequence",
      ],
    },
  ],
  'knapsack': [
    {
      title: "CP-Algorithms: Knapsack Problem",
      url: "https://cp-algorithms.com/dynamic_programming/knapsack.html",
      supports: "The O(nW) 0/1 knapsack recurrence run in one array with capacity going downwards, the unbounded version going upwards (and why that loop is wrong for 0/1), and bounded items split into power-of-two bundles before a 0/1 pass.",
      quotes: [
        "Again, note the order of execution. It should be strictly followed to ensure the following invariant",
        "and the item may be taken again; going downwards it would still correspond to",
        "Despite having the same transition rule, the code above is incorrect for 0-1 knapsack.",
        "The grouping is made more efficient by using binary grouping.",
      ],
    },
    {
      title: "USACO Guide: Knapsack DP",
      url: "https://usaco.guide/gold/knapsack",
      supports: "Knapsack as filling a limited container with the DP state tracking the capacity, its reachable-totals and exactly-full variants, and the warning that contest knapsacks come with twists and disguises.",
      quotes: [
        "The DP solution to knapsack problems usually has the state keeping track of the capacity of the knapsack",
        "In competitive programming, you can expect that classical knapsack problems will be given twists, disguises, and extra state information involved.",
        "Finding all the possible total weights that we can achieve from any subset of items",
        "Counting how many sequences of items will fill the container completely, meaning the total weight is exactly the capacity of the container",
      ],
    },
    {
      title: "Wikipedia: Knapsack problem",
      url: "https://en.wikipedia.org/wiki/Knapsack_problem",
      supports: "The pseudo-polynomial table DP for 0-1 knapsack, keeping only two rows when only the best value is needed, and walking back through the table to recover which items were taken.",
      quotes: [
        "A similar dynamic programming solution for the 0-1 knapsack problem also runs in pseudo-polynomial time.",
        "which stores the recent two lines of the array",
        "To find the actual subset of items, rather than just their total value, we can run this after running the function above",
      ],
    },
    {
      title: "USACO Guide: Bitsets",
      url: "https://usaco.guide/plat/bitsets",
      supports: "Subset-sum reachability sped up with a bitset that is shifted by each item's size and ORed in, around 32 to 64 times faster than a boolean array.",
      quotes: [
        "some operations are around 32-64x faster compared to a boolean array",
        "A naive knapsack solution would be as follows.",
        "and is too slow if implemented naively, but we can use bitset to speed it up",
      ],
    },
  ],
  'interval-dp': [
    {
      title: "USACO Guide: Range DP",
      url: "https://usaco.guide/gold/dp-ranges",
      supports: "DP over every contiguous range when a greedy looks right but fails, N usually at most 500, ranges processed in increasing order of length for O(N^3) overall, and pairing the first letter with a later equal letter so the range splits into independent parts.",
      quotes: [
        "Dynamic programming on ranges is a general technique used to solve problems of the form",
        "A greedy approach seems feasible but yields incorrect answers.",
        "Note that we need to process subarrays in increasing order of",
        "This means that we don't actually need to care about the gaps from matching letters",
      ],
    },
    {
      title: "USACO Guide: Paths on Grids",
      url: "https://usaco.guide/gold/paths-grids",
      supports: "Grid path DP with right/down moves, where each sub-problem is a sub-rectangle and every cell is computed after the cells that lead into it, used to count paths or optimise a quantity over all paths.",
      quotes: [
        "for example, you may only be able to move down or to the right",
        "Usually, the sub-problems in this type of DP are a sub-rectangle of the whole grid.",
        "you compute the DP values in an order such that the dp-value for a cell is known before you use it",
        "or it may ask you to find the max/min of some quantity over all paths",
      ],
    },
    {
      title: "CP-Algorithms: Knuth's Optimization",
      url: "https://cp-algorithms.com/dynamic_programming/knuth-optimization.html",
      supports: "The standard O(n^3) range DP that splits a segment at every k and adds a segment cost, with the simplest cost being the sum of the subarray, and a valid fill order where the left end goes down and the right end goes up.",
      quotes: [
        "is a special case of dynamic programming on ranges, that can optimize the time complexity of solutions by a linear factor",
        "as it would be if we were using a regular range DP",
        "is simply the sum of the elements of the subarray",
        "goes from the maximum value to the minimum one and",
      ],
    },
    {
      title: "Wikipedia: Matrix chain multiplication",
      url: "https://en.wikipedia.org/wiki/Matrix_chain_multiplication",
      supports: "The classic interval DP of splitting a chain at every possible position and keeping the minimum, filled bottom-up from shorter subsequences to longer ones in O(n^3).",
      quotes: [
        "Take the sequence of matrices and separate it into two subsequences.",
        "Do this for each possible position at which the sequence of matrices can be split, and take the minimum over all of them.",
        "using the costs of smaller subsequences already computed",
      ],
    },
  ],
  'bitmask-dp': [
    {
      title: "USACO Guide: Bitmask DP",
      url: "https://usaco.guide/gold/dp-bitmasks",
      supports: "The DP over a subset plus the last city for Hamiltonian paths in O(2^N N^2), splitting a set into parts, and transitions over every submask costing O(3^N) in total because each element is in one of three states, enumerated with the (submask - 1) & mask trick.",
      quotes: [
        "be the number of routes that visit all the cities in the subset",
        "Given that each element can be in three possible states, our overall complexity is actually",
        "From this process, we can get all strict subsets in increasing order by calculating",
        "The goal of this problem is to partition the nodes into sets such that the nodes in each set form a complete graph.",
      ],
    },
    {
      title: "CP-Algorithms: Enumerating submasks of a bitmask",
      url: "https://cp-algorithms.com/algebra/all-submasks.html",
      supports: "The (s - 1) & m submask loop, which lists submasks in descending order, skips the empty submask and loops forever if it is not stopped at zero, and costs O(3^n) in total over all masks.",
      quotes: [
        "In both variants of the code, the submask equal to zero will not be processed.",
        "if the loop does not end at zero, the algorithm may enter an infinite loop",
        "Thus, this algorithm generates all submasks of this mask in descending order, performing only two operations per iteration.",
        "especially those that use bitmask dynamic programming, you want to iterate through all bitmasks and for each mask, iterate through all of its submasks",
      ],
    },
    {
      title: "USACO Guide: Sum over Subsets DP",
      url: "https://usaco.guide/plat/dp-sos",
      supports: "Sum over subsets: adding up values over every submask of every mask one bit at a time in O(n 2^n) instead of the O(3^n) submask loop, and answering disjointness questions through submasks of the complement of a mask.",
      quotes: [
        "is a technique used to efficiently calculate the sum of values for all subsets of a given set or bitmask",
        "By grouping masks that frequently appear together, we can precompute and reuse their sums to eliminate repeated additions.",
        "Next, we use SOS DP to compute the number of words disjoint from the mask",
        "This means the word's bitmask must be a subset of the complement of mask",
      ],
    },
    {
      title: "USACO Guide: Meet In The Middle",
      url: "https://usaco.guide/gold/meet-in-the-middle",
      supports: "Meet in the middle: list the subset sums of each half separately and combine the two lists with binary search, in O(N 2^(N/2)) instead of 2^N, which roughly doubles the n you can handle.",
      quotes: [
        "Meet in the Middle technique can take advantage of the smaller constraint and calculate a naive solution in two halves.",
        "Now that we've got the subset sums of these two separate arrays, we need to recombine them to search for our answer.",
        "This can be done using simple binary search.",
      ],
    },
    {
      title: "Wikipedia: Subset sum problem",
      url: "https://en.wikipedia.org/wiki/Subset_sum_problem",
      supports: "The Horowitz and Sahni algorithm: split the items into two halves, list the subset sums of each half, and sort the lists before combining them.",
      quotes: [
        "For each of these two sets, it stores a list of the sums of all",
        "Each of these two lists is then sorted.",
      ],
    },
  ],
  'dp-structures': [
    {
      title: "CP-Algorithms: Fenwick Tree",
      url: "https://cp-algorithms.com/data_structures/fenwick.html",
      supports: "A Fenwick tree (binary indexed tree) answering prefix queries and point updates in O(log n) each, its one-based version that jumps by the lowest set bit, and prefix-minimum versions where an update may only improve a value.",
      quotes: [
        "The most common application of a Fenwick tree is calculating the sum of a range.",
        "Many people use a version of the Fenwick tree that uses one-based indexing.",
        "Additionally, each time a value is update'd, the new value has to be smaller than the current value.",
      ],
    },
    {
      title: "CP-Algorithms: Segment Tree",
      url: "https://cp-algorithms.com/data_structures/segment_tree.html",
      supports: "Segment trees that answer range queries in O(log n) using a merge of two children (sum, maximum, or several values per node), and lazy propagation for range add and range assign that pushes pending updates into both children on the way down.",
      quotes: [
        "A Segment Tree is a data structure that stores information about array intervals as a tree.",
        "the merge operation that merges two siblings in a segment tree.",
        "However the Segment Tree allows applying modification queries to an entire segment of contiguous elements",
        "we should always push information from the current vertex into both of its children",
      ],
    },
    {
      title: "CP-Algorithms: Longest increasing subsequence",
      url: "https://cp-algorithms.com/dynamic_programming/longest_increasing_subsequence.html",
      supports: "Speeding up the quadratic LIS DP to O(n log n) by indexing dp values by array value and taking a prefix maximum with a Fenwick or segment tree, compressing large values first, and the non-decreasing variant where equal values are allowed.",
      quotes: [
        "is equivalent to finding the maximum value in a prefix of the array",
        "For instance we can use a Segment tree or a Fenwick tree.",
        "are especially large, then we would have to use some tricks, like compressing the numbers",
        "Only now it is allowed to use identical numbers in the subsequence.",
      ],
    },
    {
      title: "USACO Guide: Point Update Range Sum",
      url: "https://usaco.guide/gold/PURS",
      supports: "Point updates with range queries in O(log n) using a binary indexed tree or a segment tree, segment trees for any associative operation, and coordinate compression before using either when values are large.",
      quotes: [
        "Both segment trees and binary indexed trees can accomplish this.",
        "A segment tree allows you to do point update and range query in",
        "time each for any associative operation, not just summation.",
        "then you should apply coordinate compression before using a BIT or segment tree",
      ],
    },
  ],
  'dfs': [
    {
      title: "CP-Algorithms: Finding Connected Components",
      url: "https://cp-algorithms.com/graph/search-for-connected-components.html",
      supports: "Labelling connected components by starting a new DFS from each unvisited vertex in O(n + m) total, and avoiding stack overflow on deep graphs by replacing recursion with an explicit stack.",
      quotes: [
        "Then we find the first unvisited node of the remaining nodes, and run Depth First Search on it, thus finding a second connected component.",
        "which means that each edge will be seen exactly two times (at one end and at the other end).",
        "So when you do a recursive DFS over a connected graph with millions of nodes, you might run into stack overflows.",
        "It is always possible to translate a recursive program into an iterative program, by manually maintaining a stack data structure.",
      ],
    },
    {
      title: "CP-Algorithms: Bipartite Graph Check",
      url: "https://cp-algorithms.com/graph/bipartite-check.html",
      supports: "2-colouring with a traversal from each unvisited vertex, giving each new neighbour the opposite side and failing when an edge joins two vertices on the same side, and the fact that a graph is bipartite exactly when it has no odd cycle.",
      quotes: [
        "There exists a theorem which claims that a graph is bipartite if and only if all its cycles have even length.",
        "Each time we visit a yet unvisited neighbor of a vertex assigned to one side, we assign it to the other side.",
        "if it has been assigned to the same side, we conclude that the graph is not bipartite.",
      ],
    },
    {
      title: "CP-Algorithms: Checking a graph for acyclicity and finding a cycle in O(M)",
      url: "https://cp-algorithms.com/graph/finding-cycle.html",
      supports: "Detecting a cycle during DFS by reaching a vertex that is still being explored, ignoring the edge back to the parent in an undirected graph (for a graph without multiple edges).",
      quotes: [
        "Consider a directed or undirected graph without loops and multiple edges.",
        "From each unvisited (white) vertex, start the DFS, mark it gray (1) while entering and mark it black (2) on exit.",
        "If DFS moves to a gray vertex, then we have found a cycle (if the graph is undirected, the edge to parent is not considered).",
      ],
    },
    {
      title: "USACO Guide: Graph Traversal",
      url: "https://usaco.guide/silver/graph-traversal",
      supports: "Connected components, the fact that each new edge merges at most two components (so C − 1 new links connect everything), and 2-colouring each component with DFS or BFS to test whether a graph is bipartite.",
      quotes: [
        "A connected component is a maximal set of connected nodes in an undirected graph.",
        "Note that each edge decreases the number of connected components by either zero or one.",
        "The most common example of a two-colored graph is a bipartite graph, in which each edge connects two nodes of opposite colors.",
        "For each connected component, we can arbitrarily label a node and then run DFS or BFS.",
      ],
    },
    {
      title: "USACO Guide: Flood Fill",
      url: "https://usaco.guide/silver/flood-fill",
      supports: "Flood fill on a grid treated as an implicit graph whose edges join cells adjacent in the four directions, and a non-recursive version that uses an explicit stack or queue.",
      quotes: [
        "Flood fill is an algorithm that identifies and labels the connected component that a particular cell belongs to in a multidimensional array.",
        "As opposed to an explicit graph where the edges are given, a grid is an implicit graph.",
        "This means that the neighbors are just the nodes directly adjacent in the four cardinal directions.",
        "A non-recursive implementation of flood fill adds adjacent nodes to a stack or queue, similar to BFS",
      ],
    },
  ],
  'bfs': [
    {
      title: "CP-Algorithms: Breadth First Search",
      url: "https://cp-algorithms.com/graph/breadth-first-search.html",
      supports: "BFS finding shortest paths by number of edges in an unweighted graph, marking a vertex when it is put in the queue, and searching a graph of game states or an auxiliary graph whose vertices are states for fewest-moves problems.",
      quotes: [
        "the path found by breadth first search to any node is the shortest path to that node",
        "if some of these edges go to vertices that are not already lit, set them on fire and place them in the queue",
        "a game with the least number of moves, if each state of the game can be represented by a vertex of the graph",
        "For this, we must construct an auxiliary graph, whose vertices are the state",
      ],
    },
    {
      title: "CP-Algorithms: 0-1 BFS",
      url: "https://cp-algorithms.com/graph/01_bfs.html",
      supports: "Plain BFS only working when every edge has the same weight, and 0-1 BFS with a deque that pushes weight-0 edges to the front and weight-1 edges to the back, in linear time.",
      quotes: [
        "If not all edges in graph have the same weight, then we need a more general algorithm, like Dijkstra which runs in",
        "We can notice that the difference between the distances between the source s and two other vertices in the queue differs by at most one.",
        "The same algorithm is more commonly written with a single deque, pushing to the front for weight",
      ],
    },
    {
      title: "Wikipedia: Breadth-first search",
      url: "https://en.wikipedia.org/wiki/Breadth-first_search",
      supports: "BFS running in O(V + E), checking whether a vertex is already explored when it is enqueued rather than when it is dequeued, and following parent links back from the destination to recover a shortest path.",
      quotes: [
        "it checks whether a vertex has been explored before enqueueing the vertex rather than delaying this check until the vertex is dequeued from the queue.",
        "as every vertex and every edge will be explored in the worst case.",
        "useful for accessing the nodes in a shortest path, for example by backtracking from the destination node up to the starting node",
      ],
    },
    {
      title: "USACO Guide: Shortest Paths with Unweighted Edges",
      url: "https://usaco.guide/gold/unweighted-shortest-paths",
      supports: "That the difficulty in many BFS problems is turning the statement into a graph to search, tracking parents to recover a path, and 0/1 BFS with a deque in O(V + E).",
      quotes: [
        "the difficulty in many BFS problems are converting the problem into a graph on which we can run BFS and get the answer.",
        "After the BFS is complete, this allows us to backtrack through the parents which ultimately leads us to our starting node.",
        "A 0/1 BFS finds the shortest path in a graph where the weights on the edges can only be 0 or 1, and runs in",
      ],
    },
    {
      title: "USACO: Contest Results (analysis of A Pie for A Pie, December 2017 Gold)",
      url: "https://usaco.org/current/data/sol_piepie_gold_dec17.html",
      supports: "Multi-source BFS on a graph built from the statement, started by putting every source node in the queue at the beginning, to find for each starting node the shortest path to any valid ending node.",
      quotes: [
        "This problem can be reframed as a shortest-path problem. We consider each pie to be a node",
        "and must determine, for each such node, the shortest path to a valid",
        "and perform the search using a BFS from multiple source nodes.",
        "This can be done simply by adding all source nodes to the queue at the beginning of the algorithm.",
      ],
    },
  ],
  'trees': [
    {
      title: "USACO Guide: Introduction to Tree Algorithms",
      url: "https://usaco.guide/silver/intro-tree",
      supports: "Recognising a tree as a connected acyclic graph, depth as distance from the root, subtree size as one plus the children's subtree sizes, and the rooted-tree convention that a root with a single child is not a leaf.",
      quotes: [
        "A graph is a tree iff it is connected and does not contain any cycles",
        "The depth, or level, of a node is its distance from the root",
        "Thus, the size of a subtree is one plus the size of the root's childrens' subtrees.",
        "If the tree is rooted, the root with a single child is not typically considered a leaf",
      ],
    },
    {
      title: "USACO Guide: (Optional) Euler Tour Technique",
      url: "https://usaco.guide/gold/tree-euler",
      supports: "Flattening a rooted tree with DFS entry and exit times so that every subtree is a contiguous range of an array whose length is the subtree size, which turns subtree questions into range queries.",
      quotes: [
        "Here's the code we're going to use to perform a Euler Tour on the graph.",
        "such that every subtree corresponds to a contiguous range on an array, we can do updates and range queries on it!",
        "Notice that it follows the same general structure as a normal depth-first search.",
      ],
    },
    {
      title: "USACO Guide: DP on Trees - Solving For All Roots",
      url: "https://usaco.guide/gold/all-roots",
      supports: "Rerooting to get an answer for every vertex: one DP for results inside each vertex's subtree and a second DP for everything outside it.",
      quotes: [
        "It is a common technique to calculate two DP arrays for some DP on trees problems.",
        "Usually one DP array is responsible for calculating results within the subtree rooted at",
        "The other DP array calculates results outside of the subtree rooted at",
        "The focus problem asks us to find for each node the maximum distance to another node.",
      ],
    },
    {
      title: "USACO Guide: Solution - Tree Distances II (CSES)",
      url: "https://usaco.guide/problems/cses-1133-tree-distances-ii/solution",
      supports: "Rerooting the sum of distances: compute it for one root, then move the root to a neighbour, where depths in that neighbour's subtree drop by one and all others rise by one, so the answer changes by an amount that depends only on n and the subtree size.",
      quotes: [
        "If we have the answer for some node (let's say node 1), how can we quickly find the answer for its neighbours?",
        "The depths of all nodes in node 2's subtree decrease by 1.",
        "The depths of all nodes outside of its subtree increase by 1.",
        "We can use DFS to find both the answer for node 1 and the size of each node's subtree when rooted at node 1",
      ],
    },
    {
      title: "USACO Guide: Solution - Tree Diameter (CSES)",
      url: "https://usaco.guide/problems/cses-1131-tree-diameter/solution",
      supports: "Finding a tree's diameter with two searches: the vertex farthest from an arbitrary start is an endpoint of a diameter, and the farthest distance from that endpoint is the diameter (the solution computes distances with DFS).",
      quotes: [
        "We perform DFS on an arbitrary node and calculate the distance to each node.",
        "Therefore, the node with the maximum distance is one of the endpoints of the diameter.",
        "We can run a second DFS from this endpoint, since the maximum distance found will be the diameter.",
      ],
    },
  ],
  'dsu-mst': [
    {
      title: "CP-Algorithms: Disjoint Set Union",
      url: "https://cp-algorithms.com/data_structures/disjoint_set_union.html",
      supports: "Union-find with path compression and union by size, which together give near-constant amortised time (inverse Ackermann), and its use for adding edges while answering connectivity queries, the same problem that appears in Kruskal's algorithm.",
      quotes: [
        "in the process of stack unwinding the visited nodes are attached directly to the representative",
        "In the first approach we use the size of the trees as rank",
        "is the inverse Ackermann function, which grows very slowly",
        "This application is quite important, because nearly the same problem appears in Kruskal's algorithm for finding a minimum spanning tree.",
      ],
    },
    {
      title: "Wikipedia: Disjoint-set data structure",
      url: "https://en.wikipedia.org/wiki/Disjoint-set_data_structure",
      supports: "Path halving as a one-pass find that makes every other node on the path skip a level, union by size where the root with more descendants becomes the parent, and using the structure to test whether two vertices are already in the same component.",
      quotes: [
        "Tarjan and Van Leeuwen also developed one-pass Find algorithms that retain the same worst-case complexity but are more efficient in practice.",
        "Path halving works similarly but replaces only every other parent pointer",
        "In the case of union by size, a node stores its size, which is simply its number of descendants",
        "This model can then be used to determine whether two vertices belong to the same component",
      ],
    },
    {
      title: "USACO Guide: Minimum Spanning Trees",
      url: "https://usaco.guide/gold/mst",
      supports: "Kruskal's algorithm: sort the edges by weight and add each one unless it would close a cycle, checked with a DSU, in O(E log E); and Prim's algorithm with a linear scan in O(V²), which is the better choice for dense graphs.",
      quotes: [
        "Kruskal's Algorithm finds the MST by greedily adding edges.",
        "This can be done by sorting the edges in order of non-decreasing weight.",
        "we can determine whether adding an edge will create a cycle in constant time using a DSU.",
        "As with Dijkstra, this complexity is preferable for dense graphs",
      ],
    },
    {
      title: "CP-Algorithms: Minimum Spanning Tree - Prim's Algorithm",
      url: "https://cp-algorithms.com/graph/mst_prim.html",
      supports: "The minimum spanning tree as the cheapest way to connect every city by roads, and the O(n²) dense-graph version of Prim's algorithm that keeps each unselected vertex's cheapest edge to the tree, suited to complete graphs.",
      quotes: [
        "such that we can get from each city to every other city, and the cost for building all roads is minimal",
        "for every not yet selected vertex we will store the minimum edge to an already selected vertex.",
        "we want to find a minimum spanning tree for this complete graph",
        "For sparse graphs this is better than the above algorithm, but for dense graphs this will be slower.",
      ],
    },
    {
      title: "USACO Guide: Solution - MooTube (USACO Gold 2018 January)",
      url: "https://usaco.guide/problems/usaco-789-mootube/solution",
      supports: "Answering edge-weight threshold queries offline: sort the queries and the edges by weight, add edges in that order so the DSU only ever joins components, and read the answer off the component size.",
      quotes: [
        "Since removing edges via DSU is not feasible, we need a way to process the queries such that we only ever join nodes.",
        "We can sort the queries from greatest to least weight to process them offline.",
        "At each query, we can add every edge with a weight greater than or equal to the current query's weight.",
        "We return the size of the connected component minus one",
      ],
    },
  ],
  'topo': [
    {
      title: "CP-Algorithms: Topological Sorting",
      url: "https://cp-algorithms.com/graph/topological-sort.html",
      supports: "A topological order exists exactly when the directed graph has no cycle, checking a set of 'less than' constraints for contradictions is this problem, and the reversed DFS finishing order is a topological order.",
      quotes: [
        "It only exists, if the directed graph contains no cycles.",
        "For some variables, we know that one of them is less than the other.",
        "You have to check whether these constraints are contradictory, and if not, output the variables in ascending order",
        "Thus, the desired topological ordering are the vertices in descending order of their exit times.",
      ],
    },
    {
      title: "CP-Algorithms: Checking a graph for acyclicity and finding a cycle in O(M)",
      url: "https://cp-algorithms.com/graph/finding-cycle.html",
      supports: "Detecting a cycle in a directed graph with a three-colour DFS (white, grey while on the stack, black when finished), where reaching a grey vertex means a cycle.",
      quotes: [
        "We will run a series of DFS in the graph. Initially all vertices are colored white",
        "From each unvisited (white) vertex, start the DFS, mark it gray",
        "If DFS moves to a gray vertex, then we have found a cycle",
      ],
    },
    {
      title: "USACO Guide: Topological Sort",
      url: "https://usaco.guide/gold/toposort",
      supports: "Kahn's algorithm, reporting a cycle when the output order is shorter than the number of vertices, breaking ties for the lexicographically smallest order, and DP along a topological order such as the longest path in a DAG.",
      quotes: [
        "does not equal the number of elements that need to be sorted, then there is a cycle in the graph",
        "We can also use Kahn's algorithm to extract the lexicographically minimum topological sort by breaking ties lexographically.",
        "we can perform dynamic programming on the graph if we process the states in an order that guarantees",
        "In this task, we must find the longest path in a DAG.",
      ],
    },
    {
      title: "Wikipedia: Topological sorting",
      url: "https://en.wikipedia.org/wiki/Topological_sorting",
      supports: "Topological orders exist exactly for directed acyclic graphs and take linear time to find; Kahn's algorithm reports a cycle when it cannot finish, and processing vertices in topological order gives shortest paths in a weighted DAG.",
      quotes: [
        "A topological ordering is possible if and only if the graph has no directed cycles, that is, if it is a directed acyclic graph",
        "The usual algorithms for topological sorting have running time linear in the number of nodes plus the number of edges",
        "Otherwise, the graph must have at least one cycle and therefore a topological sort is impossible.",
        "The topological ordering can also be used to quickly compute shortest paths through a weighted directed acyclic graph.",
      ],
    },
  ],
  'shortest-paths': [
    {
      title: "CP-Algorithms: Dijkstra - finding shortest paths from given vertex",
      url: "https://cp-algorithms.com/graph/dijkstra.html",
      supports: "Dijkstra's algorithm for non-negative edge weights, the fact that a vertex's distance is final once it is marked (settled), and restoring the shortest paths from an array of predecessors.",
      quotes: [
        "The weights of all edges are non-negative. You are also given a starting vertex",
        "is the shortest, and will no longer change",
        "Usually one needs to know not only the lengths of shortest paths but also the shortest paths themselves.",
        "This array of predecessors can be used to restore the shortest path to any vertex",
      ],
    },
    {
      title: "CP-Algorithms: Dijkstra on sparse graphs",
      url: "https://cp-algorithms.com/graph/dijkstra_sparse.html",
      supports: "The priority-queue version of Dijkstra in O(m log n): out-of-date entries stay in the queue and are skipped when popped, a check without which the running time can grow to O(nm), and the queue must be made to return the smallest distance first.",
      quotes: [
        "We simply don't delete the old pair from the queue.",
        "after extracting the next pair, we check if it is an important pair or if it is already an old and handled pair",
        "This check is important, otherwise the complexity can increase up to",
        "To make it sort the elements in ascending order, we can either store the negated distances in it, or pass it a different sorting function.",
      ],
    },
    {
      title: "CP-Algorithms: Floyd-Warshall - finding all shortest paths",
      url: "https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html",
      supports: "Floyd–Warshall computes all-pairs shortest paths in O(n³) in phases, where before phase k a path may only pass through vertices numbered below k, and transitions through non-existent (infinite) paths can be skipped.",
      quotes: [
        "The key idea of the algorithm is to partition the process of finding the shortest path between any two vertices to several incremental phases.",
        "if this path is allowed to enter only the vertex with numbers smaller than",
        "This means that the new, shorter path passes through the vertex",
        "so that it does not perform transitions using paths that don't exist",
      ],
    },
    {
      title: "USACO Guide: Shortest Paths with Non-Negative Edge Weights",
      url: "https://usaco.guide/gold/shortest-paths",
      supports: "Dijkstra as the main shortest-path tool, the warning that dropping the stale-entry 'continue' makes a vertex's edges be rescanned many times and times out, and the common bug of misordering Floyd–Warshall's loops (the correct order is k, i, j).",
      quotes: [
        "Nearly all Gold shortest path problems involve Dijkstra.",
        "This ensures that when all edge weights are non-negative, we will never go through the adjacency list of any vertex more than once.",
        "Removing it will cause TLE on the last test case of the above problem!",
        "A common mistake in implementing the Floyd–Warshall algorithm is to misorder the triply nested loops (The correct order is KIJ).",
      ],
    },
    {
      title: "USACO Guide: Solution - Flight Discount (CSES)",
      url: "https://usaco.guide/problems/cses-1195-flight-discount/solution",
      supports: "Two ways to handle a one-time discount: run Dijkstra from both ends and combine the distances, or run Dijkstra over states that also record whether the discount has been used.",
      quotes: [
        "We can use Dijkstra's to compute the distance from",
        "Alternatively, we can run Dijkstra's and modify our distance array slightly to track whether the discount has been used or not.",
        "will represent the shortest distance after using the discount",
      ],
    },
  ],
  'binary-lifting': [
    {
      title: "CP-Algorithms: Lowest Common Ancestor - Binary Lifting",
      url: "https://cp-algorithms.com/graph/lca_binary_lifting.html",
      supports: "Storing each vertex's ancestors 1, 2, 4, ... levels up in O(N log N), jumping to any ancestor in O(log N), and answering LCA by bringing both vertices to the same depth and then lifting them to the highest vertices that are not yet common ancestors.",
      quotes: [
        "For each node we will precompute its ancestor above it, its ancestor two nodes above, its ancestor four above, etc.",
        "This information allows us to jump from any node to any ancestor above it in",
        "then we find the highest vertex, that isn't a common ancestor of",
      ],
    },
    {
      title: "USACO Guide: Binary Jumping",
      url: "https://usaco.guide/plat/binary-jump",
      supports: "Binary lifting for LCA: lift the deeper node to the same depth, lift both together, then take the parent; filling the table in traversal order so a node's ancestors are done first; and tree distance from the depths of the two nodes and their LCA.",
      quotes: [
        "the same depth as the other. Then, we lift both nodes up decrementally.",
        "At the end, the parent of either node is the LCA of the two.",
        "We can do this because in a DFS, we're guaranteed to have processed all of a node's parents before the node itself",
        "Thus, we have to subtract off twice the depth of the LCA, giving us our final expression.",
      ],
    },
    {
      title: "Wikipedia: Level ancestor problem",
      url: "https://en.wikipedia.org/wiki/Level_ancestor_problem",
      supports: "Jump pointers to power-of-two ancestors, built in O(n log n), answer ancestor queries in O(log n) by repeatedly jumping up the tree.",
      quotes: [
        "These pointers are called jump pointers because they jump up the tree towards the root of the tree.",
        "Using such data structure helps us jump halfway up the tree from any given node.",
        "When the algorithm is asked to process a query, we repeatedly jump up the tree using these pointers.",
      ],
    },
    {
      title: "USACO Guide: Introduction to Functional Graphs",
      url: "https://usaco.guide/silver/func-graphs",
      supports: "The same jump tables work on a successor graph, where every node has exactly one outgoing edge: the k-th successor of a node is found in O(log k) by binary jumping.",
      quotes: [
        "In a functional graph, each node has exactly one out-edge. This is also commonly referred to as a successor graph.",
        "successor of a certain node in a functional graph can be found in",
      ],
    },
    {
      title: "USACO Guide: Solution - MST for Each Edge (CF)",
      url: "https://usaco.guide/problems/cf-mst-for-each-edge/solution",
      supports: "For Codeforces MST for Each Edge, binary lifting finds the heaviest edge on a tree path by taking the heaviest edge from each endpoint up to their LCA.",
      quotes: [
        "Binary lifting can be used to find the heaviest edge in the path from node",
        "Therefore, we only need to find the heaviest edge from",
      ],
    },
  ],
  'answer-search': [
    {
      title: "CP-Algorithms: Binary Search",
      url: "https://cp-algorithms.com/num_methods/binary_search.html",
      supports: "Binary search over any monotone true/false predicate, including binary search on the answer when you can only check whether a value is achievable, in a logarithmic number of steps.",
      quotes: [
        "It is possible to use arbitrary monotonous predicate instead of",
        "Such situation often occurs when we're asked to compute some value, but we're only capable of checking whether this value is at least",
        "Logarithmic number of steps is drastically better than that of linear search.",
      ],
    },
    {
      title: "Topcoder: Binary Search",
      url: "https://www.topcoder.com/thrive/articles/Binary%20Search",
      supports: "Turning an optimisation problem such as minimising the maximum workload into a monotone yes/no predicate checked greedily, rounding mid up so a lo = mid loop cannot get stuck, and running a fixed number of iterations on real numbers.",
      quotes: [
        "that it minimizes the maximum amount of folders that a worker would have to look through.",
        "We can use the described greedy algorithm to efficiently evaluate this predicate for any x.",
        "It will always select the first element as mid, but then will not move the lower bound",
        "On Topcoder, your best bet is to just use a few hundred iterations, this will give you the best possible precision without too much thinking.",
      ],
    },
    {
      title: "CP-Algorithms: Ternary Search",
      url: "https://cp-algorithms.com/num_methods/ternary_search.html",
      supports: "Ternary search for the minimum of a function that strictly falls and then strictly rises, discarding a third of the interval each round, with a fixed iteration count as the stopping rule.",
      quotes: [
        "The function strictly decreases first, reaches a minimum, and then strictly increases.",
        "we are essentially ignoring about one third of the interval, either the left or right one.",
        "we can select a constant number of iterations as a stopping criterion.",
        "is in the area of descending values (here we used the strictness of function increasing/decreasing).",
      ],
    },
    {
      title: "USACO Guide: Optimizing Unimodal Functions",
      url: "https://usaco.guide/gold/ternary-search",
      supports: "On integers, binary searching for the first point where the function starts to rise instead of ternary searching; flat stretches away from the minimum making the search drop the wrong part; and a total transport cost over a chosen point being convex, as a sum of convex costs, so it can be searched.",
      quotes: [
        "in the case of our function only taking in integers, binary search is often a better option",
        "The way the binary search approach works is that it finds the first point where the function becomes strictly increasing.",
        "If we have a flat section anywhere else, it's possible that our ternary search ends up eliminating the wrong section.",
        "An important fact to know when showing that a function is convex is that the sum of convex functions is convex.",
      ],
    },
    {
      title: "USACO Guide: Binary Search",
      url: "https://usaco.guide/silver/binary-search",
      supports: "Binary search on the answer needs a monotonic check, as in binary searching the largest median reachable with a limited number of operations.",
      quotes: [
        "binary search on the answer only works if the answer function is monotonic, meaning that it is always non-decreasing or always non-increasing.",
        "Then, we binary search for the maximum possible median.",
        "This is efficient and much better than testing each possible value in the search space.",
      ],
    },
  ],
  'geometry': [
    {
      title: "CP-Algorithms: Oriented area of a triangle",
      url: "https://cp-algorithms.com/geometry/oriented-triangle-area.html",
      supports: "The 2D cross product as a signed area whose sign tells a clockwise from a counter-clockwise turn, which is zero for collinear points and twice the triangle's area.",
      quotes: [
        "the sign of the area is negative, otherwise it is positive.",
        "If the three points are collinear, the area is zero.",
        "This is analog to the definition of the cross product in 2D (see Basic Geometry).",
        "By dividing this area by two we get the area of a triangle that we are interested in.",
      ],
    },
    {
      title: "CP-Algorithms: Finding area of simple polygon in O(N)",
      url: "https://cp-algorithms.com/geometry/area-of-simple-polygon.html",
      supports: "A simple polygon's area as a sum of signed areas, one per edge (trapezoids down to the x-axis, or triangles from a fixed point), where the signs cancel the area outside the polygon.",
      quotes: [
        "iterate over all edges adding the oriented area of the triangle formed by the edge and point",
        "Again, due to the sign of area, extra area will be reduced.",
        "The area needs to be taken with sign so that the extra area will be reduced.",
      ],
    },
    {
      title: "CP-Algorithms: Check if two segments intersect",
      url: "https://cp-algorithms.com/geometry/check-segments-intersection.html",
      supports: "Testing whether two segments intersect exactly in integers with a few cross products, with a separate case for segments that lie on the same line.",
      quotes: [
        "The approach described here can work in integers.",
        "Firstly, consider the case when the segments are part of the same line.",
        "It can be checked with a couple of cross products.",
      ],
    },
    {
      title: "CP-Algorithms: Search for a pair of intersecting segments",
      url: "https://cp-algorithms.com/geometry/intersecting_segments.html",
      supports: "A sweep line that replaces checking all pairs of segments: it stops only at endpoint events, keeps the active segments sorted by height, and uses the fact that two segments that swap order must cross.",
      quotes: [
        "The naive solution algorithm is to iterate over all pairs of segments in",
        "but only in those positions when new segments appear or old ones disappear.",
        "Namely, we will store a list of segments crossing the sweep line at a given time, where the segments will be sorted by their",
        "if one segment was first higher than the other, and then became lower, then between these two moments there was an intersection",
      ],
    },
    {
      title: "Wikipedia: Point in polygon",
      url: "https://en.wikipedia.org/wiki/Point_in_polygon",
      supports: "Point in polygon by ray casting (an odd number of edge crossings means inside), the care needed when the ray passes through a vertex, and rounding errors near the boundary in floating point.",
      quotes: [
        "If the point is on the inside of the polygon then it will intersect the edge an odd number of times.",
        "If the ray passes exactly through a vertex of a polygon, then it will intersect 2 segments at their endpoints.",
        "This is effectively equivalent to considering vertices on the ray as lying slightly above the ray.",
        "the results may be incorrect if the point lies very close to that boundary, because of rounding errors.",
      ],
    },
  ],
  'convex-hull': [
    {
      title: "CP-Algorithms: Convex hull construction",
      url: "https://cp-algorithms.com/geometry/convex-hull.html",
      supports: "Andrew's monotone chain: sort the points by x, build the upper and lower hulls by popping the last point while the turn goes the wrong way, and choose whether to keep collinear points.",
      quotes: [
        "also the Monotone chain algorithm published in 1979 by Andrew.",
        "To get the upper set, we sort all points by the x-coordinate.",
        "If the angle is not clockwise, we remove the most recent point added",
        "If you need collinear points, you just need to check for them in the clockwise/counterclockwise routines.",
      ],
    },
    {
      title: "USACO Guide: Convex Hull",
      url: "https://usaco.guide/plat/convex-hull",
      supports: "The monotone chain building the lower hull and then the upper hull with no right turns, removing collinear points or not depending on the problem.",
      quotes: [
        "Next, we will calculate the convex hull in two parts - the upper and the lower hull.",
        "we want to make sure that there is no right turn among all segments of the hull",
        "Whether to include multiple collinear points depends on the question",
        "After all the points have been processed, we have found the lower hull and will begin to find the upper hull in the same manner.",
      ],
    },
    {
      title: "Wikipedia: Convex hull algorithms",
      url: "https://en.wikipedia.org/wiki/Convex_hull_algorithms",
      supports: "Andrew's monotone chain as a variant of Graham scan that sorts the points by their coordinates, where the sort is the costly step and the scan after it is linear.",
      quotes: [
        "The algorithm can be seen as a variant of Graham scan which sorts the points lexicographically by their coordinates.",
        "the Graham scan algorithm for convex hulls consists of a single sorting step followed by a linear amount of additional work.",
      ],
    },
    {
      title: "CP-Algorithms: Convex hull trick and Li Chao tree",
      url: "https://cp-algorithms.com/geometry/convex_hull_trick.html",
      supports: "The convex hull trick for a DP that takes a minimum over linear functions: keep the lower hull of the lines when they arrive in monotone slope order, and use a Li Chao tree otherwise.",
      quotes: [
        "It's obvious that the solution can be calculated via dynamic programming",
        "The idea of this approach is to maintain a lower convex hull of linear functions.",
        "This approach is useful when queries of adding linear functions are monotone in terms of",
        "Assume you're given a set of functions such that each two can intersect at most once.",
      ],
    },
    {
      title: "USACO Guide: Convex Hull Trick",
      url: "https://usaco.guide/plat/convex-hull-trick",
      supports: "Spotting a DP transition that is a line in the earlier index, the linear-time case when slopes and query positions are both sorted, and quadratic functions that reduce to lines because the x² term cancels.",
      quotes: [
        "In this module, we'll focus on the special case of CHT where \"slopes\" of functions are monotonic.",
        "part of the recurrence describes a straight line",
        "the slopes of the lines we insert are strictly increasing. The query positions are also strictly increasing.",
        "Reduces to the linear case, since we can ignore the",
      ],
    },
  ],
};

// The UKIEPC page's problems and the jury's solutions, from the organisers' own downloads.
export const UKIEPC_SOURCES = [
  {
    year: 2025,
    contest: 'https://ukiepc.info/2025/',
    problems: 'https://drive.google.com/file/d/137_WVF0q5_S061wci5xGNc_wzA_Jd7I9/view',
    solutions: 'https://drive.google.com/file/d/1E3Ak-Tec601_JeUG2_HsEvl5EZfS5hQ6/view',
    note: 'The slides title M "Motorway".',
  },
  {
    year: 2024,
    contest: 'https://ukiepc.info/2024/',
    problems: 'https://drive.google.com/file/d/1cYpc3aagg-rOGZcdG8_ugc_hY3fLVzA3/view',
    solutions: 'https://docs.google.com/presentation/d/1jfOiysy7igMsZ7OOo5Cwxo4QysvJzoVfUrFpp8e_5Q4/',
    note: 'The slides use working titles for D and G: "Drone Operator" and "Grid Search".',
  },
  {
    year: 2023,
    contest: 'https://ukiepc.info/2023/',
    problems: 'https://drive.google.com/file/d/1hpwveM79TF5hfHjPOGgiQIwJIAxb2QDZ/view',
    solutions: 'https://docs.google.com/presentation/d/1Xp9iDZWQTT2HSlsjFLxk2-C5cBJfSboJ9Pe5f-TBFTQ/',
    note: 'The slides title A "Assessment".',
  },
];
