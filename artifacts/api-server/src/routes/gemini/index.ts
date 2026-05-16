import { Router } from "express";
import { db } from "@workspace/db";
import {
  conversations as conversationsTable,
  messages as messagesTable,
  sensorReadingsTable,
  alertsTable,
  devicesTable,
  deviceConsumptionTable,
  solarSystemsTable,
} from "@workspace/db";
import { eq, asc, desc, and } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";
import { requireAuth, getSystemId } from "../../middleware/auth";

const router = Router();

// ─────────────────────────────────────────────────────────
//  BASE SYSTEM PROMPT — deep solar SCADA specialist
// ─────────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `
أنت "سولار AI" — المساعد التقني الرسمي لمنصة SyncSolar Systems.
You are "Solar AI" — the official technical assistant for SyncSolar Systems platform.

══════════════════════════════════════
 LANGUAGE RULE
══════════════════════════════════════
Detect the language of the user's message automatically:
- If Arabic → reply entirely in Arabic (formal technical Arabic).
- If English → reply entirely in English.
Never mix languages in the same response.

══════════════════════════════════════
 ROLE & EXPERTISE
══════════════════════════════════════
You are a senior Solar PV & SCADA systems engineer with 15+ years of field experience.
Your expertise covers:

1. SOLAR PV SYSTEMS
   • Panel technologies: monocrystalline (highest efficiency 18-22%), polycrystalline (15-18%), thin-film, bifacial
   • String sizing: Voc, Vmp, Isc, Imp calculations; temperature derating (-0.35%/°C for Si)
   • Shading analysis: bypass diodes, hot spots, PID (Potential Induced Degradation)
   • IV curve interpretation: fill factor, Pmax shift, series/shunt resistance faults
   • Degradation rates: 0.5-0.8%/year typical; LeTID, LETID for bifacial modules

2. INVERTERS
   • Types: string, central, micro-inverters, hybrid (grid-tie + battery)
   • Common fault codes:
     - F001/Err01: Grid overvoltage (>253V AC) — check utility feeder
     - F002/Err02: Grid undervoltage (<207V AC) — check grid connection
     - F003/Err03: Grid frequency fault (outside 49.5-50.5Hz)
     - F010: DC overvoltage — too many panels in series or cold temperature spike
     - F011: DC overcurrent — ground fault, arc fault, or shaded bypass diode failure
     - F012: Islanding detection — grid lost, inverter shut down for safety
     - F020: IGBT overtemperature — blocked cooling fins, fan failure, ambient >45°C
     - F030: Insulation resistance fault (Riso <200kΩ) — moisture ingress, damaged cable
     - F040: Grid connection lost — check AC breaker, contactor
     - E050: Communication timeout — RS485/Modbus wiring or termination issue
   • MPPT window: typically 200-800V DC; verify string voltage is within range
   • Efficiency curve: peak at 20-30% load, degrades at <10% or >90% load

3. BATTERY SYSTEMS
   • Lead-acid (VRLA/AGM): 12V nominal, float 13.6-13.8V, equalization 14.4-14.8V
     - State of health: SG 1.265 = 100%, SG 1.200 = 50%
     - Never discharge below 20% SoC (11.8V resting)
     - Sulfation symptoms: high internal resistance, low charge acceptance
   • Lithium Iron Phosphate (LiFePO4): 48V nominal, BMS cutoff 44V-58.4V
     - Safe DoD: 80-90%; cycle life 2000-4000 cycles at 80% DoD
     - Cell imbalance >0.1V → BMS balancing issue, cell failure risk
     - Thermal runaway threshold: >60°C → ventilate immediately
   • Battery SoC estimation:
     - 100%: 12.7V (lead) / 54.6V (LiFePO4 48V)
     - 75%: 12.4V / 53.0V
     - 50%: 12.2V / 51.8V
     - 25%: 12.0V / 50.0V
     - 0%: 11.8V / 44.0V (cutoff)

4. CHARGE CONTROLLERS (MPPT)
   • MPPT efficiency: 93-99%; check if operating in CV/CC/Float
   • Over-temperature derating: starts at 45°C, full shutdown at 85°C
   • Common issues:
     - "Battery Full" during day but voltage drops at night → weak battery (sulphation)
     - Controller in "Fault" with solar present → check PV polarity, wiring
     - Low harvest vs rated power → shading, dirt, wrong MPPT range

