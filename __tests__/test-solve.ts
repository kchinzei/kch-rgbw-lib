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

import { GamutError } from '../src/GamutError';
import * as Solver from '../src/solver';
import { simplexIsOK } from 'linear-program-solver';

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

let iTest=0;

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
  [ [0, 1, 2],          10, 4],
  [ [0, 1, 2, 3],       10, 4],
  [ [0, 1, 2, 0],       10, 4], // Insufficient LED.
  [ [0, 1, 2, 3, 4],    10, 4],
  [ [0, 1, 2, 3, 0],    10, 4], // Insufficient LED.
  [ [0, 1, 2, 1, 0],    10, 4], // Insufficient LED.
  [ [0, 1, 2, 3, 4, 5], 10, 4],
  [ [0, 1, 2, 3, 2, 0], 10, 4], // Insufficient LED.
  [ [0, 1, 2, 2, 1, 0], 10, 4]  // Insufficient LED.
])('', (lIDList, Y, precision) => {

  test(`1: ${iTest++}. LEDs ${lIDList} in gamut, not saturated)`, async () => {
    const simplexAvailable = simplexIsOK();

    // Prepare solver
    const N = lIDList.length;
    const lList: number[][] = new Array(N) as number[][];
    for (let i=0; i<N; i++) {
      const val = lIDList[i];
      lList[i] = XYZs[val];
    }

    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);
    expect(rank).toBe(3);

    if (rank === 3 && (N < 5 || simplexAvailable)) {
      const wList: number[] = makeWList(lList);

      // Do it.
      expect.assertions(sRGB.length*3+1);

      for (let i=0; i<sRGB.length; i++) {
        const x = sRGB[i][0];
        const y = sRGB[i][1];
        let xyY = [x, y, Y];

        try {
          const alpha: number[] = await Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);

          const alpha2 = Solver.normalize(alpha);
          const XYZ: number[] = Solver.alpha2XYZ(alpha2, a);
          xyY = XYZ2xyY(XYZ);

          expect(xyY[0]).toBeCloseTo(x, precision);
          expect(xyY[1]).toBeCloseTo(y, precision);
          expect(xyY[2]).toBeCloseTo(Y, precision);
        } catch (e) {
          if (e instanceof GamutError) {
            console.log(`[1: ${iTest} UNEXPECTED! Solution out of gamut at (${x}, ${y}, ${Y})`);
          } else {
            console.log(`[1: ${iTest} UNEXPECTED! Solution infeasible at (${x}, ${y}, ${Y})`);
          }
          console.log(e);
          throw e;
        }
      }
    }
  });
});

//------------------- Saturated case; Y does not match -------------------

describe.each([
  [ [0, 1, 2],          100, 4],
  [ [0, 1, 2, 3],       200, 4],
  [ [0, 1, 2, 0],       200, 4], // Insufficient LED.
  [ [0, 1, 2, 3, 4],    300, 4],
  [ [0, 1, 2, 3, 4, 5], 400, 4]
])('', (lIDList, Y, precision) => {
  test(`2: ${iTest++}, LEDs ${lIDList} in gamut, saturated Y (${Y})`, async () => {
    const simplexAvailable = simplexIsOK();

    // Prepare solver
    const N = lIDList.length;
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = lIDList[j];
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

    if (rank === 3 && (N < 5 || simplexAvailable)) {
      const wList: number[] = makeWList(lList);

      // Do it.
      expect.assertions(sRGB.length*6+1);

      for (let j=0; j<sRGB.length; j++) {
        const x = sRGB[j][0];
        const y = sRGB[j][1];
        let xyY = [x, y, Y];

        try {
          const alpha: number[] = await Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);

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
        } catch (e) {
          if (e instanceof GamutError) {
            console.log(`[2: ${iTest}] UNEXPECTED! Solution out of gamut at (${x}, ${y}, ${Y})`);
          } else {
            console.log(`[2: ${iTest}] UNEXPECTED! Obtain infeasible at (${x}, ${y}, ${Y})`);
          }
          console.log(e);
          throw e;
        }
      }
    }
  });
});


