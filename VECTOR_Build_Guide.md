# VECTOR — Build Guide (V1.0)

**Purpose:** Everything you need to vibe code VECTOR V1 from zero to a working prototype in Google Antigravity using Claude.
**Estimated time:** 1–2 weeks of focused work.
**Read this alongside:** `VECTOR_Product_Spec.md`

---

## 1. Mental Model (Read This First)

Before you open Antigravity, internalize these four ideas. Everything else is details.

**1. The hard part is the prompt, not the code.** Getting Claude to reliably output structured JSON that matches your schema — with clean LaTeX math, well-scoped steps, and correct accordion targeting — is 70% of the work. The React code itself is standard. Do not get fancy with architecture. Spend your time on prompt iteration.

**2. You are building a streaming pipeline, not a request-response app.** When the user sends a message, Claude streams JSON tokens back. Each time a new step card is parsed from the stream, it renders immediately on the canvas. The user should see steps appear one by one, not all at once after a 10-second wait. This is what makes VECTOR feel alive.

**3. Everything lives in React state. No backend, no database, no persistence.** If the user refreshes, their canvas is gone. That is acceptable for V1. Do not waste time on Postgres, Redis, or auth — you will throw away anything you build there when you rearchitect for V2.

**4. The chat does one thing: turn inputs into canvas content.** It is not a general assistant. The AI's chat responses should be short confirmations. The real work happens on the canvas.

---

## 2. The Stack (Final — Do Not Add To It)

| Layer | Tool | Why |
|---|---|---|
| **IDE** | Google Antigravity (free, supports Claude) | Agentic IDE with Claude Sonnet 4.5/4.6 built in, plus Chrome automation for visual feedback loops |
| **Framework** | React 19 + TypeScript + Vite | Fastest scaffold, best HMR, standard choice |
| **Styling** | Tailwind CSS v4 | Utility-first, pairs perfectly with AI code gen |
| **Components** | shadcn/ui | Accordion, Card, ScrollArea, Input primitives — production ready |
| **LLM Model** | Claude Sonnet 4.5 or 4.6 (via Anthropic API) | Best instruction following for structured JSON output |
| **Streaming SDK** | Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`) | `streamObject()` + `useObject()` handle streaming structured JSON into React — the core pattern for VECTOR |
| **Schema Validation** | Zod | Defines the Canvas JSON shape, validates Claude's output |
| **Markdown Rendering** | Streamdown + `@streamdown/math` | Purpose-built for streaming markdown with math; repairs incomplete syntax mid-stream |
| **Math Rendering** | KaTeX (via `@streamdown/math`) | Industry standard, fast, no server required |

**What is deliberately not in the stack:** no backend framework, no database, no auth, no LangChain/LangGraph, no RAG, no MCP servers beyond what Antigravity provides natively, no state management library (React's `useState` is enough), no testing framework (you test by using the app yourself), no CI/CD. Add these when you have users, not before.

---

## 3. Project Structure

```
vector-v1/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── Canvas.tsx          # The full canvas container
│   │   │   ├── StepCard.tsx        # One numbered step with math
│   │   │   └── Accordion.tsx       # Expandable clarification block
│   │   ├── Chat/
│   │   │   ├── ChatPanel.tsx       # The full chat container
│   │   │   ├── MessageThread.tsx   # Scrollable message list
│   │   │   ├── Message.tsx         # One chat bubble
│   │   │   └── ChatInput.tsx       # Input box + send button
│   │   ├── Sidebar/
│   │   │   └── SidebarPlaceholder.tsx  # Static dummy notebook tree (V1 visual only)
│   │   └── Layout/
│   │       └── AppLayout.tsx       # Three-column shell
│   ├── lib/
│   │   ├── schemas.ts              # Zod schemas for Canvas and Accordion
│   │   ├── prompts.ts              # System prompts for Claude
│   │   └── normalizeMath.ts        # LaTeX delimiter cleanup helper
│   ├── hooks/
│   │   └── useVectorChat.ts        # Core streaming + state logic
│   ├── types/
│   │   └── index.ts                # TypeScript types derived from Zod
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                   # Tailwind + KaTeX CSS imports
├── .env                            # VITE_ANTHROPIC_API_KEY
├── vite.config.ts                  # API proxy config
├── CLAUDE.md                       # Context file for Antigravity agent
└── package.json
```

This structure is small enough to hold in your head. Do not add more folders until you have a reason.

---

## 4. The Data Contract (Build This First)

Before touching any UI, define the shape of what Claude will return. This is the single most important file in the project — every component reads from it.

**`src/lib/schemas.ts`**

```typescript
import { z } from "zod";

