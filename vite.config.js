import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { viteStaticCopy } from "vite-plugin-static-copy"

export default defineConfig({
  plugins: [
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: "src/assets/js/*.js", dest: "src/assets" },
        { src: "src/assets/css/*.css", dest: "src/assets" },
        { src: "src/assets/img/**/*", dest: "src/assets/img" },
        { src: "src/assets/webfonts/**/*", dest: "src/assets/webfonts" },
        { src: "public/sw.js", dest: "" },
        { src: "public/manifest.json", dest: "" },
        { src: "public/offline.html", dest: "" },
      ]
    })
  ],
  server: {
    host: true,
    port: 5173, 
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5173
    }
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        tools: resolve(__dirname, "src/pages/tools.html"),
      }
    }
  },
  publicDir: "public"
})