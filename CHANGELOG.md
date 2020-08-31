# Changelog

Format of this changelog is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning policy is based on [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unrelased

- LED properties parsed from JSON format.
- Solve `RGBWLED` composite color by linear interpolation.
- Setter of brightness in `RGBWLED`

### [2.0.0](https://github.com/kchinzei/kch-rgbw-lib/releases/tag/2.0.0) - 2020-09-01

Heavy computation (due to linear programming) in `RGBWLED` class is now asynchronous. Asynchronous functions are suffixed ...Async().
Following member functions and properties are changed.

### Added

- `setColorAsync()` and `setLuminanceAsync()` instead of setters.
- `maxLuminanceAtAsync()` and `maxBrightnessAtAsync()`
- `setBrightness(bList: number[])`
- `brightness2Color()` and `color2BrightnessAsync()`
- `RGBWLED.maxLEDNumber` to obtain limit of LEDs.

### Changed

- `constructor()` will initially set brightness to 0.
- `color` and `brightness` are readonly.
- `push()` does not update LED brightness.

### Deleted

- Setters of `color` and `brightness`.
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
