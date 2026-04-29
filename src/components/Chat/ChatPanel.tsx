import { useEffect, useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import type { ChatMessage } from "../../lib/schemas";
import { Message, TypingBubble } from "./Message";
import { ChatInput } from "./ChatInput";

function ChatHeader({ isStreaming }: { isStreaming: boolean }) {
  return (
    <div className="chat-header">
      <div className="chat-header-main">
        <span className="chat-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <path
              d="M6 6 L11 17 L16 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 6 L17.5 8.5 M16 6 L13 7"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div>
          <h3>Co-Pilot</h3>
          <span className="chat-sub">
            {isStreaming ? "working…" : "⌘K to ask"}
          </span>
        </div>
      </div>
      <button className="chat-header-btn" title="Chat settings">
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
}

export type ChatPanelProps = {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (payload: { content: string; images: string[] }) => void;
  onAbort?: () => void;
  seedText?: string;
  onSeedUsed?: () => void;
  outlinedUser?: boolean;
};

export function ChatPanel({
  messages,
  isStreaming,
  onSend,
  onAbort,
  seedText,
  onSeedUsed,
  outlinedUser,
}: ChatPanelProps) {
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({
        top: threadRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, isStreaming]);

  return (
    <div className="chat">
      <ChatHeader isStreaming={isStreaming} />
      <div className="chat-thread scroll-y" ref={threadRef}>
        {messages.length === 0 && (
          <div className="chat-intro">
            Start by describing a problem or concept.
            <br />
            Press <span className="kbd">Enter</span> to send,{" "}
            <span className="kbd">Shift</span>+<span className="kbd">Enter</span>{" "}
            for newline.
          </div>
        )}
        {messages.map((m) => (
          <Message key={m.id} msg={m} outlinedUser={outlinedUser} />
        ))}
        {isStreaming && <TypingBubble />}
      </div>
      <ChatInput
        disabled={isStreaming}
        onSend={onSend}
        onAbort={onAbort}
        seedText={seedText}
        onSeedUsed={onSeedUsed}
      />
    </div>
  );
}
