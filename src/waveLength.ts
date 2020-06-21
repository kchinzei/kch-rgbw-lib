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

import { checkWaveLength, nmMin } from './const';
import { CSpace } from './CSpace';

const nmStep = 5; // step of temperature in waveLengthTable

// Obtain index to access waveLengthTable.
const nmIndex = (nm: number) => Math.floor((nm - nmMin) / nmStep);

export const checkCIExy: (xy: CSpace) => boolean = (xy: CSpace) => checkCIExyInList(xy);

export function checkCIExyInList(xy: CSpace, xyList?: CSpace[]): boolean {
  if (xy.type !== 'xy' && xy.type !== 'xyY')
    throw new Error('checkCIExyInList() requires a color in xy or xyY');
  const x = xy.x;
  const y = xy.y;

  if (typeof(xyList) === 'undefined') {
    xyList = waveLengthTable;
  }

  // If (x,y) is inside xyList.
  // the crossing number algorithm.
  // Point near the border of xyList may incorrectly assessed.
  // Translated from https://www.nttpc.co.jp/technology/number_algorithm.html

  let crossNum = 0;
  for (let i=0; i<xyList.length - 1; i++) {
    if (xyList[i].type !== 'xy' && xyList[i].type !== 'xyY')
      throw new Error('checkCIExyInList() requires array of CSpace of xy or xyY');

    // Rule 1: Upward vertex.
    if (((xyList[i].y <= y) && (xyList[i+1].y > y)) ||
	// Rule 2: Downward vertex.
	((xyList[i].y >  y) && (xyList[i+1].y <= y))) {
      // Rule 3: When rule 1 & 2 examined, rule 3 is also examined.
      // Rule 4: If vertex is rightside of the point.
      const vt = (y - xyList[i].y) / (xyList[i+1].y - xyList[i].y);
      // Find the vertex at the same y, and check if x of the vertex and the point.
      if (x < (xyList[i].x + (vt * (xyList[i+1].x - xyList[i].x)))) {
        crossNum++;
      }
    }
  }

  return ((crossNum % 2) === 1);
}


const waveLengthTable: CSpace[] = makeWaveLengthTable();

function makeWaveLengthTable(): CSpace[] {
  /*
    Wave length to CIE(x,y)
    Source: JIS Z8701:1999
  */
  const w: number[][] = [
    [  0.173134328, 0.004477612, 405 ],
    [  0.172550575, 0.004760016, 410 ],
    [  0.172023941, 0.004876967, 415 ],
    [  0.171428571, 0.005102041, 420 ],
    [  0.170313987, 0.005788138, 425 ],
    [  0.168877521, 0.006900244, 430 ],
    [  0.166895290, 0.008535284, 435 ],
    [  0.164416541, 0.010857251, 440 ],
    [  0.161120111, 0.013793103, 445 ],
    [  0.156641662, 0.017704887, 450 ],
    [  0.150985408, 0.022740193, 455 ],
    [  0.143960396, 0.029702970, 460 ],
    [  0.135502671, 0.039879121, 465 ],
    [  0.124142313, 0.057814485, 470 ],
    [  0.109594324, 0.086842511, 475 ],
    [  0.091256205, 0.132684231, 480 ],
    [  0.068761114, 0.200711322, 485 ],
    [  0.045377198, 0.294951787, 490 ],
    [  0.023459943, 0.412703479, 495 ],
    [  0.008168028, 0.538423071, 500 ],
    [  0.003858521, 0.654823151, 505 ],
    [  0.013870246, 0.750186428, 510 ],
    [  0.038851802, 0.812016021, 515 ],
    [  0.074339401, 0.833822666, 520 ],
    [  0.114154776, 0.826163941, 525 ],
    [  0.154716276, 0.805833411, 530 ],
    [  0.192840055, 0.781698565, 535 ],
    [  0.229619673, 0.754329090, 540 ],
    [  0.265775085, 0.724323925, 545 ],
    [  0.301579570, 0.692366572, 550 ],
    [  0.337396231, 0.658848333, 555 ],
    [  0.373101544, 0.624450860, 560 ],
    [  0.408748569, 0.589624631, 565 ],
    [  0.444062464, 0.554713903, 570 ],
    [  0.478774791, 0.520202307, 575 ],
    [  0.512472036, 0.486577181, 580 ],
    [  0.544786506, 0.454434115, 585 ],
    [  0.575151311, 0.424232235, 590 ],
    [  0.602932786, 0.396496634, 595 ],
    [  0.627036600, 0.372491145, 600 ],
    [  0.648233106, 0.351394916, 605 ],
    [  0.665781260, 0.334019523, 610 ],
    [  0.680098565, 0.319756486, 615 ],
    [  0.691485918, 0.308352218, 620 ],
    [  0.700606061, 0.299300699, 625 ],
    [  0.707956800, 0.292043200, 630 ],
    [  0.714059823, 0.285940177, 635 ],
    [  0.719056028, 0.280943972, 640 ],
    [  0.723046092, 0.276953908, 645 ],
    [  0.725992318, 0.274007682, 650 ],
    [  0.728271728, 0.271728272, 655 ],
    [  0.729969013, 0.270030987, 660 ],
    [  0.731001206, 0.268998794, 665 ],
    [  0.731993300, 0.268006700, 670 ],
    [  0.732718894, 0.267281106, 675 ],
    [  0.733542320, 0.266457680, 680 ],
    [  0.734375000, 0.265625000, 685 ],
    [  0.734627832, 0.265372168, 690 ],
    [  0.734883721, 0.265116279, 695 ],
    [  0.735483871, 0.264516129, 700 ],
    [  0.173134328, 0.004477612, 405 ] // Dummy to avoid error when nm=700
  ];

  const t: CSpace[] = new Array(w.length) as CSpace[];
  for (let i=0; i<w.length; i++)
    t[i] = new CSpace('xy', w[i]);
  return t;
}

