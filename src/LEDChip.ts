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

import { checkWaveLength, checkCIEx, checkCIEy, checkColorTemperature } from './const';
import { CSpaceR } from './CSpace';
import { CIEnm2x, CIEnm2y, CIExy2nm } from './waveLength';
import { CIEk2x, CIEk2y, CIExy2k}  from './colorTemperature';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const isLEDChipDefByWaveLength = (arg: any): arg is LEDChipDefByWaveLength => arg.waveLength !== undefined;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const isLEDChipDefByColorTemperature = (arg: any): arg is LEDChipDefByColorTemperature => arg.colorTemperature !== undefined;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const isLEDChipDefByCIExy = (arg: any): arg is LEDChipDefByCIExy => (arg.x !== undefined && arg.y !== undefined);

const initName = (s: string|undefined) => (typeof(s) === 'string')? s : '';

export type LEDChipTypes =
  'LED_R' | 'LED_G' | 'LED_B' | 'LED_W' | 'LED_Other' ;

export type LEDChipDefByWaveLength = {
  waveLength: number;
  maxBrightness: number;
  maxW?: number;
  name?: string;
};

export type LEDChipDefByColorTemperature = {
  colorTemperature: number;
  maxBrightness: number;
  maxW?: number;
  name?: string;
};

export type LEDChipDefByCIExy = {
  x: number;
  y: number;
  maxBrightness: number;
  maxW?: number;
  name?: string;
};

export interface ILEDChip {
  readonly LEDChipType: LEDChipTypes;
  readonly waveLength: (number | undefined);
  readonly colorTemperature: (number | undefined);
  readonly maxBrightness: number;
  maxW: number;
  readonly x: number;
  readonly y: number;
  brightness: number;
  name: string;
}

export class LEDChip extends CSpaceR implements ILEDChip {
  private _LEDChipType: LEDChipTypes;
  private _waveLength: (number | undefined);
  private _colorTemperature: (number | undefined);
  private _maxW: number;
  private _brightness: number;
  private _name: string;

  get LEDChipType(): LEDChipTypes { return this._LEDChipType; }
  get waveLength(): (number | undefined) { return this._waveLength; }
  get colorTemperature(): (number | undefined) { return this._colorTemperature; }
  get maxW(): number { return this._maxW; }
  set maxW(w: number) { this._maxW = checkNonNegative(w); }
  get maxBrightness(): number { return super.q; }
  get x(): number { return super.x; }
  get y(): number { return super.y; }
  get brightness(): number { return this._brightness; }
  set brightness(b: number) {
    this._brightness = checkBrightness(b, this.maxBrightness);
  }
  get name(): string { return this._name; }
  set name(n: string) { this._name = n; }

