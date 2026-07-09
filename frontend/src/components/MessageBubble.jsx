import { useState } from "react";
import { HiPlay, HiStop } from "react-icons/hi2";
import ReactMarkdown from "react-markdown";
import {
  playRecording,
  speakText,
  stopActivePlayback,
  stripMarkdown,
} from "../utils/speech";

function PlaybackButton({ isPlaying, onToggle, labelPlay, labelStop }) {
  return (
    <button
      type="button"
      className="message-action-btn"
      title={isPlaying ? labelStop : labelPlay}
      aria-label={isPlaying ? labelStop : labelPlay}
      onClick={onToggle}
    >
      {isPlaying ? <HiStop size={15} /> : <HiPlay size={15} />}
    </button>
  );
}

export default function MessageBubble({ role, content, audioFile, chatId }) {
  const isUser = role === "user";
  const [isRecordingPlaying, setIsRecordingPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioUrl =
    isUser && audioFile && chatId
      ? `/api/chats/${chatId}/audio/${audioFile}`
      : null;

  function toggleRecording() {
    if (isRecordingPlaying) {
      stopActivePlayback();
      return;
    }

    if (!audioUrl) return;

    playRecording(audioUrl, {
      onStart: () => setIsRecordingPlaying(true),
      onEnd: () => setIsRecordingPlaying(false),
    }).catch(() => {
      setIsRecordingPlaying(false);
    });
  }

  function toggleSpeak() {
    if (isSpeaking) {
      stopActivePlayback();
      return;
    }

    try {
      speakText(stripMarkdown(content), {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      <div className="message-bubble">
        <div className="message-header">
          <span className="message-label">{isUser ? "You" : "Historian"}</span>
          <div className="message-actions">
            {audioUrl && (
              <PlaybackButton
                isPlaying={isRecordingPlaying}
                onToggle={toggleRecording}
                labelPlay="Play recording"
                labelStop="Stop recording"
              />
            )}
            {!isUser && (
              <PlaybackButton
                isPlaying={isSpeaking}
                onToggle={toggleSpeak}
                labelPlay="Read aloud"
                labelStop="Stop reading"
              />
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
