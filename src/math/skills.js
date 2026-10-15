// The mental-maths skills a Zetamac round is made of: how to spot them, the fast method,
// and that method written out for any specific question (any size of operands).

import { parseDecimal, formatDecimal, alignDecimals } from './zetamac.js';

const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands'];

// 4207 → [4000, 200, 7]
function placeParts(n) {
  const parts = [];
  for (let p = 1; n > 0; p *= 10, n = Math.floor(n / 10)) if (n % 10) parts.unshift((n % 10) * p);
  return parts;
}

function stripZeros(n) {
  let zeros = 0;
  while (n >= 10 && n % 10 === 0) { n /= 10; zeros++; }
  return [n, zeros];
}

const zerosLine = (zeros, result) => `put back ${zeros === 1 ? 'the zero' : `${zeros} zeros`}: ${result}`;

// Splits a multiplication into its zero-free core: 120 × 70 → small 7, big 12, 2 zeros.
function mulCore(x, y) {
  const [p, pz] = stripZeros(x), [q, qz] = stripZeros(y);
  const [small, big] = p <= q ? [p, q] : [q, p];
  return { small, big, zeros: pz + qz };
}

// Anchor tricks for single-digit facts, in the order we prefer to use them.
const ANCHOR_ORDER = [2, 11, 5, 9, 4, 12, 3, 6, 8, 7];

function factSteps(a, b) {
  const m = ANCHOR_ORDER.find((k) => k === a || k === b) ?? a;
  const n = m === a ? b : a;
  switch (m) {
    case 2: return [`double ${n} = ${2 * n}`];
    case 3: return [`double ${n} = ${2 * n}`, `${2 * n} + ${n} = ${3 * n}`];
    case 4: return [`double ${n} = ${2 * n}`, `double again = ${4 * n}`];
    case 5: return [`${n} × 10 = ${10 * n}`, `half of that = ${5 * n}`];
    case 6: return [`${n} × 5 = ${5 * n}`, `${5 * n} + ${n} = ${6 * n}`];
    case 7: return [`${n} × 5 = ${5 * n}`, `${n} × 2 = ${2 * n}`, `${5 * n} + ${2 * n} = ${7 * n}`];
    case 8: return [`double ${n} three times: ${2 * n}, ${4 * n}, ${8 * n}`];
    case 9: return [`${n} × 10 = ${10 * n}`, `${10 * n} − ${n} = ${9 * n}`];
    case 11: return [`${n} × 10 = ${10 * n}`, `${10 * n} + ${n} = ${11 * n}`];
    case 12: return [`${n} × 10 = ${10 * n}`, `${n} × 2 = ${2 * n}`, `${10 * n} + ${2 * n} = ${12 * n}`];
    default: return [`${a} × ${b} = ${a * b}`];
  }
}

// Multiply `big` by each place-value part of `by`, then add the pieces.
function splitSteps(by, big) {
  const parts = placeParts(by);
  if (parts.length === 1) return [`${by} × ${big} = ${by * big}`];
  const products = parts.map((p) => p * big);
  return [...parts.map((p, i) => `${p} × ${big} = ${products[i]}`), `${products.join(' + ')} = ${by * big}`];
}

function withZeros(steps, zeros, result) {
  return zeros ? [...steps, zerosLine(zeros, result)] : steps;
}

// Divide by peeling off the largest place-value chunk of the quotient at a time.
function chunkSteps(x, d, q) {
  const parts = placeParts(q);
  if (parts.length === 1) return [`${d} × ${q} = ${x}, so ${q}`];
  const steps = [];
  let rest = x;
  parts.forEach((part, i) => {
    if (i === parts.length - 1) {
      steps.push(`${rest} ÷ ${d} = ${part}`);
    } else {
      steps.push(`${d} × ${part} = ${d * part}`, `${rest} − ${d * part} = ${rest - d * part} left`);
      rest -= d * part;
    }
  });
  steps.push(`${parts.join(' + ')} = ${q}`);
  return steps;
}

