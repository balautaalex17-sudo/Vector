import type { ChatMessage } from "../../lib/schemas";
import { InlineMath } from "../Math";

export function Message({
  msg,
  outlinedUser,
}: {
  msg: ChatMessage;
  outlinedUser?: boolean;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={"msg-row " + (isUser ? "user" : "ai")}>
      <div
        className={
          "bubble " +
          (isUser ? "user" : "ai") +
          (isUser && outlinedUser ? " outlined" : "") +
          (isUser ? " user-bubble" : "")
        }
      >
        {msg.images && msg.images.length > 0 && (
          <div className="imgs">
            {msg.images.map((src, i) => (
              <img key={i} src={src} alt="attached" />
            ))}
          </div>
        )}
        {isUser ? <span>{msg.content}</span> : <InlineMath text={msg.content} />}
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="msg-row ai">
      <div className="typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}
