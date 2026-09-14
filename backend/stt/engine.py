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
    """STT engine supporting Sarvam Cloud API (saaras:v3) and local faster-whisper."""

    def __init__(self):
        self.model = None
        self._loaded = False

    def load(self):
        """Load local Whisper model if whisper provider is active."""
        provider = getattr(config, "STT_PROVIDER", "sarvam")
        if provider == "sarvam":
            print(f"[STT] Sarvam Speech-to-Text ({config.SARVAM_STT_MODEL}) ready")
            self._loaded = True
            return

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
        if not self._loaded or self.model is None:
            return
        import torch

        del self.model
        self.model = None
        self._loaded = False
        torch.cuda.empty_cache()
        print("[STT] Model unloaded from GPU")

    def _transcribe_sarvam(self, audio: np.ndarray, language: str = None) -> dict:
        import io
        import requests
        import soundfile as sf

        t0 = time.time()
        buf = io.BytesIO()
        sf.write(buf, audio, config.SAMPLE_RATE, format="WAV")
        buf.seek(0)

        headers = {"api-subscription-key": config.SARVAM_API_KEY}
        files = {"file": ("audio.wav", buf.getvalue(), "audio/wav")}
        lang_code = config.SARVAM_LANG_MAP.get(language, "unknown") if language else "unknown"
        data = {
            "model": getattr(config, "SARVAM_STT_MODEL", "saaras:v3"),
            "language_code": lang_code,
        }

        try:
            res = requests.post(
                "https://api.sarvam.ai/speech-to-text",
                headers=headers,
                files=files,
                data=data,
                timeout=10.0,
            )
            res.raise_for_status()
            resp = res.json()
            raw_lang = resp.get("language_code", "en-IN")
            detected_lang = raw_lang.split("-")[0] if "-" in raw_lang else raw_lang
            confidence = resp.get("language_probability", 0.9)
            text = resp.get("transcript", "").strip()

            return {
                "text": text,
                "language": detected_lang,
                "confidence": confidence,
                "duration_s": time.time() - t0,
                "segments": [{"start": 0, "end": len(audio) / config.SAMPLE_RATE, "text": text}],
            }
        except Exception as e:
            print(f"[STT] Sarvam STT error ({e}), falling back to Whisper...")
            return self._transcribe_whisper(audio, language)

    def _transcribe_whisper(self, audio: np.ndarray, language: str = None) -> dict:
        if self.model is None:
            from faster_whisper import WhisperModel
            self.model = WhisperModel(
                config.STT_MODEL_SIZE,
                device=config.STT_DEVICE,
                compute_type=config.STT_COMPUTE_TYPE,
            )

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

        return {
            "text": full_text.strip(),
            "language": detected_lang,
            "confidence": confidence,
            "duration_s": elapsed,
            "segments": segment_list,
        }

    def transcribe(self, audio: np.ndarray, language: str = None) -> dict:
        """
        Transcribe audio to text using configured provider (sarvam / whisper).
        """
        if not self._loaded:
            self.load()

        # Ensure float32 normalized to [-1, 1]
        if audio.dtype == np.int16:
            audio = audio.astype(np.float32) / 32768.0
        elif audio.dtype != np.float32:
            audio = audio.astype(np.float32)

        provider = getattr(config, "STT_PROVIDER", "sarvam")
        if provider == "sarvam" and config.SARVAM_API_KEY:
            return self._transcribe_sarvam(audio, language)
        return self._transcribe_whisper(audio, language)

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
