# VECTOR V1 — Complete Recreation Prompt for Claude

> **Usage**: Copy this entire prompt and paste it into Claude Opus 4.7 (or any Claude model with extended thinking). It contains every detail needed to recreate the VECTOR application from scratch — architecture, design system, every component, exact colors, exact spacing, every behavior, and all business logic.

---

## System Context

You are building **VECTOR**, an AI-powered educational tool that turns problems and concepts into structured, step-by-step visual explanations on a canvas. The core loop is: **Chat → Canvas → Accordion**. The user types a problem or concept into a chat panel, the AI generates a structured step-by-step canvas in the center, and follow-up questions inject expandable accordion blocks under specific steps.

---

## Tech Stack (Exact Versions)

| Layer | Technology | Details |
|---|---|---|
| **Runtime** | React 19 + TypeScript | `react@^19.2.4`, `react-dom@^19.2.4`, `typescript@~6.0.2` |
| **Build** | Vite 8 | `vite@^8.0.4`, `@vitejs/plugin-react@^6.0.1` |
| **Styling** | Tailwind CSS v4 | `tailwindcss@^4.2.2`, `@tailwindcss/vite@^4.2.2` — uses `@import "tailwindcss"` syntax, NOT `@tailwind` directives |
| **Components** | shadcn/ui (base-nova style) | `shadcn@^4.2.0` — neutral base color, CSS variables enabled, Lucide icons |
| **Icons** | Lucide React | `lucide-react@^1.8.0` |
| **Resizable Panels** | react-resizable-panels | `react-resizable-panels@^4.10.0` |
| **Math Rendering** | KaTeX | `katex@^0.16.45`, `@types/katex@^0.16.8` |
| **LLM API** | OpenRouter (proxied via Vite dev server) | Model: `anthropic/claude-sonnet-4` |
| **Schema Validation** | Zod v4 | `zod@^4.3.6` |
| **Fonts** | Geist Variable (primary), Inter (fallback), Fraunces (serif accent) | `@fontsource-variable/geist@^5.2.8` + Google Fonts import |
| **Utilities** | clsx, tailwind-merge, class-variance-authority | For conditional class merging |
| **Animations** | tailwindcss-animate, tw-animate-css | `tailwindcss-animate@^1.0.7`, `tw-animate-css@^1.4.0` |

**No backend, no database, no caching, no auth.** Everything is React state. Refresh = fresh start.

---

## Project Structure

```
vector-v1/
├── index.html
├── vite.config.ts
├── package.json
├── components.json              # shadcn/ui config
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .env                         # VITE_OPENROUTER_API_KEY=sk-or-...
├── .env.example                 # VITE_OPENROUTER_API_KEY=your-key-here
├── src/
│   ├── main.tsx                 # React 19 createRoot entry
│   ├── App.tsx                  # Composes Layout + hook
│   ├── App.css                  # Legacy/unused boilerplate styles (keep but not critical)
│   ├── index.css                # Tailwind v4 imports + full design token system
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── Canvas.tsx       # Main canvas container with empty state
│   │   │   ├── StepCard.tsx     # Numbered step with KaTeX math rendering
│   │   │   └── Accordion.tsx    # Expandable clarification block
│   │   ├── Chat/
│   │   │   ├── ChatPanel.tsx    # Full chat container
│   │   │   ├── MessageThread.tsx # Scrollable message list with auto-scroll
│   │   │   ├── Message.tsx      # Individual chat bubble + typing indicator
│   │   │   └── ChatInput.tsx    # Textarea with image upload/paste/drag-drop
│   │   ├── Sidebar/
│   │   │   └── SidebarPlaceholder.tsx  # Static notebook tree (V1 visual only)
│   │   ├── Layout/
│   │   │   └── AppLayout.tsx    # Three-column resizable shell
│   │   └── ui/                  # shadcn/ui primitives
│   │       ├── accordion.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── resizable.tsx    # Custom resizable handle with dot pattern
│   │       └── scroll-area.tsx
│   ├── hooks/
│   │   └── useVectorChat.ts     # Core streaming + state logic
│   ├── lib/
│   │   ├── schemas.ts           # Zod schemas for Canvas, Step, Accordion
│   │   ├── prompts.ts           # System prompts for the LLM
│   │   ├── normalizeMath.ts     # LaTeX delimiter cleanup (\( \) → $ $)
│   │   └── utils.ts             # cn() utility (clsx + tailwind-merge)
│   └── types/
│       └── index.ts             # Re-exports types from schemas
```

