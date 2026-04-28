
/* ===== src/icons.jsx ===== */
/* Icon helpers — thin wrappers around Lucide to produce inline SVG strings */

// Render a Lucide icon by name into a <span> via dangerouslySetInnerHTML after mount.
function Icon({ name, size = 16, strokeWidth = 2, className = "", style = {} }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current || !window.lucide) return;
    // Clear and build the svg node fresh each render
    ref.current.innerHTML = "";
    const el = document.createElement("i");
    el.setAttribute("data-lucide", name);
    el.setAttribute("width", String(size));
    el.setAttribute("height", String(size));
    el.setAttribute("stroke-width", String(strokeWidth));
    ref.current.appendChild(el);
    try { window.lucide.createIcons({ attrs: { width: size, height: size, "stroke-width": strokeWidth } }); } catch (e) {}
  }, [name, size, strokeWidth]);
  return <span ref={ref} className={"icon " + className} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, ...style }} aria-hidden="true" />;
}

window.Icon = Icon;


/* ===== src/math.jsx ===== */
/* Math rendering helpers — normalize LaTeX delimiters and render with KaTeX */

function normalizeMathDelimiters(text) {
  if (!text) return text;
  return text
    .replace(/\\\((.*?)\\\)/g, "$$$1$$")
    .replace(/\\\[(.*?)\\\]/gs, "$$$$$1$$$$");
}

function renderMath(expr, displayMode = false) {
  if (!window.katex) return expr;
  try {
    return window.katex.renderToString(expr, { displayMode, throwOnError: false, strict: "ignore" });
  } catch (e) {
    return `<code>${expr}</code>`;
  }
}

// Render inline text with $...$ / $$...$$ math segments, returns html string.
function renderInlineMath(text) {
  if (!text) return "";
  const normalized = normalizeMathDelimiters(text);
  // Protect $$...$$ first
  let out = normalized.replace(/\$\$([^$]+)\$\$/g, (_, m) => renderMath(m, true));
  // Then $...$
  out = out.replace(/\$([^$\n]+)\$/g, (_, m) => renderMath(m, false));
  return out;
}

