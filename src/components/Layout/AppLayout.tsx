import { useEffect, useRef, useState, type ReactNode } from "react";

function useResizable(initialSidebar = 18, initialChat = 26) {
  const [sidebarPct, setSidebarPct] = useState(initialSidebar);
  const [chatPct, setChatPct] = useState(initialChat);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<"left" | "right" | null>(null);

  const onMouseDown =
    (which: "left" | "right") =>
    (e: React.MouseEvent) => {
      e.preventDefault();
      draggingRef.current = which;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const total = rect.width;
      if (draggingRef.current === "left") {
        const x = e.clientX - rect.left;
        setSidebarPct(Math.max(12, Math.min(34, (x / total) * 100)));
      } else {
        const rightX = rect.right - e.clientX;
        setChatPct(Math.max(18, Math.min(40, (rightX / total) * 100)));
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

  return { containerRef, sidebarPct, chatPct, onMouseDown };
}

export type AppLayoutProps = {
  sidebar: ReactNode;
  chat: ReactNode;
  children: ReactNode;
  focusMode?: boolean;
  densityCompact?: boolean;
  themeDark?: boolean;
  accent?: string;
};

export function AppLayout({
  sidebar,
  chat,
  children,
  focusMode,
  densityCompact,
  themeDark,
  accent,
}: AppLayoutProps) {
  const { containerRef, sidebarPct, chatPct, onMouseDown } = useResizable();
  const [dragging, setDragging] = useState<"left" | "right" | null>(null);

  useEffect(() => {
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
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={appCls} ref={containerRef}>
      <div
        className="panel left"
        style={{ width: focusMode ? 0 : `${sidebarPct}%` }}
      >
        {sidebar}
      </div>
      <div
        className={"resizer left-resizer" + (dragging === "left" ? " dragging" : "")}
        onMouseDown={(e) => {
          onMouseDown("left")(e);
          setDragging("left");
        }}
      >
        <div className="handle-pill">
          <span className="handle-dot" />
          <span className="handle-dot" />
          <span className="handle-dot" />
        </div>
      </div>
      <div className="panel center" style={{ flex: 1 }}>
        <div className="center-wrap">{children}</div>
      </div>
      <div
        className={"resizer right-resizer" + (dragging === "right" ? " dragging" : "")}
        onMouseDown={(e) => {
          onMouseDown("right")(e);
          setDragging("right");
        }}
      >
        <div className="handle-pill">
          <span className="handle-dot" />
          <span className="handle-dot" />
          <span className="handle-dot" />
        </div>
      </div>
      <div className="panel right" style={{ width: `${chatPct}%` }}>
        {chat}
      </div>
    </div>
  );
}
