# US History Chatbot

A local demo chatbot focused on US history — text and voice chat, saved conversations, and a custom PDF knowledge base.

## Current features (Phases 1–5 — complete)

- Text chat with US history focus (Google Gemini)
- Multiple saved chats with sidebar
- Voice input: Start / Stop / Delete / Send
- Voice output: Speak (TTS) on assistant messages
- Replay user voice recordings (Play button)
- PDF knowledge base — answers blend PDF content with general US history
- **Demo visuals** — left-side US flag accent, historical gallery in header
- Local storage under `data/chats/`

## Documentation

| Doc | Description |
|-----|-------------|
| **[docs/setup.md](docs/setup.md)** | **Start here** — full setup for your machine and your friend's laptop |
| **[docs/plan.md](docs/plan.md)** | Requirements, architecture, and phased build plan |
| **[docs/implementation.md](docs/implementation.md)** | What has been built (all 5 phases complete) |

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

You should see a **Knowledge base** badge in the header if a PDF is in `knowledge/`.

To stop either server, press **Ctrl+C** in its terminal.

See **[docs/implementation.md](docs/implementation.md)** for current feature status.

## Configuration

Copy `.env.example` to `.env` and set:

```env
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-2.5-flash
```

Get a free API key: https://aistudio.google.com/apikey

## Tech stack

- **Frontend:** React + Vite (Web Speech API for voice)
- **Backend:** Python FastAPI
- **LLM:** Google Gemini (`gemini-2.5-flash`)
