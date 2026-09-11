"""
VAD (Voice Activity Detection) — detects when the user starts/stops speaking.
Uses Silero VAD for robust speech endpoint detection.
"""

import numpy as np
import torch
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config


class VADEngine:
    """Silero VAD for detecting speech boundaries."""

    def __init__(self):
        self.model = None
        self.utils = None
        self._loaded = False

        # State tracking
        self._is_speaking = False
        self._silence_start = None
        self._speech_buffer = []

    def load(self):
        """Load Silero VAD model."""
        if self._loaded:
            return
        print("[VAD] Loading Silero VAD model...")
        self.model, self.utils = torch.hub.load(
            repo_or_dir="snakers4/silero-vad",
            model="silero_vad",
            trust_repo=True,
        )
        self._loaded = True
        print("[VAD] VAD model loaded")

    def reset(self):
        """Reset VAD state for a new conversation turn."""
        self._is_speaking = False
        self._silence_start = None
        self._speech_buffer = []
        if self.model is not None:
            self.model.reset_states()

    def process_chunk(self, audio_chunk: np.ndarray) -> dict:
        """
        Process a chunk of audio and detect speech activity.

        Args:
            audio_chunk: numpy array of float32 audio at 16kHz

        Returns:
            dict with keys:
                - is_speech: bool, whether this chunk contains speech
                - confidence: float, VAD confidence 0-1
                - speech_ended: bool, True if speech just ended (silence detected after speech)
                - speech_audio: np.ndarray or None, accumulated speech audio if speech_ended
        """
        if not self._loaded:
            self.load()

        # Ensure float32
        if audio_chunk.dtype != np.float32:
            audio_chunk = audio_chunk.astype(np.float32)
        if audio_chunk.size > 0 and np.abs(audio_chunk).max() > 1.0:
            audio_chunk = audio_chunk / 32768.0

        # Silero VAD requires exactly 512 samples at 16kHz per call.
        # Split the incoming chunk into 512-sample sub-chunks and take max confidence.
        vad_window = 512  # Required by Silero VAD at 16kHz
        max_confidence = 0.0
        num_windows = len(audio_chunk) // vad_window

        for i in range(max(1, num_windows)):
            start = i * vad_window
            end = start + vad_window
            if end > len(audio_chunk):
                break
            sub_chunk = audio_chunk[start:end]
            tensor = torch.from_numpy(sub_chunk)
            conf = self.model(tensor, config.SAMPLE_RATE).item()
            max_confidence = max(max_confidence, conf)

        confidence = max_confidence
        is_speech = confidence > config.VAD_THRESHOLD

        result = {
            "is_speech": is_speech,
            "confidence": confidence,
            "speech_ended": False,
            "speech_audio": None,
        }

        if is_speech:
            # Speech detected
            self._is_speaking = True
            self._silence_start = None
            self._speech_buffer.append(audio_chunk)
        else:
            if self._is_speaking:
                # Was speaking, now silent
                if self._silence_start is None:
                    self._silence_start = time.time()
                    self._speech_buffer.append(audio_chunk)  # Include trailing audio
                elif time.time() - self._silence_start >= config.SILENCE_THRESHOLD_S:
                    # Silence exceeded threshold — turn is complete
                    result["speech_ended"] = True
                    result["speech_audio"] = np.concatenate(self._speech_buffer)
                    # Reset for next turn
                    self._is_speaking = False
                    self._silence_start = None
                    self._speech_buffer = []
                else:
                    self._speech_buffer.append(audio_chunk)

        return result

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def is_speaking(self) -> bool:
        return self._is_speaking