// A single step on the canvas
export const StepSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: z.string(),
  explanation: z.string(), // Markdown with inline LaTeX: "Using $F = ma$..."
  formula: z.string().optional(), // Display-mode LaTeX: "W = \int F \cdot dx"
});

// A full canvas (problem or concept)
export const CanvasSchema = z.object({
  type: z.enum(["problem", "concept"]),
  title: z.string(),
  steps: z.array(StepSchema),
});

// A follow-up clarification injected as an accordion
export const AccordionSchema = z.object({
  targetStepNumber: z.number().int().positive(),
  label: z.string(), // Collapsed state label
  content: z.array(StepSchema), // Sub-steps for the expansion
});

export type Step = z.infer<typeof StepSchema>;
export type Canvas = z.infer<typeof CanvasSchema>;
export type Accordion = z.infer<typeof AccordionSchema>;
```

**Why this matters:** Zod gives you runtime validation and TypeScript types for free. The Vercel AI SDK's `streamObject()` takes a Zod schema directly and forces Claude to return JSON matching it. If Claude goes off-script, the SDK throws — you catch it and show a friendly error. No ad-hoc parsing.

---

## 5. The Two Prompts

You will iterate on these more than any other file. Start simple, then add constraints as you find edge cases.

**`src/lib/prompts.ts`**

```typescript
export const EXPLAIN_SYSTEM_PROMPT = `
You are VECTOR, an expert educational explainer. Your job is to turn problems and concepts into structured, step-by-step canvas explanations.

CRITICAL RULES:
1. Output ONLY valid JSON matching the provided schema. No prose outside the JSON.
2. Classify the input as "problem" (something to solve/derive/calculate) or "concept" (theory to understand).
3. Break the explanation into 3-8 numbered steps. Never more than 8.
4. Each step has: a stepNumber, a short title, a plain-language explanation, and an optional display formula.
5. Use LaTeX math notation. Inline math uses $...$ delimiters. Display formulas use plain LaTeX (no $$ wrappers — those go in the separate formula field).
6. Keep explanations concrete. No filler, no "let's explore" phrases. Get to the point.
7. For problems: walk through the derivation/solution step by step.
8. For concepts: cover definition → intuition → formal framework → application.
`;

