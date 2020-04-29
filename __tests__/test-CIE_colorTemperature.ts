
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
  RGB/RGBW LED class library.

  Make Asayake to Wake Project.
  Kiyo Chinzei
  https://github.com/kchinzei/kch-rgbw-lib
*/

//import { CIEk2x, CIEk2y, CIExy2k, CIEfadeout, CIEfadein } from '../src/index';
import { CIEk2x, CIEk2y, CIExy2k } from '../src/index';

let i = 1;

describe.each([
  // [k, x, y]
  [5700, 0.3302, 0.3411], // normal
  [3348, 0.415, 0.40], // k is not in the table
  [500, 0.6499, 0.3474], // very low k
  [21000, 0.2580, 0.2574], // very hot k as Sirius

])('[k: %i => CIE(%f, %f)]', (k, x, y) => {
  test(`${i++}. CIEk2x(${k}): should return ${x}`, () => {
    expect(CIEk2x(k)).toBeCloseTo(x, 0);
  });

  test(`${i++}. CIEk2y(${k}): should return ${y}`, () => {
    expect(CIEk2y(k)).toBeCloseTo(y, 0);
  });
});

describe.each([
  // [x, y, k]
  [0.3155, 0.3270, 6500], // 6500k
  [0.3302, 0.3411, 5700], // 5700k
  [0.24, 0.257, 20000], // too small x (correct: 0.2580)
  [0.2580, 0.24, 20000], // too small y (correct: 0.2574)
  [0.655, 0.3474, 1000], // too big x (correct: 0.6499)
  [0.4965, 0.4198, 2300], // too big y (correct: 0.4198)
  [0.1731, 0.0045, 20000], // Near 405 nm
  [0.7354, 0.264516129, 1000], // Near 700 nm
])('[CIE(%f, %f) => k: %i]', (x, y, k) => {
  test(`${i++}. CIExy2k(${x}, ${y}): should return ${k}`, () => {
    let ret: (number | undefined) = CIExy2k(x, y);
    if (typeof(ret) === 'undefined') {
      ret = k = 0;
    }
    expect(ret).toBeCloseTo(k, -2);
  });
});

describe.each([
  // [x, y, k]
  [0.0038585, 0.654823151, false], // Near 515 nm
  [0.07433940, 0.833822666, false], // Near 520 nm
  [0.7355, 0.264516129, false], // Near 700 nm
  [0.075, 0.84, false], // Above 520 nm
  [0.4, 0.1, false],
  [0.6, 0.2, false],
])('[CIE(%f, %f) => k: %i]', (x, y, k) => {
  test(`${i++}. CIExy2k(${x}, ${y}): should return ${k}`, () => {
    let ret: (number | undefined | boolean) = CIExy2k(x, y);
    if (typeof(ret) === 'undefined') {
      ret = k;
    }
    expect(ret).toBe(k);
  });
});


// export function CIEfadeout(x: number, y: number, steps: number, fade?: (r: number) => number): CIEkxyType[] {
// export function CIEfadein(x: number, y: number, steps: number, fade?: (r: number) => number): CIEkxyType[] {

