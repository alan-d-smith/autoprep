import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, question, questionForSkill, randomQuestion, decimalQuestion, nextQuestion, skillDistribution, normaliseRanges, canonical, isCorrect, OPS, DEFAULT_RANGES } from '../src/math/zetamac.js';
import { SKILLS, SKILL_ORDER } from '../src/math/skills.js';

const WIDE = { add: [[2, 999], [2, 999]], mul: [[2, 99], [2, 999]] };

test('classifies the cases the lessons describe', () => {
  assert.equal(classify('add', 43, 25), 'add-basic');
  assert.equal(classify('add', 72, 51), 'add-basic'); // only the leading column carries
  assert.equal(classify('add', 47, 38), 'add-carry');
  assert.equal(classify('add', 450, 380), 'add-carry');
  assert.equal(classify('sub', 87, 25), 'sub-basic');
  assert.equal(classify('sub', 84, 29), 'sub-borrow');
  assert.equal(classify('sub', 534, 156), 'sub-borrow');
  assert.equal(classify('sub', 134, 56), 'sub-cross');
  assert.equal(classify('sub', 100, 37), 'sub-cross');
  assert.equal(classify('sub', 523, 48), 'sub-cross');
  assert.equal(classify('sub', 145, 100), 'trivial');
  assert.equal(classify('mul', 7, 8), 'mul-facts');
  assert.equal(classify('mul', 7, 60), 'mul-facts');
  assert.equal(classify('mul', 7, 64), 'mul-split');
  assert.equal(classify('mul', 20, 47), 'mul-split');
  assert.equal(classify('mul', 12, 47), 'mul-1112');
  assert.equal(classify('mul', 23, 47), 'mul-2x2');
  assert.equal(classify('mul', 10, 47), 'trivial');
  assert.equal(classify('div', 56, 7), 'div-facts');
  assert.equal(classify('div', 420, 7), 'div-facts');
  assert.equal(classify('div', 448, 7), 'div-split');
  assert.equal(classify('div', 840, 20), 'div-split');
  assert.equal(classify('div', 564, 12), 'div-1112');
  assert.equal(classify('div', 1081, 23), 'div-2x2');
  assert.equal(classify('div', 470, 10), 'trivial');
});

test('random questions stay inside the configured ranges and have whole answers', () => {
  for (const ranges of [DEFAULT_RANGES, WIDE]) {
    const [[aLo, aHi], [bLo, bHi]] = ranges.add;
    const [[mLo, mHi], [nLo, nHi]] = ranges.mul;
    for (let i = 0; i < 3000; i++) {
      for (const op of OPS) {
        const q = randomQuestion(op, ranges);
        assert.ok(Number.isInteger(q.answer) && q.answer >= 1, q.text);
        if (op === 'add') assert.ok(q.x >= aLo && q.x <= aHi && q.y >= bLo && q.y <= bHi);
        if (op === 'sub') assert.ok(q.y >= aLo && q.y <= aHi && q.answer >= bLo && q.answer <= bHi);
        if (op === 'mul') assert.ok(q.x >= mLo && q.x <= mHi && q.y >= nLo && q.y <= nHi);
        if (op === 'div') assert.ok(q.y >= mLo && q.y <= mHi && q.answer >= nLo && q.answer <= nHi);
      }
    }
  }
});

test('ranges are clamped and ordered', () => {
  assert.deepEqual(normaliseRanges({ add: [[100, 2], [0, 50000]], mul: [['x', 5], [3, 3]] }), {
    add: [[2, 100], [1, 9999]],
    mul: [[2, 12], [3, 3]],
  });
  assert.deepEqual(normaliseRanges(undefined), DEFAULT_RANGES);
});

test('skill distribution is a probability distribution', () => {
  for (const ranges of [DEFAULT_RANGES, WIDE]) {
    const d = skillDistribution(OPS, ranges);
    const total = Object.values(d).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(total - 1) < 1e-6, String(total));
  }
  const defaults = skillDistribution(OPS);
  for (const id of SKILL_ORDER.filter((id) => !id.endsWith('2x2') && !id.startsWith('dec-'))) assert.ok(defaults[id] > 0, id);
  assert.equal(defaults['mul-2x2'], undefined);
  assert.ok(skillDistribution(OPS, WIDE)['mul-2x2'] > 0.1);
  assert.deepEqual(Object.keys(skillDistribution(['add'])).sort(), ['add-basic', 'add-carry']);
});

