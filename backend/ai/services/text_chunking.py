"""
Text Chunking Service.

Simple, deterministic text chunker for splitting research documents
into retrievable chunks with source metadata preservation.
"""

from typing import List, Optional, Dict, Any
from ai.core.schemas.retrieval import DocumentChunk


def chunk_text(
    text: str,
    chunk_size: int = 400,
    chunk_overlap: int = 50,
    source: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> List[DocumentChunk]:
    """
    Split text into deterministic chunks with overlap.

    Attempts to split on paragraph boundaries first, then sentence boundaries,
    falling back to character-level splitting when necessary.

    Args:
        text: The text to chunk.
        chunk_size: Maximum number of characters per chunk.
        chunk_overlap: Number of overlapping characters between consecutive chunks.
        source: Optional source label for all chunks.
        metadata: Optional shared metadata for all chunks.

    Returns:
        List of DocumentChunk instances with deterministic chunk_ids.
    """
    if not text or not text.strip():
        return []

    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if chunk_overlap < 0:
        raise ValueError("chunk_overlap must be non-negative")
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be less than chunk_size")

    text = text.strip()
    meta = metadata or {}
    source_label = source or "doc"

    # If text fits in one chunk, return it directly
    if len(text) <= chunk_size:
        return [
            DocumentChunk(
                chunk_id=f"{source_label}_chunk_0",
                content=text,
                source=source,
                metadata=meta,
            )
        ]

    # Split into paragraphs first
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    chunks: List[str] = []
    current_chunk = ""

    for para in paragraphs:
        # If a single paragraph exceeds chunk_size, split it by sentences
        if len(para) > chunk_size:
            # Flush current chunk first
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
                current_chunk = ""

            # Split paragraph by sentences
            sentence_chunks = _split_by_sentences(para, chunk_size, chunk_overlap)
            chunks.extend(sentence_chunks)
            continue

        # Try to fit paragraph into current chunk
        candidate = f"{current_chunk}\n\n{para}".strip() if current_chunk else para
        if len(candidate) <= chunk_size:
            current_chunk = candidate
        else:
            # Current chunk is full — flush and start new
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = para

    # Flush remaining
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # Apply overlap between consecutive chunks
    if chunk_overlap > 0 and len(chunks) > 1:
        overlapped = [chunks[0]]
        for i in range(1, len(chunks)):
            prev = chunks[i - 1]
            overlap_text = prev[-chunk_overlap:] if len(prev) >= chunk_overlap else prev
            overlapped.append(f"{overlap_text} {chunks[i]}".strip())
        chunks = overlapped

    # Build DocumentChunk instances
    return [
        DocumentChunk(
            chunk_id=f"{source_label}_chunk_{i}",
            content=chunk,
            source=source,
            metadata=meta,
        )
        for i, chunk in enumerate(chunks)
    ]


def _split_by_sentences(
    text: str,
    chunk_size: int,
    chunk_overlap: int,
) -> List[str]:
    """Split text by sentence boundaries into chunks."""
    # Simple sentence splitting on '. ', '! ', '? '
    import re
    sentences = re.split(r'(?<=[.!?])\s+', text)

    chunks: List[str] = []
    current = ""

    for sentence in sentences:
        candidate = f"{current} {sentence}".strip() if current else sentence
        if len(candidate) <= chunk_size:
            current = candidate
        else:
            if current.strip():
                chunks.append(current.strip())
            # If a single sentence exceeds chunk_size, force-split by characters
            if len(sentence) > chunk_size:
                char_chunks = _split_by_chars(sentence, chunk_size, chunk_overlap)
                chunks.extend(char_chunks)
                current = ""
            else:
                current = sentence

    if current.strip():
        chunks.append(current.strip())

    return chunks


def _split_by_chars(text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
    """Last-resort character-level splitting."""
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start += chunk_size - chunk_overlap
    return chunks
