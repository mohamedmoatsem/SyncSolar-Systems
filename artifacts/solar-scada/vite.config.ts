import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
      },
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /\/api\/dashboard\/summary/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-dashboard",
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\/api\/readings\/latest/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-readings-latest",
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\/api\/readings\/history/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-readings-history",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\/api\/dashboard\/energy-today/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-energy-today",
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 30 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\/api\/alerts/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-alerts",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 10 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\/api\/devices/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-devices",
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\/api\/logs/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-logs",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
      manifest: {
        name: "Sync Solar System",
        short_name: "SyncSolar",
        description: "Sync Solar System — Solar Energy Monitoring & Control",
        theme_color: "#0a0f1a",
        background_color: "#0a0f1a",
        display: "standalone",
        orientation: "landscape",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
