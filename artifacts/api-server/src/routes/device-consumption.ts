import { Router, type Request, type Response } from "express";
import { db, deviceConsumptionTable } from "@workspace/db";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { requireAuth, getSystemId } from "../middleware/auth";
import { verifyToken } from "../lib/jwt";

const router = Router();

const IOT_API_KEY = process.env.IOT_API_KEY ?? "syncsolar-iot-dev-key";

function iotOrJwtAuth(req: Request, res: Response, next: () => void) {
  const iotKey = req.headers["x-iot-key"];
  if (iotKey === IOT_API_KEY) {
    return next();
  }
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      (req as any).user = verifyToken(header.slice(7));
      return next();
    } catch {}
  }
  return res.status(401).json({ error: "Unauthorized — provide Bearer token or X-IoT-Key header" });
}

// POST /api/device-consumption
// IoT sensor endpoint — accepts data from devices
router.post("/device-consumption", iotOrJwtAuth, async (req, res) => {
  try {
    const {
      solar_system_id,
      device_name,
      current_consumption_watts,
      total_kwh,
      timestamp,
    } = req.body;

    if (!device_name || current_consumption_watts === undefined) {
      return res.status(400).json({ error: "device_name and current_consumption_watts are required" });
    }

    const systemId =
      solar_system_id
        ? parseInt(solar_system_id)
        : (req as any).user?.solarSystemId ?? 1;

    const [record] = await db
      .insert(deviceConsumptionTable)
      .values({
        solarSystemId: systemId,
        deviceName: String(device_name),
        currentConsumptionWatts: Number(current_consumption_watts),
        totalKwh: total_kwh !== undefined ? Number(total_kwh) : 0,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      })
      .returning();

    return res.status(201).json({
      id: record.id,
      solarSystemId: record.solarSystemId,
      deviceName: record.deviceName,
      currentConsumptionWatts: record.currentConsumptionWatts,
      totalKwh: record.totalKwh,
      timestamp: record.timestamp.toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

// POST /api/device-consumption/batch
// IoT batch endpoint — sends multiple device readings at once
router.post("/device-consumption/batch", iotOrJwtAuth, async (req, res) => {
  try {
    const { solar_system_id, readings } = req.body;
    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ error: "readings must be a non-empty array" });
    }

    const systemId = solar_system_id
      ? parseInt(solar_system_id)
      : (req as any).user?.solarSystemId ?? 1;

    const values = readings.map((r: any) => ({
      solarSystemId: systemId,
      deviceName: String(r.device_name),
      currentConsumptionWatts: Number(r.current_consumption_watts),
      totalKwh: r.total_kwh !== undefined ? Number(r.total_kwh) : 0,
      timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
    }));

    const inserted = await db
      .insert(deviceConsumptionTable)
      .values(values)
      .returning();

    return res.status(201).json({ inserted: inserted.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

// GET /api/device-consumption/summary
// Latest reading per device + totals (used by the mobile chart)
router.get("/device-consumption/summary", requireAuth, async (req, res) => {
  try {
    const systemId = getSystemId(req);

    // Latest reading per device using a lateral join approach
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

    // Total watts across all devices
    const totalWatts = rows.reduce((s, r) => s + r.current_consumption_watts, 0);

    return res.json({
      systemId,
      totalWatts: Math.round(totalWatts * 10) / 10,
      devices: rows.map((r) => ({
        deviceName: r.device_name,
        currentWatts: Math.round(r.current_consumption_watts * 10) / 10,
        totalKwh: Math.round(r.total_kwh * 100) / 100,
        lastSeen: new Date(r.timestamp).toISOString(),
        share: totalWatts > 0 ? Math.round((r.current_consumption_watts / totalWatts) * 1000) / 10 : 0,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

// GET /api/device-consumption
// Recent raw readings (paginated, used for logs / history view)
router.get("/device-consumption", requireAuth, async (req, res) => {
  try {
    const systemId = getSystemId(req);
    const hours = parseInt(req.query.hours as string) || 24;
    const limit = parseInt(req.query.limit as string) || 100;
    const deviceFilter = req.query.device as string | undefined;

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const conditions = [
      eq(deviceConsumptionTable.solarSystemId, systemId),
      gte(deviceConsumptionTable.timestamp, since),
      ...(deviceFilter ? [eq(deviceConsumptionTable.deviceName, deviceFilter)] : []),
    ];

    const rows = await db
      .select()
      .from(deviceConsumptionTable)
      .where(and(...conditions))
      .orderBy(desc(deviceConsumptionTable.timestamp))
      .limit(limit);

    return res.json(
      rows.map((r) => ({
        id: r.id,
        deviceName: r.deviceName,
        currentWatts: r.currentConsumptionWatts,
        totalKwh: r.totalKwh,
        timestamp: r.timestamp.toISOString(),
      }))
    );
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

// GET /api/device-consumption/history/:deviceName
// Time-series for a single device (sparkline data)
router.get("/device-consumption/history/:deviceName", requireAuth, async (req, res) => {
  try {
    const systemId = getSystemId(req);
    const deviceName = decodeURIComponent(req.params.deviceName);
    const hours = parseInt(req.query.hours as string) || 6;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const rows = await db
      .select({
        timestamp: deviceConsumptionTable.timestamp,
        watts: deviceConsumptionTable.currentConsumptionWatts,
        kwh: deviceConsumptionTable.totalKwh,
      })
      .from(deviceConsumptionTable)
      .where(and(
        eq(deviceConsumptionTable.solarSystemId, systemId),
        eq(deviceConsumptionTable.deviceName, deviceName),
        gte(deviceConsumptionTable.timestamp, since),
      ))
      .orderBy(deviceConsumptionTable.timestamp);

    return res.json(rows.map((r) => ({
      timestamp: r.timestamp.toISOString(),
      watts: r.watts,
      kwh: r.kwh,
    })));
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

export default router;
