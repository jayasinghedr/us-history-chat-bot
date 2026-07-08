import { HiTrash } from "react-icons/hi2";

export default function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}) {
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
          <div
            key={chat.id}
            className={`chat-list-row ${chat.id === activeChatId ? "active" : ""}`}
          >
            <button
              type="button"
              className="chat-list-item"
              onClick={() => onSelectChat(chat.id)}
            >
              <span className="chat-list-title">{chat.title}</span>
            </button>
            <button
              type="button"
              className="chat-delete-btn"
              onClick={() => onDeleteChat(chat.id)}
              title="Delete chat"
              aria-label={`Delete chat: ${chat.title}`}
            >
              <HiTrash size={16} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