// Cancels zeros shared by the dividend and divisor (840 ÷ 20 → 84 ÷ 2).
function divCore(x, y) {
  const [d, dz] = stripZeros(y);
  const steps = dz ? [`cancel ${dz === 1 ? 'a zero' : `${dz} zeros`} from both: ${x / 10 ** dz} ÷ ${d}`] : [];
  return { x: x / 10 ** dz, d, q: x / y, steps };
}

function chunkedDivision({ x, y }) {
  const core = divCore(x, y);
  return [...core.steps, ...chunkSteps(core.x, core.d, core.q)];
}

// `weight` is the relative time a fluent player spends on this kind of question
// (clean addition = 1). The diagnosis uses it to set per-skill targets.
export const SKILLS = {
  'add-basic': {
    op: 'add',
    name: 'Addition without carrying',
    weight: 1.0,
    sample: [43, 25],
    lesson: {
      title: 'Add the tens, then the ones',
      idea: 'Start from the bigger number and add the other one place by place, biggest place first. Each step is a single-digit addition, and the answer comes out in the order you type it.',
      when: 'No column adds up to 10 or more, like 43 + 25.',
    },
    steps({ x, y }) {
      const [a, b] = x >= y ? [x, y] : [y, x];
      const parts = placeParts(b);
      if (parts.length <= 1) return [`${a} + ${b} = ${a + b}`];
      const steps = [];
      let acc = a;
      for (const p of parts) {
        steps.push(`${acc} + ${p} = ${acc + p}`);
        acc += p;
      }
      return steps;
    },
  },
  'add-carry': {
    op: 'add',
    name: 'Addition with carrying',
    weight: 1.25,
    sample: [47, 38],
    lesson: {
      title: 'Settle the carry first, right to left',
      idea: 'Before you type anything, add the ones digits. If they make 10 or more, you know the last digit of the answer and that the next column goes up by one. Work leftwards the same way, then type the whole answer left to right without hesitating.',
      when: 'A column adds up to 10 or more, like 47 + 38 or 69 + 56. Shortcut: if one number ends in 8 or 9, round it up and take the difference back off (47 + 39 = 47 + 40 − 1).',
    },
    steps({ x, y }) {
      const columns = Math.max(String(x).length, String(y).length);
      const steps = [];
      let carry = 0;
      for (let i = 0; i < columns; i++) {
        const dx = Math.floor(x / 10 ** i) % 10, dy = Math.floor(y / 10 ** i) % 10;
        const sum = dx + dy + carry;
        const label = `${PLACES[i] || `column ${i + 1}`}: ${dx} + ${dy}${carry ? ' + 1' : ''} = ${sum}`;
        const last = i === columns - 1;
        steps.push(!last && sum >= 10 ? `${label}, write ${sum % 10}, carry 1` : label);
        carry = sum >= 10 ? 1 : 0;
      }
      steps.push(`answer: ${x + y}`);
      return steps;
    },
  },
  'sub-basic': {
    op: 'sub',
    name: 'Subtraction without borrowing',
    weight: 1.05,
    sample: [87, 25],
    lesson: {
      title: 'Take away the biggest place first',
      idea: 'Subtract the second number place by place, biggest place first. No digit ever goes below zero, so each step is a single fact.',
      when: 'Every digit on top is at least the digit underneath, like 87 − 25.',
    },
    steps({ x, y }) {
      const parts = placeParts(y);
      if (parts.length <= 1) return [`${x} − ${y} = ${x - y}`];
      const steps = [];
      let acc = x;
      for (const p of parts) {
        steps.push(`${acc} − ${p} = ${acc - p}`);
        acc -= p;
      }
      return steps;
    },
  },
  'sub-borrow': {
    op: 'sub',
    name: 'Subtraction with borrowing',
    weight: 1.35,
    sample: [84, 29],
    lesson: {
      title: 'Round the number you take away',
      idea: 'Borrowing digit by digit means holding a change in your head while you work. Instead, round the number you are subtracting up to the next ten, subtract that, and add back the extra. Both steps are clean.',
      when: 'A digit on top is smaller than the one underneath, like 84 − 29 or 72 − 36. It is quickest when the number you take away ends in 7, 8 or 9.',
    },
    steps({ x, y }) {
      const up = (10 - (y % 10)) % 10;
      if (!up) return [`${x} − ${y} = ${x - y}`];
      return [`round ${y} up to ${y + up} (that's ${up} too many)`, `${x} − ${y + up} = ${x - y - up}`, `${x - y - up} + ${up} = ${x - y}`];
    },
  },
  'sub-cross': {
    op: 'sub',
    name: 'Subtracting across a hundred',
    weight: 1.45,
    sample: [134, 56],
    lesson: {
      title: 'Bridge through the hundred',
      idea: 'Split the top number into its hundreds and the rest. Take the second number away from the hundreds, then add the rest back on. For 100 − 56, the digits pair up: tens make 9 (5 and 4), ones make 10 (6 and 4), so it is 44.',
      when: 'The answer drops below a hundred boundary, like 134 − 56 (below 100) or 523 − 48 (below 500).',
    },
    steps({ x, y }) {
      const hundreds = Math.floor(x / 100) * 100;
      const rest = x - hundreds;
      if (!rest) return [`${x} − ${y} = ${x - y}`];
      return [`${x} = ${hundreds} + ${rest}`, `${hundreds} − ${y} = ${hundreds - y}`, `${hundreds - y} + ${rest} = ${x - y}`];
    },
  },
  'mul-facts': {
    op: 'mul',
    name: 'Times tables to 12 × 12',
    weight: 0.95,
    sample: [7, 8],
    lesson: {
      title: 'Know the facts cold',
      idea: 'Times-table facts should be recall, not calculation. Until a fact is automatic, rebuild it from an anchor you do know: ×5 is half of ×10, ×9 is ×10 minus one lot, ×4 and ×8 are repeated doubling, and ×12 is ×10 plus ×2. Every time you rebuild a fact, it sticks a little more.',
      when: 'Both numbers are 12 or below once you ignore trailing zeros (7 × 60 is 7 × 6 with a zero on the end).',
    },
    steps({ x, y }) {
      const { small, big, zeros } = mulCore(x, y);
      return withZeros(factSteps(small, big), zeros, x * y);
    },
  },
  'mul-split': {
    op: 'mul',
    name: 'One-digit × multi-digit',
    weight: 1.8,
    sample: [7, 64],
    lesson: {
      title: 'Split the big number by place value',
      idea: 'Multiply the biggest place first, then the next, then add. Going left to right means you hold one running total while you work out small products, and the answer builds in the order you type it.',
      when: 'A single digit times a bigger number, like 7 × 64. Most of a default Zetamac round is this kind of question.',
    },
    steps({ x, y }) {
      const { small, big, zeros } = mulCore(x, y);
      const parts = placeParts(big);
      const products = parts.map((p) => p * small);
      const steps = parts.length === 1
        ? [`${small} × ${big} = ${small * big}`]
        : [...parts.map((p, i) => `${small} × ${p} = ${products[i]}`), `${products.join(' + ')} = ${small * big}`];
      return withZeros(steps, zeros, x * y);
    },
  },
  'mul-1112': {
    op: 'mul',
    name: '× 11 and × 12',
    weight: 1.7,
    sample: [12, 47],
    lesson: {
      title: 'Times ten, plus a bit',
      idea: '11 × n is 10 × n plus one more n. 12 × n is 10 × n plus double n. Putting a zero on the end is free, so the only real work is one addition.',
      when: 'An 11 or 12 times a bigger number, like 11 × 47 or 12 × 38.',
    },
    steps({ x, y }) {
      const { small, big, zeros } = mulCore(x, y);
      const steps = small === 11
        ? [`${big} × 10 = ${10 * big}`, `${10 * big} + ${big} = ${11 * big}`]
        : [`${big} × 10 = ${10 * big}`, `${big} × 2 = ${2 * big}`, `${10 * big} + ${2 * big} = ${12 * big}`];
      return withZeros(steps, zeros, x * y);
    },
  },
  'mul-2x2': {
    op: 'mul',
    name: 'Two-digit × two-digit',
    weight: 3.2,
    sample: [23, 47],
    lesson: {
      title: 'Split the smaller number, multiply twice',
      idea: 'Break the smaller number into tens and ones, multiply the other number by each, and add. 23 × 47 is 20 × 47 plus 3 × 47. If both numbers sit close to a round number, (a − d)(a + d) = a² − d² is faster still.',
      when: 'Both numbers are 13 or more, like 23 × 47. This only appears when you widen the multiplication ranges.',
    },
    steps({ x, y }) {
      const { small, big, zeros } = mulCore(x, y);
      return withZeros(splitSteps(small, big), zeros, x * y);
    },
  },
  'div-facts': {
    op: 'div',
    name: 'Division facts',
    weight: 1.0,
    sample: [56, 7],
    lesson: {
      title: 'Ask the multiplication question',
      idea: 'Don\'t divide. Ask "what times the divisor gives this?" and answer with a times-table fact you already know. If the number ends in zeros, drop them, find the fact, and put them back.',
      when: 'The answer is 12 or less once you ignore trailing zeros, like 56 ÷ 7 or 420 ÷ 7.',
    },
    steps({ x, y }) {
      const core = divCore(x, y);
      const [q, qz] = stripZeros(core.q);
      const inner = core.x / 10 ** qz;
      const steps = [...core.steps];
      if (qz) steps.push(`drop ${qz === 1 ? 'a zero' : `${qz} zeros`}: ${inner} ÷ ${core.d}`);
      steps.push(`${core.d} × ? = ${inner}`, `${core.d} × ${q} = ${inner}, so ${q}`);
      return qz ? [...steps, zerosLine(qz, core.q)] : steps;
    },
  },
  'div-split': {
    op: 'div',
    name: 'One-digit divisor, bigger answer',
    weight: 1.75,
    sample: [448, 7],
    lesson: {
      title: 'Take out the biggest chunk first',
      idea: 'Find the largest round multiple that fits: 7 × 60 = 420 fits inside 448. Take it away, and divide what is left with a single fact (28 ÷ 7 = 4). The answer is the chunks added up: 64.',
      when: 'Dividing by a single digit when the answer is above 12, like 448 ÷ 7.',
    },
    steps: chunkedDivision,
  },
  'div-1112': {
    op: 'div',
    name: '÷ 11 and ÷ 12',
    weight: 1.85,
    sample: [564, 12],
    lesson: {
      title: 'Chunk by tens of 11 or 12',
      idea: 'Same method as other chunked divisions, but the chunks are 110, 220, 330… for 11 and 120, 240, 360… for 12. Find the biggest chunk that fits, then divide the remainder with a single fact.',
      when: 'Dividing by 11 or 12 when the answer is above 12, like 564 ÷ 12.',
    },
    steps: chunkedDivision,
  },
  'div-2x2': {
    op: 'div',
    name: 'Two-digit divisor',
    weight: 3.4,
    sample: [1081, 23],
    lesson: {
      title: 'Estimate the tens, then fix the ones',
      idea: 'Round the divisor to estimate the tens of the answer: 1081 ÷ 23 is a bit under 1081 ÷ 20 ≈ 54, so try 40. 23 × 40 = 920 leaves 161, and 23 × 7 = 161. The answer is 47.',
      when: 'The divisor is 13 or more, like 1081 ÷ 23. This only appears when you widen the multiplication ranges.',
    },
    steps: chunkedDivision,
  },
};

