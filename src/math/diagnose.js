// Turns a benchmark's per-question timings into "what to practise next".
//
// Model: a question of skill s takes you about pace × weight(s) ms, where weight is how hard
// that kind of question is for a fluent player and pace is your typical speed.
//
// Two ways a skill can deserve attention:
// - gap: it is far slower than your own pace predicts. That is a missing technique, the quickest
//   thing to fix, so it is the focus whenever it is worth at least about a point per round.
// - cost: your goal score sets a target time for every skill. A skill's cost is the extra correct
//   answers per round you'd get if that one skill hit its target. With no gap to fix, the focus is
//   the costliest skill, usually whichever question type eats most of the round.

import { skillDistribution, DEFAULT_RANGES, NO_DECIMALS } from './zetamac.js';
import { SKILLS, skillWeight } from './skills.js';

export const MIN_SCORE = 8;
// Older rounds still inform the estimate, at reduced weight (current, previous, the one before).
const HISTORY_WEIGHTS = [1, 0.5, 0.25];
// Pseudo-observations pulling a sparsely measured skill toward your overall pace.
const PRIOR_STRENGTH = 2;
// Ignore a skill as a focus until it has this much (weighted) evidence.
const MIN_EVIDENCE = 2;
// A single freeze counts, but no question can weigh more than this many typical questions.
const HANG_CAP = 5;
// How far out of line with your pace a skill must be, and what fixing it must be worth, to count as a gap.
const GAP_RATIO = 1.3;
const GAP_POINTS = 0.75;
const COST_POINTS = 0.5;

export function autoGoal(score) {
  return Math.max(score + 5, Math.ceil((score * 1.25) / 5) * 5);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function weightedMedian(items) {
  const sorted = [...items].sort((a, b) => a.value - b.value);
  const half = sorted.reduce((sum, it) => sum + it.w, 0) / 2;
  let acc = 0;
  for (const it of sorted) {
    acc += it.w;
    if (acc >= half) return it.value;
  }
  return sorted.at(-1).value;
}

// Extra correct answers per round if the average question time dropped by savingMs.
const pointsFrom = (durationMs, avgMs, savingMs) => durationMs / (avgMs - savingMs) - durationMs / avgMs;

/**
 * @param rounds benchmark rounds, most recent first: { duration, ops, ranges, decimals, score, questions: [{ skill, text, ms, misses }] }
 * @param options.goal target score; defaults to a step above the latest score
 */
export function diagnose(rounds, { goal } = {}) {
  const current = rounds[0];
  if (!current || current.score < MIN_SCORE) return { enough: false };

  const samples = rounds.slice(0, HISTORY_WEIGHTS.length).flatMap((round, i) =>
    round.questions.map((q) => ({ ...q, w: HISTORY_WEIGHTS[i], current: i === 0 })));
  const cap = HANG_CAP * median(samples.map((s) => s.ms));

  const bySkill = {};
  for (const s of samples) {
    const ms = Math.min(s.ms, cap);
    const agg = (bySkill[s.skill] ||= { evidence: 0, ms: 0, n: 0, misses: 0 });
    agg.evidence += s.w;
    agg.ms += s.w * ms;
    if (s.current) { agg.n++; agg.misses += s.misses || 0; }
  }
  // Median, so one weak skill doesn't drag your "normal" speed toward itself.
  const pace = weightedMedian(samples.map((s) => ({ value: Math.min(s.ms, cap) / skillWeight(s.skill), w: s.w })));

  const share = skillDistribution(current.ops, current.ranges || DEFAULT_RANGES, current.decimals || NO_DECIMALS);
  const goalScore = goal ?? autoGoal(current.score);
  const durationMs = current.duration * 1000;
  const unitsPerQuestion = Object.entries(share).reduce((sum, [id, f]) => sum + f * skillWeight(id), 0);
  const targetPace = durationMs / goalScore / unitsPerQuestion;

  const rows = Object.entries(share).map(([id, f]) => {
    const agg = bySkill[id] || { evidence: 0, ms: 0, n: 0, misses: 0 };
    const k = skillWeight(id);
    const estimate = (agg.ms + PRIOR_STRENGTH * pace * k) / (agg.evidence + PRIOR_STRENGTH);
    return { id, share: f, n: agg.n, evidence: agg.evidence, misses: agg.misses, estimate, target: targetPace * k, ratio: estimate / (pace * k) };
  });

  const avgNow = rows.reduce((sum, r) => sum + r.share * r.estimate, 0);
  for (const r of rows) {
    r.points = pointsFrom(durationMs, avgNow, r.share * Math.max(0, r.estimate - r.target));
    r.gapPoints = pointsFrom(durationMs, avgNow, r.share * Math.max(0, r.estimate - pace * skillWeight(r.id)));
  }

  const skills = rows.filter((r) => SKILLS[r.id]).sort((a, b) => b.points - a.points);
  const candidates = skills.filter((r) => r.evidence >= MIN_EVIDENCE);
  const gap = candidates
    .filter((r) => r.ratio >= GAP_RATIO && r.gapPoints >= GAP_POINTS)
    .sort((a, b) => b.gapPoints - a.gapPoints)[0];
  const costliest = candidates.find((r) => r.points >= COST_POINTS);
  let focus = null;
  if (gap) focus = { ...gap, reason: 'gap' };
  else if (costliest) focus = { ...costliest, reason: 'cost' };
  if (focus) focus.confidence = focus.evidence >= 4 ? 'good' : 'low';

  const slowest = current.questions
    .filter((q) => SKILLS[q.skill])
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 3);

  return {
    enough: true,
    score: current.score,
    goal: goalScore,
    goalIsAuto: goal == null,
    paceMs: pace,
    avgMs: avgNow,
    targetAvgMs: durationMs / goalScore,
    skills,
    focus,
    slowest,
  };
}