function MathHTML({ html, className = "" }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function InlineMath({ text, className = "" }) {
  return <MathHTML html={renderInlineMath(text)} className={className} />;
}

function DisplayFormula({ expr, className = "step-formula" }) {
  const html = renderMath(expr, true);
  return <MathHTML html={html} className={className} />;
}

Object.assign(window, { normalizeMathDelimiters, renderMath, renderInlineMath, MathHTML, InlineMath, DisplayFormula });


/* ===== src/scripted.jsx ===== */
/* Scripted "AI" — library of canvases + accordion follow-ups for several STEM prompts */

const SCRIPTED_CANVASES = [
  {
    match: /(work.?energy|kinetic energy theorem|derive.*work)/i,
    canvas: {
      type: "problem",
      title: "Work–Energy Theorem Derivation",
      steps: [
        {
          stepNumber: 1,
          title: "Start from Newton's Second Law.",
          explanation: "For a particle of mass $m$ acted on by a net force $F$, Newton's second law states that $F = m\\,\\frac{dv}{dt}$.",
          formula: "F = m \\frac{dv}{dt}"
        },
        {
          stepNumber: 2,
          title: "Rewrite the time derivative using the chain rule.",
          explanation: "Since $v = \\frac{dx}{dt}$, we apply the chain rule so that $\\frac{dv}{dt} = \\frac{dv}{dx}\\frac{dx}{dt} = v\\frac{dv}{dx}$. This converts our time derivative into a position derivative.",
          formula: "F = m \\, v \\frac{dv}{dx}"
        },
        {
          stepNumber: 3,
          title: "Integrate both sides along the path.",
          explanation: "Integrate from the initial position $x_i$ (where $v = v_i$) to the final position $x_f$ (where $v = v_f$). The left side becomes the work done by the net force.",
          formula: "\\int_{x_i}^{x_f} F \\, dx = \\int_{v_i}^{v_f} m\\,v\\,dv"
        },
        {
          stepNumber: 4,
          title: "Evaluate the right-hand integral.",
          explanation: "The integral $\\int v\\,dv$ is an elementary power rule: $\\int v\\,dv = \\tfrac{1}{2}v^2$. So the RHS reduces to the familiar kinetic energy form.",
          formula: "\\int_{x_i}^{x_f} F \\, dx = \\tfrac{1}{2} m v_f^2 - \\tfrac{1}{2} m v_i^2"
        },
        {
          stepNumber: 5,
          title: "Interpret the result.",
          explanation: "The left side $W = \\int F\\,dx$ is the net work. The right side is the change in kinetic energy $\\Delta K$. We have recovered the Work–Energy Theorem: the net work done on a particle equals its change in kinetic energy.",
          formula: "W_{\\text{net}} = \\Delta K = K_f - K_i"
        }
      ]
    }
  },
  {
    match: /(fourier|transform)/i,
    canvas: {
      type: "concept",
      title: "The Fourier Transform",
      steps: [
        {
          stepNumber: 1,
          title: "The core idea: frequency decomposition.",
          explanation: "Any well-behaved function $f(t)$ on the real line can be written as a continuous superposition of complex exponentials $e^{i\\omega t}$. The Fourier transform tells us how much of each frequency $\\omega$ is present.",
        },
        {
          stepNumber: 2,
          title: "The analysis equation.",
          explanation: "Given $f(t)$, its Fourier transform $\\hat f(\\omega)$ measures the amplitude and phase of the component at angular frequency $\\omega$.",
          formula: "\\hat f(\\omega) = \\int_{-\\infty}^{\\infty} f(t) \\, e^{-i\\omega t} \\, dt"
        },
        {
          stepNumber: 3,
          title: "The synthesis equation.",
          explanation: "Given the spectrum $\\hat f(\\omega)$, we can reconstruct the signal by summing up the contributions of every frequency, weighted by $\\hat f$.",
          formula: "f(t) = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} \\hat f(\\omega) \\, e^{i\\omega t} \\, d\\omega"
        },
        {
          stepNumber: 4,
          title: "Why it matters.",
          explanation: "Differentiation becomes multiplication by $i\\omega$, and convolution becomes pointwise multiplication. That turns hard differential and integral equations into algebra in the frequency domain."
        }
      ]
    }
  },
  {
    match: /(quicksort|sort)/i,
    canvas: {
      type: "concept",
      title: "Quicksort, step by step",
      steps: [
        {
          stepNumber: 1,
          title: "Pick a pivot.",
          explanation: "Choose one element from the array as the pivot. The choice affects performance but not correctness — common picks are the first, last, middle, or a random element."
        },
        {
          stepNumber: 2,
          title: "Partition around the pivot.",
          explanation: "Rearrange the array so that every element smaller than the pivot is on its left and every element greater is on its right. After partitioning, the pivot sits in its final sorted position."
        },
        {
          stepNumber: 3,
          title: "Recurse on the two halves.",
          explanation: "Apply the same procedure to the subarray of smaller elements and to the subarray of larger elements. Each recursive call places one more element permanently."
        },
        {
          stepNumber: 4,
          title: "Base case: arrays of length 0 or 1.",
          explanation: "A single-element or empty array is already sorted, so recursion terminates. The result bubbles up as a fully sorted array."
        },
        {
          stepNumber: 5,
          title: "Complexity.",
          explanation: "Average case $O(n \\log n)$, worst case $O(n^2)$ when the pivot is repeatedly the extreme element. Randomized pivoting keeps the expected time at $O(n \\log n)$."
        }
      ]
    }
  },
  {
    match: /(schr.dinger|wave function|hydrogen atom|quantum)/i,
    canvas: {
      type: "concept",
      title: "The Schrödinger Equation",
      steps: [
        {
          stepNumber: 1,
          title: "State the central postulate.",
          explanation: "A quantum system is described by a wavefunction $\\psi(x, t)$, whose squared magnitude $|\\psi|^2$ gives the probability density of finding the particle at position $x$ at time $t$."
        },
        {
          stepNumber: 2,
          title: "Time-dependent Schrödinger equation.",
          explanation: "The wavefunction evolves according to a linear partial differential equation driven by the Hamiltonian operator $\\hat H$.",
          formula: "i\\hbar \\frac{\\partial \\psi}{\\partial t} = \\hat H \\psi"
        },
        {
          stepNumber: 3,
          title: "Time-independent form.",
          explanation: "For stationary states with definite energy $E$, the wavefunction separates as $\\psi(x,t) = \\phi(x)\\,e^{-iEt/\\hbar}$, and $\\phi$ satisfies an eigenvalue equation.",
          formula: "\\hat H \\phi(x) = E \\phi(x)"
        },
        {
          stepNumber: 4,
          title: "Non-relativistic Hamiltonian.",
          explanation: "For a particle of mass $m$ in a potential $V(x)$, the Hamiltonian is kinetic plus potential energy. Plugging this into step 3 gives the familiar 1D stationary equation.",
          formula: "-\\frac{\\hbar^2}{2m}\\frac{d^2\\phi}{dx^2} + V(x)\\phi = E\\phi"
        }
      ]
    }
  }
];

// Fallback generic canvas for any unmatched input
function fallbackCanvas(userText) {
  const snippet = (userText || "your question").slice(0, 80);
  return {
    type: "concept",
    title: snippet.charAt(0).toUpperCase() + snippet.slice(1),
    steps: [
      {
        stepNumber: 1,
        title: "Frame the problem.",
        explanation: "Restate the question in your own words. Identify the givens, the unknowns, and any implicit assumptions hiding in the prompt."
      },
      {
        stepNumber: 2,
        title: "Surface the core principle.",
        explanation: "Name the underlying law, identity, or definition that connects the givens to the unknowns. Write it down before manipulating anything."
      },
      {
        stepNumber: 3,
        title: "Translate to symbols.",
        explanation: "Assign variables to each quantity. Write the governing relation, e.g. $f(x) = y$, so you can operate on it algebraically rather than verbally."
      },
      {
        stepNumber: 4,
        title: "Solve and check.",
        explanation: "Carry out the derivation. Verify your result by checking units, limits, and whether it matches a known special case.",
        formula: "\\text{result} = f^{-1}(y)"
      }
    ]
  };
}

function pickCanvas(userText) {
  for (const entry of SCRIPTED_CANVASES) {
    if (entry.match.test(userText)) return entry.canvas;
  }
  return fallbackCanvas(userText);
}

/* --- Accordion follow-up library --- */
const SCRIPTED_ACCORDIONS = [
  {
    match: /chain rule/i,
    targetHint: 2,
    label: "Why the chain rule lets us swap $dt$ for $dx$",
    content: [
      {
        stepNumber: 1,
        title: "The chain rule in one variable.",
        explanation: "If $v$ depends on $x$ and $x$ depends on $t$, then $\\frac{dv}{dt} = \\frac{dv}{dx}\\cdot\\frac{dx}{dt}$. This is just the usual chain rule applied to a composition."
      },
      {
        stepNumber: 2,
        title: "Recognize $\\frac{dx}{dt} = v$.",
        explanation: "By definition the velocity is the time derivative of position, so the second factor collapses to $v$ itself.",
        formula: "\\frac{dv}{dt} = v \\, \\frac{dv}{dx}"
      },
      {
        stepNumber: 3,
        title: "Why this is useful.",
        explanation: "Multiplying by $m$ gives $F = m v \\frac{dv}{dx}$, which separates cleanly when we multiply both sides by $dx$ — the trick that lets us integrate along the path instead of along time."
      }
    ]
  },
  {
    match: /(integral|integrate|∫|anti.?derivative)/i,
    targetHint: 3,
    label: "Unpacking the path integral",
    content: [
      {
        stepNumber: 1,
        title: "What the left integral means physically.",
        explanation: "$\\int_{x_i}^{x_f} F\\,dx$ sums up force times an infinitesimal displacement along the path — exactly the definition of work done on the particle."
      },
      {
        stepNumber: 2,
        title: "Why the right integral's limits change.",
        explanation: "When we change variables from $x$ to $v$, the limits shift from positions $(x_i, x_f)$ to the corresponding velocities $(v_i, v_f)$ at those positions."
      },
      {
        stepNumber: 3,
        title: "Evaluating $\\int m v \\, dv$.",
        explanation: "Treat $m$ as a constant and use the power rule. The antiderivative of $v$ is $\\tfrac{1}{2}v^2$.",
        formula: "\\int_{v_i}^{v_f} m v \\, dv = \\tfrac{1}{2} m v_f^2 - \\tfrac{1}{2} m v_i^2"
      }
    ]
  },
  {
    match: /(intuition|why|explain more|more detail)/i,
    targetHint: 1,
    label: "Intuition and worked numbers",
    content: [
      {
        stepNumber: 1,
        title: "A concrete analogy.",
        explanation: "Think of pushing a stalled car. The work you do — force times distance — is exactly the kinetic energy the car gains. If the car already had some speed, you only add the difference."
      },
      {
        stepNumber: 2,
        title: "A quick numerical check.",
        explanation: "A $1000\\,\\text{kg}$ car accelerating from $0$ to $10\\,\\text{m/s}$ gains $\\Delta K = \\tfrac{1}{2}(1000)(10)^2 = 50{,}000\\,\\text{J}$. That's also the net work needed — regardless of how long or short the path was."
      }
    ]
  },
  {
    match: /(example|show an example|worked)/i,
    targetHint: 2,
    label: "A short worked example",
    content: [
      {
        stepNumber: 1,
        title: "Setup.",
        explanation: "Take a constant force $F = 20\\,\\text{N}$ acting on a $2\\,\\text{kg}$ block over $5\\,\\text{m}$, starting at rest."
      },
      {
        stepNumber: 2,
        title: "Work done.",
        explanation: "$W = F \\cdot d = 20 \\cdot 5 = 100\\,\\text{J}$. By the theorem, $\\Delta K = 100\\,\\text{J}$, so $\\tfrac{1}{2}(2)v_f^2 = 100$.",
          formula: "v_f = \\sqrt{100} = 10 \\text{ m/s}"
      },
      {
        stepNumber: 3,
        title: "Consistency check.",
        explanation: "Using kinematics: $a = F/m = 10\\,\\text{m/s}^2$, and $v_f^2 = 2 a d = 2(10)(5) = 100$. Same answer — the theorem agrees with Newton's equations, as it should."
      }
    ]
  }
];

function fallbackAccordion(userText, stepCount) {
  // Try to find a target step number like "step 3"
  const m = /step\s+(\d+)/i.exec(userText);
  const target = m ? Math.min(parseInt(m[1], 10), Math.max(1, stepCount)) : 1;
  return {
    targetStepNumber: target,
    label: `More on step ${target}`,
    content: [
      {
        stepNumber: 1,
        title: "Zoom in.",
        explanation: "Let's unpack the reasoning behind this step in smaller pieces so the move from the previous line is fully justified."
      },
      {
        stepNumber: 2,
        title: "Why it holds.",
        explanation: "The key manipulation uses standard rules — algebra, a derivative identity, or a definition — applied to the quantities already on the canvas."
      },
      {
        stepNumber: 3,
        title: "Takeaway.",
        explanation: "After this move, the next step follows by evaluating the resulting expression and simplifying."
      }
    ]
  };
}

function pickAccordion(userText, stepCount) {
  for (const entry of SCRIPTED_ACCORDIONS) {
    if (entry.match.test(userText)) {
      // clamp target to available steps
      const target = Math.min(Math.max(1, entry.targetHint), Math.max(1, stepCount));
      return { targetStepNumber: target, label: entry.label, content: entry.content };
    }
  }
  return fallbackAccordion(userText, stepCount);
}

Object.assign(window, { pickCanvas, pickAccordion });


/* ===== src/sidebar.jsx ===== */
/* Sidebar — notebook tree with expand/collapse */

function TreeRow({ icon, label, active, hasChildren, open, depth = 0, onClick, subtitle }) {
  return (
    <div
      className={"tree-row" + (active ? " active" : "") + (open ? " open" : "")}
      onClick={onClick}
      style={{ marginLeft: depth * 2 }}
    >
      {hasChildren ? (
        <window.Icon name={open ? "chevron-down" : "chevron-right"} size={14} className="chev" />
      ) : (
        <span style={{ width: 14, height: 14, flexShrink: 0 }} />
      )}
      <window.Icon name={icon} size={15} className="icon-leaf" />
      <span className="tree-label">{label}</span>
      {subtitle && <span className="sr-only">{subtitle}</span>}
    </div>
  );
}

function SidebarPlaceholder({ onHomeClick, activeDoc }) {
  const [open, setOpen] = React.useState({
    notebooks: true,
    physics: true,
    classical: true,
    quantum: false,
    thermo: false,
    math: false,
    cs: false,
  });
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const leaf = (key, icon, label, isActive) => (
    <div key={key}>
      <div
        className={"tree-row" + (isActive ? " active" : "")}
        onClick={() => isActive && onHomeClick && onHomeClick()}
      >
        <span style={{ width: 14, height: 14, flexShrink: 0 }} />
        <window.Icon name={icon} size={15} className="icon-leaf" />
        <span className="tree-label">{label}</span>
      </div>
      {isActive && (
        <div className="tree-active-sub">
          <window.Icon name="settings-2" size={12} />
          <span>Problem Canvas</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="chat" style={{ background: "var(--bg-card)" }}>
      <div className="sidebar-logo">
        <span className="icon-wrap" aria-hidden="true" style={{ width: 28, height: 28 }}>
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(7, 3.5)">
              <path d="M 2 8 C 4 8 5 11 6 15 L 9 24 L 14 8 C 15 6 15 6 18 6 L 18 7 C 17 7 16 8 15 10 L 10 24.5 L 8 24.5 L 3 10 C 2.5 8 1.5 8 0 8 Z" fill="var(--accent-ink)"/>
              <path d="M 4 2 L 16 2" stroke="var(--accent-ink)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M 12 -1 L 16 2 L 12 5" fill="none" stroke="var(--accent-ink)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </svg>
        </span>
        <span className="wordmark">Vector</span>
      </div>

      <div className="sidebar-search">
        <window.Icon name="search" size={16} className="search-icon" />
        <input disabled placeholder="Search notebooks…" />
      </div>

      <div className="sidebar-tree scroll-y">
        <TreeRow
          icon="folder"
          label="Notebooks"
          hasChildren
          open={open.notebooks}
          onClick={() => toggle("notebooks")}
        />
        {open.notebooks && (
          <div className="tree-children" style={{ maxHeight: 4000 }}>
            <TreeRow
              icon="folder"
              label="Physics (Classical Mechanics)"
              hasChildren
              open={open.classical}
              onClick={() => toggle("classical")}
            />
            {open.classical && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("we", "file-text", activeDoc || "Work–Energy Theorem Derivation", true)}
                {leaf("newton", "file-text", "Newton's Laws — Notes", false)}
                {leaf("pendulum", "file-text", "Simple Pendulum", false)}
                {leaf("lagrange", "file-text", "Lagrangian Mechanics", false)}
              </div>
            )}

            <TreeRow
              icon="folder"
              label="Quantum Mechanics"
              hasChildren
              open={open.quantum}
              onClick={() => toggle("quantum")}
            />
            {open.quantum && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("sch", "file-text", "Schrödinger Equation", false)}
                {leaf("hydro", "file-text", "Hydrogen Atom", false)}
                {leaf("spin", "file-text", "Spin ½ Systems", false)}
              </div>
            )}

            <TreeRow
              icon="folder"
              label="Thermodynamics"
              hasChildren
              open={open.thermo}
              onClick={() => toggle("thermo")}
            />
            {open.thermo && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("ent", "file-text", "Entropy — first look", false)}
                {leaf("carnot", "file-text", "Carnot Cycle", false)}
              </div>
            )}

            <TreeRow
              icon="folder"
              label="Math"
              hasChildren
              open={open.math}
              onClick={() => toggle("math")}
            />
            {open.math && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("fourier", "file-text", "Fourier Transform", false)}
                {leaf("linalg", "file-text", "Linear Algebra recap", false)}
              </div>
            )}

            <TreeRow
              icon="folder"
              label="Computer Science"
              hasChildren
              open={open.cs}
              onClick={() => toggle("cs")}
            />
            {open.cs && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("qs", "file-text", "Quicksort", false)}
                {leaf("graphs", "file-text", "Graph Algorithms", false)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="avatar">U</div>
        <div className="sign-label">Sign in / Sign up</div>
        <window.Icon name="settings" size={18} className="gear" />
      </div>
    </div>
  );
}

