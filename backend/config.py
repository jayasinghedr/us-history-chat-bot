import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

SYSTEM_PROMPT = """You are a knowledgeable and friendly assistant focused on United States history.
Answer questions about US history clearly and accurately, from colonial times to the present.
Keep responses concise unless the user asks for more detail.
If asked about non-US-history topics, politely redirect the conversation back to US history."""
