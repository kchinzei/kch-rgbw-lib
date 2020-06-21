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

import { CSpace, CSpaceR } from './CSpace';
import { checkCIExyInList, CIEfitxy2List } from './waveLength';
import { LEDChip } from './LEDChip';

// eslint-disable-next-line @typescript-eslint/naming-convention
const D65White: number[] = [ 0.3155, 0.3270, 0 ] ; // D65 White; https://en.wikipedia.org/wiki/SRGB

export interface IRGBWLED {
  name: string;
  color: CSpace;
  brightness: number; // [0,1]
  readonly rLED: LEDChip;
  readonly gLED: LEDChip;
  readonly bLED: LEDChip;
  readonly xLED: LEDChip; // Extra LED such as white, amber
  readonly LED: LEDChip[];
  readonly nLED: number;
}

export class RGBWLED extends CSpaceR implements IRGBWLED {
  private _LED: LEDChip[];
  private _name: string;
  private _maxB: number;
  private _gamutContour: CSpace[];

  // eslint-disable-next-line @typescript-eslint/naming-convention
  get LED(): LEDChip[] { return this._LED; }
  get rLED(): LEDChip { return this.LED[0]; }
  get gLED(): LEDChip { return this.LED[1]; }
  get bLED(): LEDChip { return this.LED[2]; }
  get xLED(): LEDChip { return this.LED[3]; }
  get nLED(): number { return this.LED.length; }
  get name(): string { return this._name; }
  set name(s: string) { this._name = s; }
  get brightness(): number { return this.Y / this._maxB; }
  set brightness(b: number) {
    const xyY: CSpace = new CSpace(this);
    xyY.Y = checkBrightness(b) * this._maxB;
    this.updateLEDs(xyY);
  }
  get color(): CSpace {
    const c: CSpace = new CSpace(this);
    return c;
  }
  set color(c: CSpace) {
    let c1: CSpace = new CSpace(c);
    if (c1.type !== 'xy')
      c1 = c1.xyY();
    const c2: CSpace = CIEfitxy2List(c1, this._gamutContour);
    if (c.type !== 'xyY' && c.type !== 'XYZ' && c.type !== 'xy')
      c2.Y = this.brightness;
    this.updateLEDs(c2);
  }

  constructor(rLED: LEDChip, gLED: LEDChip, bLED: LEDChip, xLED?: LEDChip) {
    super('xyY', D65White);
    const nLED = (typeof(xLED) === 'object')? 4:3;
    this._LED = new Array(nLED) as LEDChip[];
    this._LED[0] = rLED;
    this._LED[1] = gLED;
    this._LED[2] = bLED;
    if (nLED === 4)
      this._LED[3] = xLED as LEDChip;
    this._maxB = 0;
    for (const l of this._LED)
      this._maxB += l.maxBrightness;
    this._name = '';
    this._gamutContour = makeGamutContour(this.LED);
  }

  public addLED(led: LEDChip): void {
    this.LED.push(led);
    this._maxB += led.maxBrightness;
    this._gamutContour = makeGamutContour(this.LED);
    this.updateLEDs(this);
  }

  private updateLEDs(c: CSpace): void {
    // Assume that c is already in the gamut
    if (c.type !== 'xy')
      c = c.xyY();
    switch (this.nLED) {
      case 3:
      case 4:
      default:
        // ToDo
        // throw new Error("updateLED(): sorry, we will implement");
    }
    // ToDo remove when implement all
    this.x = c.x;
    this.y = c.y;
    if (c.type === 'xyY')
      this.Y = c.Y;
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
