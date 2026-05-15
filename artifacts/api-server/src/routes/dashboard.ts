import { Router } from "express";
import { db } from "@workspace/db";
import { sensorReadingsTable, alertsTable, devicesTable } from "@workspace/db";
import { desc, gte, eq, sql, and } from "drizzle-orm";
import { requireAuth, getSystemId } from "../middleware/auth";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  try {
    const systemId = getSystemId(req);
    const sysFilter = eq(sensorReadingsTable.solarSystemId, systemId);

    const latestReadings = await db
      .select()
      .from(sensorReadingsTable)
      .where(sysFilter)
      .orderBy(desc(sensorReadingsTable.timestamp))
      .limit(1);

    const latest = latestReadings[0];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayReadings = await db
      .select({ power: sensorReadingsTable.power })
      .from(sensorReadingsTable)
      .where(and(sysFilter, gte(sensorReadingsTable.timestamp, todayStart)));

    const energyToday = todayReadings.reduce((sum, r) => sum + (r.power / 1000) * (5 / 60), 0);

    const allReadings = await db
      .select({ power: sensorReadingsTable.power })
      .from(sensorReadingsTable)
      .where(sysFilter);

    const energyTotal = allReadings.reduce((sum, r) => sum + (r.power / 1000) * (5 / 60), 0);

    const [activeAlertCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(alertsTable)
      .where(and(eq(alertsTable.solarSystemId, systemId), eq(alertsTable.status, "active")));

    const devices = await db
      .select()
      .from(devicesTable)
      .where(eq(devicesTable.solarSystemId, systemId));

    const devicesOnline = devices.filter((d) => d.isEnabled && d.status !== "fault").length;

    res.json({
      currentPower: latest?.power ?? 0,
      energyToday: Math.round(energyToday * 100) / 100,
      energyTotal: Math.round(energyTotal * 100) / 100,
      batteryLevel: latest?.batteryLevel ?? 0,
      systemStatus: latest?.systemStatus ?? "offline",
      activeAlerts: activeAlertCount.count,
      devicesOnline,
      totalDevices: devices.length,
      savingsToday: Math.round(energyToday * 0.12 * 100) / 100,
      co2Saved: Math.round(energyTotal * 0.5 * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/energy-today", requireAuth, async (req, res) => {
  try {
    const systemId = getSystemId(req);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const readings = await db
      .select()
      .from(sensorReadingsTable)
      .where(and(
        eq(sensorReadingsTable.solarSystemId, systemId),
        gte(sensorReadingsTable.timestamp, todayStart)
      ))
      .orderBy(sensorReadingsTable.timestamp);

    const hourMap: Record<string, { production: number[]; consumption: number[] }> = {};
    for (let h = 0; h < 24; h++) {
      hourMap[`${h.toString().padStart(2, "0")}:00`] = { production: [], consumption: [] };
    }

    for (const r of readings) {
      const label = `${new Date(r.timestamp).getHours().toString().padStart(2, "0")}:00`;
      hourMap[label].production.push(r.power);
      hourMap[label].consumption.push(r.loadPower);
    }

    res.json(
      Object.entries(hourMap).map(([hour, data]) => ({
        hour,
        production: data.production.length > 0
          ? Math.round(data.production.reduce((a, b) => a + b, 0) / data.production.length) : 0,
        consumption: data.consumption.length > 0
          ? Math.round(data.consumption.reduce((a, b) => a + b, 0) / data.consumption.length) : 0,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/alerts-summary", requireAuth, async (req, res) => {
  try {
    const systemId = getSystemId(req);
    const alerts = await db
      .select()
      .from(alertsTable)
      .where(eq(alertsTable.solarSystemId, systemId));

    res.json({
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === "critical").length,
      warning: alerts.filter((a) => a.severity === "warning").length,
      info: alerts.filter((a) => a.severity === "info").length,
      active: alerts.filter((a) => a.status === "active").length,
      resolved: alerts.filter((a) => a.status === "resolved").length,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
