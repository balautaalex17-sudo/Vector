export type Tweaks = {
  accent: string;
  dark: boolean;
  compact: boolean;
  focus: boolean;
  outlinedUser: boolean;
};

const ACCENTS = [
  { id: "default", label: "Blue", color: "#D0E2FF" },
  { id: "violet", label: "Violet", color: "#E4DBFF" },
  { id: "sage", label: "Sage", color: "#D9EEDA" },
  { id: "warm", label: "Warm", color: "#FFE1CD" },
];

export function TweaksPanel({
  tweaks,
  setTweaks,
}: {
  tweaks: Tweaks;
  setTweaks: (updater: (t: Tweaks) => Tweaks) => void;
  onClose?: () => void;
}) {
  const set = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) =>
    setTweaks((t) => ({ ...t, [k]: v }));

  return (
    <div className="tweaks-panel">
      <h4>Accent</h4>
      <div className="tweak-grid">
        {ACCENTS.map((a) => (
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
      <div
        className={"tweak-switch" + (tweaks.compact ? " on" : "")}
        onClick={() => set("compact", !tweaks.compact)}
      >
        <span>Compact canvas</span>
        <span className="track" />
      </div>
      <div
        className={"tweak-switch" + (tweaks.focus ? " on" : "")}
        onClick={() => set("focus", !tweaks.focus)}
      >
        <span>Focus mode (hide sidebar)</span>
        <span className="track" />
      </div>
      <div
        className={"tweak-switch" + (tweaks.outlinedUser ? " on" : "")}
        onClick={() => set("outlinedUser", !tweaks.outlinedUser)}
      >
        <span>Outlined user bubble</span>
        <span className="track" />
      </div>
    </div>
  );
}
