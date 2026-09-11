#!/usr/bin/env python3
"""
Component Tests — test each pipeline component individually.

Usage:
    python test_components.py --test stt
    python test_components.py --test tts
    python test_components.py --test ai
    python test_components.py --test vad
    python test_components.py --benchmark
"""

import argparse
import time
import sys
import os
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config


def test_stt():
    """Test STT engine with microphone input."""
    from stt.engine import STTEngine
    from pipeline.audio_io import AudioIO

    print("\n=== Testing STT Engine ===\n")

    stt = STTEngine()
    stt.load()

    audio = AudioIO()

    print("Recording 5 seconds of speech... Speak now!")
    recording = audio.record_seconds(5.0)

    print("Transcribing...")
    result = stt.transcribe(recording)

    print(f"\n📝 Text:       {result['text']}")
    print(f"🌐 Language:   {result['language']} (confidence: {result['confidence']:.2f})")
    print(f"⏱️  Time:       {result['duration_s']:.2f}s")

    if result['segments']:
        print("\nSegments:")
        for seg in result['segments']:
            print(f"  [{seg['start']:.1f}s - {seg['end']:.1f}s] {seg['text']}")

    stt.unload()


def test_tts():
    """Test TTS engine with sample text."""
    from tts.engine import TTSEngine
    from pipeline.audio_io import AudioIO

    print("\n=== Testing TTS Engine ===\n")

    tts = TTSEngine()
    tts.load()

    audio_io = AudioIO()

    # Test English
    print("--- English ---")
    text_en = "Hello! I'm calling from TechSolutions. We provide Microsoft 365 and cloud solutions. Do you have a moment to chat?"
    audio_en = tts.synthesize(text_en, "en")
    print(f"Playing English audio ({len(audio_en) / config.TTS_SAMPLE_RATE:.1f}s)...")
    audio_io.play_audio(audio_en)

    time.sleep(0.5)

    # Test Hindi
    print("\n--- Hindi ---")
    text_hi = "नमस्ते! मैं टेकसॉल्यूशंस से बोल रहा हूँ। हम माइक्रोसॉफ्ट 365 और क्लाउड समाधान प्रदान करते हैं। क्या आपके पास एक मिनट है?"
    audio_hi = tts.synthesize(text_hi, "hi")
    print(f"Playing Hindi audio ({len(audio_hi) / config.TTS_SAMPLE_RATE:.1f}s)...")
    audio_io.play_audio(audio_hi)

    tts.unload()


def test_ai():
    """Test AI brain with text conversation."""
    from ai.brain import AIBrain

    print("\n=== Testing AI Brain ===\n")

    ai = AIBrain(
        company_info="TechSolutions India — IT consulting company",
        products_services="Microsoft 365, SharePoint, Azure cloud migration",
        campaign_goal="Schedule a demo meeting",
        agent_name="Alex",
        company_name="TechSolutions",
    )
    ai.warm_up()

    # Simulate a conversation
    print("--- Simulated Conversation ---\n")

    opening = ai.get_opening("Rahul")
    print(f"🤖 Agent: {opening}\n")

    test_messages = [
        ("Hello, yes this is Rahul. What is this about?", "en"),
        ("We already have an IT team. Why would we need your services?", "en"),
        ("Hmm, how much does it cost?", "en"),
        ("Let me think about it. Can you send me an email?", "en"),
    ]

    for msg, lang in test_messages:
        print(f"👤 Prospect: {msg}")
        t0 = time.time()
        response = ai.generate_response(msg, lang)
        elapsed = time.time() - t0
        print(f"🤖 Agent: {response}")
        print(f"   ⏱️  {elapsed:.2f}s\n")

    # Print summary
    summary = ai.get_summary()
    print(f"\n📊 Interest: {summary['lead_info']['interest_level']}")
    print(f"📊 BANT: {summary['bant_score']['score']}/{summary['bant_score']['max_score']}")


