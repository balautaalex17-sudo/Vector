/* Main app — state machine + composition */

const { useState, useEffect, useRef, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "default",
  "dark": false,
  "compact": false,
  "focus": false,
  "outlinedUser": false
}/*EDITMODE-END*/;

function useVectorChat() {
  const [canvas, setCanvas] = useState(null);
  const [accordions, setAccordions] = useState({}); // stepNumber -> Accordion[]
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStep, setStreamingStep] = useState(0);
  const msgIdRef = useRef(1);

  const nextId = () => `msg-${msgIdRef.current++}`;

  const pushUser = (content, images) => {
    setMessages((m) => [...m, { id: nextId(), role: "user", content, images }]);
  };
  const pushAI = (content) => {
    setMessages((m) => [...m, { id: nextId(), role: "assistant", content }]);
  };

  // Simulated LLM: delay + canvas/accordion population
  const simulateFirstCanvas = async (text) => {
    setIsStreaming(true);
    await wait(650);
    const c = window.pickCanvas(text);
    setCanvas(c);
    // Reveal steps one by one for the streaming effect
    setStreamingStep(1);
    for (let i = 2; i <= c.steps.length; i++) {
      await wait(550 + Math.random() * 250);
      setStreamingStep(i);
    }
    await wait(350);
    setIsStreaming(false);
    pushAI(`Here's the breakdown — **${c.steps.length} steps** loaded onto your canvas.`);
  };

  const simulateAccordion = async (text) => {
    setIsStreaming(true);
    await wait(700 + Math.random() * 400);
    const acc = window.pickAccordion(text, canvas?.steps?.length || 1);
    setAccordions((prev) => {
      const arr = prev[acc.targetStepNumber] ? [...prev[acc.targetStepNumber]] : [];
      arr.push({ label: acc.label, content: acc.content });
      return { ...prev, [acc.targetStepNumber]: arr };
    });
    setIsStreaming(false);
    pushAI(`I've added a breakdown under step ${acc.targetStepNumber}.`);
  };

  const sendMessage = async ({ content, images }) => {
    if (!content && (!images || images.length === 0)) return;
    pushUser(content, images);
    if (!canvas) await simulateFirstCanvas(content);
    else await simulateAccordion(content);
  };

  const resetCanvas = () => {
    setCanvas(null);
    setAccordions({});
    setStreamingStep(0);
  };

  return { canvas, accordions, messages, isStreaming, streamingStep, sendMessage, resetCanvas };
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

function SegmentedToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle">
      <div className="segment">
        <button
          className={"seg-btn" + (mode === "derivation" ? " active" : "")}
          onClick={() => onChange("derivation")}
        >
          <window.Icon name="file-text" size={15} />
          Derivation Mode
        </button>
        <button
          className={"seg-btn" + (mode === "practice" ? " active" : "")}
          onClick={() => onChange("practice")}
          title="Practice mode — coming soon"
        >
          <window.Icon name="target" size={15} />
          Practice Mode
        </button>
      </div>
    </div>
  );
}

function PracticePlaceholder() {
  return (
    <div className="canvas-outer scroll-y">
      <div className="canvas-card">
        <div className="canvas-empty">
          <div className="icon-badge"><window.Icon name="target" size={24} strokeWidth={1.6} /></div>
          <h2>Practice Mode is coming</h2>
          <p>Solve guided problems with live hints. Ping your canvas-mate when you get stuck.</p>
        </div>
      </div>
    </div>
  );
}

function TopBar({ canvas, onReset, onTweaks }) {
  return (
    <div className="center-topbar">
      <div className="breadcrumb">
        <span className="crumb" onClick={onReset}>
          <window.Icon name="folder" size={13} />
          Physics 201
        </span>
        <span className="sep">/</span>
        <span className="crumb current">
          <window.Icon name="file-text" size={13} />
          {canvas ? canvas.title : "Untitled canvas"}
        </span>
      </div>
      <div className="topbar-actions">
        <button className="topbar-btn" title="Undo"><window.Icon name="undo-2" /></button>
        <button className="topbar-btn" title="History"><window.Icon name="history" /></button>
        <button className="topbar-btn" title="Export"><window.Icon name="download" /></button>
        <button className="topbar-btn" onClick={onTweaks} title="Tweaks"><window.Icon name="sliders-horizontal" /></button>
        <button className="topbar-share"><window.Icon name="share-2" />Share</button>
      </div>
    </div>
  );
}

function App() {
  const v = useVectorChat();
  const [seedText, setSeedText] = useState("");
  const [tweaksVisible, setTweaksVisible] = window.useEditModeBridge();
  const [tweaks, setTweaks] = useState(() => {
    try { return JSON.parse(JSON.stringify(TWEAK_DEFAULTS)); } catch (e) { return TWEAK_DEFAULTS; }
  });

  // Persist tweaks
  useEffect(() => {
    try {
      window.parent && window.parent.postMessage({ type: "__edit_mode_set_keys", edits: tweaks }, "*");
    } catch (e) {}
  }, [tweaks]);

  const onPromptPick = (t) => setSeedText(t);

  return (
    <window.AppLayout
      focusMode={tweaks.focus}
      densityCompact={tweaks.compact}
      themeDark={tweaks.dark}
      accent={tweaks.accent}
      sidebar={<window.SidebarPlaceholder onHomeClick={v.resetCanvas} activeDoc={v.canvas?.title} />}
      chat={
        <window.ChatPanel
          messages={v.messages}
          isStreaming={v.isStreaming}
          onSend={v.sendMessage}
          seedText={seedText}
          onSeedUsed={() => setSeedText("")}
          outlinedUser={tweaks.outlinedUser}
        />
      }
    >
      <TopBar canvas={v.canvas} onReset={v.resetCanvas} onTweaks={() => setTweaksVisible((x) => !x)} />
      <window.Canvas
        canvas={v.canvas}
        accordions={v.accordions}
        isStreaming={v.isStreaming}
        streamingStep={v.streamingStep}
        onPromptPick={onPromptPick}
      />

      {tweaksVisible && (
        <window.TweaksPanel
          tweaks={tweaks}
          setTweaks={setTweaks}
          onClose={() => setTweaksVisible(false)}
        />
      )}
    </window.AppLayout>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
