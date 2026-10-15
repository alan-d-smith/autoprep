import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { clipKey } from '../src/audio-key.js';
import { RECORDED_VOICE, speakable, recordingScript } from '../src/tts.js';

test('clip keys depend on the voice and the exact text', () => {
  const key = clipKey('af_heart', 'dp of i equals 3.');
  assert.match(key, /^[0-9a-z]+$/);
  assert.equal(key, clipKey('af_heart', 'dp of i equals 3.'));
  assert.notEqual(key, clipKey('bf_emma', 'dp of i equals 3.'));
  assert.notEqual(key, clipKey('af_heart', 'dp of i equals 4.'));
});

test('notation is read as words', () => {
  assert.equal(speakable('dp[i][j] = dp[i − 1][j] + 1'), 'dp of i, j is dp of i minus 1, j plus 1');
  assert.equal(speakable('up to 10^9 in O(n log n)'), 'up to 10 to the 9 in O of n log n');
});

test('chains of equals say what each step gives, and the variable a is said as a letter', () => {
  assert.equal(speakable('P[7] = P[6] + a[6] = 23 + 2 = 25'), 'P of 7 is P of 6 plus A of 6, which is 23 plus 2, so 25');
  assert.equal(speakable('d[i][k] + d[k][j] = 5 + 3 = 8, and x += 1'), 'd of i, k plus d of k, j is 5 plus 3, so 8, and x plus-equals 1');
  assert.equal(speakable('a single chain of a, and a to b in a 2D grid'), 'a single chain of A, and A to b in a 2D grid');
  assert.equal(speakable('a.x · b.y, i.e. the dot'), 'A x times b y, i.e. the dot');
  // Kokoro reads some capital As as the article, so the recording script says "eh", the letter's sound.
  assert.equal(recordingScript('a_i + a[j] = 3'), 'eh i plus eh of j is 3');
  assert.equal(recordingScript('A small grid, lca(a, x)'), 'A small grid, lca(eh, x)');
});

test('every recorded clip in the index has its audio file and matches a current paragraph', () => {
  const index = `audio/${RECORDED_VOICE}/index.json`;
  if (!existsSync(index)) return;
  const { voice, clips } = JSON.parse(readFileSync(index, 'utf8'));
  assert.equal(voice, RECORDED_VOICE);
  const texts = JSON.parse(readFileSync('audio/texts.json', 'utf8'));
  const current = new Set(texts.clips.map((c) => c.key));
  for (const key of clips) {
    assert.ok(existsSync(`audio/${RECORDED_VOICE}/${key}.webm`), `missing audio for ${key}`);
    assert.ok(current.has(key), `${key} is recorded but no longer on the site`);
  }
  for (const c of texts.clips) assert.equal(c.key, clipKey(texts.voice, c.script ?? c.text), `stale key for ${c.where}`);
});
