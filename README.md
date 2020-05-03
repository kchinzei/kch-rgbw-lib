# Kch RGBW Lib

RGB/RGBW LED class library in typescript. It provides following functions,

- Conversions between
  - RGB <=> HSB
  - CIE => RGB(W) using LED's properties
  - Color temperature <=> CIE (experimental)
  - Wavelength <=> CIE
- Fade-in/out array
- Typical RGB LED properties

It is intended to use with
[homebridge-raspi-rgbw-led](https://github.com/kchinzei/homebridge-raspi-rgbw-led)
project.

## System Requirements

- Node 11.15 or newer (perhaps older one with ES2015, but not tested)

## Installation

Install with npm:

```Shell
npm install kch-rgbw-lib
```

## API

- [CIE_colorTemperature](./docs/CIE_colorTemperature.md)
  : Functions for color temperature of black body.
- [CIE_waveLength](./docs/CIE_waveLength.md)
  : Functions for CIE 1931 colorspace.

## References

- [A Beginner’s Guide to (CIE) Colorimetry - Color and Imaging](https://medium.com/hipster-color-science/a-beginners-guide-to-colorimetry-401f1830b65a)
- [Blackbody color temperature datafile](http://www.vendian.org/mncharity/dir3/blackbody/)
  / Mitchell Charity
- [新しいカラーマネージメントの方法](http://www.enveng.titech.ac.jp/nakamura/story/pdf/colormanagement.pdf)
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
