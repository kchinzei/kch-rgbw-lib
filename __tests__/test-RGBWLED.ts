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

import { CSpace, CSpaceTypes, RGBWLED, makeGamutContour } from '../src/index';
import { LEDChip, LEDChipTypR, LEDChipTypG, LEDChipTypB, LEDChipTypW } from '../src/index';

let i = 1;

test(`${i++}. inistantiate by RGB`, () => {
  expect(() => {
    const l: RGBWLED = new RGBWLED(LEDChipTypR, LEDChipTypG, LEDChipTypB);
    l.brightness = 0.5;
  }).not.toThrow();
});

test(`${i++}. inistantiate by RGBW`, () => {
  expect(() => {
    const l: RGBWLED = new RGBWLED(LEDChipTypR, LEDChipTypG, LEDChipTypB, LEDChipTypW);
    l.brightness = 0.5;
  }).not.toThrow();
});

test(`${i++}. Initial values of some properties`, () => {
  const l: RGBWLED = new RGBWLED(LEDChipTypR, LEDChipTypG, LEDChipTypB, LEDChipTypW);
  expect(l.brightness).toBe(0);
  expect(l.name).toBe('');
  expect(l.color.x).toBeCloseTo(0.3155, 4);
  expect(l.color.y).toBeCloseTo(0.3270, 4);
});

const LEDChipAmber: LEDChip     = new LEDChip('LED_Other', { x: 0.38, y: 0.58, maxBrightness: 50, name: 'Amb' });
const LEDChipTurquoise: LEDChip = new LEDChip('LED_Other', { x: 0.15, y: 0.40, maxBrightness: 70, name: 'Tur' });
const LEDChipViolet: LEDChip    = new LEDChip('LED_Other', { x: 0.25, y: 0.05, maxBrightness: 5,  name: 'Vio' });

class idLED extends LEDChip {
  id: number;
  constructor(led: LEDChip, i: number) {
    super(led);
    this.id = i;
  }
}
const R: idLED = new idLED(LEDChipTypR, 0);
const G: idLED = new idLED(LEDChipTypG, 1);
const B: idLED = new idLED(LEDChipTypB, 2);
const W: idLED = new idLED(LEDChipTypW, 3);
const A: idLED = new idLED(LEDChipAmber, 4);
const T: idLED = new idLED(LEDChipTurquoise, 5);
const V: idLED = new idLED(LEDChipViolet, 6);
const idLEDs: idLED[] = [ R,G,B,W,A,T,V ];
R.name = 'R';
G.name = 'G';
B.name = 'B';
W.name = 'W';

test(`${i++}. member get/set works as expected.`, () => {
  const l: RGBWLED = new RGBWLED(idLEDs[0], idLEDs[1], idLEDs[2], idLEDs[3])

  // assert whether or not elements are the same instance
  expect(Object.is(l.rLED, idLEDs[0])).toBe(true);
  expect(Object.is(l.gLED, idLEDs[1])).toBe(true);
  expect(Object.is(l.bLED, idLEDs[2])).toBe(true);
  expect(Object.is(l.xLED, idLEDs[3])).toBe(true);
  for (let j=4; j<idLEDs.length; j++) {
    l.addLED(idLEDs[j]);
  }
  expect(l.nLED).toBe(idLEDs.length);
  expect(l.nLED).toBe(l.LED.length);
  for (let j=0; j<l.nLED; j++) {
    expect(Object.is(l.LED[j], idLEDs[j])).toBe(true);
  }

  const s: string = 'RGBW';
  l.name = s;
  expect(l.name).toBe(s);

  l.brightness = 0.5;;
  expect(l.brightness).toBeCloseTo(0.5, 4);
  l.brightness = 1.5;
  expect(l.brightness).toBeCloseTo(1.0, 5);
  l.brightness = -0.5;
  expect(l.brightness).toBeCloseTo(0, 5);
});

describe.each([
  ['rgb', 0.2,  0.3,  0.4],
  ['hsv', 150,  0.3,  0.4],
  ['XYZ', 0.2,  0.3,  0.4],
  ['xyY', 0.2,  0.4,  0.5],
  ['xy',  0.2,  0.4,  3.14]
])('', (t1, q0, q1, q2) => {
  test(`${i++}. set color().`, () => {
    const c: CSpace = new CSpace(t1 as CSpaceTypes, [q0, q1, q2]);
    const c1: CSpace = c.xy();
    const l: RGBWLED = new RGBWLED(LEDChipTypR, LEDChipTypG, LEDChipTypB, LEDChipTypW);
    l.brightness = 0.8;
    l.color = c;
    expect(l.color.x).toBeCloseTo(c1.x, 2);
    expect(l.color.y).toBeCloseTo(c1.y, 2);
  });
});

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
