# US History Chatbot — Setup Guide

Complete setup instructions for running the app on **your machine** or **your friend's laptop** (Windows). Read this top-to-bottom the first time; use the [Quick start](#quick-start-after-initial-setup) section for daily use.

> **Related docs:** [plan.md](./plan.md) — project requirements and phased build plan.

---

## Table of contents

1. [Overview](#overview)
2. [What you need](#what-you-need)
3. [Install prerequisites (Windows)](#install-prerequisites-windows)
4. [Get a Gemini API key](#get-a-gemini-api-key)
5. [Transfer the project to another laptop](#transfer-the-project-to-another-laptop)
6. [Project setup (first time)](#project-setup-first-time)
7. [Configure the API key](#configure-the-api-key)
8. [Run the application](#run-the-application)
9. [Verify everything works](#verify-everything-works)
10. [Add the US history PDF (Phase 4+)](#add-the-us-history-pdf-phase-4)
11. [Quick start (after initial setup)](#quick-start-after-initial-setup)
12. [Stopping the app](#stopping-the-app)
13. [Troubleshooting](#troubleshooting)
14. [FAQ](#faq)

---

## Overview

The app has two parts that run locally:

| Part | Technology | Default URL | Purpose |
|------|------------|-------------|---------|
| **Frontend** | React + Vite | http://localhost:5173 | Chat UI in the browser |
| **Backend** | Python FastAPI | http://localhost:8000 | Talks to Gemini API, saves chats |

You also need:

- **Internet** — for Gemini API calls (free tier)
- **Chrome or Edge** — recommended browser (required for voice features in Phase 3)

Chats, audio recordings, and PDF files stay **on the local disk** — not in the cloud.

---

## What you need

| Requirement | Minimum version | Notes |
|-------------|-----------------|-------|
| **Windows** | 10 or 11 | These instructions target Windows |
| **Node.js** | 18+ | For the frontend |
| **Python** | 3.10+ | For the backend |
| **Browser** | Chrome or Edge | Firefox/Safari work for text chat; voice works best in Chrome/Edge |
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

From the project folder, after creating `.env` (see below), or run this one-liner in PowerShell (replace `YOUR_KEY`):

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
   - `node_modules/` (if present — will be reinstalled)
   - `backend/.venv/` or any virtualenv folder
   - `.env` and `API_key.txt` (friend creates their own key)
3. Copy the zip to your friend's laptop and extract (e.g. `C:\Users\Friend\Projects\ChatBot`)

### Option B — Git repository

1. Push the project to GitHub/GitLab (ensure `.env` and `API_key.txt` are in `.gitignore`)
2. On friend's laptop:

```powershell
git clone <repository-url>
cd ChatBot
```

### Option C — Cloud folder (OneDrive, Google Drive)

Same rules as ZIP — exclude `node_modules`, virtualenv, and secret files.

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
- [ ] `API_key.txt` is listed in `.gitignore` (if you use it)
- [ ] API key is not pasted in chat, screenshots, or public repos
- [ ] Friend creates their own key on their laptop (recommended)

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
3. Type a question, e.g. *"Who was the first US president?"*
4. You should get a reply within a few seconds

---

## Verify everything works

### Checklist

| Step | How to verify |
|------|----------------|
| Backend running | http://localhost:8000/docs shows FastAPI Swagger UI |
| Frontend running | http://localhost:5173 loads the chat page |
| API key works | Send a message and receive an AI reply |
| Internet | Gemini calls fail offline — ensure Wi‑Fi is on |

### Backend health check

Visit: http://localhost:8000/api/health (if implemented in Phase 1)

Or open http://localhost:8000/docs and try the chat endpoint from Swagger.

---

## Add the US history PDF (Phase 4+)

Once Phase 4 is implemented:

1. Place your friend's PDF in the `knowledge/` folder:

```
ChatBot/knowledge/us-history-notes.pdf
```

2. Restart the backend (Ctrl+C in backend terminal, then run `uvicorn` again)
3. The app will load and chunk the PDF on startup or first request
4. Ask questions about topics covered in the PDF

**If the PDF is scanned (images only):** text extraction may fail. Ask for a text-based PDF or a `.txt`/`.md` export.

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

In each terminal window, press **Ctrl+C** to stop the server.

Your saved chats remain in `data/chats/` on disk.

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

- Backend: `uvicorn main:app --reload --port 8001` (and update frontend API URL if needed)
- Frontend: `npm run dev -- --port 5174`

### Chat returns an error / no response

1. Check backend terminal for error messages
2. Confirm `.env` has a valid `GEMINI_API_KEY`
3. Confirm `GEMINI_MODEL=gemini-2.5-flash`
4. Check internet connection
5. If `429 Too Many Requests` — wait 30–60 seconds; free tier has rate limits

### `401` / invalid API key

- Regenerate key at https://aistudio.google.com/apikey
- Update `.env` with no extra spaces or quotes around the key

### Frontend can't reach backend (CORS / network error)

- Ensure backend is running on port 8000
- Use http://localhost:5173 (not `127.0.0.1` mismatch issues are rare but try localhost consistently)

### Microphone not working (Phase 3+)

- Use **Chrome** or **Edge**
- Allow microphone permission when the browser prompts
- Windows Settings → Privacy → Microphone → allow desktop apps
- Microphone requires **HTTPS or localhost** — localhost is fine

### Voice output not working

- Click the **speaker/play** button on the assistant message (manual mode)
- Check system volume and browser tab is not muted

### PDF knowledge base not affecting answers (Phase 4+)

- Confirm file is in `knowledge/` folder
- Restart backend after adding the PDF
- Try a question that mentions content unique to the PDF

---

## FAQ

### Does my friend need to pay for anything?

No. Gemini API free tier + local app = no payment required for a demo.

### Can we use the same API key on two laptops?

Technically yes, but **not recommended** — each person should create their own free key. Shared keys are harder to revoke if leaked and share the same rate limits.

### Does the app work offline?

Partially. The UI and saved chats work offline, but **new AI replies require internet** (Gemini API).

### Where are chats stored?

Locally under `ChatBot/data/chats/`. Copy this folder to back up or move chats to another machine.

### Which browser should we use for the demo?

**Google Chrome** or **Microsoft Edge** on Windows.

### What if Gemini changes models or quotas?

Update `GEMINI_MODEL` in `.env`. Check https://ai.google.dev/gemini-api/docs/models for current model names.

---

## Setup checklist (friend's laptop)

Print or follow this list when setting up a new machine:

- [ ] Install Node.js LTS — verify `node --version`
- [ ] Install Python 3.10+ — verify `python --version`
- [ ] Copy or clone the ChatBot project
- [ ] Create Gemini API key at https://aistudio.google.com/apikey
- [ ] Copy `.env.example` → `.env` and paste API key
- [ ] Set `GEMINI_MODEL=gemini-2.5-flash`
- [ ] Backend: create venv, `pip install -r requirements.txt`
- [ ] Frontend: `npm install`
- [ ] Start backend (`uvicorn`) and frontend (`npm run dev`)
- [ ] Open http://localhost:5173 and send a test message
- [ ] (Later) Add PDF to `knowledge/` folder

---

## Document history

| Date | Change |
|------|--------|
| 2026-07-08 | Initial setup guide; Gemini model set to `gemini-2.5-flash` after API verification |
