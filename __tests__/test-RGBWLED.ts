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
// @ts-ignore: TS6133 List all available items for future tests
import { CSpace, CSpaceTypes, LEDChip, RGBWLED, makeGamutContour, GamutError } from '../src/index';
// @ts-ignore: TS6133 List all available items for future tests

const LEDChipR: LEDChip = new LEDChip('LED_R', { x: 0.6857, y: 0.3143, maxLuminance: 30.6, name: 'Red' });
const LEDChipG: LEDChip = new LEDChip('LED_G', { x: 0.2002, y: 0.6976, maxLuminance: 67.2, name: 'Green' });
const LEDChipB: LEDChip = new LEDChip('LED_B', { x: 0.1417, y: 0.0618, maxLuminance: 8.2,  name: 'Blue' });
const LEDChipW: LEDChip = new LEDChip('LED_W', { x: 0.3816, y: 0.3678, maxLuminance: 80.0, name: 'White' });
const LEDChipA: LEDChip = new LEDChip('LED_Other', { x: 0.38, y: 0.58, maxLuminance: 50, name: 'Amb' });
const LEDChipT: LEDChip = new LEDChip('LED_Other', { x: 0.15, y: 0.40, maxLuminance: 70, name: 'Tur' });
const LEDChipV: LEDChip = new LEDChip('LED_Other', { x: 0.25, y: 0.05, maxLuminance: 5,  name: 'Vio' });

class idLED extends LEDChip {
  id: number;
  constructor(led: LEDChip, i: number) {
    super(led);
    this.id = i;
  }
}
const R: idLED = new idLED(LEDChipR, 0);
const G: idLED = new idLED(LEDChipG, 1);
const B: idLED = new idLED(LEDChipB, 2);
const W: idLED = new idLED(LEDChipW, 3);
const A: idLED = new idLED(LEDChipA, 4);
const T: idLED = new idLED(LEDChipT, 5);
const V: idLED = new idLED(LEDChipV, 6);
const idLEDs: idLED[] = [ R,G,B,W,A,T,V ];

const defaultIDList = [
  [ 0, 1, 2 ],
  [ 0, 2, 5 ],
  [ 0, 1, 2, 3 ],
  [ 0, 1, 2, 4 ],
  [ 0, 1, 2, 3, 4 ],
  [ 0, 1, 2, 4, 5 ],
  [ 0, 1, 2, 3, 4, 5 ],
  [ 0, 1, 2, 4, 5, 6 ],
  [ 0, 1, 2, 3, 4, 5, 6 ]
];

let i = 1;



describe.each([
  [ [] ],
  [ [3] ],
  [ [3, 4] ],
  [ [3, 4, 5] ],
  [ [3, 4, 5, 6] ],
  [ [3, 4, 5, 6, 0] ]
])('', (lIDList) => {
  test(`${i++}. Constructor using LEDs (R,G,B) + ${lIDList})`, () => {
    const N = lIDList.length;

    if (N+3 <= RGBWLED.maxLEDNumber) {
      expect(() => {
        const l: RGBWLED = new RGBWLED('sample', [R, G, B]);
        for (let j=0; j<N; j++) {
          const val = lIDList[j];
          l.push(idLEDs[val]);
        }
      }).not.toThrow();
    } else {
      expect.assertions(0);
    }
  });
});


test(`${i++}. Constructor fail: insufficient LEDs.`, () => {
  expect(() => {
    const l: RGBWLED = new RGBWLED('sample', [R]); // fail!
    console.log(l.brightness);
  }).toThrow();
  expect(() => {
    const l: RGBWLED = new RGBWLED('sample', [R, G]); // fail!
    console.log(l.brightness);
  }).toThrow();
});

describe.each([
  [ [ 0, 1, 0 ] ],
  [ [ 0, 2, 0, 2 ] ],
  [ [ 3, 4, 3, 4, 3 ] ],
  [ [ 5, 6, 5, 6, 5, 6 ] ],
  [ [ 2, 4, 2, 2, 2, 2, 4 ] ],
  [ [ 3, 6, 3, 6, 3, 6, 3, 6] ]
])('', (lIDList) => {
  test(`${i++}. Constructor fail: many LEDs but less than 3 different colors`, () => {
    const N = lIDList.length;

    if (N <= RGBWLED.maxLEDNumber) {
      expect(() => {
        const lList: idLED[] = new Array(N) as idLED[];
        for (let j=0; j<N; j++) {
          const val = lIDList[j];
          lList[j] = idLEDs[val];
        }
        const l: RGBWLED = new RGBWLED('sample', lList); // fail!
        console.log(l.brightness);
      }).toThrow();
    } else {
      expect.assertions(0);
    }
  });
});





// --------------------------------- set/get brightness test -----------------------------------