window.SidebarPlaceholder = SidebarPlaceholder;


/* ===== src/canvas.jsx ===== */
/* Canvas — empty state, step cards, accordions */

function EmptyState({ onPromptPick }) {
  const starters = [
    { label: "Work–Energy Theorem", prompt: "Derive the Work–Energy Theorem" },
    { label: "Fourier Transform", prompt: "Explain the Fourier Transform" },
    { label: "Quicksort", prompt: "How does Quicksort work?" },
  ];
  return (
    <div className="canvas-empty">
      <div className="icon-badge" aria-hidden="true">∂</div>
      <h2>New canvas</h2>
      <p>Describe a problem or concept in the margin. Vector will build the derivation here.</p>
      <div className="empty-hints">
        {starters.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="empty-hint-sep">·</span>}
            <button
              className="empty-hint"
              onClick={() => onPromptPick && onPromptPick(s.prompt)}
            >
              <strong>{s.label}</strong>
            </button>
          </React.Fragment>
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
            <window.Icon name="pen-tool" size={10} />
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


/* ===== src/chat.jsx ===== */
/* Chat panel — message thread + input with image drag-drop / paste / file pick */

function ChatHeader({ isStreaming }) {
  return (
    <div className="chat-header">
      <div className="chat-header-main">
        <span className="chat-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <path d="M6 6 L11 17 L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 6 L17.5 8.5 M16 6 L13 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
        </span>
        <div>
          <h3>Co-Pilot</h3>
          <span className="chat-sub">
            {isStreaming ? "working…" : "⌘K to ask"}
          </span>
        </div>
      </div>
      <button className="chat-header-btn" title="Chat settings">
        <window.Icon name="more-horizontal" size={14} />
      </button>
    </div>
  );
}

function Message({ msg, outlinedUser }) {
  const isUser = msg.role === "user";
  return (
    <div className={"msg-row " + (isUser ? "user" : "ai")}>
      <div className={"bubble " + (isUser ? "user" : "ai") + (isUser && outlinedUser ? " outlined" : "") + (isUser ? " user-bubble" : "")}>
        {msg.images && msg.images.length > 0 && (
          <div className="imgs">
            {msg.images.map((src, i) => <img key={i} src={src} alt="attached" />)}
          </div>
        )}
        {isUser ? <span>{msg.content}</span> : <window.MathHTML html={window.renderInlineMath(msg.content)} />}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="msg-row ai">
      <div className="typing-bubble">
        <span className="dot" /><span className="dot" /><span className="dot" />
      </div>
    </div>
  );
}

function ChatInput({ disabled, onSend, seedText, onSeedUsed }) {
  const [text, setText] = React.useState("");
  const [images, setImages] = React.useState([]); // array of data URLs
  const [dragging, setDragging] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const taRef = React.useRef(null);
  const fileRef = React.useRef(null);

  React.useEffect(() => {
    if (seedText) {
      setText(seedText);
      onSeedUsed && onSeedUsed();
      setTimeout(() => taRef.current && taRef.current.focus(), 10);
    }
  }, [seedText]);

  const autoSize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  React.useEffect(autoSize, [text]);

  const addImageFiles = (files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    arr.forEach((f) => {
      const r = new FileReader();
      r.onload = (e) => setImages((prev) => [...prev, e.target.result]);
      r.readAsDataURL(f);
    });
  };

  const handleSend = () => {
    if (disabled) return;
    if (!text.trim() && images.length === 0) return;
    onSend({ content: text.trim(), images });
    setText("");
    setImages([]);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onPaste = (e) => {
    const items = e.clipboardData?.items || [];
    let had = false;
    for (const it of items) {
      if (it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) { addImageFiles([f]); had = true; }
      }
    }
    if (had) e.preventDefault();
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer?.files?.length) addImageFiles(e.dataTransfer.files);
  };

  const canSend = !disabled && (text.trim().length > 0 || images.length > 0);

  return (
    <div className="chat-input-wrap">
      <div
        className={
          "chat-input-box" +
          (dragging ? " dragging" : "") +
          (focused ? " focused" : "") +
          (disabled ? " disabled" : "")
        }
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{ position: "relative" }}
      >
        {images.length > 0 && (
          <div className="input-thumbs">
            {images.map((src, i) => (
              <div className="input-thumb" key={i}>
                <img src={src} alt="" />
                <button
                  className="thumb-x"
                  onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                  aria-label="Remove image"
                >
                  <window.Icon name="x" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <textarea
          ref={taRef}
          className="no-scrollbar"
          rows={1}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          onPaste={onPaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={dragging ? "Drop image here…" : (disabled ? "Generating…" : "Ask anything…")}
        />
        <div className="input-toolbar">
          <div className="tool-group">
            <button
              className="tool-btn"
              onClick={() => fileRef.current && fileRef.current.click()}
              aria-label="Attach image"
              disabled={disabled}
            >
              <window.Icon name="image-plus" size={17} />
            </button>
            <button className="tool-btn" aria-label="Mention a step" disabled={disabled}>
              <window.Icon name="at-sign" size={17} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => { addImageFiles(e.target.files); e.target.value = ""; }}
            />
          </div>
          <button
            className="send-btn"
            disabled={!canSend}
            onClick={handleSend}
            aria-label="Send"
          >
            <window.Icon name="arrow-up" size={16} />
          </button>
        </div>
        {dragging && (
          <div className="drag-hint">
            <window.Icon name="image-down" size={18} /> Drop image to attach
          </div>
        )}
      </div>
    </div>
  );
}

function ChatPanel({ messages, isStreaming, onSend, seedText, onSeedUsed, outlinedUser }) {
  const threadRef = React.useRef(null);

  React.useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length, isStreaming]);

  return (
    <div className="chat">
      <ChatHeader isStreaming={isStreaming} />
      <div className="chat-thread scroll-y" ref={threadRef}>
        {messages.length === 0 && (
          <div className="chat-intro">
            Start by describing a problem or concept.<br />
            Press <span className="kbd">Enter</span> to send, <span className="kbd">Shift</span>+<span className="kbd">Enter</span> for newline.
          </div>
        )}
        {messages.map((m) => <Message key={m.id} msg={m} outlinedUser={outlinedUser} />)}
        {isStreaming && <TypingBubble />}
      </div>
      <ChatInput
        disabled={isStreaming}
        onSend={onSend}
        seedText={seedText}
        onSeedUsed={onSeedUsed}
      />
    </div>
  );
}

window.ChatPanel = ChatPanel;


/* ===== src/layout.jsx ===== */
/* Layout — three-column resizable shell */

function useResizable(initialSidebar = 18, initialChat = 26) {
  const [sidebarPct, setSidebarPct] = React.useState(initialSidebar);
  const [chatPct, setChatPct] = React.useState(initialChat);
  const containerRef = React.useRef(null);
  const draggingRef = React.useRef(null);

  const onMouseDown = (which) => (e) => {
    e.preventDefault();
    draggingRef.current = which;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  React.useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const total = rect.width;
      if (draggingRef.current === "left") {
        const pct = Math.max(12, Math.min(34, (x / total) * 100));
        setSidebarPct(pct);
      } else if (draggingRef.current === "right") {
        const rightX = rect.right - e.clientX;
        const pct = Math.max(18, Math.min(40, (rightX / total) * 100));
        setChatPct(pct);
      }
    };
    const onUp = () => {
      draggingRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return { containerRef, sidebarPct, chatPct, onMouseDown, dragging: () => draggingRef.current };
}

function AppLayout({ sidebar, children, chat, focusMode, densityCompact, themeDark, accent }) {
  const { containerRef, sidebarPct, chatPct, onMouseDown } = useResizable();
  const [dragging, setDragging] = React.useState(null);
  React.useEffect(() => {
    const onUp = () => setDragging(null);
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);

  const appCls = [
    "app",
    focusMode ? "focus-mode" : "",
    densityCompact ? "density-compact" : "",
    themeDark ? "theme-dark" : "",
    accent && accent !== "default" ? `accent-${accent}` : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={appCls} ref={containerRef}>
      <div className="panel left" style={{ width: focusMode ? 0 : `${sidebarPct}%` }}>
        {sidebar}
      </div>
      <div
        className={"resizer left-resizer" + (dragging === "left" ? " dragging" : "")}
        onMouseDown={(e) => { onMouseDown("left")(e); setDragging("left"); }}
      >
        <div className="handle-pill">
          <span className="handle-dot" /><span className="handle-dot" /><span className="handle-dot" />
        </div>
      </div>
      <div className="panel center" style={{ flex: 1 }}>
        <div className="center-wrap">{children}</div>
      </div>
      <div
        className={"resizer right-resizer" + (dragging === "right" ? " dragging" : "")}
        onMouseDown={(e) => { onMouseDown("right")(e); setDragging("right"); }}
      >
        <div className="handle-pill">
          <span className="handle-dot" /><span className="handle-dot" /><span className="handle-dot" />
        </div>
      </div>
      <div className="panel right" style={{ width: `${chatPct}%` }}>
        {chat}
      </div>
    </div>
  );
}

window.AppLayout = AppLayout;


/* ===== src/tweaks.jsx ===== */
/* Tweaks panel — toggled by host edit-mode messaging */

function TweaksPanel({ tweaks, setTweaks, onClose }) {
  const set = (k, v) => setTweaks((t) => ({ ...t, [k]: v }));

  const accents = [
    { id: "default", label: "Blue",   color: "#D0E2FF" },
    { id: "violet",  label: "Violet", color: "#E4DBFF" },
    { id: "sage",    label: "Sage",   color: "#D9EEDA" },
    { id: "warm",    label: "Warm",   color: "#FFE1CD" },
  ];

  return (
    <div className="tweaks-panel">
      <h4>Accent</h4>
      <div className="tweak-grid">
        {accents.map((a) => (
          <button
            key={a.id}
            className={"tweak-chip" + (tweaks.accent === a.id ? " active" : "")}
            onClick={() => set("accent", a.id)}
          >
            <span className="swatch" style={{ background: a.color }} />
            {a.label}
          </button>
        ))}
      </div>

      <h4>Theme</h4>
      <div className="tweak-grid">
        <button
          className={"tweak-chip" + (!tweaks.dark ? " active" : "")}
          onClick={() => set("dark", false)}
        >
          Light
        </button>
        <button
          className={"tweak-chip" + (tweaks.dark ? " active" : "")}
          onClick={() => set("dark", true)}
        >
          Dark
        </button>
      </div>

      <h4>Layout</h4>
      <div className={"tweak-switch" + (tweaks.compact ? " on" : "")} onClick={() => set("compact", !tweaks.compact)}>
        <span>Compact canvas</span>
        <span className="track" />
      </div>
      <div className={"tweak-switch" + (tweaks.focus ? " on" : "")} onClick={() => set("focus", !tweaks.focus)}>
        <span>Focus mode (hide sidebar)</span>
        <span className="track" />
      </div>
      <div className={"tweak-switch" + (tweaks.outlinedUser ? " on" : "")} onClick={() => set("outlinedUser", !tweaks.outlinedUser)}>
        <span>Outlined user bubble</span>
        <span className="track" />
      </div>
    </div>
  );
}

// Host edit-mode bridge
function useEditModeBridge() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setVisible(true);
      if (d.type === "__deactivate_edit_mode") setVisible(false);
    };
    window.addEventListener("message", onMsg);
    try {
      window.parent && window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    } catch (e) {}
    return () => window.removeEventListener("message", onMsg);
  }, []);
  return [visible, setVisible];
}

window.TweaksPanel = TweaksPanel;
window.useEditModeBridge = useEditModeBridge;


/* ===== src/app.jsx ===== */
/* Main app — state machine + composition */

const { useState, useEffect, useRef, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "default",
  "dark": false,
  "compact": false,
  "focus": false,
  "outlinedUser": false
}/*EDITMODE-END*/;

function useVectorChat() {
  const [canvas, setCanvas] = useState(null);
  const [accordions, setAccordions] = useState({}); // stepNumber -> Accordion[]
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStep, setStreamingStep] = useState(0);
  const msgIdRef = useRef(1);

  const nextId = () => `msg-${msgIdRef.current++}`;

  const pushUser = (content, images) => {
    setMessages((m) => [...m, { id: nextId(), role: "user", content, images }]);
  };
  const pushAI = (content) => {
    setMessages((m) => [...m, { id: nextId(), role: "assistant", content }]);
  };

  // Simulated LLM: delay + canvas/accordion population
  const simulateFirstCanvas = async (text) => {
    setIsStreaming(true);
    await wait(650);
    const c = window.pickCanvas(text);
    setCanvas(c);
    // Reveal steps one by one for the streaming effect
    setStreamingStep(1);
    for (let i = 2; i <= c.steps.length; i++) {
      await wait(550 + Math.random() * 250);
      setStreamingStep(i);
    }
    await wait(350);
    setIsStreaming(false);
    pushAI(`Here's the breakdown — **${c.steps.length} steps** loaded onto your canvas.`);
  };

  const simulateAccordion = async (text) => {
    setIsStreaming(true);
    await wait(700 + Math.random() * 400);
    const acc = window.pickAccordion(text, canvas?.steps?.length || 1);
    setAccordions((prev) => {
      const arr = prev[acc.targetStepNumber] ? [...prev[acc.targetStepNumber]] : [];
      arr.push({ label: acc.label, content: acc.content });
      return { ...prev, [acc.targetStepNumber]: arr };
    });
    setIsStreaming(false);
    pushAI(`I've added a breakdown under step ${acc.targetStepNumber}.`);
  };

  const sendMessage = async ({ content, images }) => {
    if (!content && (!images || images.length === 0)) return;
    pushUser(content, images);
    if (!canvas) await simulateFirstCanvas(content);
    else await simulateAccordion(content);
  };

  const resetCanvas = () => {
    setCanvas(null);
    setAccordions({});
    setStreamingStep(0);
  };

  return { canvas, accordions, messages, isStreaming, streamingStep, sendMessage, resetCanvas };
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

function SegmentedToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle">
      <div className="segment">
        <button
          className={"seg-btn" + (mode === "derivation" ? " active" : "")}
          onClick={() => onChange("derivation")}
        >
          <window.Icon name="file-text" size={15} />
          Derivation Mode
        </button>
        <button
          className={"seg-btn" + (mode === "practice" ? " active" : "")}
          onClick={() => onChange("practice")}
          title="Practice mode — coming soon"
        >
          <window.Icon name="target" size={15} />
          Practice Mode
        </button>
      </div>
    </div>
  );
}

