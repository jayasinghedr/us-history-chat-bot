import { useEffect, useRef, useState } from "react";
import {
  createSpeechRecognition,
  isMediaRecorderSupported,
  isSpeechRecognitionSupported,
} from "../utils/speech";

export default function VoiceControls({ disabled, onSend }) {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const audioBlobRef = useRef(null);

  const supported =
    isSpeechRecognitionSupported() && isMediaRecorderSupported();

  useEffect(() => {
    return () => {
      stopRecordingInternal();
    };
  }, []);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  function stopRecordingInternal() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    stopStream();
  }

  async function handleStart() {
    if (!supported || disabled) return;

    setError("");
    setTranscript("");
    audioBlobRef.current = null;
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recognition = createSpeechRecognition();
      recognitionRef.current = recognition;

      recognition.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i += 1) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text.trim());
      };

      recognition.onerror = (event) => {
        setError(event.error === "not-allowed" ? "Microphone permission denied." : "Speech recognition error.");
        setStatus("idle");
        stopRecordingInternal();
      };

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          audioBlobRef.current = new Blob(chunksRef.current, { type: "audio/webm" });
        }
        stopStream();
      };

      mediaRecorder.start();
      recognition.start();
      setStatus("recording");
    } catch (err) {
      setError(err.message || "Could not access microphone.");
      setStatus("idle");
      stopRecordingInternal();
    }
  }

  function handleStop() {
    if (status !== "recording") return;

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          audioBlobRef.current = new Blob(chunksRef.current, { type: "audio/webm" });
        }
        stopStream();
        mediaRecorderRef.current = null;
        setStatus("stopped");
      };
      recorder.stop();
    } else {
      setStatus("stopped");
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }
  }

  function handleDelete() {
    stopRecordingInternal();
    setTranscript("");
    audioBlobRef.current = null;
    chunksRef.current = [];
    setError("");
    setStatus("idle");
  }

  async function handleSend() {
    const text = transcript.trim();
    if (!text || disabled) return;

    const blob = audioBlobRef.current;
    handleDelete();
    await onSend(text, blob);
  }

  if (!supported) {
    return (
      <div className="voice-controls voice-unsupported">
        Voice input requires Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="voice-controls">
      <div className="voice-buttons">
        <button
          type="button"
          className="voice-btn"
          onClick={handleStart}
          disabled={disabled || status === "recording"}
        >
          Start
        </button>
        <button
          type="button"
          className="voice-btn"
          onClick={handleStop}
          disabled={disabled || status !== "recording"}
        >
          Stop
        </button>
        <button
          type="button"
          className="voice-btn voice-btn-secondary"
          onClick={handleDelete}
          disabled={disabled || status === "idle"}
        >
          Delete
        </button>
        <button
          type="button"
          className="voice-btn voice-btn-send"
          onClick={handleSend}
          disabled={disabled || !transcript.trim() || status === "recording"}
        >
          Send
        </button>
      </div>

      {status === "recording" && (
        <p className="voice-status recording-indicator">Recording… click Stop when done.</p>
      )}

      {transcript && status !== "recording" && (
        <div className="voice-transcript">
          <span className="voice-transcript-label">Transcription:</span>
          <p>{transcript}</p>
        </div>
      )}

      {error && <p className="voice-error">{error}</p>}
    </div>
  );
}
