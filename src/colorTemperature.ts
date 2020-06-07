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
  RGB/RGBW LED class library

  Make Asayake to Wake Project.
  Kiyo Chinzei
  https://github.com/kchinzei/kch-rgbw-lib
*/

import { checkColorTemperature, kMin, kMax } from './const';
import { CSpace } from './CSpace';
import { checkCIExy, CIEfitxy2List } from './waveLength';

const kStep = 100; // step of temperature in colorTemperatureTable

// Obtain index to access colorTemperatureTable.
const kIndex = (k: number) => Math.floor((k - kMin) / kStep);

/*
  Color temperature to CIE(x,y) was found in
  http://www.vendian.org/mncharity/dir3/blackbody/UnstableURLs/bbr_color.html

  We assume that k's are with a regular step. Irregular step would need blute force search.
*/
const colorTemperatureTable: CSpace[] = makeColorTemperatureTable();

function makeColorTemperatureTable() {
  const c: number[][] = [
    [ 0.6499, 0.3474, 1000 ],
    [ 0.6361, 0.3594, 1100 ],
    [ 0.6226, 0.3703, 1200 ],
    [ 0.6095, 0.3801, 1300 ],
    [ 0.5966, 0.3887, 1400 ],
    [ 0.5841, 0.3962, 1500 ],
    [ 0.5720, 0.4025, 1600 ],
    [ 0.5601, 0.4076, 1700 ],
    [ 0.5486, 0.4118, 1800 ],
    [ 0.5375, 0.4150, 1900 ],
    [ 0.5267, 0.4173, 2000 ],
    [ 0.5162, 0.4188, 2100 ],
    [ 0.5062, 0.4196, 2200 ],
    [ 0.4965, 0.4198, 2300 ],
    [ 0.4872, 0.4194, 2400 ],
    [ 0.4782, 0.4186, 2500 ],
    [ 0.4696, 0.4173, 2600 ],
    [ 0.4614, 0.4158, 2700 ],
    [ 0.4535, 0.4139, 2800 ],
    [ 0.4460, 0.4118, 2900 ],
    [ 0.4388, 0.4095, 3000 ],
    [ 0.4320, 0.4070, 3100 ],
    [ 0.4254, 0.4044, 3200 ],
    [ 0.4192, 0.4018, 3300 ],
    [ 0.4132, 0.3990, 3400 ],
    [ 0.4075, 0.3962, 3500 ],
    [ 0.4021, 0.3934, 3600 ],
    [ 0.3969, 0.3905, 3700 ],
    [ 0.3919, 0.3877, 3800 ],
    [ 0.3872, 0.3849, 3900 ],
    [ 0.3827, 0.3820, 4000 ],
    [ 0.3784, 0.3793, 4100 ],
    [ 0.3743, 0.3765, 4200 ],
    [ 0.3704, 0.3738, 4300 ],
    [ 0.3666, 0.3711, 4400 ],
    [ 0.3631, 0.3685, 4500 ],
    [ 0.3596, 0.3659, 4600 ],
    [ 0.3563, 0.3634, 4700 ],
    [ 0.3532, 0.3609, 4800 ],
    [ 0.3502, 0.3585, 4900 ],
    [ 0.3473, 0.3561, 5000 ],
    [ 0.3446, 0.3538, 5100 ],
    [ 0.3419, 0.3516, 5200 ],
    [ 0.3394, 0.3494, 5300 ],
    [ 0.3369, 0.3472, 5400 ],
    [ 0.3346, 0.3451, 5500 ],
    [ 0.3323, 0.3431, 5600 ],
    [ 0.3302, 0.3411, 5700 ],
    [ 0.3281, 0.3392, 5800 ],
    [ 0.3261, 0.3373, 5900 ],
    [ 0.3242, 0.3355, 6000 ],
    [ 0.3223, 0.3337, 6100 ],
    [ 0.3205, 0.3319, 6200 ],
    [ 0.3188, 0.3302, 6300 ],
    [ 0.3171, 0.3286, 6400 ],
    [ 0.3155, 0.3270, 6500 ],
    [ 0.3140, 0.3254, 6600 ],
    [ 0.3125, 0.3238, 6700 ],
    [ 0.3110, 0.3224, 6800 ],
    [ 0.3097, 0.3209, 6900 ],
    [ 0.3083, 0.3195, 7000 ],
    [ 0.3070, 0.3181, 7100 ],
    [ 0.3058, 0.3168, 7200 ],
    [ 0.3045, 0.3154, 7300 ],
    [ 0.3034, 0.3142, 7400 ],
    [ 0.3022, 0.3129, 7500 ],
    [ 0.3011, 0.3117, 7600 ],
    [ 0.3000, 0.3105, 7700 ],
    [ 0.2990, 0.3094, 7800 ],
    [ 0.2980, 0.3082, 7900 ],
    [ 0.2970, 0.3071, 8000 ],
    [ 0.2961, 0.3061, 8100 ],
    [ 0.2952, 0.3050, 8200 ],
    [ 0.2943, 0.3040, 8300 ],
    [ 0.2934, 0.3030, 8400 ],
    [ 0.2926, 0.3020, 8500 ],
    [ 0.2917, 0.3011, 8600 ],
    [ 0.2910, 0.3001, 8700 ],
    [ 0.2902, 0.2992, 8800 ],
    [ 0.2894, 0.2983, 8900 ],
    [ 0.2887, 0.2975, 9000 ],
    [ 0.2880, 0.2966, 9100 ],
    [ 0.2873, 0.2958, 9200 ],
    [ 0.2866, 0.2950, 9300 ],
    [ 0.2860, 0.2942, 9400 ],
    [ 0.2853, 0.2934, 9500 ],
    [ 0.2847, 0.2927, 9600 ],
    [ 0.2841, 0.2919, 9700 ],
    [ 0.2835, 0.2912, 9800 ],
    [ 0.2829, 0.2905, 9900 ],
    [ 0.2824, 0.2898, 10000 ],
    [ 0.2818, 0.2891, 10100 ],
    [ 0.2813, 0.2884, 10200 ],
    [ 0.2807, 0.2878, 10300 ],
    [ 0.2802, 0.2871, 10400 ],
    [ 0.2797, 0.2865, 10500 ],
    [ 0.2792, 0.2859, 10600 ],
    [ 0.2788, 0.2853, 10700 ],
    [ 0.2783, 0.2847, 10800 ],
    [ 0.2778, 0.2841, 10900 ],
    [ 0.2774, 0.2836, 11000 ],
    [ 0.2770, 0.2830, 11100 ],
    [ 0.2765, 0.2825, 11200 ],
    [ 0.2761, 0.2819, 11300 ],
    [ 0.2757, 0.2814, 11400 ],
    [ 0.2753, 0.2809, 11500 ],
    [ 0.2749, 0.2804, 11600 ],
    [ 0.2745, 0.2799, 11700 ],
    [ 0.2742, 0.2794, 11800 ],
    [ 0.2738, 0.2789, 11900 ],
    [ 0.2734, 0.2785, 12000 ],
    [ 0.2731, 0.2780, 12100 ],
    [ 0.2727, 0.2776, 12200 ],
    [ 0.2724, 0.2771, 12300 ],
    [ 0.2721, 0.2767, 12400 ],
    [ 0.2717, 0.2763, 12500 ],
    [ 0.2714, 0.2758, 12600 ],
    [ 0.2711, 0.2754, 12700 ],
    [ 0.2708, 0.2750, 12800 ],
    [ 0.2705, 0.2746, 12900 ],
    [ 0.2702, 0.2742, 13000 ],
    [ 0.2699, 0.2738, 13100 ],
    [ 0.2696, 0.2735, 13200 ],
    [ 0.2694, 0.2731, 13300 ],
    [ 0.2691, 0.2727, 13400 ],
    [ 0.2688, 0.2724, 13500 ],
    [ 0.2686, 0.2720, 13600 ],
    [ 0.2683, 0.2717, 13700 ],
    [ 0.2680, 0.2713, 13800 ],
    [ 0.2678, 0.2710, 13900 ],
    [ 0.2675, 0.2707, 14000 ],
    [ 0.2673, 0.2703, 14100 ],
    [ 0.2671, 0.2700, 14200 ],
    [ 0.2668, 0.2697, 14300 ],
    [ 0.2666, 0.2694, 14400 ],
    [ 0.2664, 0.2691, 14500 ],
    [ 0.2662, 0.2688, 14600 ],
    [ 0.2659, 0.2685, 14700 ],
    [ 0.2657, 0.2682, 14800 ],
    [ 0.2655, 0.2679, 14900 ],
    [ 0.2653, 0.2676, 15000 ],
    [ 0.2651, 0.2673, 15100 ],
    [ 0.2649, 0.2671, 15200 ],
    [ 0.2647, 0.2668, 15300 ],
    [ 0.2645, 0.2665, 15400 ],
    [ 0.2643, 0.2663, 15500 ],
    [ 0.2641, 0.2660, 15600 ],
    [ 0.2639, 0.2657, 15700 ],
    [ 0.2638, 0.2655, 15800 ],
    [ 0.2636, 0.2652, 15900 ],
    [ 0.2634, 0.2650, 16000 ],
    [ 0.2632, 0.2648, 16100 ],
    [ 0.2631, 0.2645, 16200 ],
    [ 0.2629, 0.2643, 16300 ],
    [ 0.2627, 0.2641, 16400 ],
    [ 0.2626, 0.2638, 16500 ],
    [ 0.2624, 0.2636, 16600 ],
    [ 0.2622, 0.2634, 16700 ],
    [ 0.2621, 0.2632, 16800 ],
    [ 0.2619, 0.2629, 16900 ],
    [ 0.2618, 0.2627, 17000 ],
    [ 0.2616, 0.2625, 17100 ],
    [ 0.2615, 0.2623, 17200 ],
    [ 0.2613, 0.2621, 17300 ],
    [ 0.2612, 0.2619, 17400 ],
    [ 0.2610, 0.2617, 17500 ],
    [ 0.2609, 0.2615, 17600 ],
    [ 0.2608, 0.2613, 17700 ],
    [ 0.2606, 0.2611, 17800 ],
    [ 0.2605, 0.2609, 17900 ],
    [ 0.2604, 0.2607, 18000 ],
    [ 0.2602, 0.2606, 18100 ],
    [ 0.2601, 0.2604, 18200 ],
    [ 0.2600, 0.2602, 18300 ],
    [ 0.2598, 0.2600, 18400 ],
    [ 0.2597, 0.2598, 18500 ],
    [ 0.2596, 0.2597, 18600 ],
    [ 0.2595, 0.2595, 18700 ],
    [ 0.2593, 0.2593, 18800 ],
    [ 0.2592, 0.2592, 18900 ],
    [ 0.2591, 0.2590, 19000 ],
    [ 0.2590, 0.2588, 19100 ],
    [ 0.2589, 0.2587, 19200 ],
    [ 0.2588, 0.2585, 19300 ],
    [ 0.2587, 0.2584, 19400 ],
    [ 0.2586, 0.2582, 19500 ],
    [ 0.2584, 0.2580, 19600 ],
    [ 0.2583, 0.2579, 19700 ],
    [ 0.2582, 0.2577, 19800 ],
    [ 0.2581, 0.2576, 19900 ],
    [ 0.2580, 0.2574, 20000 ],
    [ 0.2579, 0.2573, 20100 ]
  ];
  const t: CSpace[] = new Array(c.length) as CSpace[];
  for (let i=0; i<c.length; i++)
    t[i] = new CSpace('xy', c[i]);
  return t;
}

