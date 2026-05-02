import { pgTable, serial, real, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sensorReadingsTable = pgTable("sensor_readings", {
  id: serial("id").primaryKey(),
  voltage: real("voltage").notNull(),
  current: real("current").notNull(),
  power: real("power").notNull(),
  batteryLevel: real("battery_level").notNull(),
  batteryVoltage: real("battery_voltage").notNull(),
  temperature: real("temperature").notNull(),
  irradiance: real("irradiance").notNull(),
  loadPower: real("load_power").notNull(),
  systemStatus: text("system_status").notNull().default("normal"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertSensorReadingSchema = createInsertSchema(sensorReadingsTable).omit({ id: true });
export type InsertSensorReading = z.infer<typeof insertSensorReadingSchema>;
export type SensorReading = typeof sensorReadingsTable.$inferSelect;

export const alertsTable = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("active"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ id: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alertsTable.$inferSelect;

export const devicesTable = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("on"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  powerRating: real("power_rating").notNull(),
  location: text("location").notNull(),
});

export const insertDeviceSchema = createInsertSchema(devicesTable).omit({ id: true });
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devicesTable.$inferSelect;
