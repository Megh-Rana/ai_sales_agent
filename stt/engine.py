"""
STT Engine — Speech-to-Text using faster-whisper.
Supports auto language detection for English, Hindi, Marathi, Gujarati.
"""

import numpy as np
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config


class STTEngine:
    """faster-whisper based speech-to-text engine."""

    def __init__(self):
        self.model = None
        self._loaded = False

    def load(self):
        """Load the whisper model onto GPU."""
        if self._loaded:
            return
        from faster_whisper import WhisperModel

        print(f"[STT] Loading faster-whisper '{config.STT_MODEL_SIZE}' on {config.STT_DEVICE}...")
        t0 = time.time()
        self.model = WhisperModel(
            config.STT_MODEL_SIZE,
            device=config.STT_DEVICE,
            compute_type=config.STT_COMPUTE_TYPE,
        )
        self._loaded = True
        print(f"[STT] Model loaded in {time.time() - t0:.1f}s")

    def unload(self):
        """Unload model from GPU to free VRAM."""
        if not self._loaded:
            return
        import torch

        del self.model
        self.model = None
        self._loaded = False
        torch.cuda.empty_cache()
        print("[STT] Model unloaded from GPU")

    def transcribe(self, audio: np.ndarray, language: str = None) -> dict:
        """
        Transcribe audio to text.

        Args:
            audio: numpy array of float32 audio samples at 16kHz mono
            language: force language code (e.g., 'hi', 'en') or None for auto-detect

        Returns:
            dict with keys: text, language, confidence, duration_s
        """
        if not self._loaded:
            self.load()

        # Ensure float32 normalized to [-1, 1]
        if audio.dtype == np.int16:
            audio = audio.astype(np.float32) / 32768.0
        elif audio.dtype != np.float32:
            audio = audio.astype(np.float32)

        t0 = time.time()
        segments, info = self.model.transcribe(
            audio,
            beam_size=config.STT_BEAM_SIZE,
            language=language or config.STT_LANGUAGE,
            vad_filter=config.STT_VAD_FILTER,
            vad_parameters=dict(
                min_silence_duration_ms=500,
                speech_pad_ms=200,
            ),
        )

        # Collect all segment text
        full_text = ""
        segment_list = []
        for seg in segments:
            full_text += seg.text
            segment_list.append({
                "start": seg.start,
                "end": seg.end,
                "text": seg.text.strip(),
            })

        elapsed = time.time() - t0
        detected_lang = info.language if info.language else "en"
        confidence = info.language_probability if info.language_probability else 0.0

        result = {
            "text": full_text.strip(),
            "language": detected_lang,
            "confidence": confidence,
            "duration_s": elapsed,
            "segments": segment_list,
        }

        return result

    def transcribe_file(self, filepath: str, language: str = None) -> dict:
        """Transcribe from an audio file."""
        import soundfile as sf

        audio, sr = sf.read(filepath, dtype="float32")
        # Resample if needed
        if sr != config.SAMPLE_RATE:
            import torchaudio
            import torch

            audio_tensor = torch.from_numpy(audio).unsqueeze(0)
            resampler = torchaudio.transforms.Resample(sr, config.SAMPLE_RATE)
            audio_tensor = resampler(audio_tensor)
            audio = audio_tensor.squeeze(0).numpy()

        # Convert to mono if stereo
        if audio.ndim > 1:
            audio = audio.mean(axis=1)

        return self.transcribe(audio, language)

    @property
    def is_loaded(self) -> bool:
        return self._loaded
