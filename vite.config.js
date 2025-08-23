import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "/PhysicianQA/",
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    cors: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      "Cross-Origin-Opener-Policy": "unsafe-none",
    },
    fs: {
      strict: false,
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("vuetify")) return "vuetify";
            if (id.includes("pdf-lib")) return "pdf";
            if (id.includes("vue")) return "vue";
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
      treeshake: true,
      theme: {
        defaultTheme: "light",
      },
    }),
    // Disable PWA in development
    ...(process.env.NODE_ENV === "production"
      ? [
          VitePWA({
            registerType: "autoUpdate",
            workbox: {
              globPatterns: ["**/*.{js,css,html,ico,png,svg,pdf}"],
              runtimeCaching: [
                {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                  handler: "CacheFirst",
                  options: {
                    cacheName: "google-fonts-cache",
                    expiration: {
                      maxEntries: 10,
                      maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
                    },
                  },
                },
              ],
            },
            manifest: {
              name: "PhysicianQA Filler",
              short_name: "PhysicianQA Filler",
              description:
                "A PWA for filling PDF templates with randomized physician data",
              theme_color: "#1976D2",
              background_color: "#ffffff",
              display: "standalone",
              start_url: "/",
              icons: [
                {
                  src: "icon-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
                {
                  src: "icon-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                },
              ],
            },
          }),
        ]
      : []),
  ],
  define: {
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
}));
