/**
 * Seeds realistic solar sensor readings for TODAY (full 24-hour curve).
 * Run with: node seed-today.mjs
 */
import pg from "pg";

const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// ── helpers ────────────────────────────────────────────────────────────────
const rand = (min, max) => min + Math.random() * (max - min);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Solar irradiance curve for a clear day.
 * Returns W/m² for a given hour (0–23).
 */
function irradianceForHour(hour) {
  // Bell curve centred at solar noon (13:00)
  if (hour < 5.5 || hour > 20) return 0;
  const peak = 950;
  const centre = 13;
  const width = 5;
  const raw = peak * Math.exp(-0.5 * Math.pow((hour - centre) / width, 2));
  return clamp(raw, 0, peak);
}

// ── generate readings every 5 minutes for all 24 hours ────────────────────
const now = new Date();
const todayStart = new Date(now);
todayStart.setHours(0, 0, 0, 0);

const INTERVAL_MIN = 5; // one reading every 5 minutes
const totalPoints = (24 * 60) / INTERVAL_MIN; // 288 readings

let battery = 45; // battery level %, starts at 45 %

const rows = [];

for (let i = 0; i < totalPoints; i++) {
  const ts = new Date(todayStart.getTime() + i * INTERVAL_MIN * 60 * 1000);
  const hour = ts.getHours() + ts.getMinutes() / 60;

  // irradiance with slight cloud noise
  const irr = clamp(irradianceForHour(hour) + rand(-30, 30), 0, 980);

  // panel temperature: ambient ~25°C + heating from irradiance
  const panelTemp = 25 + irr * 0.04 + rand(-1, 1);

  // array voltage: 48 V nominal; drops slightly in heat
  const voltage = clamp(48 + rand(-1.5, 1.5) - panelTemp * 0.01, 44, 52);

  // current proportional to irradiance
  const maxCurrent = 18;
  const current = clamp((irr / 980) * maxCurrent + rand(-0.3, 0.3), 0, maxCurrent);

  // power = V × I
  const power = clamp(voltage * current + rand(-5, 5), 0, 900);

  // load power: baseline 350W, peaks morning & evening
  const loadBase = 350;
  const morningPeak = hour >= 6 && hour <= 9 ? 150 : 0;
  const eveningPeak = hour >= 18 && hour <= 22 ? 200 : 0;
  const loadPower = clamp(loadBase + morningPeak + eveningPeak + rand(-30, 30), 280, 600);

  // battery: charges when production > load, discharges otherwise
  const netW = power - loadPower;
  battery = clamp(battery + (netW / 2400) * (INTERVAL_MIN / 60) * 100, 10, 100);

  const batteryVoltage = clamp(48 + (battery - 50) * 0.04 + rand(-0.1, 0.1), 46, 54);

  // system status
  let systemStatus = "normal";
  if (battery < 15) systemStatus = "warning";
  if (battery < 10) systemStatus = "fault";

  rows.push([
    voltage.toFixed(3),
    current.toFixed(3),
    power.toFixed(3),
    battery.toFixed(2),
    batteryVoltage.toFixed(3),
    panelTemp.toFixed(2),
    irr.toFixed(1),
    loadPower.toFixed(2),
    systemStatus,
    ts.toISOString(),
  ]);
}

// ── delete old today readings and insert new ones ─────────────────────────
const todayISO = todayStart.toISOString();
await client.query(
  `DELETE FROM sensor_readings WHERE timestamp >= $1`,
  [todayISO]
);

console.log(`Inserting ${rows.length} readings for today…`);

// batch insert in chunks of 50
const chunkSize = 50;
for (let start = 0; start < rows.length; start += chunkSize) {
  const chunk = rows.slice(start, start + chunkSize);
  const placeholders = chunk
    .map(
      (_, ri) =>
        `($${ri * 10 + 1},$${ri * 10 + 2},$${ri * 10 + 3},$${ri * 10 + 4},$${ri * 10 + 5},$${ri * 10 + 6},$${ri * 10 + 7},$${ri * 10 + 8},$${ri * 10 + 9},$${ri * 10 + 10})`
    )
    .join(",");
  const values = chunk.flat();
  await client.query(
    `INSERT INTO sensor_readings
       (voltage,current,power,battery_level,battery_voltage,temperature,irradiance,load_power,system_status,timestamp)
     VALUES ${placeholders}`,
    values
  );
  process.stdout.write(`  ${Math.min(start + chunkSize, rows.length)}/${rows.length}\r`);
}

await client.end();
console.log("\nDone! Today's solar data seeded successfully.");
