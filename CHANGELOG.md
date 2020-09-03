# Changelog

Format of this changelog is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning policy is based on [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unrelased

To avoid heavy computation (of linear programming),

- LED properties parsed from JSON format.
- Solve `RGBWLED` composite color by linear interpolation of alpha[].
- Function to load a lookup table of alpha[].

Solution of linear programming in case a solution including brightness > 1 is not necessarily optimized in the sense that value exceeding 1 is not a 'best effort' to close it to 1. Function to provide optimum solution will be provided.

Sample and utility node scripts

- Sample script to compute alpha[] (LED's PWM) from a color, or v.v.
- Utility to generate lookup table of alpha[] from given set of LED.
- Utility to compute chromaticity and luminosity of an LED from spectroscopic measurement data obtained by [SparkFun Triad Spectroscopy Sensor AS7265x](https://github.com/sparkfun/SparkFun_AS7265x_Arduino_Library).

### [2.0.0](https://github.com/kchinzei/kch-rgbw-lib/releases/tag/2.0.0) - 2020-09-04

Heavy computation (due to linear programming) in `RGBWLED` class is now asynchronous. Asynchronous functions are suffixed ...Async().
Following member functions and properties are changed.

### Added

- `setColorAsync()` instead of the setter.
- `maxLuminanceAtAsync()` and `maxBrightnessAtAsync()`
- `setAlpha(alpha: number[])`
- `alpha2Color()` and `color2AlphaAsync()`
- `RGBWLED.maxLEDNumber` to obtain limit of LEDs.

### Changed

- `constructor()` will initially set brightness to 0.
- `color` is readonly.
- `push()` does not update LED brightness.

### Deleted

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
