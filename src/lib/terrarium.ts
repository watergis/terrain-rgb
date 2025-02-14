import { BaseTile } from "./base";

/**
 * Terrarium class implementation
 */
export class Terrarium extends BaseTile {
  /**
   * Constructor
   * @param url URL for terrarium raster tilesets
   * @param tileSize size of tile. 256 or 512
   * @param tms whether it is Tile Map Service
   * @param minzoom minzoom for terrain RGB raster tilesets. default is 5
   * @param maxzoom maxzoom for terrain RGB raster tilesets. default is 15
   */
  constructor(
    url: string,
    tileSize: number,
    minzoom = 5,
    maxzoom = 15,
    tms = false,
  ) {
    super(url, tileSize, minzoom, maxzoom, tms);
  }

  /**
   * Get an altitude calculated from terrain RGB information
   * @param lnglat coordinates
   * @param z zoom level
   * @returns an altitude calculated from terrain RGB information
   */
  public async getElevation(lnglat: number[], z: number): Promise<number> {
    const height = await this.getValue(lnglat, z);
    return height;
  }

  /**
   * Formula for calculating an elevation from RGB
   * https://github.com/tilezen/joerd/blob/master/docs/formats.md#terrarium
   * @param r red
   * @param g green
   * @param b blue
   * @returns an elevation calculated
   */
  protected calc(r: number, g: number, b: number): number {
    const elev = r * 256 + g + b / 256 - 32768;
    return parseInt(elev.toFixed(0));
  }
}
