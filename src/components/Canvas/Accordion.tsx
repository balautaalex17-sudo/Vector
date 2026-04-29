import { useState } from "react";
import { ChevronRight, Lightbulb } from "lucide-react";
import type { Step } from "../../lib/schemas";
import { InlineMath, DisplayFormula } from "../Math";

export type AccordionData = {
  label: string;
  content: Step[];
};

export function Accordion({
  label,
  content,
  defaultOpen = true,
}: {
  label: string;
  content: Step[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={"accordion" + (open ? " open" : "")}>
      <button className="accordion-head" onClick={() => setOpen((o) => !o)}>
        <ChevronRight size={16} className="chev" />
        <InlineMath text={label} />
        <span className="count-pill">
          {content.length} {content.length === 1 ? "step" : "steps"}
        </span>
      </button>
      <div className="accordion-body">
        <div className="accordion-substeps">
          {content.map((sub, i) => (
            <div className="substep" key={i}>
              <div className="substep-icon">
                <Lightbulb size={18} />
              </div>
              <div className="substep-body">
                <div className="substep-title">
                  <InlineMath text={sub.title} />
                </div>
                <div className="substep-explain">
                  <InlineMath text={sub.explanation} />
                </div>
                {sub.formula && (
                  <DisplayFormula expr={sub.formula} className="substep-formula" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
