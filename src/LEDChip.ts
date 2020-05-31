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

import { checkWaveLength, checkCIEx, checkCIEy, CIEnm2x, CIEnm2y, CIExy2nm } from './CIE_waveLength';
import { checkColorTemperature, CIEk2x, CIEk2y, CIExy2k}  from './CIE_colorTemperature';

export type LEDChipTypes =
  'LED_R' | 'LED_G' | 'LED_B' | 'LED_W' | 'LED_UV' | 'LED_Amber' | 'LED_Other' | undefined ;

export interface ILEDChip {
  readonly LEDChipType: LEDChipTypes;
  readonly waveLength: (number | undefined);
  readonly colorTemperature: (number | undefined);
  readonly maxBrightness: number;
  readonly x: number;
  readonly y: number;
  brightness: number;
  name: string;
}

export class LEDChip implements ILEDChip {
  private _LEDChipType: LEDChipTypes;
  private _waveLength: (number | undefined);
  private _colorTemperature: (number | undefined);
  private _maxBrightness: number;
  private _x: number;
  private _y: number;
  private _brightness: number;
  private _name: string;

  get LEDChipType(): LEDChipTypes { return this._LEDChipType; }
  get waveLength(): (number | undefined) { return this._waveLength; }
  get colorTemperature(): (number | undefined) { return this._colorTemperature; }
  get maxBrightness(): number { return this._maxBrightness; }
  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get brightness(): number { return this._brightness; }
  set brightness(b: number) {
    this._brightness = checkBrightness(b, this.maxBrightness);
  }
  get name(): string { return this._name; }
  set name(n: string) { this._name = n; }

  public setMaxBrightness(b: number): void { this._maxBrightness = checkMaxBrightness(b); }
  public setX(x: number): void { this._x = checkCIEx(x); }
  public setY(y: number): void { this._y = checkCIEy(y); }

  public setLEDChipType(t: LEDChipTypes): void { this._LEDChipType = t; }

  public setWaveLength(w: number | undefined): void {
    switch (this.LEDChipType) {
      case 'LED_W':
        this._waveLength = undefined;
        break;
      case 'LED_R':
      case 'LED_G':
      case 'LED_B':
      case 'LED_UV':
      default:
        if (typeof(w) === 'undefined')
          this._waveLength = w;
        else
          this._waveLength = checkWaveLength(w);
        break;
    }
  }

  public setColorTemperature(t: number | undefined): void {
    switch (this.LEDChipType) {
      case 'LED_W':
        if (typeof(t) === 'undefined')
          this._colorTemperature = t;
        else
          this._colorTemperature = checkColorTemperature(t);
        break;
      default:
        this._colorTemperature = undefined;
    }
  }

  /*
    Different pairs of parameters work as following:
    c1: constructor(LEDChipType, name, waveLength, maxBrightness); // Color LEDs by wave length
    c2: constructor(LEDChipType, name, colorTemperature, maxBrightness); // White LEDs by tempetarure
    c3: constructor(LEDChipType, name, x, y, maxBrightness); // If you know CIE(xy). It's most precise.
    c4: constructor(); // empty initialization.
  */
  constructor(LEDChipType?: LEDChipTypes, name?: string, arg1?: number, arg2?: number, arg3?: number) {
    this._LEDChipType = LEDChipType;
    this._waveLength = undefined;
    this._colorTemperature = undefined;
    this._maxBrightness = 0;
    this._x = 0;
    this._y = 0;
    this._brightness = 0;
    this._name = typeof(name) === 'string'? name:'';

    if (typeof(LEDChipType) === 'undefined') {
      /* istanbul ignore else */
      if (typeof(arg1) === 'undefined' &&
	  typeof(arg2) === 'undefined' &&
	  typeof(arg3) === 'undefined' &&
	  typeof(name) === 'undefined') {
        // case c4
        return;
      }
    } else {
      if (typeof(arg3) !== 'undefined') {
        // case c3
        this.setX(arg1 as number);
        this.setY(arg2 as number);
        this.setMaxBrightness(arg3);
        switch (LEDChipType) {
          case 'LED_W':
            this.setColorTemperature(CIExy2k(this.x, this.y));
	    break;
	  default:
	    this.setWaveLength(CIExy2nm(this.x, this.y));
	    break;
        }
        return;
      } else if (typeof(arg1) !== 'undefined' && typeof(arg2) !== 'undefined') {
        this.setMaxBrightness(arg2);
        switch (LEDChipType) {
          case 'LED_W':
            // c2: colorTemperature given in arg1.
            this.setColorTemperature(arg1);
            this.setX(CIEk2x(arg1));
            this.setY(CIEk2y(arg1));
            break;
	  default:
            // c1: waveLength specified in arg1
            this.setWaveLength(arg1);
            this.setX(CIEnm2x(arg1));
            this.setY(CIEnm2y(arg1));
            break;
        }
        return;
      }
    }
    // Never should come here. Perhaps you didn't follow above c1-c4.
    throw new Error('Class LEDChip: Unexpected contructor parameters');
  }
}

// CREE MCE4CT-A2-0000-00A4AAAB1 and measurement found in AN1857 by MicroChip.
// http://ww1.microchip.com/downloads/jp/AppNotes/jp572250.pdf
export const LEDChipTypR: LEDChip = new LEDChip('LED_R', 'Typical R', 0.6857, 0.3143, 30.6);
export const LEDChipTypG: LEDChip = new LEDChip('LED_G', 'Typical G', 0.2002, 0.6976, 67.2);
export const LEDChipTypB: LEDChip = new LEDChip('LED_B', 'Typical B', 0.1417, 0.0618, 8.2);
export const LEDChipTypW: LEDChip = new LEDChip('LED_W', 'Typical W', 0.3816, 0.3678, 80);

// These values are from RGBW Chip LC-S5050-04004-RGBW, Epistar
export const LEDChipEpistarR: LEDChip = new LEDChip('LED_R',  'LC-S5050-04004-RGBW, Epistar', 625, 2.5);
export const LEDChipEpistarG: LEDChip = new LEDChip('LED_G',  'LC-S5050-04004-RGBW, Epistar', 520, 3.5);
export const LEDChipEpistarB: LEDChip = new LEDChip('LED_B',  'LC-S5050-04004-RGBW, Epistar', 470, 1.5);
export const LEDChipEpistarWW: LEDChip = new LEDChip('LED_W', 'LC-S5050-04004-RGBW, Epistar', 2600, 6.5);
export const LEDChipEpistarCW: LEDChip = new LEDChip('LED_W', 'LC-S5050-04004-RGBW, Epistar', 6500, 6.5);

function checkBrightness(b: number, max: number): number {
  if (b < 0) b = 0;
  if (b > max) b = max;
  return b;
}

function checkMaxBrightness(b: number): number {
  // It can be any nonzero positive.
  if (b <= 0) b = 1.0;
  return b;
}
