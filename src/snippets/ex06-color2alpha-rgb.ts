// Snippet from Ex03

import { LEDChip, RGBWLED } from 'kch-rgbw-lib';
const rLED = new LEDChip('LED_R', { x: 0.6857, y: 0.3143, maxLuminance: 30.6, name: 'Red' });
const gLED = new LEDChip('LED_G', { x: 0.2002, y: 0.6976, maxLuminance: 67.2, name: 'Green' });
const bLED = new LEDChip('LED_B', { x: 0.1417, y: 0.0618, maxLuminance: 8.2,  name: 'Blue' });
const rgb = new RGBWLED('sample', [rLED, gLED, bLED]);

import { CSpace } from 'kch-rgbw-lib';
async function main() {
  // It's inside async function main to avoid using avoid in top-level.
  // Snippet starts

  const c = new CSpace('rgb', [0.3, 0.4, 0.5]);
  const c1 = c.xyY();   // Convert to xyY space.
  c1.Y = 20;            // Set luminance.
  const brightness: number[] = await rgb.color2AlphaAsync(c1);

  // Snippet ends

  console.log(brightness);
}

void main();