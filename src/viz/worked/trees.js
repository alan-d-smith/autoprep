// Pictures for the Trees: DFS order, subtree DP and rerooting worked problem, Company Picnic (Kattis
// companypicnic): the solution's subtree DP run on the official sample, which must give its output.

import { text, graph } from '../draw.js';
import { frame } from '../stages/common.js';

const SAMPLE = `9
Barbara 3.5 CEO
Rose 5.1 Barbara
Seth 2.9 Rose
Virgil 3.8 Wilbur
Mildred 4.4 Zack
Wilbur 2.7 Barbara
Tina 3.7 Zack
Ken 4.0 Mildred
Zack 4.2 Barbara`;
const OUTPUT = '4 3.47500000';

// Best answers are [teams, total speed in thousandths], compared by teams first, then by total.
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
const max = (a, b) => (less(a, b) ? b : a);

function solve() {
  const [n, ...lines] = SAMPLE.split('\n');
  const people = lines.map((l) => { const [name, s, boss] = l.split(' '); return { name, speed: Math.round(+s * 1000), boss }; });
  const id = Object.fromEntries(people.map((p, i) => [p.name, i]));
  const kids = people.map(() => []);
  let root = 0;
  people.forEach((p, i) => { if (p.boss === 'CEO') root = i; else kids[id[p.boss]].push(i); });
  const order = [], st = [root];
  while (st.length) { const v = st.pop(); order.push(v); st.push(...kids[v]); }
  const down = people.map(() => null), pick = people.map(() => -1), steps = [];
  for (let i = +n - 1; i >= 0; i--) {
    const v = order[i];
    let single = [0, 0], paired = [-1, 0];
    for (const c of kids[v]) single = add(single, max(down[c][0], down[c][1]));
    const options = kids[v].map((c) => ({ c, value: add(add(sub(single, max(down[c][0], down[c][1])), down[c][0]), [1, Math.min(people[v].speed, people[c].speed)]) }));
    for (const o of options) if (less(paired, o.value)) { paired = o.value; pick[v] = o.c; }
    down[v] = [single, paired];
    steps.push({ v, options, down: down.map((d) => d && [...d]) });
  }
  const best = max(down[root][0], down[root][1]);
  const answer = `${best[0]} ${(best[1] / 1000 / best[0]).toFixed(8)}`;
  if (answer !== OUTPUT) throw new Error(`Company Picnic sample: got ${answer}, expected ${OUTPUT}`);
  // The teams behind the best answer: walk down from the root, following each choice.
  const teams = [];
  const walk = (v, taken) => {
    const teamed = !taken && less(down[v][0], down[v][1]);
    if (teamed) teams.push([v, pick[v]]);
    for (const c of kids[v]) walk(c, teamed && c === pick[v]);
  };
  walk(root, false);
  return { people, kids, root, order, down, steps, best, teams };
}

const fmt = (b) => `${b[0]}, ${(b[1] / 1000).toFixed(1)}`;
const speedOf = (x) => (x / 1000).toFixed(1);