export function CIEnm2x(nm: number): number {
  nm = checkWaveLength(nm);
  const i = nmIndex(nm);
  const nm1 = i*nmStep + nmMin;

  if (nm === nm1) {
    // No need of interpolation.
    return waveLengthTable[i].x;
  } else {
    // Interpolate
    const nm2 = nm1 + nmStep;
    const x1 = waveLengthTable[i].x;
    const x2 = waveLengthTable[i+1].x;

    return ((nm - nm1)*x2 + (nm2 - nm)*x1) / nmStep;
  }
}

export function CIEnm2y(nm: number): number {
  nm = checkWaveLength(nm);
  const i = nmIndex(nm);
  const nm1 = i*nmStep + nmMin;

  if (nm === nm1) {
    // No need of interpolation.
    return waveLengthTable[i].y;
  } else {
    // Interpolate
    const nm2 = nm1 + nmStep;
    const y1 = waveLengthTable[i].y;
    const y2 = waveLengthTable[i+1].y;
    return ((nm - nm1)*y2 + (nm2 - nm)*y1) / nmStep;
  }
}

export function CIExy2nm(x: CSpace|number, y?: number): number {
  let xy!: CSpace;
  if (typeof(x) === 'object') {
    xy = x;
  } else if (typeof(y) === 'number') {
    xy = new CSpace('xy', [x, y]);
  } else {
    throw new Error('CIExy2nm() requires a pair of (x, y) or CSpace');
  }
  const ret: CSpace = CIEfitxy2List(xy);
  return ret.q;
}

