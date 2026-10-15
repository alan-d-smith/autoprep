// Checks every path problem against the live Codeforces problemset: it must exist, and its name and
// rating must match what the site shows. Run: npm run verify:curriculum
import { STAGES } from '../src/cf/curriculum.js';

const res = await fetch('https://codeforces.com/api/problemset.problems');
const body = await res.json();
if (body.status !== 'OK') throw new Error(body.comment || 'Codeforces API error');

const live = new Map(body.result.problems.map((p) => [`${p.contestId}${p.index}`, p]));
let problems = 0;
const issues = [];
for (const stage of STAGES) {
  for (const p of stage.problems) {
    problems++;
    const cf = live.get(p.id);
    if (!cf) issues.push(`${stage.id}: ${p.id} not found`);
    else {
      if (cf.name !== p.name) issues.push(`${stage.id}: ${p.id} is named "${cf.name}", not "${p.name}"`);
      if (cf.rating !== p.rating) issues.push(`${stage.id}: ${p.id} is rated ${cf.rating}, not ${p.rating}`);
      if (cf.tags.includes('interactive')) issues.push(`${stage.id}: ${p.id} is interactive`);
    }
  }
}

if (issues.length) {
  console.error(issues.join('\n'));
  process.exit(1);
}
console.log(`All ${problems} problems in ${STAGES.length} stages match Codeforces.`);
