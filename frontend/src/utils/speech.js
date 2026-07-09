let activeStop = null;

export function stopActivePlayback() {
  if (activeStop) {
    const stop = activeStop;
    activeStop = null;
    stop();
  }
}

function setActivePlayback(stopFn) {
  stopActivePlayback();
  activeStop = stopFn;
}

export function clearActivePlayback(stopFn) {
  if (activeStop === stopFn) {
    activeStop = null;
  }
}

export function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");
}

export function speakText(text, { onStart, onEnd } = {}) {
  if (!window.speechSynthesis) {
    throw new Error("Text-to-speech is not supported in this browser.");
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;

  const stop = () => {
    window.speechSynthesis.cancel();
    clearActivePlayback(stop);
    onEnd?.();
  };

  utterance.onend = stop;
  utterance.onerror = stop;

  setActivePlayback(stop);
  onStart?.();
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  stopActivePlayback();
}

export function playRecording(url, { onStart, onEnd } = {}) {
  const audio = new Audio(url);

  const stop = () => {
    audio.pause();
    audio.currentTime = 0;
    clearActivePlayback(stop);
    onEnd?.();
  };

  audio.onended = stop;
  audio.onerror = stop;

  setActivePlayback(stop);
  onStart?.();

  return audio.play().catch((err) => {
    stop();
    throw err;
  });
}

export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isMediaRecorderSupported() {
  return !!(navigator.mediaDevices && window.MediaRecorder);
}

export function isVoiceInputSupported() {
  return isSpeechRecognitionSupported() && isMediaRecorderSupported();
}

export function createSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    throw new Error("Speech recognition is not supported. Use Chrome or Edge.");
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";
  return recognition;
}
