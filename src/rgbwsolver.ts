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
  kch-rgbw-lib

  Make Asayake to Wake Project.
  Kiyo Chinzei
  https://github.com/kchinzei/kch-rgbw-lib
*/

import { LEDChip } from './LEDChip';
import { CSpace } from './CSpace';
import { svd_matlab } from './svd-helper';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const { transpose, column, diag, multiply, flatten } = require('mathjs');

// const qSmall: number = 1e-3;

export function makeLEDMatrix(lList: LEDChip[]): {a: number[][]; ainv: number[][]; nvecs: number[][]} {
  // make [A]
  const n: number = lList.length;

  const a: number[][] = new Array(3) as number[][];
  for (let i=0; i<3; i++) {
    a[i] = new Array(n).fill(0) as number[];
  }
  for (let j=0; j<n; j++) {
    const x: number = lList[j].x;
    const y: number = lList[j].y;
    const Y: number = lList[j].Y;
    a[0][j] = x/y*Y;
    a[1][j] = Y;
    a[2][j] = (1 - x - y)/y*Y;
  }

  const {u, v, q} = svd_matlab(a);

  // Obtain null vectors of v.
  const nvecs: number[][] = new Array(n - 3) as number[][];
  for (let i=3; i<n; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    nvecs[i] = flatten(column(v, i));
  }

  // Shrink v
  for (const vi of v)
    vi.length = 3;

  // Ainv = v * 1/q * ut
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const ainv: number [][] = multiply(multiply(v, diag(q)), transpose(u));

  return {a, ainv, nvecs };
}

export function LED2XYZ(lList: LEDChip[], aList: number[], a: number[][]): CSpace {
  // Assume a is from lList by makeLEDMatrix(). No size check.
  if (lList.length !== aList.length)
    throw new Error('LED2XYZ(): size of arrays should exactly match');
  checkAList(aList);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const XYZ: number[] = flatten(multiply(a, aList));
  return new CSpace('XYZ', XYZ);
}

export function XYZ2LED(XYZ: CSpace, lList: LEDChip[], ainv: number[][], nvecs: number[][] ): number[] {
  // Assume ainv, nvecs are from lList by makeLEDMatrix(). No size check.

  switch (lList.length) {
    case 3:
      return XYZ2LED3(XYZ, lList, ainv);
      break;
    case 4:
      return XYZ2LED4(XYZ, lList, ainv, nvecs[0]);
      break;
    default:
      return XYZ2LEDx(XYZ, lList, ainv, nvecs);
  }
}

function XYZ2LED3(XYZ: CSpace, lList: LEDChip[], ainv: number[][]): number[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const aList: number[] = flatten(multiply(ainv, XYZ.a));

  // Check if range of aList is physically meaningful.
  let aMax = 0;
  for (const a of aList) {
    if (a > aMax) aMax = a;
  }
  if (aMax > 1) {
    for (let i=0; i<aList.length; i++)
      aList[i] /= aMax;
  }
  return aList;
}

function XYZ2LED4(XYZ: CSpace, lList: LEDChip[], ainv: number[][], nvec: number[] ): number[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const aList: number[] = flatten(multiply(ainv, XYZ.a));
  return aList;
}

function XYZ2LEDx(XYZ: CSpace, lList: LEDChip[], ainv: number[][], nvecs: number[][] ): number[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const aList: number[] = flatten(multiply(ainv, XYZ.a));
  return aList;
}

function checkAList(aList: number[]): void {
  for (let i=0; i<aList.length; i++) {
    if (aList[i] < 0) aList[i] = 0;
    else if (aList[i] > 1) aList[i] = 1;
  }
}
