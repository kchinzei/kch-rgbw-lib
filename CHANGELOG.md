# Changelog

Format of this changelog is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning policy is based on [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unrelased

To avoid heavy computation due to linear programming (LP),

- Solve `RGBWLED` composite color by linear interpolation of pre-computed alpha[].
- Function to load a lookup table of pre-computed alpha[].
- Utility to generate the lookup table.

Solution of linear programming in case a solution including brightness > 1 is not necessarily optimized in the sense that value exceeding 1 is not a 'best effort' to make it close to 1. Function to obtain optimum solution will be provided.

Solution of small alpha, smaller than the resolution of PWM step (e.g, 1/256 for 8 bit PWM) may result sudden change from 0 (turn off) to turn on, or vice versa. By forcing small alpha to null when solving the LP, this issue may be improved (but not always).

Sample and utility node scripts

- Web utility to visualize gamut contour.
- Web utility to generate lookup table of alpha[] from given set of LED.
- Utility to compute chromaticity and luminance of an LED from spectroscopic measurement data obtained by such as [SparkFun Triad Spectroscopy Sensor AS7265x](https://github.com/sparkfun/SparkFun_AS7265x_Arduino_Library).

Other plan

- Github default branch will be 'main'.

### [2.1.0](https://github.com/kchinzei/kch-rgbw-lib/releases/tag/2.1.0) - 2021-06-27

`LEDChip` and `RGBWLED` can be parsed from JSON format string and file.
Snippets added for jump start.

### Added

- JSON parser

  - `parseRGBWLEDfromJSONFileAsync()`, `parseRGBWLEDfromJSONStringAsync()`
  - `parseLEDChipArrayfromJSONFileAsync()`, `parseLEDChipArrayfromJSONStringAsync()`

- `RGBWLED`

  - `isInGamut()`, `fit2Gamut()`

- Snippets

### [2.0.0](https://github.com/kchinzei/kch-rgbw-lib/releases/tag/2.0.0) - 2020-09-05

Heavy computation (due to linear programming) in `RGBWLED` class is now asynchronous. Asynchronous functions are suffixed ...Async().
Following member functions and properties are changed.

### Added

- `RGBWLED`
  - `setColorAsync()` instead of the setter.
  - `maxLuminanceAtAsync()` and `maxBrightnessAtAsync()`
  - `setAlpha(alpha: number[])`
  - `alpha2Color()` and `color2AlphaAsync()`
  - `RGBWLED.maxLEDNumber` to obtain limit of LEDs.

### Changed

- `RGBWLED`
  - `constructor()` will initially set brightness to 0.
  - `color` is readonly.
  - `push()` does not update LED brightness.
- Fixed a bug of `CSpaceR`, now members are readonly as expected.

### Deleted

- `RGBWLED`
  - Setters of `color`.
  - `maxLuminanceAt()` and `maxBrightnessAt()`.

## [1.0.1](https://github.com/kchinzei/kch-rgbw-lib/releases/tag/1.0.1) - 2020-08-26

Some of heavy files in docs/ removed, as these are not essential to build library.
These files are moved to an independent repository, linked as 'docs/more'.

### Added

- CHANGELOG.md
- docs/more/ as a submodule from https://github.com/kchinzei/kch-rgbw-docs-more.git

### Changed

- Figures in docs/figs/ resized smaller.

### Deleted

- Large files in docs/

## [1.0.0](https://github.com/kchinzei/kch-rgbw-lib/releases/tag/1.0.0) - 2020-08-17

### Added

- Initial release.
