import { pgTable, serial, real, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { solarSystemsTable } from "./auth";

export const deviceConsumptionTable = pgTable("device_consumption", {
  id: serial("id").primaryKey(),
  solarSystemId: integer("solar_system_id").references(() => solarSystemsTable.id).notNull(),
  deviceName: text("device_name").notNull(),
  currentConsumptionWatts: real("current_consumption_watts").notNull().default(0),
  totalKwh: real("total_kwh").notNull().default(0),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertDeviceConsumptionSchema = createInsertSchema(deviceConsumptionTable).omit({ id: true });
export type InsertDeviceConsumption = z.infer<typeof insertDeviceConsumptionSchema>;
export type DeviceConsumption = typeof deviceConsumptionTable.$inferSelect;