function PracticePlaceholder() {
  return (
    <div className="canvas-outer scroll-y">
      <div className="canvas-card">
        <div className="canvas-empty">
          <div className="icon-badge"><window.Icon name="target" size={24} strokeWidth={1.6} /></div>
          <h2>Practice Mode is coming</h2>
          <p>Solve guided problems with live hints. Ping your canvas-mate when you get stuck.</p>
        </div>
      </div>
    </div>
  );
}

function TopBar({ canvas, onReset, onTweaks }) {
  return (
    <div className="center-topbar">
      <div className="breadcrumb">
        <span className="crumb" onClick={onReset}>
          <window.Icon name="folder" size={13} />
          Physics 201
        </span>
        <span className="sep">/</span>
        <span className="crumb current">
          <window.Icon name="file-text" size={13} />
          {canvas ? canvas.title : "Untitled canvas"}
        </span>
      </div>
      <div className="topbar-actions">
        <button className="topbar-btn" title="Undo"><window.Icon name="undo-2" /></button>
        <button className="topbar-btn" title="History"><window.Icon name="history" /></button>
        <button className="topbar-btn" title="Export"><window.Icon name="download" /></button>
        <button className="topbar-btn" onClick={onTweaks} title="Tweaks"><window.Icon name="sliders-horizontal" /></button>
        <button className="topbar-share"><window.Icon name="share-2" />Share</button>
      </div>
    </div>
  );
}

