## LEDChip / RGBWLED Parser

It is a part of [kch-rgbw-lib](https://github.com/kchinzei/kch-rgbw-lib).
See [README.md](https://github.com/kchinzei/kch-rgbw-lib/#README.md)
for general information.

### Code snippet

In TypeScript/ES2015:

```TypeScript
import { LEDChip, RGBWLED } from 'kch-rgbw-lib';
import { ???????????????? } from 'kch-rgbw-lib';

```

## API

### Functions

##### async function parseJSONFileAsync(filename: string): Promise\<RGBWLED\>

Parse a given JSON format file `filename` and generate an `RGBWLED`.
It internally calls `parseJSONStringAsync()`.

##### async function parseJSONStringAsync(str: string): Promise\<RGBWLED\>

Parse a given JSON format string `str` and generate an `RGBWLED`.

##### async function parseLEDChipAsync(obj: any): Promise\<LEDChip\>

##### async function parseLEDChipArrayAsync(obj: any): Promise\<LEDChip[]\>

Parse and generate an `LEDChip` or an array of `LEDChip`. These are part of `parseJSONStringAsync()`.

##### async function parseRGBWLEDAsync(obj: any, sourceLEDs: LEDChip[]): Promise\<RGBWLED\>

Parse and generate an `RGBWLED`. These are part of `parseJSONStringAsync()`.

## JSON file/string format

```JSON
{
  "LEDChip": [
    {
      "type": "LED_R",
      "waveLength": 680,
      "maxLuminance": 30.6,
      "maxW": 1,
      "name": "Typical R"
    },
    ...
  ],
  "RGBWLED": {
    "LED": ["Typical R", ...],
    "name": "Sample RGBW"
  }
}
```

JSON string

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
