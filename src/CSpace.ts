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

import { checkCIEx, checkCIEy } from './CIE_waveLength';

export type CSpaceTypes =
  'rgb' | 'hsv' | 'XYZ' | 'xyY' | 'xy' | undefined ;

export interface ICSpace {
  type: CSpaceTypes;
  a: number[];
};

export class CSpace implements ICSpace {
  private _type: CSpaceTypes;
  private _a: number[];

  get a(): number[] { return this._a; }
  set a(arr: number[]) {
    // Here is the bottleneck of value check of user-given parameters
    if (arr.length >= 3) {
      if (typeof(this._type) === 'undefined') {
        for (let i=0; i<3; i++)
          this._a[i] = arr[i];
        return;
      }
      switch (this._type) {
        case 'rgb':
          this._a[0] = checkN(arr[0]);
          this._a[1] = checkN(arr[1]);
          this._a[2] = checkN(arr[2]);
          return;
        case 'hsv':
          this._a[0] = checkH(arr[0]);
          this._a[1] = checkN(arr[1]);
          this._a[2] = checkN(arr[2]);
          return;
        case 'XYZ':
          this._a[0] = checkPositive(arr[0]);
          this._a[1] = checkPositive(arr[1]);
          this._a[2] = checkPositive(arr[2]);
          return;
        case 'xyY':
          this._a[0] = checkCIEx(arr[0]);
          this._a[1] = checkCIEy(arr[1]);
          this._a[2] = checkPositive(arr[2]);
          return;
        case 'xy':
          this._a[0] = checkCIEx(arr[0]);
          this._a[1] = checkCIEy(arr[1]);
          this._a[2] = arr[2];
          return;
      }
    } else if (arr.length === 2) {
      if (typeof(this._type) === 'undefined') {
        for (let i=0; i<2; i++)
          this._a[i] = arr[i];
        return;
      }
      switch (this._type) {
        case 'xy':
          this._a[0] = checkCIEx(arr[0]);
          this._a[1] = checkCIEy(arr[1]);
          return;
      }
    }
    // Never should come here. Wrong combination of parameters.
    throw new Error('Class CSpace: Unexpected setter a() parameter.');
  }

  get type(): CSpaceTypes { return this._type; }
  set type(typeTo: CSpaceTypes) {
    // This function changes the type from undefined to else without checking the value of a[] is valid as a colorspace.
    // No other function behaves so.
    if (typeof(this._type) === 'undefined' || typeof(typeTo) === 'undefined') {
      this._type = typeTo;
      return;
    }
    if (this._type !== typeTo) {
      let tmp: CSpace;
      switch (typeTo) {
        case 'rgb':
          tmp = this.rgb();
          break;
        case 'hsv':
          tmp = this.hsv();
          break;
        case 'XYZ':
          tmp = this.XYZ();
          break;
        case 'xyY':
          tmp = this.xyY();
          break;
        case 'xy':
          tmp = this.xy();
          break;
          /* istanbul ignore next */
        default:
          throw new Error('Class CSpace: Unsupported type specified when setting type');
      }
      this.copy(tmp);
    }
  }

  constructor(p0?: (CSpaceTypes | CSpace), p1?: number[]) {
    this._type = undefined;
    this._a = [0, 0, 0];

    if (typeof(p0) === 'undefined' && typeof(p1) === 'undefined') {
      return;
    }
    if (typeof(p0) === 'string' && typeof(p1) === 'object') {
      this._type = p0;
      if (p0 === 'xy' && p1.length === 2) {
        this.a = p1;
        return;
      } else if (p1.length >= 3) {
        this.a = p1;
        return;
      }
    }
    if (typeof(p0) === 'object' && (p0 instanceof CSpace)) {
      this.copy(p0);
      return;
    }
    // Never should come here. Wrong combination of parameters.
    throw new Error('Class CSpace: Unexpected contructor parameters');
  }

  public copy(from: CSpace): CSpace {
    // Deep copy.
    // This function preserves the allocation of .a[]
    this._type = from._type;
    for (let i=0; i<3; i++)
      this._a[i] = from._a[i];
    return this;
  }

