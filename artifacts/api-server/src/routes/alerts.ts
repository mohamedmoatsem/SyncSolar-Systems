import { Router } from "express";
import { db } from "@workspace/db";
import { alertsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, getSystemId } from "../middleware/auth";

const router = Router();

router.get("/alerts", requireAuth, async (req, res) => {
  try {
    const systemId = getSystemId(req);
    const status = (req.query.status as string) || "all";

    const sysFilter = eq(alertsTable.solarSystemId, systemId);
    const rows = await db
      .select()
      .from(alertsTable)
      .where(
        status === "active" ? and(sysFilter, eq(alertsTable.status, "active")) :
        status === "resolved" ? and(sysFilter, eq(alertsTable.status, "resolved")) :
        sysFilter
      )
      .orderBy(desc(alertsTable.timestamp));

    res.json(
      rows.map((a) => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        message: a.message,
        status: a.status,
        timestamp: a.timestamp.toISOString(),
        resolvedAt: a.resolvedAt ? a.resolvedAt.toISOString() : null,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/alerts/:id/resolve", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const systemId = getSystemId(req);

    const [updated] = await db
      .update(alertsTable)
      .set({ status: "resolved", resolvedAt: new Date() })
      .where(and(eq(alertsTable.id, id), eq(alertsTable.solarSystemId, systemId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({
      id: updated.id,
      type: updated.type,
      severity: updated.severity,
      message: updated.message,
      status: updated.status,
      timestamp: updated.timestamp.toISOString(),
      resolvedAt: updated.resolvedAt ? updated.resolvedAt.toISOString() : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
