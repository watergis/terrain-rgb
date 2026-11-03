---
"dem-tiles": minor
---

Adds `dem-tiles/decoder`, a canvas-free `decode` option for PNG (`fast-png`) and WebP (libwebp in WebAssembly via `@jsquash/webp`, loaded lazily). The default canvas decoder returns noisy pixels in browsers with fingerprinting protection such as Brave, which turns into elevation spikes (one red step is 256 m in Terrarium). `fast-png` and `@jsquash/webp` are optional peer dependencies.
