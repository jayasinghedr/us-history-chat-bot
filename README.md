# US History Chatbot

A local demo chatbot focused on US history — text and voice chat, saved conversations, PDF knowledge base, and a polished demo UI.

## Features

- **Text chat** with US history focus (Google Gemini `gemini-2.5-flash`)
- **Multiple saved chats** — sidebar, auto-save, auto-titles, delete with confirmation modal
- **ChatGPT-style layout** — scrollable message history, input bar fixed at bottom
- **Markdown replies** — bold, lists, and other formatting rendered in assistant messages
- **Voice input** — mic button reveals icon-based controls (record, stop, delete, send)
- **Voice output** — Speak (TTS) on assistant messages; Play on user recordings
- **PDF knowledge base** — answers blend PDF content with general US history
- **Demo visuals** — US flag header background, historical images flanking the title
- **Local storage** — chats and audio under `data/chats/`

## Documentation

| Doc | Description |
|-----|-------------|
| **[docs/setup.md](docs/setup.md)** | **Start here** — install, configure, run, and use the app |
| **[docs/plan.md](docs/plan.md)** | Requirements, architecture, and phased build plan |
| **[docs/implementation.md](docs/implementation.md)** | Technical reference — API, components, file layout |

## Quick start (after setup)

**Terminal 1 — backend:**

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

**Terminal 2 — frontend:**

```powershell
cd frontend
npm run dev
```

Open http://localhost:5173 in **Chrome or Edge** (required for voice).

Press **Ctrl+C** in each terminal to stop the servers.

See **[docs/setup.md](docs/setup.md)** for first-time setup and full usage instructions.

## Configuration

Copy `.env.example` to `.env` in the project root:

```env
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-2.5-flash
```

Get a free API key: https://aistudio.google.com/apikey

## Tech stack

- **Frontend:** React + Vite, react-markdown, react-icons, Web Speech API
- **Backend:** Python FastAPI
- **LLM:** Google Gemini (`gemini-2.5-flash`)
