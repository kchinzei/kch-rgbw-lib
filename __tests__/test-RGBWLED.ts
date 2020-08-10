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
import { CSpace, CSpaceTypes, RGBWLED, makeGamutContour } from '../src/index';
// @ts-ignore: TS6133 List all available items for future tests
import { LEDChip } from '../src/index';


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

let i = 1;

describe.each([
  [3, -1,-1,-1,-1,-1],
  [4,  3,-1,-1,-1,-1],
  [5,  3, 4,-1,-1,-1],
  [6,  3, 4, 5,-1,-1],
  [7,  3, 4, 5, 6,-1],
  [8,  3, 4, 5, 6, 0]
])('', (N, a3, a4, a5, a6, a7) => {
  test(`${i++}. Constructor using ${N} LEDs (R,G,B,${a3},${a4},${a5},${a6},${a7}))`, () => {
    expect(() => {
      const l: RGBWLED = new RGBWLED('sample', [R, G, B]);
      for (let j=3; j<N; j++) {
        const val = eval(`a${j}`);
        l.push(idLEDs[val]);
      }
      l.brightness = 0.1;
    }).not.toThrow();
  });
});


test(`${i++}. Constructor fail: insufficient LEDs.`, () => {
  expect(() => {
    const l: RGBWLED = new RGBWLED('sample', [R]); // fail!
    l.brightness = 0.1;
  }).toThrow();
  expect(() => {
    const l: RGBWLED = new RGBWLED('sample', [R, G]); // fail!
    l.brightness = 0.1;
  }).toThrow();
});

describe.each([
  [3,  0, 1, 0,-1,-1,-1,-1,-1],
  [4,  0, 2, 0, 2,-1,-1,-1,-1],
  [5,  3, 4, 3, 4, 3,-1,-1,-1],
  [6,  5, 6, 5, 6, 5, 6,-1,-1],
  [7,  2, 4, 2, 2, 2, 2, 4,-1],
  [8,  3, 6, 3, 6, 3, 6, 3, 6]
])('', (N, a0, a1, a2, a3, a4, a5, a6, a7) => {
  test(`${i++}. Constructor fail: many LEDs but less than 3 different colors`, () => {
    expect(() => {
      const lList: idLED[] = new Array(N) as idLED[];
      for (let j=0; j<N; j++) {
        const val = eval(`a${j}`);
        lList[j] = idLEDs[val];
      }
      const l: RGBWLED = new RGBWLED('sample', lList); // fail!
      l.brightness = 0.1;
    }).toThrow();
  });
});





// --------------------------------- set/get brightness test -----------------------------------





describe.each([
  [4, 3,-1,-1,-1,-1, 0.1, 4],
  [5, 3, 4,-1,-1,-1, 0.1, 4],
  [6, 3, 4, 5,-1,-1, 0.1, 4],
  [7, 3, 4, 5, 6,-1, 0.1, 4],
  [8, 3, 4, 5, 6, 0, 0.1, 4]
])('', (N, a3, a4, a5, a6, a7, b, precision) => {
  test(`${i++}. Setter/getter ${N} LEDs (R,G,B,${a3},${a4},${a5},${a6},${a7}`, () => {
    let lName = 'RGB';
    const lList: idLED[] = [R, G, B];
    for (let j=3; j<N-1; j++) {
      // We leave the last one for later use.
      const val = eval(`a${j}`);
      lList.push(idLEDs[val]);
      lName = idLEDs[val].name;
    }
    const l: RGBWLED = new RGBWLED('sample', lList);

    // Add the last one
    const lastLED = idLEDs[eval(`a${N-1}`)];
    l.push(lastLED);

    // Test
    expect(l.LED.length).toBe(N);
    l.brightness = b;
    const maxB = l.maxBrightnessAt(l);
    if (b < maxB)
      expect(l.brightness).toBeCloseTo(b, precision);
    l.name = lName;
    expect(l.name).toBe(lName);
  });
});


describe.each([
  [ -1],
  [  0],
  [1.0],
  [1.5]
])('', (brightness) => {
  test(`${i++}. set extreme brightness ${brightness}`, () => {
    const l: RGBWLED = new RGBWLED('sample', [R, G, B, W]);
    l.brightness = brightness;
    expect(l.brightness).toBeLessThanOrEqual(1);
    expect(l.brightness).toBeGreaterThanOrEqual(0);
  });
});





// --------------------------------- set/get color test -----------------------------------




describe.each([
  ['rgb', 0.2,  0.3,  0.4, 0.1, 4],
  ['hsv', 150,  0.3,  0.4, 0.2, 4],
  ['XYZ', 0.2,  0.2,  0.4, 0.1, 4],
  ['xyY', 0.2,  0.4,  10, 0.1, 4],
  ['xy',  0.2,  0.4,  0.1, 0.2, 4]
])('', (t1, q0, q1, q2, brightness, precision) => {
  test(`${i++}. set color().`, () => {
    const l: RGBWLED = new RGBWLED('sample', [R, G, B, W]);
    l.brightness = brightness;

    const c: CSpace = new CSpace(t1 as CSpaceTypes, [q0, q1, q2]);
    l.color = c;

    // If c is 'xyY' or 'XYZ', lumanance is set to c.Y.
    if (c.type === 'xyY' || c.type === 'XYZ')
      brightness = c.Y / l.maxLuminance;

    // We need 'xy' or 'xyY' to compare resulting chromaticity
    let c1: CSpace = c;
    if (c1.type !== 'xy')
      c1 = c.xyY();

    expect(l.color.x).toBeCloseTo(c1.x, precision);
    expect(l.color.y).toBeCloseTo(c1.y, precision);
    expect(l.brightness).toBeCloseTo(brightness, precision);
  });
});

describe.each([
  ['xyY', 0.7,  0.2,  0.2, 4],
  ['xyY', 0.2,  0.8,  0.2, 4],
  ['xy',  0.4,  0.6,  0.2, 4],
  ['xy', 0.05,  0.1,  0.2, 4]
])('', (t1, q0, q1, q2, precision) => {
  test(`${i++}. Extreme color maxLuminanceAt() It does not fit in to the gamut.`, () => {
    const l: RGBWLED = new RGBWLED('sample', [R, G, B, W]);

    const c: CSpace = new CSpace(t1 as CSpaceTypes, [q0, q1, q2]);
    const maxB = l.maxBrightnessAt(c);
    expect(maxB).toBeCloseTo(-1, precision);
  });
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



// ---------------------------------- brightness2Color test ----------------------------------




describe.each([
  [3,  0, 1, 2,-1,-1],
  [4,  0, 1, 2, 3,-1],
  [5,  0, 1, 2, 3, 4]
])('', (N, a0, a1, a2, a3, a4) => {
  test(`${i++}. brightness2Color should fail for wrong length of brightness`, () => {
    expect(() => {
      const lList: idLED[] = new Array(N) as idLED[];
      for (let j=0; j<N; j++) {
        const val = eval(`a${j}`);
        lList[j] = idLEDs[val];
      }
      const l: RGBWLED = new RGBWLED('sample', lList);

      const bList: number[] = new Array(N+1).fill(0) as number[];
      const c: CSpace = l.brightness2Color(bList); // fail!
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
      const c: CSpace = l.brightness2Color(bList); // fail!
      c.a[0] *= 0.5;
    }).toThrow();
  });
});