const PLACE_NAMES = ['units', 'tenths', 'hundredths', 'thousandths', 'ten-thousandths'];
const placesWord = (n) => (n === 1 ? 'one decimal place' : `${n} decimal places`);

// Moves the decimal point k places right: shift("4.48", 1) = "44.8".
function shift(x, k) {
  const [units, places] = parseDecimal(x);
  return places >= k ? formatDecimal(units, places - k) : String(units * 10 ** (k - places));
}

Object.assign(SKILLS, {
  'dec-addsub': {
    op: 'fadd',
    name: 'Decimal addition and subtraction',
    weight: 1.7,
    sample: ['4.7', '0.38'],
    lesson: {
      title: 'Line up the points, then work in whole numbers',
      idea: 'Give both numbers the same number of decimal places and treat them as whole tenths or hundredths: 4.7 + 0.38 is 470 + 38 = 508 hundredths, so 5.08. Then put the point back. Adding digits from different places is the only real mistake, and this makes it impossible.',
      when: 'An addition or subtraction where at least one number has a decimal point, like 4.7 + 0.38 or 7.25 − 0.6.',
    },
    steps({ op, x, y }) {
      const [a, b, p] = alignDecimals(x, y);
      const r = op === 'fadd' ? a + b : a - b;
      return [`in ${PLACE_NAMES[p]}: ${a} ${op === 'fadd' ? '+' : '−'} ${b} = ${r}`, `put the point back: ${formatDecimal(r, p)}`];
    },
  },
  'dec-mul': {
    op: 'fmul',
    name: 'Decimal multiplication',
    weight: 2.2,
    sample: ['0.7', '64'],
    lesson: {
      title: 'Multiply whole numbers, then place the point',
      idea: 'Ignore the decimal points and multiply the whole numbers with your usual method. Count the decimal places in the question and give the answer that many: 0.7 × 64 → 7 × 64 = 448 → one place → 44.8. A quick size check catches slips: 0.7 of 64 must be a bit less than 64.',
      when: 'A multiplication where either number has a decimal point, like 0.7 × 64 or 1.2 × 3.5.',
    },
    steps({ x, y }) {
      const [a, pa] = parseDecimal(x), [b, pb] = parseDecimal(y);
      return [`ignore the points: ${a} × ${b} = ${a * b}`, `${placesWord(pa + pb)} in the question: ${formatDecimal(a * b, pa + pb)}`];
    },
  },
  'dec-div': {
    op: 'fdiv',
    name: 'Decimal division',
    weight: 2.6,
    sample: ['44.8', '0.7'],
    lesson: {
      title: 'Make the divisor whole first',
      idea: 'Moving the decimal point the same number of places in both numbers doesn\'t change the answer, so move it until the divisor is whole: 44.8 ÷ 0.7 becomes 448 ÷ 7 = 64. If the number you\'re dividing still has a point, work in tenths or hundredths and put the point back at the end.',
      when: 'A division where either number has a decimal point, like 44.8 ÷ 0.7 or 4.48 ÷ 7.',
    },
    steps({ x, y, answer }) {
      const [, py] = parseDecimal(y);
      const dividend = shift(x, py);
      const divisor = Number(shift(y, py));
      const [, pq] = parseDecimal(answer);
      const steps = py ? [`move both points ${py === 1 ? 'one place' : `${py} places`} right: ${dividend} ÷ ${divisor}`] : [];
      if (!pq) return [...steps, `${dividend} ÷ ${divisor} = ${answer}`];
      const whole = Number(shift(dividend, pq));
      return [...steps, `in ${PLACE_NAMES[pq]}: ${whole} ÷ ${divisor} = ${whole / divisor}`, `put the point back: ${answer}`];
    },
  },
});

// Questions that need no technique (× 1, × 10, ÷ 10, − 100). They count toward your pace but are never a focus.
export const TRIVIAL = { op: null, name: 'Powers of ten', weight: 0.8 };

export const SKILL_ORDER = Object.keys(SKILLS);

export const skillWeight = (id) => (SKILLS[id] || TRIVIAL).weight;
export const skillName = (id) => (SKILLS[id] || TRIVIAL).name;
