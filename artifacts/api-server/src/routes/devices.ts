import { Router } from "express";
import { db } from "@workspace/db";
import { devicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/devices", async (req, res) => {
  try {
    const devices = await db.select().from(devicesTable);
    res.json(
      devices.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        status: d.status,
        isEnabled: d.isEnabled,
        powerRating: d.powerRating,
        location: d.location,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/devices/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { isEnabled } = req.body;

    const [updated] = await db
      .update(devicesTable)
      .set({
        isEnabled,
        status: isEnabled ? "on" : "off",
      })
      .where(eq(devicesTable.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.json({
      id: updated.id,
      name: updated.name,
      type: updated.type,
      status: updated.status,
      isEnabled: updated.isEnabled,
      powerRating: updated.powerRating,
      location: updated.location,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
