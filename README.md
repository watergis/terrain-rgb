# terrain-rgb
![](https://github.com/watergis/terrain-rgb/workflows/Node.js%20Package/badge.svg)
![GitHub](https://img.shields.io/github/license/watergis/terrain-rgb)

This module is to get elevation from terrain RGB tilesets by longitude and latitude.

## Install

```
npm i @watergis/terrain-rgb
```

## demo

[code sandbox](https://codesandbox.io/s/terrain-rgb-g4nym)

## Usage

This module can be used for PNG or WEBP terrain RGB tilesets.

```ts
import {TerrainRGB} from '@watergis/terrain-rgb';

const url = 'https://wasac.github.io/rw-terrain/tiles/{z}/{x}/{y}.png';
const trgb = new TerrainRGB(url, 512);
const elevation = await trgb.getElevation([30.0529622, -1.9575129], 15);
console.log(elevation);
```

If it can't find tile, it will return 404 error.

If its terrain RGB tilesets was resampled by gdal2tiles, the result of elevation might not be the same with original DEM image.
