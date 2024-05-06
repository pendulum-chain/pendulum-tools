const GIVEN = {
  swapIn: { r: 2, delta_b: 0.1, a: 1.02 },
  swapOut: { r: 0.2, theta: 0.1, a: 1.02 },
};

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

function determineParameters() {
  const theta_i = GIVEN.swapIn.theta ?? GIVEN.swapIn.delta_b / GIVEN.swapIn.a;
  const {
    swapIn: { r: r_i, a: a_i },
    swapOut: { r: r_o, theta: theta_o, a: a_o },
  } = GIVEN;

  const targetFunction = (c) => {
    const term1 = (theta_o * r_o * (1 / a_o - 1)) / (theta_i * r_i * (a_i - 1));
    const term2 = r_i + theta_i * r_i - 1;
    const term3 = r_i + theta_i * r_i + c;
    const term4 = ((r_i - 1) * (r_i - 1)) / (r_i + c);
    const term5 = ((r_o - 1) * (r_o - 1)) / (r_o + c);
    const term6 = r_o - theta_o * r_o - 1;
    const term7 = r_o - theta_o * r_o + c;

    return term1 * ((term2 * term2) / term3 - term4) - (term5 - (term6 * term6) / term7);
  };

  const c = findPositiveZero(targetFunction, 1e-10);

  const term1 = theta_i * r_i * (a_i - 1);
  const term2 = r_i + theta_i * r_i - 1;
  const term3 = r_i + theta_i * r_i + c;
  const term4 = ((r_i - 1) * (r_i - 1)) / (r_i + c);

  const beta = term1 / ((term2 * term2) / term3 - term4);

  const alpha = c - (Math.sqrt(beta * beta + beta) + beta);

  return { c, beta, alpha };
}

function determineBeta(c) {
  const term1 = theta_i * r_i * (a_i - 1);
  const term2 = r_i + theta_i * r_i - 1;
  const term3 = r_i + theta_i * r_i + c;
  const term4 = ((r_i - 1) * (r_i - 1)) / (r_i + c);

  return term1 / ((term2 * term2) / term3 - term4);
}

console.log(determineParameters());
