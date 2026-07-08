export default function ChatList({ chats, activeChatId, onSelectChat, onNewChat }) {
  return (
    <aside className="chat-list">
      <button type="button" className="new-chat-btn" onClick={onNewChat}>
        + New Chat
      </button>
      <div className="chat-list-items">
        {chats.length === 0 && (
          <p className="chat-list-empty">No saved chats yet</p>
        )}
        {chats.map((chat) => (
          <button
            key={chat.id}
            type="button"
            className={`chat-list-item ${chat.id === activeChatId ? "active" : ""}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <span className="chat-list-title">{chat.title}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
