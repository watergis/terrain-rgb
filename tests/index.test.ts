import {TerrainRGB} from '../src/index';

const url = 'https://wasac.github.io/rw-terrain/tiles/{z}/{x}/{y}.png';
const trgb = new TerrainRGB(url, 512)

describe('success case', (): void => {
  
  test('30.0529622, -1.9575129', async() => {
    const elevation = await trgb.getElevation([30.0529622, -1.9575129], 15);
    expect(elevation).toEqual(1452);
  });

  test('29.500, -1.786', async() => {
    const elevation = await trgb.getElevation([29.500, -1.786], 15);
    expect(elevation).toEqual(2316);
  });

  test('29.831, -2.547', async() => {
    const elevation = await trgb.getElevation([29.831, -2.547], 15);
    expect(elevation).toEqual(1588);
  });

  test('30.624, -2.048', async() => {
    const elevation = await trgb.getElevation([30.624, -2.048], 15);
    expect(elevation).toEqual(1625);
  });

  test('30.615, -1.978', async() => {
    const elevation = await trgb.getElevation([30.615, -1.978], 15);
    expect(elevation).toEqual(1562);
  });
})