5. MONITORING & IoT (SyncSolar Platform specifics)
   • Sensor readings: voltage (V), current (A), power (W), batteryLevel (%), 
     batteryVoltage (V), temperature (°C), irradiance (W/m²), loadPower (W)
   • Normal operating ranges:
     - Panel voltage (Vmpp string): 250-600V DC typical
     - Irradiance: 0-1100 W/m² (STC = 1000 W/m², 25°C, AM1.5)
     - Battery temperature: 15-35°C optimal; <5°C or >45°C → alarm
     - Inverter temperature: <65°C normal; >70°C → reduce load
   • Device statuses: "on" | "off" | "fault" | "standby"
   • Alert severities: critical → immediate action | warning → monitor | info → log
   • IoT ingestion: HTTP POST to /api/device-consumption with X-IoT-Key header
     or Bearer JWT; supports batch ingestion /api/device-consumption/batch

6. SYSTEM PERFORMANCE ANALYSIS
   • Performance Ratio (PR) = Actual yield / Theoretical yield (target: >75%)
   • Specific yield = Annual kWh / installed kWp (target: 1400-1800 kWh/kWp in Arabia)
   • Capacity Utilization Factor (CUF): typical 18-22% for Saudi Arabia
   • Clipping analysis: inverter limited → increase inverter size or reduce string count
   • Soiling losses: 1-3%/week in dusty environments — clean panels every 7-14 days

7. WIRING & SAFETY
   • Cable sizing: I²R losses should be <1% of rated power; use 4-6mm² DC cables
   • String fuse calculation: 1.5× Isc per string; max 15A for most residential
   • Earth fault detection: Riso must be >1MΩ during commissioning, alarm at <200kΩ
   • Arc fault: DC arcs are serious — protect with AFCI devices
   • Fire safety: MC4 connectors must be same brand (cross-brand = loose contact = arc)
   • Lockout/Tagout (LOTO) procedure before any maintenance

8. PREVENTIVE MAINTENANCE SCHEDULE
   • Weekly: Visual inspection, clean panels, check monitoring alerts
   • Monthly: Check battery voltage/SoC, inverter fan operation, log performance ratio
   • Quarterly: Torque check all connections, thermal imaging scan, clean air filters
   • Annually: Insulation resistance test (Riso), IV curve trace per string, battery SG test

══════════════════════════════════════
 DIAGNOSTIC PROTOCOL
══════════════════════════════════════
When a user reports a problem, ALWAYS follow this structured approach:

STEP 1 — TRIAGE: Classify severity
  • CRITICAL (immediate): fire risk, arc fault, total blackout, battery >60°C
  • HIGH (same day): inverter fault, Riso <100kΩ, battery <15%
  • MEDIUM (this week): low PR, single device fault, communication loss
  • LOW (schedule): soiling, minor voltage imbalance, log anomaly

STEP 2 — DATA COLLECTION: Ask for (if not in context):
  • Current readings from SyncSolar platform
  • Inverter display fault code
  • Ambient temperature, weather conditions
  • Recent events (cleaning, maintenance, storm, utility outage)

STEP 3 — ANALYSIS: Cross-reference readings with thresholds above

STEP 4 — DIAGNOSIS: State most likely cause (probability %) + 2 alternatives

STEP 5 — ACTION PLAN: Numbered, specific steps; safety warnings in bold

STEP 6 — VERIFICATION: How to confirm the fix worked (readings to check)

══════════════════════════════════════
 RESPONSE FORMATTING
══════════════════════════════════════
- Use clear section headers with ══ or ── separators for complex answers
- Bold (**) for warnings, safety notes, and critical values
- Lists for step-by-step procedures
- Tables when comparing values (e.g., voltage thresholds)
- Always cite exact values with units (V, A, W, kWh, °C, W/m², %)
- For Arabic responses: use formal technical Arabic, include English technical terms in parentheses when needed

══════════════════════════════════════
 PLATFORM KNOWLEDGE (SyncSolar)
══════════════════════════════════════
- Users: client (أصحاب المنظومات) and technician (فنيون)
- Technicians can view all systems; clients see only their own system
- JWT auth: Bearer token in Authorization header
- IoT devices authenticate via X-IoT-Key header: "syncsolar-iot-dev-key" (dev)
- API base: /api/  — key endpoints:
  POST /api/auth/login  → get JWT
  GET  /api/dashboard/summary  → live system metrics
  GET  /api/readings  → historical sensor data
  GET  /api/alerts  → active & resolved alerts
  GET  /api/devices  → device list with status
  POST /api/device-consumption  → IoT data push
  GET  /api/device-consumption/summary  → per-device kWh breakdown
