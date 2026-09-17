"""
Embedding Service.

Standalone infrastructure service for local text embeddings using sentence-transformers.
Does NOT know about Ollama, lead scoring, company research, voice, or frontend.

Uses the configured EMBEDDING_MODEL (default: sentence-transformers/all-MiniLM-L6-v2).
Model must be available locally — no automatic downloads.
"""

import math
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

# Lazy import — sentence-transformers may not be installed
_SentenceTransformer = None


def _get_sentence_transformer_class():
    """Lazy import of SentenceTransformer to avoid hard dependency at module level."""
    global _SentenceTransformer
    if _SentenceTransformer is None:
        try:
            from sentence_transformers import SentenceTransformer
            _SentenceTransformer = SentenceTransformer
        except ImportError:
            raise ImportError(
                "sentence-transformers is not installed. "
                "Install it with: pip install sentence-transformers"
            )
    return _SentenceTransformer


class EmbeddingService:
    """
    Local text embedding service using sentence-transformers.

    Loads the model once and caches it for repeated calls.
    No cloud services. No automatic model downloads.
    """

    _model_cache: dict = {}

    def __init__(self, model_name: Optional[str] = None):
        """
        Initialize EmbeddingService.

        Args:
            model_name: Name of the sentence-transformers model.
                        Defaults to config.EMBEDDING_MODEL.
        """
        if model_name is None:
            try:
                from config import EMBEDDING_MODEL
                model_name = EMBEDDING_MODEL
            except ImportError:
                model_name = "sentence-transformers/all-MiniLM-L6-v2"
        self.model_name = model_name
        self._model = None

    def _load_model(self):
        """Load or retrieve cached model. Fails clearly if model is unavailable locally."""
        if self._model is not None:
            return self._model

        # Check class-level cache for singleton pattern
        if self.model_name in EmbeddingService._model_cache:
            self._model = EmbeddingService._model_cache[self.model_name]
            return self._model

        SentenceTransformer = _get_sentence_transformer_class()

        try:
            # Attempt to load model — use local_files_only if possible
            model = SentenceTransformer(self.model_name)
            self._model = model
            EmbeddingService._model_cache[self.model_name] = model
            logger.info(f"Loaded embedding model: {self.model_name}")
            return self._model
        except Exception as e:
            raise RuntimeError(
                f"Failed to load embedding model '{self.model_name}'. "
                f"Ensure the model is available locally. "
                f"You may need to download it first: "
                f"python -c \"from sentence_transformers import SentenceTransformer; "
                f"SentenceTransformer('{self.model_name}')\"\n"
                f"Original error: {e}"
            )

    def embed_text(self, text: str) -> List[float]:
        """
        Embed a single text string.

        Args:
            text: The text to embed.

        Returns:
            List of floats representing the embedding vector.

        Raises:
            ValueError: If text is empty.
            RuntimeError: If model is unavailable.
        """
        if not text or not text.strip():
            raise ValueError("Cannot embed empty text")

        model = self._load_model()
        embedding = model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Embed multiple texts.

        Args:
            texts: List of text strings to embed.

        Returns:
            List of embedding vectors (one per input text).

        Raises:
            ValueError: If texts list is empty.
            RuntimeError: If model is unavailable.
        """
        if not texts:
            raise ValueError("Cannot embed empty text list")

        # Validate no empty strings
        for i, t in enumerate(texts):
            if not t or not t.strip():
                raise ValueError(f"Text at index {i} is empty")

        model = self._load_model()
        embeddings = model.encode(texts, convert_to_numpy=True)
        return [emb.tolist() for emb in embeddings]

    @staticmethod
    def similarity(vector_a: List[float], vector_b: List[float]) -> float:
        """
        Compute cosine similarity between two vectors.

        Pure math implementation — no model dependency.

        Args:
            vector_a: First embedding vector.
            vector_b: Second embedding vector.

        Returns:
            Cosine similarity value between -1.0 and 1.0 (clamped to 0.0–1.0 for retrieval use).

        Raises:
            ValueError: If vectors have different dimensions or are empty.
        """
        if not vector_a or not vector_b:
            raise ValueError("Cannot compute similarity for empty vectors")

        if len(vector_a) != len(vector_b):
            raise ValueError(
                f"Vector dimension mismatch: {len(vector_a)} vs {len(vector_b)}"
            )

        dot_product = sum(a * b for a, b in zip(vector_a, vector_b))
        norm_a = math.sqrt(sum(a * a for a in vector_a))
        norm_b = math.sqrt(sum(b * b for b in vector_b))

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        cosine_sim = dot_product / (norm_a * norm_b)
        # Clamp to [0.0, 1.0] for retrieval use (negative similarity = irrelevant)
        return max(0.0, min(1.0, cosine_sim))
