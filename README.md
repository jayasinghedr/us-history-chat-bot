# US History Chatbot

A local demo chatbot focused on US history — text and voice chat, saved conversations, and a custom PDF knowledge base.

## Documentation

| Doc | Description |
|-----|-------------|
| **[docs/setup.md](docs/setup.md)** | **Start here** — full setup for your machine and your friend's laptop |
| **[docs/plan.md](docs/plan.md)** | Requirements, architecture, and phased build plan |
| **[docs/implementation.md](docs/implementation.md)** | What has been built so far (Phase 1 status) |

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

Open http://localhost:5173 in Chrome or Edge.

See **[docs/implementation.md](docs/implementation.md)** for current feature status.

## Configuration

Copy `.env.example` to `.env` and set:

```env
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-2.5-flash
```

Get a free API key: https://aistudio.google.com/apikey

## Tech stack

- **Frontend:** React + Vite
- **Backend:** Python FastAPI
- **LLM:** Google Gemini (`gemini-2.5-flash`)
