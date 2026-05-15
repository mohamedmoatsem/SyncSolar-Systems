import { Router } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";
import { requireAuth } from "../../middleware/auth";

const router = Router();

const SYSTEM_PROMPT = `You are an expert Solar Energy & SCADA Systems engineer and technical advisor. You specialize in:
- Solar photovoltaic (PV) systems: panels, inverters, charge controllers, batteries
- SCADA (Supervisory Control and Data Acquisition) systems for energy monitoring
- IoT (Internet of Things) remote monitoring and control
- Electrical engineering: voltage, current, power, energy calculations
- Fault diagnosis and troubleshooting for solar installations
- Data analysis of sensor readings: irradiance, temperature, battery state, load management
- Safety standards and best practices for solar installations
- System optimization and performance improvement

When analyzing problems:
1. Ask for specific readings (voltage, current, power, battery %, temperature, irradiance) if not provided
2. Provide clear technical diagnosis based on the data
3. Give step-by-step troubleshooting guidance
4. Suggest preventive maintenance measures
5. Explain technical concepts in clear terms

You can analyze images of solar panels, inverters, wiring diagrams, SCADA screens, or any related equipment. Provide detailed technical assessments and actionable recommendations.

Always be precise with units (V, A, W, kWh, °C, W/m², %) and reference standard thresholds and limits.`;

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
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get conversation with messages
router.get("/gemini/conversations/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conv] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, id));

    if (!conv) return res.status(404).json({ error: "Conversation not found" });

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
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete conversation
router.delete("/gemini/conversations/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(messagesTable).where(eq(messagesTable.conversationId, id));
    const deleted = await db
      .delete(conversationsTable)
      .where(eq(conversationsTable.id, id))
      .returning();

    if (!deleted.length) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// List messages
router.get("/gemini/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
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
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Send message — SSE streaming with multimodal support
router.post("/gemini/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
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

    // Build contents for Gemini — parse image data URIs
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
          const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
          if (parsed.text) parts.push({ text: parsed.text });
          if (parsed.imageData) {
            const [meta, b64] = (parsed.imageData as string).split(",");
            const mimeType = meta.replace("data:", "").replace(";base64", "");
            parts.push({ inlineData: { mimeType, data: b64 } });
          }
          return { role: m.role === "assistant" ? "model" : "user", parts };
        }
      } catch {
        // not JSON, treat as plain text
      }
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      };
    });

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        maxOutputTokens: 8192,
        systemInstruction: SYSTEM_PROMPT,
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
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "AI generation failed" })}\n\n`);
    res.end();
  }
});

export default router;
