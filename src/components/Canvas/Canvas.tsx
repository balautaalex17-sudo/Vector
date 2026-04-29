import { useEffect, useRef } from "react";
import { ListOrdered, PenTool } from "lucide-react";
import type { Canvas as CanvasType } from "../../lib/schemas";
import { StepCard } from "./StepCard";
import type { AccordionData } from "./Accordion";
import { EmptyState } from "./EmptyState";

export type CanvasProps = {
  canvas: CanvasType | null;
  accordions: Record<number, AccordionData[]>;
  isStreaming: boolean;
  streamingStep: number;
  onPromptPick?: (prompt: string) => void;
};

export function Canvas({
  canvas,
  accordions,
  isStreaming,
  streamingStep,
  onPromptPick,
}: CanvasProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current && (isStreaming || streamingStep > 0)) {
      const el = scrollRef.current;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [streamingStep, isStreaming, canvas]);

  if (!canvas) {
    return (
      <div className="canvas-outer scroll-y" ref={scrollRef}>
        <div className="canvas-card">
          <EmptyState onPromptPick={onPromptPick} />
        </div>
      </div>
    );
  }

  const visibleSteps = canvas.steps.slice(0, streamingStep);

  return (
    <div className="canvas-outer scroll-y" ref={scrollRef}>
      <div className="canvas-card">
        <div className="canvas-header">
          <div className="canvas-title-group">
            <span className="canvas-kicker">
              <span className="dot" />
              {canvas.type === "problem" ? "Derivation" : "Concept walk-through"}
            </span>
            <h1 className="canvas-title">{canvas.title}</h1>
            <div className="canvas-meta">
              <span className="pill">
                <ListOrdered size={10} />
                {canvas.steps.length} steps
              </span>
              <span className="meta-sep" />
              <span>Last edited just now</span>
              <span className="meta-sep" />
              <span>Auto-saved</span>
            </div>
          </div>
          <span className="canvas-badge">
            <PenTool size={10} />
            Live
          </span>
        </div>
        <div className="steps">
          {visibleSteps.map((s) => (
            <StepCard
              key={s.stepNumber}
              step={s}
              accordions={accordions[s.stepNumber] || []}
            />
          ))}
        </div>
        {isStreaming && (
          <div className="streaming-dots">
            <span className="dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </span>
            <span>Generating…</span>
          </div>
        )}
      </div>
    </div>
  );
}
