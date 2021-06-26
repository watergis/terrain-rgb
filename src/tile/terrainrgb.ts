import BaseTile from "./base";

/**
 * Terrain RGB class implementation
 */
class TerrainRGB extends BaseTile {

  /**
   * Constructor
   * @param url URL for terrain RGB raster tilesets
   * @param tileSize size of tile. 256 or 512
   * @param minzoom minzoom for terrain RGB raster tilesets. default is 5
   * @param maxzoom maxzoom for terrain RGB raster tilesets. default is 15
   */
  constructor(url: string, tileSize: number, minzoom = 5, maxzoom = 15){
    super(url, tileSize, minzoom, maxzoom);
  }

  /**
   * Get an altitude calculated from terrain RGB information
   * @param lnglat coordinates
   * @param z zoom level
   * @returns an altitude calculated from terrain RGB information
   */
  public async getElevation(lnglat: number[], z: number): Promise<number>{
    const height = await this.getValue(lnglat, z);
    return height;
  }

  /**
   * Formula for calculating an elevation from RGB
   * @param r red
   * @param g green
   * @param b blue
   * @returns an elevation calculated
   */
  protected calc(r: number, g: number, b: number): number{
    const elev = -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1)
    return elev;
  }
}

export default TerrainRGB;