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

const nmStep = 5; // step of temperature in waveLengthTable
const nmMin = 405;
const nmMax = 700;
const xMin = 0.003858521;
const xMax = 0.735483871;
const yMin = 0.003858521;
const yMax = 0.833822666;

// Obtain index to access waveLengthTable.
const nmIndex = (nm: number) => Math.floor((nm - nmMin) / nmStep);

export type CIEnmxyType = { nm: number; x: number; y: number };

export function checkWaveLength(nm: number): number {
  if (nm < nmMin) nm = nmMin;
  if (nm > nmMax) nm = nmMax;
  return nm;
}

export function checkCIEx(x: number): number {
  if (x < xMin) x = xMin;
  if (x > xMax) x = xMax;
  return x;
}

export function checkCIEy(y: number): number {
  if (y < yMin) y = yMin;
  if (y > yMax) y = yMax;
  return y;
}

export function checkCIExy(x: number, y: number): boolean {
  return checkCIExyInList(x, y, waveLengthTable);
}

export function checkCIExyInList(x: number, y: number, xyList: CIEnmxyType[]): boolean {
  if (x !== checkCIEx(x)) return false;
  if (y !== checkCIEy(y)) return false;

  // If (x,y) is inside xyList.
  // the crossing number algorithm.
  // Point near the border of xyList may incorrectly assessed.
  // Translated from https://www.nttpc.co.jp/technology/number_algorithm.html

  let crossNum = 0;
  for (let i=0; i<xyList.length - 1; i++) {
    // Rule 1: Upside vertex.
    if (((xyList[i].y <= y) && (xyList[i+1].y > y)) ||
	// Rule 2: Downside vertex.
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


/*
  Wave length to CIE(x,y)
  Source: JIS Z8701:1999
*/
const waveLengthTable: CIEnmxyType[] = [
  { nm: 405, x: 0.173134328, y: 0.004477612 },
  { nm: 410, x: 0.172550575, y: 0.004760016 },
  { nm: 415, x: 0.172023941, y: 0.004876967 },
  { nm: 420, x: 0.171428571, y: 0.005102041 },
  { nm: 425, x: 0.170313987, y: 0.005788138 },
  { nm: 430, x: 0.168877521, y: 0.006900244 },
  { nm: 435, x: 0.166895290, y: 0.008535284 },
  { nm: 440, x: 0.164416541, y: 0.010857251 },
  { nm: 445, x: 0.161120111, y: 0.013793103 },
  { nm: 450, x: 0.156641662, y: 0.017704887 },
  { nm: 455, x: 0.150985408, y: 0.022740193 },
  { nm: 460, x: 0.143960396, y: 0.029702970 },
  { nm: 465, x: 0.135502671, y: 0.039879121 },
  { nm: 470, x: 0.124142313, y: 0.057814485 },
  { nm: 475, x: 0.109594324, y: 0.086842511 },
  { nm: 480, x: 0.091256205, y: 0.132684231 },
  { nm: 485, x: 0.068761114, y: 0.200711322 },
  { nm: 490, x: 0.045377198, y: 0.294951787 },
  { nm: 495, x: 0.023459943, y: 0.412703479 },
  { nm: 500, x: 0.008168028, y: 0.538423071 },
  { nm: 505, x: 0.003858521, y: 0.654823151 },
  { nm: 510, x: 0.013870246, y: 0.750186428 },
  { nm: 515, x: 0.038851802, y: 0.812016021 },
  { nm: 520, x: 0.074339401, y: 0.833822666 },
  { nm: 525, x: 0.114154776, y: 0.826163941 },
  { nm: 530, x: 0.154716276, y: 0.805833411 },
  { nm: 535, x: 0.192840055, y: 0.781698565 },
  { nm: 540, x: 0.229619673, y: 0.754329090 },
  { nm: 545, x: 0.265775085, y: 0.724323925 },
  { nm: 550, x: 0.301579570, y: 0.692366572 },
  { nm: 555, x: 0.337396231, y: 0.658848333 },
  { nm: 560, x: 0.373101544, y: 0.624450860 },
  { nm: 565, x: 0.408748569, y: 0.589624631 },
  { nm: 570, x: 0.444062464, y: 0.554713903 },
  { nm: 575, x: 0.478774791, y: 0.520202307 },
  { nm: 580, x: 0.512472036, y: 0.486577181 },
  { nm: 585, x: 0.544786506, y: 0.454434115 },
  { nm: 590, x: 0.575151311, y: 0.424232235 },
  { nm: 595, x: 0.602932786, y: 0.396496634 },
  { nm: 600, x: 0.627036600, y: 0.372491145 },
  { nm: 605, x: 0.648233106, y: 0.351394916 },
  { nm: 610, x: 0.665781260, y: 0.334019523 },
  { nm: 615, x: 0.680098565, y: 0.319756486 },
  { nm: 620, x: 0.691485918, y: 0.308352218 },
  { nm: 625, x: 0.700606061, y: 0.299300699 },
  { nm: 630, x: 0.707956800, y: 0.292043200 },
  { nm: 635, x: 0.714059823, y: 0.285940177 },
  { nm: 640, x: 0.719056028, y: 0.280943972 },
  { nm: 645, x: 0.723046092, y: 0.276953908 },
  { nm: 650, x: 0.725992318, y: 0.274007682 },
  { nm: 655, x: 0.728271728, y: 0.271728272 },
  { nm: 660, x: 0.729969013, y: 0.270030987 },
  { nm: 665, x: 0.731001206, y: 0.268998794 },
  { nm: 670, x: 0.731993300, y: 0.268006700 },
  { nm: 675, x: 0.732718894, y: 0.267281106 },
  { nm: 680, x: 0.733542320, y: 0.266457680 },
  { nm: 685, x: 0.734375000, y: 0.265625000 },
  { nm: 690, x: 0.734627832, y: 0.265372168 },
  { nm: 695, x: 0.734883721, y: 0.265116279 },
  { nm: 700, x: 0.735483871, y: 0.264516129 },
  { nm: 405, x: 0.173134328, y: 0.004477612 } // Dummy to avoid error when nm=700
];

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

export function CIExy2nm(x: number, y: number): number {
  const ret: CIEnmxyType = CIEfitxy2nm(x, y);
  return ret.nm;
}

export function CIEfitxy2nm(x: number, y: number): CIEnmxyType {
  return CIEfitxy2List(x, y, waveLengthTable);
}

/*
  Project (x, y) to the polygon made of points in xyList,
  return the projected (= interpolated) (x, y) and the wavelength.
  checkCIExy(interpotaled point) should be true, but numerical error may exist.
  It does not interpolate between UV and NIR (meaningless).
*/
export function CIEfitxy2List(x: number, y: number, xyList: CIEnmxyType[]): CIEnmxyType {
  // Not smart but working solution... check every distance!
  // Find the nearest point.
  let dMin = 100; // enough large
  let iMin = 0;
  for (let i=0; i<xyList.length - 1; i++) {
    // We don't use the final point, which is same as the first point.
    const nmxy: CIEnmxyType = xyList[i];
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
  */
  const t: number[] = [0, 0];
  const iMins: number[][] = [[iMin, iMin - 1], [iMin, iMin + 1]];
  if (iMins[0][1] === -1) // iMin was 0.
    iMins[0][1] = 1;
  if (iMins[1][1] === (xyList.length - 1)) // End of array is not used.
    iMins[1][1] = xyList.length - 3; // point before iMax.
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
  }

  /*
    We prefer interpolation is interpolation, not extrapolation, ie. t = [0,1].
    If both are extrapolation, smaller abs(t) is preferable.
  */
  const ret: CIEnmxyType = {nm: xyList[iMin].nm, x:xyList[iMin].x, y:xyList[iMin].y};
  let t0: number = t[0];
  let i0 = iMins[0][0];
  let i1 = iMins[0][1];
  if (0 <= t[0] && t[0] <= 1) {
    // t[0] is interpolation.
    if (0 <= t[1] && t[1] <= 1) {
      // Both interpolation. compare.
      if (t[1] < t[0]) {
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
      return ret;
    }
  }
  ret.nm = xyList[i0].nm*(1-t0) + xyList[i1].nm*t0;
  ret.x  = xyList[i0].x *(1-t0) + xyList[i1].x*t0;
  ret.y  = xyList[i0].y *(1-t0) + xyList[i1].y*t0;

  return ret;
}
