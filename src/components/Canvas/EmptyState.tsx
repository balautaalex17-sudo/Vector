import { Fragment } from "react";

const STARTERS = [
  { label: "Work–Energy Theorem", prompt: "Derive the Work–Energy Theorem" },
  { label: "Fourier Transform", prompt: "Explain the Fourier Transform" },
  { label: "Quicksort", prompt: "How does Quicksort work?" },
];

export function EmptyState({
  onPromptPick,
}: {
  onPromptPick?: (prompt: string) => void;
}) {
  return (
    <div className="canvas-empty">
      <div className="icon-badge" aria-hidden="true">
        ∂
      </div>
      <h2>New canvas</h2>
      <p>
        Describe a problem or concept in the margin. Vector will build the
        derivation here.
      </p>
      <div className="empty-hints">
        {STARTERS.map((s, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="empty-hint-sep">·</span>}
            <button
              className="empty-hint"
              onClick={() => onPromptPick && onPromptPick(s.prompt)}
            >
              <strong>{s.label}</strong>
            </button>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
