// Snippet from Ex03

import { LEDChip, RGBWLED } from 'kch-rgbw-lib';
const rLED = new LEDChip('LED_R', { x: 0.6857, y: 0.3143, maxLuminance: 30.6, name: 'Red' });
const gLED = new LEDChip('LED_G', { x: 0.2002, y: 0.6976, maxLuminance: 67.2, name: 'Green' });
const bLED = new LEDChip('LED_B', { x: 0.1417, y: 0.0618, maxLuminance: 8.2,  name: 'Blue' });
const rgb = new RGBWLED('sample', [rLED, gLED, bLED]);

// Snippet starts

import { CSpace } from 'kch-rgbw-lib';
const brightness = [0.003, 0.004, 0.008];
const c: CSpace = rgb.alpha2Color(brightness);
const hsv: CSpace = c.hsv();

// Snippet ends

console.log(hsv);
