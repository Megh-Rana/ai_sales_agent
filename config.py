"""
Central configuration for the AI Sales Voice Agent pipeline.
Tuned for RTX 5050 Laptop GPU (8GB VRAM).
"""

import os

# ─── Paths ──────────────────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE_PROFILES_DIR = os.path.join(PROJECT_ROOT, "voice_profiles")
SAMPLES_DIR = os.path.join(PROJECT_ROOT, "samples")
RECORDINGS_DIR = os.path.join(PROJECT_ROOT, "recordings")

# ─── Audio Parameters ───────────────────────────────────────────────
SAMPLE_RATE = 16000          # 16kHz for STT input
TTS_SAMPLE_RATE = 24000      # 24kHz for XTTS output
CHANNELS = 1                 # Mono
DTYPE = "int16"              # PCM16
CHUNK_DURATION_S = 0.5       # 500ms audio chunks for streaming
SILENCE_THRESHOLD_S = 1.5    # Seconds of silence before considering turn complete
VAD_THRESHOLD = 0.5          # Silero VAD confidence threshold

# ─── STT (faster-whisper) ───────────────────────────────────────────
STT_MODEL_SIZE = "small"     # small=~0.5GB VRAM | medium=~1.5GB | large-v3=~3GB
STT_DEVICE = "cuda"
STT_COMPUTE_TYPE = "float16" # float16 for GPU
STT_BEAM_SIZE = 5
STT_LANGUAGE = None          # None = auto-detect language
STT_VAD_FILTER = True        # Use built-in VAD filter

# ─── TTS (XTTS v2) ──────────────────────────────────────────────────
TTS_MODEL_NAME = "tts_models/multilingual/multi-dataset/xtts_v2"
TTS_DEVICE = "cuda"
TTS_DEFAULT_LANGUAGE = "en"
TTS_DEFAULT_SPEAKER_WAV = None  # Path to reference audio for voice cloning

# ─── LLM (Ollama) ───────────────────────────────────────────────────
OLLAMA_MODEL = "qwen2.5-coder:7b-instruct"
OLLAMA_HOST = "http://localhost:11434"
OLLAMA_TEMPERATURE = 0.7
OLLAMA_NUM_CTX = 4096        # Context window
OLLAMA_NUM_GPU = 99          # All layers on GPU

# ─── Language Support ────────────────────────────────────────────────
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "gu": "Gujarati",
}

# Whisper language codes → XTTS language codes
WHISPER_TO_XTTS_LANG = {
    "en": "en",
    "hi": "hi",
    "mr": "hi",  # XTTS doesn't have Marathi, fallback to Hindi
    "gu": "hi",  # XTTS doesn't have Gujarati, fallback to Hindi
}

# ─── Pipeline ────────────────────────────────────────────────────────
# Sequential mode: load/unload models one at a time (saves VRAM, adds latency)
# Concurrent mode: keep all models loaded (needs ~7.5GB, lower latency)
PIPELINE_MODE = "concurrent"  # "sequential" or "concurrent"
MAX_CONVERSATION_TURNS = 20
MAX_RESPONSE_TOKENS = 512