---

## Step 1: Scaffold the Project

Initialize a Vite project with React + TypeScript. Use `npx -y create-vite@latest ./ --template react-ts`. Then install all dependencies:

```bash
npm install react@^19.2.4 react-dom@^19.2.4 tailwindcss@^4.2.2 @tailwindcss/vite@^4.2.2 @fontsource-variable/geist lucide-react react-resizable-panels katex zod clsx tailwind-merge class-variance-authority tw-animate-css tailwindcss-animate shadcn@^4.2.0
npm install -D @types/katex @types/node
```

Initialize shadcn/ui:
```bash
npx shadcn@latest init
```
Choose: **base-nova** style, **neutral** base color, CSS variables **yes**, Lucide icons.

Then add the needed shadcn components:
```bash
npx shadcn@latest add accordion button card input scroll-area
```

Install the resizable panel manually (shadcn wraps react-resizable-panels):
```bash
npx shadcn@latest add resizable
```

---

## Step 2: Vite Configuration

**`vite.config.ts`** — Uses `@tailwindcss/vite` plugin (NOT PostCSS). Configures a dev server proxy to OpenRouter so the API key never reaches the browser:

```ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    css: { postcss: {} },
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      proxy: {
        '/api/chat': {
          target: 'https://openrouter.ai',
          changeOrigin: true,
          rewrite: () => '/api/v1/chat/completions',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const apiKey = env.VITE_OPENROUTER_API_KEY;
              if (apiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
                proxyReq.setHeader('HTTP-Referer', 'http://localhost:5173');
                proxyReq.setHeader('X-Title', 'VECTOR');
              }
            });
          }
        }
      }
    }
  }
})
```

---

## Step 3: Design System — `index.css`

This is the single most important file for visual fidelity. It imports Tailwind v4, KaTeX styles, fonts, and defines the full color token system using **oklch** color space.

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;600;700&family=Inter:wght@400;500;600&display=swap');
@import "tailwindcss";
@import "katex/dist/katex.min.css";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/geist";

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

@theme {
  --color-background: #F4F5F7;
  --color-foreground: #1e2022;
  --font-sans: 'Inter', sans-serif;
  --font-serif: 'Fraunces', serif;
  --color-card: #FFFFFF;
  --color-card-foreground: #1e2022;
  --color-popover: #FFFFFF;
  --color-popover-foreground: #1e2022;
  --color-primary: #1e2022;
  --color-primary-foreground: #ffffff;
  --color-secondary: #f4f4f5;
  --color-secondary-foreground: #1e2022;
  --color-muted: #f4f4f5;
  --color-muted-foreground: #71717a;
  --color-accent: #f4f4f5;
  --color-accent-foreground: #1e2022;
  --color-destructive: #ef4444;
  --color-destructive-foreground: #f8fafc;
  --color-border: #e4e4e7;
  --color-input: #e4e4e7;
  --color-ring: #a1a1aa;
  --radius-lg: 1rem;
  --radius-md: calc(1rem - 2px);
  --radius-sm: calc(1rem - 4px);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply font-sans antialiased bg-background text-foreground; }
  html { @apply font-sans; }
}

@theme inline {
  --font-heading: var(--font-sans);
  --font-sans: 'Geist Variable', sans-serif;
  /* ... all sidebar, chart, radius CSS custom properties via oklch ... */
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}
```

### Key Design Tokens

| Token | Value | Usage |
|---|---|---|
| Page background | `#F4F5F7` | Overall app background |
| Card background | `#FFFFFF` | Panels, canvas card |
| Border color | `#E5E7EB` | Panel borders, dividers |
| Active selection blue | `#D0E2FF` | Segmented toggle active, AI message bubbles |
| Active selection border | `#B8D4FF` | Subtle borders on blue elements |
| User message bg | `#333333` | Dark chat bubbles for user messages |
| Primary font | `'Geist Variable', sans-serif` | Body text everywhere |
| Serif accent | `'Fraunces', serif` | VECTOR logo/wordmark only |

---

## Step 4: The Layout — `AppLayout.tsx`

A full-viewport, three-column layout using `react-resizable-panels`. No top navbar. No bottom bar. The entire viewport is the workspace.

### Panel Configuration

