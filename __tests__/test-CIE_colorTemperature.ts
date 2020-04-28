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

import { CIEnm2x, CIEnm2y, CIExy2nm } from '../src/index';

let i = 1;

describe.each([
  // [nm, x, y]
  [600, 0.627036600, 0.372491145], // normal
  [424, 0.17, 0.006], // nm is not in the table
  [200, 0.177215190, 0], // nm in UV
  [800, 0.666666667, 0.333333333], // nm in NIR
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
  [0.8, 0.222222222, 740], // too large x (correct: 0.777777778 = xMax)
  [0.177215190, -0.1, 380], // too small y (correct: 0 = yMin)
  [0.074339401, 0.84, 520], // too large y (correct: 0.833822666 = yMax)
])('[CIE(%f, %f) => nm: %i]', (x, y, nm) => {
  test(`${i++}. CIExy2nm(${x}, ${y}): should return ${nm}`, () => {
    expect(CIExy2nm(x, y)).toBeCloseTo(nm, 0);
  });
});
