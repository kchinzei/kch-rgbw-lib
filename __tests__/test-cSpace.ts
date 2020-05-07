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

import { CSpace, CSpaceTypes } from '../src/index';

let i = 1;

test(`${i++}. inistantiate should success`, () => {
  expect(() => {
    let c: CSpace = new CSpace();
    c = new CSpace('xyY', [0.3, 0.4, 1]);
    c = new CSpace('xy', [0.3, 0.4]);
    c = new CSpace(c);
    const t: CSpaceTypes = undefined;
    c.type = t;
  }).not.toThrow();
});

test(`${i++}. inistantiate CSpace 'XYZ' using array[2] should fail`, () => {
  expect(() => {
    const c: CSpace = new CSpace('XYZ', [0.3, 0.4]);
    c.type = 'xy';
  }).toThrow();
});

test(`${i++}. inistantiate CSpace 'xy' using array[3] should be acceptable w/o value check`, () => {
  const c = new CSpace('xy', [0.3, 0.4, -0.5]);
  const a: number[] = c.a;
  expect(a[2]).toBeCloseTo(-0.5);
});


/*
  Tests of value ranges.
 */
describe.each([
  // [type, a0, a1, a2, a0-result, a1-result, a2-result]
  ['XYZ',  0.3,  0.3,  0.4, 0.3, 0.3,  0.4], // normal
  ['XYZ',  1.5,  0.3,  0.4, 1.5, 0.3,  0.4], // do not truncate a1
  ['XYZ', -0.1,  0.3,  0.4, 0.0, 0.3,  0.4], // reset a0
  ['XYZ',  0.3,  1.5,  0.4, 0.3, 1.5,  0.4], // do not truncate a1
  ['XYZ',  0.3, -0.1,  0.4, 0.3, 0.0,  0.4], // reset a1
  ['XYZ',  0.3,  0.3,  1.5, 0.3, 0.3,  1.5], // do not truncate a2
  ['XYZ',  0.3,  0.3, -0.1, 0.3, 0.3,  0.0], // reset a2
  ['XYZ',    0,    0,    0,   0,   0,    0], // Theoretically incorrect but people do it often.

  ['xy',   0.3,  0.3,  0.4, 0.3, 0.3,  0.4], // normal
  ['xy',   0.9,  0.3,  0.4, 0.735483871, 0.3, 0.4],
  ['xy',  -0.1,  0.3,  0.4, 0.003858521, 0.3, 0.4],
  ['xy',   0.3,  0.9,  0.4, 0.3, 0.833822666, 0.4],
  ['xy',   0.3, -0.1,  0.4, 0.3, 0.004477612, 0.4],
  ['xy',   0.3,  0.3,  1.5, 0.3, 0.3,  1.5], // do not truncate unused a2
  ['xy',   0.3,  0.3, -0.1, 0.3, 0.3, -0.1], // do not truncate unused a2
  ['xy',     0,    0,    0, 0.003858521, 0.004477612, 0], // Theoretically incorrect but...

  ['xyY',  0.9,  0.3,  0.4, 0.735483871, 0.3, 0.4],
  ['xyY', -0.1,  0.3,  0.4, 0.003858521, 0.3, 0.4],
  ['xyY',  0.3,  0.9,  0.4, 0.3, 0.833822666, 0.4],
  ['xyY',  0.3, -0.1,  0.4, 0.3, 0.004477612, 0.4],
  ['xyY',  0.3,  0.3,  1.5, 0.3, 0.3,  1.5], // do not truncate a2
  ['xyY',  0.3,  0.3, -0.1, 0.3, 0.3,  0.0], // reset a2
  ['xy',   0,    0,    0, 0.003858521, 0.004477612, 0], // Theoretically incorrect but...

  ['rgb',  0.3,  0.4,  0.5,  0.3,  0.4,  0.5], // normal
  ['rgb',  1.2,  0.4,  0.5,  1.0,  0.4,  0.5],
  ['rgb', -0.1,  0.4,  0.5,  0.0,  0.4,  0.5],
  ['rgb',  0.3,  1.2,  0.5,  0.3,  1.0,  0.5],
  ['rgb',  0.3, -0.1,  0.5,  0.3,  0.0,  0.5],
  ['rgb',  0.3,  0.4,  1.2,  0.3,  0.4,  1.0],
  ['rgb',  0.3,  0.4, -0.1,  0.3,  0.4,  0.0],
  ['rgb',  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],

  ['hsv',  200,  0.4,  0.5,  200,  0.4,  0.5], // normal
  ['hsv',  400,  0.4,  0.5,   40,  0.4,  0.5],
  ['hsv',  -40,  0.4,  0.5,  320,  0.4,  0.5],
  ['hsv',  200,  1.2,  0.5,  200,  1.0,  0.5],
  ['hsv',  200, -0.4,  0.5,  200,  0.0,  0.5],
  ['hsv',  200,  0.4,  1.2,  200,  0.4,  1.0],
  ['hsv',  200,  0.4, -0.5,  200,  0.4,  0.0],
  ['hsv',  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
  
])('', (typ, a0, a1, a2, r0, r1, r2) => {
  test(`${i++}. ${typ}(${a0}, ${a1}, ${a2}) should return (${r0}, ${r1}, ${r2})`, () => {
    const c: CSpace  = new CSpace(typ as CSpaceTypes, [a0, a1, a2]);
    const r: number[] = c.a;
    expect(r[0]).toBeCloseTo(r0);
    expect(r[1]).toBeCloseTo(r1);
    expect(r[2]).toBeCloseTo(r2);
  });
});

/*
  Tests of conversions.
*/
describe.each([
  [0.3,  0.3,  0.4, 'rgb', 'rgb'], 
  [0.3,  0.3,  0.4, 'rgb', 'hsv'], 
  [0.3,  0.3,  0.4, 'rgb', 'XYZ'], 
  [0.3,  0.3,  0.4, 'rgb', 'xyY'], 
  [150,  0.3,  0.4, 'hsv', 'rgb'], 
  [150,  0.3,  0.4, 'hsv', 'hsv'], 
  [150,  0.3,  0.4, 'hsv', 'XYZ'], 
  [150,  0.3,  0.4, 'hsv', 'xyY'], 
  [0.3,  0.3,  0.4, 'XYZ', 'rgb'], 
  [0.3,  0.3,  0.4, 'XYZ', 'hsv'], 
  [0.3,  0.3,  0.4, 'XYZ', 'XYZ'], 
  [0.3,  0.3,  0.4, 'XYZ', 'xyY'], 
  [0.3,  0.3,  0.4, 'xyY', 'rgb'], 
  [0.3,  0.3,  0.4, 'xyY', 'hsv'], 
  [0.3,  0.3,  0.4, 'xyY', 'XYZ'], 
  [0.3,  0.3,  0.4, 'xyY', 'xyY']
])('', (a0, a1, a2, t1, t2) => {
  test(`${i++}. ${t1}(${a0}, ${a1}, ${a2}) => ${t2} => ${t1} should return original`, () => {
    let c: CSpace  = new CSpace(t1 as CSpaceTypes, [a0, a1, a2]);
    c = c.conv(t2).conv(t1);
    const r: number[] = c.a;
    expect(r[0]).toBeCloseTo(a0);
    expect(r[1]).toBeCloseTo(a1);
    expect(r[2]).toBeCloseTo(a2);
  });
});

/*
describe.each([
  [0.3,  0.3,  0.4, 'rgb', 'xy'], 
  [150,  0.3,  0.4, 'hsv', 'xy'], 
  [0.3,  0.3,  0.4, 'XYZ', 'xy'], 
  [0.3,  0.3,  0.4, 'xyY', 'xy'],
])('%f,%f,%f,%s,%s', (a0, a1, a2, t1, t2) => {
  test(`${i++}. ${t1}(${a0}, ${a1}, ${a2}) => ${t2} => ${t1} should return original`, () => {
    let c: CSpace  = new CSpace(t1 as CSpaceTypes, [a0, a1, a2]);
    c = c.conv(t2).conv(t1);
    const r: number[] = c.a;
    expect(r[1]).toBeCloseTo(a1);
    expect(r[2]).toBeCloseTo(a2);
    expect(r[0]).toBeCloseTo(a0);
  });
});
*/
