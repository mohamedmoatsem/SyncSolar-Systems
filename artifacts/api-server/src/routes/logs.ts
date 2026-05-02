import { Router } from "express";
import { db } from "@workspace/db";
import { sensorReadingsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/logs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sensorReadingsTable);

    const total = countResult.count;
    const totalPages = Math.ceil(total / limit);

    const rows = await db
      .select()
      .from(sensorReadingsTable)
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
