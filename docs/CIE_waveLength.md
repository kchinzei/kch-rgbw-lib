# CIE_wavelength

It is a part of [kch-rgbw-lib](https://github.com/kchinzei/kch-rgbw-lib).
See [README.md](https://github.com/kchinzei/kch-rgbw-lib/blob/master/README.md)
for general information.

### Code snippet

In TypeScript/ES2015:
```TypeScript
import { checkWaveLength, checkCIEx, checkCIEy, checkCIExy,
         CIEnm2x, CIEnm2y, CIExy2nm } from 'kch-rgbw-lib';
import { CIEfitxy2nm, CIEnmxyType } from 'kch-rgbw-lib';
```

## API

### Module Constants and types

```TypeScript
// Color temperature (of white)
type CIEnmxyType = { nm: number; x: number; y: number };
```

### Functions

##### checkWaveLength(nm: number): number
##### checkCIEx(x: number): number
##### checkCIEy(y: number): number
Truncate the given value within its range.

##### checkCIExy(x: number, y: number): boolean
Examine if (x, y) is within CIE 1931 area.

##### CIEnm2x(nm: number): number
##### CIEnm2y(nm: number): number
Return CIE-x or CIE-y value corresponding to the given wavelength in nm.

##### function CIExy2nm(x: number, y: number): number
Return wavelength that corresponds to CIE (x, y), in nanometer [nm].
When (x, y) is not on the CIE 1931 curve, it returns the projected point to the
curve. Note that the returned wavelength is meaningful only when (x, y)
is on or the curve. It internally calls CIEfitxy2nm().
###### function CIEfitxy2nm(x: number, y: number): CIEnmxyType
Return the nearest point on the CIE 1931 curve with the point's wavelength.
![CIEfitxy2nm](./figs/CIExy2nm.png "Mapping by CIEfitxy2nm()")
- Whenever possible, it returns the @rpjected point on the curve (points 1-4).
- It can determine the projection even the input is outside the curve.
- Eventually it appears not exactly on the curve due to the interpolation (4).
- However it does not interpolate between 405nm and 700 nm.
  In such case, it returns either 405 nm or 700 nm point (5, 6).
- Note that it can return physically nonsense value if the input is far
  from the CIE 1931 curve (7).

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