/*
  Project (x, y) to the polygon made of points in xyList,
  return the projected (= interpolated) (x, y) and the wavelength.
  If xyList is omitted, waveLengthTable[] is used, which is the gamut of the chromaticity space.
  checkCIExy(interpotaled point) should be true, but numerical error may exist.
*/
export function CIEfitxy2List(xy: CSpace, xyList?: CSpace[]): CSpace {
  if (xy.type !== 'xy' && xy.type !== 'xyY')
    throw new Error('CIEfitxy2List() requires a start color in xy or xyY');
  const x = xy.x;
  const y = xy.y;
  let isOpen = false;

  if (typeof(xyList) === 'undefined') {
    xyList = waveLengthTable;
    // When waveLengthTable is used, we don't interpolate between UV and NIR.
    isOpen = true;
  }

  const isInside = checkCIExyInList(xy, xyList);

  // Not smart but working solution... check every distance!
  // Find the nearest point.
  let dMin = 100; // enough large
  let iMin = 0;
  for (let i=0; i<xyList.length - 1; i++) {
    // We don't use the final point, which is same as the first point.
    const nmxy: CSpace = xyList[i];
    const d = (nmxy.x - x)*(nmxy.x - x) + (nmxy.y - y)*(nmxy.y - y);
    if (d < dMin) {
      dMin = d;
      iMin = i;
    }
  }

  /*
    Interpolate between xyList[iMin] and two neighbor points.
    Interplated point [xp] is a projection of input point [x] onto
    a line defined by two points [x0, x1] in xyList.
    By denoting  line vector [a] = [x1 - x0], normal vector [n] = [xp - x],
      [a][n] = 0
      [xp] = t[a] + [x0] = s[n] + xp
      t = ([xp] - [x0])[a]/a^2
      s = ([x0] - [x])[n]/n^2
    If [a] = (ax, ay), [n] = (ay, -ax)
  */
  const t: number[] = [0, 0];
  const s: number[] = [0, 0];
  const iMins: number[][] = [[iMin, iMin - 1], [iMin, iMin + 1]];
  if (isOpen) {
    if (iMins[0][1] === -1) // iMin was 0.
      iMins[0][1] = 1; // Use second point.
    if (iMins[1][1] === (xyList.length - 1)) // iMin was the last point
      iMins[1][1] = xyList.length - 3; // Use one before the last point
  } else {
    // Closed polygon.
    if (iMins[0][1] === -1) // iMin was 0.
      iMins[0][1] = xyList.length - 2; // Use the last point.
    if (iMins[1][1] === (xyList.length - 1)) // iMin was the last point
      iMins[1][1] = 0; // Use the first point
  }
  for (let i=0; i<2; i++) {
    const x0 = xyList[iMins[i][0]].x;
    const y0 = xyList[iMins[i][0]].y;
    const x1 = xyList[iMins[i][1]].x;
    const y1 = xyList[iMins[i][1]].y;

    const ax = x1 - x0;
    const ay = y1 - y0;
    const a = ax*ax + ay*ay;

    // We know that a is never zero.
    t[i] = ((x - x0)*ax + (y - y0)*ay)/a;
    s[i] = Math.abs(((x - x0)*ay - (y - y0)*ax)/a);
  }

  /*
    We prefer interpolation is interpolation, not extrapolation, ie. t = [0,1].
    If both are extrapolation, smaller abs(t) is preferable.
  */
  const ret: CSpace = new CSpace(xyList[iMin]);
  let t0: number = t[0];
  let i0 = iMins[0][0];
  let i1 = iMins[0][1];
  if (0 <= t[0] && t[0] <= 1) {
    // t[0] is interpolation.
    if (0 <= t[1] && t[1] <= 1) {
      // Both interpolation. compare s[].
      if (s[1] < s[0]) {
        t0 = t[1];
        i0 = iMins[1][0];
        i1 = iMins[1][1];
      }
      // Opposit case already set at the initialization of tMin etc.
    }
    // t[1] is extrapolation. Use t[0]
  } else {
    // t[0] is extrapolation
    if (0 <= t[1] && t[1] <= 1) {
      // t[1] is interpolation. Use it
      t0 = t[1];
      i0 = iMins[1][0];
      i1 = iMins[1][1];
    } else {
      // Both t[0] t[1] are extrapolation. Use iMin point.
      // IsInside is false in this case.
      return ret;
    }
  }

  ret.x = xyList[i0].x *(1-t0) + xyList[i1].x * t0;
  ret.y = xyList[i0].y *(1-t0) + xyList[i1].y * t0;
  if (xyList === waveLengthTable)
    ret.q = xyList[i0].q *(1-t0) + xyList[i1].q * t0; // wave length.
  if (isInside) {
    ret.x = x;
    ret.y = y;
  }

  return ret;
}
