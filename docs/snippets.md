# Code Snippets

It is a part of [kch-rgbw-lib](https://github.com/kchinzei/kch-rgbw-lib).
See [README.md](https://github.com/kchinzei/kch-rgbw-lib/#README.md)
for general information.

## Ex01 : Import everything

In TypeScript/ES2015 you can lazily load and use everything by:

```TypeScript
import * as foo from 'kch-rgbw-lib';
const c = new foo.CSpace('xyY', [0.3, 0.4, 1]);
```

But you need to use `foo.` everywhere.
In the later snippets we import necessary staff only.

## Ex02 : Populate an `LEDChip`

`LEDChip` class represents a physical LED. You can populate an `LEDChip` by:

```Typescript
import { LEDChip } from 'kch-rgbw-lib';
const rLED = new LEDChip('LED_R', { x: 0.6857, y: 0.3143, maxLuminance: 30.6, name: 'Red' });
```

If you don't know `maxLuminance`, you can set 1 to all LEDs.

## Ex03 : Populate a `RGBWLED`

`RGBWLED` class represents a compsote LED that has 3 or more `LEDChip`. You can populate a `RGBWLED` by:

```Typescript
import { LEDChip, RGBWLED } from 'kch-rgbw-lib';
const rLED = new LEDChip('LED_R', { x: 0.6857, y: 0.3143, maxLuminance: 30.6, name: 'Red' });
const gLED = new LEDChip('LED_G', { x: 0.2002, y: 0.6976, maxLuminance: 67.2, name: 'Green' });
const bLED = new LEDChip('LED_B', { x: 0.1417, y: 0.0618, maxLuminance: 8.2,  name: 'Blue' });
const rgb = new RGBWLED('sample', [rLED, gLED, bLED]);
```

## Ex04 : Instantiate from a JSON file

You can instantiate `RGBWLED` class object it much easier by preparing a JSON file and read it by:

```Typescript
import { parseRGBWLEDfromJSONFileAsync, RGBWLED } from 'kch-rgbw-lib';
try {
    const rgb: RGBWLED = await parseRGBWLEDfromJSONFileAsync('./foo.json');
} catch (e) {
    console.log(e);
}
```

You can also instantiate `LEDChip` array by `parseLEDChipArrayfromJSONFileAsync()`.
For the JSON format, please refer to 'JSON file/string format'.
You can also instantiate `RGBWLED` from a string variable by `parseRGBWLEDfromJSONStringAsync()`:

```Typescript
import { parseRGBWLEDfromJSONFileAsync, RGBWLED } from 'kch-rgbw-lib';
let json_str = `{
  "LEDChip": [
    ...
  ],
  "RGBWLED": {
    ...
  }
}`;
try {
    const rgb: RGBWLED = await parseRGBWLEDfromJSONStringAsync(json_str);
} catch (e) {
    console.log(e);
}
```

## Ex05 Compute brightness of LEDs for composite color

After populating a `RGBWLED` you can use it to compute array of brightness of LEDs to represent a composite color.
This example follows the snippet of Ex03.

```Typescript
// (after instantiating rgb in Ex03)
const c = new CSpace('xyY', [0.32, 0.4, 20]);
const brightness: number[] = await rgb.color2AlphaAsync(c);
```

Note it does not update `rgb` itself. To do so, you use `setColorAsync()`.

```Typescript
// (after instantiating rgb in Ex03)
const c = new CSpace('xyY', [0.32, 0.4, 20]);
await rgb.setColorAsync(c);
```

## Ex06 Compute brightness of LEDs for composite color, using RGB color

If you compute array of brightness of LEDs from RGB color, you need to specify luminance independently.
This example follows the snippet of Ex03.

```Typescript
// (after instantiating rgb in Ex03)
const c = new CSpace('rgb', [0.3, 0.4, 0.5]);
const c1 = c.xyY();   // Convert to xyY space.
c1.Y = 20;            // Set luminance.
const brightness: number[] = await rgb.color2AlphaAsync(c1);
```

It is also the case for HSV color space, even it has brightness in V.
You may wonder why we don't use brigtness component of RGB or HSV space.
It's because the brightness of these color spaces is relative to full brigtness,
but it's unclear what is full brightness for these color spaces.
Please refer to ['Luminance and brightness' of `kch-rgbw-lib`](https://github.com/kchinzei/kch-rgbw-lib/blob/master/docs/RGBWLED.md#luminance-and-brightness).

Not giving luminance will also give you correct answer, but it may give you very dark composite color.
When this happens, you may magnify `brightness_array` to get meaningful brightness.
It usually gives the same result as doing so in Ex06.
It can be different, when there is

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