"""
Semantic Retrieval Service.

Simple in-memory semantic retrieval using cosine similarity.
No vector database dependencies. Deterministic and inspectable.
"""

from typing import List, Optional, Dict, Any
from ai.core.schemas.retrieval import DocumentChunk, RetrievedEvidence
from ai.services.embeddings import EmbeddingService


class SemanticRetrievalService:
    """
    In-memory semantic retrieval service.

    Maintains an index of document chunks with embeddings.
    Supports top-k retrieval ranked by cosine similarity.
    """

    def __init__(self, embedding_service: Optional[EmbeddingService] = None):
        """
        Initialize retrieval service.

        Args:
            embedding_service: Optional EmbeddingService instance.
                               If None, a default instance is created.
        """
        self._embedding_service = embedding_service
        self._chunks: List[DocumentChunk] = []

    @property
    def embedding_service(self) -> EmbeddingService:
        """Lazy initialization of embedding service."""
        if self._embedding_service is None:
            self._embedding_service = EmbeddingService()
        return self._embedding_service

    @property
    def corpus_size(self) -> int:
        """Return the number of chunks in the index."""
        return len(self._chunks)

    def add_chunk(self, chunk: DocumentChunk) -> None:
        """
        Add a single document chunk to the index.

        If the chunk has no embedding, one is generated via the EmbeddingService.

        Args:
            chunk: DocumentChunk to add.
        """
        if chunk.embedding is None:
            embedding = self.embedding_service.embed_text(chunk.content)
            chunk = chunk.model_copy(update={"embedding": embedding})
        self._chunks.append(chunk)

    def add_chunks(self, chunks: List[DocumentChunk]) -> None:
        """
        Add multiple document chunks to the index.

        Chunks without embeddings will have them generated in batch.

        Args:
            chunks: List of DocumentChunks to add.
        """
        # Separate chunks that need embedding from those that already have them
        need_embedding = [c for c in chunks if c.embedding is None]
        have_embedding = [c for c in chunks if c.embedding is not None]

        self._chunks.extend(have_embedding)

        if need_embedding:
            texts = [c.content for c in need_embedding]
            embeddings = self.embedding_service.embed_texts(texts)
            for chunk, emb in zip(need_embedding, embeddings):
                updated = chunk.model_copy(update={"embedding": emb})
                self._chunks.append(updated)

    def add_texts(
        self,
        texts: List[str],
        source: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Convenience method to add raw text strings.

        Args:
            texts: List of text strings to index.
            source: Optional source label for all texts.
            metadata: Optional shared metadata.
        """
        chunks = [
            DocumentChunk(
                chunk_id=f"{source or 'doc'}_chunk_{i}",
                content=text,
                source=source,
                metadata=metadata or {},
            )
            for i, text in enumerate(texts)
        ]
        self.add_chunks(chunks)

    def query(
        self,
        query_text: str,
        top_k: int = 5,
        min_similarity: float = 0.0,
    ) -> List[RetrievedEvidence]:
        """
        Query the index with a text string and return top-k results.

        Args:
            query_text: The query text.
            top_k: Maximum number of results to return.
            min_similarity: Minimum similarity threshold.

        Returns:
            List of RetrievedEvidence sorted descending by similarity.
            Returns empty list if corpus or query is empty.
        """
        if not query_text or not query_text.strip():
            return []
        if not self._chunks:
            return []

        query_vector = self.embedding_service.embed_text(query_text)
        return self.query_by_vector(query_vector, top_k=top_k, min_similarity=min_similarity)

    def query_by_vector(
        self,
        query_vector: List[float],
        top_k: int = 5,
        min_similarity: float = 0.0,
    ) -> List[RetrievedEvidence]:
        """
        Query the index with a pre-computed vector and return top-k results.

        Args:
            query_vector: The query embedding vector.
            top_k: Maximum number of results to return.
            min_similarity: Minimum similarity threshold.

        Returns:
            List of RetrievedEvidence sorted descending by similarity.
            Returns empty list if corpus is empty or query_vector is empty.
        """
        if not query_vector:
            return []
        if not self._chunks:
            return []

        results = []
        for chunk in self._chunks:
            if chunk.embedding is None:
                continue
            sim = EmbeddingService.similarity(query_vector, chunk.embedding)
            if sim >= min_similarity:
                results.append(
                    RetrievedEvidence(
                        chunk_id=chunk.chunk_id,
                        content=chunk.content,
                        similarity=round(sim, 6),
                        source=chunk.source,
                        metadata=chunk.metadata,
                    )
                )

        # Sort descending by similarity
        results.sort(key=lambda r: r.similarity, reverse=True)
        return results[:top_k]

    def clear(self) -> None:
        """Clear all indexed chunks."""
        self._chunks.clear()
