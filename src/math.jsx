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