describe.each([
  [ [ 3 ],             0.1, 4],
  [ [ 3, 4 ],          0.1, 4],
  [ [ 3, 4, 5 ],       0.1, 4],
  [ [ 3, 4, 5, 6 ],    0.1, 4],
  [ [ 3, 4, 5, 6, 0 ], 0.1, 4]
])('', (lIDList, b, precision) => {
  test(`${i++}. Setter/getter LEDs (R,G,B) + ${lIDList}`, async () => {
    const N = lIDList.length;

    if (N+3 <= RGBWLED.maxLEDNumber) {
      let lName = 'RGB';
      const lList: idLED[] = [R, G, B];
      for (let j=0; j<N-1; j++) {
        // We leave the last one for later use.
        const val = lIDList[j];
        lList.push(idLEDs[val]);
        lName = idLEDs[val].name;
      }
      const l: RGBWLED = new RGBWLED('sample', lList);

      // Add the last one
      const lastLED = idLEDs[lIDList[N-1]];
      l.push(lastLED);
      await l.setColorAsync(new CSpace('xyY', [ 0.3127, 0.3290, 0 ]));

      // Test
      expect(l.LED.length).toBe(N+3);
      l.setLuminance(b*l.maxLuminance);
      const maxB = await l.maxBrightnessAtAsync(l);
      if (b < maxB)
        expect(l.brightness).toBeCloseTo(b, precision);
      l.name = lName;
      expect(l.name).toBe(lName);
    } else {
      expect.assertions(0);
    }
  });
});


describe.each([
  [ -1],
  [  0],
  [1.0],
  [1.5]
])('', (brightness) => {
  test(`${i++}. set extreme brightness ${brightness}`, async () => {
    const l: RGBWLED = new RGBWLED('sample', [R, G, B, W]);
    await l.setColorAsync(new CSpace('xyY', [ 0.3127, 0.3290, 0 ]));
    l.setLuminance(brightness*l.maxLuminance);
    expect(l.brightness).toBeLessThanOrEqual(1);
    expect(l.brightness).toBeGreaterThanOrEqual(0);
  });
});





// --------------------------------- set/get color test -----------------------------------




describe.each([
  ['rgb', 0.2,  0.3,  0.4, 0.1, 1],
  ['hsv', 150,  0.3,  0.4, 0.2, 1],
  ['XYZ', 0.2,  0.2,  0.4, 0.1, 1],
  ['xyY', 0.2,  0.4,  10,  0.1, 1],
  ['xy',  0.2,  0.4,  0.1, 0.2, 1]
])('', (t1, q0, q1, q2, brightness, precision) => {
  test(`${i++}. set color().`, async () => {
    for (let j=0; j<defaultIDList.length; j++) {
      const N = defaultIDList[j].length;
      if (N <= RGBWLED.maxLEDNumber) {
        const lList: idLED[] = new Array(N) as idLED[];
        for (let k=0; k<N; k++) {
          const val = defaultIDList[j][k];
          lList[k] = idLEDs[val];
        }
        const l: RGBWLED = new RGBWLED('sample', lList);
        l.brightness = brightness;

        const c: CSpace = new CSpace(t1 as CSpaceTypes, [q0, q1, q2]);
        await l.setColorAsync(c);

        // If c is 'xyY' or 'XYZ', lumanance is set to c.Y.
        if (c.type === 'xyY' || c.type === 'XYZ')
          brightness = c.Y / l.maxLuminance;

        // We need 'xy' or 'xyY' to compare resulting chromaticity
        let c1: CSpace = c;
        if (c1.type !== 'xy' && c1.type != 'xyY')
          c1 = c.xyY();

        expect(l.color.x).toBeCloseTo(c1.x, precision);
        expect(l.color.y).toBeCloseTo(c1.y, precision);
        expect(l.brightness).toBeCloseTo(brightness, precision);
      }
    }
  });
});



describe.each([
  ['xyY', 0.7,  0.2,  0.2, 4],
  ['xyY', 0.2,  0.8,  0.2, 4],
  ['xy',  0.4,  0.6,  0.2, 4],
  ['xy',  0.05, 0.1,  0.2, 4]
])('', (t1, q0, q1, q2, precision) => {
  test(`${i++}. Extreme color maxLuminanceAt() It does not fit into the gamut.`, async () => {
    for (let j=0; j<defaultIDList.length; j++) {
      const N = defaultIDList[j].length;
      if (N <= RGBWLED.maxLEDNumber) {
        const lList: idLED[] = new Array(N) as idLED[];
        for (let k=0; k<N; k++) {
          const val = defaultIDList[j][k];
          lList[k] = idLEDs[val];
        }
        const l: RGBWLED = new RGBWLED('sample', lList);
        const c: CSpace = new CSpace(t1 as CSpaceTypes, [q0, q1, q2]);
        const maxB = await l.maxBrightnessAtAsync(c);
        expect(maxB).toBeCloseTo(-1, precision);

        try {
          const alpha = await l.color2AlphaAsync(c);
          const c1: CSpace = l.alpha2Color(alpha);
          expect(c1.x).toBeCloseTo(q0, precision);
          expect(c1.y).toBeCloseTo(q1, precision);
          expect(c1.Y).toBeCloseTo(q2, precision);
        } catch (e) {
          console.log(`${i} UNEXPECTED! solution failed beyond recover for (${q0}, ${q1}, ${q2})`);
          console.log(e);
          throw e;
        }
      }
    }
  });
});



