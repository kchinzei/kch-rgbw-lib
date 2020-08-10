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
  Composite LED class library

  Make Asayake to Wake Project
  Kiyo Chinzei
  https://github.com/kchinzei/kch-rgbw-lib
*/

import { CSpace } from './CSpace';
import { LEDChip } from './LEDChip';
import { checkCIExyInList, CIEfitxy2List } from './waveLength';
import { makeSolverMatrix, alpha2XYZ, XYZ2Alpha, normalize } from './solver';

// eslint-disable-next-line @typescript-eslint/naming-convention
const D65White: number[] = [ 0.3127, 0.3290, 1 ] ; // ITU Rec. 709 D65 White; https://en.wikipedia.org/wiki/SRGB

export interface IRGBWLED {
  name: string;
  color: CSpace;
  brightness: number; // [0,1]
  readonly maxLuminance: number;  // Sum of maxLuminance of all LEDs
  readonly LED: LEDChip[];
}

export class RGBWLED extends CSpace implements IRGBWLED {
  private _LED: LEDChip[];
  private _name: string;
  private _gamutContour: CSpace[];
  private _afwd: number[][];
  private _ainv: number[][];
  private _nvecs: number[][];
  private _w: number[];

  // eslint-disable-next-line @typescript-eslint/naming-convention
  get LED(): LEDChip[] { return this._LED; }
  get name(): string { return this._name; }
  set name(s: string) { this._name = s; }
  get maxLuminance(): number {
    let maxB = 0;
    for (const l of this._LED)
      maxB += l.maxLuminance;
    return maxB;
  }
  get brightness(): number {
    return this.Y / this.maxLuminance;
  }
  set brightness(b: number) {
    const xyY: CSpace = new CSpace(this);
    xyY.Y = checkBrightness(b) * this.maxLuminance;
    this.updateLEDs(xyY);
  }
  get color(): CSpace {
    const c: CSpace = new CSpace(this);
    return c;
  }
  set color(c: CSpace) {
    // 1. Convert c to xyY or xy.
    let c1: CSpace;
    if (c.type === 'xy') {
      c1 = new CSpace('xyY', c.a);
    } else {
      c1 = c.xyY();
    }

    // 2. Fit c1 to the gamut.
    c1 = CIEfitxy2List(c1, this._gamutContour);

    // 3. When color didn't have luminance (xy, RGB or HSV), use current luminance.
    if (c.type !== 'xyY' && c.type !== 'XYZ')
      c1.Y = this.Y;

    // 4. Do it.
    this.updateLEDs(c1);
  }

  public maxLuminanceAt(c: CSpace): number {
    // 1. Convert c to xyY
    let c1: CSpace;
    if (c.type === 'xy') {
      c1 = new CSpace('xyY', c.a);
    } else {
      c1 = c.xyY();
    }

    // 2. Set Y as slightly larger than max
    c1.Y = this.maxLuminance * 1.05;

    // Solve
    const { alpha, feasible } = XYZ2Alpha(c1.XYZ().a, this._w, this._ainv, this._nvecs);

    if (feasible) {
      const XYZ = this.brightness2Color(normalize(alpha));
      return XYZ.Y;
    } else {
      return -1;
    }
  }

  public maxBrightnessAt(c: CSpace): number {
    const maxL = this.maxLuminanceAt(c);
    if (maxL > 0)
      return maxL / this.maxLuminance;
    else
      return -1;
  }

  constructor(name: string, lList: LEDChip[]) {
    super('xyY', D65White);
    if (lList.length < 3)
      throw new Error('RGBWLED() needs at least 3 LEDs');

    this._name = name;
    this._LED = new Array(lList.length) as LEDChip[];
    for (let i=0; i<lList.length; i++)
      this._LED[i] = lList[i];

    this._gamutContour = [];
    this._afwd = [];
    this._ainv = [];
    this._nvecs = [];
    this._w = [];

    if (!this.setup()) {
      throw new Error('RGBWLED() needs at least 3 LEDs in different colors');
    }
  }

  public push(led: LEDChip): void {
    this.LED.push(led);
    this.setup();
  }

  public brightness2Color(bList: number[]): CSpace {
    if (bList.length !== this.LED.length)
      throw new Error('brightness2Color() Length of bList[] should be equal to number of LEDs.');

    const xyz: number[] = alpha2XYZ(bList, this._afwd);
    const c: CSpace = new CSpace('XYZ', xyz);
    return c.xyY();
  }

