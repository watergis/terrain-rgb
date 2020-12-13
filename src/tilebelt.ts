const d2r = Math.PI / 180;
const r2d = 180 / Math.PI;

type Polygon = {
  type: string;
  coordinates: number[][][];
}

/**
 * Get the bbox of a tile
 *
 * @name tileToBBOX
 * @param {Array<number>} tile
 * @returns {Array<number>} bbox
 * @example
 * var bbox = tileToBBOX([5, 10, 10])
 * //=bbox
 */
export const tileToBBOX = (tile: number[]): number[]=>{
  const e = tile2lon(tile[0] + 1, tile[2]);
  const w = tile2lon(tile[0], tile[2]);
  const s = tile2lat(tile[1] + 1, tile[2]);
  const n = tile2lat(tile[1], tile[2]);
  return [w, s, e, n];
}

/**
* Get a geojson representation of a tile
*
* @name tileToGeoJSON
* @param {Array<number>} tile
* @returns {Feature<Polygon>}
* @example
* var poly = tileToGeoJSON([5, 10, 10])
* //=poly
*/
export const tileToGeoJSON = (tile: number[]): Polygon=> {
  const bbox = tileToBBOX(tile);
  const poly : Polygon = {
      type: 'Polygon',
      coordinates: [[
          [bbox[0], bbox[3]],
          [bbox[0], bbox[1]],
          [bbox[2], bbox[1]],
          [bbox[2], bbox[3]],
          [bbox[0], bbox[3]]
      ]]
  };
  return poly;
}

const tile2lon = (x: number, z: number): number=> {
  return x / Math.pow(2, z) * 360 - 180;
}

