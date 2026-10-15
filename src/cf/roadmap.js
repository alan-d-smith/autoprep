// Where you are on each track and what to solve next.

import { TRACKS, STAGES, stageById } from './curriculum.js';

export function problemUrl(id) {
  const [, contest, index] = id.match(/^(\d+)([A-Z]\d*)$/);
  return Number(contest) >= 100000
    ? `https://codeforces.com/gym/${contest}/problem/${index}`
    : `https://codeforces.com/problemset/problem/${contest}/${index}`;
}

// Codeforces rank colours: newbie, pupil, specialist, expert, candidate master, master, grandmaster.
export function ratingBand(rating) {
  if (rating < 1200) return 'newbie';
  if (rating < 1400) return 'pupil';
  if (rating < 1600) return 'specialist';
  if (rating < 1900) return 'expert';
  if (rating < 2100) return 'cm';
  if (rating < 2400) return 'master';
  return 'gm';
}

// A stage is complete once its warm-up and core problems are solved; challenges are optional.
export function stageProgress(stage, isSolved) {
  const required = stage.problems.filter((p) => p.tier !== 'challenge');
  const solved = stage.problems.filter((p) => isSolved(p.id)).length;
  const requiredSolved = required.filter((p) => isSolved(p.id)).length;
  return { solved, total: stage.problems.length, required: required.length, requiredSolved, complete: requiredSolved === required.length };
}

// With a known rating, stages whose required problems are all well below it can be skipped.
export function belowLevel(stage, rating) {
  if (rating == null) return false;
  const hardestRequired = Math.max(...stage.problems.filter((p) => p.tier !== 'challenge').map((p) => p.rating));
  return rating >= hardestRequired + 200;
}

export const trackStages = (track) => track.stages.map((id) => stageById[id]).filter(Boolean);

export function currentStage(track, isSolved, rating = null) {
  return trackStages(track).find((s) => !stageProgress(s, isSolved).complete && !belowLevel(s, rating)) || null;
}

export function nextProblem(stage, isSolved) {
  return stage?.problems.find((p) => !isSolved(p.id)) || null;
}

// Where each stage sits within its track, e.g. { track, index: 3, of: 9 }.
export function stagePosition(stage) {
  const track = TRACKS.find((t) => t.id === stage.track);
  return { track, index: track.stages.indexOf(stage.id) + 1, of: track.stages.length };
}

// A contest problem is "covered" once every stage it relies on is complete.
export function covered(stageIds, isSolved) {
  const stages = stageIds.map((id) => stageById[id]).filter(Boolean);
  return stages.length > 0 && stages.every((s) => stageProgress(s, isSolved).complete);
}

export const allStages = () => STAGES;
