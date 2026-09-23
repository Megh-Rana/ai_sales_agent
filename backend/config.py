"""
Central configuration for the AI Sales Voice Agent pipeline.
Tuned for RTX 5050 Laptop GPU (8GB VRAM).
"""

import os
from dotenv import load_dotenv

# ─── Paths & Environment Loading ────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE_PROFILES_DIR = os.path.join(PROJECT_ROOT, "voice_profiles")
SAMPLES_DIR = os.path.join(PROJECT_ROOT, "samples")
RECORDINGS_DIR = os.path.join(PROJECT_ROOT, "recordings")

# Ensure .env is loaded reliably from backend directory, parent directory, or cwd
_parent_dir = os.path.dirname(PROJECT_ROOT)
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))
load_dotenv(os.path.join(_parent_dir, ".env"))
load_dotenv()

# Check for Sarvam API key availability
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "").strip()
HAS_SARVAM_KEY = bool(
    SARVAM_API_KEY
    and SARVAM_API_KEY.lower() not in ("your_sarvam_api_key_here", "your_api_key_here", "none", "null")
)

# ─── Audio Parameters ───────────────────────────────────────────────
SAMPLE_RATE = 16000          # 16kHz for STT input
TTS_SAMPLE_RATE = 24000      # 24kHz for TTS output (Sarvam & Edge TTS)
CHANNELS = 1                 # Mono
DTYPE = "int16"              # PCM16
CHUNK_DURATION_S = 0.3       # 300ms audio chunks — more responsive VAD
SILENCE_THRESHOLD_S = 0.6    # Seconds of silence before considering turn complete
VAD_THRESHOLD = 0.5          # Silero VAD confidence threshold

# ─── STT Config (Sarvam saaras:v3 with Whisper fallback) ────────────
# Speech-to-Text uses Sarvam Cloud API when available, falls back to local Whisper
STT_PROVIDER = os.getenv("STT_PROVIDER", "sarvam")
SARVAM_STT_MODEL = "saaras:v3"

# Local Whisper fallback settings
STT_MODEL_SIZE = os.getenv("STT_MODEL_SIZE", "base")  # tiny, base, small, medium, large
STT_DEVICE = os.getenv("STT_DEVICE", "cpu")  # cpu or cuda
STT_COMPUTE_TYPE = os.getenv("STT_COMPUTE_TYPE", "int8")  # int8, float16, float32
STT_LANGUAGE = None  # Auto-detect by default
STT_BEAM_SIZE = 3    # Beam search size for better accuracy
STT_VAD_FILTER = True  # Enable VAD filtering to remove silence

# ─── TTS Config (Exclusively Sarvam Bulbul v3) ──────────────────────
# Text-to-Speech strictly uses Sarvam Cloud API
TTS_PROVIDER = "sarvam"
SARVAM_WS_URL = "wss://api.sarvam.ai/text-to-speech/ws"

TTS_DEFAULT_LANGUAGE = "en"

# Speaker voice — pick one from the 30+ Sarvam voices (e.g. ishita, kabir, shubh, priya).
TTS_SPEAKER = "ishita"

# Sarvam language codes — maps our internal codes to BCP-47
SARVAM_LANG_MAP = {
    "en": "en-IN",
    "hi": "hi-IN",
    "mr": "mr-IN",
    "gu": "gu-IN",
}

# ─── LLM & AI Provider Config ─────────────────────────────────────────
# LLM Provider: Use Ollama (local Gemma model) by default for conversational AI
# Only use Sarvam for STT/TTS, not for LLM
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")  # Changed from "sarvam" to "ollama"
AI_PROVIDER = os.getenv("AI_PROVIDER", "ollama")     # Changed from "sarvam" to "ollama"
SARVAM_LLM_MODEL = os.getenv("SARVAM_LLM_MODEL", "sarvam-105b")

# AI Model defaults to Ollama Gemma
AI_MODEL = os.getenv("AI_MODEL", "gemma3:4b")  # Gemma 3 4B model via Ollama
AI_TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.5"))
AI_TIMEOUT = float(os.getenv("AI_TIMEOUT", "60.0"))

# Param-1-7B HuggingFace Model ID (alternative local model)
PARAM_MODEL_ID = "arunvenkat17/Param-1-7B-GodMode-4bit"

# Ollama configuration for local Gemma model
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")  # Gemma 3 4B - lightweight and fast
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_TEMPERATURE = float(os.getenv("OLLAMA_TEMPERATURE", "0.5"))
OLLAMA_NUM_CTX = int(os.getenv("OLLAMA_NUM_CTX", "8192"))  # Increased to 8K for better context
OLLAMA_NUM_GPU = int(os.getenv("OLLAMA_NUM_GPU", "99"))   # All layers on GPU

# ─── Streaming Pipeline ──────────────────────────────────────────────
# Enables LLM → TTS sentence-level streaming:
# Sentences are synthesized and played as they arrive from the LLM,
# dramatically reducing time-to-first-audio.
STREAMING_PIPELINE = True

# Minimum characters before flushing a partial sentence to TTS.
# Lower = more responsive but more TTS requests; higher = fewer requests but
# waits longer before playing the first chunk.
STREAM_MIN_CHARS = 40

# ─── Language Support ────────────────────────────────────────────────
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "gu": "Gujarati",
}

# ─── Pipeline ────────────────────────────────────────────────────────
MAX_CONVERSATION_TURNS = 20
MAX_RESPONSE_TOKENS = 150    # Short responses for conversational pace — 1-3 sentences
