import {TerrainRGB} from '../src/index';

const url = 'https://wasac.github.io/rw-terrain/tiles/{z}/{x}/{y}.png';
const trgb = new TerrainRGB(url, 512)

describe('success case', (): void => {
  
  test('30.48535, -2.03089 ', async() => {
    const elevation = await trgb.getElevation([30.48535, -2.03089], 15);
    expect(elevation).toEqual(1347);
  });

  test('30.30905, -2.01723', async() => {
    const elevation = await trgb.getElevation([30.30905, -2.01723], 15);
    expect(elevation).toEqual(1586);
  });

  test('29.46279, -2.12171', async() => {
    const elevation = await trgb.getElevation([29.46279, -2.12171], 15);
    expect(elevation).toEqual(1997);
  });

  test('29.76760, -2.68676', async() => {
    const elevation = await trgb.getElevation([29.76760, -2.68676], 15);
    expect(elevation).toEqual(1710);
  });

  test('30.78230, -2.25379', async() => {
    const elevation = await trgb.getElevation([30.78230, -2.25379], 15);
    expect(elevation).toEqual(1392);
  });
})