//------------------- Singular cases; insufficient LEDs. -------------------


describe.each([
  [ [0, 1, 0],       0.3, 0.3, 10, 4],
  [ [0, 1, 0, 1],    0.3, 0.3, 10, 4],
  [ [0, 2, 0, 2, 0], 0.3, 0.3, 10, 4]
])('', (lIDList, x, y, Y, precision) => {

  test(`3: ${iTest++}. LEDs ${lIDList} Singular cases; insufficient LEDs.`, async () => {
    const simplexAvailable = simplexIsOK();

    // Prepare solver
    const N = lIDList.length;
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = lIDList[j];
      lList[j] = XYZs[val];
    }

    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);
    expect(rank).toBeLessThan(3);
    
    if (rank === 3 && (N < 5 || simplexAvailable)) {
      // Will never come here.
      const wList: number[] = makeWList(lList);

      expect.assertions(4);

      // Do it.
      let xyY = [x, y, Y];
      try {
        const alpha = await Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);
        const alpha2 = Solver.normalize(alpha);
        const XYZ: number[] = Solver.alpha2XYZ(alpha2, a);
        xyY = XYZ2xyY(XYZ);

        expect(xyY[0]).toBeCloseTo(x, precision);
        expect(xyY[1]).toBeCloseTo(y, precision);
        expect(xyY[2]).toBeCloseTo(Y, precision);
      } catch(e) {
        if (e instanceof GamutError) {
          console.log(`[3: ${iTest}] UNEXPECTED! Solution out of gamut for (${x}, ${y}, ${Y})`);
        } else {
          console.log(`[3: ${iTest}] UNEXPECTED! Solution INFEASIBLE for (${x}, ${y}, ${Y})`);
        }
        console.log(e);
        throw e;
      }
    }
  });
});


//------------------- null case; values do not match -------------------


describe.each([
  [ [0, 1, 2],       1e-10, 4],
  [ [0, 1, 2, 3],    1e-10, 4],
  [ [0, 1, 2, 3, 4], 1e-10, 4]
])('', (lIDList, Y, precision) => {
  test(`4: ${iTest++}. LEDs ${lIDList} When Y is too small, answer is 0,0,0`, async () => {
    const simplexAvailable = simplexIsOK();

    // Prepare solver
    const N = lIDList.length;
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = lIDList[j];
      lList[j] = XYZs[val];
    }

    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);
    expect(rank).toBe(3);

    if (rank === 3 && (N < 5 || simplexAvailable)) {
      const wList: number[] = makeWList(lList);

      // Do it.
      expect.assertions(sRGB.length*N+1);

      for (let j=0; j<sRGB.length; j++) {
        const x = sRGB[j][0];
        const y = sRGB[j][1];
        let xyY = [x, y, Y];

        try {
          const alpha: number[] = await Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);

          // Result in zeros
          for (let k=0; k<alpha.length; k++)
            expect(alpha[k]).toBe(0);

          // dummy code to consume a
          const XYZ: number[] = Solver.alpha2XYZ(alpha, a);
          xyY = XYZ2xyY(XYZ);
        } catch(e) {
          if (e instanceof GamutError) {
            console.log(`[4: ${iTest}] UNEXPECTED! Solution out of gamut for (${x}, ${y}, ${Y})`);
          } else {
            console.log(`[4: ${iTest}] UNEXPECTED! Solution INFEASIBLE for (${x}, ${y}, ${Y})`);
          }
          console.log(e);
          throw e;
        }
      }
    }
  });
});



//------------------- Extreme cases; (x,y) on one of RGB LED -------------------


