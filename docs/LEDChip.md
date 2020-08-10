## LEDChip

It is a part of [kch-rgbw-lib](https://github.com/kchinzei/kch-rgbw-lib).
See [README.md](https://github.com/kchinzei/kch-rgbw-lib/#README.md)
for general information.

### Code snippet

In TypeScript/ES2015:

```TypeScript
import { LEDChip, LEDChipTypes } from 'kch-rgbw-lib';
import { LEDChipTypR, LEDChipTypG, LEDChipTypB, LEDChipTypW } from 'kch-rgbw-lib';
import { LEDChipEpistarR, LEDChipEpistarG, LEDChipEpistarB, } from 'kch-rgbw-lib';
import { LEDChipEpistarWW, LEDChipEpistarCW } from 'kch-rgbw-lib';

```

## API

### Type

```typescript
export type LEDChipTypes = "LED_R" | "LED_G" | "LED_B" | "LED_W" | "LED_Other";
```

### Class and members

```typescript
export interface ILEDChip {
  readonly LEDChipType: LEDChipTypes;
  readonly waveLength: (number | undefined);
  readonly colorTemperature: (number | undefined);
  readonly maxLuminance: number;
  maxW: number;
  readonly x: number;
  readonly y: number;
  brightness: number;
  name: string;
}

export class LEDChip extends CSpaceR implements ILEDChip;

```

Class `LEDChip` represents an LED chip.
It is intended to represent a set of LEDs in `RGBWLED` class.

An LED has wavelength or temperature.
LEDs are classified to color LED and white LED.
A color LED has wavelength, and white LED has color temperature. `LEDChipTypes` is used to distinguish them.

Currently `wavelength` is limited to 405-700 nm as in WaveLength library, and color temperature is limited to 1000-20000 k as in ColorTemperature library. This means you cannot represent NIR or UV LEDs using `LEDChip`.

Internally both types are represented by `CSpace` in 'xyY' colorspace. 'Y' is used as the rated (max) brightness.
For this purpose, class `LEDChip` is derived from `CSpaceR`, which is a read only CSpace.

Most of parameters of `LEDChip` are read only, except `brightness`, `maxW` and `name`.
`maxW` is not read only because actual energy consumption depends on the circuit design and other conditions.

`brightness` is relative, its range is between 0 and 1. Setting other value will be truncated. The current luminance is calculated by `(luminance) = brightness * maxLuminance`.

Although `maxLuminance` and `maxW` have physical units, this class uses them as if unitless. However, when you use them with multiple LEDs, you need to use them consistently.

### Constructors

##### new LEDChip(type: LEDChipTypes, param: LEDChipDefByWaveLength)

##### new LEDChip(type: LEDChipTypes, param: LEDChipDefByColorTemperature)

##### new LEDChip(type: LEDChipTypes, param: LEDChipDefByCIExy)

A LEDChip with given `LEDChipTypes` and `param`. `param` is one of these:

```typescript
export type LEDChipDefByWaveLength = {
  waveLength: number;
  maxLuminance: number;
  maxW?: number;
  name?: string;
};

export type LEDChipDefByColorTemperature = {
  colorTemperature: number;
  maxLuminance: number;
  maxW?: number;
  name?: string;
};

export type LEDChipDefByCIExy = {
  x: number;
  y: number;
  maxLuminance: number;
  maxW?: number;
  name?: string;
};
```

`LEDChipDefByColorTemperature` is for `'LED_W'` only, `LEDChipDefByWaveLength` is for other type of LEDs only.
`LEDChipDefByCIExy` can be used for both types.
When `maxW` is not given, it's assumed 1.

##### new LEDChip(type: LEDChipTypes)

A new LEDChip as specified by `type`. When `'LED_R'` is given, a copy of `LEDChipTypR` a typical red LED is returned.
Similarly, other types return a copy of corresponding typical LEDs.

##### new LEDChip(from: LEDChip)

Copy constructor.

### Constants

##### export LEDChipTypR, LEDChipTypG, LEDChipTypB, LEDChipTypW;

These are typical color/white LEDs, CREE MCE4CT-A2-0000-00A4AAAB1.

##### export LEDChipEpistarR, LEDChipEpistarG, LEDChipEpistarB, LEDChipEpistarWW, LEDChipEpistarCW;

Another example of LEDChip, parameters referenced from LC-S5050-04004-RGBW, Epistar.

### To do

- Constructor will be rewritten to accept JSON object so that `LEDChip` can be instantiated from it.
- Once JSON instantiation is implemented, static instance such as `LEDChipTypR` will be removed.

### Reference

- https://www.cree.com/led-components/media/documents/XLampMCE.pdf
- http://ww1.microchip.com/downloads/jp/AppNotes/jp572250.pdf

# License

The MIT License (MIT)
Copyright (c) K. Chinzei (kchinzei@gmail.com)
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
