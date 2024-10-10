const GIVEN1 = [
  { type: "swapIn", r: 2, delta_b: 0.1, a: 1.02 },
  { type: "swapOut", r: 0.2, theta: 0.1, a: 1.02 },
];

const GIVEN2 = [
  { type: "swapIn", r: 2, delta_b: 0.1, a: 1.01 },
  { type: "swapOut", r: 0.2, theta: 1, a: 1.1 },
];

const GIVEN3 = [
  { type: "swapOut", r: 1, theta: 0.5, a: 1.0001 },
  { type: "swapOut", r: 1, theta: 1, a: 1.0005 },
];

// Pendulum Prototype
const GIVEN4 = [
  { type: "swapIn", r: 2, delta_b: 0.1, a: 1.005 },
  { type: "swapOut", r: 0.2, theta: 0.1, a: 1.02 },
];

// Pendulum Production Stable
const GIVEN5 = [
  { type: "swapIn", r: 1, theta: 1, a: 1.005 },
  { type: "swapOut", r: 1, theta: 0.8, a: 1.005 },
];

// Pendulum Production DOT
const GIVEN6 = [
  { type: "swapIn", r: 1, theta: 1, a: 1.02 },
  { type: "swapOut", r: 1, theta: 0.8, a: 1.02 },
];

const GIVEN6A = [
  { type: "swapIn", r: 1, theta: 1, a: 1.018 },
  { type: "swapOut", r: 1, theta: 0.8, a: 1.02 },
];

const GIVEN = GIVEN6A;

function findPositiveZero(f, d) {
  const sign = (x) => (f(x) > 0 ? 1 : -1);

  let min = 0;
  let max = 1;
  while (sign(max) === sign(min)) {
    max *= 2;
    if (max > Number.MAX_SAFE_INTEGER) return undefined;
  }

  while (max - min > d) {
    const mid = (max + min) / 2;
    if (sign(mid) === sign(min)) {
      min = mid;
    } else {
      max = mid;
    }
  }

  return min;
}

function swapInTerm(a_in, r_i, theta_i, c) {
  const term1 = theta_i * r_i * (a_in - 1);
  const term2 = r_i + theta_i * r_i - 1;
  const term3 = r_i + theta_i * r_i + c;
  const term4 = ((r_i - 1) * (r_i - 1)) / (r_i + c);

  return ((term2 * term2) / term3 - term4) / term1;
}

function swapOutTerm(a_out, r_o, theta_o, c) {
  const term1 = theta_o * r_o * (1 / a_out - 1);
  const term2 = ((r_o - 1) * (r_o - 1)) / (r_o + c);
  const term3 = r_o - theta_o * r_o - 1;
  const term4 = r_o - theta_o * r_o + c;

  return (term2 - (term3 * term3) / term4) / term1;
}

function determineParameters() {
  const targetTerms = GIVEN.map((target) => {
    switch (target.type) {
      case "swapIn": {
        const theta = target.theta ?? target.delta_b / target.a;
        return (c) => swapInTerm(target.a, target.r, theta, c);
      }
      case "swapOut":
        return (c) => swapOutTerm(target.a, target.r, target.theta, c);
    }
  });

  const targetFunction2 = (c) => targetTerms[0](c) - targetTerms[1](c);

  const c = findPositiveZero(targetFunction2, 1e-10);
  const beta = 1 / targetTerms[0](c);

  const alpha = c - (Math.sqrt(beta * beta + beta) + beta);

  if (beta + c * beta >= 1) console.log(`The resulting paramters are not valid: beta + c  * beta = ${beta + c * beta}`);
  else console.log(`beta + c * beta = ${beta + c * beta}`);

  return { c, beta, alpha };
}

function determineBeta(c) {
  const term1 = theta_i * r_i * (a_i - 1);
  const term2 = r_i + theta_i * r_i - 1;
  const term3 = r_i + theta_i * r_i + c;
  const term4 = ((r_i - 1) * (r_i - 1)) / (r_i + c);

  return term1 / ((term2 * term2) / term3 - term4);
}

const result = determineParameters();
console.log(result);
const { alpha, beta } = result;
determineSlippageMatrix(4.28516, 0.12199);

function determineSlippageMatrix(alpha, beta) {
  const c = Math.sqrt(beta * beta + beta) + beta + alpha;
  const CR = [0.00001, 0.2, 0.5, 0.75, 1, 1.5, 2];

  const swapInSlippage = (r_i, theta_i) => {
    if (r_i === 0) return 1 - beta * (1 + 2 * c) / (c * c);

    console.log("in", beta, c, r_i, theta_i);

    const term1 = beta / (theta_i * r_i);
    const term2 = r_i + theta_i * r_i - 1;
    const term3 = r_i + theta_i * r_i + c;
    const term4 = ((r_i - 1) * (r_i - 1)) / (r_i + c);

    return 1 + term1 * ((term2 * term2) / term3 - term4);
  };

  const swapOutSlippage = (r_o, theta_o) => {
    const term1 = beta / (theta_o * r_o);
    const term2 = ((r_o - 1) * (r_o - 1)) / (r_o + c);
    const term3 = r_o - theta_o * r_o - 1;
    const term4 = r_o - theta_o * r_o + c;

    return 1 / (1 + term1 * (term2 - (term3 * term3) / term4));
  };

  for (const startCR of CR) {
    for (const endCR of CR) {
      let slippage;
      if (startCR === endCR) {
        slippage = 1;
      } else if (startCR < endCR) {
        slippage = swapInSlippage(startCR, (endCR - startCR) / startCR);
      } else {
        slippage = swapOutSlippage(startCR, (startCR - endCR) / startCR);
      }

      console.log(
        `startCR: ${String(startCR).padStart(5, " ")}, endCR: ${String(endCR).padStart(5, " ")}: ${String(
          Math.round((slippage - 1) * 10000) / 100
        ).padStart(6, " ")}%`
      );
    }
  }
}