test('every skill can be drilled under any settings, and its worked steps end at the right answer', () => {
  for (const ranges of [DEFAULT_RANGES, WIDE]) {
    for (const id of SKILL_ORDER) {
      for (let i = 0; i < 300; i++) {
        const q = questionForSkill(id, ranges);
        assert.equal(q.skill, id);
        const steps = SKILLS[id].steps(q);
        assert.ok(steps.length > 0);
        const numbers = steps.at(-1).match(/\d+(?:\.\d+)?/g);
        assert.equal(numbers.at(-1), String(q.answer), `${id}: ${q.text} → ${steps.join(' | ')}`);
      }
    }
  }
  for (const places of [1, 2]) {
    for (const id of ['dec-addsub', 'dec-mul', 'dec-div']) {
      for (let i = 0; i < 300; i++) {
        const q = questionForSkill(id, DEFAULT_RANGES, Math.random, null, places);
        const numbers = SKILLS[id].steps(q).at(-1).match(/\d+(?:\.\d+)?/g);
        assert.equal(numbers.at(-1), String(q.answer), `${id}: ${q.text} → ${SKILLS[id].steps(q).join(' | ')}`);
      }
    }
  }
  for (const id of SKILL_ORDER) {
    const [x, y] = SKILLS[id].sample;
    assert.equal(question(SKILLS[id].op, x, y).skill, id, `sample for ${id}`);
  }
});

test('decimal questions are exact', () => {
  assert.equal(question('fadd', '4.7', '0.38').answer, '5.08');
  assert.equal(question('fadd', '0.1', '0.2').answer, '0.3');
  assert.equal(question('fsub', '7.25', '0.6').answer, '6.65');
  assert.equal(question('fmul', '0.7', '64').answer, '44.8');
  assert.equal(question('fmul', '0.5', '64').answer, '32');
  assert.equal(question('fdiv', '44.8', '0.7').answer, '64');
  assert.equal(question('fdiv', '4.48', '0.7').answer, '6.4');
  assert.equal(question('fdiv', '3.2', '5').answer, '0.64');
  assert.equal(question('fmul', '1.2', '3.5').skill, 'dec-mul');
});

test('typed answers are compared in canonical form', () => {
  assert.equal(canonical('04.50'), '4.5');
  assert.equal(canonical('.5'), '0.5');
  assert.equal(canonical('4.'), '4');
  assert.equal(canonical('1.2.3'), null);
  assert.ok(isCorrect('0.640', question('fdiv', '3.2', '5')));
  assert.ok(isCorrect('85', question('add', 47, 38)));
  assert.ok(!isCorrect('8', question('add', 47, 38)));
});

test('decimal questions reverse exactly and respect the decimal places', () => {
  for (const places of [1, 2]) {
    for (let i = 0; i < 3000; i++) {
      for (const op of OPS) {
        const q = decimalQuestion(op, DEFAULT_RANGES, places);
        assert.ok(q.text.includes('.') || String(q.answer).includes('.'), q.text);
        const decimals = (s) => (String(s).split('.')[1] || '').length;
        if (op === 'add' || op === 'sub') assert.ok(decimals(q.answer) <= places, q.text);
        if (op === 'mul') assert.ok(decimals(q.answer) <= places, q.text);
        if (op === 'div') assert.ok(decimals(q.answer) <= places && Number(q.answer) > 0, q.text);
      }
    }
  }
});

test('mixed mode gives about half decimals, only mode gives all decimals', () => {
  const count = (mode) => {
    let n = 0;
    for (let i = 0; i < 4000; i++) if (nextQuestion(OPS, null, Math.random, DEFAULT_RANGES, { mode, places: 1 }).op.startsWith('f')) n++;
    return n / 4000;
  };
  assert.ok(Math.abs(count('mixed') - 0.5) < 0.05);
  assert.equal(count('only'), 1);
  assert.equal(count('off'), 0);
  const share = skillDistribution(OPS, DEFAULT_RANGES, { mode: 'only', places: 2 });
  assert.ok(Math.abs(Object.values(share).reduce((a, b) => a + b, 0) - 1) < 1e-6);
  assert.ok(share['dec-mul'] > 0.2 && share['dec-div'] > 0.2 && share['dec-addsub'] > 0.4);
});
