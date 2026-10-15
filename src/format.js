// Text formatting for hints and primers, and C++ syntax highlighting for templates.
//
// The content is plain text written the way people write about algorithms: dp[i][j], O(n log n),
// max(a, b), 10^9, a_i. rich() finds those and renders them as inline code, superscripts and
// subscripts. Anything in `backticks` is always code.

import { raw } from './dom.js';

const escape = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Balanced (...) or [...] up to three levels deep.
const PAREN = String.raw`\((?:[^()\n]|\((?:[^()\n]|\([^()\n]*\))*\))*\)`;
const BRACKET = String.raw`\[(?:[^\[\]\n]|\[(?:[^\[\]\n]|\[[^\[\]\n]*\])*\])*\]`;
const CPP_WORDS = String.raw`\b(?:long long|__int128|lower_bound|upper_bound|unordered_map|unordered_set|nth_element|priority_queue|accumulate|int64_t|uint64_t|__builtin_\w+|bitset<[^>\n]+>|vector<[^>\n]+>)`;
const CODE = new RegExp(String.raw`\x60([^\x60]+)\x60|[A-Za-z_][A-Za-z0-9_']*(?:${BRACKET}|${PAREN})+|${CPP_WORDS}`, 'g');

// "edge(s)", "station(es)" are prose, not calls.
const PLURAL = /^[A-Za-z]+\((?:s|es)\)$/;

// On already-escaped text: 10^9 → 10<sup>9</sup>, 2^(n/2) → 2<sup>n/2</sup>, a_i → a<sub>i</sub>, a_{i−1} → a<sub>i−1</sub>.
function scripts(html) {
  return html
    .replace(/([A-Za-z0-9)\]²³])\^(?:\(([^()]*)\)|(-?[A-Za-z0-9]+))/g, (_, base, group, word) => `${base}<sup>${group ?? word}</sup>`)
    .replace(/\b([A-Za-z])_(?:\{([^}]*)\}|([A-Za-z0-9]+))/g, (_, base, group, word) => `${base}<sub>${group ?? word}</sub>`);
}

const code = (s) => `<code class="ic">${scripts(escape(s))}</code>`;

export function richHtml(text) {
  let out = '';
  let last = 0;
  for (const m of text.matchAll(CODE)) {
    out += scripts(escape(text.slice(last, m.index)));
    if (m[1] !== undefined) out += code(m[1]);
    else if (PLURAL.test(m[0])) out += scripts(escape(m[0]));
    else out += code(m[0]);
    last = m.index + m[0].length;
  }
  return out + scripts(escape(text.slice(last)));
}

export const rich = (text) => raw(richHtml(text));

// ---------- C++ highlighting ----------

const CPP = new RegExp([
  String.raw`(\/\/[^\n]*|\/\*[\s\S]*?\*\/)`, // 1 comment
  String.raw`("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')`, // 2 string or char
  String.raw`(^[ \t]*#[^\n]*)`, // 3 preprocessor
  String.raw`\b(0x[0-9a-fA-F]+|\d[\d']*(?:\.\d+)?(?:e[+-]?\d+)?[uUlLfF]*)\b`, // 4 number
  String.raw`\b(auto|break|case|const|constexpr|continue|default|do|else|for|if|inline|namespace|operator|return|static|struct|class|switch|template|typename|using|while|true|false|nullptr|sizeof|this|new|delete|public|private|mutable)\b`, // 5 keyword
  String.raw`\b(int|long|short|char|bool|double|float|void|unsigned|signed|size_t|int64_t|uint64_t|__int128|ll|ull|ld|pii|pli|vi|vector|pair|array|string|map|set|multiset|unordered_map|unordered_set|priority_queue|deque|queue|stack|bitset|tuple|greater|less|function|numeric_limits|mt19937_64|mt19937)\b`, // 6 type
  String.raw`\b([A-Za-z_]\w*)(?=\s*\()`, // 7 function call or definition
].join('|'), 'gm');

const CLASSES = [null, 'c', 's', 'p', 'n', 'k', 't', 'f'];

export function highlightHtml(source) {
  let out = '';
  let last = 0;
  for (const m of source.matchAll(CPP)) {
    out += escape(source.slice(last, m.index));
    const group = m.findIndex((g, i) => i > 0 && g !== undefined);
    out += `<span class="tok-${CLASSES[group]}">${escape(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + escape(source.slice(last));
}

export const highlightCpp = (source) => raw(highlightHtml(source));