  /*
    Different pairs of parameters work as following:
    c1: constructor(LEDChipType, LEDChipDefByWaveLength); // Color LEDs by wave length
    c2: constructor(LEDChipType, LEDChipDefByColorTemperature); // White LEDs by tempetarure
    c3: constructor(LEDChipType, LEDChipDefByCIExy); // If you know CIE(xy). It's most precise.
    c4: constructor(LEDChipType); // Typical ones.
    c5: constructor(LEDChip); // Copy constructor.
  */
  constructor(typeOrLED: (LEDChipTypes | LEDChip), arg?: (LEDChipDefByWaveLength | LEDChipDefByColorTemperature | LEDChipDefByCIExy)) {
    if (typeof(typeOrLED) === 'string') {
      if (typeof(arg) !== 'undefined') {
        let x!: number;
        let y!: number;
        let t: number | undefined;
        let w: number | undefined;

        if (isLEDChipDefByWaveLength(arg) && typeOrLED !== 'LED_W') {
          // c1: waveLength specified in arg1
          w = checkWaveLength(arg.waveLength);
          x = CIEnm2x(w);
          y = CIEnm2y(w);
        } else if (isLEDChipDefByColorTemperature(arg) && typeOrLED === 'LED_W') {
          // c2: colorTemperature given in arg1.
          t = checkColorTemperature(arg.colorTemperature);
          x = CIEk2x(t);
          y = CIEk2y(t);
        } else if (isLEDChipDefByCIExy(arg)) {
          x = checkCIEx(arg.x);
          y = checkCIEy(arg.y);
          switch (typeOrLED) {
            case 'LED_W':
              t = CIExy2k(x, y);
	      break;
	    default:
	      w = CIExy2nm(x, y);
	      break;
          }
        } else {
          throw new Error('Class LEDChip: Unexpected contructor parameters, wrong combination of LEDChipTypes and LEDChipDefByXXXX');
        }
        super('xy', [x, y, checkNonNegative(arg.maxBrightness)]);
        this._LEDChipType = typeOrLED;
        this._waveLength = w;
        this._colorTemperature = t;
        this._brightness = 0;
        this._maxW = checkNonNegative((arg.maxW === undefined)? 1 : arg.maxW);
        this._name = initName(arg.name);
      } else {
        const type: LEDChipTypes = typeOrLED;
        let l!: LEDChip;
        switch (type) {
          case 'LED_R':
            l = LEDChipTypR;
            break;
          case 'LED_G':
            l = LEDChipTypG;
            break;
          case 'LED_B':
            l = LEDChipTypB;
            break;
          case 'LED_W':
            l = LEDChipTypW;
            break;
        }
        super(l);
        this._LEDChipType = l.LEDChipType;
        this._waveLength = l.waveLength;
        this._colorTemperature = l.colorTemperature;
        this._brightness = l.brightness;
        this._maxW = l._maxW;
        this._name = l.name;
      }
    } else {
      const l: LEDChip = typeOrLED;
      super(l);
      this._LEDChipType = l.LEDChipType;
      this._waveLength = l.waveLength;
      this._colorTemperature = l.colorTemperature;
      this._brightness = l.brightness;
      this._maxW = l._maxW;
      this._name = l.name;
    }
  }
}

// CREE MCE4CT-A2-0000-00A4AAAB1 and measurement found in AN1857 by MicroChip.
// http://ww1.microchip.com/downloads/jp/AppNotes/jp572250.pdf
export const LEDChipTypR: LEDChip = new LEDChip('LED_R', { x: 0.6857, y: 0.3143, maxBrightness: 30.6, name: 'Typical R' });
export const LEDChipTypG: LEDChip = new LEDChip('LED_G', { x: 0.2002, y: 0.6976, maxBrightness: 67.2, name: 'Typical G' });
export const LEDChipTypB: LEDChip = new LEDChip('LED_B', { x: 0.1417, y: 0.0618, maxBrightness: 8.2,  name: 'Typical B' });
export const LEDChipTypW: LEDChip = new LEDChip('LED_W', { x: 0.3816, y: 0.3678, maxBrightness: 80.0, name: 'Typical W' });

// These values are from RGBW Chip LC-S5050-04004-RGBW, Epistar
export const LEDChipEpistarR: LEDChip = new LEDChip('LED_R', { waveLength: 625, maxBrightness: 2.5, name: 'LC-S5050-04004-RGBW, Epistar' });
export const LEDChipEpistarG: LEDChip = new LEDChip('LED_G', { waveLength: 520, maxBrightness: 3.5, name: 'LC-S5050-04004-RGBW, Epistar' });
export const LEDChipEpistarB: LEDChip = new LEDChip('LED_B', { waveLength: 470, maxBrightness: 1.5, name: 'LC-S5050-04004-RGBW, Epistar' });
export const LEDChipEpistarWW: LEDChip = new LEDChip('LED_W', { colorTemperature: 2600, maxBrightness: 6.5, name: 'LC-S5050-04004-RGBW, Epistar' });
export const LEDChipEpistarCW: LEDChip = new LEDChip('LED_W', { colorTemperature: 6500, maxBrightness: 6.5, name: 'LC-S5050-04004-RGBW, Epistar' });

function checkBrightness(b: number, max: number): number {
  if (b < 0) b = 0;
  if (b > max) b = max;
  return b;
}

function checkNonNegative(b: number): number {
  // It can be any nonzero positive.
  if (b <= 0) b = 1.0;
  return b;
}
