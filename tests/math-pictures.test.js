import { test } from 'node:test';
import assert from 'node:assert/strict';
import { question, questionForSkill, DEFAULT_RANGES } from '../src/math/zetamac.js';
import { SKILLS, SKILL_ORDER } from '../src/math/skills.js';
import { mathPicture } from '../src/viz/maths.js';

const WIDE = { add: [[2, 999], [2, 999]], mul: [[2, 99], [2, 999]] };
const NUM = /\d+(?:\.\d+)?/g;

// Every example a lesson can show: sampled from default and wide ranges, and decimals to two places.
function* examples(id, n = 300) {
  for (const ranges of [DEFAULT_RANGES, WIDE]) for (let i = 0; i < n; i++) yield questionForSkill(id, ranges);
  if (id.startsWith('dec-')) for (let i = 0; i < n; i++) yield questionForSkill(id, DEFAULT_RANGES, Math.random, null, 2);
}

// The text drawn in a picture, with rough boxes (monospace: 22px .v-big, 12px .v-note, 14px otherwise).
function texts(svg) {
  return [...svg.matchAll(/<text x="([-\d.e]+)" y="([-\d.e]+)" class="([^"]*)" text-anchor="(\w+)"[^>]*>([^<]*)<\/text>/g)].map(([, x, y, cls, anchor, t]) => {
    const [cw, h] = cls.includes('v-big') ? [13.4, 22] : cls.includes('v-note') ? [7.4, 12] : [8.4, 14];
    const w = t.length * cw, x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : +x;
    return { t, x0, x1: x0 + w, y0: y - h / 2, y1: +y + h / 2 };
  });
}

test('every number in a lesson picture comes from the question or its worked steps', () => {
  for (const id of SKILL_ORDER) {
    for (const q of examples(id)) {
      const steps = SKILLS[id].steps(q);
      const known = new Set([q.text, ...steps, String(q.answer)].flatMap((s) => s.match(NUM)));
      const picture = mathPicture(id, q);
      assert.ok(picture, `${id}: no picture for ${q.text}`);
      assert.doesNotMatch(picture.svg + picture.caption, /NaN|undefined|Infinity/, `${id}: ${q.text}`);
      for (const { t } of texts(picture.svg)) {
        for (const n of t.match(NUM) || []) {
          // Single digits are column digits, row counts and place counts.
          if (n.length > 1) assert.ok(known.has(n), `${id}: ${q.text} draws ${n} ("${t}"), not in ${steps.join(' | ')}`);
        }
      }
    }
  }
});

test('lesson pictures have no zero-length hops and no overlapping labels', () => {
  for (const id of SKILL_ORDER) {
    for (const q of examples(id, 150)) {
      const { svg, caption } = mathPicture(id, q);
      assert.doesNotMatch(caption, /\b0 more|the 0 you/, `${id}: ${q.text}`);
      for (const [, from, to] of svg.matchAll(/<path class="v-link[^"]*" d="M([\d.]+) [\d.]+ Q[-\d. ]+ ([\d.]+) /g)) {
        assert.ok(Math.abs(from - to) >= 40, `${id}: ${q.text} has a hop only ${Math.abs(from - to)}px long`);
      }
      const boxes = texts(svg);
      boxes.forEach((a, i) => boxes.slice(i + 1).forEach((b) => {
        const overlap = a.x0 < b.x1 - 1 && b.x0 < a.x1 - 1 && a.y0 < b.y1 - 1 && b.y0 < a.y1 - 1;
        assert.ok(!overlap, `${id}: ${q.text} draws "${a.t}" over "${b.t}"`);
      }));
    }
  }
});

test('worked steps for the edge cases the lessons used to skip', () => {
  const steps = (op, x, y) => { const q = question(op, x, y); return SKILLS[q.skill].steps(q); };
  assert.deepEqual(steps('mul', 7, 60), ['drop a zero: 7 × 6', '7 × 5 = 35', '35 + 7 = 42', 'put back the zero: 420']);
  assert.equal(steps('mul', 11, 130)[0], 'drop a zero: 11 × 13');
  assert.deepEqual(steps('sub', 100, 83), ['100 − 83: tens make 9 (8 and 1), ones make 10 (3 and 7), so 17']);
  assert.deepEqual(steps('sub', 813, 140), ["round 140 up to 200 (that's 60 too many)", '813 − 200 = 613', '613 + 60 = 673']);
  assert.equal(steps('fmul', '4', '0.5').at(-1), 'one decimal place in the question: 2.0 = 2');
  assert.equal(steps('fsub', '39.4', '8.4').at(-1), 'put the point back: 31.0 = 31');
  assert.deepEqual(steps('fdiv', '13', '2'), ['13 is 130 tenths: 130 ÷ 2 = 65', '65 tenths = 6.5']);
});
