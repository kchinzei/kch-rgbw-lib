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
  Test solver

  Make Asayake to Wake Project.
  Kiyo Chinzei
  https://github.com/kchinzei/kch-rgbw-lib
*/

// @ts-ignore: TS6198 These will remain for future testing
const { row, column, multiply, flatten } = require('mathjs');
import * as Solver from '../src/solver';

let i=0;

const xyYs = [
  //  x       y     Y   watt ID
  [ 0.6857, 0.3143, 30.6, 1, 0 ], // red
  [ 0.2002, 0.6976, 67.2, 1, 1 ], // green
  [ 0.1417, 0.0618,  8.2, 1, 2 ], // blue
  [ 0.3816, 0.3678, 80.0, 1, 3 ], // white
  [ 0.38,   0.58,   50.0, 1, 4 ], // amber
  [ 0.15,   0.40,   70.0, 1, 5 ], // turquiose
  [ 0.25,   0.05,    5.0, 1, 6 ] //  violet
];

const XYZs = initLEDinXYZ();

function makeWList(lList: number[][]): number[] {
  const wList: number[] = new Array(lList.length) as number[];
  for (let j=0; j<lList.length; j++) {
    wList[j] = lList[j][3];
  }
  return wList;
}

function initLEDinXYZ(): number[][] {
  const ret: number[][] = new Array(xyYs.length) as number[][];
  for (let j=0; j<xyYs.length; j++) {
    const XYZ = xyY2XYZ(xyYs[j]);
    ret[j] =  xyYs[j].slice();
    ret[j][0] = XYZ[0];
    ret[j][1] = XYZ[1];
    ret[j][2] = XYZ[2];
  }
  return ret;
}

function xyY2XYZ(a: number[]): number[] {
  const x = a[0];
  const y = a[1];
  const Y = a[2];

  return [ Y/y*x, Y, Y/y*(1 - x - y) ];
}

function XYZ2xyY(a: number[]): number[] {
  const X = a[0];
  const Y = a[1];
  const Z = a[2];

  const xyz = X + Y + Z;

  return [ X/xyz, Y/xyz, Y ];
}

const sRGB = [
  [0.20, 0.10], [0.20, 0.15], [0.20, 0.20],
  [0.25, 0.15], [0.25, 0.20], [0.25, 0.25], [0.25, 0.30], [0.25, 0.35], [0.25, 0.40],
  [0.30, 0.15], [0.30, 0.20], [0.30, 0.25], [0.30, 0.30], [0.30, 0.35], [0.30, 0.40],
  [0.30, 0.45], [0.30, 0.50], [0.30, 0.55], [0.30, 0.60],
  [0.35, 0.20], [0.35, 0.25], [0.35, 0.30], [0.35, 0.35], [0.35, 0.40], [0.35, 0.45],
  [0.35, 0.50], [0.35, 0.55],
  [0.40, 0.20], [0.40, 0.25], [0.40, 0.30], [0.40, 0.35], [0.40, 0.40], [0.40, 0.45], [0.40, 0.50],
  [0.45, 0.25], [0.45, 0.30], [0.45, 0.35], [0.45, 0.40], [0.45, 0.45],
  [0.50, 0.30], [0.50, 0.35], [0.50, 0.40],
  [0.55, 0.30], [0.55, 0.35], [0.55, 0.40],
  [0.60, 0.35]
];

const outOfGamut = [
  [0.10, 0.20], [0.15, 0.60],
  [0.25, 0.70], [0.45, 0.55],
  [0.65, 0.25], [0.20, 0.05]
];

