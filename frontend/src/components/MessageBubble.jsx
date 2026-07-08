export default function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      <div className="message-bubble">
        <span className="message-label">{isUser ? "You" : "Historian"}</span>
        <p>{content}</p>
      </div>
    </div>
  );
}
