import { parseRGBWLEDfromJSONFileAsync, RGBWLED } from 'kch-rgbw-lib';
/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call */

async function main() {
  // It's inside async function main to avoid using avoid in top-level.
  // Snippet starts

  try {
    const rgb: RGBWLED = await parseRGBWLEDfromJSONFileAsync('./foo.json');
    console.log(rgb);
  } catch (e) {
    console.log(e);
  }

  // Snippet ends
}

void main();