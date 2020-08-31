/*
The MIT License (MIT)

Copyright (c) Kiyo Chinzei (kchinzei@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
  Solve many LED problem

  Make Asayake to Wake Project.
  Kiyo Chinzei
  https://github.com/kchinzei/kch-rgbw-lib
*/

// eslint-disable-next-line camelcase
import { svd_matlab } from './svd-helper';
import { GamutError } from './GamutError';
import Fraction from 'fraction.js';
import { solveAsync, findSolution, simplexIsOK } from 'linear-program-solver';
import { SimplexSolution } from 'linear-program-solver';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const { transpose, column, diag, multiply, flatten } = require('mathjs');

const qSmall = 1e-6;
const nonnegative = (val: number) => (val > -qSmall);
function round(val: number): number {
  if (1 < val && val < 1+qSmall)
    return 1;
  else if (val < qSmall)
    return 0;
  else
    return val;
}

export function normalize(alpha: number[]): number[] {
  let aMax = 0;
  alpha = alpha.map(round);
  for (const a of alpha)
    if (a > aMax)
      aMax = a;
  if (aMax > 1)
    alpha = alpha.map((val) => val/aMax);
  return alpha;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function makeSolverMatrix(XYZList: number[][]): {rank: number; a: number[][]; ainv: number[][]; nvecs: number[][]} {
  // make [A]
  const n: number = XYZList.length;

  const a: number[][] = new Array(3) as number[][];
  for (let i=0; i<3; i++) {
    a[i] = new Array(n).fill(0) as number[];
  }
  for (let j=0; j<n; j++) {
    a[0][j] = XYZList[j][0];
    a[1][j] = XYZList[j][1];
    a[2][j] = XYZList[j][2];
  }

  const {u, v, q} = svd_matlab(a);

  // Obtain null vectors of v.
  const nvecs: number[][] = new Array(n - 3) as number[][];
  for (let i=3; i<n; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    nvecs[i-3] = flatten(column(v, i));
  }

  // Shrink v
  for (const vi of v)
    vi.length = 3;

  // Ainv = v * 1/q * ut
  let rank = 0;
  for (let i=0; i<q.length; i++) {
    if (q[i] > qSmall) {
      q[i] = 1 / q[i];
      rank++;
    } else
      q[i] = 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const ainv: number [][] = multiply(multiply(v, diag(q)), transpose(u));

  return {rank, a, ainv, nvecs};
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function alpha2XYZ(aList: number[], a: number[][]): number[] {
  // Assume a is from XYZList by makeSolverMatrix(). No size check. No value ragne check.

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const XYZ: number[] = flatten(multiply(a, aList));
  return XYZ;
}

/*
  Result of XYZ2Alpha() can be alpha: number[] when success, an exception when error.
  When sucess, alpha[] is non-negative. Small value is truncated to 0. It's NOT NORMALIZED.
  When error, variable e of catch(e) is either alpha[] or Error.
  When e is alpha[], solution available but physically not meaningful, likely out of gamut.
  When e is Error, something fatal happened that cannot be recovered.
  You can chect e is alpha[] by isAlpha()
*/
// eslint-disable-next-line @typescript-eslint/naming-convention
export async function XYZ2Alpha(XYZ: number[], wList: number[], ainv: number[][], nvecs: number[][]): Promise<number[]> {
  // Assume ainv, nvecs are from XYZList by makeSolverMatrix(). No size check.

  if (XYZ[1] < qSmall) {
    // Don't attempt to solve.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const alpha: number[] = Array(wList.length).fill(0);
    return alpha;
  }

  switch (wList.length) {
    case 3:
      return await XYZ2Alpha3(XYZ, ainv);
      /* istanbul ignore next */
      break;
    case 4:
      return await XYZ2Alpha4(XYZ, wList, ainv, nvecs[0]);
      /* istanbul ignore next */
      break;
    default:
      return await XYZ2AlphaX(XYZ, wList, ainv, nvecs);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
async function XYZ2Alpha3(XYZ: number[], ainv: number[][]): Promise<number[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const alpha: number[] = flatten(multiply(ainv, XYZ));

  // Check if range of aList is physically meaningful.
  const feasible = alpha.every(nonnegative);

  return new Promise<number[]>((resolv, reject) => {
    if (feasible) {
      resolv(alpha.map(round));
    } else {
      reject(new GamutError(alpha, 'XYZ2Alpha3()'));
    }
  });
}

/*
  Solution of lList.length = 4, See Eqs. 4.0.1 to 4.2.7 in "Solve RGB+ LEDs PWM from Chromaticity"
  Number in comments are Eqs. in it.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
async function XYZ2Alpha4(XYZ: number[], wList: number[], ainv: number[][], n: number[]): Promise<number[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const alpha: number[] = flatten(multiply(ainv, XYZ)); // first term of 4.0.1

  // Find possible range of beta
  let betaMin: number = Number.NEGATIVE_INFINITY;
  let betaMax: number = Number.POSITIVE_INFINITY;
  let beta0Min: number = Number.NEGATIVE_INFINITY;
  let beta0Max: number = Number.POSITIVE_INFINITY;
  let nW = 0;
  for (let i=0; i<4; i++) {
    const ni  = n[i];

    /* istanbul ignore else; if |ni| ~ 0, we simply ignore this situation */
    if (Math.abs(ni) >= Number.MIN_VALUE) {
      // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
      const b_n = - alpha[i] / ni;
      if (ni > 0) {
        if (betaMin < b_n) betaMin = b_n; // 4.0.2
        if (beta0Min < b_n) beta0Min = b_n; // 4.1.7
        if (betaMax > 1/ni + b_n) betaMax = 1/ni + b_n; // 4.0.3
      } else {
        if (betaMin < 1/ni + b_n) betaMin = 1/ni + b_n; // 4.0.2
        if (betaMax > b_n) betaMax = b_n; // 4.0.3
        if (beta0Max > b_n) beta0Max = b_n; // 4.1.8
      }
    }
    nW += ni * wList[i]; // 4.0.6
  }

  // choose beta
  let beta = Number.NEGATIVE_INFINITY;
  if (betaMin < betaMax) {
    if (nW > 0)
      beta = betaMin; // 4.0.6 upper
    else
      beta = betaMax; // 4.0.6 lower
  } else {
    // Section 4.1
    if (nW > 0)
      beta = beta0Min; // 4.0.6 upper
    else
      beta = beta0Max; // 4.0.6 lower
  }
  /* istanbul ignore if: this should never happen. insurance */
  if (beta === Number.NEGATIVE_INFINITY) {
    // No feasible beta found. Okey, any beta, anyway...
    beta = betaMin;
  }

  // Solve
  for (let i=0; i<4; i++)
    alpha[i] += beta*n[i]; // 4.0.1

  // Check if range of aList is physically meaningful.
  const feasible = alpha.every(nonnegative);

  return new Promise<number[]>((resolv, reject) => {
    if (feasible) {
      resolv(alpha.map(round));
    } else {
      reject(new GamutError(alpha, 'XYZ2Alpha4()'));
    }
  });
}

/*
  Solution of lList.length > 4, See Eqs. 5.0.1 to 5.0.3 in "Solve RGB+ LEDs PWM from Chromaticity"
  Number in comments are Eqs. in it.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
async function XYZ2AlphaX(XYZ: number[], wList: number[], ainv: number[][], nvecs: number[][]): Promise<number[]> {
  /* istanbul ignore if: it's false only when simplex is not available. */
  if (simplexIsOK() === false) {
    return new Promise<number[]>((resolv, reject) => {
      reject(new Error('XYZ2AlphaX(): simplexIsNotOK. solution infeasible.'));
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const b: number[] = flatten(multiply(ainv, XYZ)); // b_i in 5.0.1, 5.0.2, 5.0.3

  try {
    let maxAlpha = 1;
    let minAlpha = 0;
    let alpha: number[] = await solveX(b, wList, ainv, nvecs, maxAlpha, minAlpha);

    if ((alpha.length > 0) && alpha.every(nonnegative)) {
      return alpha.map(round);
    } else {
      // When result of solveX() is not good, we try relax constraints.
      // Case 1: Y of XYZ[] is too large. Remove maxAlpha constraint
      maxAlpha = Number.POSITIVE_INFINITY;
      alpha = await solveX(b, wList, ainv, nvecs, maxAlpha, minAlpha);
      if (alpha.length > 0) {
        return alpha.map(round);
      }
      // Case 2: Solution near 0 may fail infeasible due to numerical error.
      minAlpha = -qSmall/2;
      alpha = await solveX(b, wList, ainv, nvecs, maxAlpha, minAlpha);
      if (alpha.length > 0) {
        return alpha.map(round);
      }
      // Case 3: Solution negative due to XYZ[] out of gamut.
      minAlpha = -1024;
      alpha = await solveX(b, wList, ainv, nvecs, maxAlpha, minAlpha);
      throw new GamutError(alpha, 'XYZ2AlphaX()');
    }
  } catch(err) {
    throw err;
  }
}

async function solveX(b: number[], w: number[], ainv: number[][], nvecs: number[][], maxAlpha: number, minAlpha: number): Promise<number[]> {
  /*
    Solve linear programming using linear-program-parser and simplex by jeronimonunes.

    This parser takes everything in string.
    See https://github.com/jeronimonunes/linear-program-parser

    This requires numbers are rational, i.e., fraction.
    0.05 => 1/20, etc. Here we use fraction.js
  */
  const problem: string = generateProblem(w, nvecs, b, maxAlpha, minAlpha);
  try {
    const result: SimplexSolution = await solveAsync(problem);

    if (result.result === 'otima') {
      const alpha = b.slice(); // copy
      for (let j=0; j < nvecs.length; j++) {
        const beta = findSolution(vx('b', j), result.solution, result.vars);
        for (let i=0; i < alpha.length; i++) {
          alpha[i] += beta*nvecs[j][i];
        }
      }
      return alpha;
    } else {
      // console.log(`not feasible (min=${minAlpha}, max=${maxAlpha})`);
      return [];
    }
  } catch(err) {
    /* istanbul ignore next */
    throw err;
  }
}

const vx = (s1: string, n: number, s2 = '') => `${s1}${n}${s2}`;

function generateProblem(w: number[], nvecs: number[][], b: number[], maxAlpha: number, minAlpha: number): string {
  // Helper functions
  const signedFrac = (n: number) => ((n >= 0)? '+':'') + new Fraction(n).toFraction();

  // Compiling parse string.
  // Compiling the object function 5.0.1
  let objectiveF = 'min(';
  for (let j=0; j<nvecs.length; j++) { // 0 ... N-3
    let sumNW = 0;
    for (let i=0; i<nvecs[0].length; i++) { // 0 ... N
      sumNW += nvecs[j][i] * w[i];
    }

    const nwPos = signedFrac( sumNW);
    const nwNeg = signedFrac(-sumNW);
    objectiveF += ` ${nwPos} * ${vx('b', j, 'p')} ${nwNeg} * ${vx('b', j, 'n')}`; // 5.0.1
    // objectiveF += ` ${nwPos} * ${vx('b', j)}`;
  }
  objectiveF += ')\nst:\n';

  // Compiling the constraints 5.0.2 and 5.0.3
  for (let i=0; i<nvecs[0].length; i++) { // 0 ... N
    let constraintMin = '';
    for (let j=0; j<nvecs.length; j++) { // 0 ... N-3
      const nPos = signedFrac( nvecs[j][i]);
      const nNeg = signedFrac(-nvecs[j][i]);
      constraintMin += ` ${nPos} * ${vx('b', j, 'p')}  ${nNeg} * ${vx('b', j, 'n')}`;
      // constraintMin += ` ${nPos} * ${vx('b', j)}`;
    }
    let constraintMax = constraintMin.slice(); // copy

    const bStr = signedFrac(b[i]);
    /* istanbul ignore else */
    if (minAlpha !== Number.NEGATIVE_INFINITY) {
      const qStr = signedFrac(minAlpha);
      constraintMin += ` ${bStr} >= ${qStr};\n`; // 5.0.2
      objectiveF += constraintMin;
    }
    if (maxAlpha !== Number.POSITIVE_INFINITY) {
      const qStr = signedFrac(maxAlpha);
      constraintMax += ` ${bStr} <= ${qStr};\n`; // 5.0.3
      objectiveF += constraintMax;
    }
  }
  for (let j=0; j<nvecs.length; j++) { // 0 ... N-3
    objectiveF += `${vx('b', j, 'p')} >= 0;\n`;
    objectiveF += `${vx('b', j, 'n')} >= 0;\n`;
  }

  // For debug purpose, you can try output of the following at
  // https://jeronimonunes.github.io/simplex-web/
  // console.log(objectiveF);
  return objectiveF;
}

/* istanbul ignore next */
// @ts-ignore: TS6133 This one left for debugging use
/*
function generateTabloid(fpi: Fpi) {
*/
/*
    Generate string to be solved by Simplex by jeronimonunes
    https://github.com/jeronimonunes/simplex

    The final output is like this.
    0 0 0 0 | 3 4 -5  5 0  0 0  0 |  0
    --------+---------------------+---
    1 0 0 0 | 1 1  0  0 1  0 0  0 |  5
    0 1 0 0 | 1 0  5 -5 0 -1 0  0 | 10
    0 0 1 0 | 2 1  1 -1 0  0 1  0 | 10
    0 0 0 1 | 2 1  1 -1 0  0 0 -1 | 10

    { a,b,c } of fpi.toMatrix() is layouted as

    0 ... 0 | c0  c1   ...   cN-1 |  0
    --------+---------------------+---
    1       | a00 a01  ...  a0N-1 |  b0
      1     | a10      ...  a1N-1 |  b1
       ...  | ...             ... | ...
          1 | aM-10 ...  aM-1aN-1 |  bM-1
*/
/*
  const { a, b, c, vars } = fpi.toMatrix();

  let tabloid = '';
  // First line: 0..0 | c0 .. cN-1 | 0
  for (let i=0; i < b.length; i++)
    tabloid += '0 ';
  tabloid += '| ';
  for (let i=0; i < c.length; i++)
    tabloid += c[i].toString() + ' ';
  tabloid += '| 0\n';

  // Second line: (any)
  tabloid += '---\n';

  // rest of lines
  for (let i=0; i < b.length; i++) {
    for (let j=0; j < b.length; j++)
      tabloid += (i === j? '1 ':'0 ');
    tabloid += '| ';
    for (let j=0; j < a[i].length; j++)
      tabloid += a[i][j].toString() + ' ';
    tabloid += '| ';
    tabloid += b[i].toString() + '\n';
  }

  return { tabloid, vars };
}
*/
