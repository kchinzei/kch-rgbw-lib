# Kch RGBW Lib

[![npm version](https://badge.fury.io/js/kch-rgbw-lib.svg)](https://badge.fury.io/js/kch-rgbw-lib)
[![Build Status](https://travis-ci.org/kchinzei/kch-rgbw-lib.svg?branch=master)](https://travis-ci.org/kchinzei/kch-rgbw-lib)
[![Coverage Status](https://coveralls.io/repos/github/kchinzei/kch-rgbw-lib/badge.svg?branch=master)](https://coveralls.io/github/kchinzei/kch-rgbw-lib?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

RGB/RGBW LED class library in typescript. It provides following classes and functions,

- Composite LED class `RGBWLED` for multi-color LED. In addition to R-G-B (3 LEDs), R-G-B-W (4 LEDs), it can have **unlimited many number of component LEDs**.
- Mathematically clear solution for many-LED problem.
- Conversions between
  - Composite color <=> Each component LEDs mix ratio (e.g. PWM).
  - RGB, HSV and CIE 1931 Chromaticity (XYZ, xy+Y) colorspace
  - Color temperature <=> chromaticity (experimental)
  - Wavelength <=> CIE
- Typical RGB LED properties

It is intended to use with [homebridge-raspi-rgbw-led](https://github.com/kchinzei/homebridge-raspi-rgbw-led) project.

### Many-LED problem

Many-LED problem is a mathematical and engineering problem to determine the mix ratio of R-G-B or more LED light sources (component LEDs) to produce an intermediate color and luminosity. While a color and luminosity is given by 3 parameters (for example, x-y chromaticity and luminance), many-LED problem is to determine the mix ratio of 3 or more component LEDs.

For 3 LEDs, it is a determinate problem. For 4 or more, this problem is indeterminate and needs additional constraint(s) to solve.
Minimizing power consumption is a useful constraint. For 4 LEDs, it is solved as a single parameter inequality. For more than 5 LEDs we need to solve it using linear programming (LP).

In detail, see [Solve RGB+ LEDs PWM from Chromaticity](./docs/rgbw_solver.pdf).

## System Requirements

- Node 10.20.0 or newer except 11.x.
- Unix systems with C++-17 compiler.

These are limitation of [linear-program-solver](https://www.npmjs.com/package/linear-program-solver).

## Installation

Install with npm:

```Shell
npm install kch-rgbw-lib
```

Some additional npm packages will be installed.

## API

- [CSpace](./docs/CSpace.md)
  : Color conversion class.
- [RGBWLED](./docs/RGBWLED.md)
  : Composite LED class.
- [LEDChip](./docs/LEDChip.md)
  : Single color LED chip class.
- [ColorTemperature](./docs/ColorTemperature.md)
  : Functions for color temperature of black body.
- [WaveLength](./docs/WaveLength.md)
  : Functions for CIE 1931 chromaticity and wave length.

## Code snippets / example

- Code snippets [here](./docs/snippets.md).
  Typescript snippets in [src/snippets](./src/snippets)
- Sample tools using `kch-rgbw-lib` : [src/examples/calc](./src/examples/calc)

## More to read

- [Solve RGB+ LEDs PWM from Chromaticity](./docs/rgbw_solver.pdf)
  : A mathematical solution for many-LED problem.

## References

- [A Beginner’s Guide to (CIE) Colorimetry - Color and Imaging](https://medium.com/hipster-color-science/a-beginners-guide-to-colorimetry-401f1830b65a)
- [CIE 1931 color space](https://en.wikipedia.org/wiki/CIE_1931_color_space) / Wikipedia
- [HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV) / Wikipedia
- [sRGB](https://en.wikipedia.org/wiki/SRGB) / Wikipedia
- [Blackbody color temperature data file](http://www.vendian.org/mncharity/dir3/blackbody/)
  / Mitchell Charity
- [新しいカラーマネージメントの方法](http://www.nakamura.enveng.titech.ac.jp/story/pdf/colormanagement.pdf)
  / 中村芳樹
- [AN1562 High Resolution RGB LED Color Mixing Application Note](http://ww1.microchip.com/downloads/en/AppNotes/00001562B.pdf)
  / Microchip

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
