import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import { sendChat } from "../api/client";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const reply = await sendChat(nextMessages);
      setMessages([...nextMessages, reply]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <h2>Ask about US history</h2>
            <p>Try: &quot;Who was the first US president?&quot;</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <MessageBubble key={index} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className="message-row assistant">
            <div className="message-bubble loading-bubble">
              <span className="message-label">Historian</span>
              <p className="typing">Thinking…</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about US history…"
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
