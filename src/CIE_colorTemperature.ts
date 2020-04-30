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

import { checkCIExy, CIEnmxyType, CIEfitxy2nm } from './CIE_waveLength';

const kStep = 100; // step of temperature in colorTemperatureTable
const kMin = 1000;
const kMax = 20000;
// const xMin = 0.2580;
// const xMax = 0.6499;
// const yMin = 0.2574;
// const yMax = 0.4198;

// Obtain index to access colorTemperatureTable.
const kIndex = (k: number) => Math.floor((k - kMin) / kStep);

export type CIEkxyType = { k: number; x: number; y: number };
export const CIEk57kWhite: CIEkxyType = { k: 5700, x: 0.3302, y: 0.3411 };
export const CIEk65kWhite: CIEkxyType = { k: 6500, x: 0.3155, y: 0.3270 };

export function checkColorTemperature(k: number): number {
  if (k < kMin) return kMin;
  if (k > kMax) return kMax;
  return k;
}

/*
  Color temperature to CIE(x,y) was found in
  http://www.vendian.org/mncharity/dir3/blackbody/UnstableURLs/bbr_color.html

  We assume that k's are with a regular step. Irregular step would need blute force search.
*/
const colorTemperatureTable: CIEkxyType[] = [
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
  { k: 10100, x: 0.2818, y: 0.2891 },
  { k: 10200, x: 0.2813, y: 0.2884 },
  { k: 10300, x: 0.2807, y: 0.2878 },
  { k: 10400, x: 0.2802, y: 0.2871 },
  { k: 10500, x: 0.2797, y: 0.2865 },
  { k: 10600, x: 0.2792, y: 0.2859 },
  { k: 10700, x: 0.2788, y: 0.2853 },
  { k: 10800, x: 0.2783, y: 0.2847 },
  { k: 10900, x: 0.2778, y: 0.2841 },
  { k: 11000, x: 0.2774, y: 0.2836 },
  { k: 11100, x: 0.2770, y: 0.2830 },
  { k: 11200, x: 0.2765, y: 0.2825 },
  { k: 11300, x: 0.2761, y: 0.2819 },
  { k: 11400, x: 0.2757, y: 0.2814 },
  { k: 11500, x: 0.2753, y: 0.2809 },
  { k: 11600, x: 0.2749, y: 0.2804 },
  { k: 11700, x: 0.2745, y: 0.2799 },
  { k: 11800, x: 0.2742, y: 0.2794 },
  { k: 11900, x: 0.2738, y: 0.2789 },
  { k: 12000, x: 0.2734, y: 0.2785 },
  { k: 12100, x: 0.2731, y: 0.2780 },
  { k: 12200, x: 0.2727, y: 0.2776 },
  { k: 12300, x: 0.2724, y: 0.2771 },
  { k: 12400, x: 0.2721, y: 0.2767 },
  { k: 12500, x: 0.2717, y: 0.2763 },
  { k: 12600, x: 0.2714, y: 0.2758 },
  { k: 12700, x: 0.2711, y: 0.2754 },
  { k: 12800, x: 0.2708, y: 0.2750 },
  { k: 12900, x: 0.2705, y: 0.2746 },
  { k: 13000, x: 0.2702, y: 0.2742 },
  { k: 13100, x: 0.2699, y: 0.2738 },
  { k: 13200, x: 0.2696, y: 0.2735 },
  { k: 13300, x: 0.2694, y: 0.2731 },
  { k: 13400, x: 0.2691, y: 0.2727 },
  { k: 13500, x: 0.2688, y: 0.2724 },
  { k: 13600, x: 0.2686, y: 0.2720 },
  { k: 13700, x: 0.2683, y: 0.2717 },
  { k: 13800, x: 0.2680, y: 0.2713 },
  { k: 13900, x: 0.2678, y: 0.2710 },
  { k: 14000, x: 0.2675, y: 0.2707 },
  { k: 14100, x: 0.2673, y: 0.2703 },
  { k: 14200, x: 0.2671, y: 0.2700 },
  { k: 14300, x: 0.2668, y: 0.2697 },
  { k: 14400, x: 0.2666, y: 0.2694 },
  { k: 14500, x: 0.2664, y: 0.2691 },
  { k: 14600, x: 0.2662, y: 0.2688 },
  { k: 14700, x: 0.2659, y: 0.2685 },
  { k: 14800, x: 0.2657, y: 0.2682 },
  { k: 14900, x: 0.2655, y: 0.2679 },
  { k: 15000, x: 0.2653, y: 0.2676 },
  { k: 15100, x: 0.2651, y: 0.2673 },
  { k: 15200, x: 0.2649, y: 0.2671 },
  { k: 15300, x: 0.2647, y: 0.2668 },
  { k: 15400, x: 0.2645, y: 0.2665 },
  { k: 15500, x: 0.2643, y: 0.2663 },
  { k: 15600, x: 0.2641, y: 0.2660 },
  { k: 15700, x: 0.2639, y: 0.2657 },
  { k: 15800, x: 0.2638, y: 0.2655 },
  { k: 15900, x: 0.2636, y: 0.2652 },
  { k: 16000, x: 0.2634, y: 0.2650 },
  { k: 16100, x: 0.2632, y: 0.2648 },
  { k: 16200, x: 0.2631, y: 0.2645 },
  { k: 16300, x: 0.2629, y: 0.2643 },
  { k: 16400, x: 0.2627, y: 0.2641 },
  { k: 16500, x: 0.2626, y: 0.2638 },
  { k: 16600, x: 0.2624, y: 0.2636 },
  { k: 16700, x: 0.2622, y: 0.2634 },
  { k: 16800, x: 0.2621, y: 0.2632 },
  { k: 16900, x: 0.2619, y: 0.2629 },
  { k: 17000, x: 0.2618, y: 0.2627 },
  { k: 17100, x: 0.2616, y: 0.2625 },
  { k: 17200, x: 0.2615, y: 0.2623 },
  { k: 17300, x: 0.2613, y: 0.2621 },
  { k: 17400, x: 0.2612, y: 0.2619 },
  { k: 17500, x: 0.2610, y: 0.2617 },
  { k: 17600, x: 0.2609, y: 0.2615 },
  { k: 17700, x: 0.2608, y: 0.2613 },
  { k: 17800, x: 0.2606, y: 0.2611 },
  { k: 17900, x: 0.2605, y: 0.2609 },
  { k: 18000, x: 0.2604, y: 0.2607 },
  { k: 18100, x: 0.2602, y: 0.2606 },
  { k: 18200, x: 0.2601, y: 0.2604 },
  { k: 18300, x: 0.2600, y: 0.2602 },
  { k: 18400, x: 0.2598, y: 0.2600 },
  { k: 18500, x: 0.2597, y: 0.2598 },
  { k: 18600, x: 0.2596, y: 0.2597 },
  { k: 18700, x: 0.2595, y: 0.2595 },
  { k: 18800, x: 0.2593, y: 0.2593 },
  { k: 18900, x: 0.2592, y: 0.2592 },
  { k: 19000, x: 0.2591, y: 0.2590 },
  { k: 19100, x: 0.2590, y: 0.2588 },
  { k: 19200, x: 0.2589, y: 0.2587 },
  { k: 19300, x: 0.2588, y: 0.2585 },
  { k: 19400, x: 0.2587, y: 0.2584 },
  { k: 19500, x: 0.2586, y: 0.2582 },
  { k: 19600, x: 0.2584, y: 0.2580 },
  { k: 19700, x: 0.2583, y: 0.2579 },
  { k: 19800, x: 0.2582, y: 0.2577 },
  { k: 19900, x: 0.2581, y: 0.2576 },
  { k: 20000, x: 0.2580, y: 0.2574 },
  { k: 20100, x: 0.2579, y: 0.2573 }
];

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