const tile2lat = (y: number, z: number): number =>{
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
  return r2d * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

/**
* Get the tile for a point at a specified zoom level
*
* @name pointToTile
* @param {number} lon
* @param {number} lat
* @param {number} z
* @returns {Array<number>} tile
* @example
* var tile = pointToTile(1, 1, 20)
* //=tile
*/
export const pointToTile = (lon: number, lat: number, z: number): number[]=> {
  const tile = pointToTileFraction(lon, lat, z);
  tile[0] = Math.floor(tile[0]);
  tile[1] = Math.floor(tile[1]);
  return tile;
}

/**
* Get the 4 tiles one zoom level higher
*
* @name getChildren
* @param {Array<number>} tile
* @returns {Array<Array<number>>} tiles
* @example
* var tiles = getChildren([5, 10, 10])
* //=tiles
*/
export const getChildren = (tile: number[]): number[][] => {
  return [
      [tile[0] * 2, tile[1] * 2, tile[2] + 1],
      [tile[0] * 2 + 1, tile[1] * 2, tile[2 ] + 1],
      [tile[0] * 2 + 1, tile[1] * 2 + 1, tile[2] + 1],
      [tile[0] * 2, tile[1] * 2 + 1, tile[2] + 1]
  ];
}

/**
* Get the tile one zoom level lower
*
* @name getParent
* @param {Array<number>} tile
* @returns {Array<number>} tile
* @example
* var tile = getParent([5, 10, 10])
* //=tile
*/
export const getParent = (tile: number[]): number[] => {
  return [tile[0] >> 1, tile[1] >> 1, tile[2] - 1];
}

function getSiblings(tile: number[]) {
  return getChildren(getParent(tile));
}

/**
* Get the 3 sibling tiles for a tile
*
* @name getSiblings
* @param {Array<number>} tile
* @returns {Array<Array<number>>} tiles
* @example
* var tiles = getSiblings([5, 10, 10])
* //=tiles
*/
export const hasSiblings = (tile: number[], tiles: number[][]): boolean =>{
  const siblings = getSiblings(tile);
  for (let i = 0; i < siblings.length; i++) {
      if (!hasTile(tiles, siblings[i])) return false;
  }
  return true;
}

/**
* Check to see if an array of tiles contains a particular tile
*
* @name hasTile
* @param {Array<Array<number>>} tiles
* @param {Array<number>} tile
* @returns {boolean}
* @example
* var tiles = [
*     [0, 0, 5],
*     [0, 1, 5],
*     [1, 1, 5],
*     [1, 0, 5]
* ]
* hasTile(tiles, [0, 0, 5])
* //=boolean
*/
export const hasTile = (tiles: number[][], tile: number[]): boolean => {
  for (let i = 0; i < tiles.length; i++) {
      if (tilesEqual(tiles[i], tile)) return true;
  }
  return false;
}

/**
* Check to see if two tiles are the same
*
* @name tilesEqual
* @param {Array<number>} tile1
* @param {Array<number>} tile2
* @returns {boolean}
* @example
* tilesEqual([0, 1, 5], [0, 0, 5])
* //=boolean
*/
export const tilesEqual = (tile1: number[], tile2: number[]): boolean => {
  return (
      tile1[0] === tile2[0] &&
      tile1[1] === tile2[1] &&
      tile1[2] === tile2[2]
  );
}

/**
* Get the quadkey for a tile
*
* @name tileToQuadkey
* @param {Array<number>} tile
* @returns {string} quadkey
* @example
* var quadkey = tileToQuadkey([0, 1, 5])
* //=quadkey
*/
export const tileToQuadkey = (tile: number[]): string =>{
  let index = '';
  for (let z = tile[2]; z > 0; z--) {
      let b = 0;
      const mask = 1 << (z - 1);
      if ((tile[0] & mask) !== 0) b++;
      if ((tile[1] & mask) !== 0) b += 2;
      index += b.toString();
  }
  return index;
}

/**
* Get the tile for a quadkey
*
* @name quadkeyToTile
* @param {string} quadkey
* @returns {Array<number>} tile
* @example
* var tile = quadkeyToTile('00001033')
* //=tile
*/
export const quadkeyToTile = (quadkey: string): number[] =>{
  let x = 0;
  let y = 0;
  const z = quadkey.length;

  for (let i = z; i > 0; i--) {
      const mask = 1 << (i - 1);
      const q = +quadkey[z - i];
      if (q === 1) x |= mask;
      if (q === 2) y |= mask;
      if (q === 3) {
          x |= mask;
          y |= mask;
      }
  }
  return [x, y, z];
}

/**
* Get the smallest tile to cover a bbox
*
* @name bboxToTile
* @param {Array<number>} bbox
* @returns {Array<number>} tile
* @example
* var tile = bboxToTile([ -178, 84, -177, 85 ])
* //=tile
*/
export const bboxToTile = (bboxCoords: number[]): number[] => {
  const min = pointToTile(bboxCoords[0], bboxCoords[1], 32);
  const max = pointToTile(bboxCoords[2], bboxCoords[3], 32);
  const bbox = [min[0], min[1], max[0], max[1]];

  const z = getBboxZoom(bbox);
  if (z === 0) return [0, 0, 0];
  const x = bbox[0] >>> (32 - z);
  const y = bbox[1] >>> (32 - z);
  return [x, y, z];
}

const getBboxZoom = (bbox: number[]): number => {
  const MAX_ZOOM = 28;
  for (let z = 0; z < MAX_ZOOM; z++) {
    const mask = 1 << (32 - (z + 1));
      if (((bbox[0] & mask) !== (bbox[2] & mask)) ||
          ((bbox[1] & mask) !== (bbox[3] & mask))) {
          return z;
      }
  }

  return MAX_ZOOM;
}

/**
* Get the precise fractional tile location for a point at a zoom level
*
* @name pointToTileFraction
* @param {number} lon
* @param {number} lat
* @param {number} z
* @returns {Array<number>} tile fraction
* var tile = pointToTileFraction(30.5, 50.5, 15)
* //=tile
*/
export const pointToTileFraction = (lon: number, lat: number, z: number): number[] => {
  const sin = Math.sin(lat * d2r);
  const z2 = Math.pow(2, z);
  let x = z2 * (lon / 360 + 0.5);
  const y = z2 * (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);

  // Wrap Tile X
  x = x % z2;
  if (x < 0) x = x + z2;
  return [x, y, z];
}

// module.exports = {
//   tileToGeoJSON: tileToGeoJSON,
//   tileToBBOX: tileToBBOX,
//   getChildren: getChildren,
//   getParent: getParent,
//   getSiblings: getSiblings,
//   hasTile: hasTile,
//   hasSiblings: hasSiblings,
//   tilesEqual: tilesEqual,
//   tileToQuadkey: tileToQuadkey,
//   quadkeyToTile: quadkeyToTile,
//   pointToTile: pointToTile,
//   bboxToTile: bboxToTile,
//   pointToTileFraction: pointToTileFraction
// };