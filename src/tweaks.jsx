/* Tweaks panel — toggled by host edit-mode messaging */

function TweaksPanel({ tweaks, setTweaks, onClose }) {
  const set = (k, v) => setTweaks((t) => ({ ...t, [k]: v }));

  const accents = [
    { id: "default", label: "Blue",   color: "#D0E2FF" },
    { id: "violet",  label: "Violet", color: "#E4DBFF" },
    { id: "sage",    label: "Sage",   color: "#D9EEDA" },
    { id: "warm",    label: "Warm",   color: "#FFE1CD" },
  ];

  return (
    <div className="tweaks-panel">
      <h4>Accent</h4>
      <div className="tweak-grid">
        {accents.map((a) => (
          <button
            key={a.id}
            className={"tweak-chip" + (tweaks.accent === a.id ? " active" : "")}
            onClick={() => set("accent", a.id)}
          >
            <span className="swatch" style={{ background: a.color }} />
            {a.label}
          </button>
        ))}
      </div>

      <h4>Theme</h4>
      <div className="tweak-grid">
        <button
          className={"tweak-chip" + (!tweaks.dark ? " active" : "")}
          onClick={() => set("dark", false)}
        >
          Light
        </button>
        <button
          className={"tweak-chip" + (tweaks.dark ? " active" : "")}
          onClick={() => set("dark", true)}
        >
          Dark
        </button>
      </div>

      <h4>Layout</h4>
      <div className={"tweak-switch" + (tweaks.compact ? " on" : "")} onClick={() => set("compact", !tweaks.compact)}>
        <span>Compact canvas</span>
        <span className="track" />
      </div>
      <div className={"tweak-switch" + (tweaks.focus ? " on" : "")} onClick={() => set("focus", !tweaks.focus)}>
        <span>Focus mode (hide sidebar)</span>
        <span className="track" />
      </div>
      <div className={"tweak-switch" + (tweaks.outlinedUser ? " on" : "")} onClick={() => set("outlinedUser", !tweaks.outlinedUser)}>
        <span>Outlined user bubble</span>
        <span className="track" />
      </div>
    </div>
  );
}

// Host edit-mode bridge
function useEditModeBridge() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setVisible(true);
      if (d.type === "__deactivate_edit_mode") setVisible(false);
    };
    window.addEventListener("message", onMsg);
    try {
      window.parent && window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    } catch (e) {}
    return () => window.removeEventListener("message", onMsg);
  }, []);
  return [visible, setVisible];
}

window.TweaksPanel = TweaksPanel;
window.useEditModeBridge = useEditModeBridge;
