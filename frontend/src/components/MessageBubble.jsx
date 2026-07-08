import ReactMarkdown from "react-markdown";
import { speakText, stripMarkdown } from "../utils/speech";

export default function MessageBubble({ role, content, audioFile, chatId }) {
  const isUser = role === "user";

  function handleSpeak() {
    try {
      speakText(stripMarkdown(content));
    } catch (err) {
      alert(err.message);
    }
  }

  const audioUrl =
    isUser && audioFile && chatId
      ? `/api/chats/${chatId}/audio/${audioFile}`
      : null;

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      <div className="message-bubble">
        <div className="message-header">
          <span className="message-label">{isUser ? "You" : "Historian"}</span>
          <div className="message-actions">
            {audioUrl && (
              <button
                type="button"
                className="message-action-btn"
                title="Play recording"
                aria-label="Play recording"
                onClick={() => {
                  const audio = new Audio(audioUrl);
                  audio.play();
                }}
              >
                Play
              </button>
            )}
            {!isUser && (
              <button
                type="button"
                className="message-action-btn"
                title="Read aloud"
                aria-label="Read aloud"
                onClick={handleSpeak}
              >
                Speak
              </button>
            )}
          </div>
        </div>
        {isUser ? (
          <p>{content}</p>
        ) : (
          <div className="message-content">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
