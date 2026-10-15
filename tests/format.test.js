import { test } from 'node:test';
import assert from 'node:assert/strict';
import { richHtml, highlightHtml } from '../src/format.js';
import { speakable } from '../src/tts.js';
import { STAGE_VISUALS } from '../src/viz/stages.js';
import { mathPicture } from '../src/viz/maths.js';
import { SKILLS, SKILL_ORDER } from '../src/math/skills.js';
import { question } from '../src/math/zetamac.js';
import { STAGES } from '../src/cf/curriculum.js';

test('notation becomes inline code, superscripts and subscripts', () => {
  assert.equal(richHtml('use dp[i][j] here'), 'use <code class="ic">dp[i][j]</code> here');
  assert.equal(richHtml('runs in O(n log n)'), 'runs in <code class="ic">O(n log n)</code>');
  assert.equal(richHtml('up to 10^9 and 2^(n/2)'), 'up to 10<sup>9</sup> and 2<sup>n/2</sup>');
  assert.equal(richHtml('a_i < a_{i−1}'), 'a<sub>i</sub> &lt; a<sub>i−1</sub>');
  assert.equal(richHtml('one edge(s) only'), 'one edge(s) only');
  assert.equal(richHtml('use `x += y` then'), 'use <code class="ic">x += y</code> then');
  assert.equal(richHtml('<b>'), '&lt;b&gt;');
});

test('C++ highlighting tags each role and escapes the rest', () => {
  const s = highlightHtml('int f(vector<int>& a) { return a[0] + 1; } // done');
  assert.match(s, /<span class="tok-t">int<\/span>/);
  assert.match(s, /<span class="tok-f">f<\/span>/);
  assert.match(s, /<span class="tok-k">return<\/span>/);
  assert.match(s, /<span class="tok-n">1<\/span>/);
  assert.match(s, /<span class="tok-c">\/\/ done<\/span>/);
  assert.match(s, /&lt;/);
});

test('notation is read out as words', () => {
  assert.equal(speakable('dp[i][j] = max(dp[i − 1][j], 3)'), 'dp of i, j equals max(dp of i minus 1, j, 3)');
  assert.equal(speakable('O(n log n) for n ≤ 10^5'), 'O of n log n for n at most 10 to the 5');
  assert.equal(speakable('a_i and 2^(n/2) and |s|'), 'a i and 2 to the n/2 and the size of s');
  assert.equal(speakable('47 + 38 = 85'), '47 plus 38 equals 85');
  assert.equal(speakable('A → B'), 'A : that is, B');
});

test('every stage has a diagram, and every frame has a picture and a caption', () => {
  for (const stage of STAGES) {
    assert.ok(STAGE_VISUALS[stage.id], `no diagram for ${stage.id}`);
    for (const viz of STAGE_VISUALS[stage.id]()) {
      assert.ok(viz.title && viz.frames.length >= 1);
      for (const f of viz.frames) {
        assert.match(f.svg, /^<svg viewBox="0 0 \d+(\.\d+)? \d+(\.\d+)?"/);
        assert.ok(!/NaN|undefined|Infinity/.test(f.svg), `${stage.id}: bad number in svg`);
        assert.ok(f.caption.length > 10 && !/undefined|NaN/.test(f.caption), `${stage.id}: ${f.caption}`);
      }
    }
  }
});

test('every mental-maths skill has a picture for its sample', () => {
  for (const id of SKILL_ORDER) {
    const p = mathPicture(id, question(SKILLS[id].op, ...SKILLS[id].sample));
    assert.ok(p && p.svg.startsWith('<svg') && !/NaN|undefined/.test(p.svg + p.caption), id);
  }
});
