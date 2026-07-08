import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import VoiceControls from "./VoiceControls";
import { saveChatMessages, sendChat, uploadAudio } from "../api/client";

export default function ChatWindow({ chatId, messages, onMessagesChange, onChatSaved }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesRef = useRef(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, loading]);

  async function sendUserMessage(text, audioBlob = null) {
    if (!text || loading || !chatId) return;

    const userMessage = { role: "user", content: text };

    if (audioBlob && audioBlob.size > 0) {
      try {
        const { filename } = await uploadAudio(chatId, audioBlob);
        userMessage.audio_file = filename;
      } catch (err) {
        setError(err.message || "Failed to save audio.");
        return;
      }
    }

    const nextMessages = [...messages, userMessage];
    onMessagesChange(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const reply = await sendChat(nextMessages);
      const fullMessages = [...nextMessages, reply];
      onMessagesChange(fullMessages);
      await saveChatMessages(chatId, fullMessages);
      onChatSaved();
    } catch (err) {
      setError(err.message || "Something went wrong.");
      onMessagesChange(messages);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const text = input.trim();
    await sendUserMessage(text);
  }

  return (
    <div className="chat-window">
      <div className="messages" ref={messagesRef}>
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <h2>Ask about US history</h2>
            <p>Try: &quot;Who was the first US president?&quot;</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            role={msg.role}
            content={msg.content}
            audioFile={msg.audio_file}
            chatId={chatId}
          />
        ))}
        {loading && (
          <div className="message-row assistant">
            <div className="message-bubble loading-bubble">
              <span className="message-label">Historian</span>
              <p className="typing">Thinking…</p>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="chat-composer">
        <VoiceControls disabled={loading} onSend={sendUserMessage} />

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
    </div>
  );
}
