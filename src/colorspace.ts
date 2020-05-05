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

import { checkCIExy, CIEfitxy2nm, CIEnmxyType } from './CIE_waveLength';

export function XYZ2xyY(XYZ: number[]): number[] {
  // https://en.wikipedia.org/wiki/CIE_1931_color_space#CIE_xy_chromaticity_diagram_and_the_CIE_xyY_color_space
  // No hard check of X, Y, Z (maybe > 1)
  let X = XYZ[0]; if (X < 0) X = 0;
  let Y = XYZ[1]; if (Y < 0) Y = 0;
  let Z = XYZ[2]; if (Z < 0) Z = 0;
  const sumXYZ = X + Y + Z;
  if (sumXYZ === 0)
    return [ 0, 0, 0 ];
  else
    return [ X/sumXYZ, Y/sumXYZ, Y ];
}

export function xyY2XYZ(xyz: number[]) {
  // https://en.wikipedia.org/wiki/CIE_1931_color_space#CIE_xy_chromaticity_diagram_and_the_CIE_xyY_color_space
  let x = xyz[0];
  let y = xyz[1];
  let Y = xyz[2];
  if (checkCIExy(x, y) === false) {
    let xynm: CIEnmxyType = CIEfitxy2nm(x, y);
    x = xynm.x;
    y = xynm.y;
  }
  if (y <= 0)
    return [ 0, 0, 0 ];
  else
    return [ Y/y*x, Y, Y/y*(1 - x - y) ];
}

export function hsv2rgb(hsv: number[]): number[] {
  // https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB
  const h = checkH(hsv[0]);
  const s = checkN(hsv[1]);
  const v = checkN(hsv[2]);
  
  let rgb: number [] = [0,0,0];
  const c = s*v;
  const h60 = h / 60;
  const x = c * (1 - Math.abs(h60 % 2 -1));
  if (h60 < 1) { rgb[0] = c; rgb[1] = x; }
  else if (h60 < 2) { rgb[0] = x; rgb[1] = c; }
  else if (h60 < 3) { rgb[1] = c; rgb[2] = x; }
  else if (h60 < 4) { rgb[1] = x; rgb[2] = c; }
  else if (h60 < 5) { rgb[0] = x; rgb[2] = c; }
  else { rgb[0] = c; rgb[2] = x; }
  return rgb;
}

export function rgb2hsv(rgb: number[]): number[] {
  // https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
  const r = checkN(rgb[0]);
  const g = checkN(rgb[1]);
  const b = checkN(rgb[2]);

  let xmin = r;
  if (g < xmin) xmin = g;
  if (b < xmin) xmin = b;
  let xmax = g;
  if (g > xmax) xmax = g;
  if (b > xmax) xmax = b;

  const v = xmax;
  const c = xmax - xmin;
  let h, s: number;

  if (c === 0) h = 0;
  else if (v === r) h = (g - b) / c * 60;
  else if (v === g) h = (b - r) / c * 60 + 120;
  else h = (r - g) / c * 60 + 240;

  if (c === 0) s = 0;
  else s = c / v;

  return [h, s, v];
}

export function rgb2XYZ(rgb: number[]): number[] {
  // https://en.wikipedia.org/wiki/SRGB
  const r = gamma1Mod(checkN(rgb[0]));
  const g = gamma1Mod(checkN(rgb[1]));
  const b = gamma1Mod(checkN(rgb[2]));

  const X = 0.41239080*r + 0.35758434*g + 0.18048079*b;
  const Y = 0.21263901*r + 0.71516868*g + 0.07219232*b;
  const Z = 0.01933082*r + 0.11919478*g + 0.95053215*b;
  return [ X, Y, Z ];
}

export function XYZ2rgb(XYZ: number[]): number[] {
  // https://en.wikipedia.org/wiki/SRGB
  let X = XYZ[0]; if (X < 0) X = 0;
  let Y = XYZ[1]; if (Y < 0) Y = 0;
  let Z = XYZ[2]; if (Z < 0) Z = 0;

  const R = gammaMod( 3.24096994*X - 1.53738318*Y - 0.49861076*Z);
  const G = gammaMod(-0.96924364*X + 1.87596750*Y + 0.04155506*Z);
  const B = gammaMod( 0.05563008*X - 0.20397696*Y + 1.05697151*Z);
  
  return [ R, G, B ];
}

// Apply reverse of gamma for sRGB
function gamma1Mod(u: number): number {
  u = checkN(u);
  let g = 25 / 323 * u;
  if (u > 0.04045)
    g = ((200*u + 11) / 211)**(12/5);
  return u**g;
}

// Apply gamma for sRGB
function gammaMod(u: number): number {
  u = checkN(u);
  let g = 323 / 25 * u;
  if (u > 0.031308)
    g = (211*u**(5/12) - 11) / 200;
  return u**g;
}

function checkH(h: number): number {
  if (h < 0) return 0;
  if (h > 360) return (h % 360);
  return h;
}

function checkN(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
