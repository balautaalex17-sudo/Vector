/* Sidebar — notebook tree with expand/collapse */

function TreeRow({ icon, label, active, hasChildren, open, depth = 0, onClick, subtitle }) {
  return (
    <div
      className={"tree-row" + (active ? " active" : "") + (open ? " open" : "")}
      onClick={onClick}
      style={{ marginLeft: depth * 2 }}
    >
      {hasChildren ? (
        <window.Icon name={open ? "chevron-down" : "chevron-right"} size={14} className="chev" />
      ) : (
        <span style={{ width: 14, height: 14, flexShrink: 0 }} />
      )}
      <window.Icon name={icon} size={15} className="icon-leaf" />
      <span className="tree-label">{label}</span>
      {subtitle && <span className="sr-only">{subtitle}</span>}
    </div>
  );
}

function SidebarPlaceholder({ onHomeClick, activeDoc }) {
  const [open, setOpen] = React.useState({
    notebooks: true,
    physics: true,
    classical: true,
    quantum: false,
    thermo: false,
    math: false,
    cs: false,
  });
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const leaf = (key, icon, label, isActive) => (
    <div key={key}>
      <div
        className={"tree-row" + (isActive ? " active" : "")}
        onClick={() => isActive && onHomeClick && onHomeClick()}
      >
        <span style={{ width: 14, height: 14, flexShrink: 0 }} />
        <window.Icon name={icon} size={15} className="icon-leaf" />
        <span className="tree-label">{label}</span>
      </div>
      {isActive && (
        <div className="tree-active-sub">
          <window.Icon name="settings-2" size={12} />
          <span>Problem Canvas</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="chat" style={{ background: "var(--bg-card)" }}>
      <div className="sidebar-logo">
        <span className="icon-wrap" aria-hidden="true" style={{ width: 28, height: 28 }}>
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(7, 3.5)">
              <path d="M 2 8 C 4 8 5 11 6 15 L 9 24 L 14 8 C 15 6 15 6 18 6 L 18 7 C 17 7 16 8 15 10 L 10 24.5 L 8 24.5 L 3 10 C 2.5 8 1.5 8 0 8 Z" fill="var(--accent-ink)"/>
              <path d="M 4 2 L 16 2" stroke="var(--accent-ink)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M 12 -1 L 16 2 L 12 5" fill="none" stroke="var(--accent-ink)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
          </svg>
        </span>
        <span className="wordmark">Vector</span>
      </div>

      <div className="sidebar-search">
        <window.Icon name="search" size={16} className="search-icon" />
        <input disabled placeholder="Search notebooks…" />
      </div>

      <div className="sidebar-tree scroll-y">
        <TreeRow
          icon="folder"
          label="Notebooks"
          hasChildren
          open={open.notebooks}
          onClick={() => toggle("notebooks")}
        />
        {open.notebooks && (
          <div className="tree-children" style={{ maxHeight: 4000 }}>
            <TreeRow
              icon="folder"
              label="Physics (Classical Mechanics)"
              hasChildren
              open={open.classical}
              onClick={() => toggle("classical")}
            />
            {open.classical && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("we", "file-text", activeDoc || "Work–Energy Theorem Derivation", true)}
                {leaf("newton", "file-text", "Newton's Laws — Notes", false)}
                {leaf("pendulum", "file-text", "Simple Pendulum", false)}
                {leaf("lagrange", "file-text", "Lagrangian Mechanics", false)}
              </div>
            )}

            <TreeRow
              icon="folder"
              label="Quantum Mechanics"
              hasChildren
              open={open.quantum}
              onClick={() => toggle("quantum")}
            />
            {open.quantum && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("sch", "file-text", "Schrödinger Equation", false)}
                {leaf("hydro", "file-text", "Hydrogen Atom", false)}
                {leaf("spin", "file-text", "Spin ½ Systems", false)}
              </div>
            )}

            <TreeRow
              icon="folder"
              label="Thermodynamics"
              hasChildren
              open={open.thermo}
              onClick={() => toggle("thermo")}
            />
            {open.thermo && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("ent", "file-text", "Entropy — first look", false)}
                {leaf("carnot", "file-text", "Carnot Cycle", false)}
              </div>
            )}

            <TreeRow
              icon="folder"
              label="Math"
              hasChildren
              open={open.math}
              onClick={() => toggle("math")}
            />
            {open.math && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("fourier", "file-text", "Fourier Transform", false)}
                {leaf("linalg", "file-text", "Linear Algebra recap", false)}
              </div>
            )}

            <TreeRow
              icon="folder"
              label="Computer Science"
              hasChildren
              open={open.cs}
              onClick={() => toggle("cs")}
            />
            {open.cs && (
              <div className="tree-children" style={{ maxHeight: 4000 }}>
                {leaf("qs", "file-text", "Quicksort", false)}
                {leaf("graphs", "file-text", "Graph Algorithms", false)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="avatar">U</div>
        <div className="sign-label">Sign in / Sign up</div>
        <window.Icon name="settings" size={18} className="gear" />
      </div>
    </div>
  );
}

window.SidebarPlaceholder = SidebarPlaceholder;
