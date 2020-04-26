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

function checkBrightness(b: number, max: number): number {
  if (b < 0) b = 0;
  if (b > max) b = max;
  return b;
}

function checkWaveLength(w: number): number {
  // in nm. Assume practical range
  if (w < 350) w = 350;
  if (w > 1000) w = 1000;
  return w;
}

function checkColorTemp(t: number): number {
  // in Kelvin. Assume practical range
  if (t < 2000) t = 2000;
  if (t > 9000) t = 9000;
  return t;
}

function checkMaxBrightness(b: number): number {
  // It can be any nonzero positive.
  if (b <= 0) b = 1.0;
  return b;
}

function checkCIE(xy: number): number {
  if (xy < 0) xy = 0;
  if (xy > 1) xy = 1;
  return xy;
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
  get colorTemperature(): (number | undefined) { return this.colorTemperature; }
  get maxBrightness(): number { return this._maxBrightness; }
  get x(): number { return._x; }
  get y(): number { return this._y: }
  get brightness(): number { return this._brightness; }
  set brightness(b: number): void {
    this._brightness = checkBrightness(b, this.maxBrightness);
  }
  get name(): string { return this._name; }
  set name(n: string): void { this._name = n; }

  setMaxBrightness(b: number): void { this._maxBrightness = checkMaxBrightness(b); }
  setX(x: number): void { this._x = checkXy(x); }
  setY(y: number): void { this._y = checkXy(y); }

  setLEDChipType(t: LEDChipTypes): void { this._LEDChipTypes = t; }
  
  setWaveLength(w: number | undefined): void {
    switch (this.LEDChipType) {
      case 'LED_R':
      case 'LED_G':
      case 'LED_B':
      case 'LED_UV':
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
	this._colorTemperature = checkColorTemperature(t);
	break;
      default:
	this._colorTemperature = undefined;
    }
  }

  private _clear(): void {
    this.setLEDChipType(undefined);
    this.setWaveLength(0);
    this.setColorTemperature(0);
    this.setMaxBrightness(0);
    this.setX(0);
    this.setY(0);
    this.brightness = 0;
    this.name = '';
  }

  constructor() {
    this._clear();
  }

  constructor(LEDChipType: LEDChipTypes, waveLength: number, maxBrightness: number) {
    this._clear();
    switch (LEDChipType) {
      case 'LED_R':
      case 'LED_G':
      case 'LED_B':
      case 'LED_UV':
	this.setLEDChipType(LEDChipType);
	this.setWaveLength(0);
	this.setColorTemperature(0);
	this.setMaxBrightness(maxBrightness);
	this.setX(0); // ToDo: calculate!
	this.setY(0); // ToDo: calculate!
	break;
    }
  }
  
  constructor(LEDChipType: LEDChipTypes, colorTemperature: number, maxBrightness: number) {
    this._clear();
    switch (LEDChipType) {
      case 'LED_W':
      case 'LED_WW':
      case 'LED_CW':
	this.setLEDChipType(LEDChipType);
	this.setWaveLength(0);
	this.setColorTemperature(colorTemperature);
	this.setMaxBrightness(maxBrightness);
	this.setX(0); // ToDo: calculate!
	this.setY(0); // ToDo: calculate!
	break;
  }
  
  constructor(LEDChipType: LEDChipTypes, x: number, y: number, maxBrightness: number) {
    this._clear();
    this.setLEDChipType(LEDChipType);
    this.setX(x);
    this.setY(y);
    this.setWaveLength(0); // ToDo: calculate!
    this.setColorTemperature(0); // ToDo: calculate!
    this.setMaxBrightness(maxBrightness);
  }
};
  
