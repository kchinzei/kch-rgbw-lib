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

- CHANGELOG.md Added.
- Some of heavy files in docs/ removed, as these are not essential to build library.
These files are in an independent folder 'docs/more'.

## 1.0.0 - 2020-08-17

### added

- Initial release.
