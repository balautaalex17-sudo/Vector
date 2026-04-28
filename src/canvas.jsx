/* Canvas — empty state, step cards, accordions */

function EmptyState({ onPromptPick }) {
  const hints = [
    { icon: "atom", title: "Derive the Work–Energy Theorem", sub: "from Newton's second law" },
    { icon: "waves", title: "Explain the Fourier Transform", sub: "analysis, synthesis, and why it matters" },
    { icon: "binary", title: "How does Quicksort work?", sub: "walkthrough + complexity" },
    { icon: "sigma", title: "Schrödinger equation — concept", sub: "from postulate to eigenvalue form" },
  ];
  return (
    <div className="canvas-empty">
      <div className="icon-badge">
        <window.Icon name="sparkles" size={26} strokeWidth={1.6} />
      </div>
      <span className="eyebrow">
        <window.Icon name="wand-2" size={11} />
        New canvas
      </span>
      <h2>What shall we work through today?</h2>
      <p>Type a problem, concept, or question on the right. Vector will build a clean, step-by-step explanation — right here, live.</p>
      <div className="empty-hints">
        {hints.map((h, i) => (
          <button
            key={i}
            className="empty-hint"
            onClick={() => onPromptPick && onPromptPick(h.title)}
          >
            <span className="hint-icon-wrap"><window.Icon name={h.icon} /></span>
            <div style={{ minWidth: 0 }}>
              <strong>{h.title}</strong>
              <span>{h.sub}</span>
            </div>
            <window.Icon name="arrow-up-right" className="hint-arrow" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Accordion({ label, content, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={"accordion" + (open ? " open" : "")}>
      <button className="accordion-head" onClick={() => setOpen((o) => !o)}>
        <window.Icon name="chevron-right" size={16} className="chev" />
        <window.MathHTML html={window.renderInlineMath(label)} />
        <span className="count-pill">{content.length} {content.length === 1 ? "step" : "steps"}</span>
      </button>
      <div className="accordion-body">
        <div className="accordion-substeps">
          {content.map((sub, i) => (
            <div className="substep" key={i}>
              <div className="substep-icon"><window.Icon name="lightbulb" size={18} /></div>
              <div className="substep-body">
                <div className="substep-title"><window.MathHTML html={window.renderInlineMath(sub.title)} /></div>
                <div className="substep-explain"><window.MathHTML html={window.renderInlineMath(sub.explanation)} /></div>
                {sub.formula && <window.DisplayFormula expr={sub.formula} className="substep-formula" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepCard({ step, accordions = [] }) {
  return (
    <div className="step">
      <div className="step-badge">{step.stepNumber}</div>
      <div className="step-body">
        <div className="step-title"><window.MathHTML html={window.renderInlineMath(step.title)} /></div>
        <div className="step-explain"><window.MathHTML html={window.renderInlineMath(step.explanation)} /></div>
        {step.formula && <window.DisplayFormula expr={step.formula} />}
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

function Canvas({ canvas, accordions, isStreaming, streamingStep, onPromptPick }) {
  const scrollRef = React.useRef(null);

  // Auto-scroll the canvas to bottom when new steps appear or stream updates
  React.useEffect(() => {
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
      <div className={"canvas-card" + (canvas ? "" : " is-empty")}>
        <div className="canvas-header">
          <div className="canvas-title-group">
            <span className="canvas-kicker">
              <span className="dot" />
              {canvas.type === "problem" ? "Derivation" : "Concept walk-through"}
            </span>
            <h1 className="canvas-title">{canvas.title}</h1>
            <div className="canvas-meta">
              <span className="pill"><window.Icon name="list-ordered" />{canvas.steps.length} steps</span>
              <span className="meta-sep" />
              <span>Last edited just now</span>
              <span className="meta-sep" />
              <span>Auto-saved</span>
            </div>
          </div>
          <span className="canvas-badge">
            <window.Icon name="sparkles" />
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
              <span className="dot" /><span className="dot" /><span className="dot" />
            </span>
            <span>Generating…</span>
          </div>
        )}
      </div>
    </div>
  );
}

window.Canvas = Canvas;
