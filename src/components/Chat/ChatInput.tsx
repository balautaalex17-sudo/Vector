import { useEffect, useRef, useState } from "react";
import { ArrowUp, AtSign, ImageDown, ImagePlus, X } from "lucide-react";

const MAX_INPUT_LENGTH = 4000;

export type ChatInputProps = {
  disabled?: boolean;
  onSend: (payload: { content: string; images: string[] }) => void;
  onAbort?: () => void;
  seedText?: string;
  onSeedUsed?: () => void;
};

export function ChatInput({
  disabled,
  onSend,
  onAbort,
  seedText,
  onSeedUsed,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (seedText) {
      setText(seedText);
      onSeedUsed && onSeedUsed();
      setTimeout(() => taRef.current && taRef.current.focus(), 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedText]);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [text]);

  const addImageFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    arr.forEach((f) => {
      const r = new FileReader();
      r.onload = (e) =>
        setImages((prev) => [...prev, String(e.target?.result || "")]);
      r.readAsDataURL(f);
    });
  };

  const handleSend = () => {
    if (disabled) return;
    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;
    onSend({ content: trimmed.slice(0, MAX_INPUT_LENGTH), images });
    setText("");
    setImages([]);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items || [];
    let had = false;
    for (const it of items) {
      if (it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) {
          addImageFiles([f]);
          had = true;
        }
      }
    }
    if (had) e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
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
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
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
                  onClick={() =>
                    setImages((p) => p.filter((_, idx) => idx !== i))
                  }
                  aria-label="Remove image"
                >
                  <X size={12} />
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
          maxLength={MAX_INPUT_LENGTH}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          onPaste={onPaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            dragging
              ? "Drop image here…"
              : disabled
                ? "Generating…"
                : "Ask anything…"
          }
        />
        <div className="input-toolbar">
          <div className="tool-group">
            <button
              className="tool-btn"
              onClick={() => fileRef.current && fileRef.current.click()}
              aria-label="Attach image"
              disabled={disabled}
            >
              <ImagePlus size={17} />
            </button>
            <button
              className="tool-btn"
              aria-label="Mention a step"
              disabled={disabled}
            >
              <AtSign size={17} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files) addImageFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {disabled && onAbort ? (
            <button
              className="send-btn"
              onClick={onAbort}
              aria-label="Stop generating"
              title="Stop"
              style={{ background: "var(--slate-300)" }}
            >
              <X size={14} />
            </button>
          ) : (
            <button
              className="send-btn"
              disabled={!canSend}
              onClick={handleSend}
              aria-label="Send"
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
        {dragging && (
          <div className="drag-hint">
            <ImageDown size={18} /> Drop image to attach
          </div>
        )}
      </div>
    </div>
  );
}