describe.each([
  [ [0, 1, 2],       0.6857, 0.3143, 10, 4],
  [ [0, 1, 2],       0.2002, 0.6976, 10, 4],
  [ [0, 1, 2],       0.1417, 0.0618,  8, 4],
  [ [0, 1, 2, 3],    0.6857, 0.3143, 10, 4],
  [ [0, 1, 2, 3],    0.2002, 0.6976, 10, 4],
  [ [0, 1, 2, 3],    0.1417, 0.0618,  8, 4],
  [ [0, 1, 2, 3, 4], 0.6857, 0.3143, 10, 3],
  [ [0, 1, 2, 3, 4], 0.2002, 0.6976, 10, 3],
  [ [0, 1, 2, 3, 4], 0.1417, 0.0618,  8, 3]
])('', (lIDList, x, y, Y, precision) => {

  test(`5: ${iTest++}. LEDs ${lIDList} Extreme cases; on one of RGB LED.`, async () => {
    const simplexAvailable = simplexIsOK();

    // Prepare solver
    const N = lIDList.length;
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = lIDList[j];
      lList[j] = XYZs[val];
    }

    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);
    expect(rank).toBe(3);

    if (rank === 3 && (N < 5 || simplexAvailable)) {
      const wList: number[] = makeWList(lList);

      expect.assertions(4);

      // Do it.
      let xyY = [x, y, Y];

      try {
        let alpha: number[] = await Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);
        alpha = Solver.normalize(alpha);
        // console.log(alpha);
      
        const XYZ: number[] = Solver.alpha2XYZ(alpha, a);
        xyY = XYZ2xyY(XYZ);

        expect(xyY[0]).toBeCloseTo(x, precision);
        expect(xyY[1]).toBeCloseTo(y, precision);
        expect(xyY[2]).toBeCloseTo(Y, precision);
      } catch(e) {
        if (e instanceof GamutError) {
          console.log(`[5: ${iTest}] UNEXPECTED! Solution out of gamut for (${x}, ${y}, ${Y})`);
        } else {
          console.log(`[5: ${iTest}] UNEXPECTED! Solution INFEASIBLE for (${x}, ${y}, ${Y})`);
        }
        console.log(e);
        throw e;
      }
    }
  });
});


describe.each([
  [ [0, 1, 2],       [1, 0, 0], 4],
  [ [0, 1, 2],       [0, 1, 1], 4],
  [ [0, 1, 2],       [1, 1, 1], 4],
  [ [0, 1, 2, 3],    [0, 1, 0, 0], 4],
  [ [0, 1, 2, 4],    [0, 0, 1, 0], 4],
  [ [0, 1, 2, 5],    [0, 0, 0, 1], 4],
  [ [0, 1, 2, 4, 5], [1, 0, 0, 0, 0], 4],
  [ [0, 1, 2, 4, 5], [0, 1, 0, 0, 0], 4],
  [ [0, 1, 2, 4, 5], [0, 0, 1, 0, 0], 4],
  [ [0, 1, 2, 5, 6], [0, 0, 0, 1, 0], 4],
  [ [0, 1, 2, 5, 6], [0, 0, 0, 0, 1], 4]
])('', (lIDList, alpha0, precision) => {

  test(`6: ${iTest++}. LEDs ${lIDList}; on one of RGB LED / Foward - reverse solution would agree?.`, async () => {
    const simplexAvailable = simplexIsOK();

    // Prepare solver
    const N = lIDList.length;
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = lIDList[j];
      lList[j] = XYZs[val];
    }

    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);
    expect(rank).toBe(3);

    if (rank === 3 && (N < 5 || simplexAvailable)) {
      const wList: number[] = makeWList(lList);
      const XYZ: number[] = Solver.alpha2XYZ(alpha0, a);

      expect.assertions(N+1);

      try {
        let alpha: number[] = await Solver.XYZ2Alpha(XYZ, wList, ainv, nvecs);
        alpha = Solver.normalize(alpha);
        // console.log(alpha);

        for (let j=0; j<N; j++) {
          expect(alpha0[j]).toBeCloseTo(alpha[j], precision);
        }
      } catch(e) {
        if (e instanceof GamutError) {
          console.log(`[6: ${iTest}] UNEXPECTED! Solution out of gamut for (${alpha0})`);
        } else {
          console.log(`[6: ${iTest}] UNEXPECTED! Solution INFEASIBLE for (${alpha0})`);
        }
        console.log(e);
        throw e;
      }
    }
  });
});