  public xy(): CSpace {
    let tmp: CSpace = new CSpace(this);

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

  public xyY(): CSpace {
    let tmp: CSpace = new CSpace(this);

    if (typeof(tmp._type) === 'undefined')
      return tmp;
    switch (tmp._type) {
      case 'xyY':
        return tmp;

      case 'rgb':
        tmp = tmp.XYZ();
        break;
      case 'hsv':
        tmp = tmp.XYZ();
        break;
      case 'XYZ':
        break;
      default:
        throw new Error(`Class CSpace: ${this._type} >> xyY not implemented`);
    }

    // XYZ >> xyY
    // https://en.wikipedia.org/wiki/CIE_1931_color_space#CIE_xy_chromaticity_diagram_and_the_CIE_xyY_color_space
    const X = tmp._a[0];
    const Y = tmp._a[1];
    const Z = tmp._a[2];
    const sumXYZ = X + Y + Z;

    if (sumXYZ === 0) {
      tmp._a[0] = tmp._a[1] = tmp._a[2] = 0;
    } else {
      tmp._a[0] = X/sumXYZ;
      tmp._a[1] = Y/sumXYZ;
      tmp._a[2] = Y;
    }
    tmp._type = 'xyY';
    return tmp;
  }

  public XYZ(): CSpace{
    let tmp: CSpace = new CSpace(this);
    let X = 0;
    let Y = 0;
    let Z = 0;

    if (typeof(tmp._type) === 'undefined')
      return tmp;
    switch (tmp._type) {
      case 'XYZ':
        return tmp;

      case 'xyY':
        // xyY >> XYZ
        // https://en.wikipedia.org/wiki/CIE_1931_color_space
        const x = tmp._a[0];
        const y = tmp._a[1];
        Y = tmp._a[2];
        /* istanbul ignore next */
        // We know that y won't be 0, but DIV/0 should never happen.
        if (y > 0) {
          X = Y/y*x;
          Z = Y/y*(1 - x - y);
        }
        break;
      case 'hsv':
        tmp = tmp.rgb();
        // Use rgb >> XYZ
      case 'rgb':
        // rgb >> XYZ
        // https://en.wikipedia.org/wiki/SRGB
        const r = gamma1Mod(checkN(tmp._a[0]));
        const g = gamma1Mod(checkN(tmp._a[1]));
        const b = gamma1Mod(checkN(tmp._a[2]));

        X = 0.41239080*r + 0.35758434*g + 0.18048079*b;
        Y = 0.21263901*r + 0.71516868*g + 0.07219232*b;
        Z = 0.01933082*r + 0.11919478*g + 0.95053215*b;
        break;
      default:
        throw new Error(`Class CSpace: ${this._type} >> XYZ not implemented`);
    }
    tmp._type = 'XYZ';
    tmp._a[0] = checkPositive(X);
    tmp._a[1] = checkPositive(Y);
    tmp._a[2] = checkPositive(Z);
    return tmp;
  }

  public rgb(): CSpace {
    let tmp: CSpace = new CSpace(this);
    let r = 0;
    let g = 0;
    let b = 0;

    if (typeof(tmp._type) === 'undefined')
      return tmp;
    switch (tmp._type) {
      case 'rgb':
        return tmp;

      case 'xyY':
        tmp = tmp.XYZ();
        // Use XYZ >> rgb
      case 'XYZ':
        // XYZ >> rgb
        // https://en.wikipedia.org/wiki/SRGB
        const X = tmp._a[0];
        const Y = tmp._a[1];
        const Z = tmp._a[2];

        r = gammaMod( 3.24096994*X - 1.53738318*Y - 0.49861076*Z);
        g = gammaMod(-0.96924364*X + 1.87596750*Y + 0.04155506*Z);
        b = gammaMod( 0.05563008*X - 0.20397696*Y + 1.05697151*Z);
        break;
      case 'hsv':
        // hsv >> rgb
        // https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB
        const h = tmp._a[0];
        const s = tmp._a[1];
        const v = tmp._a[2];

        const c = s*v;
        const h60 = h / 60;
        const x = c * (1 - Math.abs(h60 % 2 -1));
        if (h60 < 1) { r = c; g = x; }
        else if (h60 < 2) { r = x; g = c; }
        else if (h60 < 3) { g = c; b = x; }
        else if (h60 < 4) { g = x; b = c; }
        else if (h60 < 5) { r = x; b = c; }
        else { r = c; b = x; }
        const m = v - c;
        r += m;
        g += m;
        b += m;
        break;
      default:
        throw new Error(`Class CSpace: ${this._type} >> rgb not implemented`);
    }
    tmp._a[0] = checkN(r);
    tmp._a[1] = checkN(g);
    tmp._a[2] = checkN(b);
    tmp._type = 'rgb';
    return tmp;
  }

  public hsv(): CSpace {
    let tmp: CSpace = new CSpace(this);

    if (typeof(tmp._type) === 'undefined')
      return tmp;
    switch (tmp._type) {
      case 'hsv':
        return tmp;

      case 'xyY':
        tmp = tmp.rgb();
        break;
      case 'XYZ':
        tmp = tmp.rgb();
        break;
      case 'rgb':
        break;
      default:
        throw new Error(`Class CSpace: ${this._type} >> hsv not implemented`);
    }

    // rgb >> hsv
    // https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
    const r = tmp._a[0];
    const g = tmp._a[1];
    const b = tmp._a[2];

    let xmin = r;
    if (g < xmin) xmin = g;
    if (b < xmin) xmin = b;
    let xmax = r;
    if (g > xmax) xmax = g;
    if (b > xmax) xmax = b;

    const v = xmax;
    const c = xmax - xmin;

    let h: number;
    if (c === 0) h = 0;
    else if (v === r) h = (g - b) / c * 60;
    else if (v === g) h = (b - r) / c * 60 + 120;
    else h = (r - g) / c * 60 + 240;

    let s: number;
    if (c === 0) s = 0;
    else s = c / v;

    tmp._a[0] = checkH(h);
    tmp._a[1] = checkN(s);
    tmp._a[2] = checkN(v);
    tmp._type = 'hsv';
    return tmp;
  }

  // This one is originally intended for 'jest' purpose.
  conv(typeStr: string): CSpace {
    switch(typeStr) {
      case 'rgb': return this.rgb();
      case 'hsv': return this.hsv();
      case 'XYZ': return this.XYZ();
      case 'xyY': return this.xyY();
      case'xy': return this.xy();
    }
    /* istanbul ignore next */
    return this;
  }
}

// Apply reverse of gamma for sRGB
function gamma1Mod(u: number): number {
  u = checkN(u);
  let g = u / 12.92;
  if (u > 0.04045)
    g = ((u + 0.055) / 1.055)**(2.4);
  return g;
}

// Apply gamma for sRGB
function gammaMod(u: number): number {
  u = checkN(u);
  let g = u * 12.92;
  if (u > 0.031308)
    g =  1.055*u**(5/12) - 0.055;
  return g;
}

function checkH(h: number): number {
  while (h < 0)
    h += 360;
  return h%360;
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
