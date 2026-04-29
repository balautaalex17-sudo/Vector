import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  Folder,
  History,
  Share2,
  SlidersHorizontal,
  Undo2,
} from "lucide-react";
import { AppLayout } from "./components/Layout/AppLayout";
import { SidebarPlaceholder } from "./components/Sidebar/SidebarPlaceholder";
import { Canvas } from "./components/Canvas/Canvas";
import { ChatPanel } from "./components/Chat/ChatPanel";
import { TweaksPanel, type Tweaks } from "./components/Tweaks/TweaksPanel";
import { useVectorChat } from "./hooks/useVectorChat";
import { isMockMode } from "./lib/mockLibrary";

const TWEAK_DEFAULTS: Tweaks = {
  accent: "default",
  dark: false,
  compact: false,
  focus: false,
  outlinedUser: false,
};

function TopBar({
  title,
  onReset,
  onTweaks,
}: {
  title: string;
  onReset: () => void;
  onTweaks: () => void;
}) {
  return (
    <div className="center-topbar">
      <div className="breadcrumb">
        <span className="crumb" onClick={onReset}>
          <Folder size={13} />
          Physics 201
        </span>
        <span className="sep">/</span>
        <span className="crumb current">
          <FileText size={13} />
          {title}
        </span>
      </div>
      <div className="topbar-actions">
        <button className="topbar-btn" title="Undo">
          <Undo2 />
        </button>
        <button className="topbar-btn" title="History">
          <History />
        </button>
        <button className="topbar-btn" title="Export">
          <Download />
        </button>
        <button className="topbar-btn" onClick={onTweaks} title="Tweaks">
          <SlidersHorizontal />
        </button>
        <button className="topbar-share">
          <Share2 />
          Share
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const v = useVectorChat();
  const [seedText, setSeedText] = useState("");
  const [tweaksVisible, setTweaksVisible] = useState(false);
  const [tweaks, setTweaks] = useState<Tweaks>(TWEAK_DEFAULTS);

  // Surface mock-mode state once at boot so it shows up in the chat thread.
  useEffect(() => {
    if (isMockMode()) {
      console.info("[vector] running in mock mode (?mock=1)");
    }
  }, []);

  return (
    <AppLayout
      focusMode={tweaks.focus}
      densityCompact={tweaks.compact}
      themeDark={tweaks.dark}
      accent={tweaks.accent}
      sidebar={
        <SidebarPlaceholder
          onHomeClick={v.resetCanvas}
          activeDoc={v.canvas?.title}
        />
      }
      chat={
        <ChatPanel
          messages={v.messages}
          isStreaming={v.isStreaming}
          onSend={v.sendMessage}
          onAbort={v.stop}
          seedText={seedText}
          onSeedUsed={() => setSeedText("")}
          outlinedUser={tweaks.outlinedUser}
        />
      }
    >
      <TopBar
        title={v.canvas ? v.canvas.title : "Untitled canvas"}
        onReset={v.resetCanvas}
        onTweaks={() => setTweaksVisible((x) => !x)}
      />
      <Canvas
        canvas={v.canvas}
        accordions={v.accordions}
        isStreaming={v.isStreaming}
        streamingStep={v.streamingStep}
        onPromptPick={(t) => setSeedText(t)}
      />
      {tweaksVisible && (
        <TweaksPanel
          tweaks={tweaks}
          setTweaks={setTweaks}
          onClose={() => setTweaksVisible(false)}
        />
      )}
    </AppLayout>
  );
}
