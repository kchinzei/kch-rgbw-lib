# LEDChip / RGBWLED Parser

Parse `LEDChip` array and `RGBWLED` object from a json file.
It is a part of [kch-rgbw-lib](https://github.com/kchinzei/kch-rgbw-lib).
See [README.md](https://github.com/kchinzei/kch-rgbw-lib/#README.md)
for general information.

### Code snippet

In TypeScript/ES2015:

```TypeScript
import { LEDChip, RGBWLED } from 'kch-rgbw-lib';
import { parseJSONFileAsync } from 'kch-rgbw-lib';

let rgbw!: RGBWLED;
try {
  rgbw = await parseJSONFileAsync(myfile);
  ...
} catch (e) {
  rgbw = ...
}

```

## API Functions

These functions throw exceptions when grammatical or format error found in the input.

### `async function parseRGBWLEDfromJSONFileAsync(filename: string): Promise<RGBWLED>`

Parse a given JSON format file `filename` and generate an `RGBWLED`.
It internally calls `parseRGBWLEDfromJSONStringAsync()`.

### `async function parseRGBWLEDfromJSONStringAsync(str: string): Promise<RGBWLED>`

Parse a given JSON format string `str` and generate an `RGBWLED`.

### `async function parseLEDChipArrayfromJSONFileAsync(filename: string): Promise<LEDChip[]>`

Parse a given JSON format file `filename` and generate an `RGBWLED`.
It internally calls `parseJSONStringAsync()`.

### `async function parseLEDChipArrayJSONStringAsync(str: string): Promise<LEDChip[]>`

Parse a given JSON format string `str` and generate an `RGBWLED`.

## JSON file/string format

```JSON
{
  "LEDChip": [
    {
      "type": "LED_R",
      "waveLength": 680,
      "maxLuminance": 30.6,
      "maxW": 1,
      "name": "my Red LED"
    },
    ...
  ],
  "RGBWLED": {
    "LED": ["my Red LED", ...],
    "name": "Sample RGBW"
  }
}
```

#### Tokens

- `LEDChip` : list of `LEDChip` class
- `type` : `LEDChipTypes` (required)
- `x`, `y` : chromaticity in CIE1931 coordinate (1)
- `waveLength` : wave length in nm (2)
- `colorTemperature` : color temperature of white light (3)
- `maxLuminance` : maximum luminance (required)
- `maxW` : maximum wattage (default = 1)
- `name` : name of this `LEDChip` (required, unique in the list of `RGBWLED`)

One and only one of tokens (1) - (3) is required. These agree to `LEDChipDefByCIExy`, `LEDChipDefByWaveLength`, `LEDChipDefByColorTemperature` respectively. See [LEDChip.md](./LEDChip.md) for more information.

- `RGBWLED` : `RGBWLED` class
- `LED` : list of `name` of `LEDChip` (required)
- `name` : name of this `RGBWLED` (optional)

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
