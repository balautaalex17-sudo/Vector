import { useEffect, useRef, useState, useCallback } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import {
  CanvasSchema,
  AccordionSchema,
  type Canvas,
  type ChatMessage,
} from "../lib/schemas";
import type { AccordionData } from "../components/Canvas/Accordion";
import { isMockMode, pickCanvas, pickAccordion } from "../lib/mockLibrary";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function clampTarget(n: number | undefined, stepCount: number): number {
  if (!n || !Number.isFinite(n)) return 1;
  return Math.min(Math.max(1, Math.round(n)), Math.max(1, stepCount));
}

function regexStepFallback(text: string, stepCount: number): number | null {
  const m = /step\s+(\d+)/i.exec(text);
  if (!m) return null;
  return clampTarget(parseInt(m[1], 10), stepCount);
}

// Count steps in a streaming partial that have at least a title.
function countCompletedSteps(steps: unknown): number {
  if (!Array.isArray(steps)) return 0;
  let n = 0;
  for (const s of steps) {
    if (s && typeof s === "object" && typeof (s as { title?: unknown }).title === "string") {
      n += 1;
    }
  }
  return n;
}

export function useVectorChat() {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [accordions, setAccordions] = useState<Record<number, AccordionData[]>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingStep, setStreamingStep] = useState(0);
  const [mockStreaming, setMockStreaming] = useState(false);
  const msgIdRef = useRef(1);
  const lastUserQuestionRef = useRef<string>("");

  const nextId = () => `msg-${msgIdRef.current++}`;
  const pushUser = (content: string, images?: string[]) =>
    setMessages((m) => [...m, { id: nextId(), role: "user", content, images }]);
  const pushAI = (content: string) =>
    setMessages((m) => [...m, { id: nextId(), role: "assistant", content }]);

  const explain = useObject({
    api: "/api/explain",
    schema: CanvasSchema,
  });

  const clarify = useObject({
    api: "/api/clarify",
    schema: AccordionSchema,
  });

  // Drive streamingStep from explain.object as steps arrive.
  useEffect(() => {
    const partial = explain.object as Partial<Canvas> | undefined;
    if (!partial) return;
    if (partial.title || partial.type) {
      setCanvas((prev) => ({
        type: (partial.type as Canvas["type"]) || prev?.type || "concept",
        title: partial.title || prev?.title || "",
        steps: (partial.steps?.filter(
          (s): s is NonNullable<typeof s> =>
            !!s && typeof s.title === "string",
        ) as Canvas["steps"]) || [],
      }));
    }
    setStreamingStep(countCompletedSteps(partial.steps));
  }, [explain.object]);

  // When explain finishes, push the confirmation message.
  const wasExplainLoading = useRef(false);
  useEffect(() => {
    if (wasExplainLoading.current && !explain.isLoading) {
      const obj = explain.object as Partial<Canvas> | undefined;
      if (obj && obj.steps && obj.steps.length) {
        const final = CanvasSchema.safeParse(obj);
        if (final.success) {
          setCanvas(final.data);
          setStreamingStep(final.data.steps.length);
          pushAI(
            `Here's the breakdown — **${final.data.steps.length} steps** loaded onto your canvas.`,
          );
        } else {
          pushAI(
            "Something came back malformed — try rephrasing the question?",
          );
        }
      } else if (explain.error) {
        pushAI("Something broke — try again?");
      }
    }
    wasExplainLoading.current = explain.isLoading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explain.isLoading]);

  // When clarify finishes, attach the accordion under the right step.
  const wasClarifyLoading = useRef(false);
  useEffect(() => {
    if (wasClarifyLoading.current && !clarify.isLoading) {
      const obj = clarify.object;
      if (obj && obj.label && Array.isArray(obj.content) && obj.content.length) {
        const stepCount = canvas?.steps.length ?? 1;
        const fromObject = clampTarget(obj.targetStepNumber as number | undefined, stepCount);
        const fromRegex = regexStepFallback(lastUserQuestionRef.current, stepCount);
        const target = fromRegex ?? fromObject;
        const cleanContent = (obj.content as Array<Record<string, unknown>>)
          .filter(
            (s) =>
              s && typeof s.title === "string" && typeof s.explanation === "string",
          )
          .map((s, i) => ({
            stepNumber: typeof s.stepNumber === "number" ? s.stepNumber : i + 1,
            title: s.title as string,
            explanation: s.explanation as string,
            formula: typeof s.formula === "string" ? s.formula : undefined,
          }));
        if (cleanContent.length === 0) {
          pushAI("Couldn't generate a clarification — try again?");
        } else {
          setAccordions((prev) => {
            const arr = prev[target] ? [...prev[target]] : [];
            arr.push({ label: obj.label as string, content: cleanContent });
            return { ...prev, [target]: arr };
          });
          pushAI(`I've added a breakdown under step ${target}.`);
        }
      } else if (clarify.error) {
        pushAI("Something broke — try again?");
      }
    }
    wasClarifyLoading.current = clarify.isLoading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clarify.isLoading]);

  // Mock mode: simulate streaming locally.
  const simulateFirstCanvas = useCallback(async (text: string) => {
    setMockStreaming(true);
    await wait(500);
    const c = pickCanvas(text);
    setCanvas(c);
    setStreamingStep(1);
    for (let i = 2; i <= c.steps.length; i++) {
      await wait(450 + Math.random() * 250);
      setStreamingStep(i);
    }
    await wait(300);
    setMockStreaming(false);
    pushAI(
      `Here's the breakdown — **${c.steps.length} steps** loaded onto your canvas.`,
    );
  }, []);

  const simulateAccordion = useCallback(
    async (text: string) => {
      setMockStreaming(true);
      await wait(600 + Math.random() * 300);
      const acc = pickAccordion(text, canvas?.steps.length || 1);
      setAccordions((prev) => {
        const arr = prev[acc.targetStepNumber]
          ? [...prev[acc.targetStepNumber]]
          : [];
        arr.push({ label: acc.label, content: acc.content });
        return { ...prev, [acc.targetStepNumber]: arr };
      });
      setMockStreaming(false);
      pushAI(`I've added a breakdown under step ${acc.targetStepNumber}.`);
    },
    [canvas],
  );

  const sendMessage = useCallback(
    async ({ content, images }: { content: string; images?: string[] }) => {
      if (!content && (!images || images.length === 0)) return;
      pushUser(content, images);
      lastUserQuestionRef.current = content;

      if (isMockMode()) {
        if (!canvas) await simulateFirstCanvas(content);
        else await simulateAccordion(content);
        return;
      }

      if (!canvas) {
        // Reset partial canvas tracking for the new stream.
        setStreamingStep(0);
        explain.submit({ userInput: content });
      } else {
        clarify.submit({ userQuestion: content, canvas });
      }
    },
    [canvas, explain, clarify, simulateFirstCanvas, simulateAccordion],
  );

  const resetCanvas = useCallback(() => {
    setCanvas(null);
    setAccordions({});
    setStreamingStep(0);
  }, []);

  const stop = useCallback(() => {
    if (explain.isLoading) explain.stop();
    if (clarify.isLoading) clarify.stop();
  }, [explain, clarify]);

  const isStreaming = explain.isLoading || clarify.isLoading || mockStreaming;

  return {
    canvas,
    accordions,
    messages,
    isStreaming,
    streamingStep,
    sendMessage,
    resetCanvas,
    stop,
  };
}
