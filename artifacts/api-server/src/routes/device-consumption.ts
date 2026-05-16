import { Router, type Request, type Response } from "express";
import { db, deviceConsumptionTable } from "@workspace/db";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { requireAuth, getSystemId } from "../middleware/auth";
import { verifyToken } from "../lib/jwt";

const router = Router();

const IOT_API_KEY = process.env.IOT_API_KEY ?? "syncsolar-iot-dev-key";

function iotOrJwtAuth(req: Request, res: Response, next: () => void): void {
  const iotKey = req.headers["x-iot-key"];
  if (iotKey === IOT_API_KEY) {
    next();
    return;
  }
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      (req as any).user = verifyToken(header.slice(7));
      next();
      return;
    } catch {
      // fall through
    }
  }
  res.status(401).json({ error: "Unauthorized — provide Bearer token or X-IoT-Key header" });
}

// Normalise a single IoT reading — accepts both camelCase and snake_case
function normaliseReading(r: any): {
  deviceName: string;
  currentConsumptionWatts: number;
  totalKwh: number;
  timestamp: Date | undefined;
} {
  return {
    deviceName: String(r.deviceName ?? r.device_name ?? ""),
    currentConsumptionWatts: Number(r.currentConsumptionWatts ?? r.current_consumption_watts ?? 0),
    totalKwh: r.totalKwh !== undefined
      ? Number(r.totalKwh)
      : r.total_kwh !== undefined
        ? Number(r.total_kwh)
        : 0,
    timestamp: (r.timestamp ? new Date(r.timestamp) : undefined),
  };
}

// POST /api/device-consumption — single reading
router.post("/device-consumption", iotOrJwtAuth, async (req, res): Promise<void> => {
  try {
    const norm = normaliseReading(req.body);

    if (!norm.deviceName || norm.currentConsumptionWatts === undefined) {
      res.status(400).json({ error: "deviceName and currentConsumptionWatts are required" });
      return;
    }

    // resolve systemId: from body (camelCase or snake_case) → JWT → default 1
    const rawSysId = req.body.solarSystemId ?? req.body.solar_system_id;
    const systemId = rawSysId
      ? parseInt(String(rawSysId))
      : (req as any).user?.solarSystemId ?? 1;

    const [record] = await db
      .insert(deviceConsumptionTable)
      .values({
        solarSystemId: systemId,
        deviceName: norm.deviceName,
        currentConsumptionWatts: norm.currentConsumptionWatts,
        totalKwh: norm.totalKwh,
        timestamp: norm.timestamp ?? new Date(),
      })
      .returning();

    res.status(201).json({
      id: record.id,
      solarSystemId: record.solarSystemId,
      deviceName: record.deviceName,
      currentConsumptionWatts: record.currentConsumptionWatts,
      totalKwh: record.totalKwh,
      timestamp: record.timestamp.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

// POST /api/device-consumption/batch — multiple readings at once
router.post("/device-consumption/batch", iotOrJwtAuth, async (req, res): Promise<void> => {
  try {
    const { readings } = req.body;
    if (!Array.isArray(readings) || readings.length === 0) {
      res.status(400).json({ error: "readings must be a non-empty array" });
      return;
    }

    const rawSysId = req.body.solarSystemId ?? req.body.solar_system_id;
    const defaultSystemId = rawSysId
      ? parseInt(String(rawSysId))
      : (req as any).user?.solarSystemId ?? 1;

    const values = readings.map((r: any) => {
      const norm = normaliseReading(r);
      const rSysId = r.solarSystemId ?? r.solar_system_id;
      return {
        solarSystemId: rSysId ? parseInt(String(rSysId)) : defaultSystemId,
        deviceName: norm.deviceName || "Unknown",
        currentConsumptionWatts: norm.currentConsumptionWatts,
        totalKwh: norm.totalKwh,
        timestamp: norm.timestamp ?? new Date(),
      };
    });

    const inserted = await db
      .insert(deviceConsumptionTable)
      .values(values)
      .returning();

    res.status(201).json({ inserted: inserted.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

// GET /api/device-consumption/summary — latest reading per device
router.get("/device-consumption/summary", requireAuth, async (req, res): Promise<void> => {
  try {
    const systemId = getSystemId(req);

    const latestPerDevice = await db.execute(sql`
      SELECT DISTINCT ON (device_name)
        device_name,
        current_consumption_watts,
        total_kwh,
        timestamp
      FROM device_consumption
      WHERE solar_system_id = ${systemId}
      ORDER BY device_name, timestamp DESC
    `);

    const rows = latestPerDevice.rows as {
      device_name: string;
      current_consumption_watts: number;
      total_kwh: number;
      timestamp: Date;
    }[];

    const totalWatts = rows.reduce((s, r) => s + r.current_consumption_watts, 0);

    res.json({
      systemId,
      totalWatts: Math.round(totalWatts * 10) / 10,
      devices: rows.map((r) => ({
        deviceName: r.device_name,
        currentWatts: Math.round(r.current_consumption_watts * 10) / 10,
        totalKwh: Math.round(r.total_kwh * 100) / 100,
        lastSeen: new Date(r.timestamp).toISOString(),
        share: totalWatts > 0
          ? Math.round((r.current_consumption_watts / totalWatts) * 1000) / 10
          : 0,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

// GET /api/device-consumption — paginated raw readings
router.get("/device-consumption", requireAuth, async (req, res): Promise<void> => {
  try {
    const systemId = getSystemId(req);
    const hours  = parseInt(req.query.hours  as string) || 24;
    const limit  = parseInt(req.query.limit  as string) || 100;
    const deviceFilter = req.query.device as string | undefined;

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const conditions = [
      eq(deviceConsumptionTable.solarSystemId, systemId),
      gte(deviceConsumptionTable.timestamp, since),
      ...(deviceFilter
        ? [eq(deviceConsumptionTable.deviceName, deviceFilter)]
        : []),
    ];

    const rows = await db
      .select()
      .from(deviceConsumptionTable)
      .where(and(...conditions))
      .orderBy(desc(deviceConsumptionTable.timestamp))
      .limit(limit);

    res.json(
      rows.map((r) => ({
        id: r.id,
        solarSystemId: r.solarSystemId,
        deviceName: r.deviceName,
        currentConsumptionWatts: r.currentConsumptionWatts,
        totalKwh: r.totalKwh,
        timestamp: r.timestamp.toISOString(),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

// GET /api/device-consumption/history/:deviceName — per-device trend
router.get("/device-consumption/history/:deviceName", requireAuth, async (req, res): Promise<void> => {
  try {
    const systemId  = getSystemId(req);
    const deviceName = decodeURIComponent(req.params["deviceName"] as string);
    const hours  = parseInt(req.query.hours as string) || 24;
    const since  = new Date(Date.now() - hours * 60 * 60 * 1000);

    const rows = await db
      .select()
      .from(deviceConsumptionTable)
      .where(
        and(
          eq(deviceConsumptionTable.solarSystemId, systemId),
          eq(deviceConsumptionTable.deviceName, deviceName),
          gte(deviceConsumptionTable.timestamp, since)
        )
      )
      .orderBy(deviceConsumptionTable.timestamp);

    res.json(
      rows.map((r) => ({
        timestamp: r.timestamp.toISOString(),
        watts: r.currentConsumptionWatts,
        kwh: r.totalKwh,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

export default router;
