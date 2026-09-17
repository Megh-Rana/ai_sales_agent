"""
Retrieval Schemas.

Defines Pydantic models for semantic retrieval results and document chunks.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class DocumentChunk(BaseModel):
    """A chunk of text with source metadata and optional embedding."""

    chunk_id: str = Field(
        description="Unique identifier for this chunk"
    )
    content: str = Field(
        description="Text content of the chunk"
    )
    source: Optional[str] = Field(
        default=None,
        description="Source identifier or label"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Arbitrary metadata associated with this chunk"
    )
    embedding: Optional[List[float]] = Field(
        default=None,
        description="Pre-computed embedding vector (optional)"
    )


class RetrievedEvidence(BaseModel):
    """A retrieval result with similarity score and metadata."""

    chunk_id: str = Field(
        description="ID of the retrieved chunk"
    )
    content: str = Field(
        description="Text content of the retrieved chunk"
    )
    similarity: float = Field(
        ge=0.0,
        le=1.0,
        description="Cosine similarity score (0.0 to 1.0)"
    )
    source: Optional[str] = Field(
        default=None,
        description="Source identifier or label"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata associated with the retrieved chunk"
    )