export function CIEk2x(k: number): number {
  k = checkColorTemperature(k);
  const i = kIndex(k);
  const k1 = i * kStep + kMin;

  if (k === k1) {
    return colorTemperatureTable[i].x;
  } else {
    const k2 = k1 + kStep;
    const x1 = colorTemperatureTable[i].x;
    const x2 = colorTemperatureTable[i+1].x;

    return ((k - k1)*x2 + (k2 - k)*x1) / kStep;
  }
}

export function CIEk2y(k: number): number {
  k = checkColorTemperature(k);
  const i = kIndex(k);
  const k1 = i * kStep + kMin;

  if (k === k1) {
    return colorTemperatureTable[i].y;
  } else {
    const k2 = k1 + kStep;
    const y1 = colorTemperatureTable[i].y;
    const y2 = colorTemperatureTable[i+1].y;

    return ((k - k1)*y2 + (k2 - k)*y1) / kStep;
  }
}

export function CIExy2k(xy: CSpace): number {
  if (xy.type !== 'xy' && xy.type !== 'xyY')
    throw new Error('CIExy2k() requires a CSpace in xy or xyY');
  let x = xy.x;
  let y = xy.y;

  if (checkCIExy(xy) === false) {
    const nmxy: CSpace = CIEfitxy2List(xy);
    x = nmxy.x;
    y = nmxy.y;
  }

  // Optimized McCamy's approximation for Correlating Color Temperature
  // https://www.waveformlighting.com/tech/calculate-color-temperature-cct-from-cie-1931-xy-coordinates
  // Optimization done by Monte Carlo in 3 range of templeratures.

  // k < 2000k
  const xCr0 = 0.3333;
  const yCr0 = 0.2017;
  // 2000k < k < 10000k
  const xCr1 = 0.3342;
  const yCr1 = 0.1882;
  // 10000k < k
  const xCr2 = 0.3115;
  const yCr2 = 0.2119;

  if (y <= yCr2) {
    // This area appears very odd for example,
    // - Very cold in even in blue,
    // - Singularity around the critical points.
    // DIV/0 errors at the critical points.
    return kMax;
  }

  // Calculate using three conditions.
  // 2000k < k < 10000k
  let n3 = 498;
  let n2 = 3586;
  let n1 = 6846;
  let n0 = 5502;
  let n = (x - xCr1) / (yCr1 - y);
  const k1 = n3*n*n*n + n2*n*n + n1*n + n0;

  // k < 2000k
  n3 = 549;
  n2 = 3011;
  n1 = 5920;
  n0 = 5281;
  n = (x - xCr0) / (yCr0 - y);
  const k0 = n3*n*n*n + n2*n*n + n1*n + n0;

  // 10000k < k
  n3 = 498;
  n2 = 3158;
  n1 = 6561;
  n0 = 7120;
  n = (x - xCr2) / (yCr2 - y);
  const k2 = n3*n*n*n + n2*n*n + n1*n + n0;

  if (k2 > 10000) {
    return checkColorTemperature(k2);
  } else if (k0 < 2000) {
    return checkColorTemperature(k0);
  }
  return checkColorTemperature(k1);
}

