import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diagnose, autoGoal } from '../src/math/diagnose.js';
import { nextQuestion, OPS } from '../src/math/zetamac.js';
import { skillWeight } from '../src/math/skills.js';

// Simulates a 120 s round where each question takes msPerUnit × weight, times any per-skill slowdown.
function simulate({ msPerUnit, slow = {}, ops = OPS, seed = 1, ranges = undefined }) {
  let s = seed;
  const rng = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const questions = [];
  let t = 0, prev = null;
  for (;;) {
    const q = nextQuestion(ops, prev, rng, ranges);
    const ms = msPerUnit * skillWeight(q.skill) * (slow[q.skill] || 1);
    if (t + ms > 120000) break;
    t += ms;
    questions.push({ skill: q.skill, text: q.text, ms, misses: 0 });
    prev = q;
  }
  return { duration: 120, ops, ranges, score: questions.length, questions };
}

test('needs a minimum number of answers', () => {
  assert.equal(diagnose([]).enough, false);
  assert.equal(diagnose([{ duration: 120, ops: OPS, score: 3, questions: [] }]).enough, false);
});

test('auto goal is a reachable step up', () => {
  assert.equal(autoGoal(40), 50);
  assert.equal(autoGoal(80), 100);
  assert.equal(autoGoal(10), 15);
});

test('finds a single weak skill hidden in an otherwise even profile', () => {
  for (const weak of ['add-carry', 'sub-borrow', 'sub-cross', 'mul-facts', 'mul-split', 'mul-1112', 'div-split', 'div-1112']) {
    let checked = 0;
    for (const seed of [7, 21, 99, 123, 555, 808, 4242, 9001]) {
      const rounds = [0, 1, 2].map((i) => simulate({ msPerUnit: 1800, slow: { [weak]: 2.5 }, seed: seed + i * 1000 }));
      const seenIn = (r) => r.questions.filter((q) => q.skill === weak).length;
      // One round is enough once the skill has come up a few times; otherwise recent rounds fill in.
      let input = null;
      if (seenIn(rounds[0]) >= 3) input = rounds.slice(0, 1);
      // Older rounds count 1/2 and 1/4 as much as the latest.
      else if (seenIn(rounds[0]) + seenIn(rounds[1]) / 2 + seenIn(rounds[2]) / 4 >= 3) input = rounds;
      if (!input) continue;
      checked++;
      const d = diagnose(input);
      assert.equal(d.focus?.id, weak, `expected ${weak}, got ${d.focus?.id} (seed ${seed})`);
    }
    assert.ok(checked >= 2, `${weak} was only checked ${checked} times`);
  }
});

test('one slow answer is not enough evidence', () => {
  const round = simulate({ msPerUnit: 900, seed: 3 });
  const i = round.questions.findIndex((q) => q.skill === 'sub-borrow');
  round.questions = round.questions.filter((q, j) => q.skill !== 'sub-borrow' || j === i);
  round.questions[i].ms = 9000;
  assert.notEqual(diagnose([round], { goal: 60 }).focus?.id, 'sub-borrow');
});

test('an even profile already at goal pace gets no costly focus', () => {
  const round = simulate({ msPerUnit: 900, seed: 3 });
  const d = diagnose([round], { goal: 60 });
  assert.ok(d.skills.every((s) => s.points < 0.5));
  assert.equal(d.focus, null);
});

test('older rounds count less than the latest one', () => {
  const old = simulate({ msPerUnit: 1800, slow: { 'add-carry': 3 }, seed: 11 });
  const latest = simulate({ msPerUnit: 1800, slow: { 'mul-split': 2 }, seed: 12 });
  assert.equal(diagnose([latest, old]).focus.id, 'mul-split');
});

test('with no technique gap, the focus is the costliest skill', () => {
  const round = simulate({ msPerUnit: 2500, seed: 5 });
  const d = diagnose([round]);
  assert.equal(d.focus.reason, 'cost');
  assert.equal(d.focus.id, d.skills[0].id);
});

test('a technique gap is reported as a gap', () => {
  const d = diagnose([simulate({ msPerUnit: 1500, slow: { 'add-carry': 2.5 }, seed: 9 })]);
  assert.equal(d.focus.id, 'add-carry');
  assert.equal(d.focus.reason, 'gap');
  assert.ok(d.focus.ratio > 1.8);
});

test('works with custom Zetamac ranges', () => {
  const ranges = { add: [[2, 999], [2, 999]], mul: [[2, 99], [2, 99]] };
  const d = diagnose([simulate({ msPerUnit: 1200, slow: { 'add-carry': 2.5 }, seed: 17, ranges })]);
  assert.equal(d.focus?.id, 'add-carry');
  assert.ok(d.skills.some((s) => s.id === 'mul-2x2'));
});
