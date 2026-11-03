import { decode as decodePng } from "fast-png";
import type { DecodedTile } from "./base";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, i) => bytes[offset + i] === byte);
}

function toRgba(data: ArrayLike<number>, pixels: number, channels: number): Uint8Array {
  if (channels === 4) {
    return Uint8Array.from(data);
  }

  if (channels !== 3) {
    throw new Error(`Unsupported PNG with ${channels} channels, expected RGB or RGBA`);
  }

  const rgba = new Uint8Array(pixels * 4);

  for (let i = 0; i < pixels; i += 1) {
    rgba.set([data[i * 3], data[i * 3 + 1], data[i * 3 + 2], 255], i * 4);
  }

  return rgba;
}

async function decodeWebp(buffer: ArrayBuffer): Promise<DecodedTile> {
  const { default: decode } = await import("@jsquash/webp/decode.js");
  const { data, width, height } = await decode(buffer);

  return { data, width, height };
}

/**
 * Decodes a PNG or WebP tile without a canvas, so pixels stay exact where
 * privacy modes (Brave, Safari, Firefox) add noise to canvas reads. PNG uses
 * `fast-png`; WebP uses libwebp in WebAssembly, loaded on the first WebP tile.
 * Both are optional peer dependencies.
 *
 * @param blob fetched tile, PNG (8-bit RGB or RGBA) or WebP
 * @returns RGBA pixels with the tile size
 */
export async function decodeTile(blob: Blob): Promise<DecodedTile> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (startsWith(bytes, PNG_SIGNATURE)) {
    const { data, width, height, channels, depth } = decodePng(bytes);

    if (depth !== 8) {
      throw new Error(`Unsupported PNG bit depth ${depth}, expected 8`);
    }

    return { data: toRgba(data, width * height, channels), width, height };
  }

  if (startsWith(bytes, RIFF) && startsWith(bytes, WEBP, 8)) {
    return decodeWebp(buffer);
  }

  throw new Error("Unsupported tile format, expected PNG or WebP");
}
