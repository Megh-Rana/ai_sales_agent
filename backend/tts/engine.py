"""
TTS Engine — Sarvam Bulbul v3 via official sarvamai SDK.

Single-shot (opening line, fallbacks):
  Uses REST client.text_to_speech.convert() — simple, one call.

Streaming turn (main pipeline):
  Uses REST per-sentence with a background LLM reader thread.
  The WebSocket approach was abandoned because the Sarvam WS closes after
  a few seconds of idle time, and the LLM can take 1-4s to produce the
  first token — causing the WS to close before any text is sent.

  Instead, sentences are synthesized via REST individually.  A background
  thread reads sentences from the LLM generator so LLM generation and
  TTS synthesis overlap.

Supports: en-IN, hi-IN, mr-IN, gu-IN
"""

import numpy as np
import base64
import time
import threading
import queue
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config


class TTSEngine:
    """Sarvam Bulbul v3 TTS engine."""

    def __init__(self, gender: str = "male"):
        self.gender = gender
        self.speaker = config.TTS_SPEAKER
        self._loaded = False
        self._client = None

    def _get_client(self):
        if self._client is None:
            from sarvamai import SarvamAI
            self._client = SarvamAI(api_subscription_key=config.SARVAM_API_KEY)
        return self._client

    # ─── Lifecycle ──────────────────────────────────────────────────

    def load(self):
        if not config.SARVAM_API_KEY:
            raise RuntimeError("[TTS] SARVAM_API_KEY not set — add it to .env")
        self._get_client()   # validates key exists
        print(f"[TTS] Sarvam Bulbul v3 ready — speaker: {self.speaker}")
        self._loaded = True

    def unload(self):
        pass

    def set_speaker(self, speaker: str):
        self.speaker = speaker
        print(f"[TTS] Speaker → {speaker}")

    def set_gender(self, gender: str):
        mapping = {"male": "kabir", "female": "ishita"}
        if gender in mapping:
            self.set_speaker(mapping[gender])
        self.gender = gender

    # ─── Single-shot synthesis (REST) ───────────────────────────────

    def synthesize(self, text: str, language: str = None) -> np.ndarray:
        """Synthesize full text via REST. Returns float32 numpy array."""
        if not text or not text.strip():
            return np.array([], dtype=np.float32)

        lang_code = self._lang_code(language)
        t0 = time.time()

        try:
            client = self._get_client()
            response = client.text_to_speech.convert(
                model="bulbul:v3",
                text=text.strip(),
                language_code=lang_code,
                speaker=self.speaker,
                speech_sample_rate=config.TTS_SAMPLE_RATE,
            )
            # response.audios is a list of base64-encoded WAV strings
            audio = self._b64_to_numpy(response.audios[0])
        except Exception as e:
            print(f"[TTS] REST synthesis error: {e}")
            return np.array([], dtype=np.float32)

        elapsed = time.time() - t0
        duration = len(audio) / config.TTS_SAMPLE_RATE
        print(f"[TTS] {len(text)} chars → {duration:.1f}s audio in {elapsed:.2f}s "
              f"[{lang_code}/{self.speaker}]")
        return audio

    def synthesize_sentence(self, text: str, language: str = None) -> np.ndarray | None:
        """Synthesize a single sentence. Returns None on failure."""
        if not text or not text.strip():
            return None
        result = self.synthesize(text.strip(), language)
        return result if len(result) > 0 else None

    # ─── Streaming synthesis (REST per-sentence) ────────────────────

    def synthesize_streaming_turn(
        self,
        sentence_gen,
        language: str = None,
        audio_queue: queue.Queue = None,
        done_sentinel=None,
    ):
        """
        Synthesize sentences from sentence_gen via REST API, pushing audio
        chunks to audio_queue for gapless playback by the caller.

        Three-stage concurrent pipeline:
          1. LLM reader thread: reads sentences from generator → sentence_q
          2. Main thread: reads sentences → submits to ThreadPoolExecutor → future_q
          3. Drainer thread: waits on futures (in order) → pushes audio to audio_queue

        The ThreadPoolExecutor(max_workers=2) ensures the next sentence is
        already being synthesized while the current one plays, eliminating
        the dead gap between sentences.
        """
        if audio_queue is None:
            raise ValueError("audio_queue is required for streaming TTS")

        from concurrent.futures import ThreadPoolExecutor

        sentence_q = queue.Queue()
        future_q = queue.Queue()  # ordered queue of futures for the drainer
        SENTENCES_DONE = object()
        FUTURES_DONE = object()

        t0 = time.time()

        def llm_reader():
            """Read sentences from LLM generator → sentence queue."""
            try:
                for sentence in sentence_gen:
                    if sentence and sentence.strip():
                        print(sentence, end=" ", flush=True)
                        sentence_q.put(sentence.strip())
            except Exception as e:
                print(f"\n[TTS] LLM reader error: {e}")
            sentence_q.put(SENTENCES_DONE)

        def drainer():
            """Wait on futures in order → push audio to playback queue."""
            first = True
            while True:
                item = future_q.get()
                if item is FUTURES_DONE:
                    break
                try:
                    audio = item.result(timeout=30.0)
                    if audio is not None and len(audio) > 0:
                        if first:
                            print(f"\n[TTS] First chunk in {time.time()-t0:.2f}s")
                            first = False
                        audio_queue.put(audio)
                except Exception as e:
                    print(f"\n[TTS] Sentence synthesis error: {e}")
            audio_queue.put(done_sentinel)

        # Start background threads
        reader_thread = threading.Thread(target=llm_reader, daemon=True)
        reader_thread.start()

        drainer_thread = threading.Thread(target=drainer, daemon=True)
        drainer_thread.start()

        # Submit sentences to thread pool as they arrive from the LLM.
        # max_workers=2: while sentence N is synthesizing, sentence N+1 starts too.
        with ThreadPoolExecutor(max_workers=2, thread_name_prefix="tts") as pool:
            while True:
                try:
                    item = sentence_q.get(timeout=30.0)
                except queue.Empty:
                    print("\n[TTS] Timeout waiting for sentence from LLM")
                    break

                if item is SENTENCES_DONE:
                    break

                future = pool.submit(self.synthesize_sentence, item, language)
                future_q.put(future)

        # Signal drainer that all futures have been submitted
        future_q.put(FUTURES_DONE)
        drainer_thread.join(timeout=60.0)
        reader_thread.join(timeout=5.0)

    # ─── Audio conversion ────────────────────────────────────────────

    def _b64_to_numpy(self, b64_audio: str) -> np.ndarray:
        """Decode base64 WAV/PCM from REST response to float32 numpy array."""
        import io, soundfile as sf
        raw = base64.b64decode(b64_audio)
        # Sarvam REST returns a WAV file — soundfile handles it cleanly
        audio, _ = sf.read(io.BytesIO(raw), dtype="float32")
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        return audio

    def _pcm_to_numpy(self, raw: bytes) -> np.ndarray:
        """Convert raw LINEAR16 PCM bytes to float32 numpy array."""
        samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32)
        samples /= 32768.0
        return samples

    # ─── Helpers ─────────────────────────────────────────────────────

    def _lang_code(self, language: str | None) -> str:
        # Accept both full names ("Hindi", "hindi") and short codes ("hi")
        _name_to_code = {
            "english":  "en",
            "hindi":    "hi",
            "gujarati": "gu",
            "marathi":  "mr",
            "hinglish": "hi",  # closest supported language
        }
        lang = language or config.TTS_DEFAULT_LANGUAGE
        lang = _name_to_code.get(lang.lower(), lang) if lang else lang
        return config.SARVAM_LANG_MAP.get(lang, "en-IN")

    def synthesize_to_file(self, text: str, filepath: str, language: str = None):
        import soundfile as sf
        audio = self.synthesize(text, language)
        os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
        sf.write(filepath, audio, config.TTS_SAMPLE_RATE)
        print(f"[TTS] Saved to {filepath}")

    @property
    def is_loaded(self) -> bool:
        return self._loaded
