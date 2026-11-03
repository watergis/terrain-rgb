import { readFileSync } from "node:fs";
import { encode } from "fast-png";
import { beforeAll, describe, test } from "vite-plus/test";
import { init } from "@jsquash/webp/decode.js";
import { decodeTile } from "../../src/lib/decoder";
import { makeTile, terrarium, toPng } from "../helpers";

const SIZE = 4;
const elevations = [0, 1, 256, 700.5];
const rgba = makeTile(SIZE, (x) => terrarium(elevations[x]));

function elevationAt(data: Uint8Array | Uint8ClampedArray, k: number): number {
  return data[k * 4] * 256 + data[k * 4 + 1] + data[k * 4 + 2] / 256 - 32768;
}

function rgbPng(): Uint8Array {
  const rgb = new Uint8Array(SIZE * SIZE * 3);

  for (let i = 0; i < SIZE * SIZE; i += 1) {
    rgb.set(rgba.subarray(i * 4, i * 4 + 3), i * 3);
  }

  return encode({ width: SIZE, height: SIZE, data: rgb, channels: 3, depth: 8 });
}

describe("decodeTile", () => {
  beforeAll(async () => {
    const wasm = readFileSync("node_modules/@jsquash/webp/codec/dec/webp_dec.wasm");

    await init(await WebAssembly.compile(new Uint8Array(wasm)));
  });

  test.for([
    {
      name: "WebP",
      file: new Uint8Array(readFileSync("tests/fixtures/terrarium-2x2.webp")),
      type: "image/webp",
      size: 2,
    },
    { name: "RGBA PNG", file: toPng(rgba, SIZE), type: "image/png", size: SIZE },
    { name: "RGB PNG", file: rgbPng(), type: "image/png", size: SIZE },
  ])("decodes $name exactly", async ({ file, type, size }, { expect }) => {
    const tile = await decodeTile(new Blob([file.slice()], { type }));

    expect([tile.width, tile.height]).toEqual([size, size]);
    expect([0, 1, 2, 3].map((k) => elevationAt(tile.data, k))).toEqual(elevations);
    expect(tile.data).toHaveLength(size * size * 4);
  });

  test("rejects 16-bit PNG", async ({ expect }) => {
    const png = encode({
      width: 1,
      height: 1,
      data: new Uint16Array([0, 0, 0, 65535]),
      channels: 4,
      depth: 16,
    });

    await expect(decodeTile(new Blob([png.slice()]))).rejects.toThrow("bit depth 16");
  });

  test("rejects PNG without RGB channels", async ({ expect }) => {
    const png = encode({ width: 1, height: 1, data: new Uint8Array([0]), channels: 1, depth: 8 });

    await expect(decodeTile(new Blob([png.slice()]))).rejects.toThrow("1 channels");
  });

  test("rejects other formats", async ({ expect }) => {
    await expect(decodeTile(new Blob([new Uint8Array([1, 2, 3, 4])]))).rejects.toThrow(
      "Unsupported tile format",
    );
  });
});