| Panel | Default Size | Min Size | Max Size | Background |
|---|---|---|---|---|
| Left Sidebar | 18% | 12% | 28% | `#FFFFFF` with right border `#E5E7EB` |
| Center Canvas | 60% | 40% | — | `#F4F5F7` (page bg), inner card is `#FFFFFF` |
| Right Chat | 22% | 18% | 35% | `#FFFFFF` with left border `#E5E7EB` |

### Resizable Handles
- 1px wide, `bg-transparent` by default
- On hover: `bg-slate-300/60` with a centered 6px-wide pill containing three 2px dots vertically
- Dots are `bg-slate-500/70`, pill is `bg-slate-300/80`
- Handle appears with `opacity-0 → opacity-100` transition on hover

### Center Canvas Wrapper
The center panel contains:
1. A **Segmented Toggle** centered at the top:
   - Container: `bg-[#E5E7EB] p-1 shadow-inner inline-flex rounded-full items-center gap-1`
   - Active tab ("Derivation Mode"): `bg-[#D0E2FF] text-blue-900 px-6 py-1.5 rounded-full font-medium text-[15px]` with a `FileText` Lucide icon (`w-4 h-4 text-blue-700`) and `shadow-sm`
   - Inactive tab ("Practice Mode"): `text-slate-600 px-6 py-1.5 rounded-full font-medium text-[15px]` with a `Target` icon (`opacity-70`), `cursor-not-allowed`, and `hover:bg-slate-300/40`
2. A **Document Card** below:
   - `bg-[#FFFFFF] w-full max-w-[900px] mx-auto p-[40px] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-none flex-1 mb-8`

---

## Step 5: The Sidebar — `SidebarPlaceholder.tsx`

A static, non-functional sidebar that provides visual completeness. All data is hardcoded. Nothing is interactive beyond hover states.

### Structure (top to bottom):
1. **Logo** — `px-5 pt-7 pb-6`: A `Send` Lucide icon (`w-6 h-6 text-slate-800`) + the text "VECTOR" in `font-serif font-semibold text-2xl tracking-tight`
2. **Search Input** — `mb-5 px-5`: Disabled, `pl-9 bg-[#F4F5F7] border-transparent rounded-lg shadow-inner h-10 text-[15px]` with a `Search` icon positioned absolutely (`left-8 top-2.5 h-4 w-4 text-slate-400`)
3. **Notebook Tree** — `flex-1 overflow-y-auto px-3`:
   - Root item "Notebooks" with `ChevronDown` and `Folder` icons, `text-[15px] font-medium`
   - Nested with `ml-4 mt-1 border-l border-[#E5E7EB] pl-2`
   - "Physics (Classical Mechanics)" folder with nested items
   - **Active item** ("Work-Energy Theorem Derivation"): `bg-[#D0E2FF] text-blue-950 rounded-lg font-medium shadow-sm border border-[#B8D4FF]` with a `FileText` icon (`text-blue-600`) and a subtitle "Problem Canvas" with `Settings` icon
   - "Quantum Mechanics" folders (collapsed, with `ChevronRight`)
4. **Footer** — `pt-4 pb-4 px-5 border-t border-[#E5E7EB]`:
   - User avatar circle: `w-8 h-8 rounded-full bg-slate-100 shadow-inner border border-slate-200` with "U" text
   - "Sign In / Sign Up" text
   - `Settings` gear icon (`w-[18px] h-[18px] text-slate-400`)

---

## Step 6: The Canvas — `Canvas.tsx`, `StepCard.tsx`, `Accordion.tsx`

### Empty State (`Canvas.tsx` when `canvas === null`)
- Centered vertically with `py-24`
- Icon container: `w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner mb-5` with `Sparkles` icon (`w-6 h-6 text-slate-400`)
- Heading: `text-[22px] font-semibold text-slate-800 tracking-tight mb-2` — "Your canvas is empty"
- Subtext: `text-[15px] text-slate-500 max-w-[320px] leading-relaxed` — "Type a problem or concept in the chat to get started. The AI will build a step-by-step explanation here."

### Canvas with Content
- **Header**: Title in `text-[34px] font-bold font-sans leading-tight text-slate-900 tracking-tight` + a badge `px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-full border border-slate-200 shadow-sm capitalize` showing "{type} Canvas"
- **Steps**: Rendered in a `space-y-8` container

