import re
from pathlib import Path

from config import ROOT_DIR

KNOWLEDGE_DIR = ROOT_DIR / "knowledge"
CHUNK_SIZE = 600
CHUNK_OVERLAP = 100
TOP_K = 5

_chunks: list[str] = []
_meta: dict = {
    "loaded": False,
    "filename": None,
    "chunk_count": 0,
}


def _normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _extract_pdf(path: Path) -> str:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    parts = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return _normalize_whitespace("\n".join(parts))


def _extract_text_file(path: Path) -> str:
    return _normalize_whitespace(path.read_text(encoding="utf-8"))


def _extract_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return _extract_pdf(path)
    if suffix in {".txt", ".md"}:
        return _extract_text_file(path)
    raise ValueError(f"Unsupported knowledge file type: {suffix}")


def _chunk_text(text: str) -> list[str]:
    if not text:
        return []

    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start = end - CHUNK_OVERLAP
    return chunks


def load_knowledge_base() -> dict:
    global _chunks, _meta

    _chunks = []
    _meta = {"loaded": False, "filename": None, "chunk_count": 0}

    if not KNOWLEDGE_DIR.exists():
        KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)
        return get_status()

    for pattern in ("*.pdf", "*.txt", "*.md"):
        files = sorted(KNOWLEDGE_DIR.glob(pattern))
        if not files:
            continue

        source = files[0]
        try:
            text = _extract_text(source)
        except Exception as exc:
            _meta = {
                "loaded": False,
                "filename": source.name,
                "chunk_count": 0,
                "error": str(exc),
            }
            return get_status()

        if not text:
            _meta = {
                "loaded": False,
                "filename": source.name,
                "chunk_count": 0,
                "error": "No text could be extracted from the file.",
            }
            return get_status()

        _chunks = _chunk_text(text)
        _meta = {
            "loaded": True,
            "filename": source.name,
            "chunk_count": len(_chunks),
            "error": None,
        }
        return get_status()

    return get_status()


def get_status() -> dict:
    return dict(_meta)


def retrieve_relevant_chunks(query: str, top_k: int = TOP_K) -> list[str]:
    if not _chunks:
        return []

    query_words = {
        word
        for word in re.findall(r"[a-z0-9']+", query.lower())
        if len(word) > 2
    }
    if not query_words:
        return _chunks[:1]

    scored = []
    for chunk in _chunks:
        chunk_words = set(re.findall(r"[a-z0-9']+", chunk.lower()))
        score = len(query_words & chunk_words)
        if score > 0:
            scored.append((score, chunk))

    if not scored:
        return []

    scored.sort(key=lambda item: item[0], reverse=True)
    return [chunk for _, chunk in scored[:top_k]]
