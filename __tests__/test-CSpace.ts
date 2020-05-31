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
// const agh = require('agh.sprintf');

let i = 1;

test(`${i++}. inistantiate should success`, () => {
  expect(() => {
    let c: CSpace = new CSpace();
    c = new CSpace('xyY', [0.3, 0.4, 1]);
    c = new CSpace('xy', [0.3, 0.4]);
    c = new CSpace('XYZ', [0.3, 0.3, 0.6]);
    c = new CSpace('hsv', [100, 0.2, 0.3]);
    c = new CSpace('rgb', 450);
    c = new CSpace(c);
    const t: CSpaceTypes = undefined;
    c.type = t;
  }).not.toThrow();
});

test(`${i++}. inistantiate CSpace 'XYZ' using array[2] should fail`, () => {
  expect(() => {
    const c: CSpace = new CSpace('XYZ', [0.3, 0.4]); // XYZ needs 3 parameters.
    c.type = 'xy';
  }).toThrow();
});

test(`${i++}. Setting array[2] to 'rgb' should fail`, () => {
  expect(() => {
    const c: CSpace = new CSpace('rgb', [0.3, 0.4, 0.5]);
    c.a = [0.3, 0.4]; // rgb needs 3 parameters.
  }).toThrow();
});

test(`${i++}. inistantiate CSpace 'xy' using array[3] should be acceptable w/o value check`, () => {
  const c = new CSpace('xy', [0.3, 0.4, -0.5]);
  const a: number[] = c.a;
  expect(a[2]).toBeCloseTo(-0.5);
});

test(`${i++}. inistantiate CSpace 'xy' using array[1] should fail`, () => {
  expect(() => {
    const c = new CSpace('xy', [0.3]); // 'xy' needs 2 parameters.
    c.a[0] = 0;
  }).toThrow();
});

test(`${i++}. Setting array[1] to 'xy' should fail`, () => {
  expect(() => {
    const c: CSpace = new CSpace('xy', [0.3, 0.4]);
    c.a = [0.3]; // 'xy' needs 2 parameters.
  }).toThrow();
});

test(`${i++}. copy using a bad CSpace should fail`, () => {
  expect(() => {
    const c: CSpace = new CSpace('xyY', [0.3, 0.4, 1]);
    const a = c.a;
    a.length = 1; // Mariciously tampered array...
    const d: CSpace = new CSpace();
    d.copy(c); // Fail!
  }).toThrow();
});



/*
  Tests of value ranges.
 */
