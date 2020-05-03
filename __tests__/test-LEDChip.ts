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

test(`${i++}. inistantiate LEDChip by waveLength`, () => {
  expect(() => {
    const led: LEDChip = new LEDChip('LED_R', 'Red', 660, 100);
    led.brightness = 100;
  }).not.toThrow();
});

test(`${i++}. inistantiate LEDChip by colorTemp`, () => {
  expect(() => {
    const led: LEDChip = new LEDChip('LED_W', 'White', 5700, 100);
    led.brightness = 100;
  }).not.toThrow();
});

test(`${i++}. inistantiate LEDChip by CIE(x,y)`, () => {
  expect(() => {
    const led: LEDChip = new LEDChip('LED_G', 'Green', 0.2, 0.7, 100);
    led.brightness = 100;
  }).not.toThrow();
});

test(`${i++}. instantiate w/ wrong combination of parameters should throw exception`, () => {
  expect(() => {
    const led: LEDChip = new LEDChip('LED_B', 'Wrong', 100);
    led.brightness = 100;
  }).toThrow();
});

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

test(`${i++}. getters should work`, () => {
  const led: LEDChip = new LEDChip('LED_G', 'Green', 0.2, 0.7, 100);
  led.brightness = 99.5;
  expect(led.LEDChipType).toBe('LED_G');
  expect(led.name).toBe('Green');
  expect(led.waveLength).toBeCloseTo(541.27);
  expect(led.colorTemperature).toBe(undefined);
  expect(led.x).toBeCloseTo(0.2);
  expect(led.y).toBeCloseTo(0.7);
  expect(led.brightness).toBeCloseTo(99.5);
  expect(led.maxBrightness).toBeCloseTo(100);
});

test(`${i++}. inistantiate abnormal values should truncate.`, () => {
  const led: LEDChip = new LEDChip();
  let ledtype: LEDChipTypes = 'LED_W';

  led.setMaxBrightness(0);
  expect(led.maxBrightness).toBeCloseTo(1);

  led.setLEDChipType(ledtype);
  led.setWaveLength(600); // White LED shouln't have wavelength
  expect(led.waveLength).toBe(undefined);
  led.setColorTemperature(100); // Too low
  expect(led.colorTemperature).toBeCloseTo(1000);
  led.setColorTemperature(30000); // Too high
  expect(led.colorTemperature).toBeCloseTo(20000);

  ledtype = 'LED_UV';
  led.setLEDChipType(ledtype);
  led.setColorTemperature(6000); // Color LED shouldn't have temp
  expect(led.colorTemperature).toBe(undefined);
  led.setWaveLength(100); // Too short
  expect(led.waveLength).toBeCloseTo(405);
  led.setWaveLength(800); // Too long
  expect(led.waveLength).toBeCloseTo(700);

  led.brightness = -1;
  expect(led.brightness).toBeCloseTo(0);
  led.brightness = 10;
  expect(led.brightness).toBeCloseTo(1);
});

test(`${i++}. Using some preset LEDs`, () => {
  expect(LEDChipTypR.waveLength).toBeCloseTo(617, 0);
  expect(LEDChipTypG.waveLength).toBeCloseTo(541, 0);
  expect(LEDChipTypB.waveLength).toBeCloseTo(469, 0);
  expect(LEDChipTypW.colorTemperature).toBeCloseTo(3930, -2);
  expect(LEDChipEpistarR.x).toBeCloseTo(0.7006);
  expect(LEDChipEpistarG.x).toBeCloseTo(0.0743);
  expect(LEDChipEpistarB.x).toBeCloseTo(0.1241);
  expect(LEDChipEpistarWW.x).toBeCloseTo(0.4696);
  expect(LEDChipEpistarCW.x).toBeCloseTo(0.3155);
});
