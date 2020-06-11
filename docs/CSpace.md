# CSpace Color Transformation Class

Class CSpace manages a three-parameter color value and transformation between different color models.
It is a part of [kch-rgbw-lib](https://github.com/kchinzei/kch-rgbw-lib).
See [README.md](https://github.com/kchinzei/kch-rgbw-lib/blob/master/README.md)
for general information.

### Code snippet

In TypeScript/ES2015:

```TypeScript
import { CSpace, CSpaceTypes } from 'kch-rgbw-lib';

const rgb: CSpace = new CSpace('rgb', [0.8, 0, 0]);
const XYZ: CSpace = rgb.XYZ();
const a: number[] = XYZ.a;
console.log(a);
```

## Supported color spaces and transformation

Currently the following color spaces are supported.

- HSV: [Hue - saturation - value (brightness)](https://en.wikipedia.org/wiki/HSL_and_HSV) in the range of [0, 360] for H, [0, 1] for S and V.
- RGB: Red - green - blue in the range of [0, 1]. [sRGB](https://en.wikipedia.org/wiki/SRGB) is assumed in the chromaticity plane.
- XYZ: [CIE 1931 XYZ color space](https://en.wikipedia.org/wiki/CIE_1931_color_space).
- xyY: CIE 1931 xyY color space, which is a variation of the XYZ color space.
- xy: CIE 1931 xy chromaticity, which is identical to xyY color space except that Y term is not used.

The following transformations between these spaces are implemented.

- HSV <=> RGB : Equations from [wikipedia](https://en.wikipedia.org/wiki/HSL_and_HSV).
- RGB <=> XYZ : With gamma correction. Equations from [wikipedia](https://en.wikipedia.org/wiki/SRGB).
- XYZ <=> xyY : (x, y) are obtained by divided by (X+Y+Z).
- xyY ==> xy : Y term is ignored in xy color space. It is unidirectional transformation.

The color spaces are connected this way:  
&nbsp;&nbsp;&nbsp;&nbsp;HSV <=> RGB <=> XYZ <=> xyY => xy  
Conversions are mathematically bidirectional and preservable (except xyY => xy), however, there is a cost of numerical errors. Experimentally, one transformation preserves value in the range of +/- 0.00001 to 0.001. The longest path, from HSV to xyY, can be numerically more erroneous.

## API

### Class and members

```typescript
export interface ICSpace {
  type: CSpaceTypes;
  a: number[];
};

export class CSpace implements ICSpace;

export interface ICSpaceR {
  readonly type: CSpaceTypes;
  readonly a: number[];
};

export class CSpaceR implements ICSpaceR;

```

Class `CSpace` manages a colorspace.
Class `CSpaceR` is a readonly version of `CSpace`.

### Constructors

##### new CSpace()

An empty CSpace is created. `type` is set 'undefined'. You populate `type` and `a[]`.

##### new CSpace(from: CSpace)

Copy constructor.

##### new CSpace(type: CSpaceTypes, arr: number[])

A CSpace with given `type` and `arr[]` copied. `arr[]` is examined
if it's acceptable in the same way `.a` setter does.

##### new CSpace(type: CSpaceTypes, waveLength: number)

EXPERIMENTAL: A CSpace is made from given `waveLength` using an algorithm in [wikipedia](https://en.wikipedia.org/wiki/CIE_1931_color_space)
then transformed to `type`. It is marked as experimental, because it was found that
the equation gives large deviation from known values around green color.

### Getter

##### .a: number[]

Return a copy array of a[]. It's safe to modify or destroy the returned array.

##### .type: CSpaceTypes

Return `type`.

##### .r .g .b

##### .h .s .v

##### .X .Y .Z

##### .x .y .Y

##### .x .y .q

Return corresponding value in .a[].
It's intended as (almost) toll-free access, where there is no type check except for `.Y`.
You should use them when you are sure about the type.

### Setter

##### .a = arr: number[]

Copy values from `arr[]`. Length of `arr[]` should be >= 3, except when `type` is 'xy'.
Value of `arr[]` is checked if it's in the proper range for the corresponding `type`.
If it's not, it copies truncated value when possible.
When the length or value of `arr[]` is not acceptable, it throws an exception.  
When `type` is 'xy', it behaves as

- Length of input `arr[]` >= 2 is accepted.
- Only two values from `arr[]` copied. `.a[2]` is preserved.

##### .type = typ: CSpaceTypes

Set the `type` of this CSpace to given `typ`.
Internally it uses the color transformation functions.

##### .r .g .b = val

##### .h .s .v = val

##### .X .Y .Z = val

##### .x .y .Y = val

##### .x .y .q = val

Set corresponding value to .a[].
It's intended as (almost) toll-free access, where there is no type check (except for `.Y`). or value range check.
You should use them when you are sure about the type.

### Member functions

All member functions return `this` so that you can chain them like this:

```TypeScript
const x: CSpace = new CSpace(givenOne);
const a: number[] = x.rgb().a; // Chaining member functions
console.log(a);
```

##### .hsv(): CSpace

##### .rgb(): CSpace

##### .xyz(): CSpace

##### .xyY(): CSpace

##### .xy(): CSpace

Transform color space to the specified type and return `this`.
When it cannot transform, it throws an exception.
If `type` is 'undefined', it simply returns `this` without doing anything.
`.xy()` does not modify `.a[2]`.

As explained above, not all combination of color spaces directly transformable.
These transformation functions internally chain themselves to reach the output.
Therefore, you don't need to do like this:

```TypeScript
const x: CSpace = new CSpace('hsv', myArray);
const a: number[] = x.rgb().xyz().xyY().xy().a;
```

##### .conv(typeStr: string): CSpace

Transform color space to the specified type and return `this`.

##### .copy(from: CSpace): CSpace

Copy value `from` and return `this`.

### Types

```TypeScript
// Supported color spaces
type CSpaceTypes = { 'rgb' | 'hsv' | 'XYZ' | 'xyY' | 'xy' | undefined };
```

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
