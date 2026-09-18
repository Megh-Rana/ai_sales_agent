"""
Central configuration for the AI Sales Voice Agent pipeline.
"""
import sys
import os
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(PROJECT_ROOT)
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))
load_dotenv(os.path.join(REPO_ROOT, ".env"))

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

# ─── STT Config ──────────────────────────────────────────────────────
# STT Provider options: "sarvam" (Sarvam Cloud API saaras:v3 - fast & highly accurate for Indian languages),
#                       "whisper" (Local faster-whisper)
STT_PROVIDER = "sarvam"
SARVAM_STT_MODEL = "saaras:v3"

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

# ─── LLM Config ──────────────────────────────────────────────────────
# LLM Provider options: "ollama" (Local Ollama gemma3:4b - superior local Hindi & English quality),
#                       "sarvam" (Sarvam 105B Cloud API),
#                       "param" (HF Param-1-7B 4-bit)
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")
AI_PROVIDER = os.getenv("AI_PROVIDER", "ollama")

# Param-1-7B HuggingFace Model ID
PARAM_MODEL_ID = "arunvenkat17/Param-1-7B-GodMode-4bit"

# Ollama options
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_TEMPERATURE = float(os.getenv("OLLAMA_TEMPERATURE", "0.5"))
OLLAMA_NUM_CTX = int(os.getenv("OLLAMA_NUM_CTX", "2048"))        # Context window — 2K is plenty for short sales calls
# Set to 0 on Windows by default to avoid CUDA DLL stack buffer overrun (0xc0000409)
OLLAMA_NUM_GPU = int(os.getenv("OLLAMA_NUM_GPU", "0"))


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