const linearFade = (r: number) => (r);

export function CIEfadeout(xy0: CSpace, steps: number, fade?: (r: number) => number): CSpace[] {
  if (xy0.type !== 'xy' && xy0.type !== 'xyY')
    throw new Error('CIEfadeout() requires a start color in xy or xyY');

  if (typeof(fade) === 'undefined') fade = linearFade;

  const x = xy0.x;
  const y = xy0.y;
  const kStart = CIExy2k(xy0);
  const kEnd = 1000;
  const fadeVals: CSpace[] = new Array(steps) as CSpace[];

  for (let i=0; i<steps-1; i++) {
    const r1 = fade(i / steps);
    const r0 = 1 - r1;
    const k = kStart*r0 + kEnd*r1;

    fadeVals[i] = new CSpace('xy', [x*r0 + CIEk2x(k)*r1, y*r0 + CIEk2y(k)*r1, k]);
  }
  fadeVals[steps-1] = new CSpace('xy', [CIEk2x(kEnd), CIEk2y(kEnd), kEnd]);

  return fadeVals;
}

export function CIEfadein(xy0: CSpace, steps: number, fade?: (r: number) => number): CSpace[] {
  // FixMe: fade should be reversed also.
  const fadeArray: CSpace[] = CIEfadeout(xy0, steps, fade);

  // Reverse
  const iCount = Math.floor(steps/2);
  // TODO use reverse()
  for (let i=0; i<iCount; i++) {
    const tmp: CSpace = fadeArray[i];
    fadeArray[i] = fadeArray[iCount-1-i];
    fadeArray[iCount-1-i] = tmp;
  }
  return fadeArray;
}
