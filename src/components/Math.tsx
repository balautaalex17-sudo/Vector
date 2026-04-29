import { renderInlineMath, renderMath, cleanFormula } from "../lib/math";

export function InlineMath({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderInlineMath(text) }}
    />
  );
}

export function DisplayFormula({
  expr,
  className = "step-formula",
}: {
  expr: string;
  className?: string;
}) {
  const html = renderMath(cleanFormula(expr), true);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
