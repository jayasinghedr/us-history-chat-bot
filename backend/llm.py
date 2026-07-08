import google.generativeai as genai
from google.generativeai.types import HarmBlockThreshold, HarmCategory

from config import GEMINI_API_KEY, GEMINI_MODEL, SYSTEM_PROMPT

ROLE_MAP = {"user": "user", "assistant": "model"}


def build_system_prompt(context_chunks: list[str] | None = None) -> str:
    if not context_chunks:
        return SYSTEM_PROMPT

    material = "\n\n---\n\n".join(context_chunks)
    return f"""{SYSTEM_PROMPT}

Reference material from the knowledge base (use when relevant to the user's question):
---
{material}
---

When reference material is relevant, prioritize details from it. Blend it with your general US history knowledge when helpful. If the question is not covered in the reference, answer from general US history knowledge."""


def _configure() -> None:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set. Copy .env.example to .env and add your key.")
    genai.configure(api_key=GEMINI_API_KEY)


def _to_gemini_history(messages: list[dict]) -> list[dict]:
    history = []
    for msg in messages[:-1]:
        role = ROLE_MAP.get(msg["role"])
        if role:
            history.append({"role": role, "parts": [msg["content"]]})
    return history


def chat(messages: list[dict], context_chunks: list[str] | None = None) -> str:
    if not messages:
        raise ValueError("At least one message is required.")
    if messages[-1]["role"] != "user":
        raise ValueError("Last message must be from the user.")

    _configure()

    system_instruction = build_system_prompt(context_chunks)

    model = genai.GenerativeModel(
        GEMINI_MODEL,
        system_instruction=system_instruction,
        safety_settings={
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
    )

    history = _to_gemini_history(messages)
    last_message = messages[-1]["content"]

    if history:
        session = model.start_chat(history=history)
        response = session.send_message(last_message)
    else:
        response = model.generate_content(last_message)

    return response.text
