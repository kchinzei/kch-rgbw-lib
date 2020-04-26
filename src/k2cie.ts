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
  RGB/RGBW LED class library. It provides following functions,

  Make Asayake to Wake Project.
  Kiyo Chinzei
  https://github.com/kchinzei/raspi-pca9685-pwm
*/

const kStep = 100; // step of temperature in colorTemperatureTable
const minK = 1000;
const maxK = 10000;
const minX = 0.2824;
const maxX = 0.6499;
const minY = 0.2898;
const maxY = 0.4198;

export type CIEkxyType = { k: number, x: number, y: number };
export CIEk57kWhite: CIEkxyType = { k: 5700, x: 0.3302, y: 0.3411 };
export CIEk65kWhite: CIEkxyType = { k: 6500, x: 0.3155, y: 0.3270 };

const criticalKXY: CIEkxyType = { k: 5517, x: 0.3320, y: 0.1858 };

function checkK(k: number): number {
  if (k < minK) k = minK;
  if (k > maxK) k = maxK;
  return k;
}

function checkX(x: number): number {
  if (x < minK) x = minX;
  if (x > maxK) x = maxX;
  return x;
}

function checkY(y: number): number {
  if (y < minY) y = minY;
  if (y > maxY) y = maxY;
  return y;
}

/*
  Color temperature to CIE(x,y) was found in
  http://www.vendian.org/mncharity/dir3/blackbody/UnstableURLs/bbr_color.html
*/
const colorTemperatureTable: CIEkxyType[] = [
  { k: 900,  x: 0.6499, y: 0.3474 }, // Dummy to avoid error when k=1000
  { k: 1000, x: 0.6499, y: 0.3474 },
  { k: 1100, x: 0.6361, y: 0.3594 },
  { k: 1200, x: 0.6226, y: 0.3703 },
  { k: 1300, x: 0.6095, y: 0.3801 },
  { k: 1400, x: 0.5966, y: 0.3887 },
  { k: 1500, x: 0.5841, y: 0.3962 },
  { k: 1600, x: 0.5720, y: 0.4025 },
  { k: 1700, x: 0.5601, y: 0.4076 },
  { k: 1800, x: 0.5486, y: 0.4118 },
  { k: 1900, x: 0.5375, y: 0.4150 },
  { k: 2000, x: 0.5267, y: 0.4173 },
  { k: 2100, x: 0.5162, y: 0.4188 },
  { k: 2200, x: 0.5062, y: 0.4196 },
  { k: 2300, x: 0.4965, y: 0.4198 },
  { k: 2400, x: 0.4872, y: 0.4194 },
  { k: 2500, x: 0.4782, y: 0.4186 },
  { k: 2600, x: 0.4696, y: 0.4173 },
  { k: 2700, x: 0.4614, y: 0.4158 },
  { k: 2800, x: 0.4535, y: 0.4139 },
  { k: 2900, x: 0.4460, y: 0.4118 },
  { k: 3000, x: 0.4388, y: 0.4095 },
  { k: 3100, x: 0.4320, y: 0.4070 },
  { k: 3200, x: 0.4254, y: 0.4044 },
  { k: 3300, x: 0.4192, y: 0.4018 },
  { k: 3400, x: 0.4132, y: 0.3990 },
  { k: 3500, x: 0.4075, y: 0.3962 },
  { k: 3600, x: 0.4021, y: 0.3934 },
  { k: 3700, x: 0.3969, y: 0.3905 },
  { k: 3800, x: 0.3919, y: 0.3877 },
  { k: 3900, x: 0.3872, y: 0.3849 },
  { k: 4000, x: 0.3827, y: 0.3820 },
  { k: 4100, x: 0.3784, y: 0.3793 },
  { k: 4200, x: 0.3743, y: 0.3765 },
  { k: 4300, x: 0.3704, y: 0.3738 },
  { k: 4400, x: 0.3666, y: 0.3711 },
  { k: 4500, x: 0.3631, y: 0.3685 },
  { k: 4600, x: 0.3596, y: 0.3659 },
  { k: 4700, x: 0.3563, y: 0.3634 },
  { k: 4800, x: 0.3532, y: 0.3609 },
  { k: 4900, x: 0.3502, y: 0.3585 },
  { k: 5000, x: 0.3473, y: 0.3561 },
  { k: 5100, x: 0.3446, y: 0.3538 },
  { k: 5200, x: 0.3419, y: 0.3516 },
  { k: 5300, x: 0.3394, y: 0.3494 },
  { k: 5400, x: 0.3369, y: 0.3472 },
  { k: 5500, x: 0.3346, y: 0.3451 },
  { k: 5600, x: 0.3323, y: 0.3431 },
  CIEk57kWhite,
  { k: 5800, x: 0.3281, y: 0.3392 },
  { k: 5900, x: 0.3261, y: 0.3373 },
  { k: 6000, x: 0.3242, y: 0.3355 },
  { k: 6100, x: 0.3223, y: 0.3337 },
  { k: 6200, x: 0.3205, y: 0.3319 },
  { k: 6300, x: 0.3188, y: 0.3302 },
  { k: 6400, x: 0.3171, y: 0.3286 },
  CIEk65kWhite,
  { k: 6600, x: 0.3140, y: 0.3254 },
  { k: 6700, x: 0.3125, y: 0.3238 },
  { k: 6800, x: 0.3110, y: 0.3224 },
  { k: 6900, x: 0.3097, y: 0.3209 },
  { k: 7000, x: 0.3083, y: 0.3195 },
  { k: 7100, x: 0.3070, y: 0.3181 },
  { k: 7200, x: 0.3058, y: 0.3168 },
  { k: 7300, x: 0.3045, y: 0.3154 },
  { k: 7400, x: 0.3034, y: 0.3142 },
  { k: 7500, x: 0.3022, y: 0.3129 },
  { k: 7600, x: 0.3011, y: 0.3117 },
  { k: 7700, x: 0.3000, y: 0.3105 },
  { k: 7800, x: 0.2990, y: 0.3094 },
  { k: 7900, x: 0.2980, y: 0.3082 },
  { k: 8000, x: 0.2970, y: 0.3071 },
  { k: 8100, x: 0.2961, y: 0.3061 },
  { k: 8200, x: 0.2952, y: 0.3050 },
  { k: 8300, x: 0.2943, y: 0.3040 },
  { k: 8400, x: 0.2934, y: 0.3030 },
  { k: 8500, x: 0.2926, y: 0.3020 },
  { k: 8600, x: 0.2917, y: 0.3011 },
  { k: 8700, x: 0.2910, y: 0.3001 },
  { k: 8800, x: 0.2902, y: 0.2992 },
  { k: 8900, x: 0.2894, y: 0.2983 },
  { k: 9000, x: 0.2887, y: 0.2975 },
  { k: 9100, x: 0.2880, y: 0.2966 },
  { k: 9200, x: 0.2873, y: 0.2958 },
  { k: 9300, x: 0.2866, y: 0.2950 },
  { k: 9400, x: 0.2860, y: 0.2942 },
  { k: 9500, x: 0.2853, y: 0.2934 },
  { k: 9600, x: 0.2847, y: 0.2927 },
  { k: 9700, x: 0.2841, y: 0.2919 },
  { k: 9800, x: 0.2835, y: 0.2912 },
  { k: 9900, x: 0.2829, y: 0.2905 },
  { k: 10000, x: 0.2824, y: 0.2898 },
  { k: 10100, x: 0.2824, y: 0.2898 } // Dummy to avoid error when k=10000
];

