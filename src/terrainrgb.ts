import * as tilebelt from './tilebelt';
import axios from 'axios';
import PNG from 'png-ts';
import {WebpMachine, loadBinaryData} from "webp-hero"


class TerrainRGB {
  private url: string;
  private tileSize: number;

  /**
   * Constructor
   * @param url URL for terrain RGB raster tilesets
   * @param tileSize size of tile. 256 or 512
   */
  constructor(url: string, tileSize: number){
    this.url = url;
    this.tileSize = tileSize;
  }

  getElevation(lnglat: number[], z: number): Promise<number | undefined>{
    const tileSize = this.tileSize;

    return new Promise((resolve: (value?:number)=>void, reject: (reason?: any) => void) => {
      const lng = lnglat[0];
      const lat = lnglat[1];
      if (z > 15){
        z = 15;
      }else if (z < 5){
        z = 5;
      }
      const tile = tilebelt.pointToTile(lng, lat, z);
      const url: string = this.url
        .replace(/{x}/g, tile[0].toString())
        .replace(/{y}/g, tile[1].toString())
        .replace(/{z}/g, tile[2].toString());
      let ext = this.getUrlExtension(url);
      // console.log(ext)
      if (!ext){
        ext = "png";
      }
      switch(ext){
        case 'png':
          axios.get(url, {
            responseType: 'arraybuffer'
          })
          .then(res => {
            const binary = Buffer.from(res.data, 'binary')
            const height = this.getElevationFromPNG(binary, tile, lng, lat, tileSize);
            resolve(height);    
          })
          .catch(err=>reject(err))
          break;
        case 'webp':
          loadBinaryData(url)
          .then(binary=>{
            this.getElevationFromWEBP(binary, tile, lng, lat, tileSize).then((height: number)=>{
              resolve(height); 
            }).catch(err=>reject(err));
          }).catch(err=>reject(err))
          break;
        default:
          reject(`Invalid file extension: ${ext}`);
          break;
      }
      
    })
    
  }

  getElevationFromPNG(binary: Uint8Array, tile: number[], lng: number, lat: number, tileSize: number): number{
    const pngImage = PNG.load(binary);
    const pixels = pngImage.decodePixels();
    const rgba = this.pixels2rgba(pixels, tile, lng, lat, tileSize);
    // console.log(rgba)
    const height = this.calcElevation(rgba[0], rgba[1], rgba[2]);
    return height;
  }

  getElevationFromWEBP(binary: Uint8Array, tile: number[], lng: number, lat: number, tileSize: number): Promise<number>{
    return new Promise((resolve: (value:number)=>void, reject: (reason?: any) => void) => {
      const webpMachine = new WebpMachine()
      webpMachine.decode(binary).then((dataURI: string)=>{
        const buffer = this.dataURIConverter(dataURI);
        const height = this.getElevationFromPNG(buffer, tile, lng, lat, tileSize);
        resolve(height)
      })
      .catch(err=>reject(err));
      
    })
    
  }

  calcElevation(r: number, g: number, b: number): number{
    const elev = -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1)
    return elev;
  }

  pixels2rgba(pixels: Uint8Array, tile: number[], lng: number, lat: number, tileSize: number): number[]{
    const data = [];
    for (let i=0; i < pixels.length; i=i+4){
      const r = pixels[i];
      const g = pixels[i+1];
      const b = pixels[i+2];
      const a = pixels[i+3];
      const rgba = [r, g, b, a]
      data.push(rgba);
    }
    const bbox = tilebelt.tileToBBOX(tile);
    const pixPos = this.getPixelPosition(lng, lat, bbox);
    const pos = pixPos[0] + pixPos[1] * tileSize
    const rgba = data[pos]
    return rgba;
  }

  getPixelPosition(lng: number, lat: number, bbox: number[]): number[]{
    const pixelWidth = this.tileSize;
    const pixelHeight = this.tileSize;
    const bboxWidth = bbox[ 2 ] - bbox[ 0 ];
    const bboxHeight = bbox[ 3 ] - bbox[ 1 ];

    const widthPct = ( lng - bbox[ 0 ] ) / bboxWidth;
    const heightPct = ( lat - bbox[ 1 ] ) / bboxHeight;
    const xPx = Math.floor( pixelWidth * widthPct );
    const yPx = Math.floor( pixelHeight * ( 1 - heightPct ) );
    return [xPx, yPx];
  }

  getUrlExtension(url: string): string | undefined{
    let extension = url.split(/[#?]/)[0].split('.').pop();
    if (extension){
      extension = extension.trim();
    }
    return extension;
  }

  dataURIConverter(dataURI: string) : Uint8Array{
    const byteString = atob(dataURI.split(',')[1]);
    const buffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        buffer[i] = byteString.charCodeAt(i);
    }
    return buffer
}

}

export default TerrainRGB;