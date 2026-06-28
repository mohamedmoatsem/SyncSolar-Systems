import path from "path";
import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin (origin is undefined for server-to-server / curl)
      // and any Replit dev/expo domain, or localhost for local dev
      if (
        !origin ||
        origin.includes(".replit.dev") ||
        origin.includes(".picard.replit.dev") ||
        origin.includes(".replit.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-IoT-Key",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API routes (must come before static serving) ──────────────────────────────
app.use("/api", router);

// ── Static frontend (mockup-sandbox build output) ─────────────────────────────
const frontendDist = path.resolve(
  import.meta.dirname,
  "../../mockup-sandbox/dist",
);

app.use(express.static(frontendDist));

// ── Catch-all: any non-/api request → index.html (SPA fallback) ──────────────
// Express 5 requires "/{*path}" instead of "*" (path-to-regexp v8)
app.get("/{*path}", (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

export default app;
