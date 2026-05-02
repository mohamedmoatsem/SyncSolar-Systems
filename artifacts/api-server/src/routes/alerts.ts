import { Router } from "express";
import { db } from "@workspace/db";
import { alertsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

router.get("/alerts", async (req, res) => {
  try {
    const status = req.query.status as string || "all";

    let rows;
    if (status === "active") {
      rows = await db
        .select()
        .from(alertsTable)
        .where(eq(alertsTable.status, "active"))
        .orderBy(desc(alertsTable.timestamp));
    } else if (status === "resolved") {
      rows = await db
        .select()
        .from(alertsTable)
        .where(eq(alertsTable.status, "resolved"))
        .orderBy(desc(alertsTable.timestamp));
    } else {
      rows = await db
        .select()
        .from(alertsTable)
        .orderBy(desc(alertsTable.timestamp));
    }

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

router.patch("/alerts/:id/resolve", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [updated] = await db
      .update(alertsTable)
      .set({ status: "resolved", resolvedAt: new Date() })
      .where(eq(alertsTable.id, id))
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
