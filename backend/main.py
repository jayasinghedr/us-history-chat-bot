from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import GEMINI_MODEL
from llm import chat

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


class ChatRequest(BaseModel):
    messages: list[Message] = Field(min_length=1)


class ChatResponse(BaseModel):
    message: Message


@app.get("/api/health")
def health():
    return {"status": "ok", "model": GEMINI_MODEL}


@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(body: ChatRequest):
    if body.messages[-1].role != "user":
        raise HTTPException(status_code=400, detail="Last message must be from the user.")

    try:
        reply = chat([m.model_dump() for m in body.messages])
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM error: {exc}") from exc

    return ChatResponse(message=Message(role="assistant", content=reply))
