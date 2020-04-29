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

export type CIEnxyType = { nm: number; x: number; y: number };

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
  if (x !== checkCIEx(x)) return false;
  if (y !== checkCIEy(y)) return false;
  
  // If (x,y) is inside waveLengthTable.
  // the crossing number algorithm.
  // Point near the border of waveTengthTable may incorrectly asessed.
  // Translated from https://www.nttpc.co.jp/technology/number_algorithm.html

  let crossNum = 0;
  for (let i=0; i<waveLengthTable.length - 1; i++) {
    // Rule 1: Upside vertex.
    if (((waveLengthTable[i].y <= y) && (waveLengthTable[i+1].y > y)) ||
	// Rule 2: Downside vertex.
	((waveLengthTable[i].y >  y) && (waveLengthTable[i+1].y <= y))) {
      // Rule 3: When rule 1 & 2 examined, rule 3 is also examined.
      // Rule 4: If vertex is rightside of the point.
      let vt = (y - waveLengthTable[i].y) / (waveLengthTable[i+1].y - waveLengthTable[i].y);
      // Find the vertex at the same y, and check if x of the vertex and the point.
      if (x < (waveLengthTable[i].x + (vt * (waveLengthTable[i+1].x - waveLengthTable[i].x)))) {
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
const waveLengthTable: CIEnxyType[] = [
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
  x = checkCIEx(x);
  y = checkCIEy(y);

  // Not smart but working solution... check every distance!
  let dMin = 100; // enough large
  let dMin2 = 100;
  let nmxyMin = waveLengthTable[0];
  let nmxyMin2 = waveLengthTable[0];
  for (const nmxy of waveLengthTable) {
    const d = (nmxy.x - x)*(nmxy.x - x) + (nmxy.y - y)*(nmxy.y - y);
    if (d < dMin) {
      dMin2 = dMin;
      nmxyMin2 = nmxyMin;
      dMin = d;
      nmxyMin = nmxy;
    } else if (d < dMin2) {
      dMin2 = d;
      nmxyMin2 = nmxy;
    }
  }

  const ax = nmxyMin.x - nmxyMin2.x;
  const ay = nmxyMin.y - nmxyMin2.y;
  const a = ax*ax + ay*ay;
  if (a !== 0) {
    // Interpolate between nmxyMin and nmxyMin2.
    // Obtain t, where a vector between nmxyMin and nmxyMin2 and a normal from (x,y) meets.
    const t = ((x - nmxyMin.x)*ax + (y - nmxyMin.y)*ay)/a;
    return nmxyMin.nm*(1-t) + nmxyMin2.nm*t;
  } /* istanbul ignore next */ else {
    // nmxyMin and nmxyMin2 looks like a same point.
    return nmxyMin.nm;
  }
}
