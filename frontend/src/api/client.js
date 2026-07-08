const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const REQUEST_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Is the backend running on port 8000?");
    }
    throw new Error("Cannot reach the backend. Make sure it is running on port 8000.");
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseError(response) {
  const error = await response.json().catch(() => ({}));
  const detail = error.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
  return `Request failed (${response.status})`;
}

export async function sendChat(messages) {
  const response = await fetchWithTimeout(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) throw new Error(await parseError(response));

  const data = await response.json();
  return data.message;
}

export async function createChat() {
  const response = await fetchWithTimeout(`${API_BASE}/api/chats`, { method: "POST" });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function listChats() {
  const response = await fetchWithTimeout(`${API_BASE}/api/chats`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function getChat(chatId) {
  const response = await fetchWithTimeout(`${API_BASE}/api/chats/${chatId}`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function deleteChat(chatId) {
  const response = await fetchWithTimeout(`${API_BASE}/api/chats/${chatId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function saveChatMessages(chatId, messages) {
  const response = await fetchWithTimeout(`${API_BASE}/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function uploadAudio(chatId, audioBlob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");

  const response = await fetchWithTimeout(`${API_BASE}/api/chats/${chatId}/audio`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function getKnowledgeStatus() {
  const response = await fetchWithTimeout(`${API_BASE}/api/knowledge/status`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}
