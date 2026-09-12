"""
Central configuration for the AI Sales Voice Agent pipeline.
Tuned for RTX 5050 Laptop GPU (8GB VRAM).
"""

import os
from dotenv import load_dotenv

load_dotenv()  # loads .env from project root

# ─── Paths ──────────────────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE_PROFILES_DIR = os.path.join(PROJECT_ROOT, "voice_profiles")
SAMPLES_DIR = os.path.join(PROJECT_ROOT, "samples")
RECORDINGS_DIR = os.path.join(PROJECT_ROOT, "recordings")

# ─── Audio Parameters ───────────────────────────────────────────────
SAMPLE_RATE = 16000          # 16kHz for STT input
TTS_SAMPLE_RATE = 24000      # 24kHz for Edge TTS output
CHANNELS = 1                 # Mono
DTYPE = "int16"              # PCM16
CHUNK_DURATION_S = 0.3       # 300ms audio chunks — more responsive VAD
SILENCE_THRESHOLD_S = 0.6    # Seconds of silence before considering turn complete
VAD_THRESHOLD = 0.5          # Silero VAD confidence threshold

# ─── STT (faster-whisper) ───────────────────────────────────────────
STT_MODEL_SIZE = "small"     # small=~0.5GB VRAM | medium=~1.5GB | large-v3=~3GB
STT_DEVICE = "cuda"
STT_COMPUTE_TYPE = "float16" # float16 for GPU
STT_BEAM_SIZE = 1            # 1 = greedy decoding, much faster for conversational STT (was 5)
STT_LANGUAGE = None          # None = auto-detect language
STT_VAD_FILTER = True        # Use built-in VAD filter

# ─── TTS (Sarvam Bulbul v3) ─────────────────────────────────────────
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")
SARVAM_WS_URL = "wss://api.sarvam.ai/text-to-speech/ws"

TTS_DEFAULT_LANGUAGE = "en"

# Speaker voice — pick one from the 30+ Sarvam voices.
# Good sales agent options: Shubh (warm male), Ishita (clear female),
# Kabir (confident male), Priya (friendly female)
TTS_SPEAKER = "ishita"

# Sarvam language codes — maps our internal codes to BCP-47
SARVAM_LANG_MAP = {
    "en": "en-IN",
    "hi": "hi-IN",
    "mr": "mr-IN",
    "gu": "gu-IN",
}

# ─── LLM (Ollama) ───────────────────────────────────────────────────
# Recommended models (in order of preference for conversational latency):
#   - qwen2.5:3b-instruct     (~1.8GB VRAM, fastest, good quality)
#   - llama3.2:3b-instruct    (~2GB VRAM, fast, excellent for conversation)
#   - qwen2.5:7b-instruct     (~4.5GB VRAM, slower but higher quality)
#   - qwen2.5-coder:7b-instruct  (original — functional but overkill for sales)
# OLLAMA_MODEL = "qwen2.5:3b-instruct"
OLLAMA_MODEL = "deepseek-r1:8b"
OLLAMA_HOST = "http://localhost:11434"
OLLAMA_TEMPERATURE = 0.7
OLLAMA_NUM_CTX = 2048        # Context window — 2K is plenty for short sales calls
OLLAMA_NUM_GPU = 99          # All layers on GPU

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
