import "dotenv/config";
import express from "express";
import cors from "cors";
import { anthropic } from "@ai-sdk/anthropic";
import { streamObject } from "ai";
import { CanvasSchema, AccordionSchema } from "../src/lib/schemas";
import {
  EXPLAIN_SYSTEM_PROMPT,
  ACCORDION_SYSTEM_PROMPT,
} from "../src/lib/prompts";

const PORT = Number(process.env.PORT) || 3001;
const MODEL_ID = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    "[vector] ANTHROPIC_API_KEY is not set — /api routes will fail until you add it to .env",
  );
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: MODEL_ID });
});

app.post("/api/explain", async (req, res) => {
  const userInput = String(req.body?.userInput || "").slice(0, 4000);
  if (!userInput.trim()) {
    res.status(400).json({ error: "userInput is required" });
    return;
  }

  try {
    const result = streamObject({
      model: anthropic(MODEL_ID),
      schema: CanvasSchema,
      system: EXPLAIN_SYSTEM_PROMPT,
      prompt: userInput,
    });
    result.pipeTextStreamToResponse(res);
  } catch (err) {
    console.error("[vector] /api/explain error", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "stream failed" });
    } else {
      res.end();
    }
  }
});

app.post("/api/clarify", async (req, res) => {
  const userQuestion = String(req.body?.userQuestion || "").slice(0, 4000);
  const canvas = req.body?.canvas;
  if (!userQuestion.trim() || !canvas) {
    res
      .status(400)
      .json({ error: "userQuestion and canvas are required" });
    return;
  }

  const stepSummary = Array.isArray(canvas.steps)
    ? canvas.steps
        .map(
          (s: { stepNumber: number; title: string; explanation: string }) =>
            `Step ${s.stepNumber}: ${s.title}\n${s.explanation}`,
        )
        .join("\n\n")
    : "";

  const composedPrompt = [
    `Existing canvas titled "${canvas.title}" with steps:`,
    stepSummary,
    "",
    `User follow-up question: ${userQuestion}`,
    "",
    `Pick the targetStepNumber from the existing step numbers (1..${canvas.steps?.length ?? 1}).`,
  ].join("\n");

  try {
    const result = streamObject({
      model: anthropic(MODEL_ID),
      schema: AccordionSchema,
      system: ACCORDION_SYSTEM_PROMPT,
      prompt: composedPrompt,
    });
    result.pipeTextStreamToResponse(res);
  } catch (err) {
    console.error("[vector] /api/clarify error", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "stream failed" });
    } else {
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`[vector] api listening on http://localhost:${PORT}`);
});
