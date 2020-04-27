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
  https://github.com/kchinzei/raspi-pca9685-pwm
*/

/*
  function CIEnm2x(nm: number): number;
  function CIEnm2y(nm: number): number;
  function CIExy2nm(x: number, y: number): number;
*/
import { CIEnm2x, CIEnm2y, CIExy2nm } from '../src/index';

let i = 1;

let x:number = 0.627036600;
let y:number = 0.372491145;
let nm:number = 600;

test(`${i++}. CIEnm2x(${nm}): should return ${x}`, () => {
  expect(CIEnm2x(nm)).toBeCloseTo(x);
});

test(`${i++}. CIEnm2y(${nm}): should return ${y}`, () => {
  expect(CIEnm2y(nm)).toBeCloseTo(y);
});

nm = 200;
x = 0.177215190;
y = 0;
test(`${i++}. CIEnm2x(${nm}): should return ${x} [out of lower limit]`, () => {
  expect(CIEnm2x(nm)).toBeCloseTo(x);
});

test(`${i++}. CIEnm2y(${nm}): should return ${y} [out of lower limit]`, () => {
  expect(CIEnm2y(nm)).toBeCloseTo(y);
});

nm = 800;
x = 0.666666667;
y = 0.333333333;
test(`${i++}. CIEnm2x(${nm}): should return ${x} [out of upper limit]`, () => {
  expect(CIEnm2x(nm)).toBeCloseTo(x);
});

test(`${i++}. CIEnm2y(${nm}): should return ${y} [out of upper limit]`, () => {
  expect(CIEnm2y(nm)).toBeCloseTo(y);
});

x = 0.7;
y = 0.3;
nm = 625;
test(`${i++}. CIExy2nm(${x}, ${y}): should return ${nm}`, () => {
  expect(CIExy2nm(x, y)).toBeCloseTo(nm);
});

x = 0.075;
y = 0.84;
nm = 520;
test(`${i++}. CIExy2nm(${x}, ${y}): should return ${nm}`, () => {
  expect(CIExy2nm(x, y)).toBeCloseTo(nm);
});

x = 0.017;
y = 0.006;
nm = 425;
test(`${i++}. CIExy2nm(${x}, ${y}): should return ${nm}`, () => {
  expect(CIExy2nm(x, y)).toBeCloseTo(nm);
});
