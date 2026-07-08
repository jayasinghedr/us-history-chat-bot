import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

from config import ROOT_DIR

CHATS_DIR = ROOT_DIR / "data" / "chats"
UUID_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _validate_chat_id(chat_id: str) -> None:
    if not UUID_PATTERN.match(chat_id):
        raise ValueError("Invalid chat id.")


def _chat_path(chat_id: str) -> Path:
    _validate_chat_id(chat_id)
    return CHATS_DIR / chat_id


def _title_from_messages(messages: list[dict]) -> str:
    for msg in messages:
        if msg.get("role") == "user":
            content = msg.get("content", "").strip()
            if len(content) > 60:
                return content[:57] + "..."
            return content or "New chat"
    return "New chat"


def create_chat_id() -> str:
    return str(uuid.uuid4())


def list_chats() -> list[dict]:
    if not CHATS_DIR.exists():
        return []

    chats = []
    for path in CHATS_DIR.iterdir():
        if not path.is_dir():
            continue
        meta_file = path / "meta.json"
        if not meta_file.exists():
            continue
        meta = json.loads(meta_file.read_text(encoding="utf-8"))
        chats.append(
            {
                "id": meta["id"],
                "title": meta.get("title", "New chat"),
                "created_at": meta.get("created_at"),
                "updated_at": meta.get("updated_at"),
            }
        )

    chats.sort(key=lambda c: c.get("updated_at") or "", reverse=True)
    return chats


def get_chat(chat_id: str) -> dict:
    chat_dir = _chat_path(chat_id)
    meta_file = chat_dir / "meta.json"
    messages_file = chat_dir / "messages.json"

    if not meta_file.exists():
        raise FileNotFoundError(f"Chat {chat_id} not found.")

    meta = json.loads(meta_file.read_text(encoding="utf-8"))
    messages = []
    if messages_file.exists():
        data = json.loads(messages_file.read_text(encoding="utf-8"))
        messages = data.get("messages", [])

    return {
        "id": meta["id"],
        "title": meta.get("title", "New chat"),
        "created_at": meta.get("created_at"),
        "updated_at": meta.get("updated_at"),
        "messages": messages,
    }


def save_messages(chat_id: str, messages: list[dict]) -> dict:
    _validate_chat_id(chat_id)
    if not messages:
        raise ValueError("Cannot save an empty conversation.")

    chat_dir = _chat_path(chat_id)
    chat_dir.mkdir(parents=True, exist_ok=True)

    meta_file = chat_dir / "meta.json"
    messages_file = chat_dir / "messages.json"
    now = _now_iso()

    if meta_file.exists():
        meta = json.loads(meta_file.read_text(encoding="utf-8"))
        meta["updated_at"] = now
        if meta.get("title") in (None, "", "New chat"):
            meta["title"] = _title_from_messages(messages)
    else:
        meta = {
            "id": chat_id,
            "title": _title_from_messages(messages),
            "created_at": now,
            "updated_at": now,
        }

    stamped = []
    for msg in messages:
        entry = {"role": msg["role"], "content": msg["content"]}
        if msg.get("timestamp"):
            entry["timestamp"] = msg["timestamp"]
        else:
            entry["timestamp"] = now
        if msg.get("audio_file"):
            entry["audio_file"] = msg["audio_file"]
        stamped.append(entry)

    meta_file.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    messages_file.write_text(
        json.dumps({"messages": stamped}, indent=2),
        encoding="utf-8",
    )

    return get_chat(chat_id)


AUDIO_FILENAME_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webm$",
    re.IGNORECASE,
)


def save_audio(chat_id: str, data: bytes) -> str:
    _validate_chat_id(chat_id)
    if not data:
        raise ValueError("Audio data is empty.")

    audio_dir = _chat_path(chat_id) / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4()}.webm"
    (audio_dir / filename).write_bytes(data)
    return filename


def get_audio_path(chat_id: str, filename: str) -> Path:
    _validate_chat_id(chat_id)
    if not AUDIO_FILENAME_PATTERN.match(filename):
        raise ValueError("Invalid audio filename.")

    path = _chat_path(chat_id) / "audio" / filename
    if not path.exists():
        raise FileNotFoundError(f"Audio file {filename} not found.")
    return path
