
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

import { k2x, k2y, xy2k, fadeInK, fadeOutK, CSpace, CSpaceTypes } from '../src/index';

let i = 1;

describe.each([
  // [k, x, y]
  [5700, 0.3302, 0.3411], // normal
  [3348, 0.415, 0.40], // k is not in the table
  [500, 0.6499, 0.3474], // very low k
  [21000, 0.2580, 0.2574], // very hot k as Sirius

])('[k: %i => CIE(%f, %f)]', (k, x, y) => {
  test(`${i++}. k2x(${k}): should return ${x}`, () => {
    expect(k2x(k)).toBeCloseTo(x, 0);
  });

  test(`${i++}. k2y(${k}): should return ${y}`, () => {
    expect(k2y(k)).toBeCloseTo(y, 0);
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
  [0.0038585, 0.654823151, 13370], // Near 515 nm
  [0.07433940, 0.833822666, 10110], // Near 520 nm
  [0.7355, 0.264516129, 1000], // Near 700 nm
  [0.075, 0.84, 10110], // Above 520 nm
  [0.4, 0.1, 20000],
  [0.6, 0.2, 1000],
])('[CIE(%f, %f) => k: %i]', (x, y, k) => {
  test(`${i++}. xy2k(${x}, ${y}): should return ${k}`, () => {
    let c: CSpace = new CSpace('xy', [x, y]);
    let ret: number = xy2k(c);
    expect(ret).toBeCloseTo(k, -2);
    c = new CSpace('xyY', [x, y, 1]);
    ret = xy2k(c);
    expect(ret).toBeCloseTo(k, -2);
    // It also works with (x, y) given.
    expect(xy2k(x, y)).toBeCloseTo(k, -2);
  });
});

describe.each([
  ['hsv', 150, 0.3, 0.4],
  ['rgb', 0.2, 0.3, 0.4],
  ['XYZ', 0.2, 0.3, 0.4]
])('[CIE(%f, %f) => k]', (typ, a0, a1, a2) => {
  test(`${i++}. xy2k(): should fail when not xy or xyY`, () => {
    expect(() => {
      let c: CSpace = new CSpace(typ as CSpaceTypes, [a0, a1, a2]);
      let ret: number = xy2k(c); // wrong! rgb etc is not acceptable
      console.log(ret);
    }).toThrow();
  });
});

test(`${i++}. xy2k(): should fail when only one number given`, () => {
    expect(() => {
      let ret: number = xy2k(0.5); // wrong! two numbers necessary.
      console.log(ret);
    }).toThrow();
  });

describe.each([
  [0.3155, 0.3270, 50, 6500], // 6500k
])('[CIE(%f, %f, %i) => k: %i]', (x, y, s, k) => {
  test(`${i++}. fadeIn/OutK(${x}, ${y}): should return array of ${s}`, () => {
    const c: CSpace = new CSpace('xy', [x, y]);
    let ret: CSpace[] = fadeInK(c, s);
    let len = ret.length;
    expect(len).toBe(s);
    expect(ret[len-1].x).toBeCloseTo(x, -2);
    expect(ret[len-1].y).toBeCloseTo(y, -2);

    ret = fadeOutK(c, s);
    len = ret.length;
    expect(len).toBe(s);
    expect(ret[len-1].x).toBeCloseTo(x, -2);
    expect(ret[len-1].y).toBeCloseTo(y, -2);
  });
});

describe.each([
  [0.3155, 0.3270, 50, 6500], // 6500k
])('[CIE(%f, %f, %i) => k: %i]', (x, y, s, k) => {
  test(`${i++}. fadeIn/OutK(${x}, ${y}): should return array of ${s}`, () => {
    const exponential = (r: number) => (1 - Math.exp(-4*r));
    const c = new CSpace('xyY', [x, y, 1]);
    let ret = fadeInK(c, s, exponential);
    let len = ret.length;
    expect(len).toBe(s);
    expect(ret[len-1].x).toBeCloseTo(x, -2);
    expect(ret[len-1].y).toBeCloseTo(y, -2);

    ret = fadeOutK(c, s, exponential);
    len = ret.length;
    expect(len).toBe(s);
    expect(ret[len-1].x).toBeCloseTo(x, -2);
    expect(ret[len-1].y).toBeCloseTo(y, -2);
  });
});

describe.each([
  ['hsv', 150, 0.3, 0.4],
  ['rgb', 0.2, 0.3, 0.4],
  ['XYZ', 0.2, 0.3, 0.4]
])('', (typ, a0, a1, a2) => {
  test(`${i++}. fadeIn/OutK(): should fail if not xy or xyY`, () => {
    expect(() => {
      let c: CSpace = new CSpace(typ as CSpaceTypes, [a0, a1, a2]);
      const ret = fadeInK(c, 30); // Fail; XYZ etc is not acceptable.
      ret.length = 10;
    }).toThrow();
    expect(() => {
      let c: CSpace = new CSpace(typ as CSpaceTypes, [a0, a1, a2]);
      const ret = fadeOutK(c, 30); // Fail; XYZ etc is not acceptable.
      ret.length = 10;
    }).toThrow();
  });
});