def test_vad():
    """Test VAD with live microphone."""
    from stt.vad import VADEngine
    from pipeline.audio_io import AudioIO

    print("\n=== Testing VAD ===\n")
    print("Speak and watch VAD detect your speech. Ctrl+C to stop.\n")

    vad = VADEngine()
    vad.load()

    audio = AudioIO()
    audio.start_recording()

    try:
        while True:
            chunk = audio.get_audio_chunk(timeout=1.0)
            if chunk is None:
                continue

            result = vad.process_chunk(chunk)

            # Visual indicator
            bar_len = int(result["confidence"] * 30)
            bar = "█" * bar_len + "░" * (30 - bar_len)
            status = "🗣️ SPEECH" if result["is_speech"] else "   silent"

            sys.stdout.write(f"\r{status} [{bar}] {result['confidence']:.2f}")
            sys.stdout.flush()

            if result["speech_ended"]:
                audio_data = result["speech_audio"]
                duration = len(audio_data) / config.SAMPLE_RATE
                print(f"\n✅ Speech ended! Duration: {duration:.1f}s")
                vad.reset()

    except KeyboardInterrupt:
        print("\n\nStopping...")
    finally:
        audio.stop_recording()


def benchmark():
    """Benchmark all components."""
    print("\n=== Benchmarking Pipeline ===\n")

    import torch

    # Check GPU
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"VRAM total: {torch.cuda.get_device_properties(0).total_mem / 1024**3:.1f} GB")
    print(f"VRAM free:  {(torch.cuda.get_device_properties(0).total_mem - torch.cuda.memory_allocated()) / 1024**3:.1f} GB")

    # Generate test audio (5s of speech-like noise)
    test_audio = np.random.randn(config.SAMPLE_RATE * 5).astype(np.float32) * 0.1

    # Benchmark STT
    from stt.engine import STTEngine
    stt = STTEngine()
    t0 = time.time()
    stt.load()
    print(f"\n[STT] Load time: {time.time() - t0:.2f}s")
    print(f"[STT] VRAM: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")

    t0 = time.time()
    stt.transcribe(test_audio)
    print(f"[STT] Transcribe 5s audio: {time.time() - t0:.2f}s")

    # Benchmark TTS
    from tts.engine import TTSEngine
    tts = TTSEngine()
    t0 = time.time()
    tts.load()
    print(f"\n[TTS] Load time: {time.time() - t0:.2f}s")
    print(f"[TTS] VRAM (STT+TTS): {torch.cuda.memory_allocated() / 1024**3:.2f} GB")

    t0 = time.time()
    tts.synthesize("Hello, this is a benchmark test.", "en")
    print(f"[TTS] Synthesize ~30 chars: {time.time() - t0:.2f}s")

    # Benchmark AI
    from ai.brain import AIBrain
    ai = AIBrain()
    t0 = time.time()
    ai.warm_up()
    print(f"\n[AI] Warm-up time: {time.time() - t0:.2f}s")
    print(f"[AI] VRAM (all loaded): {torch.cuda.memory_allocated() / 1024**3:.2f} GB")

    t0 = time.time()
    ai.generate_response("Hello, tell me about your services", "en")
    print(f"[AI] Generate response: {time.time() - t0:.2f}s")

    print(f"\n[Total] VRAM usage: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")
    print(f"[Total] VRAM reserved: {torch.cuda.memory_reserved() / 1024**3:.2f} GB")

    stt.unload()
    tts.unload()


def main():
    parser = argparse.ArgumentParser(description="Test individual pipeline components")
    parser.add_argument(
        "--test", type=str, choices=["stt", "tts", "ai", "vad"],
        help="Component to test"
    )
    parser.add_argument(
        "--benchmark", action="store_true",
        help="Run full benchmark"
    )

    args = parser.parse_args()

    if args.benchmark:
        benchmark()
    elif args.test == "stt":
        test_stt()
    elif args.test == "tts":
        test_tts()
    elif args.test == "ai":
        test_ai()
    elif args.test == "vad":
        test_vad()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
