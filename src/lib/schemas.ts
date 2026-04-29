import { z } from "zod";

export const StepSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: z.string(),
  explanation: z.string(),
  formula: z.string().optional(),
});

export const CanvasSchema = z.object({
  type: z.enum(["problem", "concept"]),
  title: z.string(),
  steps: z.array(StepSchema),
});

export const AccordionSchema = z.object({
  targetStepNumber: z.number().int().positive(),
  label: z.string(),
  content: z.array(StepSchema),
});

export type Step = z.infer<typeof StepSchema>;
export type Canvas = z.infer<typeof CanvasSchema>;
export type Accordion = z.infer<typeof AccordionSchema>;

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
};
