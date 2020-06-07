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
  RGB/RGBW LED class library. It provides following functions,

  Make Asayake to Wake Project.
  Kiyo Chinzei
  https://github.com/kchinzei/kch-rgbw-lib
*/

export const nmMin = 405;
export const nmMax = 700;

export function checkWaveLength(nm: number): number {
  if (nm < nmMin) nm = nmMin;
  if (nm > nmMax) nm = nmMax;
  return nm;
}

export const xMin = 0.003858521;
export const xMax = 0.735483871;
export const yMin = 0.004477612;
export const yMax = 0.833822666;

export function checkCIEx(x: number): number {
  if (x < xMin) x = xMin;
  if (x > xMax) x = xMax;
  return x;
}

export function checkCIEy(y: number): number {
  if (y < yMin) y = yMin;
  if (y > yMax) y = yMax;
  return y;
}

export const kMin = 1000;
export const kMax = 20000;

export function checkColorTemperature(k: number): number {
  if (k < kMin) return kMin;
  if (k > kMax) return kMax;
  return k;
}
