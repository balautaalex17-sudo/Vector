import katex from "katex";

export function normalizeMathDelimiters(text: string): string {
  if (!text) return text;
  return text
    .replace(/\\\((.*?)\\\)/g, "$$$1$$")
    .replace(/\\\[([\s\S]*?)\\\]/g, "$$$$$1$$$$");
}

export function renderMath(expr: string, displayMode = false): string {
  try {
    return katex.renderToString(expr, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
    });
  } catch {
    return `<code>${escapeHtml(expr)}</code>`;
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Render text containing $...$ inline and $$...$$ display math.
// Caller is responsible for the surrounding markup; output is raw HTML.
export function renderInlineMath(text: string): string {
  if (!text) return "";
  const normalized = normalizeMathDelimiters(text);
  let out = normalized.replace(/\$\$([^$]+)\$\$/g, (_, m: string) =>
    renderMath(m, true),
  );
  out = out.replace(/\$([^$\n]+)\$/g, (_, m: string) => renderMath(m, false));
  return out;
}

// Strip stray $ wrappers that Claude sometimes puts inside the formula field.
export function cleanFormula(expr: string): string {
  if (!expr) return expr;
  let s = expr.trim();
  if (s.startsWith("$$") && s.endsWith("$$")) s = s.slice(2, -2);
  else if (s.startsWith("$") && s.endsWith("$")) s = s.slice(1, -1);
  return s.trim();
}