export const ACCORDION_SYSTEM_PROMPT = `
You are VECTOR's clarification engine. The user is asking a follow-up question about a specific step on an existing canvas.

CRITICAL RULES:
1. Identify which step number the user is asking about. Use the "targetStepNumber" field.
2. If the user says "step N" explicitly, use that. Otherwise infer from context.
3. Generate a clarification as an array of sub-steps (same format as canvas steps).
4. Keep clarifications focused. 2-5 sub-steps maximum.
5. The "label" field should describe what the accordion covers (e.g., "Breaking down the integral").
6. Output ONLY valid JSON matching the schema.
`;
```

**Iteration hint:** When you test these and find Claude doing something weird (ignoring the step limit, adding prose, outputting bad LaTeX), add a new `CRITICAL RULE` to the prompt. Do not try to make the prompt perfect on the first try. Ship a working version, then harden it through testing.

---

## 6. The Core Hook: `useVectorChat`

This is where all the streaming logic lives. The Vercel AI SDK does most of the heavy lifting.

**Conceptual flow:**

```typescript
// Pseudocode — let the Antigravity agent write the real thing
function useVectorChat() {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [accordions, setAccordions] = useState<Map<number, Accordion[]>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Uses Vercel AI SDK's useObject hook under the hood
  const { submit: submitCanvas, object: streamingCanvas, isLoading } = useObject({
    schema: CanvasSchema,
    api: "/api/explain", // Or direct Anthropic call via proxy
  });

  const { submit: submitAccordion } = useObject({
    schema: AccordionSchema,
    api: "/api/clarify",
  });

  async function sendMessage(userText: string) {
    // Add user message to thread
    setMessages(prev => [...prev, { role: "user", text: userText }]);

    // Decide: is this a new canvas request or a follow-up about an existing canvas?
    const isFollowUp = canvas !== null && mentionsExistingStep(userText, canvas);

    if (isFollowUp) {
      submitAccordion({ userQuestion: userText, canvas });
    } else {
      submitCanvas({ userInput: userText });
    }
  }

  // When streaming canvas updates, commit to state
  useEffect(() => {
    if (streamingCanvas && !isLoading) {
      setCanvas(streamingCanvas);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: `Here's the breakdown — ${streamingCanvas.steps.length} steps loaded onto your canvas.`,
      }]);
    }
  }, [streamingCanvas, isLoading]);

  return { canvas, accordions, messages, sendMessage, isLoading, streamingCanvas };
}
```

The `streamingCanvas` object is the magic part: as Claude streams tokens, `useObject` progressively populates it. Your `Canvas` component reads from `streamingCanvas` while loading and from `canvas` after completion, rendering step cards as they arrive.

---

## 7. The Antigravity Workflow — Step by Step

Follow these phases in order. Each one has a specific goal and a rough time estimate. Do not skip ahead.

### Phase 1: Scaffold (30 minutes)

1. Open Antigravity. Create a new workspace in an empty folder.
2. In the agent sidebar, set the model to **Claude Sonnet 4.5** (or 4.6 if available).
3. Use **Planning Mode** for this phase.
4. Prompt the agent:

> "Scaffold a new Vite + React + TypeScript project in this directory. Install these dependencies: tailwindcss@4, shadcn/ui (initialize with the default theme), ai, @ai-sdk/anthropic, @ai-sdk/react, zod, streamdown, @streamdown/math, katex. Install shadcn components: accordion, card, scroll-area, input, button. Create the folder structure exactly as specified in the build guide at /CLAUDE.md (I will create that file next). Set up a Vite proxy in vite.config.ts that forwards /api/* requests to https://api.anthropic.com and injects the VITE_ANTHROPIC_API_KEY from .env as the x-api-key header. Create a .env.example file."

5. Create `CLAUDE.md` at the project root. Paste the entire "Project Structure" and "Stack" sections from this build guide into it. This gives the Antigravity agent persistent context about what you're building.
6. Verify `npm run dev` works and you see the Vite welcome page.

### Phase 2: Data Contract (20 minutes)

Use **Fast Mode** from here on.

Prompt:

> "Create src/lib/schemas.ts with the Zod schemas for Step, Canvas, and Accordion exactly as defined in CLAUDE.md. Create src/types/index.ts that re-exports the TypeScript types derived from those schemas. Create src/lib/prompts.ts with the EXPLAIN_SYSTEM_PROMPT and ACCORDION_SYSTEM_PROMPT from CLAUDE.md. Create src/lib/normalizeMath.ts with a helper function that converts \\( \\) and \\[ \\] LaTeX delimiters to $ and $$ for streamdown compatibility."

Review the generated files. The schemas are the foundation — if they're wrong, everything breaks.

### Phase 3: Layout Shell + Sidebar Placeholder (30 minutes)

Prompt:

> "Build src/components/Layout/AppLayout.tsx: a three-column layout using Tailwind. Left column is a fixed 280px sidebar. Center column takes flex-grow and contains the Canvas area. Right column is fixed 400px wide and contains the Chat panel. Full viewport height. Dark slate theme (bg-slate-950 base, bg-slate-900 panels). Subtle vertical dividers between columns.
>
> Then build src/components/Sidebar/SidebarPlaceholder.tsx: a static visual-only sidebar. Contents: VECTOR logo/wordmark at the top, a disabled search input below it, then a hardcoded notebook tree with these dummy entries — a 'Physics' folder containing 'Work-Energy Theorem' and 'Quantum Mechanics', and a 'Calculus' folder containing 'Chain Rule'. Use lucide-react icons (Folder for folders, FileText for canvases). Folders should appear expanded by default. At the bottom, add a 'Sign In / Sign Up' row with a settings gear icon. This is purely visual — no click handlers, no state, no interactivity beyond hover styles. Add a comment at the top of the file: '// V1 placeholder. Replace with real notebook state in V2.'
>
> Update src/App.tsx to render AppLayout with SidebarPlaceholder in the left column, and placeholder 'Canvas' and 'Chat' divs for now. Import katex/dist/katex.min.css in src/index.css."

Launch the dev server inside Antigravity and let the agent screenshot it via Chrome automation. Fix any visual issues before moving on.

### Phase 4: Canvas Components (45 minutes)

Prompt:

> "Build the Canvas components. First, src/components/Canvas/StepCard.tsx: renders a single Step. Props: step (Step type), children (for accordion slot). Layout: a circled step number on the left, the step content on the right. Use Streamdown with the @streamdown/math plugin to render the explanation field (which contains markdown with inline LaTeX). If the formula field exists, render it as a display-mode KaTeX block below the explanation. Wrap the card in React.memo keyed by stepNumber so completed steps don't re-render.
>
> Then src/components/Canvas/Canvas.tsx: takes a canvas prop (Canvas | null) and a streamingCanvas prop (partial Canvas for in-progress streaming). Renders the title at the top, then maps over steps rendering StepCard components. If canvas is null and streamingCanvas is null, show the empty state: 'Type a problem or concept in the chat to get started.' If streamingCanvas exists but is still loading, show partial steps that have arrived plus skeleton placeholders for incomplete ones. Add a subtle fade-in animation for new steps using Tailwind's animate utilities."

Test this in isolation with hardcoded mock data before wiring up the real API.

### Phase 5: Chat Components (30 minutes)

Prompt:

> "Build the Chat panel. src/components/Chat/Message.tsx: renders a single chat message. User messages right-aligned with blue background, assistant messages left-aligned with gray background. src/components/Chat/MessageThread.tsx: scrollable message list using shadcn ScrollArea, auto-scrolls to bottom when new messages arrive. src/components/Chat/ChatInput.tsx: text input with send button at the bottom. Enter sends, Shift+Enter adds a newline. Shows a disabled state with a three-dot typing indicator when isLoading is true. src/components/Chat/ChatPanel.tsx: combines all three with the header 'AI Co-Pilot'."

### Phase 6: The Streaming Hook (60 minutes — this is the hard phase)

Switch back to **Planning Mode** for this one. This is where the real work happens.

Prompt:

> "Build src/hooks/useVectorChat.ts following the pseudocode in CLAUDE.md. Use the Vercel AI SDK's useObject hook from @ai-sdk/react to stream structured objects. The hook should expose: canvas, streamingCanvas, accordions (Map keyed by step number), messages, sendMessage function, and isLoading. When sendMessage is called, detect whether this is a new canvas request or a follow-up about an existing step. For new canvas requests, call /api/explain with the CanvasSchema. For follow-ups, call /api/clarify with the AccordionSchema and include the current canvas as context. When the stream completes, commit the final object to state and add a short confirmation message to the chat thread. Handle errors gracefully — if the stream fails, add an error message to the thread and reset the loading state."

Then wire it up:

> "Update src/App.tsx to use the useVectorChat hook and pass the canvas, streamingCanvas, and accordions down to the Canvas component. Pass messages, sendMessage, and isLoading down to the ChatPanel component."

**This is where you will hit the most bugs.** Expected issues:
- CORS errors from the Vite proxy (check vite.config.ts)
- Zod validation failures (Claude's output doesn't match the schema)
- LaTeX rendering issues (need the normalizeMath helper)
- Stream not progressively updating (check the useObject integration)

Let the Antigravity agent debug these one at a time. Use Chrome DevTools inside Antigravity's browser automation to inspect the network tab.

### Phase 7: Test the Core Loop (30 minutes)

No prompting needed. You test this by hand. Open the app and try:

1. "Derive the work-energy theorem from Newton's second law."
2. "Explain the chain rule in calculus."
3. "Solve x² + 5x + 6 = 0."
4. "What is entropy in thermodynamics?"
5. "Prove that sqrt(2) is irrational."

For each one, check: does the canvas stream in smoothly? Does the math render correctly? Does the chat show a short confirmation?

### Phase 8: Accordion Injection (45 minutes)

Once canvas generation works reliably, add the follow-up clarification flow.

Prompt:

> "Build src/components/Canvas/Accordion.tsx using shadcn's Accordion primitive. It takes an Accordion object (from schemas.ts) and renders the label as the collapsed header and the sub-steps as the expanded content. Sub-steps render the same way as top-level StepCards but slightly indented. Update the Canvas component to read accordions from the useVectorChat hook's accordions Map and inject them as children under the matching StepCard (keyed by targetStepNumber). Multiple accordions under a single step should stack vertically."

Then test follow-ups:

1. Generate a canvas (e.g., "Derive the quadratic formula").
2. Ask "Explain step 3 more."
3. Verify the accordion appears under step 3.
4. Expand it and check the content.

### Phase 9: Polish (30 minutes)

Use Antigravity's Manager View to spawn two parallel agents.

Agent 1: "Open the running app in Chrome. Test five different problem and concept prompts. Screenshot any visual bugs, layout issues, or broken math rendering. Fix them."

Agent 2: "Add finishing touches: smooth scroll-into-view when new steps appear on the canvas, loading skeletons with a subtle pulse animation, better empty states, and graceful error messages when the API fails."

---

## 8. The Prompt Engineering Loop

You will spend more time iterating on `prompts.ts` than on any other file. Here is the loop:

1. Test a prompt with five different inputs across STEM and humanities.
2. Find where Claude's output disappoints you (too verbose, wrong format, bad math, hallucinated steps).
3. Add one specific `CRITICAL RULE` to the system prompt that fixes that class of problem.
4. Retest the same five inputs to confirm the fix didn't break anything.
5. Repeat.

**Things to test for:**
- Does it respect the 3–8 step limit?
- Does it use proper LaTeX delimiters (no stray `\(` or `$$` in wrong places)?
- Does it stay concrete and avoid filler?
- Does it classify problem vs concept correctly?
- For the accordion prompt: does it correctly identify which step the user is asking about?

**The hardest case:** the accordion router. "Explain step 2" is easy. "I don't understand the integral" is hard because Claude has to infer which step contains an integral. If this misroutes often, add an explicit rule: "If the user does not say 'step N', look at each step's content and choose the one that best matches the user's question."

---

## 9. Debugging Common Issues

**Canvas doesn't stream, it all appears at once.** Check that you're using `useObject` from `@ai-sdk/react`, not a standard fetch. Check that the API route is actually streaming (not buffering the full response).

**Math renders as raw LaTeX (e.g., `\frac{1}{2}` visible).** You forgot to import `katex/dist/katex.min.css` in `index.css`. Or you're not using the `@streamdown/math` plugin.

**Zod validation fails on Claude's output.** Claude is returning JSON that doesn't match the schema. Look at the actual output in DevTools. Usually it means your system prompt isn't strict enough — add a `CRITICAL RULE` about the exact field names.

**Claude outputs markdown instead of JSON.** Your system prompt isn't being enforced. Double-check that `streamObject()` is getting the schema parameter. The Vercel AI SDK forces structured output at the API level.

**CORS errors when calling Anthropic.** Your Vite proxy isn't configured. In `vite.config.ts`, add a `server.proxy` config that forwards `/api/*` to `https://api.anthropic.com/v1/*` and injects the `x-api-key` header from `process.env.VITE_ANTHROPIC_API_KEY`.

**Accordion doesn't appear under the right step.** The `targetStepNumber` from Claude is wrong. Either improve the accordion system prompt, or add a client-side fallback that uses regex to extract "step N" from the user's question before calling Claude.

**The app works but feels slow.** Check that completed StepCards are memoized with `React.memo`. Without memoization, every token update re-renders every step.

---

## 10. What to Do After V1 Works

When the core loop is solid and you've used it on real homework for a week, you'll have a clear intuition for what to build next. The natural Phase 2 additions, in order of impact:

1. **Add the notebook sidebar and persistence** (localStorage is fine, no need for a real database yet)
2. **Add file uploads** (PDF parsing via PDF.js, image OCR via Tesseract.js for printed text)
3. **Add concept canvas spawning from within a problem canvas** (the macro-routing feature)
4. **Add Practice Mode** (generative problems from existing canvases)

Do not build any of these until V1 feels magical. Premature feature expansion is how products die.

---

## 11. Final Advice

- **Ship ugly first, then polish.** Get the core loop working end-to-end before touching styling beyond the basics.
- **Use the app yourself every day.** If you're not excited to use VECTOR for your own learning, no user will be either.
- **Talk to Antigravity like a senior engineer.** Vague prompts get vague code. Specific prompts with acceptance criteria get good code.
- **When stuck on a bug for more than 30 minutes, ask Claude directly** (not through Antigravity) to explain the root cause. A fresh context often unblocks you faster than more agent iteration.
- **The spec is a contract with yourself.** If you find yourself adding features that aren't in `VECTOR_Product_Spec.md`, stop and ask whether you're actually building V1 or drifting into V2.

Now close this guide and open Antigravity.
