from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from config import GEMINI_MODEL
from knowledge import get_status, load_knowledge_base, retrieve_relevant_chunks
from llm import chat
from storage import (
    create_chat_id,
    delete_chat,
    get_audio_path,
    get_chat,
    list_chats,
    save_audio,
    save_messages,
)

app = FastAPI(title="US History Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1)
    audio_file: str | None = None


class ChatRequest(BaseModel):
    messages: list[Message] = Field(min_length=1)


class ChatResponse(BaseModel):
    message: Message


class NewChatResponse(BaseModel):
    id: str


class ChatSummary(BaseModel):
    id: str
    title: str
    created_at: str | None = None
    updated_at: str | None = None


class ChatDetail(BaseModel):
    id: str
    title: str
    created_at: str | None = None
    updated_at: str | None = None
    messages: list[Message] = []


class SaveMessagesRequest(BaseModel):
    messages: list[Message] = Field(min_length=1)


class AudioUploadResponse(BaseModel):
    filename: str


class KnowledgeStatus(BaseModel):
    loaded: bool
    filename: str | None = None
    chunk_count: int = 0
    error: str | None = None


def _llm_messages(messages: list[Message]) -> list[dict]:
    return [{"role": m.role, "content": m.content} for m in messages]


@app.on_event("startup")
def startup_load_knowledge():
    load_knowledge_base()


@app.get("/api/health")
def health():
    kb = get_status()
    return {
        "status": "ok",
        "model": GEMINI_MODEL,
        "knowledge_base": kb,
    }


@app.get("/api/knowledge/status", response_model=KnowledgeStatus)
def knowledge_status():
    return get_status()


@app.post("/api/knowledge/reload", response_model=KnowledgeStatus)
def knowledge_reload():
    return load_knowledge_base()


@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(body: ChatRequest):
    if body.messages[-1].role != "user":
        raise HTTPException(status_code=400, detail="Last message must be from the user.")

    user_question = body.messages[-1].content
    context_chunks = retrieve_relevant_chunks(user_question)

    try:
        reply = chat(_llm_messages(body.messages), context_chunks=context_chunks)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM error: {exc}") from exc

    return ChatResponse(message=Message(role="assistant", content=reply))


@app.post("/api/chats", response_model=NewChatResponse)
def create_chat():
    return NewChatResponse(id=create_chat_id())


@app.get("/api/chats", response_model=list[ChatSummary])
def list_chats_endpoint():
    return list_chats()


@app.get("/api/chats/{chat_id}", response_model=ChatDetail)
def get_chat_endpoint(chat_id: str):
    try:
        return get_chat(chat_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.delete("/api/chats/{chat_id}")
def delete_chat_endpoint(chat_id: str):
    try:
        delete_chat(chat_id)
        return {"ok": True}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/api/chats/{chat_id}/messages", response_model=ChatDetail)
def save_messages_endpoint(chat_id: str, body: SaveMessagesRequest):
    try:
        return save_messages(chat_id, [m.model_dump() for m in body.messages])
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/chats/{chat_id}/audio", response_model=AudioUploadResponse)
async def upload_audio(chat_id: str, file: UploadFile = File(...)):
    try:
        data = await file.read()
        filename = save_audio(chat_id, data)
        return AudioUploadResponse(filename=filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/chats/{chat_id}/audio/{filename}")
def get_audio(chat_id: str, filename: str):
    try:
        path = get_audio_path(chat_id, filename)
        return FileResponse(path, media_type="audio/webm")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
