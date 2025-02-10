import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "terrainrgb",
      fileName: (format) => `terrain-rgb.${format}.js`,
      formats: ["es", "umd", "cjs"],
    },
    rollupOptions: {
      // external: ['maplibre-gl'],
      // output: {
      // 	globals: {
      // 		'maplibre-gl': 'maplibregl'
      // 	}
      // }
    },
  },
  plugins: [],
});
