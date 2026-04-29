import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Search,
  Settings,
  Settings2,
} from "lucide-react";

type TreeRowProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  hasChildren?: boolean;
  open?: boolean;
  onClick?: () => void;
};

function TreeRow({ icon, label, active, hasChildren, open, onClick }: TreeRowProps) {
  return (
    <div
      className={"tree-row" + (active ? " active" : "") + (open ? " open" : "")}
      onClick={onClick}
    >
      {hasChildren ? (
        open ? (
          <ChevronDown size={14} className="chev" />
        ) : (
          <ChevronRight size={14} className="chev" />
        )
      ) : (
        <span style={{ width: 14, height: 14, flexShrink: 0 }} />
      )}
      <span className="icon-leaf" style={{ display: "inline-flex" }}>
        {icon}
      </span>
      <span className="tree-label">{label}</span>
    </div>
  );
}

export type SidebarPlaceholderProps = {
  onHomeClick?: () => void;
  activeDoc?: string | null;
};

export function SidebarPlaceholder({
  onHomeClick,
  activeDoc,
}: SidebarPlaceholderProps) {
  const [open, setOpen] = useState({
    notebooks: true,
    classical: true,
    quantum: false,
    thermo: false,
    math: false,
    cs: false,
  });
  const toggle = (k: keyof typeof open) =>
    setOpen((o) => ({ ...o, [k]: !o[k] }));

  const leaf = (key: string, label: string, isActive: boolean) => (
    <div key={key}>
      <div
        className={"tree-row" + (isActive ? " active" : "")}
        onClick={() => isActive && onHomeClick && onHomeClick()}
      >
        <span style={{ width: 14, height: 14, flexShrink: 0 }} />
        <FileText size={15} className="icon-leaf" />
        <span className="tree-label">{label}</span>
      </div>
      {isActive && (
        <div className="tree-active-sub">
          <Settings2 size={12} />
          <span>Problem Canvas</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="chat" style={{ background: "var(--bg-card)" }}>
      <div className="sidebar-logo">
        <span
          className="icon-wrap"
          aria-hidden="true"
          style={{ width: 28, height: 28 }}
        >
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
            <g transform="translate(7, 3.5)">
              <path
                d="M 2 8 C 4 8 5 11 6 15 L 9 24 L 14 8 C 15 6 15 6 18 6 L 18 7 C 17 7 16 8 15 10 L 10 24.5 L 8 24.5 L 3 10 C 2.5 8 1.5 8 0 8 Z"
                fill="var(--accent-ink)"
              />
              <path
                d="M 4 2 L 16 2"
                stroke="var(--accent-ink)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M 12 -1 L 16 2 L 12 5"
                fill="none"
                stroke="var(--accent-ink)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </span>
        <span className="wordmark">Vector</span>
      </div>

      <div className="sidebar-search">
        <Search size={16} className="search-icon" />
        <input disabled placeholder="Search notebooks…" />
      </div>

      <div className="sidebar-tree scroll-y">
        <TreeRow
          icon={<Folder size={15} />}
          label="Notebooks"
          hasChildren
          open={open.notebooks}
          onClick={() => toggle("notebooks")}
        />
        {open.notebooks && (
          <div className="tree-children" style={{ maxHeight: 4000 }}>
            <TreeRow
              icon={<Folder size={15} />}
              label="Physics (Classical Mechanics)"
              hasChildren
              open={open.classical}
              onClick={() => toggle("classical")}
            />
            {open.classical && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf(
                  "we",
                  activeDoc || "Work–Energy Theorem Derivation",
                  true,
                )}
                {leaf("newton", "Newton's Laws — Notes", false)}
                {leaf("pendulum", "Simple Pendulum", false)}
                {leaf("lagrange", "Lagrangian Mechanics", false)}
              </div>
            )}

            <TreeRow
              icon={<Folder size={15} />}
              label="Quantum Mechanics"
              hasChildren
              open={open.quantum}
              onClick={() => toggle("quantum")}
            />
            {open.quantum && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("sch", "Schrödinger Equation", false)}
                {leaf("hydro", "Hydrogen Atom", false)}
                {leaf("spin", "Spin ½ Systems", false)}
              </div>
            )}

            <TreeRow
              icon={<Folder size={15} />}
              label="Thermodynamics"
              hasChildren
              open={open.thermo}
              onClick={() => toggle("thermo")}
            />
            {open.thermo && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("ent", "Entropy — first look", false)}
                {leaf("carnot", "Carnot Cycle", false)}
              </div>
            )}

            <TreeRow
              icon={<Folder size={15} />}
              label="Math"
              hasChildren
              open={open.math}
              onClick={() => toggle("math")}
            />
            {open.math && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("fourier", "Fourier Transform", false)}
                {leaf("linalg", "Linear Algebra recap", false)}
              </div>
            )}

            <TreeRow
              icon={<Folder size={15} />}
              label="Computer Science"
              hasChildren
              open={open.cs}
              onClick={() => toggle("cs")}
            />
            {open.cs && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("qs", "Quicksort", false)}
                {leaf("graphs", "Graph Algorithms", false)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="avatar">U</div>
        <div className="sign-label">Sign in / Sign up</div>
        <Settings size={18} className="gear" />
      </div>
    </div>
  );
}
