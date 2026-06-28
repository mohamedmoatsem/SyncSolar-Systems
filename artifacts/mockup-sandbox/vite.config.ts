import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = Number(process.env.PORT || "3000");

// In dev (Replit), honour BASE_PATH for the proxy prefix.
// In production builds, use "./" so all asset URLs are relative —
// this makes the output portable regardless of where it is served from.
const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? "./" : (process.env.BASE_PATH || "/");

const isReplit =
  typeof process.env.REPL_ID === "string" &&
  process.env.REPL_ID.length > 0 &&
  !isProduction;

export default defineConfig(async () => {
  const replitPlugins = isReplit
    ? [
        await import("@replit/vite-plugin-runtime-error-modal").then(
          (m) => m.default(),
        ),
      ]
    : [];

  return {
    base: basePath,
    plugins: [react(), tailwindcss(), ...replitPlugins],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
      target: "es2022",
    },
    server: {
      port,
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
  };
});
