// Reads public data from the Codeforces API (which allows cross-origin requests). No login needed.

const API = 'https://codeforces.com/api';
// Codeforces asks clients to make at most one call every two seconds.
const CALL_GAP_MS = 2100;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function call(method, params) {
  let body;
  try {
    const res = await fetch(`${API}/${method}?${new URLSearchParams(params)}`);
    body = await res.json();
  } catch {
    throw new Error('Codeforces did not respond. Check your connection, or try again in a minute.');
  }
  if (body.status !== 'OK') {
    const comment = body.comment || '';
    if (/not found/i.test(comment)) throw new Error(`There's no Codeforces account called “${params.handle || params.handles}”.`);
    if (/limit/i.test(comment)) throw new Error('Codeforces is rate-limiting requests. Wait a few seconds and sync again.');
    throw new Error(comment || 'Codeforces returned an error.');
  }
  return body.result;
}

// Returns the account's rating and every problem it has an accepted submission for.
export async function fetchProfile(handle, onProgress = () => {}) {
  onProgress('Looking up the account…');
  const [user] = await call('user.info', { handles: handle });
  await sleep(CALL_GAP_MS);
  onProgress('Reading accepted submissions…');
  const submissions = await call('user.status', { handle: user.handle });
  const solved = new Set();
  for (const s of submissions) {
    if (s.verdict === 'OK' && s.problem?.contestId) solved.add(`${s.problem.contestId}${s.problem.index}`);
  }
  return { handle: user.handle, rating: user.rating ?? null, maxRating: user.maxRating ?? null, rank: user.rank ?? null, solved };
}