describe.each([
  [3, 0, 1, 2, 0, 0, 0, 10, 4],
  [4, 0, 1, 2, 3, 0, 0, 10, 4],
  [4, 0, 1, 2, 0, 0, 0, 10, 4], // Insufficient LED.
  [5, 0, 1, 2, 3, 4, 0, 10, 4],
  [5, 0, 1, 2, 3, 0, 0, 10, 4], // Insufficient LED.
  [5, 0, 1, 2, 1, 0, 0, 10, 4], // Insufficient LED.
  [6, 0, 1, 2, 3, 4, 5, 10, 4],
  [6, 0, 1, 2, 3, 2, 0, 10, 4], // Insufficient LED.
  [6, 0, 1, 2, 2, 1, 0, 10, 4]  // Insufficient LED.
])('', (N, a0, a1, a2, a3, a4, a5, Y, precision) => {

  test(`${i++}. LED=${N} LEDs(${a0},${a1},${a2},${a3},${a4},${a5}) in gamut, not saturated)`, () => {

    // Prepare solver
    const lList: number[][] = new Array(N) as number[][];
    for (let i=0; i<N; i++) {
      const val = eval(`a${i}`);
      lList[i] = XYZs[val];
    }
    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);
    expect(rank).toBe(3);
    if (rank === 3) {
      const wList: number[] = makeWList(lList);

      // Do it.
      for (let i=0; i<sRGB.length; i++) {
        const x = sRGB[i][0];
        const y = sRGB[i][1];
        let xyY = [x, y, Y];
        const { alpha, feasible } = Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);

        // Examine
        if (feasible) {
          const alpha2 = Solver.normalize(alpha);
          const XYZ: number[] = Solver.alpha2XYZ(alpha2, a);
          xyY = XYZ2xyY(XYZ);

          expect(xyY[0]).toBeCloseTo(x, precision);
          expect(xyY[1]).toBeCloseTo(y, precision);
          expect(xyY[2]).toBeCloseTo(Y, precision);
        } else {
          console.log(`Solution INFEASIBLE for (${x}, ${y}, ${Y})`);
          expect(feasible).toBe(true); // will raise fail.
        }
      }
    }
  });
});


//------------------- Saturated case; Y does not match -------------------

describe.each([
  [3, 0, 1, 2, 0, 0, 0, 100, 4],
  [4, 0, 1, 2, 3, 0, 0, 200, 4],
  [4, 0, 1, 2, 0, 0, 0, 200, 4], // Insufficient LED.
  [5, 0, 1, 2, 3, 4, 0, 300, 4],
  [6, 0, 1, 2, 3, 4, 5, 400, 4]
])('', (N, a0, a1, a2, a3, a4, a5, Y, precision) => {
  test(`i=${i++}, N=${N}. LEDs(${a0},${a1},${a2},${a3},${a4},${a5}) in gamut, saturated Y (${Y})`, () => {

    // Prepare solver
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = eval(`a${j}`);
      lList[j] = XYZs[val];
    }

    // Use maxBrightness + 5%...
    Y = 0;
    for (let j=0; j<N; j++) {
      Y += lList[j][1];
    }
    Y *= 1.05;

    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);
    expect(rank).toBe(3);
    if (rank === 3) {
      const wList: number[] = makeWList(lList);

      // Do it.
      for (let j=0; j<sRGB.length; j++) {
        const x = sRGB[j][0];
        const y = sRGB[j][1];
        let xyY = [x, y, Y];

        const { alpha, feasible } = Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);

        // Examine: here we expect both feasible and infeasible
        if (feasible) {
          let XYZ: number[] = Solver.alpha2XYZ(alpha, a);
          xyY = XYZ2xyY(XYZ);
          expect(xyY[0]).toBeCloseTo(x, precision);
          expect(xyY[1]).toBeCloseTo(y, precision);
          expect(xyY[2]).toBeCloseTo(Y, precision); // This Y is overated.

          // Normalize.
          const alpha2 = Solver.normalize(alpha);
          XYZ = Solver.alpha2XYZ(alpha2, a);
          xyY = XYZ2xyY(XYZ);
          expect(xyY[0]).toBeCloseTo(x, precision);
          expect(xyY[1]).toBeCloseTo(y, precision);
          expect(xyY[2]).toBeLessThan(Y); // This Y is the maximum Y at each (x,y) by the given LED combination.
        } else {
          // Just curious what result is.
          console.log(`Obtain infeasible at (${x}, ${y}, ${Y})`);
          console.log(alpha);
        }
      }
    }
  });
});


