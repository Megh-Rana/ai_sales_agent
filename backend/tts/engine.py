"""
TTS Engine — Powered by Sarvam Bulbul v4 (bulbul:v4-flash) via Sarvam AI API.
Supports: en-IN, hi-IN, mr-IN, gu-IN

Single-shot (opening line, prompt responses):
  Uses Sarvam Bulbul v4 REST / SDK.

Streaming turn (main pipeline):
  Synthesizes sentences via Sarvam Bulbul v4 with concurrent LLM streaming and gapless audio playback.
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
    """TTS engine powered by Sarvam AI Bulbul v4 with resilient offline fallbacks."""

    def __init__(self, gender: str = "female"):
        self.gender = gender
        self.speaker = config.TTS_SPEAKER
        raw_model = getattr(config, "SARVAM_TTS_MODEL", "bulbul:v4")
        # Sarvam API requires 'bulbul:v4-flash' for Bulbul v4
        if raw_model in ("bulbul:v4", "v4", "bulbul:4"):
            raw_model = "bulbul:v4-flash"
        self.model = raw_model
        self.provider = "sarvam"
        self._loaded = False
        self._client = None

    def _get_api_model(self) -> str:
        """Ensure valid Sarvam API model string."""
        if "v4" in self.model:
            return "bulbul:v4-flash"
        return self.model

    def _resolve_speaker(self, speaker: str, lang_code: str = "en-IN") -> str:
        """
        Resolve speaker to a valid Sarvam speaker identifier based on active model.
        For Bulbul v4 (bulbul:v4-flash), persona-style identifiers are required.
        """
        is_v4 = "v4" in self.model
        if not is_v4:
            return speaker

        # If already a full v4 persona identifier (e.g. ishita_en_customer, simran_en_sales), keep it
        if "_" in speaker and any(c in speaker for c in ("_en_", "_hi_", "_gu_", "_mr_", "_bn_", "_te_", "_ta_")):
            return speaker

        speaker_lower = (speaker or "").lower()
        is_female = self.gender == "female" or speaker_lower in ("ishita", "priya", "female", "roopa", "simran", "pooja", "aditi")

        v4_personas = {
            "en-IN": {
                "female": "ishita_en_customer",
                "male": "dev_en_conversational",
            },
            "hi-IN": {
                "female": "ishita_hi_ads",
                "male": "kabir_hi_conversational",
            },
            "gu-IN": {
                "female": "pooja_gu_customer",
                "male": "bhavik_gu_conversation",
            },
            "mr-IN": {
                "female": "ishita_mr_conversational",
                "male": "nilesh_mr_conversation",
            },
        }

        lang_map = v4_personas.get(lang_code, v4_personas["en-IN"])
        return lang_map["female"] if is_female else lang_map["male"]

    def _get_client(self):
        if not getattr(config, "HAS_SARVAM_KEY", False):
            return None
        if self._client is None:
            from sarvamai import SarvamAI
            self._client = SarvamAI(api_subscription_key=config.SARVAM_API_KEY)
        return self._client

    # ─── Lifecycle ──────────────────────────────────────────────────

    def load(self):
        """Validate Sarvam API key and initialize Sarvam Bulbul v4 client."""
        api_model = self._get_api_model()
        resolved_spk = self._resolve_speaker(self.speaker, "en-IN")
        if getattr(config, "HAS_SARVAM_KEY", False):
            self._get_client()
            self.provider = "sarvam"
            print(f"[TTS] Sarvam Bulbul v4 initialized successfully — model: {api_model}, speaker: {self.speaker} (v4 persona: {resolved_spk})")
        else:
            self.provider = "edge-tts"
            print(f"[TTS] SARVAM_API_KEY not set. Using Edge-TTS / offline fallback for TTS.")
        self._loaded = True

    def unload(self):
        self._client = None
        self._loaded = False
        print("[TTS] Sarvam TTS unloaded")

    def set_speaker(self, speaker: str):
        self.speaker = speaker
        print(f"[TTS] Sarvam Speaker -> {speaker}")

    def set_gender(self, gender: str):
        mapping = {"male": "kabir", "female": "ishita"}
        if gender in mapping:
            self.set_speaker(mapping[gender])
        self.gender = gender

    # ─── Fallback synthesis ─────────────────────────────────────────

    def _synthesize_offline_fallback(self, text: str, language: str = None) -> np.ndarray:
        """Offline fallback using pyttsx3 (SAPI5) when cloud TTS services fail."""
        try:
            import pyttsx3
            import tempfile
            import soundfile as sf
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp_path = tmp.name

            py_engine = pyttsx3.init()
            py_engine.save_to_file(text.strip(), tmp_path)
            py_engine.runAndWait()

            audio, sr = sf.read(tmp_path, dtype="float32")
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

            if sr != config.TTS_SAMPLE_RATE:
                import torchaudio
                import torch
                audio_tensor = torch.from_numpy(audio).unsqueeze(0)
                resampler = torchaudio.transforms.Resample(sr, config.TTS_SAMPLE_RATE)
                audio_tensor = resampler(audio_tensor)
                audio = audio_tensor.squeeze(0).numpy()

            if audio.ndim > 1:
                audio = audio.mean(axis=1)

            print(f"[TTS] pyttsx3 offline fallback {len(text)} chars -> {len(audio)/config.TTS_SAMPLE_RATE:.1f}s audio")
            return audio
        except Exception as py_err:
            print(f"[TTS] pyttsx3 offline fallback also failed: {py_err}")
            return np.zeros(int(config.TTS_SAMPLE_RATE * 0.5), dtype=np.float32)

    def _synthesize_edge_tts_fallback(self, text: str, language: str = None) -> np.ndarray:
        """Fallback TTS using edge-tts (Microsoft Edge free TTS) when Sarvam API fails."""
        try:
            import edge_tts
            import asyncio
            import tempfile
            import soundfile as sf

            lang_code = self._lang_code(language, text=text)
            voice_map = {
                "en-IN": "en-IN-NeerjaNeural",
                "hi-IN": "hi-IN-SwaraNeural",
                "mr-IN": "mr-IN-AarohiNeural",
                "gu-IN": "gu-IN-DhwaniNeural",
            }
            voice = voice_map.get(lang_code, "en-IN-NeerjaNeural")

            async def _synthesize():
                with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
                    tmp_path = tmp.name

                communicate = edge_tts.Communicate(text.strip(), voice)
                await communicate.save(tmp_path)

                audio, sr = sf.read(tmp_path, dtype="float32")
                os.unlink(tmp_path)

                if sr != config.TTS_SAMPLE_RATE:
                    import torchaudio
                    import torch
                    audio_tensor = torch.from_numpy(audio).unsqueeze(0)
                    resampler = torchaudio.transforms.Resample(sr, config.TTS_SAMPLE_RATE)
                    audio_tensor = resampler(audio_tensor)
                    audio = audio_tensor.squeeze(0).numpy()

                if audio.ndim > 1:
                    audio = audio.mean(axis=1)

                return audio

            audio = asyncio.run(_synthesize())
            print(f"[TTS] Edge-TTS fallback {len(text)} chars -> {len(audio)/config.TTS_SAMPLE_RATE:.1f}s audio [{voice}]")
            return audio

        except Exception as edge_error:
            print(f"[TTS] Edge-TTS fallback also failed: {edge_error}")
            return self._synthesize_offline_fallback(text, language)

    # ─── Single-shot synthesis ──────────────────────────────────────

    def synthesize(self, text: str, language: str = None) -> np.ndarray:
        """Synthesize full text using Sarvam Bulbul v4 API with Edge-TTS / offline fallback."""
        if not text or not text.strip():
            return np.array([], dtype=np.float32)

        lang_code = self._lang_code(language, text=text)
        api_model = self._get_api_model()
        api_speaker = self._resolve_speaker(self.speaker, lang_code)
        t0 = time.time()

        # Try Sarvam API if key is available
        if getattr(config, "HAS_SARVAM_KEY", False):
            try:
                client = self._get_client()
                response = client.text_to_speech.convert(
                    model=api_model,
                    text=text.strip(),
                    language_code=lang_code,
                    speaker=api_speaker,
                    speech_sample_rate=config.TTS_SAMPLE_RATE,
                )
                audio = self._b64_to_numpy(response.audios[0])
                elapsed = time.time() - t0
                duration = len(audio) / config.TTS_SAMPLE_RATE
                print(f"[TTS] Sarvam Bulbul v4 {len(text)} chars -> {duration:.1f}s audio in {elapsed:.2f}s [{lang_code}/{api_speaker}]")
                return audio
            except Exception as e:
                # Try direct Sarvam REST endpoint
                print(f"[TTS] Sarvam SDK call failed ({e}). Trying Sarvam direct REST API (model: {api_model}, speaker: {api_speaker})...")
                try:
                    import requests
                    headers = {"api-subscription-key": config.SARVAM_API_KEY}
                    payload = {
                        "inputs": [text.strip()],
                        "target_language_code": lang_code,
                        "speaker": api_speaker,
                        "pitch": 0,
                        "pace": 1.0,
                        "loudness": 1.5,
                        "speech_sample_rate": config.TTS_SAMPLE_RATE,
                        "enable_preprocessing": True,
                        "model": api_model,
                    }
                    res = requests.post(
                        "https://api.sarvam.ai/text-to-speech",
                        json=payload,
                        headers=headers,
                        timeout=15.0,
                    )
                    res.raise_for_status()
                    data = res.json()
                    audio = self._b64_to_numpy(data["audios"][0])
                    elapsed = time.time() - t0
                    duration = len(audio) / config.TTS_SAMPLE_RATE
                    print(f"[TTS] Sarvam REST Bulbul v4 {len(text)} chars -> {duration:.1f}s audio in {elapsed:.2f}s [{lang_code}/{api_speaker}]")
                    return audio
                except Exception as rest_error:
                    print(f"[TTS] Sarvam REST API also failed ({rest_error}). Falling back to Edge-TTS...")
                    return self._synthesize_edge_tts_fallback(text, language)
        else:
            print(f"[TTS] SARVAM_API_KEY not set. Using Edge-TTS fallback...")
            return self._synthesize_edge_tts_fallback(text, language)

    def synthesize_sentence(self, text: str, language: str = None) -> np.ndarray | None:
        """Synthesize a single sentence using Sarvam Bulbul v4. Returns None on empty input."""
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
        Synthesize sentences from sentence_gen via Sarvam Bulbul v4, pushing audio
        chunks to audio_queue for seamless playback.
        """
        if audio_queue is None:
            raise ValueError("audio_queue is required for streaming TTS")

        from concurrent.futures import ThreadPoolExecutor

        sentence_q = queue.Queue()
        future_q = queue.Queue()
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
                            print(f"\n[TTS] First Sarvam chunk in {time.time()-t0:.2f}s")
                            first = False
                        audio_queue.put(audio)
                except Exception as e:
                    print(f"\n[TTS] Sarvam sentence synthesis error: {e}")
            audio_queue.put(done_sentinel)

        # Start background threads
        reader_thread = threading.Thread(target=llm_reader, daemon=True)
        reader_thread.start()

        drainer_thread = threading.Thread(target=drainer, daemon=True)
        drainer_thread.start()

        with ThreadPoolExecutor(max_workers=2, thread_name_prefix="sarvam_tts") as pool:
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

        future_q.put(FUTURES_DONE)
        drainer_thread.join(timeout=60.0)
        reader_thread.join(timeout=5.0)

    # ─── Audio conversion ────────────────────────────────────────────

    def _b64_to_numpy(self, b64_audio: str) -> np.ndarray:
        """Decode base64 WAV/PCM from Sarvam response to float32 numpy array."""
        import io
        import soundfile as sf
        raw = base64.b64decode(b64_audio)
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

    def _lang_code(self, language: str | None, text: str = "") -> str:
        # Detect script directly from text to prevent using the wrong TTS voice/language
        if text:
            gujarati = sum(1 for c in text if "\u0A80" <= c <= "\u0AFF")
            devanagari = sum(1 for c in text if "\u0900" <= c <= "\u097F")
            total = max(len(text), 1)
            if gujarati / total > 0.15:
                return "gu-IN"
            if devanagari / total > 0.15:
                if language in ("mr", "mr-IN"):
                    return "mr-IN"
                return "hi-IN"

        _name_to_code = {
            "english":  "en",
            "hindi":    "hi",
            "gujarati": "gu",
            "marathi":  "mr",
            "hinglish": "hi",
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
