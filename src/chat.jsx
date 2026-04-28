/* Chat panel — message thread + input with image drag-drop / paste / file pick */

function ChatHeader({ isStreaming }) {
  return (
    <div className="chat-header">
      <div className="chat-header-main">
        <span className="chat-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path d="M6 6 L11 17 L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 6 L17.5 8.5 M16 6 L13 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
        </span>
        <div>
          <h3>Co-Pilot</h3>
          <span className="chat-sub">
            <span className={"live-dot" + (isStreaming ? " thinking" : "")} />
            {isStreaming ? "Thinking…" : "Ready when you are"}
          </span>
        </div>
      </div>
      <button className="chat-header-btn" title="Chat settings">
        <window.Icon name="more-horizontal" size={16} />
      </button>
    </div>
  );
}

function Message({ msg, outlinedUser }) {
  const isUser = msg.role === "user";
  return (
    <div className={"msg-row " + (isUser ? "user" : "ai")}>
      <div className={"bubble " + (isUser ? "user" : "ai") + (isUser && outlinedUser ? " outlined" : "") + (isUser ? " user-bubble" : "")}>
        {msg.images && msg.images.length > 0 && (
          <div className="imgs">
            {msg.images.map((src, i) => <img key={i} src={src} alt="attached" />)}
          </div>
        )}
        {isUser ? <span>{msg.content}</span> : <window.MathHTML html={window.renderInlineMath(msg.content)} />}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="msg-row ai">
      <div className="typing-bubble">
        <span className="dot" /><span className="dot" /><span className="dot" />
      </div>
    </div>
  );
}

function ChatInput({ disabled, onSend, seedText, onSeedUsed }) {
  const [text, setText] = React.useState("");
  const [images, setImages] = React.useState([]); // array of data URLs
  const [dragging, setDragging] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const taRef = React.useRef(null);
  const fileRef = React.useRef(null);

  React.useEffect(() => {
    if (seedText) {
      setText(seedText);
      onSeedUsed && onSeedUsed();
      setTimeout(() => taRef.current && taRef.current.focus(), 10);
    }
  }, [seedText]);

  const autoSize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  React.useEffect(autoSize, [text]);

  const addImageFiles = (files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    arr.forEach((f) => {
      const r = new FileReader();
      r.onload = (e) => setImages((prev) => [...prev, e.target.result]);
      r.readAsDataURL(f);
    });
  };

  const handleSend = () => {
    if (disabled) return;
    if (!text.trim() && images.length === 0) return;
    onSend({ content: text.trim(), images });
    setText("");
    setImages([]);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onPaste = (e) => {
    const items = e.clipboardData?.items || [];
    let had = false;
    for (const it of items) {
      if (it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) { addImageFiles([f]); had = true; }
      }
    }
    if (had) e.preventDefault();
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer?.files?.length) addImageFiles(e.dataTransfer.files);
  };

  const canSend = !disabled && (text.trim().length > 0 || images.length > 0);

  return (
    <div className="chat-input-wrap">
      <div
        className={
          "chat-input-box" +
          (dragging ? " dragging" : "") +
          (focused ? " focused" : "") +
          (disabled ? " disabled" : "")
        }
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{ position: "relative" }}
      >
        {images.length > 0 && (
          <div className="input-thumbs">
            {images.map((src, i) => (
              <div className="input-thumb" key={i}>
                <img src={src} alt="" />
                <button
                  className="thumb-x"
                  onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                  aria-label="Remove image"
                >
                  <window.Icon name="x" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <textarea
          ref={taRef}
          className="no-scrollbar"
          rows={1}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          onPaste={onPaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={dragging ? "Drop image here…" : (disabled ? "Generating…" : "Ask anything…")}
        />
        <div className="input-toolbar">
          <div className="tool-group">
            <button
              className="tool-btn"
              onClick={() => fileRef.current && fileRef.current.click()}
              aria-label="Attach image"
              disabled={disabled}
            >
              <window.Icon name="image-plus" size={17} />
            </button>
            <button className="tool-btn" aria-label="Mention a step" disabled={disabled}>
              <window.Icon name="at-sign" size={17} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => { addImageFiles(e.target.files); e.target.value = ""; }}
            />
          </div>
          <button
            className="send-btn"
            disabled={!canSend}
            onClick={handleSend}
            aria-label="Send"
          >
            <window.Icon name="arrow-up" size={16} />
          </button>
        </div>
        {dragging && (
          <div className="drag-hint">
            <window.Icon name="image-down" size={18} /> Drop image to attach
          </div>
        )}
      </div>
    </div>
  );
}

function ChatPanel({ messages, isStreaming, onSend, seedText, onSeedUsed, outlinedUser }) {
  const threadRef = React.useRef(null);

  React.useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length, isStreaming]);

  return (
    <div className="chat">
      <ChatHeader isStreaming={isStreaming} />
      <div className="chat-thread scroll-y" ref={threadRef}>
        {messages.length === 0 && (
          <div className="chat-intro">
            Start by describing a problem or concept.<br />
            Press <span className="kbd">Enter</span> to send, <span className="kbd">Shift</span>+<span className="kbd">Enter</span> for newline.
          </div>
        )}
        {messages.map((m) => <Message key={m.id} msg={m} outlinedUser={outlinedUser} />)}
        {isStreaming && <TypingBubble />}
      </div>
      <ChatInput
        disabled={isStreaming}
        onSend={onSend}
        seedText={seedText}
        onSeedUsed={onSeedUsed}
      />
    </div>
  );
}

window.ChatPanel = ChatPanel;
