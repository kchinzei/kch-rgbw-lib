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
  readonly xLED: LEDChip; // Extra LED such as white, amber
  readonly LED: LEDChip[];
  readonly nLED: number;
  readonly color: CSpace;
  readonly brightness: number; // [0,1]
}

export class RGBWLED implements IRGBWLED {
  private _LED: LEDChip[];
  private _name: string;
  private _xyz: CSpace;
  private _b: number;
  private _LEDcontour: CIEnmxyType[];

  get rLED(): LEDChip { return this.LED[0]; }
  get gLED(): LEDChip { return this.LED[1]; }
  get bLED(): LEDChip { return this.LED[2]; }
  get xLED(): LEDChip { return this.LED[3]; }
  get LED(): LEDChip[] { return this._LED; }
  get nLED(): number { return (typeof(this.LED[3]) === 'undefined')? 3 : this.LED.length; }
  get name(): string { return this._name; }
  set name(s: string) { this._name = s; }
  get brightness(): number { return this._b; }
  set brightness(b: number) { this._b = checkBrightness(b); }
  get color(): CSpace { return this._xyz; }
  public setColor(c: CSpace): void {
    const xyY: CSpace = c.xyY();
    const xy: CIEnmxyType = CIEfitxy2List(xyY.a[0], xyY.a[1], this._LEDcontour);
    this.updateLEDs(xy.x, xy.y, xyY.a[2]);
  }

  constructor(rLED: LEDChip, gLED: LEDChip, bLED: LEDChip, xLED?: LEDChip) {
    this._LED = new Array(4) as LEDChip[];
    this._LED[0] = rLED;
    this._LED[1] = gLED;
    this._LED[2] = bLED;
    if (typeof(xLED) === 'object') this._LED[3] = xLED;
    this._name = '';
    this._xyz = new CSpace('XYZ', D65White);
    this._b = 0;
    this._LEDcontour = makeLEDcontour(this.LED);
  }

  public addLED(led: LEDChip) {
    this.LED.push(led);
    this._LEDcontour = makeLEDcontour(this.LED);
    // this.updateLEDs(xy.x, xy.y, xyY.a[2]);
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

function makeLEDcontour(LED: LEDChip[]): CIEnmxyType[] {
  // Populate LEDcountour
  const aTmp: CIEnmxyType[] = [ {x: LED[0].x, y: LED[0].y, nm: 0},
                                {x: LED[1].x, y: LED[1].y, nm: 0},
                                {x: LED[2].x, y: LED[2].y, nm: 0},
                                {x: LED[0].x, y: LED[0].y, nm: 0} ]; // <== Last one is LED[0]. It's intentional.
  // if LED[3>] is outside triangle of RGB?
  for (let l=3; l<LED.length; l++) {
    if (!checkCIExyInList(LED[l].x, LED[l].y, aTmp)) {
      // Outside the polygon
      // How we should order them?
      // Change the order of LED[l] in RGB polygon, and select the order that maximize
      // the polygon area.
      const areas: number[] = new Array(l) as number[];
      for (let i=0; i<l; i++)
        areas[i] = 0;
      const xled: CIEnmxyType = {x: LED[l].x, y: LED[l].y, nm: 0};
      aTmp.splice(0, 0, xled); // Insert xled after the first element of aTmp
      for (let i=0; i<l; i++) {
        // Sum area.
        for (let j=0; j<l-1; j++) {
          // Obtain outer vector using LED[0] as the origin.
          // It's positive when vertices are in ccw order.
          const x0 = aTmp[j+1].x - aTmp[0].x;
          const x1 = aTmp[j+2].x - aTmp[0].x;
          const y0 = aTmp[j+1].y - aTmp[0].y;
          const y1 = aTmp[j+2].y - aTmp[0].y;
          areas[i] += (x0*y1 - x1*y0);
        }
        // Put xLED one after, when xLED is not at l-1.
        if (i < l-2) {
          const tmp: CIEnmxyType = aTmp[i+1];
          aTmp[i+1] = aTmp[i+2];
          aTmp[i+2] = tmp;
          // At the end of i-loop, aTmp is ordered as
          // rLED, gLED, bLED, ... xLED, rLED
          // [0],  [1],  [2],  ... [l-1], [l]
        }
      }
      // Find max areas
      let iMax = 0;
      let aMax = 0;
      for (let i=0; i<l; i++) {
        if (aMax < areas[i]) {
          aMax = areas[i];
          iMax = i;
        }
      }
      // Move xLED to aTmp[iMax+1]. All following ones go one behind.
      for (let i=l-1; i>iMax+1; i--) {
        aTmp[i] = aTmp[i-1];
      }
      aTmp[iMax+1] = xled;
    }
  }
  return aTmp;
}
