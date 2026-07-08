import { useCallback, useEffect, useState } from "react";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import HistoryGallery from "./components/HistoryGallery";
import { createChat, getChat, listChats } from "./api/client";
import "./App.css";

export default function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");

  const refreshChatList = useCallback(async () => {
    const data = await listChats();
    setChats(data);
    return data;
  }, []);

  const startNewChat = useCallback(async () => {
    const { id } = await createChat();
    setActiveChatId(id);
    setMessages([]);
    setError("");
  }, []);

  const selectChat = useCallback(async (chatId) => {
    const chat = await getChat(chatId);
    setActiveChatId(chat.id);
    setMessages(chat.messages);
    setError("");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const data = await refreshChatList();
        if (cancelled) return;
        if (data.length > 0) {
          await selectChat(data[0].id);
        } else {
          await startNewChat();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load chats.");
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [refreshChatList, selectChat, startNewChat]);

  async function handleNewChat() {
    try {
      await startNewChat();
    } catch (err) {
      setError(err.message || "Failed to create a new chat.");
    }
  }

  async function handleSelectChat(chatId) {
    if (chatId === activeChatId) return;
    try {
      await selectChat(chatId);
    } catch (err) {
      setError(err.message || "Failed to load chat.");
    }
  }

  async function handleChatSaved() {
    try {
      await refreshChatList();
    } catch (err) {
      setError(err.message || "Failed to refresh chat list.");
    }
  }

  if (initializing) {
    return (
      <div className="page-shell">
        <div className="app loading-screen">
          <p>Loading chats…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="app">
        <header className="app-header">
          <HistoryGallery />
          <h1>US History Chat</h1>
          <p className="app-tagline">Your AI guide to American history</p>
        </header>

        {error && <div className="app-error">{error}</div>}

        <div className="app-layout">
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />
        <main>
          {activeChatId ? (
            <ChatWindow
              chatId={activeChatId}
              messages={messages}
              onMessagesChange={setMessages}
              onChatSaved={handleChatSaved}
            />
          ) : (
            <div className="chat-window">
              <div className="empty-state">
                <h2>Backend unavailable</h2>
                <p>Start the backend and refresh the page.</p>
              </div>
            </div>
          )}
        </main>
        </div>
      </div>
    </div>
  );
}
