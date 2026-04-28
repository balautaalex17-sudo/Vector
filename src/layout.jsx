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
