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

import { CSpace, CSpaceTypes, CIEnm2x, CIEnm2y, checkCIExy, CIExy2nm, checkCIExyInList, CIEfitxy2List } from '../src/index';

function makeRgbList(ii: number): CSpace[] {
  const rgbr: CSpace[] = Array(4) as CSpace[];
  let c: CSpace = new CSpace('rgb', [1, 0, 0]);
  rgbr[0] = c.xyY();
  c.a = [0, 1, 0];
  rgbr[1] = c.xyY();
  c.a = [0, 0, 1];
  rgbr[2] = c.xyY();
  rgbr[3] = rgbr[0];
  ii = (ii % 2);
  rgbr[ii] = rgbr[ii].xy();
  return rgbr;
}

function makeBadRgbList(ii: number) {
  const rgbr: CSpace[] = makeRgbList(ii);
  rgbr[2] = rgbr[2].rgb();
  return rgbr;
}

let i = 1;

describe.each([
  // [nm, x, y]
  [600, 0.627036600, 0.372491145], // normal
  [424, 0.17, 0.006], // nm is not in the table
  [200, 0.173134328, 0.004477612], // nm in UV
  [800, 0.735483871, 0.264516129], // nm in NIR
])('[nm: %i => CIE(%f, %f)]', (nm, x, y) => {
  test(`${i++}. CIEnm2x(${nm}): should return ${x}`, () => {
    expect(CIEnm2x(nm)).toBeCloseTo(x, 0);
  });

  test(`${i++}. CIEnm2y(${nm}): should return ${y}`, () => {
    expect(CIEnm2y(nm)).toBeCloseTo(y, 0);
  });
});

describe.each([
  // [x, y, nm]
  [0.7, 0.3, 625], // almost far right end
  [0.075, 0.83, 520], // almost top end
  [0.17, 0.006, 424], // almost bottom end
  [0.0, 0.654823151, 505], // too small x (correct: 0.003858521 = xMin)
  [0.8, 0.2645, 700], // too large x (correct: 0.735483871 = xMax)
  [0.173134328, 0, 405], // too small y (correct: 0.003858521 = yMin)
  [0.074339401, 0.84, 520], // too large y (correct: 0.833822666 = yMax)
])('[CIE(%f, %f) => nm: %i]', (x, y, nm) => {
  test(`${i++}. CIExy2nm(${x}, ${y}): should return ${nm}`, () => {
    let c: CSpace = new CSpace('xy', [x, y]);
    expect(CIExy2nm(c)).toBeCloseTo(nm, -2);
    c = new CSpace('xyY', [x, y, 1]);
    expect(CIExy2nm(c)).toBeCloseTo(nm, -2);
  });
});

describe.each([
  ['hsv', 150, 0.3, 0.4],
  ['rgb', 0.2, 0.3, 0.4],
  ['XYZ', 0.2, 0.3, 0.4]
])('[CIE(%f, %f) => k]', (typ, a0, a1, a2) => {
  test(`${i++}. CIExy2nm(): should fail when not xy or xyY`, () => {
    expect(() => {
      let c: CSpace = new CSpace(typ as CSpaceTypes, [a0, a1, a2]);
      let ret: number = CIExy2nm(c); // wrong! rgb etc is not acceptable
      console.log(ret);
    }).toThrow();
  });
});






describe.each([
  // [x, y, result]
  [0.3302, 0.3411, true], // 5700k White
  [0.1731, 0.0045, true], // Near 405 nm
  [0.003858, 0.6548, false], // Near 515 nm
  [0.07433940, 0.833822666, false], // Near 520 nm
  [0.1547, 0.8058, true], // Near 530 nm, same y.
  [0.7355, 0.264516129, false], // Near 700 nm
  [0.7354, 0.264516129, true], // Near 700 nm
  [0.075, 0.84, false], // Above 520 nm
  [0.4, 0.0, false],
  [0.4, 0.1, false],
  [0.3, 0.1, true],
  [0.7, 0.25, true],
  [0.6, 0.2, false],
  [0.2, 0.2,true],
  [0.1, 0.2, true],
  [0.1, 0.4, true],
  [0.3, 0.4, true],
  [0.05, 0.8, true]
])('[CIE(%f, %f) => in: %i]', (x, y, res) => {
  test(`${i++}. checkCIExy(${x}, ${y}): should return ${res}`, () => {
    let c: CSpace = new CSpace('xy', [x, y]);    
    expect(checkCIExy(c) == true).toBe(res == true);
    c = new CSpace('xyY', [x, y, 1]);
    expect(checkCIExy(c) == true).toBe(res == true);
  });
});

describe.each([
  ['hsv', 150, 0.3, 0.4],
  ['rgb', 0.2, 0.3, 0.4],
  ['XYZ', 0.2, 0.3, 0.4]
])('[CIE(%f, %f) => k]', (typ, a0, a1, a2) => {
  test(`${i++}. checkCIExy(): should fail when not xy or xyY`, () => {
    expect(() => {
      let c: CSpace = new CSpace(typ as CSpaceTypes, [a0, a1, a2]);
      let ret = checkCIExy(c); // wrong! rgb etc is not acceptable
      console.log(ret);
    }).toThrow();
  });
});



