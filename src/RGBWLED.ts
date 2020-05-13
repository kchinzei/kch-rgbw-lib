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

import { checkCIExyInList, CIEfitxy2List, CIEnmxyType } from './CIE_waveLength';
import { CSpace } from './CSpace';
import { LEDChip } from './LEDChip';

const D65White: number[] = [ 0.9505, 1, 1.0890 ] ; // D65 White in CIE XYZ; https://en.wikipedia.org/wiki/SRGB

// Values from https://en.wikipedia.org/wiki/SRGB
/*
const sRGBRx = 0.6400;
const sRGBRy = 0.3300;
const sRGBGx = 0.3000;
const sRGBGy = 0.6000;
const sRGBBx = 0.1500;
const sRGBBy = 0.0600;
const sRGBWx = 0.3127;
const sRGBWy = 0.3290;
*/

export interface IRGBWLED {
  name: string;
  readonly rLED: LEDChip;
  readonly gLED: LEDChip;
  readonly bLED: LEDChip;
  readonly xLED: LEDChip | undefined; // Extra LED such as white, amber

  readonly color: CSpace;
  readonly brightness: number; // [0,1]
};

export class RGBWLED implements IRGBWLED {
  private _rLED: LEDChip;
  private _gLED: LEDChip;
  private _bLED: LEDChip;
  private _xLED: LEDChip | undefined;
  private _name: string;
  private _xyz: CSpace;
  private _b: number;
  private _LEDcontour: CIEnmxyType[];

  get rLED(): LEDChip { return this._rLED; }
  get gLED(): LEDChip { return this._gLED; }
  get bLED(): LEDChip { return this._bLED; }
  get xLED(): LEDChip|undefined { return this._xLED; }
  get name(): string { return this._name; }
  set name(s: string) { this._name = s; }
  get brightness(): number { return this._b; }
  set brightness(b: number) { this._b = checkBrightness(b); }
  get color(): CSpace { return this._xyz; }
  public setColor(c: CSpace): void {
    const xyY: CSpace = c.xyY();
    const xy: CIEnmxyType = CIEfitxy2List(xyY.a[0], xyY.a[0], this._LEDcontour);
    this.updateLEDs(xy.x, xy.y, xyY.a[2]);
  }

  constructor(rLED: LEDChip, gLED: LEDChip, bLED: LEDChip, xLED?: LEDChip) {
    this._rLED = rLED;
    this._gLED = gLED;
    this._bLED = bLED;
    this._xLED = xLED;
    this._name = '';
    this._xyz = new CSpace('XYZ', D65White);
    this._b = 0;
    this._LEDcontour = makeLEDcontour(rLED, gLED, bLED, xLED);
  }

  private updateLEDs(x: number, y: number, Y: number): void {
    const xyY: CSpace = new CSpace('xyY', [x, y, Y]);
    this._xyz.copy(xyY);
    // TBC it's not smart at all!
  }
}

function checkBrightness(b: number): number {
  if (b < 0) b = 0;
  if (b > 1) b = 1;
  return b;
}

function makeLEDcontour(rLED: LEDChip, gLED: LEDChip, bLED: LEDChip, xLED?: LEDChip): CIEnmxyType[] {
  // Populate LEDcountour
  const aTmp: CIEnmxyType[] = [ {x: rLED.x, y: rLED.y, nm: 0},
                                {x: gLED.x, y: gLED.y, nm: 0},
                                {x: bLED.x, y: bLED.y, nm: 0},
                                {x: rLED.x, y: rLED.y, nm: 0} ];
  if (typeof(xLED) === 'undefined')  {
    return aTmp;
  } else {
    // if xLED is outside trianble of RGB?
    if (checkCIExyInList(xLED.x, xLED.y, aTmp)) {
      // Inside the triangle
      return aTmp;
    } else {
      // xLED is outside the triangle. How we should order them?
      // Change the order of xLED in RGB triangle, and select the order that maximize
      // the polygon area.
      const areas: number[] = [ 0, 0, 0　];
      const xled: CIEnmxyType = {x: xLED.x, y: xLED.y, nm: 0};
      aTmp.splice(2, 0, xled); // at the end
      for (let i=0; i<3; i++) {
        // Sum area.
        for (let j=0; j<2; j++) {
          const x0 = aTmp[j+1].x - aTmp[0].x;
          const x1 = aTmp[j+2].x - aTmp[0].x;
          const y0 = aTmp[j+1].y - aTmp[0].y;
          const y1 = aTmp[j+2].y - aTmp[0].y;
          // Obtain outer vector r,g,b,x using r as the origin.
          // It's positive when vertices are in ccw order.
          areas[i] += (x0*y1 - x1*y0);
        }
        // Swap xLED...
        const tmp: CIEnmxyType = aTmp[3-i];
        aTmp[3-i] = aTmp[2-i];
        aTmp[2-i] = tmp;
        // At the end of i-loop, aTmp is ordered as
        // xLED, rLED, gLED, bLED.
      }
      // Find max areas
      let iMax = 0;
      let aMax = 0;
      for (let i=0; i<3; i++) {
        if (aMax < areas[i]) {
          aMax = areas[i];
          iMax = i;
        }
      }
      // Move xLED to according to iMax.
      for (let i=0; i<3-iMax; i++) {
        const tmp: CIEnmxyType = aTmp[i];
        aTmp[i] = aTmp[i+1];
        aTmp[i+1] = tmp;
      }
    }
  }
  return aTmp;
}