  private updateLEDs(c: CSpace): boolean {
    // Assume that c is already xyY in the gamut
    const { alpha, feasible } = XYZ2Alpha(c.XYZ().a, this._w, this._ainv, this._nvecs);

    /* istanbul ignore else */
    if (feasible) {
      const alpha2 = normalize(alpha);
      this.x = c.x;
      this.y = c.y;
      this.Y = 0;
      for (let i=0; i<this.LED.length; i++) {
        this.LED[i].brightness = alpha2[i]; // update each LED.
        this.Y += alpha2[i] * this.LED[i].maxLuminance;
      }
    }
    return feasible;
  }

  private setup(): boolean {
    function makeXYZMat(lList: LEDChip[]): number[][] {
      const aa: number[][] = new Array(lList.length) as number[][];
      for (let i=0; i<lList.length; i++) {
        aa[i] = lList[i].XYZ().a;
      }
      return aa;
    }

    function makeWVec(lList: LEDChip[]): number[] {
      const w: number[] = new Array(lList.length) as number[];
      for (let i=0; i<lList.length; i++) {
        w[i] = lList[i].maxW;
      }
      return w;
    }

    this._gamutContour = makeGamutContour(this.LED);
    const {rank, a, ainv, nvecs} = makeSolverMatrix(makeXYZMat(this._LED));
    if (rank < 3)
      return false;
    this._afwd = a;
    this._ainv = ainv;
    this._nvecs = nvecs;
    this._w = makeWVec(this._LED);
    this.updateLEDs(this);
    return true;
  }
}

function checkBrightness(b: number): number {
  if (b < 0) b = 0;
  if (b > 1) b = 1;
  return b;
}

/*
  Gamut contour is a list of CSpace that defines the gamut that can be represented
  by the compisite of colors in the cList.
*/
export function makeGamutContour(cList: CSpace[]): CSpace[] {
  /* istanbul ignore next */
  if (cList.length < 3)
    throw new Error('makeGamutContour() needs at least 3 items in cList[]');

  // Populate initial triangle.
  const gList: CSpace[] = [cList[0], cList[1], cList[2], cList[0]];
  // Examine the order of initial three.
  const ccw: number = (crossproduct(cList[0], cList[1], cList[2]) >= 0)? 1 : -1;

  // if cList[3>] is outside polygon
  for (let l=3, m=3; m<cList.length; m++) {
    const xC = cList[m];
    if (!checkCIExyInList(xC, gList)) {
      // Outside the polygon
      // How we should order them?
      // Change the order of xC in polygon, and select the order that maximize
      // the polygon area.
      const areas: number[] = new Array(l) as number[];
      for (let i=0; i<l; i++)
        areas[i] = 0;
      gList.splice(1, 0, xC); // Insert xC after the first element of gList

      /*
      let debugstr: string = '1: ';
      for (let g of gList) {
        const p: LEDChip = g as LEDChip;
        debugstr += p.name + ', ';
      }
      */

      for (let i=0; i<l; i++) {
        // Sum area.
        for (let j=0; j<l-1; j++) {
          // Obtain cross product using LED[0] as the origin.
          areas[i] += crossproduct(gList[0], gList[j+1], gList[j+2]) * ccw;
        }
        // Put xC one after, when xC is not at l-1.
        if (i < l-1) {
          const tmp = gList[i+1];
          gList[i+1] = gList[i+2];
          gList[i+2] = tmp;
          // At the end of i-loop, gList is ordered as
          //  R,   G,   B,  ...  X,     R
          // [0], [1], [2], ... [l-1], [l]
        }
      }
      /*
      debugstr += ' 2: ';
      for (let g of gList) {
        const p: LEDChip = g as LEDChip;
        debugstr += p.name + ', ';
      }
      */

      // Find max areas
      let iMax = 0;
      let aMax = 0;
      for (let i=0; i<l; i++) {
        if (aMax < areas[i]) {
          aMax = areas[i];
          iMax = i;
        }
      }
      // Move X to gList[iMax+1]. All following ones go one behind.
      for (let i=l; i>iMax+1; i--) {
        gList[i] = gList[i-1];
      }
      gList[iMax+1] = xC;

      /*
      debugstr += ' 3: ';
      for (let g of gList) {
        const p: LEDChip = g as LEDChip;
        debugstr += p.name + ', ';
      }
      console.log(debugstr);
      */

      l++;
    }
  }
  return gList;

  function crossproduct(p0: CSpace, p1: CSpace, p2: CSpace): number {
    const x1 = p1.x - p0.x;
    const x2 = p2.x - p0.x;
    const y1 = p1.y - p0.y;
    const y2 = p2.y - p0.y;
    return x1*y2 - x2*y1;
  }
}
