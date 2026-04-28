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
