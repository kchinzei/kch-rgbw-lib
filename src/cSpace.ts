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

export type cSpaceTypes =
  'rgb' | 'hsv' | 'XYZ' | 'xyY' | 'xy' | undefined ;

export interface IcSpace {
  cSpaceType: cSpaceTypes;
  a: number[];
};

export class cSpace implements IcSpace {
  private _type: cSpaceTypes;
  private _a0: number;
  private _a1: number;
  private _a2: number;

  get a(): number[] { return [ this._a0, this._a1, this._a2 ]; }
  set a(arr: number[]) {
    if (arr.length >= 3) {
      switch (this._type) {
        case 'rgb':
          this._a0 = checkN(arr[0]);
          this._a1 = checkN(arr[1]);
          this._a2 = checkN(arr[2]);
          break;
        case 'hsv':
          this._a0 = checkH(arr[0]);
          this._a1 = checkN(arr[1]);
          this._a2 = checkN(arr[2]);
          break;
        case 'XYZ':
          this._a0 = checkPositive(arr[0]);
          this._a1 = checkPositive(arr[1]);
          this._a2 = checkPositive(arr[2]);
          break;
        case 'xy':
        case 'xyY':
          this._a0 = checkN(arr[0]);
          this._a1 = checkN(arr[1]);
          this._a2 = checkPositive(arr[2]);
          break;
      }
    } else if (arr.length === 2) {
      switch (this._type) {
        case 'xy':
          this._a0 = checkN(arr[0]);
          this._a1 = checkN(arr[1]);
          break;
      }
    }
  }

  get cSpaceType(): cSpaceTypes { return this._type; }
  set cSpaceType(typeTo: cSpaceTypes) {
    if (this._type !== typeTo) {
      let tmp: cSpace = new cSpace(this);
      switch (typeTo) {
        case 'rgb':
          tmp = tmp.rgb();
          break;
        case 'hsv':
          tmp = tmp.hsv();
          break;
        case 'XYZ':
          tmp = tmp.XYZ();
          break;
        case 'xyY':
          tmp = tmp.xyY();
          break;
        case 'xy':
          tmp = tmp.xy();
          break;
      }
      this.copy(tmp);
    }
  }
  
  constructor(p0?: (cSpaceTypes | cSpace), p1?: number[]) {
    this._type = undefined;
    this._a0 = 0;
    this._a1 = 0;
    this._a2 = 0;
    if (typeof(p0) === 'undefined' && typeof(p1) === 'undefined') {
      return;
    }
    if (typeof(p0) === 'string' && typeof(p1) === 'object' && p1.length >= 3) {
      this._type = p0 as cSpaceTypes;
      this._a0 = p1[0];
      this._a1 = p1[1];
      this._a2 = p1[2];
      return;
    }
    if (typeof(p0) === 'object' && (p0 instanceof cSpace)) {
      const tmp: cSpace = p0 as cSpace;
      this.copy(tmp);
      return;
    }
    // Never should come here. Wrong combination of parameters.
    throw new Error('Class cSpace: Unexpected contructor parameters');
  }

  public copy(from: cSpace): cSpace { return Object.assign(this, from); }

  public xy(): cSpace {
    let tmp: cSpace = new cSpace(this);

    if (typeof(tmp._type) === 'undefined')
      return tmp;
    switch (tmp._type) {
      case 'xy':
        return tmp;
      default:
        tmp = tmp.xyY();
        tmp._type = 'xy';
    }
    return tmp;
  }
  
  public xyY(): cSpace {
    let tmp: cSpace = new cSpace(this);

    if (typeof(tmp._type) === 'undefined')
      return tmp;
    switch (tmp._type) {
      case 'xyY':
        return tmp;
        break;
      case 'rgb':
        tmp.XYZ();
        break;
      case 'hsv':
        tmp.XYZ();
        break;
      case 'XYZ':
        break;
      default:
        new Error(`Class cSpace: ${this._type} >> xyY not implemented`);
    }

    // XYZ >> xyY
    // https://en.wikipedia.org/wiki/CIE_1931_color_space#CIE_xy_chromaticity_diagram_and_the_CIE_xyY_color_space
    // No hard check of X, Y, Z (maybe > 1)
    let X = checkPositive(tmp._a0);
    let Y = checkPositive(tmp._a1);
    let Z = checkPositive(tmp._a2);
    const sumXYZ = X + Y + Z;

    if (sumXYZ === 0) {
      tmp._a0 = tmp._a1 = tmp._a2 = 0;
    } else {
      tmp._a0 = X/sumXYZ;
      tmp._a1 = Y/sumXYZ;
      tmp._a2 = Y;
    }
    tmp._type = 'xyY';
    return tmp;
  }

