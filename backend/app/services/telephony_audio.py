"""
Telephony Audio Engine for Vidur AI Sales Agent.
Bridges Twilio carrier trunking with your own internal TTS Engine (Sarvam Bulbul v3 / Edge-TTS).
Synthesizes speech on your infrastructure, stores audio in an in-memory cache,
and serves broadcast-quality WAV audio streams to Twilio via <Play>.
"""

import io
import os
import time
import uuid
import logging
from typing import Dict, Optional, Tuple
import numpy as np
import soundfile as sf

import config
from tts.engine import TTSEngine

logger = logging.getLogger("sales_platform.telephony_audio")

# In-memory audio buffer: audio_id -> { "data": bytes, "created_at": float, "text": str }
_AUDIO_CACHE: Dict[str, Dict] = {}
_MAX_CACHE_ITEMS = 500
_CACHE_TTL_SECONDS = 3600  # 1 hour

# Global singleton TTS engine
_tts_engine: Optional[TTSEngine] = None


def get_internal_tts() -> TTSEngine:
    """Lazily initializes and returns the internal Sarvam/Edge-TTS engine."""
    global _tts_engine
    if _tts_engine is None:
        _tts_engine = TTSEngine(gender="female")
        _tts_engine.load()
    return _tts_engine


def cleanup_audio_cache():
    """Removes expired audio entries from the cache."""
    now = time.time()
    expired = [k for k, v in _AUDIO_CACHE.items() if now - v["created_at"] > _CACHE_TTL_SECONDS]
    for k in expired:
        _AUDIO_CACHE.pop(k, None)

    # If still too large, prune oldest
    if len(_AUDIO_CACHE) > _MAX_CACHE_ITEMS:
        sorted_keys = sorted(_AUDIO_CACHE.keys(), key=lambda k: _AUDIO_CACHE[k]["created_at"])
        to_remove = sorted_keys[: len(_AUDIO_CACHE) - _MAX_CACHE_ITEMS]
        for k in to_remove:
            _AUDIO_CACHE.pop(k, None)


AUDIO_DISK_CACHE_DIR = "/tmp/ai_sales_audio"
os.makedirs(AUDIO_DISK_CACHE_DIR, exist_ok=True)


def store_audio_bytes(wav_bytes: bytes, text: str = "") -> str:
    """Stores generated WAV bytes in the audio cache and returns the audio_id."""
    cleanup_audio_cache()
    audio_id = str(uuid.uuid4())
    _AUDIO_CACHE[audio_id] = {
        "data": wav_bytes,
        "created_at": time.time(),
        "text": text,
    }
    try:
        os.makedirs(AUDIO_DISK_CACHE_DIR, exist_ok=True)
        file_path = os.path.join(AUDIO_DISK_CACHE_DIR, f"{audio_id}.wav")
        with open(file_path, "wb") as f:
            f.write(wav_bytes)
    except Exception as e:
        logger.warning(f"[Telephony Audio] Could not persist audio to disk: {e}")
    return audio_id


def get_audio_bytes(audio_id: str) -> Optional[bytes]:
    """Retrieves WAV audio bytes by audio_id, checking memory cache then disk."""
    clean_id = audio_id.replace(".wav", "").strip()
    item = _AUDIO_CACHE.get(clean_id)
    if item:
        return item["data"]
    file_path = os.path.join(AUDIO_DISK_CACHE_DIR, f"{clean_id}.wav")
    if os.path.isfile(file_path):
        try:
            with open(file_path, "rb") as f:
                data = f.read()
                _AUDIO_CACHE[clean_id] = {
                    "data": data,
                    "created_at": time.time(),
                    "text": "",
                }
                return data
        except Exception:
            pass
    return None


def synthesize_speech_to_wav(
    text: str,
    language: str = "en",
    sample_rate: int = config.TTS_SAMPLE_RATE,
) -> Tuple[str, bytes]:
    """
    Synthesizes speech text using YOUR internal TTSEngine (Sarvam Bulbul v3 / Edge-TTS),
    converts it to a standard PCM 16-bit WAV file, stores it in the audio cache,
    and returns (audio_id, wav_bytes).
    """
    if not text or not text.strip():
        # 0.5s of silence
        silence = np.zeros(int(sample_rate * 0.5), dtype=np.float32)
        buf = io.BytesIO()
        sf.write(buf, silence, sample_rate, format="WAV", subtype="PCM_16")
        wav_bytes = buf.getvalue()
        audio_id = store_audio_bytes(wav_bytes, "silence")
        return audio_id, wav_bytes

    tts = get_internal_tts()
    try:
        t0 = time.time()
        audio_np = tts.synthesize(text.strip(), language=language)
        if audio_np is None or len(audio_np) == 0:
            audio_np = np.zeros(int(sample_rate * 0.5), dtype=np.float32)

        buf = io.BytesIO()
        sf.write(buf, audio_np, sample_rate, format="WAV", subtype="PCM_16")
        wav_bytes = buf.getvalue()
        elapsed = time.time() - t0
        logger.info(f"[Telephony Audio] Synthesized {len(text)} chars with internal TTS in {elapsed:.2f}s ({len(wav_bytes)} bytes)")

        audio_id = store_audio_bytes(wav_bytes, text.strip())
        return audio_id, wav_bytes

    except Exception as e:
        logger.error(f"[Telephony Audio] Internal TTS synthesis failed: {e}")
        # Resilient fallback: generate brief silence WAV so call doesn't drop
        silence = np.zeros(int(sample_rate * 0.5), dtype=np.float32)
        buf = io.BytesIO()
        sf.write(buf, silence, sample_rate, format="WAV", subtype="PCM_16")
        wav_bytes = buf.getvalue()
        audio_id = store_audio_bytes(wav_bytes, "fallback_silence")
        return audio_id, wav_bytes
