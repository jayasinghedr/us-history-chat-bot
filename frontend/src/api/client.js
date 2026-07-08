const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function sendChat(messages) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed (${response.status})`);
  }

  const data = await response.json();
  return data.message;
}