// --------------------------------- isInGamut / fit2Gamut test -----------------------------------

describe.each([
  // [x, y, [idToUse], isIn, xfit, yfit]
  [0.1731, 0.0045, 0.1457, 0.0636, false, [0, 1, 2], 4],
  [0.4766, 0.4793, 0.4766, 0.4793, true,  [0, 1, 2], 4],
  [0.0750, 0.7750, 0.2002, 0.6976, false, [0, 1, 2], 4],
  [0.3817, 0.1300, 0.3652, 0.1655, false, [0, 1, 2], 4],
  [0.3817, 0.1300, 0.3817, 0.1300, true,  [0, 1, 2, 5, 6], 4],
  [0.0500, 0.2500, 0.1463, 0.2476, false, [0, 1, 2, 5, 6], 4],
])('[CIE(%f, %f) => CIE(%f, %f) : In/out %d]', (x, y, rx, ry, isInside, lIDList, precision) => {
  const N = lIDList.length;
  if (N <= RGBWLED.maxLEDNumber) {
    const lList: idLED[] = new Array(N) as idLED[];
    for (let j=0; j<N; j++) {
      const val = lIDList[j];
      lList[j] = idLEDs[val];
    }
    const l = new RGBWLED('sample', lList);
    const c = new CSpace('xy', [ x, y ]);

    test(`${i++}. isInGamut(${x}, ${y}): should return ${isInside}`, () => {
      expect(l.isInGamut(c)).toBe(isInside);
    });
  
    test(`${i++}. fit2Gamut(${x}, ${y}): should return (${rx}, ${ry})`, () => {
      const c1 = l.fit2Gamut(c);
      expect(c1.x).toBeCloseTo(rx, precision);
      expect(c1.y).toBeCloseTo(ry, precision);
    });
  }
});




// --------------------------------- makeGamutContour test -----------------------------------




describe.each([
  [ 0,1,2,4,-1, 0, 0,  0,4,1, 2,-1, 0 ],
  [ 0,1,2,3,-1, 0, 0,  0,1,2,-1, 0, 0 ],
  [ 0,1,2,6, 3,-1, 0,  0,1,2, 6,-1, 0 ],
  [ 0,1,2,5, 6, 3, 4,  0,4,1, 5, 2, 6 ],
  [ 0,1,2,6, 5, 4,-1,  0,4,1, 5, 2, 6 ],
  [ 0,1,2,3, 4, 5, 6,  0,4,1, 5, 2, 6 ],
  [ 2,1,0,6,-1, 0, 0,  2,1,0, 6,-1, 0 ],
  [ 2,1,0,3, 4, 5, 6,  2,5,1, 4, 0, 6 ]
])('', (id0, id1, id2, id3, id4, id5, id6,  a0, a1, a2, a3, a4, a5) => {
  test(`${i++}. makeGamutContour() ${id0},${id1},${id2},${id3},${id4},${id5},${id6}`, () => {
    let leds: idLED[] = [ idLEDs[id0], idLEDs[id1], idLEDs[id2] ];
    const id: number[] = [ id3, id4, id5, id6 ];
    const ans: number[] = [ a0, a1, a2, a3, a4, a5 ];
    for (let j=0; j<id.length; j++) {
      if (id[j] === -1) break;
      leds.push(idLEDs[id[j]]);
    }

    const res: idLED[] = makeGamutContour(leds) as idLED[];
    for (let j=0; j<ans.length; j++) {
      if (ans[j] === -1) {
        expect(res[j].id).toBe(leds[0].id);
        break;
      }
      expect(res[j].id).toBe(ans[j]);
    }
  });
});



// ---------------------------------- alpha2Color test ----------------------------------




describe.each([
  [3,  0, 1, 2,-1,-1],
  [4,  0, 1, 2, 3,-1],
  [5,  0, 1, 2, 3, 4]
])('', (N, a0, a1, a2, a3, a4) => {
  test(`${i++}. alpha2Color should fail for wrong length of brightness`, () => {
    expect(() => {
      const lList: idLED[] = new Array(N) as idLED[];
      for (let j=0; j<N; j++) {
        const val = eval(`a${j}`);
        lList[j] = idLEDs[val];
      }
      const l: RGBWLED = new RGBWLED('sample', lList);

      const bList: number[] = new Array(N+1).fill(0) as number[];
      const c: CSpace = l.alpha2Color(bList); // fail!
      c.a[0] *= 0.5;
    }).toThrow();
    expect(() => {
      const lList: idLED[] = new Array(N) as idLED[];
      for (let j=0; j<N; j++) {
        const val = eval(`a${j}`);
        lList[j] = idLEDs[val];
      }
      const l: RGBWLED = new RGBWLED('sample', lList);

      const bList: number[] = new Array(N-1).fill(0) as number[];
      const c: CSpace = l.alpha2Color(bList); // fail!
      c.a[0] *= 0.5;
    }).toThrow();
  });
});
