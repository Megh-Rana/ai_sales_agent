"""
Audio I/O — handles microphone input and speaker output for terminal testing.
Uses sounddevice for real-time audio capture and playback.
"""

import numpy as np
import sounddevice as sd
import threading
import queue
import time
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config


class AudioIO:
    """Manages microphone input and speaker output."""

    def __init__(self):
        self._input_queue = queue.Queue()
        self._is_recording = False
        self._input_stream = None

    def list_devices(self):
        """List available audio devices."""
        print("\n[Audio] Available devices:")
        print(sd.query_devices())
        print(f"\n[Audio] Default input:  {sd.query_devices(kind='input')['name']}")
        print(f"[Audio] Default output: {sd.query_devices(kind='output')['name']}")

    def start_recording(self):
        """Start continuous microphone recording."""
        if self._is_recording:
            return

        chunk_samples = int(config.SAMPLE_RATE * config.CHUNK_DURATION_S)

        def callback(indata, frames, time_info, status):
            if status:
                print(f"[Audio] Input status: {status}")
            self._input_queue.put(indata.copy().flatten())

        self._input_stream = sd.InputStream(
            samplerate=config.SAMPLE_RATE,
            channels=config.CHANNELS,
            dtype="float32",
            blocksize=chunk_samples,
            callback=callback,
        )
        self._input_stream.start()
        self._is_recording = True
        print("[Audio] Microphone recording started")

    def stop_recording(self):
        """Stop microphone recording."""
        if not self._is_recording:
            return
        self._input_stream.stop()
        self._input_stream.close()
        self._input_stream = None
        self._is_recording = False
        # Clear the queue
        while not self._input_queue.empty():
            try:
                self._input_queue.get_nowait()
            except queue.Empty:
                break
        print("[Audio] Microphone recording stopped")

    def get_audio_chunk(self, timeout: float = 1.0) -> np.ndarray | None:
        """Get next audio chunk from microphone."""
        try:
            return self._input_queue.get(timeout=timeout)
        except queue.Empty:
            return None

    def play_audio(self, audio: np.ndarray, sample_rate: int = None, blocking: bool = True):
        """
        Play audio through speakers.

        Args:
            audio: float32 numpy array
            sample_rate: playback sample rate (default: TTS_SAMPLE_RATE)
            blocking: if True, wait until playback completes
        """
        sr = sample_rate or config.TTS_SAMPLE_RATE

        # Normalize if needed
        max_val = np.abs(audio).max()
        if max_val > 1.0:
            audio = audio / max_val

        if blocking:
            sd.play(audio, sr)
            sd.wait()
        else:
            sd.play(audio, sr)

    def stop_playback(self):
        """Stop current audio playback (for barge-in)."""
        sd.stop()

    def record_seconds(self, seconds: float) -> np.ndarray:
        """Record a fixed number of seconds from microphone."""
        print(f"[Audio] Recording {seconds}s...")
        samples = int(config.SAMPLE_RATE * seconds)
        audio = sd.rec(
            samples,
            samplerate=config.SAMPLE_RATE,
            channels=config.CHANNELS,
            dtype="float32",
        )
        sd.wait()
        print("[Audio] Recording done")
        return audio.flatten()

    def save_wav(self, audio: np.ndarray, filepath: str, sample_rate: int = None):
        """Save audio to WAV file."""
        import soundfile as sf

        sr = sample_rate or config.SAMPLE_RATE
        os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
        sf.write(filepath, audio, sr)
        print(f"[Audio] Saved: {filepath}")

    @property
    def is_recording(self) -> bool:
        return self._is_recording
