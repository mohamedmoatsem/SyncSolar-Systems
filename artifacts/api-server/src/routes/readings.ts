import { Router } from "express";
import { db } from "@workspace/db";
import { sensorReadingsTable } from "@workspace/db";
import { desc, gte } from "drizzle-orm";

const router = Router();

router.get("/readings/latest", async (req, res) => {
  try {
    const reading = await db
      .select()
      .from(sensorReadingsTable)
      .orderBy(desc(sensorReadingsTable.timestamp))
      .limit(1);

    if (reading.length === 0) {
      return res.status(404).json({ error: "No readings found" });
    }

    const r = reading[0];
    res.json({
      id: r.id,
      voltage: r.voltage,
      current: r.current,
      power: r.power,
      batteryLevel: r.batteryLevel,
      batteryVoltage: r.batteryVoltage,
      temperature: r.temperature,
      irradiance: r.irradiance,
      loadPower: r.loadPower,
      systemStatus: r.systemStatus,
      timestamp: r.timestamp.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/readings/history", async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const metric = (req.query.metric as string) || "power";

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const readings = await db
      .select()
      .from(sensorReadingsTable)
      .where(gte(sensorReadingsTable.timestamp, since))
      .orderBy(sensorReadingsTable.timestamp);

    const metricMap: Record<string, keyof typeof readings[0]> = {
      voltage: "voltage",
      current: "current",
      power: "power",
      battery: "batteryLevel",
      temperature: "temperature",
      irradiance: "irradiance",
    };

    const field = metricMap[metric] || "power";

    const result = readings.map((r) => ({
      timestamp: r.timestamp.toISOString(),
      value: r[field] as number,
      metric,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/readings", async (req, res) => {
  try {
    const {
      voltage,
      current,
      power,
      batteryLevel,
      batteryVoltage,
      temperature,
      irradiance,
      loadPower,
      systemStatus = "normal",
    } = req.body;

    const [reading] = await db
      .insert(sensorReadingsTable)
      .values({
        voltage,
        current,
        power,
        batteryLevel,
        batteryVoltage,
        temperature,
        irradiance,
        loadPower,
        systemStatus,
        timestamp: new Date(),
      })
      .returning();

    res.status(201).json({
      id: reading.id,
      voltage: reading.voltage,
      current: reading.current,
      power: reading.power,
      batteryLevel: reading.batteryLevel,
      batteryVoltage: reading.batteryVoltage,
      temperature: reading.temperature,
      irradiance: reading.irradiance,
      loadPower: reading.loadPower,
      systemStatus: reading.systemStatus,
      timestamp: reading.timestamp.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