describe.each([
  // [x, y, result]
  [0.3302, 0.3411, true], // 5700k White
  [0.1731, 0.0045, false], // Near 405 nm
  [0.0039, 0.6548, false], // Near 515 nm
  [0.0743, 0.8338, false], // Near 520 nm
  [0.1547, 0.8058, false], // Near 530 nm, same y.
  [0.7355, 0.2645, false], // Near 700 nm
])('[CIE(%f, %f) => in: %i]', (x, y, res) => {
  test(`${i++}. checkCIExyInList(${x}, ${y}): should return ${res}`, () => {
    const rgbList: CSpace[] = makeRgbList(i);
    let c: CSpace = new CSpace('xy', [x, y]);    
    expect(checkCIExyInList(c, rgbList) == true).toBe(res == true);
    c = new CSpace('xyY', [x, y, 1]);
    expect(checkCIExyInList(c, rgbList) == true).toBe(res == true);
  });
});

describe.each([
  ['hsv', 150, 0.3, 0.4],
  ['rgb', 0.2, 0.3, 0.4],
  ['XYZ', 0.2, 0.3, 0.4]
])('[CIE(%f, %f) => k]', (typ, a0, a1, a2) => {
  test(`${i++}. checkCIExy(): should fail when not xy or xyY`, () => {
    expect(() => {
      const rgbList: CSpace[] = makeBadRgbList(i);
      let c: CSpace = new CSpace(typ as CSpaceTypes, [a0, a1, a2]);
      let ret = checkCIExyInList(c, rgbList); // wrong! rgb etc is not acceptable
      console.log(ret);
    }).toThrow();
  });
});






describe.each([
  // [x, y, result]
  [0.1731, 0.0045, 0.1731, 0.0045, 405.31],
  [0.4956, 0.5034, 0.4956, 0.5034, 577.50],
  [0.0750, 0.7750, 0.0486, 0.8180, 513.44],
  [0.4000, 0.1000, 0.1731, 0.0045, 405.00],
  [0.0500, 0.2500, 0.0562, 0.2515, 487.70],
])('[CIE(%f, %f) => CIE(%f, %f) w/ %f nm]', (x, y, rx, ry, rnm) => {
  test(`${i++}. CIEfitxy2List(${x}, ${y}): should return (${rx},${ry},${rnm})`, () => {
    let c: CSpace = new CSpace('xy', [x, y]);
    let ret: CSpace = CIEfitxy2List(c);
    expect(ret.x).toBeCloseTo(rx, 1);
    expect(ret.y).toBeCloseTo(ry, 1);
    expect(ret.q).toBeCloseTo(rnm, 0);
    c = new CSpace('xyY', [x, y, 1]);
    ret = CIEfitxy2List(c);
    expect(ret.x).toBeCloseTo(rx, 1);
    expect(ret.y).toBeCloseTo(ry, 1);
    expect(ret.q).toBeCloseTo(rnm, 0);
  });
});

describe.each([
  ['hsv', 150, 0.3, 0.4],
  ['rgb', 0.2, 0.3, 0.4],
  ['XYZ', 0.2, 0.3, 0.4]
])('[CIE(%f, %f) => k]', (typ, a0, a1, a2) => {
  test(`${i++}. CIEfitxy2List(): should fail when not xy or xyY`, () => {
    expect(() => {
      let c: CSpace = new CSpace(typ as CSpaceTypes, [a0, a1, a2]);
      let ret: CSpace = CIEfitxy2List(c); // wrong! rgb etc is not acceptable
      console.log(ret);
    }).toThrow();
  });
});




describe.each([
  // [x, y, result]
  [ 0.3500, 0.3500, 0.3500, 0.3500 ],
  [ 0.2500, 0.0500, 0.2224, 0.0999 ],
  [ 0.3500, 0.6000, 0.3307, 0.5756 ],
  [ 0.1000, 0.0500, 0.1500, 0.0600 ],
  [ 0.2500, 0.6000, 0.2964, 0.5871 ],
  [ 0.1500, 0.1000, 0.1603, 0.0971 ],
  [ 0.6000, 0.4000, 0.5814, 0.3766 ],
  [ 0.6000, 0.2500, 0.5755, 0.2945 ],
  [ 0.7000, 0.3000, 0.6400, 0.3300 ],
  [ 0.6500, 0.3000, 0.6350, 0.3272 ]
])('[CIE(%f, %f) => (%f, %f]', (x, y, rx, ry) => {
  test(`${i++}. checkCIExyInList(${x}, ${y}) to fit RGB gamut`, () => {
    const rgbList: CSpace[] = makeRgbList(i);
    let c: CSpace = new CSpace('xy', [x, y]);
    let ret: CSpace = CIEfitxy2List(c, rgbList);
    expect(ret.x).toBeCloseTo(rx, 1);
    expect(ret.y).toBeCloseTo(ry, 1);
    c = new CSpace('xyY', [x, y, 1]);
    ret = CIEfitxy2List(c, rgbList);
    expect(ret.x).toBeCloseTo(rx, 1);
    expect(ret.y).toBeCloseTo(ry, 1);
  });
});

describe.each([
  ['xyY', 0.35, 0.35, 1],
  ['hsv', 150, 0.3, 0.4],
  ['rgb', 0.2, 0.3, 0.4],
  ['XYZ', 0.2, 0.3, 0.4]
])('[CIE(%f, %f) => k]', (typ, a0, a1, a2) => {
  test(`${i++}. checkCIExy(): should fail when not xy or xyY`, () => {
    expect(() => {
      const rgbList: CSpace[] = makeBadRgbList(i);
      const c: CSpace = new CSpace(typ as CSpaceTypes, [a0, a1, a2]);
      const ret: CSpace = CIEfitxy2List(c, rgbList); // wrong! rgb etc is not acceptable
      console.log(ret);
    }).toThrow();
  });
});