describe.each([
  // [type, q0, q1, q2, a0, a1, a2]
  ['XYZ',  0.2,  0.3,  0.4, 0.2, 0.3,  0.4], // normal
  ['XYZ',  1.5,  0.3,  0.4, 1.5, 0.3,  0.4], // do not truncate q0
  ['XYZ',  0.2,  1.5,  0.4, 0.2, 1.5,  0.4], // do not truncate q1
  ['XYZ',  0.2,  0.3,  1.5, 0.2, 0.3,  1.5], // do not truncate q2
  ['XYZ',    0,    0,    0,   0,   0,    0], // Theoretically incorrect but people do it often.

  ['xy',   0.2,  0.3,  0.4, 0.2, 0.3,  0.4], // normal
  ['xy',   0.2,  0.3,  1.5, 0.2, 0.3,  1.5], // do not truncate unused q2
  ['xy',   0.2,  0.3, -0.1, 0.2, 0.3, -0.1], // do not truncate unused q2

  ['xyY',  0.2,  0.3,  1.5, 0.2, 0.3,  1.5], // do not truncate q2

  ['rgb',  0.3,  0.4,  0.5,  0.3,  0.4,  0.5], // normal
  ['rgb',  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],

  ['hsv',   50,  0.4,  0.5,   50,  0.4,  0.5], // normal
  ['hsv',  100,  0.4,  0.5,  100,  0.4,  0.5], // normal
  ['hsv',  150,  0.4,  0.5,  150,  0.4,  0.5], // normal
  ['hsv',  200,  0.4,  0.5,  200,  0.4,  0.5], // normal
  ['hsv',  250,  0.4,  0.5,  250,  0.4,  0.5], // normal
  ['hsv',  300,  0.4,  0.5,  300,  0.4,  0.5], // normal
  ['hsv',  350,  0.4,  0.5,  350,  0.4,  0.5], // normal
  ['hsv',  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
])('', (typ, q0, q1, q2, a0, a1, a2) => {
  test(`${i++}. ${typ}(${q0}, ${q1}, ${q2}) should return (${a0}, ${a1}, ${a2})`, () => {
    const q: number[] = [q0, q1, q2];
    const c: CSpace  = new CSpace(typ as CSpaceTypes, q);
    const a: number[] = c.a;
    expect(a[0]).toBe(a0);
    expect(a[1]).toBe(a1);
    expect(a[2]).toBe(a2);
  });

  test(`${i++}. Setting ${typ} then (${q0}, ${q1}, ${q2}) using setter should similarly work.`, () => {
    const q: number[] = [q0, q1, q2];
    const c: CSpace  = new CSpace();
    c.type = typ as CSpaceTypes;
    expect(c.type).toBe(typ);
    c.a = q;
    const a: number[] = c.a;
    expect(a[0]).toBe(a0);
    expect(a[1]).toBe(a1);
    expect(a[2]).toBe(a2);
  });

  test(`${i++}. Setting (${q0}, ${q1}, ${q2}) then ${typ} using setter should also work.`, () => {
    const q: number[] = [q0, q1, q2];
    const c: CSpace  = new CSpace();
    c.a = q;
    const a: number[] = c.a;
    c.type = typ as CSpaceTypes;
    expect(c.type).toBe(typ);
    expect(a[0]).toBe(a0);
    expect(a[1]).toBe(a1);
    expect(a[2]).toBe(a2);
  });
});

describe.each([
  // These values are chosen so that they got 'adjusted' when setting to a[], EXCEPT when type = undefined.
  ['XYZ', -0.1,  0.3,  0.4, 0.0, 0.3,  0.4], // reset q0
  ['XYZ',  0.2, -0.1,  0.4, 0.2, 0.0,  0.4], // reset q1
  ['XYZ',  0.2,  0.3, -0.1, 0.2, 0.3,  0.0], // reset q2

  ['xy',   0.9,  0.3,  0.4, 0.735483871, 0.3, 0.4],
  ['xy',  -0.1,  0.3,  0.4, 0.003858521, 0.3, 0.4],
  ['xy',   0.2,  0.9,  0.4, 0.2, 0.833822666, 0.4],
  ['xy',   0.2, -0.1,  0.4, 0.2, 0.004477612, 0.4],
  ['xy',     0,    0,    0, 0.003858521, 0.004477612, 0], // Theoretically incorrect but...

  ['xyY',  0.9,  0.3,  0.4, 0.735483871, 0.3, 0.4],
  ['xyY', -0.1,  0.3,  0.4, 0.003858521, 0.3, 0.4],
  ['xyY',  0.2,  0.9,  0.4, 0.2, 0.833822666, 0.4],
  ['xyY',  0.2, -0.1,  0.4, 0.2, 0.004477612, 0.4],
  ['xyY',  0.2,  0.3, -0.1, 0.2, 0.3,  0.0], // reset q2
  ['xy',   0,    0,    0, 0.003858521, 0.004477612, 0], // Theoretically incorrect but...

  ['rgb',  1.2,  0.4,  0.5,  1.0,  0.4,  0.5],
  ['rgb', -0.1,  0.4,  0.5,  0.0,  0.4,  0.5],
  ['rgb',  0.3,  1.2,  0.5,  0.3,  1.0,  0.5],
  ['rgb',  0.3, -0.1,  0.5,  0.3,  0.0,  0.5],
  ['rgb',  0.3,  0.4,  1.2,  0.3,  0.4,  1.0],
  ['rgb',  0.3,  0.4, -0.1,  0.3,  0.4,  0.0],

  ['hsv',  400,  0.4,  0.5,   40,  0.4,  0.5],
  ['hsv',  -50,  0.4,  0.5,  310,  0.4,  0.5],
  ['hsv',  200,  1.2,  0.5,  200,  1.0,  0.5],
  ['hsv',  200, -0.4,  0.5,  200,  0.0,  0.5],
  ['hsv',  200,  0.4,  1.2,  200,  0.4,  1.0],
  ['hsv',  200,  0.4, -0.5,  200,  0.4,  0.0],
])('', (typ, q0, q1, q2, a0, a1, a2) => {
  test(`${i++}. ${typ}(${q0}, ${q1}, ${q2}) should return (${a0}, ${a1}, ${a2})`, () => {
    const q: number[] = [q0, q1, q2];
    const c: CSpace  = new CSpace(typ as CSpaceTypes, q);
    const a: number[] = c.a;
    expect(a[0]).toBe(a0);
    expect(a[1]).toBe(a1);
    expect(a[2]).toBe(a2);
  });

  test(`${i++}. Setting ${typ} then (${q0}, ${q1}, ${q2}) using setter should similarly work.`, () => {
    const q: number[] = [q0, q1, q2];
    const c: CSpace  = new CSpace();
    c.type = typ as CSpaceTypes;
    expect(c.type).toBe(typ);
    c.a = q;
    const a: number[] = c.a;
    expect(a[0]).toBe(a0);
    expect(a[1]).toBe(a1);
    expect(a[2]).toBe(a2);
  });
  
  test(`${i++}. Setting (${q0}, ${q1}, ${q2}) then ${typ} using setter should also work.`, () => {
    const q: number[] = [q0, q1, q2];
    const c: CSpace  = new CSpace();
    // Setting a[] when type is undefined does not check the range of input.
    c.a = q;
    // Setting type does not change the range of input.
    const a: number[] = c.a;
    c.type = typ as CSpaceTypes;
    expect(c.type).toBe(typ);
    // Resulting that the values are different from normally set.
    if (q0 !== a0)
      expect(a[0]).not.toBe(a0);
    else
      expect(a[0]).toBe(a0);
    if (q1 !== a1)
      expect(a[1]).not.toBe(a1);
    else
      expect(a[1]).toBe(a1);
    if (q2 !== a2)
      expect(a[2]).not.toBe(a2);
    else
      expect(a[2]).toBe(a2);
  });
});

describe.each([
  [ 0.2,  0.3,  0.2, 0.3], // normal
  [ 0.9,  0.3,  0.735483871, 0.3],
  [-0.1,  0.3,  0.003858521, 0.3],
  [ 0.2,  0.9,  0.2, 0.833822666],
  [ 0.2, -0.1,  0.2, 0.004477612],
  [ 0,    0,    0.003858521, 0.004477612] // Theoretically incorrect but...
])('', (q0, q1, a0, a1) => {
  test(`${i++}. 'xy'(${q0}, ${q1}) should return (${a0}, ${a1})`, () => {
    const q: number[] = [q0, q1];
    const c: CSpace  = new CSpace('xy', q);
    const a: number[] = c.a;
    expect(a[0]).toBe(a0);
    expect(a[1]).toBe(a1);
  });

  test(`${i++}. Setting 'xy' then (${q0}, ${q1}) using setter should similarly work.`, () => {
    const q: number[] = [q0, q1];
    const c: CSpace  = new CSpace();
    c.type = 'xy';
    expect(c.type).toBe('xy');
    c.a = q;
    const a: number[] = c.a;
    expect(a[0]).toBe(a0);
    expect(a[1]).toBe(a1);
  });

  test(`${i++}. Setting (${q0}, ${q1}) then 'xy' fails.`, () => {
    expect(() => {
      const q: number[] = [q0, q1];
      const c: CSpace  = new CSpace();
      c.a = q; // type = undefined can accept any length of array.
      c.type = 'xy' as CSpaceTypes; // but you cannot do it to other types.
    }).toThrow();
  });
});


/*
  Tests of conversions.
  Some values are from https://github.com/Qix-/color-convert/blob/master/test/basic.js
*/

describe.each([
  ['rgb', 'rgb', 140/255, 200/255, 100/255, 140/255,   200/255,  100/255,   5], // tribial
  ['rgb', 'hsv',   0.0,     0.0,     0.0,     0,         0.0,      0.0,     5], // extreme
  ['rgb', 'hsv',   1.0,     1.0,     1.0,     0,         0.0,      1.0,     5], // extreme
  ['rgb', 'hsv', 140/255, 200/255, 100/255,  96,        50/100,   78.4/100, 3],
  ['rgb', 'hsv',   0.2,     0.1,     0.3,   270,         0.6667,   0.3,     3],
  ['rgb', 'hsv',   0.2,     0.3,     0.1,    90,         0.6667,   0.3,     3],
  ['rgb', 'hsv',   0.3,     0.2,     0.1,    30,         0.6667,   0.3,     3],
  ['hsv', 'hsv',  96,      50/100,  78/100,  96,        50/100,   78/100,   5], // tribial
  ['hsv', 'rgb',   0,       0.0,     0.0,     0.0,       0.0,      0.0,     5], // extreme
  ['hsv', 'rgb',   0,       0.0,     1.0,     1.0,       1.0,      1.0,     5], // extreme
  ['hsv', 'rgb',  50,      50/100,  78/100,   0.78,      0.715,    0.39,    3],
  ['hsv', 'rgb',  96,      50/100,  78/100, 139.2/255, 198.9/255, 99.5/255, 3],
  ['hsv', 'rgb', 150,      50/100,  78/100,   0.39,      0.78,     0.585,   3],
  ['hsv', 'rgb', 200,      50/100,  78/100,   0.39,      0.65,     0.78,    3],
  ['hsv', 'rgb', 250,      50/100,  78/100,   0.455,     0.39,     0.78,    3],
  ['hsv', 'rgb', 300,      50/100,  78/100,   0.78,      0.39,     0.78,    3],
  ['hsv', 'rgb', 350,      50/100,  78/100,   0.78,      0.39,     0.455,   3],
  ['XYZ', 'rgb',  25/100,  40/100,  15/100,  97.4/255, 189.9/255, 85/255,   3],
  ['XYZ', 'xyY',   0.0,     0.0,     0.0,     0.0,       0.0,      0.0,     5], // extreme
  ['xyY', 'XYZ',   0.0,     0.0,     0.0,     0.0,       0.0,      0.0,     5], // extreme
  ['rgb', 'XYZ',  92/255, 191/255,  84/255,  24.6/100,  40.2/100, 14.8/100, 3],
  ['rgb', 'xy',    0.2,     0.3,     0.4,     0.238,     0.257,    0.069,   3]

])('', (t1, t2, q0, q1, q2, a0, a1, a2, numDigits) => {
  test(`${i++}. ${t1}(${q0}, ${q1}, ${q2}) => ${t2}(${a0}, ${a1}, ${a2})`, () => {
    const q: number[] = [q0, q1, q2];
    const ans: number[] = [a0, a1, a2];

    let c: CSpace  = new CSpace(t1 as CSpaceTypes, q);

    // 0. Prepare for preservation test (2)
    const c1: CSpace = new CSpace(c);
    const qq: number[] = c1.a; // q1 can be different from q, because of value check when instantiate c.

    // 1. Does conversion work correct?
    const c2: CSpace = c.conv(t2);
    let a: number[] = c2.a;

    // when running jest, ' --silent=false --verbose false ' needs.
    // console.log(`${t1} => ${t2} answer: ${r}`);
    // console.log(agh.sprintf('%s (%.3g, %.3g, %.3g) => %s (%.3g, %.3g, %.3g)', t1, q[0], q[1], q[2], t2, a[0], a[1], a[2]));

    for (let j=0; j<3; j++) {
      expect(a[j]).toBeCloseTo(ans[j], numDigits);
    }

    // 2. Does conversion preserve the original?
    a = c.a;
    for (let j=0; j<3; j++) {
      expect(a[j]).toBeCloseTo(qq[j], numDigits);
    }

    // This should do similar to .conv() but changes itself.
    c.type = t2 as CSpaceTypes;
    for (let j=0; j<3; j++) {
      expect(a[j]).toBeCloseTo(ans[j], numDigits);
    }
  });
});

describe.each([
  [0.2,  0.3,  0.4, 'rgb', 'rgb', 5],
  [0.2,  0.3,  0.4, 'rgb', 'hsv', 3], 
  [0.2,  0.3,  0.4, 'rgb', 'XYZ', 3], 
  [0.0,  0.0,  0.1, 'rgb', 'XYZ', 1], 
  [0.0,  0.1,  0.0, 'rgb', 'XYZ', 1], 
  [0.1,  0.0,  0.0, 'rgb', 'XYZ', 1], 
  [0.2,  0.3,  0.4, 'rgb', 'xyY', 3],
  [150,  0.3,  0.4, 'hsv', 'rgb', 3], 
  [150,  0.3,  0.4, 'hsv', 'hsv', 5], 
  [150,  0.3,  0.4, 'hsv', 'XYZ', 3], 
  [150,  0.3,  0.4, 'hsv', 'xyY', 3],
  [0.2,  0.3,  0.4, 'XYZ', 'rgb', 1], 
  [0.0,  0.0,  0.0, 'XYZ', 'rgb', 3], 
  [0.1,  0.1,  0.0, 'XYZ', 'rgb', 1], 
  [0.0,  0.1,  0.0, 'XYZ', 'rgb', 0],
  [0.0,  0.0,  0.1, 'XYZ', 'rgb', 1], 
  [0.6,  0.8,  1.0, 'XYZ', 'rgb', 3], 
  [0.2,  0.3,  0.4, 'XYZ', 'hsv', 1], 
  [0.2,  0.3,  0.4, 'XYZ', 'XYZ', 5], 
  [0.2,  0.3,  0.4, 'XYZ', 'xyY', 3], 
  [0.2,  0.3,  0.4, 'xyY', 'rgb', 1],
  [0.2,  0.3,  0.4, 'xyY', 'hsv', 1],
  [0.2,  0.3,  0.4, 'xyY', 'XYZ', 3], 
  [0.2,  0.3,  0.4, 'xyY', 'xyY', 5]
])('', (q0, q1, q2, t1, t2, numDigits) => {
  test(`${i++}. ${t1}(${q0}, ${q1}, ${q2}) => ${t2} => ${t1} should return original`, () => {
    const q: number[] = [q0, q1, q2];
    let c: CSpace  = new CSpace(t1 as CSpaceTypes, q);
    // c = c.conv(t2).conv(t1);
    c = c.conv(t2);
//    let a2: number[] = c.a;
    c = c.conv(t1);
    let a1 = c.a;
    /*
    console.log(agh.sprintf('%s (%.3g, %.3g, %.3g) => %s (%.3g, %.3g, %.3g) => %s (%.3g, %.3g, %.3g)',
                            t1, q[0], q[1], q[2],
                            t2, a2[0], a2[1], a2[2],
                            t1, a1[0], a1[1], a1[2]));
    */
    for (let j=0; j<3; j++) {
      expect(a1[j]).toBeCloseTo(q[j], numDigits);
    }
  });
});

describe.each([
  ['rgb', 0.2,  0.3,  0.4, 0.238, 0.257, 0.069, 3],
  ['hsv', 150,  0.3,  0.4, 0.290, 0.368, 0.115, 3],
  ['XYZ', 0.2,  0.3,  0.4, 0.222, 0.333, 0.3,   3],
  ['xyY', 0.2,  0.4,  0.5, 0.2,   0.4,   0.5,   5],
  ['xy',  0.3,  0.4,  3.0, 0.3,   0.4,   3.0,   5]
])('', (t1, q0, q1, q2, a0, a1, a2, numDigits) => {
  test(`${i++}. ${t1}(${q0}, ${q1}, ${q2}) ${t1} => 'xy' should match the result of 'XYZ'`, () => {
    const q: number[] = [q0, q1, q2];
    const c: CSpace  = new CSpace(t1 as CSpaceTypes, q);
    let a = c.xy().a;
    expect(a[0]).toBeCloseTo(a0, numDigits);
    expect(a[1]).toBeCloseTo(a1, numDigits);
    expect(a[2]).toBeCloseTo(a2, numDigits);
  });
});

describe.each([
  ['rgb', 0.2,  0.3,  0.4],
  ['hsv', 150,  0.3,  0.4],
  ['XYZ', 0.2,  0.3,  0.4],
  ['xyY', 0.2,  0.4,  0.5]
])('', (t1, q0, q1, q2) => {
  test(`${i++}. 'xy' => ${t1} should throw exception`, () => {
    expect(() => {
      const q: number[] = [q0, q1, q2];
      const c: CSpace  = new CSpace(t1 as CSpaceTypes, q);
      c.xy().conv(t1); // You cannot transform from xy to any other.
    }).toThrow();
  });
});

describe.each([
  ['rgb', 0.2,  0.3,  0.4],
  ['hsv', 150,  0.3,  0.4],
  ['XYZ', 0.2,  0.3,  0.4],
  ['xyY', 0.2,  0.4,  0.5],
  ['xy',  0.2,  0.4,  3.14]
])('', (t1, q0, q1, q2) => {
  test(`${i++}. 'Forcing type=undefined, then converting type will preserve everything.`, () => {
    const q: number[] = [q0, q1, q2];
    const c: CSpace  = new CSpace(t1 as CSpaceTypes, q);
    c.type = undefined;

    const c1: CSpace = c.conv(t1);
    const a: number[] = c1.a;

    expect(typeof(c1.type)).toBe('undefined');
    for (let j=0; j<3; j++) {
      expect(a[j]).toBeCloseTo(q[j], 5);
    }
  });
});
