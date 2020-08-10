# WaveLength

It is a part of [kch-rgbw-lib](https://github.com/kchinzei/kch-rgbw-lib).
See [README.md](https://github.com/kchinzei/kch-rgbw-lib/#README.md)
for general information.
Functions in this documents are in CIE 1931 chromaticity for `(x, y)` and in nanometer (nm) for wave length.

### Code snippet

In TypeScript/ES2015:

```TypeScript
import { CSpace, CSpaceTypes } from 'kch-rgbw-lib';
import { nm2x, nm2y, xy2nm } from 'kch-rgbw-lib';
import { xyIsInGamut, xyFit2Gamut, xyMap2Gamut } from 'kch-rgbw-lib';
```

## API

### Functions

##### nm2x(nm: number): number

##### nm2y(nm: number): number

Return CIE-x or CIE-y value corresponding to the given wavelength in nm.

##### function xy2nm(xy: CSpace): number

##### function xy2nm(x: number, y: number): number

Return wavelength that corresponds to CIE (x, y), in nanometer [nm].
When (x, y) is not on the CIE 1931 curve, it returns the projected point to the
curve. Note that the returned wavelength is meaningful only when (x, y)
is on or the curve. It internally calls xyFit2Gamut().

##### xyIsInGamut(xy: CSpace, xyList?: CSpace[]): boolean

Examine if a color `xy` is inside the gamut contour given by `xyList`.
`xyList` is an array of CSpace, each element represents a vertex of the gamut contour.
If `xyList` is omitted, the CIE 1931 chromaticity gamut is used.
You can construct a gamut contour using `makeGamutContour()`, see [RGBWLED.md](https://github.com/kchinzei/kch-rgbw-lib/#RGBWLED.md).

If you provide a gamut contour for R-G-B colors, you can use `xyIsInGamut()` to check if a color is in the RGB range.
![Gamut_sRGB](./figs/Gamut_sRGB.png "sRGB Gamut")

`xy` and `xyList` should be in 'xy' or 'xyY' of `CSpaceTypes`.
Other types will throw an exception.
Order of entries in `xyList` can be both clockwise and counter clockwise.

**IMPORTANT:** when it's an n-vertex polygon, `xyList` requires n+1 elements,
where `xyList[n] = xyList[0]`, for the simpleness of the algorithm.

The polygon can be concave, but the edges should not cross each other.

Note: For the purpose of checking the coverage of color sources, concave polygon is physically not meaningful.
You should use the outermost polygon made by the color sources.
`makeGamutContour()` does it for you.

`xyIsInGamut()` uses an algorithm in https://www.nttpc.co.jp/technology/number_algorithm.html.

##### function xyFit2Gamut(xy: CSpace, xyList?: CSpace[]): CSpace

##### function xyMap2Gamut(xy: CSpace, xyList?: CSpace[]): CSpace

`xyFit2Gamut()` examines if `xy` is inside the gamut contour given by `xyList`.
If not, `xyFit2Gamut()` projects `xy` to the nearest point on `xyList`.

`xyMap2Gamut()` projects `xy` to the nearest point on `xyList`.

If `xyList` is omitted, the CIE 1931 chromaticity gamut is used.

`xyFit2Gamut()` and `xyMap2Gamut()` calculate the corresponding wave length on the CIE 1931 chromaticity curve when `xyList` is omitted.

You can obtain the wave length by

```TypeScript
let c: CSpace = new CSpace('xy', [0.4, 0.6]);
c = xyFit2Gamut(c);
let waveLength = c.q; // in nm
```

`xyList` is in the same format as `xyIsInGamut()`.
You must append the first point at the end of array.

![CIEfitxy2nm](./figs/xy2nm.png "Mapping by CIEfitxy2nm()")

- Whenever possible, it returns the projected point on the curve (points 1-4).
- It can determine the projection even the input is outside the curve.
- Eventually it appears not exactly on the curve due to the interpolation (4).
- However it does not interpolate between 405nm and 700 nm.
  In such case, it returns either 405 nm or 700 nm point (5, 6).
- Note that it can return physically nonsense wave length
  if the input is far from the CIE 1931 chromaticity curve (7).

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
