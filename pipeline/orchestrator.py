"""
Pipeline Orchestrator — ties STT, AI Brain, and TTS together.
Manages the full listen → transcribe → think → speak cycle.
Runs in concurrent GPU mode (all models loaded simultaneously).
"""

import numpy as np
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

    Flow:
    1. Capture mic audio in chunks
    2. VAD detects when user stops speaking
    3. STT transcribes the speech
    4. AI Brain generates a response
    5. TTS synthesizes the response
    6. Play audio through speakers
    7. Repeat until call ends
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
        self._is_speaking = False  # True when TTS audio is playing

    def load_all(self):
        """Load all models into GPU (concurrent mode)."""
        print("\n" + "=" * 60)
        print("  Loading AI Sales Voice Agent Pipeline")
        print("=" * 60)
        t0 = time.time()

        # Load models
        self.vad.load()
        self.stt.load()
        self.tts.load()
        self.ai.warm_up()

        # Print VRAM usage
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

        # List audio devices
        self.audio.list_devices()

        # Generate and speak the opening
        print("\n--- Call Starting ---\n")
        opening = self.ai.get_opening(prospect_name="there")
        print(f"🤖 Agent: {opening}\n")
        self._speak(opening)

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
        chunk = self.audio.get_audio_chunk(timeout=0.5)
        if chunk is None:
            return

        # Run VAD on the chunk
        vad_result = self.vad.process_chunk(chunk)

        # Show speaking indicator
        if vad_result["is_speech"] and not self._is_speaking:
            sys.stdout.write("\r🎤 Listening... ")
            sys.stdout.flush()

        if vad_result["speech_ended"] and vad_result["speech_audio"] is not None:
            speech_audio = vad_result["speech_audio"]
            audio_duration = len(speech_audio) / config.SAMPLE_RATE

            # Skip very short utterances (likely noise)
            if audio_duration < 0.5:
                return

            sys.stdout.write("\r")  # Clear the listening indicator
            print(f"📝 Processing {audio_duration:.1f}s of speech...")

            # ─── STT ────────────────────────────────────────────
            t0 = time.time()
            stt_result = self.stt.transcribe(speech_audio)
            stt_time = time.time() - t0

            transcript = stt_result["text"]
            language = stt_result["language"]

            if not transcript or transcript.strip() == "":
                print("   (no speech detected)")
                return

            print(f"👤 Prospect [{language}]: {transcript}")
            print(f"   ⏱️  STT: {stt_time:.2f}s")

            # Check for exit keywords
            lower = transcript.lower()
            if any(w in lower for w in ["goodbye", "bye", "end call", "disconnect",
                                          "अलविदा", "बाय", "रखो"]):
                print("\n🤖 Agent: Thank you for your time! Have a great day!")
                self._speak("Thank you for your time! Have a great day!")
                self._running = False
                return

            # ─── AI Brain ───────────────────────────────────────
            t0 = time.time()
            response = self.ai.generate_response(transcript, language)
            ai_time = time.time() - t0

            print(f"🤖 Agent [{language}]: {response}")
            print(f"   ⏱️  AI: {ai_time:.2f}s")

            # ─── TTS ────────────────────────────────────────────
            t0 = time.time()
            self._speak(response, language)
            tts_time = time.time() - t0

            print(f"   ⏱️  TTS: {tts_time:.2f}s")
            print(f"   ⏱️  Total round-trip: {stt_time + ai_time + tts_time:.2f}s")
            print()

            # Reset VAD for next turn
            self.vad.reset()

    def _speak(self, text: str, language: str = "en"):
        """Synthesize and play speech."""
        self._is_speaking = True
        try:
            audio = self.tts.synthesize(text, language)
            self.audio.play_audio(audio, config.TTS_SAMPLE_RATE, blocking=True)
        except Exception as e:
            print(f"[TTS Error] {e}")
        finally:
            self._is_speaking = False

    def _print_summary(self):
        """Print call summary."""
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

        # Save summary to file
        os.makedirs(config.RECORDINGS_DIR, exist_ok=True)
        summary_path = os.path.join(
            config.RECORDINGS_DIR,
            f"call_summary_{int(time.time())}.json",
        )
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        print(f"\n📁 Summary saved: {summary_path}")

    def run_text_mode(self):
        """
        Text-only mode for testing without audio hardware.
        Type messages as the prospect, AI responds in text.
        """
        print("\n" + "=" * 60)
        print("  🤖 AI Sales Agent — Text Mode (No Audio)")
        print("=" * 60)
        print("Type as the prospect. Type 'quit' to end.\n")

        # Warm up AI only
        self.ai.warm_up()

        # Opening
        opening = self.ai.get_opening(prospect_name="there")
        print(f"🤖 Agent: {opening}\n")

        while True:
            try:
                user_input = input("👤 You: ").strip()
                if not user_input:
                    continue
                if user_input.lower() in ["quit", "exit", "q"]:
                    break

                # Detect language (simple heuristic)
                lang = "en"
                if any(ord(c) > 0x0900 and ord(c) < 0x097F for c in user_input):
                    lang = "hi"  # Devanagari range

                t0 = time.time()
                response = self.ai.generate_response(user_input, lang)
                elapsed = time.time() - t0

                print(f"🤖 Agent: {response}")
                print(f"   ⏱️  {elapsed:.2f}s\n")

            except KeyboardInterrupt:
                break

        self._print_summary()
