import express, { type Express } from "express";
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

app.use("/api", router);

export default app;