//------------------- Extreme cases; Out of LED gamut -------------------

describe.each([
  [ [0, 1, 2],       5, 4],
  [ [0, 1, 2],       5, 4],
  [ [0, 1, 2],       5, 4],
  [ [0, 1, 2, 3],    5, 4],
  [ [0, 1, 2, 3],    5, 4],
  [ [0, 1, 2, 3],    5, 4],
  [ [0, 1, 2, 3, 4], 5, 4],
  [ [0, 1, 2, 3, 4], 5, 4],
  [ [0, 1, 2, 3, 4], 5, 4]
])('', (lIDList, Y, precision) => {

  test(`7: ${iTest++}. LEDs ${lIDList}; Extreme cases; out of gamut.`, async () => {
    const simplexAvailable = simplexIsOK();

    // Prepare solver
    const N = lIDList.length;
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = lIDList[j];
      lList[j] = XYZs[val];
    }

    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);
    expect(rank).toBe(3);

    if (rank === 3 && (N < 5 || simplexAvailable)) {
      const wList: number[] = makeWList(lList);

      expect.assertions(outOfGamut.length*3+1);

      // Do it.
      for (let j=0; j<outOfGamut.length; j++) {
        const x = outOfGamut[j][0];
        const y = outOfGamut[j][1];
        let xyY = [x, y, Y];

        // Do it.
        try {
          const alpha = await Solver.XYZ2Alpha(xyY2XYZ(xyY), wList, ainv, nvecs);
      
          const XYZ: number[] = Solver.alpha2XYZ(alpha, a);
          xyY = XYZ2xyY(XYZ);

          console.log(`[7: ${iTest}] UNEXPECTED! Solution FEASIBLE for (${x}, ${y}, ${Y})`);
          console.log(alpha);
        } catch(e) {
          if (e instanceof GamutError) {
            // Out of gamut cases should throw GamutError.
            const XYZ: number[] = Solver.alpha2XYZ(e.alpha, a);
            xyY = XYZ2xyY(XYZ);

            expect(xyY[0]).toBeCloseTo(x, precision);
            expect(xyY[1]).toBeCloseTo(y, precision);
            expect(xyY[2]).toBeCloseTo(Y, precision);
          } else {
            // This is not what we expect.
            console.log(e);
            throw e;
          }
        }
      }
    }
  });
});

/*

//------------------- Test alpha2XYZ extreme input -------------------


describe.each([
  [3, 0, 1, 0, 0, 0, 4],
  [4, 0, 1, 0, 1, 0, 4],
  [5, 0, 2, 0, 2, 0, 4]
])('', (N, l0, l1, l2, l3, l4, precision) => {

  test(`8: ${iTest++}. alpha2XYZ() normalize alpha=[0,1].`, () => {
    // Prepare solver
    const lList: number[][] = new Array(N) as number[][];
    for (let j=0; j<N; j++) {
      const val = eval(`l${j}`);
      lList[j] = XYZs[val];
    }

    // @ts-ignore: TS6133; we don't need rank, ainv, nvecs
    const {rank, a, ainv, nvecs} = Solver.makeSolverMatrix(lList);

    const alpha: number[] = Array(N) as number[];

    // 1) Out of range
    for (let j=0; j<N; j++)
      alpha[j] = (j%2)*3 - 1; // Either 2 or -1
    const XYZ: number[] = Solver.alpha2XYZ(Solver.normalize(alpha), a);

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
