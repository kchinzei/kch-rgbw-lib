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

import { checkWaveLength, checkCIEx, checkCIEy } from './CIE_waveLength';

export type CSpaceTypes =
  'rgb' | 'hsv' | 'XYZ' | 'xyY' | 'xy' | undefined ;

export interface ICSpace {
  // Value check interface
  type: CSpaceTypes;
  a: number[];

  // toll-free quick access: CAUTION! no value check!
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  v: number;
  X: number;
  Y: number;
  Z: number;
  x: number;
  y: number;
  q: number; // Bonus for a[2] of 'xy' ~~ you can use as a free storage.
}

export class CSpace implements ICSpace {
  private _type: CSpaceTypes;
  private _a: number[];

  get r(): number { return this._a[0]; }
  set r(a: number) { this._a[0] = a; }
  get g(): number { return this._a[1]; }
  set g(a: number) { this._a[1] = a; }
  get b(): number { return this._a[2]; }
  set b(a: number) { this._a[2] = a; }
  get h(): number { return this._a[0]; }
  set h(a: number) { this._a[0] = a; }
  get s(): number { return this._a[1]; }
  set s(a: number) { this._a[1] = a; }
  get v(): number { return this._a[2]; }
  set v(a: number) { this._a[2] = a; }
  get X(): number { return this._a[0]; }
  set X(a: number) { this._a[0] = a; }
  get Y(): number { return this.type === 'XYZ'? this._a[1] : this._a[2]; }
  set Y(a: number) { if (this.type === 'XYZ') this._a[1] = a; else this._a[2] = a; }
  get Z(): number { return this._a[2]; }
  set Z(a: number) { this._a[2] = a; }
  get x(): number { return this._a[0]; }
  set x(a: number) { this._a[0] = a; }
  get y(): number { return this._a[1]; }
  set y(a: number) { this._a[1] = a; }
  get q(): number { return this._a[2]; }
  set q(a: number) { this._a[2] = a; }

  get a(): number[] {
    const tmp: number[] = new Array(this._a.length) as number[];
    for (let i=0; i<this._a.length; i++)
      tmp[i] = this._a[i];
    return tmp;
  }
  set a(arr: number[]) {
    if (copyArray(arr, this._a, this.type) === false)
      throw new Error('Class CSpace: Unexpected setter a() parameter.');
    checkValues(this._a, this.type);
  }