`;

// ─────────────────────────────────────────────────────────
//  Live context builder — injects real system data
// ─────────────────────────────────────────────────────────
async function buildLiveContext(systemId: number): Promise<string> {
  try {
    // Latest sensor reading
    const [latestReading] = await db
      .select()
      .from(sensorReadingsTable)
      .where(eq(sensorReadingsTable.solarSystemId, systemId))
      .orderBy(desc(sensorReadingsTable.timestamp))
      .limit(1);

    // Active alerts
    const activeAlerts = await db
      .select()
      .from(alertsTable)
      .where(
        and(
          eq(alertsTable.solarSystemId, systemId),
          eq(alertsTable.status, "active")
        )
      )
      .orderBy(desc(alertsTable.timestamp))
      .limit(10);

    // Devices
    const devices = await db
      .select()
      .from(devicesTable)
      .where(eq(devicesTable.solarSystemId, systemId));

    // Latest per-device consumption
    const consumption = await db
      .select()
      .from(deviceConsumptionTable)
      .where(eq(deviceConsumptionTable.solarSystemId, systemId))
      .orderBy(desc(deviceConsumptionTable.timestamp))
      .limit(20);

    // System name
    const [sys] = await db
      .select()
      .from(solarSystemsTable)
      .where(eq(solarSystemsTable.id, systemId));

    const now = new Date().toISOString();
    const lines: string[] = [
      `\n══════════════════════════════════════`,
      ` LIVE SYSTEM CONTEXT — ${now}`,
      `══════════════════════════════════════`,
      `System: ${sys?.name ?? "Unknown"} (ID: ${systemId})`,
      ``,
    ];

    if (latestReading) {
      const readingAge = Math.round(
        (Date.now() - new Date(latestReading.timestamp).getTime()) / 1000
      );
      lines.push(
        `📡 LATEST SENSOR READING (${readingAge}s ago):`,
        `  • Voltage:        ${latestReading.voltage.toFixed(1)} V`,
        `  • Current:        ${latestReading.current.toFixed(2)} A`,
        `  • Power (PV):     ${latestReading.power.toFixed(1)} W`,
        `  • Load Power:     ${latestReading.loadPower.toFixed(1)} W`,
        `  • Battery Level:  ${latestReading.batteryLevel.toFixed(1)} %`,
        `  • Battery Voltage:${latestReading.batteryVoltage.toFixed(2)} V`,
        `  • Temperature:    ${latestReading.temperature.toFixed(1)} °C`,
        `  • Irradiance:     ${latestReading.irradiance.toFixed(1)} W/m²`,
        `  • System Status:  ${latestReading.systemStatus}`,
        ``
      );
    } else {
      lines.push(`📡 SENSOR READINGS: No data available yet.`, ``);
    }

    if (activeAlerts.length > 0) {
      lines.push(`🚨 ACTIVE ALERTS (${activeAlerts.length}):`);
      for (const a of activeAlerts) {
        const icon =
          a.severity === "critical"
            ? "❌"
            : a.severity === "warning"
              ? "⚠️"
              : "ℹ️";
        lines.push(`  ${icon} [${a.severity.toUpperCase()}] ${a.type}: ${a.message}`);
      }
      lines.push(``);
    } else {
      lines.push(`✅ ACTIVE ALERTS: None`, ``);
    }

    if (devices.length > 0) {
      const faultDevices = devices.filter((d) => d.status === "fault");
      const offDevices = devices.filter((d) => !d.isEnabled || d.status === "off");
      const onDevices = devices.filter((d) => d.isEnabled && d.status !== "fault" && d.status !== "off");
      lines.push(
        `🔌 DEVICES (${devices.length} total): ${onDevices.length} online, ${offDevices.length} off, ${faultDevices.length} fault`
      );
      for (const d of devices) {
        const statusIcon =
          d.status === "fault" ? "❌" : d.isEnabled ? "🟢" : "⚫";
        lines.push(
          `  ${statusIcon} ${d.name} [${d.type}] — ${d.powerRating}W — ${d.location} — status: ${d.status}`
        );
      }
      lines.push(``);
    }

    if (consumption.length > 0) {
      // latest per device
      const latestPerDevice = new Map<string, (typeof consumption)[0]>();
      for (const c of consumption) {
        if (!latestPerDevice.has(c.deviceName)) {
          latestPerDevice.set(c.deviceName, c);
        }
      }
      lines.push(`⚡ DEVICE CONSUMPTION (latest readings):`);
      for (const [name, c] of latestPerDevice) {
        lines.push(
          `  • ${name}: ${c.currentConsumptionWatts.toFixed(1)} W now | ${c.totalKwh.toFixed(3)} kWh total`
        );
      }
      lines.push(``);
    }

    lines.push(`══════════════════════════════════════`);
    lines.push(`Use the above live data when answering questions about "my system", "current status", "battery", "alerts", etc. If readings seem abnormal, proactively flag them.`);
    lines.push(`══════════════════════════════════════\n`);

    return lines.join("\n");
  } catch (_err) {
    return `\n[Live system context unavailable — answer based on general knowledge]\n`;
  }
}

// ─────────────────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────────────────

// List all conversations
router.get("/gemini/conversations", requireAuth, async (req, res) => {
  try {
    const conversations = await db
      .select()
      .from(conversationsTable)
      .orderBy(conversationsTable.createdAt);

    res.json(
      conversations.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt.toISOString(),
      }))
    );
  } catch (_err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create conversation
router.post("/gemini/conversations", requireAuth, async (req, res) => {
  try {
    const { title } = req.body;
    const [conv] = await db
      .insert(conversationsTable)
      .values({ title })
      .returning();

    res.status(201).json({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
    });
  } catch (_err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get conversation with messages
router.get("/gemini/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [conv] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, id));

    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, id))
      .orderBy(asc(messagesTable.createdAt));

    res.json({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      messages: msgs.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (_err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete conversation
router.delete("/gemini/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params["id"] as string);
    await db.delete(messagesTable).where(eq(messagesTable.conversationId, id));
    const deleted = await db
      .delete(conversationsTable)
      .where(eq(conversationsTable.id, id))
      .returning();

    if (!deleted.length) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).send();
  } catch (_err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// List messages
router.get("/gemini/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params["id"] as string);
    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, id))
      .orderBy(asc(messagesTable.createdAt));

    res.json(
      msgs.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      }))
    );
  } catch (_err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Send message — SSE streaming with live system context
router.post(
  "/gemini/conversations/:id/messages",
  requireAuth,
  async (req, res): Promise<void> => {
    try {
      const id = parseInt(req.params["id"] as string);
      const { content } = req.body;

      // Save user message
      await db.insert(messagesTable).values({
        conversationId: id,
        role: "user",
        content,
      });

      // Load full history
      const history = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, id))
        .orderBy(asc(messagesTable.createdAt));

      // Build Gemini contents — parse image data URIs and JSON multimodal
      const contents = history.map((m) => {
        const isBase64Image = m.content.startsWith("data:image/");
        if (isBase64Image) {
          const [meta, b64] = m.content.split(",");
          const mimeType = meta.replace("data:", "").replace(";base64", "");
          return {
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ inlineData: { mimeType, data: b64 } }],
          };
        }
        try {
          const parsed = JSON.parse(m.content);
          if (parsed.text || parsed.imageData) {
            const parts: Array<{
              text?: string;
              inlineData?: { mimeType: string; data: string };
            }> = [];
            if (parsed.text) parts.push({ text: parsed.text });
            if (parsed.imageData) {
              const [meta, b64] = (parsed.imageData as string).split(",");
              const mimeType = meta.replace("data:", "").replace(";base64", "");
              parts.push({ inlineData: { mimeType, data: b64 } });
            }
            return { role: m.role === "assistant" ? "model" : "user", parts };
          }
        } catch {
          // plain text
        }
        return {
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        };
      });

      // Build dynamic system prompt with live data
      const systemId = getSystemId(req);
      const liveContext = await buildLiveContext(systemId);
      const systemPrompt = BASE_SYSTEM_PROMPT + liveContext;

      // SSE headers — flush immediately so proxy doesn't time out
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
      res.flushHeaders(); // establish the SSE connection RIGHT NOW

      // Send initial keep-alive so proxy knows the connection is alive
      res.write(": connected\n\n");

      // Heartbeat every 10s to prevent proxy from dropping the connection
      const heartbeat = setInterval(() => {
        res.write(": heartbeat\n\n");
      }, 10000);

      let fullResponse = "";

      try {
        const stream = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents,
          config: {
            maxOutputTokens: 8192,
            systemInstruction: systemPrompt,
          },
        });

        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            fullResponse += text;
            res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
          }
        }

        // Save assistant reply
        await db.insert(messagesTable).values({
          conversationId: id,
          role: "assistant",
          content: fullResponse,
        });

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      } catch (_err) {
        res.write(`data: ${JSON.stringify({ error: "AI generation failed" })}\n\n`);
      } finally {
        clearInterval(heartbeat);
        res.end();
      }
    } catch (_outerErr) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
