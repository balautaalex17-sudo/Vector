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