  get type(): CSpaceTypes { return this._type; }
  set type(typeTo: CSpaceTypes) {
    // This function changes the type from undefined to else without checking the value of a[] is valid as a colorspace.
    // No other function behaves so.
    if (typeof(this.type) === 'undefined' || typeof(typeTo) === 'undefined') {
      this._type = typeTo;
      return;
    }
    if (this.type !== typeTo) {
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

  constructor(p0?: (CSpaceTypes | CSpace), p1?: (number[] | number)) {
    this._type = undefined;
    this._a = [0, 0, 0];

    if (typeof(p0) === 'undefined' && typeof(p1) === 'undefined') {
      return;
    }
    if (typeof(p0) === 'string' && typeof(p1) === 'object') {
      this._type = p0;
      if (copyArray(p1, this._a, this.type)) {
        checkValues(this._a, this.type);
        return;
      }
    }
    if (typeof(p0) === 'string' && typeof(p1) === 'number') {
      const tmp: CSpace = new CSpace();
      tmp.type = 'XYZ';
      xyzFromWavelength(tmp._a, p1);
      this.copy(tmp.conv(p0));
      return;
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
    this._type = from.type;
    if (copyArray(from._a, this._a, this.type) === false)
      throw new Error('Class CSpace.a(): attempt to copy incompatible size/type of array');
    return this;
  }

  public xy(): CSpace {
    let tmp: CSpace = new CSpace(this);

    if (typeof(tmp.type) === 'undefined')
      return tmp;
    switch (tmp.type) {
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

    if (typeof(tmp.type) === 'undefined')
      return tmp;
    switch (tmp.type) {
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
        throw new Error(`Class CSpace: ${this.type as string} >> xyY not implemented`);
    }

    // XYZ >> xyY
    // https://en.wikipedia.org/wiki/CIE_1931_color_space#CIE_xy_chromaticity_diagram_and_the_CIE_xyY_color_space
    const X = tmp.X;
    const Y = tmp.Y;
    const Z = tmp.Z;
    const sumXYZ = X + Y + Z;

    tmp._type = 'xyY';
    if (sumXYZ === 0) {
      tmp.x = tmp.y = tmp.Y = 0;
    } else {
      tmp.x = X/sumXYZ;
      tmp.y = Y/sumXYZ;
      tmp.Y = Y;
    }
    return tmp;
  }

  public XYZ(): CSpace{
    let tmp: CSpace = new CSpace(this);
    let X = 0;
    let Y = 0;
    let Z = 0;

    if (typeof(tmp.type) === 'undefined')
      return tmp;
    switch (tmp.type) {
      case 'XYZ':
        return tmp;

      case 'xyY':
        // xyY >> XYZ
        // https://en.wikipedia.org/wiki/CIE_1931_color_space
        const x = tmp.x;
        const y = tmp.y;
        Y = tmp.Y;
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
        const r = gamma1Mod(checkN(tmp.r));
        const g = gamma1Mod(checkN(tmp.g));
        const b = gamma1Mod(checkN(tmp.b));

        X = 0.41239080*r + 0.35758434*g + 0.18048079*b;
        Y = 0.21263901*r + 0.71516868*g + 0.07219232*b;
        Z = 0.01933082*r + 0.11919478*g + 0.95053215*b;
        break;
      default:
        throw new Error(`Class CSpace: ${this.type as string} >> XYZ not implemented`);
    }
    tmp._type = 'XYZ';
    tmp.X = checkPositive(X);
    tmp.Y = checkPositive(Y);
    tmp.Z = checkPositive(Z);
    return tmp;
  }

  public rgb(): CSpace {
    let tmp: CSpace = new CSpace(this);
    let r = 0;
    let g = 0;
    let b = 0;

    if (typeof(tmp.type) === 'undefined')
      return tmp;
    switch (tmp.type) {
      case 'rgb':
        return tmp;

      case 'xyY':
        tmp = tmp.XYZ();
        // Use XYZ >> rgb
      case 'XYZ':
        // XYZ >> rgb
        // https://en.wikipedia.org/wiki/SRGB
        const X = tmp.X;
        const Y = tmp.Y;
        const Z = tmp.Z;

        r = gammaMod( 3.24096994*X - 1.53738318*Y - 0.49861076*Z);
        g = gammaMod(-0.96924364*X + 1.87596750*Y + 0.04155506*Z);
        b = gammaMod( 0.05563008*X - 0.20397696*Y + 1.05697151*Z);
        break;
      case 'hsv':
        // hsv >> rgb
        // https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB
        const h = tmp.h;
        const s = tmp.s;
        const v = tmp.v;

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
        throw new Error(`Class CSpace: ${this.type as string} >> rgb not implemented`);
    }
    tmp._type = 'rgb';
    tmp.r = checkN(r);
    tmp.g = checkN(g);
    tmp.b = checkN(b);
    return tmp;
  }

  public hsv(): CSpace {
    let tmp: CSpace = new CSpace(this);

    if (typeof(tmp.type) === 'undefined')
      return tmp;
    switch (tmp.type) {
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
        throw new Error(`Class CSpace: ${this.type as string} >> hsv not implemented`);
    }

    // rgb >> hsv
    // https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
    const r = tmp.r;
    const g = tmp.g;
    const b = tmp.b;

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

    tmp._type = 'hsv';
    tmp.h = checkH(h);
    tmp.s = checkN(s);
    tmp.v = checkN(v);
    return tmp;
  }

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

function checkValues(arr: number[], typ: CSpaceTypes): number[] {
  switch (typ) {
    case 'rgb':
      arr[0] = checkN(arr[0]);
      arr[1] = checkN(arr[1]);
      arr[2] = checkN(arr[2]);
      break;
    case 'hsv':
      arr[0] = checkH(arr[0]);
      arr[1] = checkN(arr[1]);
      arr[2] = checkN(arr[2]);
      break;
    case 'XYZ':
      arr[0] = checkPositive(arr[0]);
      arr[1] = checkPositive(arr[1]);
      arr[2] = checkPositive(arr[2]);
      break;
    case 'xyY':
      arr[0] = checkCIEx(arr[0]);
      arr[1] = checkCIEy(arr[1]);
      arr[2] = checkPositive(arr[2]);
      break;
    case 'xy':
      arr[0] = checkCIEx(arr[0]);
      arr[1] = checkCIEy(arr[1]);
      break;
  }
  return arr;
}

function copyArray(from: number[], to: number[], typ: CSpaceTypes): boolean {
  const jLen = Math.min(from.length, 3);
  if ((jLen === 2 && typ === 'xy') || jLen === 3) {
    for (let j=0; j<jLen; j++) {
      to[j] = from[j];
    }
    return true;
  }
  return false;
}

/*
  The CIE XYZ color matching functions
  https://en.wikipedia.org/wiki/CIE_1931_color_space
  THIS EQUATION HAS SOME DISPARITY FROM KNOWN WAVELENGTH => xyY CONVERSION.
*/
function gaussian(x: number, alpha: number, mu: number, sigma1: number, sigma2: number): number {
  const squareRoot = (x - mu) / (x < mu ? sigma1 : sigma2);
  return alpha * Math.exp( -(squareRoot * squareRoot)/2 );
}

function xyzFromWavelength(xyz: number[], wavelength: number): void {
  wavelength = checkWaveLength(wavelength) * 10; // We need it in Ångström
  xyz[0] = gaussian(wavelength,  1.056, 5998, 379, 310)
         + gaussian(wavelength,  0.362, 4420, 160, 267)
         + gaussian(wavelength, -0.065, 5011, 204, 262);
  xyz[1] = gaussian(wavelength,  0.821, 5688, 469, 405)
         + gaussian(wavelength,  0.286, 5309, 163, 311);
  xyz[2] = gaussian(wavelength,  1.217, 4370, 118, 360)
         + gaussian(wavelength,  0.681, 4590, 260, 138);
}