export default () => {
  const P = solve();
  const { people } = P;
  const ini = (i) => people[i].name[0];
  if (new Set(people.map((p) => p.name[0])).size !== people.length) throw new Error('Company Picnic: initials must be distinct');
  const byName = Object.fromEntries(people.map((p, i) => [p.name[0], i]));
  const nodes = { B: [90, 44], R: [30, 112], W: [90, 112], Z: [150, 112], S: [30, 180], V: [90, 180], M: [128, 180], T: [172, 180], K: [128, 248] };
  if (Object.keys(nodes).some((k) => !(k in byName))) throw new Error('Company Picnic: layout and sample disagree');
  const edges = people.flatMap((p, i) => (p.boss === 'CEO' ? [] : [[people[byName[p.boss[0]]].name[0], ini(i)]]));
  const tree = (nodeCls, edgeCls = () => '') => graph(nodes, edges, { nodeCls, edgeCls });
  const isTeam = (list) => (a, b) => list.some(([x, y]) => (ini(x) === a && ini(y) === b) || (ini(x) === b && ini(y) === a));

  // The table: one row per employee in the order the DP fills them, children before their boss.
  const rows = [...P.order].reverse();
  const nx = 262, sx = 270, x0 = 314, x1 = 384, ty = 50, rh = 26;
  const cell = (x, y, w, v, cls) => `<g class="v-cell ${cls}"><rect x="${x}" y="${y}" width="${w}" height="${rh - 4}" rx="4"/>${v === '' ? '' : text(x + w / 2, y + (rh - 4) / 2, v)}</g>`;
  const grid = (down, { hl = -1, done = () => true } = {}) => {
    let out = text(sx + 19, ty - 14, 'speed', 'v-head') + text((x0 + x1 + 66) / 2, ty - 30, 'down[v]', 'v-head')
      + text(x0 + 33, ty - 14, '[0]', 'v-head') + text(x1 + 33, ty - 14, '[1]', 'v-head');
    rows.forEach((v, r) => {
      const y = ty + r * rh, d = down[v], cls = v === hl ? 'hl' : '';
      out += text(nx, y + (rh - 4) / 2, people[v].name, 'v-name', 'end') + cell(sx, y, 38, speedOf(people[v].speed), '');
      const shown = d && done(v);
      out += cell(x0, y, 66, shown ? fmt(d[0]) : '', shown ? cls : 'dim');
      out += cell(x1, y, 66, shown ? (d[1][0] < 0 ? '−' : fmt(d[1])) : '', shown ? (d[1][0] < 0 ? 'dim' : cls) : 'dim');
    });
    return out;
  };
  const W = 456, H = ty + rows.length * rh + 6;
  const frames = [];

  frames.push(frame(W, H, tree(() => '') + grid([]),
    `The sample's chart, Barbara at the top. The table lists everyone children first, the order the DP fills it.`));

  // The obvious greedy: take the fastest possible team while both members are free.
  const cands = P.people.flatMap((p, i) => (p.boss === 'CEO' ? [] : [[byName[p.boss[0]], i]]))
    .map(([a, b]) => ({ a, b, s: Math.min(people[a].speed, people[b].speed) }))
    .sort((x, y) => y.s - x.s);
  const busy = new Set(), greedy = [];
  for (const t of cands) {
    t.take = !busy.has(t.a) && !busy.has(t.b);
    if (t.take) { busy.add(t.a); busy.add(t.b); greedy.push([t.a, t.b]); }
  }
  if (greedy.length >= P.best[0]) throw new Error('Company Picnic: expected the greedy to lose a team');
  const gx = 250;
  let list = text(gx + 100, 16, 'fastest first', 'v-head');
  cands.forEach((t, r) => {
    const y = 30 + r * 28;
    list += text(gx + 74, y + 12, `${people[t.a].name}–${people[t.b].name}`, 'v-name', 'end') + cell(gx + 82, y, 40, speedOf(t.s), t.take ? 'good' : 'bad')
      + text(gx + 130, y + 12, t.take ? 'team' : 'skip', `v-note ${t.take ? 'good' : 'bad'}`, 'start');
  });
  frames.push(frame(W, Math.max(270, 30 + cands.length * 28 + 6),
    tree((x) => (busy.has(byName[x]) ? 'done' : 'dim'), (a, b) => (isTeam(greedy)(a, b) ? 'good' : 'dim')) + list,
    `Greedy takes ${greedy.map(([a, b]) => `${people[a].name}–${people[b].name}`).join(', ')}: ${greedy.length} teams. ${people.filter((_, i) => !busy.has(i)).map((p) => p.name).join(', ')} are left without a partner.`));

  // The DP mid-run, just after Zack, and at Barbara, the last step.
  const at = (name) => P.steps.find((s) => people[s.v].name === name);
  const stepOf = Object.fromEntries(P.steps.map((x, i) => [x.v, i]));
  const filled = (s) => (v) => stepOf[v] <= stepOf[s.v];
  for (const who of ['Zack', 'Barbara']) {
    const s = at(who);
    const best = s.options.reduce((a, o) => (less(a.value, o.value) ? o : a));
    frames.push(frame(W, H,
      tree((x) => (byName[x] === s.v ? 'current' : filled(s)(byName[x]) ? 'done' : ''), (a, b) => (ini(s.v) === a && ini(best.c) === b ? 'hl' : ''))
      + grid(s.down, { hl: s.v, done: filled(s) }),
      `${who}: down[v][0] = ${fmt(s.down[s.v][0])}; teaming with ${s.options.map((o) => `${people[o.c].name} gives ${fmt(o.value)}`).join(', ')}, so down[v][1] = ${fmt(s.down[s.v][1])}.`));
  }

  // The teams behind the best answer.
  frames.push(frame(W, H,
    tree((x) => (P.teams.some(([a, b]) => a === byName[x] || b === byName[x]) ? 'done' : 'dim'), (a, b) => (isTeam(P.teams)(a, b) ? 'good' : 'dim'))
    + grid(P.down, { hl: P.root }),
    `The best answer, ${fmt(P.best)}, comes from the teams ${P.teams.map(([a, b]) => `${people[a].name}–${people[b].name}`).join(', ')}: ${P.best[0]} teams, average ${(P.best[1] / 1000 / P.best[0]).toFixed(3)}.`));

  return [{ title: 'Company Picnic: subtree DP on the sample', frames }];
};
