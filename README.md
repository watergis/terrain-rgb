# terrain-rgb
This module is to get elevation from terrain RGB tilesets by longitude and latitude.

## Install

```
npm i git+https://github.com/watergis/terrain-rgb.git
```

## Usage

```ts
import {TerrainRGB} from '@water-gis/terrain-rgb';

const url = 'https://wasac.github.io/rw-terrain/tiles/{z}/{x}/{y}.png';
const trgb = new TerrainRGB(url, 512);
const elevation = await trgb.getElevation([30.0529622, -1.9575129], 15);
console.log(elevation);
```

If it can't find tile, it will return 404 error.

If its terrain RGB tilesets was resampled by gdal2tiles, the result of elevation might not be the same with original DEM image.