### StepCard Component
Each step is a horizontal flex layout (`flex gap-5`):
- **Step Number Badge**: `w-7 h-7 rounded-full bg-slate-100 shadow-inner border border-slate-200 text-slate-500 text-[13px] font-bold` — centered number
- **Content Area** (`flex-1 min-w-0`):
  - Title: `text-[17px] text-slate-900 font-semibold leading-relaxed`
  - Explanation: `text-[15px] text-slate-700 leading-relaxed font-medium` — rendered with inline KaTeX math via `dangerouslySetInnerHTML`
  - Formula (optional): Display-mode KaTeX block, `text-lg text-slate-900`
  - Accordion slot: `mt-4 space-y-3` for children

### KaTeX Rendering Logic
A `renderMathInText()` function processes text through these steps:
1. Call `normalizeMathDelimiters()` to convert `\( \)` → `$ $` and `\[ \]` → `$$ $$`
2. Replace `$$...$$` with `katex.renderToString(math, { displayMode: true, throwOnError: false })`
3. Replace `$...$` with `katex.renderToString(math, { displayMode: false, throwOnError: false })`
4. Catch errors and fall back to `<code>` blocks

### Accordion Component
- Container: `bg-[#F4F6F9] rounded-2xl shadow-sm border border-[#E8EEF4] overflow-hidden`
- **Collapsed Header**: `w-full flex items-center gap-2 px-5 py-4` with `ChevronRight` icon that rotates 90° when open (via `rotate-90` + `transition-transform duration-200`)
- **Expanded Content**: Uses `max-h-0 opacity-0` → `max-h-[2000px] opacity-100` CSS transition (`transition-all duration-300 ease-in-out`)
- Each sub-step has a `Lightbulb` icon (`w-[18px] h-[18px] text-amber-500 fill-amber-200`)
- Sub-step title: `font-semibold text-slate-800`
- Sub-step explanation and formula: same KaTeX rendering as StepCard

### Streaming Indicator
When `isStreaming` is true, show three bouncing dots below the last step:
- `mt-6 flex items-center gap-2 text-slate-400 text-[13px]`
- Three `w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce` spans with staggered delays: `0ms`, `150ms`, `300ms`
- Text: "Generating..."

---

## Step 7: The Chat Panel — `ChatPanel.tsx`, `MessageThread.tsx`, `Message.tsx`, `ChatInput.tsx`

### ChatPanel
- Full height flex column, `bg-transparent`
- **Header**: `px-5 py-5 border-b border-slate-100` with "AI Co-Pilot" in `text-[19px] font-semibold text-slate-900 tracking-tight`
- `<MessageThread>` fills the middle space
- `<ChatInput>` pinned at the bottom

### MessageThread
- `flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4`
- Auto-scrolls to bottom when messages change or streaming starts/stops (via `useRef` + `scrollIntoView({ behavior: "smooth" })`)
- Shows `<TypingIndicator>` when `isStreaming` is true

### Message Bubbles
- **User messages**: `bg-[#333333] text-white rounded-2xl rounded-tr-[4px]` — right-aligned (`justify-end`)
- **AI messages**: `bg-[#D0E2FF] text-blue-950 rounded-2xl rounded-tl-[4px] border border-[#B8D4FF]` — left-aligned (`justify-start`)
- Both: `px-4 py-3 max-w-[90%] shadow-sm text-[14px] leading-relaxed`
- Supports embedded image previews: `max-w-[200px] max-h-[150px] rounded-lg object-contain`

### Typing Indicator
- Same styling as AI message: `bg-[#D0E2FF] text-blue-950 rounded-2xl rounded-tl-[4px] border border-[#B8D4FF] shadow-sm`
- Three bouncing dots: `w-2 h-2 rounded-full bg-blue-400 animate-bounce` with staggered delays

### ChatInput (Most Complex Component)
A multi-feature input area pinned at the bottom:

**Container**: `px-3 pb-3 pt-2 flex-shrink-0 mt-auto bg-gradient-to-t from-white via-white to-transparent`

**Image Preview Strip**: When images are attached, shows thumbnails:
- `w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-sm`
- Remove button: `absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-700 text-white rounded-full opacity-0 group-hover:opacity-100`

