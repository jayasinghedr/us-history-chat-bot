import { useEffect, useRef, useState } from "react";
import { HiMicrophone, HiPaperAirplane } from "react-icons/hi2";
import MessageBubble from "./MessageBubble";
import VoiceControls from "./VoiceControls";
import { saveChatMessages, sendChat, uploadAudio } from "../api/client";
import { isVoiceInputSupported } from "../utils/speech";

export default function ChatWindow({ chatId, messages, onMessagesChange, onChatSaved }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const messagesRef = useRef(null);
  const voiceSupported = isVoiceInputSupported();

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

  function toggleVoice() {
    setVoiceOpen((open) => !open);
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
        <VoiceControls
          visible={voiceOpen}
          disabled={loading}
          onSend={sendUserMessage}
          onDismiss={() => setVoiceOpen(false)}
        />

        <form className="input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            disabled={loading}
            autoFocus
          />
          {voiceSupported && (
            <button
              type="button"
              className={`composer-btn composer-btn-mic${voiceOpen ? " active" : ""}`}
              onClick={toggleVoice}
              disabled={loading}
              title={voiceOpen ? "Hide voice input" : "Voice input"}
              aria-label={voiceOpen ? "Hide voice input" : "Voice input"}
              aria-pressed={voiceOpen}
            >
              <HiMicrophone size={22} />
            </button>
          )}
          <button
            type="submit"
            className="composer-btn composer-btn-send"
            disabled={loading || !input.trim()}
            title="Send message"
            aria-label="Send message"
          >
            <HiPaperAirplane size={22} />
          </button>
        </form>
      </div>
    </div>
  );
}
