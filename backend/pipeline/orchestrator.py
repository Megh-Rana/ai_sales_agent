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
import re

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
        default_language: str = "en",
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
            default_language=default_language,
        )
        self.audio = AudioIO()

        # State
        self.language = default_language  # Default session language for STT prompt
        self._running = False
        self._is_speaking = False   # True while TTS audio is playing
        self._turn_count = 0
        self.on_transcript = None   # Optional callback(speaker: str, text: str, language: str)
        self.on_human_transfer = None  # Optional callback(language: str)
        self.on_call_ended = None  # Optional callback(reason: str)

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
        opening = self.ai.get_opening(prospect_name="there", language=self.language)
        print(f"🤖 Agent: {opening}\n")
        self._speak_text(opening, self.language)

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
        # Allow STT to auto-detect language across speech turns for seamless multilingual switching
        stt_result = self.stt.transcribe(speech_audio)
        stt_time = time.time() - t0

        transcript = stt_result["text"]
        detected_lang = stt_result.get("language") or "en"

        if not transcript or transcript.strip() == "":
            print("   (no speech detected)")
            self.audio.resume_recording()
            self.vad.reset()
            return

        # Dynamically resolve turn language (supports speech auto-detection + explicit switch requests)
        language = self._resolve_turn_language(transcript, detected_lang, fallback_language=self.language)
        self.language = language

        print(f"👤 Prospect [{language}]: {transcript}")
        print(f"   ⏱️  STT: {stt_time:.2f}s")

        # Notify listener (e.g. frontend live transcript) of customer speech
        if self.on_transcript:
            try:
                self.on_transcript("prospect", transcript, language)
            except Exception as ex:
                print(f"[Callback Error] {ex}")

        # Check for human agent request (Calendly Link Dispatch)
        if self._is_human_transfer_requested(transcript):
            transfer_reply = self._get_calendly_transfer_reply(language)
            print(f"\n🤖 Agent (Human transfer requested): {transfer_reply}")
            if self.on_transcript:
                try:
                    self.on_transcript("agent", transfer_reply, language)
                except Exception as ex:
                    print(f"[Callback Error] {ex}")
            if self.on_human_transfer and callable(self.on_human_transfer):
                try:
                    self.on_human_transfer(language)
                except Exception as ex:
                    print(f"[Human Transfer Error] {ex}")
            self._speak_text(transfer_reply, language)
            self._running = False
            return

        # Check for exit keywords before invoking AI Brain
        if self._is_exit_phrase(transcript):
            farewell = self._get_farewell(language)
            print(f"\n🤖 Agent (Cut call farewell): {farewell}")
            if self.on_transcript:
                try:
                    self.on_transcript("agent", farewell, language)
                except Exception as ex:
                    print(f"[Callback Error] {ex}")
            self._speak_text(farewell, language)
            self._running = False
            self.audio.stop_recording()
            print("🛑 [Pipeline] Call explicitly ended by prospect exit instruction. Call cut cleanly.")
            if self.on_call_ended and callable(self.on_call_ended):
                try:
                    self.on_call_ended("user_cut_call")
                except Exception as ex:
                    print(f"[Call Ended Callback Error] {ex}")
            return

        # Check turn limit
        self._turn_count += 1
        if self._turn_count > config.MAX_CONVERSATION_TURNS:
            wrap_up = self._get_wrap_up(language)
            print(f"\n🤖 Agent (wrapping up): {wrap_up}")
            if self.on_transcript:
                try:
                    self.on_transcript("agent", wrap_up, language)
                except Exception as ex:
                    print(f"[Callback Error] {ex}")
            self._speak_text(wrap_up, language)
            self._running = False
            self.audio.stop_recording()
            if self.on_call_ended and callable(self.on_call_ended):
                try:
                    self.on_call_ended("turn_limit_reached")
                except Exception as ex:
                    print(f"[Call Ended Callback Error] {ex}")
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
                collected_agent_sentences = []
                def streaming_sentence_wrapper():
                    for sentence in self.ai.generate_response_streaming(transcript, language):
                        collected_agent_sentences.append(sentence)
                        yield sentence

                self.tts.synthesize_streaming_turn(
                    streaming_sentence_wrapper(),
                    language=language,
                    audio_queue=audio_q,
                    done_sentinel=DONE,
                )

                # Notify transcript listener of agent response
                full_agent_text = " ".join(collected_agent_sentences).strip()
                if self.on_transcript and full_agent_text:
                    try:
                        self.on_transcript("agent", full_agent_text, language)
                    except Exception as ex:
                        print(f"[Callback Error] {ex}")

                # Wait for playback to finish
                playback_thread.join(timeout=30.0)
                print()  # newline after streamed response

                # Check if generated turn concluded with a farewell / exit
                if self._is_exit_phrase(transcript) or self._is_farewell_response(full_agent_text):
                    print(f"\n🛑 [Pipeline] Farewell concluded ('{full_agent_text[:40]}...'). Cutting call now.")
                    self._running = False
                    self.audio.stop_recording()
                    if self.on_call_ended and callable(self.on_call_ended):
                        try:
                            self.on_call_ended("farewell_concluded")
                        except Exception as ex:
                            print(f"[Call Ended Callback Error] {ex}")
                    return

            else:
                # Non-streaming fallback
                response = self.ai.generate_response(transcript, language)
                print(f"🤖 Agent [{language}]: {response}")
                if self.on_transcript and response:
                    try:
                        self.on_transcript("agent", response, language)
                    except Exception as ex:
                        print(f"[Callback Error] {ex}")
                self._speak_text(response, language)

                if self._is_exit_phrase(transcript) or self._is_farewell_response(response):
                    print(f"\n🛑 [Pipeline] Farewell concluded ('{response[:40]}...'). Cutting call now.")
                    self._running = False
                    self.audio.stop_recording()
                    if self.on_call_ended and callable(self.on_call_ended):
                        try:
                            self.on_call_ended("farewell_concluded")
                        except Exception as ex:
                            print(f"[Call Ended Callback Error] {ex}")
                    return

        except Exception as e:
            print(f"\n[Pipeline] Error during AI+TTS turn: {e}")
            self._is_speaking = False

        total_time = time.time() - turn_start
        ai_time = time.time() - t0_ai
        print(f"   ⏱️  AI+TTS total: {ai_time:.2f}s | Round-trip: {total_time:.2f}s")
        print()

        # Resume mic for next turn only if call is still actively running
        if self._running:
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

    def set_language(self, language: str):
        """Dynamically update active conversation language for the pipeline."""
        clean_lang = (language or "en").lower().strip()
        self.language = clean_lang
        if hasattr(self, "ai") and self.ai:
            self.ai._prev_language = clean_lang
            if hasattr(self.ai, "default_language"):
                self.ai.default_language = clean_lang
        print(f"[Pipeline] Active language dynamically updated to: {clean_lang}")

    def _is_exit_phrase(self, transcript: str) -> bool:
        """Check if the prospect said a goodbye or cut-call phrase in EN, HI, GU, or MR."""
        if not transcript:
            return False
        import re
        lower = transcript.lower().strip()

        # 1. Regex pattern matching (flexible word orders and phrasing)
        patterns = [
            r"\b(cut|hang\s*up|disconnect|end|close|stop)\b.*\b(call|phone|line)\b",
            r"\b(call|phone)\b.*\b(cut|kaat|kato|kaato|rakh|rakho|muko|muki|kaapo|end|band|disconnect|stop)\b",
            r"\b(cut\s*the\s*call|cut\s*call|cut\s*it|hang\s*up|disconnect)\b",
            r"\b(please|can you|just)\b.*\b(cut|hang up|disconnect|end)\b",
            r"\b(bye|goodbye|byebye|alvida|aavjo)\b",
        ]
        for pat in patterns:
            if re.search(pat, lower):
                return True

        # 2. Comprehensive keyword matching
        exit_words = [
            # English / Standard Cut Call
            "cut the call", "cut call", "cut this call", "cut it", "cut phone", "cut the phone",
            "hang up", "hangup", "hang the call", "disconnect", "disconnect the call",
            "end the call", "end call", "stop the call", "stop call", "stop calling",
            "i have to go", "got to go", "gotta go", "talk to you later",
            "goodbye", "good bye", "bye", "byebye", "see you", "not interested", "dont call", "don't call",
            "leave me alone", "wrong number",
            # Hindi / Hinglish
            "call kaat do", "call kato", "call kaato", "call kaat", "phone kaat do", "phone kato", "phone kaato",
            "phone rakho", "phone rakh do", "phone rakh", "call cut", "phone cut", "call cut karo", "phone cut karo",
            "band karo", "call band karo", "alvida", "chalo bye", "baad mein baat", "namaskar",
            "अलविदा", "बाय", "बाय बाय", "फोन रखो", "कॉल काटो", "कॉल काट दो", "काट दो", "फोन काट दो", "बंद करो", "नहीं चाहिए",
            # Marathi
            "निरोप", "बाय", "फोन ठेव", "कॉल थांबवा", "फोन ठेवा", "कॉल कट करा", "कॉल बंद करा",
            "call thambva", "phone theva", "call cut kara",
            # Gujarati
            "આવજો", "ચલો આવજો", "બાય", "ફોન મૂકો", "ફોન મૂકી દો", "કૉલ કાપો", "કૉલ કટ કરો", "કટ કરો", "કાપો", "બંધ કરો", "નથી જોઈતું",
            "phone muko", "phone muki dyo", "call kato", "call kaapo", "call cut", "call cut karo", "bandh karo", "aavjo",
        ]
        return any(w in lower for w in exit_words)

    def _is_farewell_response(self, text: str) -> bool:
        """Check if an agent response is a concluding farewell."""
        if not text:
            return False
        import re
        lower = text.lower().strip()
        farewell_phrases = [
            "have a great day", "have a wonderful day", "have a good day", "goodbye", "good bye", "take care",
            "thank you so much for your time", "thank you for your time", "enjoy the rest of your day", "talk to you soon",
            "alvida", "aapka din shubh ho", "shubh din", "aavjo", "dhanyavaad", "namaste",
            "आपका दिन शुभ हो", "अलविदा", "धन्यवाद", "आभार", "તમારો દિવસ સારો રહો", "આવજો", "દિવસ સારો જાઓ", "काळजी घ्या"
        ]
        return any(p in lower or p in text for p in farewell_phrases)

    def _is_human_transfer_requested(self, transcript: str) -> bool:
        """Check if prospect requested to speak with a human agent, team member, or Calendly booking link."""
        try:
            from app.services.calendly_service import is_human_transfer_requested as _detect_transfer
            return _detect_transfer(transcript)
        except Exception:
            # Fallback if app service is unavailable
            lower = transcript.lower()
            return any(w in lower for w in ("human", "person", "representative", "transfer", "calendly", "agent"))

    def _get_calendly_transfer_reply(self, language: str) -> str:
        """Language-appropriate verbal response when Calendly booking link SMS is dispatched."""
        replies = {
            "en": "I completely understand! I've just sent a text message to your phone and an email with our team's direct calendar booking link so you can pick whatever time works best for you. Talk soon!",
            "hi": "मैं बिल्कुल समझता हूँ! मैंने अभी आपके फ़ोन पर एसएमएस और ईमेल द्वारा हमारी टीम का सीधा कैलेंडर लिंक भेज दिया है, ताकि आप अपनी पसंद का समय चुन सकें। धन्यवाद!",
            "mr": "मला पूर्णपणे समजते! मी तुमच्या फोनवर एसएमएस आणि ईमेलद्वारे आमच्या टीमची थेट कॅलेंडर लिंक पाठवली आहे, जेणेकरून आपण सोयीनुसार वेळ निवडू शकाल. धन्यवाद!",
            "gu": "હું બિલકુલ સમજું છું! મેં તમારા ફોન પર SMS અને ઇમેઇલ દ્વારા અમારી ટીમની કેલેન્ડર લિંક મોકલી આપી છે, જેથી તમે તમારી અનુકૂળતા મુજબ સમય પસંદ કરી શકો. આભાર!",
        }
        return replies.get(language, replies["en"])

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

    @staticmethod
    def _resolve_turn_language(transcript: str, stt_language: str, fallback_language: str = "en") -> str:
        """
        Determine the effective conversation language for the turn.
        Checks for:
        1. Explicit user request to switch language (e.g. 'Can we speak in Hindi?', 'हिंदी में बात करो')
        2. Script detection from transcript (Devanagari -> Hindi/Marathi, Gujarati script -> Gujarati)
        3. STT detected language (if recognized)
        4. Current session language fallback
        """
        lower = transcript.lower().strip()

        # 1. Explicit switch request patterns
        switch_patterns = [
            (r"\b(in hindi|to hindi|speak hindi|talk in hindi|switch to hindi|hindi please|hindi mein|हिंदी)\b", "hi"),
            (r"\b(in gujarati|to gujarati|speak gujarati|talk in gujarati|switch to gujarati|gujarati please|gujarati ma|ગુજરાતી)\b", "gu"),
            (r"\b(in marathi|to marathi|speak marathi|talk in marathi|switch to marathi|marathi please|marathi madhe|मराठी)\b", "mr"),
            (r"\b(in english|to english|speak english|talk in english|switch to english|english please|अंग्रेजी)\b", "en"),
        ]
        for pattern, lang_code in switch_patterns:
            if re.search(pattern, lower):
                print(f"[Language Switch] User requested switch to {lang_code.upper()} in speech: '{transcript}'")
                return lang_code

        # 2. Script heuristics from transcript characters
        gujarati = sum(1 for c in transcript if "\u0A80" <= c <= "\u0AFF")
        devanagari = sum(1 for c in transcript if "\u0900" <= c <= "\u097F")
        total = max(len(transcript), 1)

        if gujarati / total > 0.15:
            return "gu"
        if devanagari / total > 0.15:
            if stt_language in ("mr", "mr-IN") or fallback_language == "mr":
                return "mr"
            return "hi"

        # 3. STT detected language if recognized
        if stt_language in config.SUPPORTED_LANGUAGES:
            return stt_language

        return fallback_language or "en"