**Input Box**: A rounded container (`rounded-xl shadow-[0_1px_6px_-2px_rgba(0,0,0,0.06)]`) with:
- Default: `bg-[#F4F5F7] hover:bg-[#EDEEF1]`
- Dragging state: `bg-blue-50 ring-2 ring-blue-300`
- **Textarea**: `bg-transparent border-none px-3 pt-2 pb-0 text-[12.5px]` with auto-resize (capped at 200px max-height), hidden scrollbar (`scrollbarWidth: "none"`, `::-webkit-scrollbar hidden`)
- **Bottom Toolbar**: `flex items-center justify-between px-2 pb-1.5 pt-0.5`
  - Left: `ImagePlus` icon button (`w-[18px] h-[18px] text-slate-400 hover:text-slate-600`)
  - Right: Send button — a circle that changes appearance:
    - Active: `bg-slate-800 text-white hover:bg-slate-700 shadow-sm rounded-full p-1.5`
    - Inactive: `bg-slate-200 text-slate-400 cursor-not-allowed rounded-full p-1.5`
    - Uses `ArrowUp` icon (`w-[18px] h-[18px]`)

**Behaviors**:
- Enter to send (Shift+Enter for newline)
- Drag-and-drop images onto the input box
- Paste images from clipboard
- Click the ImagePlus button to open file picker (`accept="image/*" multiple`)
- Disabled state shows "Generating..." placeholder, 50% opacity, `cursor-not-allowed`
- Default placeholder: "Ask anything..."
- Drag placeholder: "Drop image here..."

---

## Step 8: Core Logic — `useVectorChat.ts`

The central state machine. Manages canvas, accordions, messages, and streaming state.

### State
```ts
const [canvas, setCanvas] = useState<Canvas | null>(null);
const [accordions, setAccordions] = useState<Record<number, Accordion[]>>({});
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isStreaming, setIsStreaming] = useState(false);
```

### ChatMessage Type
```ts
type ChatMessage = {
  id: string;          // "msg-1", "msg-2", etc.
  role: "user" | "assistant";
  content: string;
  images?: string[];   // base64 data URLs
};
```

### Flow Logic

**First message (canvas is null)**:
1. Add user message to thread
2. Set `isStreaming = true`
3. Call LLM with `EXPLAIN_SYSTEM_PROMPT` → get raw JSON
4. Strip markdown code fences from response
5. Parse JSON → validate with `CanvasSchema` (Zod)
6. Set canvas state
7. Add assistant message: "Here's the breakdown — {N} steps loaded onto your canvas."

**Follow-up messages (canvas exists)**:
1. Add user message to thread
2. Set `isStreaming = true`
3. Build canvas context string with all current step titles and explanations
4. Call LLM with `ACCORDION_SYSTEM_PROMPT` + canvas context
5. Parse JSON → validate with `AccordionSchema`
6. Append accordion to `accordions[targetStepNumber]` array
7. Add assistant message: "I've added a breakdown under step {N}."

### LLM API Call
```ts
const callLLM = async (systemPrompt, userContent) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};
```

### Vision Support
When images are attached, the user content transforms from a string to an OpenAI-compatible multimodal array:
```ts
[
  { type: "image_url", image_url: { url: "data:image/png;base64,..." } },
  { type: "text", text: "User's question" }
]
```

---

## Step 9: Schemas — `schemas.ts`

```ts
import { z } from "zod";

export const StepSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: z.string(),
  explanation: z.string(),       // Markdown with inline LaTeX: "Using $F = ma$..."
  formula: z.string().optional(), // Display-mode LaTeX: "W = \\int F \\cdot dx"
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
```

---

## Step 10: System Prompts — `prompts.ts`

### EXPLAIN_SYSTEM_PROMPT
```
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
```

### ACCORDION_SYSTEM_PROMPT
```
You are VECTOR's clarification engine. The user is asking a follow-up question about a specific step on an existing canvas.

CRITICAL RULES:
1. Identify which step number the user is asking about. Use the "targetStepNumber" field.
2. If the user says "step N" explicitly, use that. Otherwise infer from context.
3. Generate a clarification as an array of sub-steps (same format as canvas steps).
4. Keep clarifications focused. 2-5 sub-steps maximum.
5. The "label" field should describe what the accordion covers (e.g., "Breaking down the integral").
6. Output ONLY valid JSON matching the schema.
```

Both prompts get appended with: `"\n\nYou MUST respond with ONLY valid JSON. No markdown code fences, no explanatory text before or after the JSON."`

---

## Step 11: Math Normalization — `normalizeMath.ts`

LLMs often output `\( \)` and `\[ \]` delimiters instead of `$ $` and `$$ $$`. This helper converts them:

```ts
export function normalizeMathDelimiters(text: string): string {
  if (!text) return text;
  return text
    .replace(/\\\((.*?)\\\)/g, '$$$1$$')      // \( ... \) → $ ... $
    .replace(/\\\[(.*?)\\\]/gs, '$$$$$1$$$$'); // \[ ... \] → $$ ... $$
}
```

