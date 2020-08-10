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
  Test SVD

  Make Asayake to Wake Project.
  Kiyo Chinzei
  https://github.com/kchinzei/test-svd
*/

import { SVD } from 'svd-js';
import { svd_matlab } from '../src/svd-helper';

// @ts-ignore: TS6198 These will remain for future testing
const { row, column, multiply, flatten } = require('mathjs');

let i=0;

describe.each([
  [0.22, 0.1, 0.2, 0.3,
   1, 1, 1, 1,
   0.14, 0.7, 0.1, 0.4,

   // Result given by Matlab [U, S, V] = svd(A, 'econ'), but unsorted
   -0.4707,  0.1414,  0.4306,
   -0.5448,  0.3769, -0.7489,
   -0.4629,  0.3550,  0.5011,
   -0.5170, -0.8438, -0.0516,

   // S
   2.1534, 0.1185, 0.4657,

   // V
   -0.1884, -0.9561,  0.2246,
   -0.9267,  0.2488,  0.2817,
   -0.3252, -0.1550, -0.9328,
  4 ]
])('', (a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34,
        u11, u12, u13, u21, u22, u23, u31, u32, u33, u41, u42, u43, s1, s2, s3,
        v11, v12, v13, v21, v22, v23, v31, v32, v33, precision) => {
  test(`${i++}. Compare results of SVD to Matlab results. m>n`, () => {
    const A = [ [ a11, a21, a31 ],
                [ a12, a22, a32 ],
                [ a13, a23, a33 ],
                [ a14, a24, a34 ] ];
    const U = [ [ u11, u12, u13 ],
                [ u21, u22, u23 ],
                [ u31, u32, u33 ],
                [ u41, u42, u43 ] ];
    const S = [ s1, s2, s3 ];
    const V = [ [ v11, v12, v13 ],
                [ v21, v22, v23 ],
                [ v31, v32, v33 ] ];
    let { u, v, q } = SVD(A);
    for (let i=0; i<4; i++)
      for (let j=0; j<3; j++)
        expect(u[i][j]).toBeCloseTo(U[i][j], precision);
    for (let i=0; i<3; i++)
      expect(q[i]).toBeCloseTo(S[i], precision);
    for (let i=0; i<3; i++)
      for (let j=0; j<3; j++)
        expect(v[i][j]).toBeCloseTo(V[i][j], precision);

    /*
    console.log('Original SVD (m>n)');
    console.log(u);
    console.log(v);
    console.log(q);
    */
  });
});

describe.each([
  [0.22, 0.1, 0.2, 0.3,
   1, 1, 1, 1,
   0.14, 0.7, 0.1, 0.4,

   -0.1884,  0.2246, -0.9561,
   -0.9267,  0.2817,  0.2488,
   -0.3252, -0.9328, -0.1550,

   2.1534,  0.4657,  0.1185,

   -0.4707,  0.4306,  0.1414, -0.7570,
   -0.5448, -0.7489,  0.3769, -0.0168,
   -0.4629,  0.5011,  0.3550,  0.6392,
   -0.5170, -0.0516, -0.8438,  0.1346,
  4 ],
  [ 2.1817,    0.2870,    2.2929,    1.0375,
    1.0000,    1.0000,    1.0000,    1.0000,
    0,         0.1465,   12.8883,    0.6813,

    -0.1857,   0.8124,   -0.5527,
    -0.0855,   0.5470,    0.8327,
    -0.9789,  -0.2019,    0.0321,

    13.1736,   2.7475,    0.8243,

    -0.0373,   0.8442,   -0.4527,   -0.2846,
    -0.0214,   0.2732,    0.8235,   -0.4968,
    -0.9965,  -0.0703,   -0.0253,   -0.0377,
    -0.0717,   0.4558,    0.3410,    0.8190,
  3 ]
])('', (a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34,
        u11, u12, u13, u21, u22, u23, u31, u32, u33, s1, s2, s3,
        v11, v12, v13, v14, v21, v22, v23, v24, v31, v32, v33, v34, v41, v42, v43, v44,
        precision) => {
  test(`${i++}. Compare results of SVD to Matlab results. m<n. use svd_matlab`, () => {
    const A = [ [ a11, a12, a13, a14 ],
                [ a21, a22, a23, a24 ],
                [ a31, a32, a33, a34 ] ];
    const U = [ [ u11, u12, u13 ],
                [ u21, u22, u23 ],
                [ u31, u32, u33 ] ];
    const S = [ s1, s2, s3 ];
    const V = [ [ v11, v12, v13, v14 ],
                [ v21, v22, v23, v24 ],
                [ v31, v32, v33, v34 ],
                [ v41, v42, v43, v44 ] ];
    const { u, v, q } = svd_matlab(A);

    /*
    console.log('Matlab-like SVD (m<n) NO-econ');
    console.log(u);
    console.log(v);
    console.log(q);

    const nr: number[] = flatten(row(v, 2));
    console.log('nr = ');
    console.log(nr);

    const nc: number[] = flatten(column(v, 3));
    console.log('null vector = ');
    console.log(nc);

    const aa: number[] = multiply(A, nr);
    console.log('multiply matrix and vector ...');
    console.log(aa);    
    */

    for (let i=0; i<3; i++)
      for (let j=0; j<3; j++)
        expect(u[i][j]).toBeCloseTo(U[i][j], precision);
    for (let i=0; i<3; i++)
      expect(q[i]).toBeCloseTo(S[i], precision);
    for (let i=0; i<4; i++)
      for (let j=0; j<4; j++)
        expect(v[i][j]).toBeCloseTo(V[i][j], precision);
  });
});

describe.each([
  [ 0.22, 0.1, 0.2,
    1, 1, 1,
    0.14, 0.7, 0.1,

    -0.1589,    0.2378,    0.9582,
    -0.9366,    0.2706,   -0.2224,
    -0.3122,   -0.9329,    0.1798,

    1.8443,    0.4649,    0.0187,

    -0.5505,    0.4136,    0.7252,
    -0.6350,   -0.7714,   -0.0421,
    -0.5420,    0.4836,   -0.6873,
  4 ],
])('', (a11, a12, a13, a21, a22, a23, a31, a32, a33,
        u11, u12, u13, u21, u22, u23, u31, u32, u33, s1, s2, s3,
        v11, v12, v13, v21, v22, v23, v31, v32, v33, precision) => {
  test(`${i++}. Compare results of SVD to Matlab results. m=n. use svd_matlab`, () => {
    const A = [ [ a11, a12, a13 ],
                [ a21, a22, a23 ],
                [ a31, a32, a33 ] ];
    const U = [ [ u11, u12, u13 ],
                [ u21, u22, u23 ],
                [ u31, u32, u33 ] ];
    const S = [ s1, s2, s3 ];
    const V = [ [ v11, v12, v13 ],
                [ v21, v22, v23 ],
                [ v31, v32, v33 ] ];
    const { u, v, q } = svd_matlab(A, 'econ');
    for (let i=0; i<3; i++)
      for (let j=0; j<3; j++)
        expect(u[i][j]).toBeCloseTo(U[i][j], precision);
    for (let i=0; i<3; i++)
      expect(q[i]).toBeCloseTo(S[i], precision);
    for (let i=0; i<3; i++)
      for (let j=0; j<3; j++)
        expect(v[i][j]).toBeCloseTo(V[i][j], precision);

    /*
    console.log('Matlab-like SVD (m=n) econ');
    console.log(u);
    console.log(v);
    console.log(q);
    */
  });
});
