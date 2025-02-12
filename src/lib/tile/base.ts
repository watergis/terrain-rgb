import { lngLatToGoogle, lngLatToTile } from "global-mercator";
import PNG from "../png";

/**
 * Abstract class for terrain RGB tiles
 */
export abstract class BaseTile {
  protected url: string;

  protected tileSize: number;

  protected tms: boolean;

  protected minzoom: number;

  protected maxzoom: number;

  /**
   * Constructor
   * @param url URL for terrain RGB raster tilesets
   * @param tileSize size of tile. 256 or 512
   * @param tms whether it is Tile Map Service
   * @param minzoom minzoom for terrain RGB raster tilesets
   * @param maxzoom maxzoom for terrain RGB raster tilesets
   * @param tms whether it is Tile Map Service
   */
  constructor(
    url: string,
    tileSize: number,
    minzoom: number,
    maxzoom: number,
    tms: boolean,
  ) {
    this.url = url;
    this.tileSize = tileSize;
    this.tms = tms;
    this.minzoom = minzoom;
    this.maxzoom = maxzoom;
    this.tms = tms;
  }

  /**
   * Get the value from target coordinates and zoom level by using certain formula.
   * @param lnglat coordinates
   * @param z  zoom level
   * @returns the value calculated by certain formula
   */
  protected getValue(lnglat: number[], z: number): Promise<number> {
    return new Promise((resolve: (value: number) => void, reject) => {
      const lng = lnglat[0];
      const lat = lnglat[1];
      let zoom = z;
      if (z > this.maxzoom) {
        zoom = this.maxzoom;
      } else if (z < this.minzoom) {
        zoom = this.minzoom;
      }
      const tile = this.tms
        ? lngLatToTile([lng, lat], zoom)
        : lngLatToGoogle([lng, lat], zoom);
      const url: string = this.url
        .replace(/{x}/g, tile[0].toString())
        .replace(/{y}/g, tile[1].toString())
        .replace(/{z}/g, tile[2].toString());
      let ext = this.getUrlExtension(url);
      // console.log(ext)
      if (!ext) {
        ext = "png";
      }
      switch (ext) {
        case "png":
          this.getValueFromPNG(url, tile, lng, lat).then((height) => {
            resolve(height);
          });
          break;
        case "webp":
          this.getValueFromWebp(url, tile, lng, lat).then((height) => {
            resolve(height);
          });
          break;
        default:
          reject(new Error(`Invalid file extension: ${ext}`));
          break;
      }
    });
  }

  /**
   * Get the value calculated from coordinates on PNG raster tileset
   * @param binary Image binary data
   * @param tile tile index info
   * @param lng longitude
   * @param lat latitude
   * @returns the value calculated from coordinates
   */
  private async getValueFromPNG(
    url: string,
    tile: number[],
    lng: number,
    lat: number,
  ): Promise<number> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch tile: ${res.statusText}`);
    const buffer = new Uint8Array(await res.arrayBuffer());
    const pngImage = PNG.load(buffer);
    const pixels = pngImage.decode();
    const rgba = this.pixels2rgba(pixels, tile, lng, lat);
    const height = this.calc(rgba[0], rgba[1], rgba[2], rgba[3]);
    return height;
  }

  private async getValueFromWebp(
    url: string,
    tile: number[],
    lng: number,
    lat: number,
  ): Promise<number> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch tile: ${res.statusText}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Failed to create canvas context"));
        ctx.drawImage(img, 0, 0);
        const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
        const rgba = this.pixels2rgba(new Uint8Array(pixels), tile, lng, lat);
        // console.log(rgba)
        const height = this.calc(rgba[0], rgba[1], rgba[2], rgba[3]);
        resolve(height);
      };
      img.onerror = () => reject(new Error("Failed to load WebP image"));
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Calculate the value from RGBA.
   * You must impletement this method in your sub class.
   * @param r red
   * @param g green
   * @param b blue
   * @param a alfa
   */
  protected abstract calc(r: number, g: number, b: number, a: number): number;

  /**
   * Get RGBA values from coordinates information
   * @param pixels pixels info
   * @param tile tile index info
   * @param lng longitude
   * @param lat latitude
   * @returns RGBA values
   */
  private pixels2rgba(
    pixels: Uint8Array,
    tile: number[],
    lng: number,
    lat: number,
  ): number[] {
    const data = [];
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      const rgba = [r, g, b, a];
      data.push(rgba);
    }
    const bbox = this.tileToBBOX(tile);
    const pixPos = this.getPixelPosition(lng, lat, bbox);
    const pos = pixPos[0] + pixPos[1] * this.tileSize;
    const rgba = data[pos];
    return rgba;
  }

  /**
   * Get the position in pixel from the coordinates
   * @param lng longitude
   * @param lat latitude
   * @param bbox bbox (minx, miny, maxx, maxy)
   * @returns The position in pixel
   */
  private getPixelPosition(lng: number, lat: number, bbox: number[]): number[] {
    const pixelWidth = this.tileSize;
    const pixelHeight = this.tileSize;
    const bboxWidth = bbox[2] - bbox[0];
    const bboxHeight = bbox[3] - bbox[1];

    const widthPct = (lng - bbox[0]) / bboxWidth;
    const heightPct = (lat - bbox[1]) / bboxHeight;
    const xPx = Math.floor(pixelWidth * widthPct);
    const yPx = Math.floor(pixelHeight * (1 - heightPct));
    return [xPx, yPx];
  }

  /**
   * Get file extenstion name from the URL
   * @param url URL for tilesets
   * @returns file extenstion either png or webp
   */
  private getUrlExtension(url: string): string | undefined {
    let extension = url.split(/[#?]/)[0].split(".").pop();
    if (extension) {
      extension = extension.trim();
    }
    return extension;
  }

  /**
   * Get buffer data from Image URI
   * @param dataURI Image URI
   * @returns buffer from the image
   */
  private dataURIConverter(dataURI: string): Uint8Array {
    const byteString = atob(dataURI.split(",")[1]);
    const buffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i += 1) {
      buffer[i] = byteString.charCodeAt(i);
    }
    return buffer;
  }

  /**
   * Get the bbox of a tile
   * @param {Array<number>} tile
   * @returns {Array<number>} bbox
   * @example
   * var bbox = tileToBBOX([5, 10, 10])
   * //=bbox
   */
  private tileToBBOX(tile: number[]): number[] {
    const e = this.tile2lon(tile[0] + 1, tile[2]);
    const w = this.tile2lon(tile[0], tile[2]);
    const s = this.tile2lat(tile[1] + 1, tile[2]);
    const n = this.tile2lat(tile[1], tile[2]);
    return [w, s, e, n];
  }

  private tile2lon(x: number, z: number): number {
    return (x / Math.pow(2, z)) * 360 - 180;
  }

  private tile2lat(y: number, z: number): number {
    const r2d = 180 / Math.PI;
    const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
    return r2d * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }
}
