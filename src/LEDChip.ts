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
  https://github.com/kchinzei/raspi-pca9685-pwm
*/

import { checkWaveLength, checkCIEx, checkCIEy, CIEnm2x, CIEnm2y, CIExy2nm } from './CIE_waveLength';
import { checkColorTemperature, CIEk2x, CIEk2y }  from './CIE_colorTemperature';

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

export type LEDChipTypes =
  'LED_R' | 'LED_G' | 'LED_B' | 'LED_W' | 'LED_WW' | 'LED_CW' | 'LED_UV' | undefined ;

export interface ILEDChip {
  readonly LEDChipType: LEDChipTypes;
  readonly waveLength: (number | undefined);
  readonly colorTemperature: (number | undefined);
  readonly maxBrightness: number;
  readonly x: number;
  readonly y: number;
  brightness: number;
  name: string;
};

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

  setMaxBrightness(b: number): void { this._maxBrightness = checkMaxBrightness(b); }
  setX(x: number): void { this._x = checkCIEx(x); }
  setY(y: number): void { this._y = checkCIEy(y); }

  setLEDChipType(t: LEDChipTypes): void { this._LEDChipType = t; }

  setWaveLength(w: number | undefined): void {
    switch (this.LEDChipType) {
      case 'LED_R':
      case 'LED_G':
      case 'LED_B':
      case 'LED_UV':
        if (typeof(w) === 'undefined')
          this._waveLength = w;
        else
          this._waveLength = checkWaveLength(w);
        break;
      default:
        this._waveLength = undefined;
    }
  }

  setColorTemperature(t: number | undefined): void {
    switch (this.LEDChipType) {
      case 'LED_W':
      case 'LED_WW':
      case 'LED_CW':
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
    constructor(LEDChipType, waveLength, maxBrightness); // c1; Color LEDs by wave length
    constructor(LEDChipType, colorTemperature, maxBrightness); // c2; White LEDs by tempetarure
    constructor(LEDChipType, x, y, maxBrightness); // c3; If you know CIE(xy)
    constructor(); // c4; empty initialization.
  */
  constructor(LEDChipType?: LEDChipTypes, arg1?: number, arg2?: number, arg3?: number) {
    this._LEDChipType = undefined;
    this._waveLength = undefined;
    this._colorTemperature = undefined;
    this._maxBrightness = 1.0;
    this._x = 0;
    this._y = 0;
    this._brightness = 0;
    this._name = '';

    if (typeof(LEDChipType) !== 'undefined' && typeof(arg1) !== 'undefined' && typeof(arg2) !== 'undefined') {
      switch (LEDChipType) {
        case 'LED_R':
        case 'LED_G':
        case 'LED_B':
        case 'LED_UV':
          this.setLEDChipType(LEDChipType);
          this.setColorTemperature(0);
          if (typeof(arg3) === 'undefined') {
            // c1: waveLength specified in arg1
            this.setWaveLength(arg1);
            this.setMaxBrightness(arg2);
            this.setX(CIEnm2x(arg1));
            this.setY(CIEnm2y(arg1));
          } else {
            // c3: CIE(x,y) given in arg1, arg2.
            this.setMaxBrightness(arg3);
            this.setX(arg1);
            this.setY(arg2);
            this.setWaveLength(CIExy2nm(arg1, arg2));
          }
          break;
        case 'LED_W':
        case 'LED_WW':
        case 'LED_CW':
          // c2: colorTemperature given in arg1.
          this.setLEDChipType(LEDChipType);
          this.setWaveLength(0);
          this.setColorTemperature(arg1);
          this.setMaxBrightness(arg2);
          this.setX(CIEk2x(arg1));
          this.setY(CIEk2y(arg1));
          break;
      }
    }
  }
};
