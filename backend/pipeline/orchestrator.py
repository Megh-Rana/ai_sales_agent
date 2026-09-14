"""
Pipeline Orchestrator — ties STT, AI Brain, and TTS together.
Manages the full listen → transcribe → think → speak cycle.

Key improvements:
- Streaming LLM → sentence-level TTS: first audio plays within ~1s of turn end
- Mic paused during playback to prevent speaker bleed-through into STT
- Language auto-switch is seamless — no extra user action needed
- MAX_CONVERSATION_TURNS enforced
"""

import numpy as np
import threading
import queue
import time
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from stt.engine import STTEngine
from stt.vad import VADEngine
from tts.engine import TTSEngine
from ai.brain import AIBrain
from pipeline.audio_io import AudioIO


class PipelineOrchestrator:
    """
    Main orchestrator for the AI Sales Voice Agent.

    Flow (streaming):
    1. Capture mic audio in chunks
    2. VAD detects when user stops speaking → pause mic
    3. STT transcribes the speech
    4. AI Brain streams response sentence-by-sentence
    5. Each sentence is synthesized by TTS and played immediately
    6. Resume mic after playback
    7. Repeat until call ends or MAX_CONVERSATION_TURNS reached
    """

    def __init__(
        self,
        company_info: str = "A technology solutions company",
        products_services: str = "IT consulting and cloud solutions",
        campaign_goal: str = "Schedule a product demo",
        agent_name: str = "Alex",
        company_name: str = "TechSolutions",
    ):
        # Components
        self.stt = STTEngine()
        self.vad = VADEngine()
        self.tts = TTSEngine()
        self.ai = AIBrain(
            company_info=company_info,
            products_services=products_services,
            campaign_goal=campaign_goal,
            agent_name=agent_name,
            company_name=company_name,
        )
        self.audio = AudioIO()

        # State
        self._running = False
        self._is_speaking = False   # True while TTS audio is playing
        self._turn_count = 0

    def load_all(self):
        """Load all models into GPU (concurrent mode)."""
        print("\n" + "=" * 60)
        print("  Loading AI Sales Voice Agent Pipeline")
        print("=" * 60)
        t0 = time.time()

        self.vad.load()
        self.stt.load()
        self.tts.load()
        self.ai.warm_up()

        try:
            import torch
            allocated = torch.cuda.memory_allocated() / 1024**3
            reserved = torch.cuda.memory_reserved() / 1024**3
            print(f"\n[GPU] VRAM allocated: {allocated:.1f} GB")
            print(f"[GPU] VRAM reserved:  {reserved:.1f} GB")
        except Exception:
            pass

        print(f"\n✅ All models loaded in {time.time() - t0:.1f}s")
        print("=" * 60 + "\n")

    def unload_all(self):
        """Unload all models from GPU."""
        self.stt.unload()
        self.tts.unload()
        print("[Pipeline] All models unloaded")

    def run_interactive(self):
        """
        Run the interactive terminal-based conversation loop.
        Speak into your mic, hear the AI respond.
        """
        self.load_all()
        self._running = True

        print("\n" + "=" * 60)
        print("  🎙️  AI Sales Voice Agent — Interactive Mode")
        print("=" * 60)
        print("\nControls:")
        print("  • Speak into your microphone")
        print("  • Wait for the AI to respond")
        print("  • Press Ctrl+C to end the call\n")

        self.audio.list_devices()

        # Generate and speak the opening
        print("\n--- Call Starting ---\n")
        opening = self.ai.get_opening(prospect_name="there")
        print(f"🤖 Agent: {opening}\n")
        self._speak_text(opening, "en")

        # Start listening
        self.audio.start_recording()
        self.vad.reset()

        try:
            while self._running:
                self._conversation_loop()
        except KeyboardInterrupt:
            print("\n\n--- Call Ended by User ---")
        finally:
            self.audio.stop_recording()
            self._print_summary()

    def _conversation_loop(self):
        """Single iteration of the listen-process-respond loop."""
        chunk = self.audio.get_audio_chunk(timeout=0.3)
        if chunk is None:
            return

        vad_result = self.vad.process_chunk(chunk)

        if vad_result["is_speech"] and not self._is_speaking:
            sys.stdout.write("\r🎤 Listening... ")
            sys.stdout.flush()

        if not (vad_result["speech_ended"] and vad_result["speech_audio"] is not None):
            return

        speech_audio = vad_result["speech_audio"]
        audio_duration = len(speech_audio) / config.SAMPLE_RATE

        # Skip very short utterances (likely noise)
        if audio_duration < 0.5:
            return

        sys.stdout.write("\r")
        print(f"📝 Processing {audio_duration:.1f}s of speech...")

        # Pause mic (NOT destroy) to prevent speaker bleed-through into STT
        self.audio.pause_recording()

        turn_start = time.time()

        # ─── STT ──────────────────────────────────────────────────────
        t0 = time.time()
        stt_result = self.stt.transcribe(speech_audio)
        stt_time = time.time() - t0

        transcript = stt_result["text"]
        language = stt_result["language"]

        if not transcript or transcript.strip() == "":
            print("   (no speech detected)")
            self.audio.resume_recording()
            self.vad.reset()
            return

        print(f"👤 Prospect [{language}]: {transcript}")
        print(f"   ⏱️  STT: {stt_time:.2f}s")

        # Check for exit keywords
        if self._is_exit_phrase(transcript):
            farewell = self._get_farewell(language)
            print(f"\n🤖 Agent: {farewell}")
            self._speak_text(farewell, language)
            self._running = False
            return

        # Check turn limit
        self._turn_count += 1
        if self._turn_count > config.MAX_CONVERSATION_TURNS:
            wrap_up = self._get_wrap_up(language)
            print(f"\n🤖 Agent (wrapping up): {wrap_up}")
            self._speak_text(wrap_up, language)
            self._running = False
            return

        # ─── AI + TTS streaming with gapless playback ─────────────────
        t0_ai = time.time()

        try:
            if config.STREAMING_PIPELINE:
                print(f"🤖 Agent [{language}]: ", end="", flush=True)

                # Shared queue between TTS (producer) and playback (consumer)
                DONE = object()
                audio_q = queue.Queue()
                ttfa_logged = [False]

                def gapless_player():
                    """Drain audio queue via a single sd.OutputStream.
                    One continuous stream — no gaps between chunks."""
                    import sounddevice as sd
                    sr = config.TTS_SAMPLE_RATE
                    with sd.OutputStream(samplerate=sr, channels=1, dtype="float32") as stream:
                        while True:
                            try:
                                chunk = audio_q.get(timeout=15.0)
                            except queue.Empty:
                                print("[Audio] Playback timeout")
                                break
                            if chunk is DONE:
                                break
                            if chunk is None or len(chunk) == 0:
                                continue

                            if not ttfa_logged[0]:
                                print(f"\n   ⏱️  Time-to-first-audio: {time.time() - turn_start:.2f}s")
                                ttfa_logged[0] = True

                            self._is_speaking = True

                            # Normalize
                            max_val = np.abs(chunk).max()
                            if max_val > 1.0:
                                chunk = chunk / max_val

                            # Single write — smooth, no slicing
                            stream.write(chunk.reshape(-1, 1))

                    self._is_speaking = False

                playback_thread = threading.Thread(target=gapless_player, daemon=True)
                playback_thread.start()

                # Feed sentences from LLM → TTS → audio_q
                sentence_gen = self.ai.generate_response_streaming(transcript, language)
                self.tts.synthesize_streaming_turn(
                    sentence_gen,
                    language=language,
                    audio_queue=audio_q,
                    done_sentinel=DONE,
                )

                # Wait for playback to finish
                playback_thread.join(timeout=30.0)
                print()  # newline after streamed response

            else:
                # Non-streaming fallback
                response = self.ai.generate_response(transcript, language)
                print(f"🤖 Agent [{language}]: {response}")
                self._speak_text(response, language)

        except Exception as e:
            print(f"\n[Pipeline] Error during AI+TTS turn: {e}")
            self._is_speaking = False

        total_time = time.time() - turn_start
        ai_time = time.time() - t0_ai
        print(f"   ⏱️  AI+TTS total: {ai_time:.2f}s | Round-trip: {total_time:.2f}s")
        print()

        # Resume mic for next turn
        self.audio.resume_recording()
        self.vad.reset()

    def _speak_text(self, text: str, language: str = "en"):
        """Synthesize and play a single text block (non-streaming)."""
        self._is_speaking = True
        try:
            audio = self.tts.synthesize(text, language)
            self.audio.play_audio(audio, config.TTS_SAMPLE_RATE, blocking=True)
        except Exception as e:
            print(f"[TTS Error] {e}")
        finally:
            self._is_speaking = False

    def _is_exit_phrase(self, transcript: str) -> bool:
        """Check if the prospect said a goodbye phrase."""
        lower = transcript.lower()
        exit_words = [
            # English
            "goodbye", "bye", "end call", "disconnect", "hang up", "stop",
            # Hindi
            "अलविदा", "बाय", "रखो", "फोन रखो", "बंद करो",
            # Marathi
            "निरोप", "बाय", "फोन ठेव",
            # Gujarati
            "આવજો", "બાય", "ફોન મૂકો",
        ]
        return any(w in lower for w in exit_words)

    def _get_farewell(self, language: str) -> str:
        """Language-appropriate farewell."""
        farewells = {
            "en": "Thank you so much for your time! Have a great day!",
            "hi": "आपके समय के लिए बहुत धन्यवाद! आपका दिन शुभ हो!",
            "mr": "तुमच्या वेळासाठी खूप धन्यवाद! तुमचा दिवस चांगला जाओ!",
            "gu": "તમારો સમય આપ્યો બદલ ખૂબ આભાર! તમારો દિવસ સારો રહો!",
        }
        return farewells.get(language, farewells["en"])

    def _get_wrap_up(self, language: str) -> str:
        """Language-appropriate wrap-up when turn limit is hit."""
        wrap_ups = {
            "en": "I've really enjoyed our conversation! Let me have someone from our team follow up with you. Have a wonderful day!",
            "hi": "हमारी बातचीत बहुत अच्छी रही! हमारी टीम का कोई सदस्य आपसे फॉलो-अप करेगा। आपका दिन शुभ हो!",
            "mr": "आपल्याशी बोलून खूप आनंद झाला! आमच्या टीमचा कोणी तुमच्याशी फॉलो-अप करेल. तुमचा दिवस चांगला जाओ!",
            "gu": "તમારી સાથે વાત કરીને ખૂબ આનંદ થયો! અમારી ટીમ તમારી સાથે ફૉલો-અપ કરશે. તમારો દિવસ સારો રહો!",
        }
        return wrap_ups.get(language, wrap_ups["en"])

    def _print_summary(self):
        """Print and save call summary."""
        summary = self.ai.get_summary()

        print("\n" + "=" * 60)
        print("  📊 Call Summary")
        print("=" * 60)
        print(f"  Duration:     {summary['duration_seconds']:.0f}s")
        print(f"  Turns:        {summary['total_turns']}")
        print(f"  Language:     {summary['language']}")
        print(f"  Interest:     {summary['lead_info']['interest_level']}")
        print(f"  BANT Score:   {summary['bant_score']['score']}/{summary['bant_score']['max_score']}")
        print(f"  Callback:     {'Yes' if summary['lead_info']['callback_requested'] else 'No'}")
        print(f"  Meeting:      {'Yes' if summary['lead_info']['meeting_scheduled'] else 'No'}")

        if summary['lead_info']['objections']:
            print(f"  Objections:   {', '.join(summary['lead_info']['objections'])}")

        print("\n--- Transcript ---")
        print(summary["transcript"])
        print("=" * 60)

        os.makedirs(config.RECORDINGS_DIR, exist_ok=True)
        summary_path = os.path.join(
            config.RECORDINGS_DIR,
            f"call_summary_{int(time.time())}.json",
        )
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        print(f"\n📁 Summary saved: {summary_path}")

    # ─── Text mode ───────────────────────────────────────────────────

    def run_text_mode(self):
        """
        Text-only mode for testing without audio hardware.
        Type messages as the prospect, AI responds in text.
        """
        print("\n" + "=" * 60)
        print("  🤖 AI Sales Agent — Text Mode (No Audio)")
        print("=" * 60)
        print("\nType your messages. Press Ctrl+C or type 'quit' to end.\n")

        self.ai.warm_up()
        self._running = True

        opening = self.ai.get_opening(prospect_name="there")
        print(f"\n🤖 Agent: {opening}\n")

        try:
            while self._running:
                try:
                    user_input = input("👤 You: ").strip()
                except EOFError:
                    break

                if not user_input:
                    continue
                if user_input.lower() in ("quit", "exit", "bye"):
                    break

                # Simple language detection for text mode
                language = self._detect_language_text(user_input)

                if self._is_exit_phrase(user_input):
                    farewell = self._get_farewell(language)
                    print(f"\n🤖 Agent: {farewell}\n")
                    break

                self._turn_count += 1
                if self._turn_count > config.MAX_CONVERSATION_TURNS:
                    print(f"\n🤖 Agent: {self._get_wrap_up(language)}\n")
                    break

                t0 = time.time()
                if config.STREAMING_PIPELINE:
                    print("🤖 Agent: ", end="", flush=True)
                    for sentence in self.ai.generate_response_streaming(user_input, language):
                        print(sentence, end=" ", flush=True)
                    print(f"\n   ⏱️  {time.time() - t0:.2f}s\n")
                else:
                    response = self.ai.generate_response(user_input, language)
                    print(f"🤖 Agent [{language}]: {response}")
                    print(f"   ⏱️  {time.time() - t0:.2f}s\n")

        except KeyboardInterrupt:
            print("\n\n--- Session Ended ---")
        finally:
            self._print_summary()

    def _detect_language_text(self, text: str) -> str:
        """
        Heuristic language detection for text mode.
        Checks Unicode ranges for Devanagari, Gujarati script.
        Falls back to English.
        """
        devanagari = sum(1 for c in text if "\u0900" <= c <= "\u097F")
        gujarati = sum(1 for c in text if "\u0A80" <= c <= "\u0AFF")
        total = len(text)

        if total == 0:
            return "en"
        if gujarati / total > 0.15:
            return "gu"
        if devanagari / total > 0.15:
            # Marathi uses Devanagari but has distinct vocabulary — Whisper handles
            # this in voice mode; in text mode we default to Hindi for Devanagari.
            return "hi"
        return "en"
