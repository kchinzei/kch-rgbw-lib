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
  SVD Helper

  Make Asayake to Wake Project.
  Kiyo Chinzei

  Some implementation of SVD (singular value decomposition) assumes that
  1) size of the matrix to be solved, A [mxn] is  m >=n (more rows than column)
  2) returned singular values do not sorted
  But svd() in Matlab does not assume or behave so.
  This helper does like Matlab [U, V, S] = svd(A, 'econ')

  Here we assume svd-js in npmjs.
*/

import { SVD } from 'svd-js';

// eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
export function svd_matlab(a: number[][], flag?: string): {u: number[][]; v: number[][]; q: number[]} {
  const b: number[][] = svd_pre(a);
  const uvq0: {u: number[][]; v: number[][]; q: number[]} = SVD(b, (typeof(flag) === 'undefined' ? 'f' : true));
  const uvq1: {u: number[][]; v: number[][]; q: number[]} = svd_post(uvq0);
  if (a.length === b.length)
    return uvq1;
  else
    return {u: uvq1.v, v: uvq1.u, q:uvq1.q};
}

// eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
function svd_pre(a: number[][]): number[][] {
  const m = a.length;
  const n = a[0].length;
  if (m >= n)
    return a;
  else {
    const b: number[][] = Array(n) as number[][];
    for (let i=0; i<n; i++) {
      b[i] = Array(m) as number[];
      for (let j=0; j<m; j++)
        b[i][j] = a[j][i];
    }
    return b;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
function svd_post(uvq: {u: number[][]; v: number[][]; q: number[]}): {u: number[][]; v: number[][]; q: number[]} {
  // Find descending order of q[]
  const id: number[] = Array(uvq.q.length) as number[];
  for (let i=0; i<uvq.q.length; i++)
    id[i] = i;
  qsort(uvq.q, id, 0, uvq.q.length-1);

  // reorder u, v, q
  reorder(uvq.q, id);

  for (let i=0; i<uvq.u.length; i++) // eslint-disable-line @typescript-eslint/prefer-for-of
    reorder(uvq.u[i], id);
  for (let i=0; i<uvq.v.length; i++) // eslint-disable-line @typescript-eslint/prefer-for-of
    reorder(uvq.v[i], id);
  return uvq;
}

function qsort(a: number[], id: number[], l: number, r: number): void {
  // https://ja.wikipedia.org/wiki/クイックソート
  function med3(x: number, y: number, z: number): number {
    if (x < y) {
      /* istanbul ignore else */
      if (y < z)
        return y;
      else /* istanbul ignore next */ if (z < x)
        return x;
      else
        return z;
    } else {
      if (z < y)
        return y;
      /* istanbul ignore if */
      else  if (x < z)
        return x;
      else
        return z;
    }
  }
  if (l < r) {
    let i = l;
    let j = r;
    const pivot = med3(a[id[i]], a[id[i + (j - i) / 2]], a[id[j]]);
    while (1) {
      while (a[id[i]] > pivot) i++;
      while (a[id[j]] < pivot) j--;
      if (i >= j) break;
      const tmp = id[i];
      id[i] = id[j];
      id[j] = tmp;
      i++; j--;
    }
    qsort(a, id, l, i-1);
    qsort(a, id, j+1, r);
  }
}

function reorder(a: number[], id: number[]): void {
  const tmp: number[] = Array(a.length) as number[];
  for (let i=0; i<id.length; i++)
    tmp[i] = a[id[i]];
  if (a.length > id.length)
    for (let i=id.length; i<a.length; i++)
      tmp[i] = a[i];
  for (let i=0; i<a.length; i++)
    a[i] = tmp[i];
}