export function CIExy2k(x: number, y: number): number {
  if (checkCIExy(x, y) === false) {
    const nmxy: CIEnmxyType = CIEfitxy2nm(x, y);
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

export function CIEfadeout(x: number, y: number, steps: number, fade?: (r: number) => number): CIEkxyType[] {
  if (typeof(fade) === 'undefined') fade = linearFade;

  const kStart = CIExy2k(x, y);
  const kEnd = 1000;
  const fadeVals: CIEkxyType[] = new Array(steps);

  for (let i=0; i<steps; i++) {
    const r1 = fade(i / steps);
    const r0 = 1 - r1;
    const k = kStart*r0 + kEnd*r1;

    fadeVals[i] = { k, x: x*r0 + CIEk2x(k)*r1, y: y*r0 + CIEk2y(k)*r1 };
  }

  return fadeVals;
}

export function CIEfadein(x: number, y: number, steps: number, fade?: (r: number) => number): CIEkxyType[] {
  const fadeArray: CIEkxyType[] = CIEfadeout(x, y, steps, fade);

  // Reverse
  const iCount = Math.floor(steps/2);
  for (let i=0; i<iCount; i++) {
    const tmp: CIEkxyType = fadeArray[i];
    fadeArray[i] = fadeArray[iCount-1-i];
    fadeArray[iCount-1-i] = tmp;
  }
  return fadeArray;
}
