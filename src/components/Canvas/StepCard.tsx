import { memo } from "react";
import type { Step } from "../../lib/schemas";
import { InlineMath, DisplayFormula } from "../Math";
import { Accordion, type AccordionData } from "./Accordion";

function StepCardImpl({
  step,
  accordions = [],
}: {
  step: Step;
  accordions?: AccordionData[];
}) {
  return (
    <div className="step">
      <div className="step-badge">{step.stepNumber}</div>
      <div className="step-body">
        <div className="step-title">
          <InlineMath text={step.title} />
        </div>
        <div className="step-explain">
          <InlineMath text={step.explanation} />
        </div>
        {step.formula && <DisplayFormula expr={step.formula} />}
        {accordions.length > 0 && (
          <div className="step-accordions">
            {accordions.map((a, i) => (
              <Accordion key={i} label={a.label} content={a.content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const StepCard = memo(StepCardImpl);
