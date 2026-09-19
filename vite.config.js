import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    // Recompresses everything in public/img at build time. PNGs stay lossless
    // so the knocked-out apparel sheets keep clean transparent edges.
    ViteImageOptimizer({
      jpg:  { quality: 82, mozjpeg: true },
      jpeg: { quality: 82, mozjpeg: true },
      png:  { compressionLevel: 9 },
    }),
  ],
});