export CIEk2x(k: number): number {
  k = checkK(k);
  const k1 = Math.floor(k / kStep) * kStep;
  const k2 = k1 + kStep;

  const x1 = colorTemperatureTable.x[k1];
  const x2 = colorTemperatureTable.x[k2];

  return ((k - k1)*x2 + (k2 - k)*x1) / kStep;
}

export CIEk2y(k: number): number {
  k = checkK(k);
  const k1 = Math.floor(k / kStep) * kStep;
  const k2 = k1 + kStep;

  const y1 = colorTemperatureTable.y[k1];
  const y2 = colorTemperatureTable.y[k2];

  return ((k - k1)*y2 + (k2 - k)*y1) / kStep;
}

export function CIExy2k(x: number, y: number): number {
  x = checkX(x);
  y = checkY(y);
  if (y == criticalKXY.y) {
    return criticalKXY.k;
  } else {
    // McCamy's approximation for Correlating Color Temperature
    // https://www.waveformlighting.com/tech/calculate-color-temperature-cct-from-cie-1931-xy-coordinates
    const n = (x - criticalKXY.x) / (criticalKXY.y - y);
    return 437*n*n*n + 3601*n*n + 6861*n + criticalKXY.k;
  }
}

function linearFade(r: number): number {
  if (r < 0) r = 0;
  if (r > 1) r = 1;
  return r;
}

export function CIEfadeout(x: number, y: number, steps: number, fade?: (r: number) => number): CIEkxyType[] {
  x = checkX(x);
  y = checkY(y);
  if (typeof(fade) === 'undefined') fade = linearFade;
  
  const kStart = CIExy2k(x, y);
  const kEnd = 1000;

  let fadeVals[steps]: CIEkxyType;

  for (let i=0; i<steps; i++) {
    const r1 = fade(i / steps);
    const r0 = 1 - r0;
    const k = kStart*r0 + kEnd*r1;
    
    fadeVals[i].k = k;
    fadeVals[i].x = x*r0 + CIEk2x(k)*r1;
    fadeVals[i].y = y*r0 + CIEk2y(k)*r1;
  }

  return fadeVals;
}

export function CIEfadein(x: number, y: number, steps: number, fade?: (r: number) => number): CIEkxyType[] {
  x = checkX(x);
  y = checkY(y);
  if (typeof(fade) === 'undefined') fade = linearFade;
  
  const kStart = 1000;
  const kEnd = CIExy2k(x, y);

  let fadeVals[steps]: CIEkxyType;

  for (let i=0; i<steps; i++) {
    const r1 = fade(i / steps);
    const r0 = 1 - r0;
    const k = kStart*r0 + kEnd*r1;
    
    fadeVals[i].k = k;
    fadeVals[i].x = CIEk2x(k)*r0 + x*r1;
    fadeVals[i].y = CIEk2y(k)*r0 + y*r1;
  }

  return fadeVals;
}