  public XYZ(): cSpace{
    let tmp: cSpace = new cSpace(this);
    let X = 0;
    let Y = 0;
    let Z = 0;
    
    if (typeof(tmp._type) === 'undefined')
      return tmp;
    switch (tmp._type) {
      case 'XYZ':
        return tmp;
        break;
      case 'xyY':
        // xyY >> XYZ
        // https://en.wikipedia.org/wiki/CIE_1931_color_space#CIE_xy_chromaticity_diagram_and_the_CIE_xyY_color_space
        let x = tmp._a0;
        let y = tmp._a1;
        Y = checkPositive(tmp._a2);
        if (checkCIExy(x, y) === false) {
          let xynm: CIEnmxyType = CIEfitxy2nm(x, y);
          x = xynm.x;
          y = xynm.y;
        }
        if (y > 0) {
          X = Y/y*x;
          Z = Y/y*(1 - x - y);
        }
        break;
      case 'hsv':
        tmp = tmp.rgb();
        // break;
      case 'rgb':
        // rgb >> XYZ
        // https://en.wikipedia.org/wiki/SRGB
        const r = gamma1Mod(checkN(this._a0));
        const g = gamma1Mod(checkN(this._a1));
        const b = gamma1Mod(checkN(this._a2));

        X = 0.41239080*r + 0.35758434*g + 0.18048079*b;
        Y = 0.21263901*r + 0.71516868*g + 0.07219232*b;
        Z = 0.01933082*r + 0.11919478*g + 0.95053215*b;
        break;
      default:
        throw new Error(`Class cSpace: ${this._type} >> XYZ not implemented`);
    }
    tmp._type = 'XYZ';
    tmp._a0 = X;
    tmp._a1 = Y;
    tmp._a2 = Z;
    return tmp;
  }

  public rgb(): cSpace {
    let tmp: cSpace = new cSpace(this);
    let r = 0;
    let g = 0;
    let b = 0;

    if (typeof(tmp._type) === 'undefined')
      return tmp;
    switch (tmp._type) {
      case 'rgb':
        return tmp;
        break;
      case 'xyY':
        tmp = tmp.XYZ();
        // break;
      case 'XYZ':
        // XYZ >> rgb
        // https://en.wikipedia.org/wiki/SRGB
        let X = checkPositive(tmp._a0);
        let Y = checkPositive(tmp._a1);
        let Z = checkPositive(tmp._a2);

        r = gammaMod( 3.24096994*X - 1.53738318*Y - 0.49861076*Z);
        g = gammaMod(-0.96924364*X + 1.87596750*Y + 0.04155506*Z);
        b = gammaMod( 0.05563008*X - 0.20397696*Y + 1.05697151*Z);
        break;
      case 'hsv':
        // hsv >> rgb
        // https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB
        const h = checkH(tmp._a0);
        const s = checkN(tmp._a1);
        const v = checkN(tmp._a2);
  
        const c = s*v;
        const h60 = h / 60;
        const x = c * (1 - Math.abs(h60 % 2 -1));
        if (h60 < 1) { r = c; g = x; }
        else if (h60 < 2) { r = x; g = c; }
        else if (h60 < 3) { g = c; b = x; }
        else if (h60 < 4) { g = x; b = c; }
        else if (h60 < 5) { r = x; b = c; }
        else { r = c; b = x; }
        break;
      default:
        throw new Error(`Class cSpace: ${this._type} >> rgb not implemented`);
    }
    tmp._a0 = r;
    tmp._a1 = g;
    tmp._a2 = b;
    tmp._type = 'rgb';
    return tmp;
  }

  public hsv(): cSpace {
    let tmp: cSpace = new cSpace(this);

    if (typeof(tmp._type) === 'undefined')
      return tmp;
    switch (tmp._type) {
      case 'hsv':
        return tmp;
        break;
      case 'xyY':
        tmp = tmp.rgb();
        break;
      case 'XYZ':
        tmp = tmp.rgb();
        break;
      case 'rgb':
        break;
      default:
        throw new Error(`Class cSpace: ${this._type} >> hsv not implemented`);
    }

    // rgb >> hsv
    // https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
    const r = checkN(this._a0);
    const g = checkN(this._a1);
    const b = checkN(this._a2);

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

    tmp._a0 = h;
    tmp._a1 = s;
    tmp._a2 = v
    tmp._type = 'hsv';
    return tmp;
  }
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

function checkPositive(n: number): number {
  if (n < 0) return 0;
  return n;
}
