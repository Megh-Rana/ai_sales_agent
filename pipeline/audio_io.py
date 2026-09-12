"""
Audio I/O — handles microphone input and speaker output for terminal testing.
Uses sounddevice for real-time audio capture and playback.

Key design decisions for low-latency:
  • Mic stream is created ONCE and paused/resumed — never destroyed/recreated
    between turns.  Destroying streams on PulseAudio/ALSA is slow and unreliable.
  • Gapless playback: play_audio_stream() accepts an iterator of chunks and
    writes them to a single sd.OutputStream — zero gap between chunks.
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
        self._paused = False  # True when stream exists but is stopped

    def list_devices(self):
        """List available audio devices."""
        print("\n[Audio] Available devices:")
        print(sd.query_devices())
        print(f"\n[Audio] Default input:  {sd.query_devices(kind='input')['name']}")
        print(f"[Audio] Default output: {sd.query_devices(kind='output')['name']}")

    # ─── Microphone ──────────────────────────────────────────────────

    def _ensure_stream(self):
        """Create the input stream if it doesn't exist yet."""
        if self._input_stream is not None:
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

    def start_recording(self):
        """Start continuous microphone recording (creates stream on first call)."""
        if self._is_recording:
            return

        self._ensure_stream()
        self._input_stream.start()
        self._is_recording = True
        self._paused = False
        print("[Audio] Microphone recording started")

    def pause_recording(self):
        """
        Pause mic recording without destroying the stream.
        Much faster than stop+start — avoids PulseAudio/ALSA stream teardown.
        """
        if not self._is_recording:
            return
        self._input_stream.stop()
        self._is_recording = False
        self._paused = True
        # Drain stale audio from the queue
        self._flush_input_queue()

    def resume_recording(self):
        """Resume a paused mic stream. Near-instant on all backends."""
        if self._is_recording:
            return
        if self._input_stream is None:
            self.start_recording()
            return
        # Drain any stale data before resuming
        self._flush_input_queue()
        self._input_stream.start()
        self._is_recording = True
        self._paused = False

    def stop_recording(self):
        """Fully stop and destroy the mic stream (use only at shutdown)."""
        if self._input_stream is None:
            return
        try:
            self._input_stream.stop()
            self._input_stream.close()
        except Exception:
            pass
        self._input_stream = None
        self._is_recording = False
        self._paused = False
        self._flush_input_queue()
        print("[Audio] Microphone recording stopped")

    def _flush_input_queue(self):
        """Drain all pending audio from the input queue."""
        while not self._input_queue.empty():
            try:
                self._input_queue.get_nowait()
            except queue.Empty:
                break

    def get_audio_chunk(self, timeout: float = 1.0) -> np.ndarray | None:
        """Get next audio chunk from microphone."""
        try:
            return self._input_queue.get(timeout=timeout)
        except queue.Empty:
            return None

    # ─── Playback ────────────────────────────────────────────────────

    def play_audio(self, audio: np.ndarray, sample_rate: int = None, blocking: bool = True):
        """
        Play audio through speakers (single shot).

        Args:
            audio: float32 numpy array
            sample_rate: playback sample rate (default: TTS_SAMPLE_RATE)
            blocking: if True, wait until playback completes
        """
        if audio is None or len(audio) == 0:
            return

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

    def play_audio_gapless(self, chunk_queue, sample_rate: int = None, done_sentinel=None):
        """
        Gapless playback: drain chunks from a queue and write them to a single
        OutputStream.  Zero gap between chunks — no audible stutter.

        Args:
            chunk_queue: a queue.Queue yielding np.ndarray chunks.
                         Put `done_sentinel` to signal end of stream.
            sample_rate: playback sample rate
            done_sentinel: object signalling end of stream
        """
        sr = sample_rate or config.TTS_SAMPLE_RATE

        with sd.OutputStream(samplerate=sr, channels=1, dtype="float32") as stream:
            while True:
                try:
                    chunk = chunk_queue.get(timeout=5.0)
                except queue.Empty:
                    # Safety timeout — TTS should never take 5s between chunks
                    print("[Audio] Playback timeout — no chunk received in 5s")
                    break

                if chunk is done_sentinel:
                    break

                if chunk is None or len(chunk) == 0:
                    continue

                # Normalize
                max_val = np.abs(chunk).max()
                if max_val > 1.0:
                    chunk = chunk / max_val

                # Reshape for sounddevice (expects (N, channels))
                stream.write(chunk.reshape(-1, 1))

    def stop_playback(self):
        """Stop current audio playback (for barge-in)."""
        sd.stop()

    # ─── Utilities ───────────────────────────────────────────────────

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
