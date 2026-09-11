#!/usr/bin/env python3
"""
AI Sales Voice Agent — Main Entry Point

Usage:
    # Full voice mode (mic + speaker)
    python main.py

    # Text-only mode (no audio hardware needed)
    python main.py --text

    # Custom company info
    python main.py --company "My Company" --services "Web Development" --agent "Priya"
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pipeline.orchestrator import PipelineOrchestrator


def main():
    parser = argparse.ArgumentParser(description="AI Sales Voice Agent")
    parser.add_argument(
        "--text", action="store_true",
        help="Run in text-only mode (no audio hardware needed)"
    )
    parser.add_argument(
        "--company", type=str,
        default="TechSolutions India",
        help="Company name"
    )
    parser.add_argument(
        "--services", type=str,
        default="Microsoft 365, SharePoint, cloud migration, and IT consulting services",
        help="Products/services description"
    )
    parser.add_argument(
        "--agent", type=str,
        default="Alex",
        help="Agent name"
    )
    parser.add_argument(
        "--goal", type=str,
        default="Schedule a product demo to show how our IT solutions can streamline their operations",
        help="Campaign goal"
    )
    parser.add_argument(
        "--speaker-wav", type=str,
        default=None,
        help="Path to speaker reference WAV for voice cloning"
    )

    args = parser.parse_args()

    print("\n🚀 AI Sales Voice Agent")
    print(f"   Company:  {args.company}")
    print(f"   Services: {args.services}")
    print(f"   Agent:    {args.agent}")
    print(f"   Goal:     {args.goal}")
    print(f"   Mode:     {'Text' if args.text else 'Voice'}")

    pipeline = PipelineOrchestrator(
        company_info=f"{args.company} — a leading technology solutions provider in India",
        products_services=args.services,
        campaign_goal=args.goal,
        agent_name=args.agent,
        company_name=args.company,
    )

    if args.speaker_wav:
        pipeline.tts.set_speaker_wav(args.speaker_wav)

    if args.text:
        pipeline.run_text_mode()
    else:
        pipeline.run_interactive()


if __name__ == "__main__":
    main()