//------------------- Singular cases; insufficient LEDs. -------------------


describe.each([
  [3, 0, 1, 0, 0, 0, 0.3, 0.3, 10, 4],
  [4, 0, 1, 0, 1, 0, 0.3, 0.3, 10, 4],
  [5, 0, 2, 0, 2, 0, 0.3, 0.3, 10, 4]
])('', (N, a0, a1, a2, a3, a4, x, y, Y, precision) => {

  test(`${i++}. Singular cases; insufficient LEDs.`, () => {

    // Prepare solver
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = eval(`a${j}`);
      lList[j] = XYZs[val];
    }

    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);

    expect(rank).toBeLessThan(3);
    
    if (rank === 3) {
      // Will never come here.
      const wList: number[] = makeWList(lList);

      // Do it.
      let xyY = [x, y, Y];
      const { alpha, feasible } = Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);

      // Examine
      if (feasible) {
        const XYZ: number[] = Solver.alpha2XYZ(alpha, a);
        xyY = XYZ2xyY(XYZ);

        expect(xyY[0]).toBeCloseTo(x, precision);
        expect(xyY[1]).toBeCloseTo(y, precision);
        expect(xyY[2]).toBeCloseTo(Y, precision);
      } else {
        console.log(`Solution INFEASIBLE for (${x}, ${y}, ${Y})`);
        expect(feasible).toBe(true); // will raise fail.
      }
    }
  });
});


//------------------- null case; values do not match -------------------


describe.each([
  [3, 0, 1, 2, 0, 0, 1e-10, 4],
  [4, 0, 1, 2, 3, 1, 1e-10, 4],
  [5, 0, 1, 2, 3, 4, 1e-10, 4]
])('', (N, a0, a1, a2, a3, a4, Y, precision) => {
  test(`${i++}. When Y is too small, answer is 0,0,0`, () => {

    // Prepare solver
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = eval(`a${j}`);
      lList[j] = XYZs[val];
    }

    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);
    expect(rank).toBe(3);
    if (rank === 3) {
      const wList: number[] = makeWList(lList);

      // Do it.
      for (let j=0; j<sRGB.length; j++) {
        const x = sRGB[j][0];
        const y = sRGB[j][1];
        let xyY = [x, y, Y];
        const { alpha, feasible } = Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);

        if (feasible) {
          // Result in zeros
          for (let k=0; k<alpha.length; k++)
            expect(alpha[k]).toBe(0);

          // dummy code to use a
          const XYZ: number[] = Solver.alpha2XYZ(alpha, a);
          xyY = XYZ2xyY(XYZ);
        } else {
          console.log(`Solution unexpectedly INFEASIBLE for (${x}, ${y}, ${Y})`);
          expect(feasible).toBe(true); // will raise fail.
        }
      }
    }
  });
});


//------------------- Extreme cases; (x,y) on one of RGB LED -------------------


describe.each([
  [3, 0, 1, 2, 0, 0, 0.6857, 0.3143, 10, 4],
  [3, 0, 1, 2, 0, 0, 0.2002, 0.6976, 10, 4],
  [3, 0, 1, 2, 0, 0, 0.1417, 0.0618,  8, 4],
  [4, 0, 1, 2, 3, 0, 0.6857, 0.3143, 10, 4],
  [4, 0, 1, 2, 3, 0, 0.2002, 0.6976, 10, 4],
  [4, 0, 1, 2, 3, 0, 0.1417, 0.0618,  8, 4],
  [5, 0, 1, 2, 3, 4, 0.6857, 0.3143, 10, 3],
  [5, 0, 1, 2, 3, 4, 0.2002, 0.6976, 10, 3],
  [5, 0, 1, 2, 3, 4, 0.1417, 0.0618,  8, 3]
])('', (N, a0, a1, a2, a3, a4, x, y, Y, precision) => {

  test(`${i++}. Extreme cases; on one of RGB LED.`, () => {

    // Prepare solver
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = eval(`a${j}`);
      lList[j] = XYZs[val];
    }

    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);

    if (rank === 3) {
      const wList: number[] = makeWList(lList);

      // Do it.
      let xyY = [x, y, Y];
      const { alpha, feasible } = Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);
      // console.log(alpha);
      
      // Examine
      if (feasible) {
        const XYZ: number[] = Solver.alpha2XYZ(alpha, a);
        xyY = XYZ2xyY(XYZ);

        expect(xyY[0]).toBeCloseTo(x, precision);
        expect(xyY[1]).toBeCloseTo(y, precision);
        expect(xyY[2]).toBeCloseTo(Y, precision);
      } else {
        console.log(`Solution INFEASIBLE for (${x}, ${y}, ${Y})`);
        expect(feasible).toBe(true); // will raise fail.
      }
    }
  });
});