---

## Step 12: Custom Resizable Handle — `ui/resizable.tsx`

The default shadcn resizable handle is replaced with a minimal, hover-reveal design:

```tsx
const ResizableHandle = ({ withHandle, className, ...props }) => (
  <Separator
    className={cn(
      "group/handle relative flex w-[1px] items-center justify-center transition-colors duration-150",
      "bg-transparent hover:bg-slate-300/60",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2",
      "focus-visible:outline-none focus-visible:bg-slate-300",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-6 w-[6px] items-center justify-center rounded-full bg-slate-300/80 opacity-0 group-hover/handle:opacity-100 transition-opacity duration-200">
        <div className="flex flex-col gap-[2px]">
          <div className="w-[2px] h-[2px] rounded-full bg-slate-500/70" />
          <div className="w-[2px] h-[2px] rounded-full bg-slate-500/70" />
          <div className="w-[2px] h-[2px] rounded-full bg-slate-500/70" />
        </div>
      </div>
    )}
  </Separator>
);
```

---

## Step 13: The App Composition — `App.tsx`

```tsx
import { AppLayout } from './components/Layout/AppLayout';
import { SidebarPlaceholder } from './components/Sidebar/SidebarPlaceholder';
import { Canvas } from './components/Canvas/Canvas';
import { ChatPanel } from './components/Chat/ChatPanel';
import { useVectorChat } from './hooks/useVectorChat';

function App() {
  const { canvas, accordions, messages, isStreaming, sendMessage } = useVectorChat();

  return (
    <AppLayout
      sidebar={<SidebarPlaceholder />}
      chat={
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          onSend={sendMessage}
        />
      }
    >
      <Canvas
        canvas={canvas}
        accordions={accordions}
        isStreaming={isStreaming}
      />
    </AppLayout>
  );
}
```

---

## Design Philosophy Checklist

When building, ensure these principles are followed:

- [ ] **No walls of text** — Every piece of content is numbered steps
- [ ] **Chat drives the canvas** — Long explanations belong on the canvas, not in chat
- [ ] **Math is first-class** — Every formula renders cleanly with KaTeX
- [ ] **Minimalist chrome** — Calm workspace feel, muted palette, generous whitespace, no decorative elements
- [ ] **The AI narrates its actions** — When it injects an accordion, it says so in chat
- [ ] **Accordions don't nest** — No accordions inside accordions
- [ ] **Multiple accordions per step** — Allowed
- [ ] **No persistence** — Refresh = fresh start, and that's fine for V1
- [ ] **The canvas is the deliverable** — The chat is just the command line

---

## Color Palette Quick Reference

| Element | Hex | Context |
|---|---|---|
| Page background | `#F4F5F7` | Main app bg |
| Panel/card bg | `#FFFFFF` | Sidebar, canvas card, chat panel |
| Border/divider | `#E5E7EB` | Panel edges, tree lines |
| Active blue bg | `#D0E2FF` | Toggle active, AI bubbles, sidebar active item |
| Active blue border | `#B8D4FF` | Subtle borders on blue elements |
| User bubble bg | `#333333` | Dark user chat bubbles |
| Accordion bg | `#F4F6F9` | Slightly off-white warm gray |
| Accordion border | `#E8EEF4` | Subtle blue-gray border |
| Text primary | `text-slate-900` | Headings, titles |
| Text body | `text-slate-700` | Explanations, body content |
| Text secondary | `text-slate-500/600` | Subtitles, meta text |
| Text muted | `text-slate-400` | Icons, placeholders |
| Amber accent | `text-amber-500 fill-amber-200` | Lightbulb icons in accordions |

---

## Final Notes

- The `App.css` file exists but mostly contains unused boilerplate from the Vite scaffold. You can keep it for reference but it doesn't affect the VECTOR UI.
- The `components.json` specifies `"style": "base-nova"` for shadcn — this is a newer, cleaner style variant.
- Font priority: **Geist Variable** is the actual display font (set in `@theme inline`). Inter is the fallback. Fraunces is used only for the "VECTOR" wordmark in the sidebar.
- All shadcn/ui primitive components (button, card, input, accordion, scroll-area) should be installed via the shadcn CLI and left at their default implementations — only `resizable.tsx` needs customization.
- The Vite proxy handles authentication with OpenRouter. The `.env` file must contain `VITE_OPENROUTER_API_KEY=sk-or-...`.
