import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRACKS, STAGES, TIERS, stageById } from '../src/cf/curriculum.js';
import { UKIEPC } from '../src/cf/ukiepc.js';
import { problemUrl, ratingBand, stageProgress, currentStage, nextProblem, belowLevel, covered, trackStages } from '../src/cf/roadmap.js';

const nonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

test('every stage in every track exists', () => {
  for (const track of TRACKS) {
    for (const id of track.stages) {
      assert.ok(stageById[id], `missing stage module: ${id}`);
      assert.equal(stageById[id].track, track.id, `${id} declares the wrong track`);
    }
  }
  assert.equal(STAGES.length, TRACKS.reduce((n, t) => n + t.stages.length, 0));
});

test('stages have a full primer', () => {
  for (const s of STAGES) {
    assert.ok(nonEmpty(s.title) && nonEmpty(s.summary), s.id);
    const p = s.primer;
    assert.ok(nonEmpty(p.idea), `${s.id} idea`);
    for (const key of ['spot', 'disguises', 'pitfalls']) {
      assert.ok(Array.isArray(p[key]) && p[key].length >= 2 && p[key].every(nonEmpty), `${s.id} ${key}`);
    }
    assert.ok(nonEmpty(p.code) && !p.code.includes('#include'), `${s.id} code`);
    assert.ok(p.resources.length >= 1 && p.resources.every((r) => nonEmpty(r.label) && /^https:\/\//.test(r.url)), `${s.id} resources`);
  }
});

test('problems climb gradually and every one has hints and a solution', () => {
  const seen = new Set();
  for (const s of STAGES) {
    assert.ok(s.problems.length >= 6 && s.problems.length <= 9, `${s.id} has ${s.problems.length} problems`);
    s.problems.forEach((p, i) => {
      assert.ok(!seen.has(p.id), `${p.id} appears twice`);
      seen.add(p.id);
      assert.match(p.id, /^\d+[A-Z]\d*$/);
      assert.ok(p.tier in TIERS, `${p.id} tier`);
      assert.ok(Number.isInteger(p.rating) && p.rating >= 800 && p.rating <= 3500, `${p.id} rating`);
      assert.ok(Array.isArray(p.hints) && p.hints.length === 3 && p.hints.every(nonEmpty), `${p.id} hints`);
      assert.ok(nonEmpty(p.solution), `${p.id} solution`);
      if (i > 0) {
        const prev = s.problems[i - 1];
        assert.ok(p.rating >= prev.rating, `${s.id}: ${p.id} (${p.rating}) comes after ${prev.id} (${prev.rating})`);
        assert.ok(p.rating - prev.rating <= 300, `${s.id}: jump from ${prev.rating} to ${p.rating}`);
      }
    });
    assert.equal(s.problems[0].tier, 'warmup', `${s.id} starts with a warm-up`);
    assert.ok(s.problems.some((p) => p.tier === 'core'), `${s.id} has core problems`);
  }
  for (const required of ['217A', '580C', '377A']) assert.ok(seen.has(required), `${required} is on the path`);
});

test('UKIEPC sets are complete and point at real stages', () => {
  assert.deepEqual(UKIEPC.map((c) => c.year).sort(), [2023, 2024, 2025]);
  for (const contest of UKIEPC) {
    assert.ok(contest.gym >= 100000);
    const letters = contest.problems.map((p) => p.letter);
    assert.equal(new Set(letters).size, letters.length, `${contest.year} letters are unique`);
    for (const p of contest.problems) {
      assert.ok(nonEmpty(p.name), `${contest.year}${p.letter} name`);
      assert.ok(['easy', 'medium', 'hard'].includes(p.difficulty), `${contest.year}${p.letter} difficulty`);
      assert.ok(p.stages.every((id) => stageById[id]), `${contest.year}${p.letter} stages: ${p.stages}`);
      assert.ok(Array.isArray(p.techniques) && p.techniques.length >= 1);
      assert.ok(p.hints.length === 3 && p.hints.every(nonEmpty) && nonEmpty(p.solution), `${contest.year}${p.letter} hints`);
    }
  }
});

test('problem URLs handle the problemset and gyms', () => {
  assert.equal(problemUrl('4A'), 'https://codeforces.com/problemset/problem/4/A');
  assert.equal(problemUrl('1249B2'), 'https://codeforces.com/problemset/problem/1249/B2');
  assert.equal(problemUrl('106157D'), 'https://codeforces.com/gym/106157/problem/D');
});

test('rating bands follow Codeforces rank colours', () => {
  assert.equal(ratingBand(800), 'newbie');
  assert.equal(ratingBand(1200), 'pupil');
  assert.equal(ratingBand(1599), 'specialist');
  assert.equal(ratingBand(1900), 'cm');
  assert.equal(ratingBand(2400), 'gm');
});

test('progress, current stage and coverage per track', () => {
  const [dp] = TRACKS;
  const stages = trackStages(dp);
  assert.equal(currentStage(dp, () => false).id, stages[0].id);
  const first = new Set(stages[0].problems.filter((p) => p.tier !== 'challenge').map((p) => p.id));
  assert.equal(stageProgress(stages[0], (id) => first.has(id)).complete, true);
  assert.equal(currentStage(dp, (id) => first.has(id)).id, stages[1].id);
  assert.equal(currentStage(dp, () => true), null);
  assert.equal(nextProblem(stages[0], (id) => id === stages[0].problems[0].id).id, stages[0].problems[1].id);
  assert.ok(belowLevel(stages[0], 3000));
  assert.ok(!belowLevel(stages[0], null));
  assert.equal(covered([stages[0].id], (id) => first.has(id)), true);
  assert.equal(covered([], () => true), false);
});

test('every stage has at least one short explainer video', async () => {
  const { VIDEOS } = await import('../src/cf/videos.js');
  for (const stage of STAGES) {
    const videos = VIDEOS[stage.id];
    assert.ok(videos?.length >= 1, `no video for ${stage.id}`);
    for (const v of videos) {
      assert.match(v.id, /^[\w-]{11}$/, `${stage.id}: ${v.id}`);
      assert.ok(v.title && v.channel, `${stage.id}: ${v.id}`);
      const [m, sec] = v.length.split(':').map(Number);
      assert.ok(m * 60 + sec <= 30 * 60, `${stage.id}: ${v.id} is ${v.length}`);
    }
  }
});

test('every stage has a KACTL/TRD version of its template', async () => {
  const { TRD_CODE } = await import('../src/cf/trd.js');
  for (const stage of STAGES) {
    const entry = TRD_CODE[stage.id];
    assert.ok(entry, `no TRD code for ${stage.id}`);
    assert.ok(entry.code.trim().length > 50 && !entry.code.includes('#include'), stage.id);
    assert.ok(entry.uses.length && entry.uses.every((u) => /\.(h|cpp)$/.test(u.file) && ['trd', 'kactl'].includes(u.from)), stage.id);
  }
});