//------------------- Extreme cases; Out of LED gamut -------------------

describe.each([
  [3, 0, 1, 2, 0, 0, 5, 4],
  [3, 0, 1, 2, 0, 0, 5, 4],
  [3, 0, 1, 2, 0, 0, 5, 4],
  [4, 0, 1, 2, 3, 0, 5, 4],
  [4, 0, 1, 2, 3, 0, 5, 4],
  [4, 0, 1, 2, 3, 0, 5, 4],
  [5, 0, 1, 2, 3, 4, 5, 4],
  [5, 0, 1, 2, 3, 4, 5, 4],
  [5, 0, 1, 2, 3, 4, 5, 4]
])('', (N, a0, a1, a2, a3, a4, Y, precision) => {

  test(`${i++}. N=${N} Extreme cases; out of gamut.`, () => {

    // Prepare solver
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = eval(`a${j}`);
      lList[j] = XYZs[val];
    }

    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);

    if (rank === 3) {
      const wList: number[] = makeWList(lList);

      // Do it.
      for (let j=0; j<outOfGamut.length; j++) {
        const x = outOfGamut[j][0];
        const y = outOfGamut[j][1];
        let xyY = [x, y, Y];

        // Do it.
        const { alpha, feasible } = Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);
      
        // Examine
        if (feasible) {
          const XYZ: number[] = Solver.alpha2XYZ(alpha, a);
          xyY = XYZ2xyY(XYZ);

          console.log(`Solution FEASIBLE for (${x}, ${y}, ${Y})`);
          console.log(alpha);
          expect(xyY[0]).toBeCloseTo(x, precision);
          expect(xyY[1]).toBeCloseTo(y, precision);
          expect(xyY[2]).toBeCloseTo(Y, precision);
        } else {
          expect(feasible).toBe(false); // as expected.
        }
      }
    }
  });
});



//------------------- Test alpha2XYZ extreme input -------------------

/*
describe.each([
  [3, 0, 1, 0, 0, 0, 4],
  [4, 0, 1, 0, 1, 0, 4],
  [5, 0, 2, 0, 2, 0, 4]
])('', (N, a0, a1, a2, a3, a4, precision) => {

  test(`${i++}. alpha2XYZ() truncate alpha=[0,1].`, () => {

    // Prepare solver
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = eval(`a${j}`);
      lList[j] = XYZs[val];
    }

    // @ts-ignore: TS6133; we don't need rank, ainv, nvecs
    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);

    const alpha: number[] = Array(N) as number[];

    // 1) Out of range
    for (let j=0; j<N; j++)
      alpha[j] = (j%2)*3 - 1; // Either 2 or -1
    const XYZ: number[] = Solver.alpha2XYZ(alpha, a);

    // 2) In the range
    for (let j=0; j<N; j++)
      alpha[j] = j%2; // Either 1 or 0
    const XYZ2: number[] = Solver.alpha2XYZ(alpha, a);

    expect(XYZ2[0]).toBeCloseTo(XYZ[0], precision);
    expect(XYZ2[1]).toBeCloseTo(XYZ[1], precision);
    expect(XYZ2[2]).toBeCloseTo(XYZ[2], precision);
  });
});

*/
