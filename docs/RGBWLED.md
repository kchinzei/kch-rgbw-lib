## RGBWLED

It is a part of [kch-rgbw-lib](https://github.com/kchinzei/kch-rgbw-lib).
See [README.md](https://github.com/kchinzei/kch-rgbw-lib/#README.md)
for general information.

### Code snippet

In TypeScript/ES2015:

```TypeScript
import { RGBWLED, makeGamutContour } from 'kch-rgbw-lib';

```

## API

### Class and members

```typescript
export interface IRGBWLED {
  name: string;
  readonly color: CSpace;
  brightness: number; // [0,1]
  readonly maxLuminance: number;  // Sum of maxLuminance of all LEDs
  readonly LED: LEDChip[];
  readonly nLED: number;
}

export class RGBWLED extends CSpace implements IRGBWLED;

```

Class `RGBWLED` represents a composite LED.

Although the name of the class may imply that it has R-G-B-W 4 LEDs, `RGBWLED` can have any number of LEDs from 3 different colors.
It is possible to have LEDs with a same color.
LEDs are stored as an array.

For more than 5 LEDs we need to solve it using linear programming (LP).
Since LP is a heavy computation, operations that involve LP are asynchronous.

### Luminance and brightness

Relation of `brightness` and `maxLuminance` and the current luminance is
`(luminance) = brightness * maxLuminance`.

In case of composite LED, `maxLuminance` does not mean possible largest luminance at any occasions.
Actual maximum luminance that can be represented by a combination of LEDs is dependent to the color to represent.
`maxLuminance` is achieved (only) when all LEDs turn on at full brightness.
Color-dependent maximum luminance is obtained by `getMaxLuminanceAt()`.

Therefore, `brightness` cannot reach to 1 in most of colors.

### Alpha

Some member functions of `RGBWLED` use `alpha: number[]` as in/output.
`alpha[]` is a set of brightness of each LED.
Therefor length of `alpha[]` should always match to number of LEDs.

### Gamut contour

Range of color represented by a set of color source is called **(color) gamut**.
`RGBWLED` assumes there are at least three different colors that forms a triangle gamut.
By adding LEDs of different colors, the gamut can be extended.
`RGBWLED` maintains an array of colors that form the gamut, **gamut contour**.

You can construct a gamut contour using `makeGamutContour()`.

To test if a color is within the gamut, you can use `xyIsInGamut(xy: CSpace, xyList?: CSpace[])`.
Here you provide a gamut contour as `xyList`.
You can fit a color inside the gamut contour using `xyFit2Gamut()`.
About those functions, see [WaveLength.md](https://github.com/kchinzei/kch-rgbw-lib/#README.md).

### Constructors

##### new RGBWLED(name: string, lList: LEDChip[])

A new `RGBWLED` from an array of `LEDChip`, `lList`.
`lList` is shallow-copied.
If number of LEDs or number of different colors is less than 3, it throws an exception.
Due to limitation of solver, some node/C++ environment has limitation of number of LEDs less than 5.

After initialization, `RGBWLED` is turned off (all LEDs off) while its color is set to 'all LED on'. Before using `RGBWLED` you must set an initial color using `setColorAsync()`.

### Getter

##### .color: CSpace

Return the current composite color.

##### .brightness: number

Return the current brightness.

##### .maxLuminance: number

Return the maximum luminance obtained when turning on all LEDs.

##### .LED: LEDChip[]

Return the array of current LEDs.
Modifying `LEDChip` in this array will result in unexpected behavior.

### Setter

##### .brightness: number

Set brightness. Resulting brightness may be less that the input, when it is saturated.

### Member functions

##### setColorAsync(c: CSpace): Promise\<void\>

Set the color of `RGBWLED` to the given color `c`. If `c` is not inside the gamut, it is fit into the gamut using `xyFit2Gamut()`.

If type of `c` is `'xyY'` or `'XYZ'`, the `Y` component of `c` is used as the new luminance. In other cases, it maintains the current luminance. However, depending on the new color to represent and its maximum luminance, the resulting luminance can be darker than input.

##### setLuminanceAsync(Y: number): Promise\<number\>

Set the luminance of `RGBWLED`. It keeps the current color.
It returns the resulting luminance.
Depending on the maximum luminance at the color, the resulting luminance can be darker than input Y.

##### maxLuminanceAtAsync(c: CSpace): Promise\<number\>

##### maxBrightnessAtAsync(c: CSpace): Promise\<number\>

Returns the maximum luminance and brightness that can be achieved at the given color `c`.
These does not check if `c` is within the gamut.

##### push(l: LEDChip): void

Push (append) the given `l` in the `RGBWLED`.
After pushing `l`, the state of `l` is 'off' (unused) until next `setColorAsync()` call.

##### alpha2Color(aplha: number[]): CSpace

Return the composite color using an array of brightness of LEDs `alpha`.
It does not check the brightness is in range of [0,1].
`alpha.length` should match the number of LEDs in `RGBWLED`.
Otherwise it throws an exception.
Returned `CSpace` is in `'xyY'` type.

##### color2AlphaAsync(c: CSpace): Promise<number[]>

Return an array of brightness of each LED for a given color `c`. It does not check `c` is within the gamut. If it is outside the gamut, some values in the return array will be negative.
`c` can be in any color space except `'xy'`.

## Static member function

##### static maxLEDNumber: number

Possible maximum number of LED under the current installation.
It is a restriction of [linear-program-solver](https://github.com/kchinzei/linear-program-solver), that requires newer node versions and C++-17 compiler.

You should check if number of LEDs to set `RGBWLED` class not exceeding this number.

## Related Functions

##### function makeGamutContour(cList: CSpace[]): CSpace[]

Returns a list of CSpace that forms the gamut contour.
`cList` is a list of CSpace.
Gamut contour is the outermost polygon made by colors in `cList`.
You need to provide at least 3 different colors in `cList`.
Order of colors does not matter.

Returned array has the first color at the end of array also so that it can be used by `xyFit2Gamut()` and `xyIsInGamut()`.

### To do

- Populate pop() and other array manipulation functions.

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
