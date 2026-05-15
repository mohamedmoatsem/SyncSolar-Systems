import { Router } from "express";
import { db } from "@workspace/db";
import { sensorReadingsTable } from "@workspace/db";
import { desc, eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { requireAuth, getSystemId } from "../middleware/auth";

const router = Router();

router.get("/logs", requireAuth, async (req, res) => {
  try {
    const systemId = getSystemId(req);
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const sysFilter = eq(sensorReadingsTable.solarSystemId, systemId);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sensorReadingsTable)
      .where(sysFilter);

    const total = countResult.count;
    const totalPages = Math.ceil(total / limit);

    const rows = await db
      .select()
      .from(sensorReadingsTable)
      .where(sysFilter)
      .orderBy(desc(sensorReadingsTable.timestamp))
      .limit(limit)
      .offset(offset);

    res.json({
      data: rows.map((r) => ({
        id: r.id,
        timestamp: r.timestamp.toISOString(),
        voltage: r.voltage,
        current: r.current,
        power: r.power,
        batteryLevel: r.batteryLevel,
        temperature: r.temperature,
        irradiance: r.irradiance,
        loadPower: r.loadPower,
        systemStatus: r.systemStatus,
      })),
      total,
      page,
      totalPages,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
