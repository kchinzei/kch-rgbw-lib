import { promisify } from 'util';
import { readFile } from 'fs';

import { RGBWLED } from './RGBWLED';
import { LEDChip, LEDChipTypes, LEDChipDefByWaveLength, LEDChipDefByColorTemperature, LEDChipDefByCIExy } from './LEDChip';

const readFileAsync = promisify(readFile);

export async function parseJSONFileAsync(filename: string): Promise<RGBWLED> {
  const str = await readFileAsync(filename, 'utf8');
  const rgbw = await parseJSONStringAsync(str);
  return rgbw;
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions, @typescript-eslint/explicit-module-boundary-types
export async function parseLEDChipAsync(obj: any): Promise<LEDChip> {
  return new Promise((resolve, reject) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const type: LEDChipTypes = obj.type as LEDChipTypes;
      let LED: LEDChip;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (obj.hasOwnProperty('x') && obj.hasOwnProperty('y')) {

        LED = new LEDChip(type, obj as LEDChipDefByCIExy);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      } else if (obj.hasOwnProperty('colorTemperature') && type === 'LED_W') {
        LED = new LEDChip(type, obj as LEDChipDefByColorTemperature);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      } else if (obj.hasOwnProperty('waveLength') && type !== 'LED_W') {
        LED = new LEDChip(type, obj as LEDChipDefByWaveLength);
      } else {
        throw new Error('Error in object structure; LEDChip property missing, or incorrect combination, or typo (case sensitive)');
      }
      resolve(LED);
    } catch (err) {
      reject(err);
    }
  });
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions, @typescript-eslint/explicit-module-boundary-types
export async function parseLEDChipArrayAsync(obj: any): Promise<LEDChip[]> {
  try {
    const sourceLEDs: LEDChip[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const objLEDList = obj.LEDChip;

    for (const objLED of objLEDList) {
      const LED: LEDChip = await parseLEDChipAsync(objLED);
      sourceLEDs.push(LED);
    }
    return sourceLEDs;
  } catch (err) {
    throw err;
  }
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions, @typescript-eslint/explicit-module-boundary-types
export async function parseRGBWLEDAsync(obj: any, sourceLEDs: LEDChip[]): Promise<RGBWLED> {
  return new Promise<RGBWLED>((resolve, reject) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const nameList: string[] = obj.RGBWLED.LED as string[];
      if (nameList.length < 3) {
        throw new Error(`Error in object structure; RGBWLED.length = ${nameList.length} < 3.`);
      }

      const ledList: LEDChip[] = [];
      for (const nameOfLED of nameList) {
        const LED: (LEDChip | undefined) = sourceLEDs.find(element => element.name === nameOfLED);
        if (typeof(LED) === 'undefined') {
          throw new Error(`Error in object structure; LED.name === \"${nameOfLED}\" not found`);
        } else {
          ledList.push(LED);
        }
      }
      let name = '';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (obj.RGBWLED.hasOwnProperty('name'))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        name = obj.RGBWLED.name as string;
      resolve(new RGBWLED(name, ledList));
    } catch (err) {
      // console.log(JSON.parse(str));
      reject(err);
    }
  });
}

export async function parseJSONStringAsync(str: string): Promise<RGBWLED> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const obj = JSON.parse(str);

    const sourceLEDs: LEDChip[] = await parseLEDChipArrayAsync(obj);
    const rgbwLED: RGBWLED = await parseRGBWLEDAsync(obj, sourceLEDs);
    return rgbwLED;
  } catch (err) {
    throw err;
  }
}

