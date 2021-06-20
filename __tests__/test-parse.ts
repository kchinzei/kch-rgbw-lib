/*
The MIT License (MIT)

Copyright (c) Kiyo Chinzei (kchinzei@gmail.com)

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
*/

/*
  RGB/RGBW LED class library.

  Make Asayake to Wake Project.
  Kiyo Chinzei
  https://github.com/kchinzei/kch-rgbw-lib
*/
// @ts-ignore: TS6133 List all available items for future tests
import { RGBWLED } from '../src/RGBWLED';
import { LEDChip } from '../src/LEDChip';
// @ts-ignore: TS6133 List all available items for future tests
import { parseRGBWLEDfromJSONFileAsync, parseLEDChipArrayfromJSONFileAsync } from '../src/parse';


let i = 1;


describe.each([
  [ './__tests__/json/rgbw-led-01.json', 4 ],
  [ './__tests__/json/rgbw-led-02.json', 4 ]
])('', (json, N) => {
  test(`${i++}. parseJson ${json} should success)`, () => {
    return parseRGBWLEDfromJSONFileAsync(json).then(l => {
      expect(l.LED.length).toBe(N);
    });
  });
  test(`${i++}. parseJson ${json} should success)`, () => {
    return parseLEDChipArrayfromJSONFileAsync(json).then(l => {
      expect(l.length).toBe(N);
    });
  });
});

describe.each([
  [ './__tests__/json/rgbw-led-err01.json', 4 ],
  [ './__tests__/json/rgbw-led-err02.json', 4 ],
  [ './__tests__/json/rgbw-led-err03.json', 4 ],
  [ './__tests__/json/rgbw-led-err04.json', 4 ],
  [ './__tests__/json/rgbw-led-err05.json', 4 ],
  [ './__tests__/json/rgbw-led-err06.json', 4 ],
  [ './__tests__/json/rgbw-led-err07.json', 2 ]
])('', (json, N) => {
  test(`${i++}. parseJson ${json} should fail)`, async () => {
    const parsePromise: Promise<RGBWLED> =  parseRGBWLEDfromJSONFileAsync(json);
    await expect(parsePromise).rejects.toThrow();
  });
});

describe.each([
  [ './__tests__/json/rgbw-led-err01.json', 4 ],
  [ './__tests__/json/rgbw-led-err02.json', 4 ],
  // [ './__tests__/json/rgbw-led-err03.json', 4 ],
  [ './__tests__/json/rgbw-led-err04.json', 4 ],
  [ './__tests__/json/rgbw-led-err05.json', 4 ],
  [ './__tests__/json/rgbw-led-err06.json', 4 ],
  // [ './__tests__/json/rgbw-led-err07.json', 2 ]
])('', (json, N) => {
  test(`${i++}. parseJson ${json} should fail)`, async () => {
    const parsePromise: Promise<LEDChip[]> =  parseLEDChipArrayfromJSONFileAsync(json);
    await expect(parsePromise).rejects.toThrow();
  });
});