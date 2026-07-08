import ChatWindow from "./components/ChatWindow";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>US History Chat</h1>
        <p>Your AI guide to American history</p>
      </header>
      <main>
        <ChatWindow />
      </main>
    </div>
  );
}