function App() {
  const v = useVectorChat();
  const [seedText, setSeedText] = useState("");
  const [tweaksVisible, setTweaksVisible] = window.useEditModeBridge();
  const [tweaks, setTweaks] = useState(() => {
    try { return JSON.parse(JSON.stringify(TWEAK_DEFAULTS)); } catch (e) { return TWEAK_DEFAULTS; }
  });

  // Persist tweaks
  useEffect(() => {
    try {
      window.parent && window.parent.postMessage({ type: "__edit_mode_set_keys", edits: tweaks }, "*");
    } catch (e) {}
  }, [tweaks]);

  const onPromptPick = (t) => setSeedText(t);

  return (
    <window.AppLayout
      focusMode={tweaks.focus}
      densityCompact={tweaks.compact}
      themeDark={tweaks.dark}
      accent={tweaks.accent}
      sidebar={<window.SidebarPlaceholder onHomeClick={v.resetCanvas} activeDoc={v.canvas?.title} />}
      chat={
        <window.ChatPanel
          messages={v.messages}
          isStreaming={v.isStreaming}
          onSend={v.sendMessage}
          seedText={seedText}
          onSeedUsed={() => setSeedText("")}
          outlinedUser={tweaks.outlinedUser}
        />
      }
    >
      <TopBar canvas={v.canvas} onReset={v.resetCanvas} onTweaks={() => setTweaksVisible((x) => !x)} />
      <window.Canvas
        canvas={v.canvas}
        accordions={v.accordions}
        isStreaming={v.isStreaming}
        streamingStep={v.streamingStep}
        onPromptPick={onPromptPick}
      />

      {tweaksVisible && (
        <window.TweaksPanel
          tweaks={tweaks}
          setTweaks={setTweaks}
          onClose={() => setTweaksVisible(false)}
        />
      )}
    </window.AppLayout>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

