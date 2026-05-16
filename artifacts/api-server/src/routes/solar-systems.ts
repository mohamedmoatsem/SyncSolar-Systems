import { Router } from "express";
import { db, solarSystemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/solar-systems", requireAuth, requireRole("technician"), async (req, res): Promise<void> => {
  try {
    const systems = await db.select().from(solarSystemsTable).orderBy(solarSystemsTable.id);
    res.json(systems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/solar-systems/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params["id"] as string);
    if (req.user?.role === "client" && req.user.solarSystemId !== id) {
      res.status(403).json({ error: "Access denied to this system" });
      return;
    }
    const [system] = await db
      .select()
      .from(solarSystemsTable)
      .where(eq(solarSystemsTable.id, id));
    if (!system) {
      res.status(404).json({ error: "System not found" });
      return;
    }
    res.json(system);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
