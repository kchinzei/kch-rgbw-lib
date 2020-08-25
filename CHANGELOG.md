# Changelog

Format of this changelog is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning policy is based on [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unrelased

- Heavy computation (due to linear programming) in `RGBWLED` class will be async.
  This will affect the following member functions and properties.
  - `constructor()` will initially set brightness to 0.
  - `color` and `brightness` will be readonly. These setters will be removed.
  - Instead `setColorAsync()` and `setBrighnessAsync()` will be added.
  - `setBrightness(bList: number[])` will be added.
  - `maxLuminanceAt()` and `maxBrightnessAt()` will be removed.
  - Instead `maxLuminanceAtAsync()` and `maxBrightnessAtAsync()` will be added.
- LED properties will be parsed from JSON format.

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
