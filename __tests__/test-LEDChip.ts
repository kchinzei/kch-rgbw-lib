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

import { LEDChipTypes, LEDChip, LEDChipTypR, LEDChipTypG, LEDChipTypB, LEDChipTypW,
	 LEDChipEpistarR, LEDChipEpistarG, LEDChipEpistarB,
	 LEDChipEpistarWW, LEDChipEpistarCW } from '../src/index';

let i = 1;

test(`${i++}. inistantiate LEDChip by copy constructor`, () => {
  expect(() => {
    const led: LEDChip = new LEDChip(LEDChipTypR);
    led.brightness = 100;
  }).not.toThrow();
});

test(`${i++}. inistantiate LEDChip by waveLength`, () => {
  expect(() => {
    const led: LEDChip = new LEDChip('LED_R', 660, 100);
    led.brightness = 100;
  }).not.toThrow();
});

test(`${i++}. inistantiate LEDChip by colorTemp`, () => {
  expect(() => {
    const led: LEDChip = new LEDChip('LED_W', 5700, 100);
    led.brightness = 100;
  }).not.toThrow();
});

test(`${i++}. inistantiate LEDChip by CIE(x,y)`, () => {
  expect(() => {
    const led: LEDChip = new LEDChip('LED_G', 0.3, 0.6, 100);
    led.brightness = 100;
  }).not.toThrow();
});

test(`${i++}. instantiate w/ wrong combination of parameters should throw exception`, () => {
  expect(() => {
    const led: LEDChip = new LEDChip('LED_B', 100);
    led.brightness = 100;
  }).toThrow();
});

/*
test(`${i++}. instantiate w/o parameter, then populate using setters`, () => {
  expect(() => {
    const led: LEDChip = new LEDChip();
    led.setLEDChipType('LED_W');
    led.setMaxBrightness(1);
    led.setWaveLength(600);
    led.setColorTemperature(undefined);
    led.setColorTemperature(6000);
    led.setLEDChipType('LED_R');
    led.setWaveLength(undefined);
    led.setWaveLength(600);
    led.setColorTemperature(6000);
    led.setX(0.2);
    led.setY(0.7);
    led.name = 'woo';
    led.brightness = 0.5;
  }).not.toThrow();
});
*/

describe.each([
  [ 'LED_R', 'Red',   610,  50, 0.6658,	0.3340, 0, 610],
  [ 'LED_G', 'Green', 550, 100, 0.3016, 0.6924, 0, 550 ],
  [ 'LED_B', 'Blue',  470,  10, 0.1241, 0.0578, 0, 470 ],
  [ 'LED_W', 'White', 6500, 80, 0.3155, 0.3270, 6500, 0 ]
])('', (typ, name, a0, maxB, x, y, k, nm) => {
  test(`${i++}. getters should work`, () => {
    const led: LEDChip = new LEDChip(typ as LEDChipTypes, a0, maxB);
    led.brightness = maxB;
    led.name = name;
    expect(led.LEDChipType).toBe(typ);
    expect(led.name).toBe(name);
    expect(led.x).toBeCloseTo(x, 4);
    expect(led.y).toBeCloseTo(y, 4);
    if (nm !== 0)
      expect(led.waveLength).toBeCloseTo(nm, 5);
    if (k !== 0)
      expect(led.colorTemperature).toBeCloseTo(k, 5);
    expect(led.brightness).toBeCloseTo(maxB, 5);
    expect(led.maxBrightness).toBeCloseTo(maxB, 5);
  });
});

test(`${i++}. inistantiate abnormal values should truncate.`, () => {
  let ledtype: LEDChipTypes = 'LED_R';

  let led: LEDChip = new LEDChip(ledtype, 650, 0);
  expect(led.maxBrightness).toBeCloseTo(1);
  expect(led.colorTemperature).toBe(undefined);
  led = new LEDChip(ledtype, 100, 1.0); // Too short
  expect(led.waveLength).toBeCloseTo(405);
  led = new LEDChip(ledtype, 800, 1.0); // Too long
  expect(led.waveLength).toBeCloseTo(700);

  ledtype = 'LED_W';
  led = new LEDChip(ledtype, 100, 1.0); // Too low
  expect(led.waveLength).toBe(undefined);
  expect(led.colorTemperature).toBeCloseTo(1000);
  led = new LEDChip(ledtype, 30000, 1.0); // Too high
  expect(led.colorTemperature).toBeCloseTo(20000);

  led.brightness = -1;
  expect(led.brightness).toBeCloseTo(0);
  led.brightness = 10;
  expect(led.brightness).toBeCloseTo(1);

  led.name = '';
  expect(led.name).toBe('');
});

test(`${i++}. Using some preset LEDs`, () => {
  let led: LEDChip = new LEDChip('LED_R');
  expect(led).toStrictEqual(LEDChipTypR);
  led = new LEDChip('LED_G');
  expect(led).toStrictEqual(LEDChipTypG);
  led = new LEDChip('LED_B');
  expect(led).toStrictEqual(LEDChipTypB);
  led = new LEDChip('LED_W');
  expect(led).toStrictEqual(LEDChipTypW);

  expect(LEDChipEpistarR.x).toBeCloseTo(0.7006);
  expect(LEDChipEpistarG.x).toBeCloseTo(0.0743);
  expect(LEDChipEpistarB.x).toBeCloseTo(0.1241);
  expect(LEDChipEpistarWW.x).toBeCloseTo(0.4696);
  expect(LEDChipEpistarCW.x).toBeCloseTo(0.3155);
});
