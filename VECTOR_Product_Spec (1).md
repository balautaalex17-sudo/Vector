# VECTOR — Product Specification (V1.0)

**Status:** Final V1 Spec — Build Ready
**Scope:** Core loop only (Chat → Canvas → Accordion)
**Audience:** K-12 and university students studying STEM and humanities

---

## 1. Vision (One Line)

Tell the chat to explain a problem or a concept → the AI builds it as a structured, step-by-step canvas → drill deeper on any step and the canvas expands, or the AI spawns a linked concept canvas when you need the underlying theory.

---

## 2. The Core Loop

VECTOR V1 is one loop and nothing else:

1. User types a problem or concept question in the chat panel (right side).
2. AI generates a step-by-step canvas explanation in the center panel.
3. User asks a follow-up question about a specific step.
4. AI injects an inline accordion under that step with a deeper explanation.

That's the entire product for V1. If this loop feels magical, everything else (sidebar, notebooks, practice mode, concept spawning) can be built on top later.

---

## 3. What V1 Does NOT Include

Explicitly out of scope — do not build these for V1:

- No functional notebook tree (a visual placeholder sidebar exists, but it does nothing)
- No persistence (refresh = fresh start, and that's fine)
- No authentication or user accounts
- No file uploads (typed/pasted input only)
- No practice mode
- No concept canvas spawning from within a problem canvas
- No backend database
- No mobile app (desktop web only)

---

## 4. Interface Layout

A three-column layout, full viewport height. No top nav. The left sidebar is a visual placeholder only for V1 — it exists so the layout matches the full VECTOR vision, but has no functionality.

### Left Column — Notebook Sidebar Placeholder (280px fixed)

**Purpose:** Visual only. This sidebar exists so the UI looks complete in screenshots and demos. It has no state, no persistence, and no interactivity beyond hover styles. Real functionality comes in V2 once the backend exists.

**Contents (all hardcoded)**
- VECTOR logo/wordmark at the top
- A disabled search input below the logo
- A static notebook tree with dummy entries:
  - Physics
    - Work-Energy Theorem
    - Quantum Mechanics
  - Calculus
    - Chain Rule
- A "Sign In / Sign Up" placeholder with a settings gear icon pinned at the bottom

Clicking any item does nothing. The currently-displayed canvas does not sync to any sidebar highlight. When the real backend exists, the component structure stays the same — you just swap the hardcoded data for real state.

### Center Column — The Canvas (fluid width, ~65% of remaining space)

The primary workspace. Displays the AI-generated step-by-step explanation.

**Canvas Header**
- Title "VECTOR" (logo/wordmark)
- Optional: a subtitle showing what the current canvas is about (e.g., "Deriving the Work-Energy Theorem")

**Canvas Body**
- A vertical stack of numbered **Step Cards**.
- Each Step Card contains:
  - A circled step number
  - A bold title describing what the step does
  - A plain-language explanation (markdown with inline LaTeX math)
  - An optional display-mode formula block rendered with KaTeX
  - A slot below for one or more **Accordions** (expandable detail blocks)
- Steps appear progressively as Claude streams them — not all at once.

**Empty State**
- When no canvas exists yet, show a centered prompt: "Type a problem or concept in the chat to get started."

### Right Column — The Chat Panel (~400px fixed width)

The command line for the entire product.

**Components**
- Header: "AI Co-Pilot"
- Scrollable message thread
  - User messages: right-aligned, blue background
  - AI messages: left-aligned, gray background
- Input bar pinned at bottom with placeholder: "Paste a problem or ask me to explain a concept..."
- Send button (and Enter-to-send)
- Three-dot typing indicator while Claude is streaming

**Chat Philosophy**
- The chat produces canvas content. It does not produce long explanations that live only in the chat thread.
- AI chat responses are short confirmations: "Here's the derivation — 6 steps loaded onto your canvas."
- The canvas is the deliverable. The chat is the command line.

---

## 5. Two Types of Inputs

The chat handles two kinds of requests, and the AI classifies each automatically:

### Problem Input
User pastes or types a specific problem to solve or derive.
- "Derive the work-energy theorem from Newton's second law."
- "Solve for x: 3x² + 5x - 2 = 0"
- "Prove that the square root of 2 is irrational."

→ AI generates a **Problem Canvas** with numbered steps walking through the solution.

### Concept Input
User asks for an explanation of a concept, pattern, or framework.
- "Explain the chain rule in calculus."
- "What is quantum tunneling?"
- "How does photosynthesis work?"

→ AI generates a **Concept Canvas** with numbered steps covering definition, intuition, formal framework, and application.

Both canvas types use the exact same visual structure (numbered step cards). The only difference is the content pattern inside each step.

---

## 6. The Accordion (Follow-Up Clarifications)

When the user asks a follow-up question about a specific step, the AI injects an accordion under that step.

**Behavior**
- User types something like "Explain step 2 more" or "I'm stuck on the integral in step 2."
- AI identifies which step the question is about.
- AI generates a clarification and injects it as a collapsed accordion under that step.
- AI responds in chat with a short confirmation: "I've added a breakdown under step 2."
- User clicks the accordion to expand and read the clarification.

**Accordion Content**
- A descriptive label visible when collapsed (e.g., "Breaking down the integral")
- Sub-steps in the same numbered format as the canvas
- Inline LaTeX math and display formulas

**Accordion Constraints**
- Accordions do not nest (no accordions inside accordions).
- Multiple accordions can exist under a single step.
- Accordions persist for the current session but are not saved.

---

## 7. Design Principles

- **No walls of text.** Every piece of content is numbered steps.
- **Chat drives the canvas.** Long explanations belong on the canvas, not in the chat thread.
- **Math is first-class.** Every formula renders cleanly with KaTeX.
- **Progressive streaming.** Step cards appear one by one as Claude generates them.
- **The AI narrates its actions.** When it injects an accordion, it says so in the chat.
- **Minimalist chrome.** Calm workspace feel. Muted palette, generous whitespace, no decorative elements.

---

## 8. Success Criteria for V1

V1 is done when a user can:

1. Type "Derive the work-energy theorem" in the chat.
2. Watch a clean step-by-step canvas stream in with numbered steps and rendered math.
3. Type "Explain step 3 in more detail."
4. See an accordion expand under step 3 with a deeper breakdown.
5. Close the browser and walk away feeling like they learned something.

If all five work consistently across ten different problems and concepts, V1 ships.
