"""
TTS Engine — Text-to-Speech using Microsoft Edge TTS.
Supports excellent multilingual synthesis including Hindi, Marathi, Gujarati.
Uses Microsoft's Neural TTS voices — free, no API key needed.

Note: Edge TTS requires internet connection but is free and has the best
Indian language voice quality available. For a hackathon demo this is ideal.
Coqui XTTS v2 (local) doesn't support Python 3.14, so Edge TTS is the
pragmatic choice.
"""

import numpy as np
import asyncio
import tempfile
import time
import sys
import os
import io

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config


# Voice mappings — professional sales agent voices for each language
VOICE_MAP = {
    "en": {
        "male": "en-US-BrianMultilingualNeural",    # Approachable, casual, sincere
        "female": "en-US-EmmaMultilingualNeural",     # Cheerful, clear, conversational
    },
    "hi": {
        "male": "hi-IN-MadhurNeural",                # Friendly, positive
        "female": "hi-IN-SwaraNeural",                # Friendly, positive
    },
    "mr": {
        "male": "mr-IN-ManoharNeural",                # Friendly, positive
        "female": "mr-IN-AarohiNeural",               # Friendly, positive
    },
    "gu": {
        "male": "gu-IN-NiranjanNeural",               # Friendly, positive
        "female": "gu-IN-DhwaniNeural",               # Friendly, positive
    },
}


class TTSEngine:
    """Edge TTS based text-to-speech engine."""

    def __init__(self, gender: str = "male"):
        """
        Args:
            gender: "male" or "female" — selects the voice gender for all languages
        """
        self.gender = gender
        self._loaded = True  # Edge TTS doesn't need model loading
        self._loop = None

    def load(self):
        """No-op for Edge TTS (no model to load, uses API)."""
        print(f"[TTS] Edge TTS ready (gender: {self.gender})")
        print(f"[TTS] Voices: EN={self._get_voice('en')}, HI={self._get_voice('hi')}, "
              f"MR={self._get_voice('mr')}, GU={self._get_voice('gu')}")
        self._loaded = True

    def unload(self):
        """No-op for Edge TTS."""
        pass

    def _get_voice(self, language: str) -> str:
        """Get the voice name for a language and gender."""
        lang = language if language in VOICE_MAP else "en"
        return VOICE_MAP[lang].get(self.gender, VOICE_MAP[lang]["male"])

    def _get_event_loop(self):
        """Get or create an async event loop."""
        try:
            loop = asyncio.get_running_loop()
            return loop
        except RuntimeError:
            if self._loop is None or self._loop.is_closed():
                self._loop = asyncio.new_event_loop()
            return self._loop

    def synthesize(self, text: str, language: str = None) -> np.ndarray:
        """
        Synthesize speech from text.

        Args:
            text: text to synthesize
            language: language code ('en', 'hi', 'mr', 'gu')

        Returns:
            numpy array of float32 audio at 24kHz
        """
        lang = language or config.TTS_DEFAULT_LANGUAGE
        voice = self._get_voice(lang)

        t0 = time.time()

        # Run async synthesis
        loop = self._get_event_loop()
        audio_data = loop.run_until_complete(self._synthesize_async(text, voice))

        # Convert MP3 bytes to numpy array
        audio_np = self._mp3_to_numpy(audio_data)

        elapsed = time.time() - t0
        duration = len(audio_np) / config.TTS_SAMPLE_RATE

        print(f"[TTS] Synthesized {len(text)} chars in {elapsed:.2f}s "
              f"({duration:.1f}s audio) [{lang}/{voice}]")

        return audio_np

    async def _synthesize_async(self, text: str, voice: str) -> bytes:
        """Async edge-tts synthesis."""
        import edge_tts

        communicate = edge_tts.Communicate(text, voice)

        # Collect audio bytes
        audio_bytes = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes.write(chunk["data"])

        return audio_bytes.getvalue()

    def _mp3_to_numpy(self, mp3_data: bytes) -> np.ndarray:
        """Convert MP3 bytes to float32 numpy array at TTS_SAMPLE_RATE."""
        import subprocess
        import tempfile
        import soundfile as sf

        # Use ffmpeg directly to convert MP3 → WAV (avoids pydub/audioop issues on Python 3.14)
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as mp3_file:
            mp3_file.write(mp3_data)
            mp3_path = mp3_file.name

        wav_path = mp3_path.replace(".mp3", ".wav")
        try:
            subprocess.run(
                [
                    "ffmpeg", "-y", "-i", mp3_path,
                    "-ar", str(config.TTS_SAMPLE_RATE),
                    "-ac", "1",
                    "-f", "wav",
                    wav_path,
                ],
                capture_output=True,
                check=True,
            )
            samples, sr = sf.read(wav_path, dtype="float32")
        finally:
            # Clean up temp files
            for p in [mp3_path, wav_path]:
                try:
                    os.unlink(p)
                except OSError:
                    pass

        return samples

    def synthesize_to_file(self, text: str, filepath: str, language: str = None):
        """Synthesize and save to WAV file."""
        import soundfile as sf

        audio = self.synthesize(text, language)
        os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
        sf.write(filepath, audio, config.TTS_SAMPLE_RATE)
        print(f"[TTS] Saved to {filepath}")

    def set_gender(self, gender: str):
        """Switch between male/female voice."""
        if gender in ("male", "female"):
            self.gender = gender
            print(f"[TTS] Voice gender set to: {gender}")

    @property
    def is_loaded(self) -> bool:
        return self._loaded
