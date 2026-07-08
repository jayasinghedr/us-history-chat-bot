# US History Chatbot — Setup & Usage Guide

Complete instructions for installing, running, and using the app on **your machine** or **your friend's laptop** (Windows). Read this top-to-bottom the first time; use [Quick start](#quick-start-after-initial-setup) for daily use.

> **Related docs:** [plan.md](./plan.md) — requirements and architecture · [implementation.md](./implementation.md) — technical details and API reference

---

## Table of contents

1. [Overview](#overview)
2. [What you need](#what-you-need)
3. [Install prerequisites (Windows)](#install-prerequisites-windows)
4. [Get a Gemini API key](#get-a-gemini-api-key)
5. [Transfer the project to another laptop](#transfer-the-project-to-another-laptop)
6. [Project setup (first time)](#project-setup-first-time)
7. [Configure the API key](#configure-the-api-key)
8. [Add the US history PDF (optional)](#add-the-us-history-pdf-optional)
9. [Run the application](#run-the-application)
10. [Using the app](#using-the-app)
11. [Verify everything works](#verify-everything-works)
12. [Quick start (after initial setup)](#quick-start-after-initial-setup)
13. [Stopping the app](#stopping-the-app)
14. [Troubleshooting](#troubleshooting)
15. [FAQ](#faq)
16. [Setup checklist (new machine)](#setup-checklist-new-machine)

---

## Overview

The app has two parts that run locally:

| Part | Technology | Default URL | Purpose |
|------|------------|-------------|---------|
| **Frontend** | React + Vite | http://localhost:5173 | Chat UI in the browser |
| **Backend** | Python FastAPI | http://localhost:8000 | Talks to Gemini API, saves chats, loads PDF |

You also need:

- **Internet** — for Gemini API calls (free tier)
- **Chrome or Edge** — required for voice input (microphone + speech recognition)

**Stored locally on disk (not in the cloud):**

- Saved chats and voice recordings → `data/chats/`
- PDF knowledge base → `knowledge/`

---

## What you need

| Requirement | Minimum version | Notes |
|-------------|-----------------|-------|
| **Windows** | 10 or 11 | These instructions target Windows |
| **Node.js** | 18+ | For the frontend |
| **Python** | 3.10+ | For the backend |
| **Browser** | Chrome or Edge | Voice input requires Chrome or Edge; text chat works in other browsers |
| **Gemini API key** | Free | From Google AI Studio — no credit card |
| **Disk space** | ~500 MB | Node/Python packages + chat data |

---

## Install prerequisites (Windows)

### 1. Install Node.js

1. Open https://nodejs.org/
2. Download the **LTS** version (e.g. 20.x or 22.x)
3. Run the installer — accept defaults (includes `npm`)
4. Open **PowerShell** or **Command Prompt** and verify:

```powershell
node --version
npm --version
```

Expected: `v18.x.x` or higher for Node.

### 2. Install Python

1. Open https://www.python.org/downloads/
2. Download **Python 3.10+** (3.11 or 3.12 recommended)
3. Run the installer
4. **Important:** Check **"Add python.exe to PATH"** on the first screen
5. Verify in a **new** terminal:

```powershell
python --version
pip --version
```

Expected: `Python 3.10.x` or higher.

### 3. Install Git (optional but recommended)

Only needed if you clone from a repository:

1. https://git-scm.com/download/win
2. Install with defaults
3. Verify: `git --version`

---

## Get a Gemini API key

Each person running the app should have **their own** free API key (recommended). Do not share keys in email or commit them to git.

### Steps

1. Go to https://aistudio.google.com/
2. Sign in with a Google account
3. Open https://aistudio.google.com/apikey
4. Click **Create API key**
5. Choose **Create API key in new project** (or pick an existing project)
6. Copy the key immediately and save it somewhere safe

### Recommended model

We verified the free tier works with:

```env
GEMINI_MODEL=gemini-2.5-flash
```

Other models (e.g. `gemini-2.0-flash`, `gemini-2.5-pro`) may return **429 quota errors** on the free tier depending on the Google project.

### Test the key (optional)

After creating `.env` (see below), run this in PowerShell (replace `YOUR_KEY`):

```powershell
python -c "import urllib.request,json; key='YOUR_KEY'; url=f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}'; body=json.dumps({'contents':[{'parts':[{'text':'Say OK'}]}]}).encode(); req=urllib.request.Request(url,data=body,headers={'Content-Type':'application/json'}); print(json.loads(urllib.request.urlopen(req).read())['candidates'][0]['content']['parts'][0]['text'])"
```

Expected output: a short text response (e.g. `OK`).

If you see `HTTP 401` or `API key not valid` — the key is wrong.  
If you see `HTTP 429` on `gemini-2.5-flash` — wait a minute and retry, or check https://ai.google.dev/gemini-api/docs/rate-limits

---

## Transfer the project to another laptop

Pick one method:

### Option A — USB / ZIP (simplest, no git)

1. On your machine, zip the entire `ChatBot` folder
2. **Exclude** (do not copy):
   - `node_modules/` (reinstalled with `npm install`)
   - `backend/.venv/` (recreated with `python -m venv`)
   - `.env` (friend creates their own key)
3. Copy the zip to your friend's laptop and extract (e.g. `C:\Users\Friend\Projects\ChatBot`)

### Option B — Git repository

1. Push the project to GitHub/GitLab (ensure `.env` is in `.gitignore`)
2. On friend's laptop:

```powershell
git clone https://github.com/jayasinghedr/us-history-chat-bot.git
cd us-history-chat-bot
```

### Option C — Cloud folder (OneDrive, Google Drive)

Same rules as ZIP — exclude `node_modules`, virtualenv, and secret files.

**Also copy manually (gitignored):**

- `knowledge/` — if you want the same PDF on the other laptop
- `data/chats/` — only if you want to transfer saved conversations

---

## Project setup (first time)

Open **PowerShell**, go to the project folder, then run backend and frontend setup.

```powershell
cd C:\path\to\ChatBot
```

### Backend setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

**If PowerShell blocks the activate script:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then retry `.\.venv\Scripts\Activate.ps1`.

**Alternative (Command Prompt instead of PowerShell):**

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..
```

### Frontend setup

```powershell
cd frontend
npm install
cd ..
```

---

## Configure the API key

1. In the project root (`ChatBot/`), copy the example env file:

```powershell
copy .env.example .env
```

2. Open `.env` in Notepad or VS Code and set:

```env
GEMINI_API_KEY=paste-your-key-here
GEMINI_MODEL=gemini-2.5-flash
```

3. Save the file. **Never commit `.env` to git.**

### Security checklist

- [ ] `.env` is listed in `.gitignore`
- [ ] API key is not pasted in chat, screenshots, or public repos
- [ ] Friend creates their own key on their laptop (recommended)

---

## Add the US history PDF (optional)

The app blends **general US history knowledge** with content from a local PDF when relevant.

1. Create the `knowledge/` folder if it does not exist
2. Place your PDF inside:

```
ChatBot/knowledge/The Wilmington Coup of 1898.pdf
```

(Any filename works — the first `.pdf`, `.txt`, or `.md` found is loaded.)

3. Start or restart the backend — the file is loaded automatically on startup

**Verify the PDF loaded:**

- Open http://localhost:8000/api/knowledge/status
- You should see `"loaded": true` and a `chunk_count` greater than 0

**To replace the PDF later:**

1. Swap the file in `knowledge/`
2. Call `POST /api/knowledge/reload` from http://localhost:8000/docs, or restart the backend

**If the PDF is scanned (images only):** text extraction may fail (`chunk_count: 0`). Ask for a text-based PDF or a `.txt`/`.md` export.

> **Note:** `knowledge/` is gitignored — copy the PDF manually when setting up another laptop.

---

## Run the application

You need **two terminal windows** — one for backend, one for frontend.

### Terminal 1 — Backend

```powershell
cd C:\path\to\ChatBot\backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

Expected output includes:

```
Uvicorn running on http://127.0.0.1:8000
```

Leave this terminal open.

### Terminal 2 — Frontend

```powershell
cd C:\path\to\ChatBot\frontend
npm run dev
```

Expected output includes:

```
Local:   http://localhost:5173/
```

Leave this terminal open.

### Open the app

1. Open **Chrome** or **Edge**
2. Go to http://localhost:5173
3. The app loads your most recent chat, or starts a new one if none exist

---

## Using the app

### Text chat

1. Type a question in the input bar at the bottom, e.g. *"Who was the first US president?"*
2. Click the **send icon** (paper plane) or press **Enter**
3. The assistant reply appears as a **Historian** message
4. **Scroll up** in the message area to read older messages — the input bar stays fixed at the bottom
5. Assistant replies support **markdown** formatting (bold, lists, etc.)

### Multiple chats

| Action | How |
|--------|-----|
| **New chat** | Click **+ New Chat** in the left sidebar |
| **Switch chat** | Click a chat title in the sidebar |
| **Delete chat** | Hover a chat → click the **trash icon** → confirm in the dialog |
| **Auto-save** | Each exchange is saved automatically to disk |
| **Auto-title** | Chat titles come from the first user message (truncated at 60 characters) |

Deleting a chat removes it permanently (messages and any voice recordings). If you delete the active chat, the app switches to another chat or creates a new one.

### Voice input

Voice input requires **Chrome or Edge** and microphone permission.

1. Click the **microphone icon** next to the send button — the voice control bar appears above the input
2. Click the **mic icon** in the voice bar to **start recording**
3. Speak your question
4. Click the **stop icon** when finished — your transcription appears for review
5. Click the **send icon** in the voice bar to submit (or **trash icon** to discard)
6. Click the **microphone icon** again to hide the voice bar

Your voice recording is saved with the message. After sending, click **Play** on your message bubble to replay it.

### Voice output (text-to-speech)

- Assistant replies are **text only** on screen
- Click **Speak** on a Historian message to hear it read aloud (browser text-to-speech)
- No extra API key needed for TTS

### PDF knowledge base

When a PDF is loaded in `knowledge/`, answers blend general US history with PDF content when relevant.

**Example questions (with Wilmington Coup PDF):**

- *"What happened in the Wilmington Coup of 1898?"*
- *"Tell me about significant events connected to Wilmington, North Carolina"*

General questions still work without the PDF:

- *"What caused the American Civil War?"*
- *"Who was Abraham Lincoln?"*

### Suggested demo flow

1. Ask a general US history question
2. Ask something specific to the PDF (if loaded)
3. Start a **new chat** — show the previous one is still in the sidebar
4. Use **voice input** to ask a question, then **Speak** on the reply
5. Refresh the page — chats and recordings persist
6. Delete an old chat from the sidebar

---

## Verify everything works

### Checklist

| Step | How to verify |
|------|----------------|
| Backend running | http://localhost:8000/docs shows FastAPI Swagger UI |
| Frontend running | http://localhost:5173 loads the chat page |
| API key works | Send a message and receive an AI reply |
| Chats persist | Refresh the page — sidebar still shows saved chats |
| PDF loaded (optional) | http://localhost:8000/api/knowledge/status shows `loaded: true` |
| Voice (optional) | Mic icon → record → stop → send → Play on user message |
| Internet | Gemini calls fail offline — ensure Wi‑Fi is on |

### Backend health check

Visit: http://localhost:8000/api/health

Expected:

```json
{
  "status": "ok",
  "model": "gemini-2.5-flash"
}
```

---

## Quick start (after initial setup)

Every time you want to use the app:

```powershell
# Terminal 1 — backend
cd C:\path\to\ChatBot\backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

```powershell
# Terminal 2 — frontend
cd C:\path\to\ChatBot\frontend
npm run dev
```

Then open http://localhost:5173 in Chrome or Edge.

---

## Stopping the app

In each terminal window where a server is running, press **Ctrl+C** to stop it.

If port 8000 remains in use:

```powershell
netstat -ano | findstr :8000
taskkill /PID <pid> /F
```

Your saved chats and audio remain in `data/chats/` on disk until you delete them from the app.

---

## Troubleshooting

### `python` is not recognized

- Reinstall Python with **"Add to PATH"** checked, or
- Use the Python Launcher: `py --version` and `py -m venv .venv`

### `node` or `npm` is not recognized

- Reinstall Node.js LTS from https://nodejs.org/
- Close and reopen the terminal after install

### PowerShell won't run `Activate.ps1`

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port already in use (8000 or 5173)

Another app is using the port. Either close that app or change the port:

- Backend: `uvicorn main:app --reload --port 8001`
- Frontend: `npm run dev -- --port 5174`

### "Loading chats…" never finishes

1. Check the backend terminal for errors
2. Confirm backend is running on port 8000
3. If port is stuck: `netstat -ano | findstr :8000` then `taskkill /PID <pid> /F`
4. Restart the backend once

### Chat returns an error / no response

1. Check backend terminal for error messages
2. Confirm `.env` has a valid `GEMINI_API_KEY`
3. Confirm `GEMINI_MODEL=gemini-2.5-flash`
4. Check internet connection
5. If `429 Too Many Requests` — wait 30–60 seconds; free tier has rate limits

### `401` / invalid API key

- Regenerate key at https://aistudio.google.com/apikey
- Update `.env` with no extra spaces or quotes around the key

### Frontend can't reach backend

- Ensure backend is running on port 8000
- Use http://localhost:5173 consistently

### Microphone / voice input not working

- Use **Chrome** or **Edge** (not Firefox/Safari for recording)
- Allow microphone permission when the browser prompts
- Windows Settings → Privacy → Microphone → allow desktop apps
- Click the **mic icon** next to send to open the voice bar first
- Microphone works on **localhost** without HTTPS

### Voice output (Speak button) not working

- Uses browser built-in speech synthesis
- Try Chrome or Edge
- Check system volume and that no other app is using audio output

### PDF knowledge base not affecting answers

- Confirm file is in `knowledge/` folder
- Check http://localhost:8000/api/knowledge/status — `chunk_count` should be > 0
- Restart backend or call `POST /api/knowledge/reload`
- Ask about a topic specific to the PDF content
- If `chunk_count` is 0, the PDF may be scanned/image-only — try a text export

### Markdown shows as raw text (`**bold**`)

- Hard-refresh the browser (Ctrl+Shift+R) after updating the frontend
- Rebuild if needed: `cd frontend` then `npm run build`

---

## FAQ

### Does my friend need to pay for anything?

No. Gemini API free tier + local app = no payment required for a demo.

### Can we use the same API key on two laptops?

Technically yes, but **not recommended** — each person should create their own free key. Shared keys share the same rate limits and are harder to revoke if leaked.

### Does the app work offline?

Partially. The UI and saved chats work offline, but **new AI replies require internet** (Gemini API).

### Where are chats stored?

Locally under `ChatBot/data/chats/`. Each chat has:

```
data/chats/{chat-id}/
├── meta.json       # title, dates
├── messages.json   # conversation history
└── audio/          # voice recordings (if any)
```

Copy this folder to back up or move chats to another machine.

### Which browser should we use for the demo?

**Google Chrome** or **Microsoft Edge** on Windows.

### What if Gemini changes models or quotas?

Update `GEMINI_MODEL` in `.env`. Check https://ai.google.dev/gemini-api/docs/models for current model names.

### Can I delete a chat by accident?

Yes — deletion is permanent after you confirm in the dialog. There is no undo.

---

## Setup checklist (new machine)

Use this when setting up a fresh laptop:

- [ ] Install Node.js LTS — verify `node --version`
- [ ] Install Python 3.10+ — verify `python --version`
- [ ] Copy or clone the ChatBot project
- [ ] Create Gemini API key at https://aistudio.google.com/apikey
- [ ] Copy `.env.example` → `.env` and paste API key
- [ ] Set `GEMINI_MODEL=gemini-2.5-flash`
- [ ] Backend: `python -m venv .venv`, activate, `pip install -r requirements.txt`
- [ ] Frontend: `npm install`
- [ ] (Optional) Copy PDF into `knowledge/` folder
- [ ] Start backend (`uvicorn`) and frontend (`npm run dev`)
- [ ] Open http://localhost:5173 and send a test message
- [ ] Test voice: mic icon → record → stop → send; Speak on reply; Play on user message
- [ ] Test delete: trash icon on a chat → confirm in modal
- [ ] (Optional) Verify PDF at http://localhost:8000/api/knowledge/status

---

## Document history

| Date | Change |
|------|--------|
| 2026-07-09 | Finalized docs: usage guide, icon-based voice UI, delete chat modal, markdown replies, header layout |
| 2026-07-08 | Phase 5 visual polish; Phase 4 PDF knowledge base; Phase 3 voice; initial setup guide |
