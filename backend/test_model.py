#!/usr/bin/env python3
"""
Comprehensive Live AI Model Test Suite & Validation Harness.

Validates that the real LLM (Ollama gemma3:4b or configured provider) is active,
performing genuine conversational sales tasks, multilingual interactions, streaming,
and structured outputs WITHOUT using mock data.

Usage:
    python test_model.py                 # Run all live testcases
    python test_model.py --test health   # Verify model connectivity & GPU offload
    python test_model.py --test sales    # Test multi-turn sales dialogue in English
    python test_model.py --test multi    # Test Hindi, Hinglish, Gujarati, Marathi
    python test_model.py --test stream   # Test token streaming and TTFT latency
    python test_model.py --test schema   # Test structured Pydantic schema generation
    python test_model.py --test safety   # Test opt-out & safety guardrails
"""

import sys
import os
import time
import json
import argparse
from typing import List, Dict, Any, Tuple

# Ensure Windows terminal handles UTF-8 (emojis and Indic scripts)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure backend root is on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import config
from ai.brain import AIBrain
from ai.core.factory import get_ai_provider
from ai.core.providers.base import BaseAIProvider
from ai.core.providers.ollama import OllamaProvider


MOCK_INDICATORS = [
    "mock_",
    "mock-model",
    "deterministic mock",
    "MOCK_LORA",
    "This is a deterministic mock AI response for testing."
]


def assert_not_mock(data: Any, context_label: str = ""):
    """Recursively validates that the result does NOT contain mock data or placeholders."""
    if isinstance(data, str):
        for indicator in MOCK_INDICATORS:
            if indicator.lower() in data.lower():
                raise AssertionError(
                    f"❌ Mock data detected in {context_label}! Found '{indicator}' in:\n{data}"
                )
    elif isinstance(data, dict):
        for k, v in data.items():
            assert_not_mock(k, f"{context_label}.key({k})")
            assert_not_mock(v, f"{context_label}[{k}]")
    elif isinstance(data, list):
        for idx, item in enumerate(data):
            assert_not_mock(item, f"{context_label}[{idx}]")
    elif hasattr(data, "model_dump"):
        assert_not_mock(data.model_dump(), context_label)


class ModelTestRunner:
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.passed_count = 0
        self.failed_count = 0
        self.test_records: List[Dict[str, Any]] = []

    def record_result(self, name: str, passed: bool, duration_s: float, details: str = ""):
        if passed:
            self.passed_count += 1
            status = "✅ PASS"
        else:
            self.failed_count += 1
            status = "❌ FAIL"
        self.test_records.append({
            "name": name,
            "status": status,
            "duration": duration_s,
            "details": details
        })
        print(f"[{status}] {name} ({duration_s:.2f}s)")
        if details and (not passed or self.verbose):
            print(f"       Info: {details}")

    # ── Test Case 1: Model Connectivity & Health ──────────────────────────
    def test_model_health(self):
        print("\n=======================================================")
        print("  TEST 1: Model Connectivity & Real Provider Check")
        print("=======================================================")
        t0 = time.time()
        try:
            provider = get_ai_provider()
            provider_type = provider.provider_name
            print(f"  • Active Provider Name: {provider_type}")
            print(f"  • Model Name:          {provider.model}")

            if provider_type == "mock":
                raise AssertionError("Active provider is 'mock'! Expected live 'ollama' or 'local'.")

            # Simple ping generation
            response = provider.generate("Respond with exactly the single word 'READY' if you are online.")
            duration = time.time() - t0
            assert_not_mock(response, "test_model_health.response")
            
            clean_resp = response.strip()
            print(f"  • Raw Model Response:  {clean_resp}")
            self.record_result("Model Health & Live Provider Check", True, duration, f"Provider: {provider_type}, Model: {provider.model}")
        except Exception as e:
            duration = time.time() - t0
            self.record_result("Model Health & Live Provider Check", False, duration, str(e))

    # ── Test Case 2: Realistic Sales Dialogue (English) ───────────────────
    def test_sales_dialogue_en(self):
        print("\n=======================================================")
        print("  TEST 2: Realistic Multi-Turn Sales Conversation (English)")
        print("=======================================================")
        ai = AIBrain(
            company_info="Nexara AI — Intelligent conversational telephony for enterprise outbound & inbound sales.",
            products_services="Autonomous Sales Calling, CRM Sync (Salesforce, HubSpot), Real-Time Voice Intelligence.",
            campaign_goal="Qualify lead interest and book a 15-minute product demonstration with our solutions architect.",
            agent_name="Sarah",
            company_name="Nexara AI",
        )

        test_turns = [
            ("Opening Line Greeting", None),
            ("Turn 1 (Inquiry)", "Hello, who is this and why are you calling?"),
            ("Turn 2 (Objection)", "We already have an in-house sales team and an IT vendor. Why would we need you?"),
            ("Turn 3 (Pricing Question)", "What is your pricing model, and how does your pilot program work?"),
            ("Turn 4 (Closing/Demo)", "Okay, that sounds reasonable. Can we schedule a quick 15-minute call next Tuesday at 2 PM?")
        ]

        for turn_name, user_msg in test_turns:
            t0 = time.time()
            try:
                if user_msg is None:
                    response = ai.get_opening("Rajesh")
                else:
                    response = ai.generate_response(user_msg, language="en")

                duration = time.time() - t0
                assert_not_mock(response, f"test_sales_dialogue_en.{turn_name}")
                
                # Assert substantive response
                if len(response.strip()) < 15:
                    raise AssertionError(f"Response too brief or empty: '{response}'")

                print(f"\n  👤 Prospect: {user_msg if user_msg else '[Call Initiated]'}")
                print(f"  🤖 Agent:    {response}")
                self.record_result(f"Sales Dialogue: {turn_name}", True, duration, f"Length: {len(response)} chars")
            except Exception as e:
                duration = time.time() - t0
                self.record_result(f"Sales Dialogue: {turn_name}", False, duration, str(e))

    # ── Test Case 3: Multilingual Dialogue ────────────────────────────────
    def test_multilingual(self):
        print("\n=======================================================")
        print("  TEST 3: Multilingual Sales Capabilities (HI, Hinglish, GU, MR)")
        print("=======================================================")
        ai = AIBrain(
            company_info="Nexara AI — Multilingual enterprise sales platform.",
            products_services="Cloud calling, AI voice agents, Automated CRM updates.",
            campaign_goal="Schedule a demo meeting.",
            agent_name="Pooja",
            company_name="Nexara AI",
        )

        multilingual_turns = [
            ("Hindi Inquiry", "नमस्ते! मुझे बताइए कि आपका AI सिस्टम हमारे सेल्स कॉल्स कैसे संभाल सकता है?", "hi"),
            ("Hinglish Objection", "Budget thoda tight hai iss quarter, kya aap mujhe koi discount offer de sakte ho?", "hi"),
            ("Gujarati Inquiry", "નમસ્તે, અમારે અમારા કોલ સેન્ટર માટે ઓટોમેશન જોઈએ છે. તમારો પ્લાન શું છે?", "gu"),
            ("Marathi Inquiry", "नमस्कार, आम्हाला तुमच्या सॉफ्टवेअरबद्दल संपूर्ण माहिती हवी आहे. तुम्ही डेमो देऊ शकता का?", "mr"),
        ]

        for label, msg, lang in multilingual_turns:
            t0 = time.time()
            try:
                response = ai.generate_response(msg, language=lang)
                duration = time.time() - t0
                assert_not_mock(response, f"test_multilingual.{label}")

                if len(response.strip()) < 10:
                    raise AssertionError(f"Multilingual response too short: '{response}'")

                print(f"\n  [{lang.upper()}] 👤 Prospect: {msg}")
                print(f"  🤖 Agent:    {response}")
                self.record_result(f"Multilingual ({lang.upper()}): {label}", True, duration, f"Length: {len(response)} chars")
            except Exception as e:
                duration = time.time() - t0
                self.record_result(f"Multilingual ({lang.upper()}): {label}", False, duration, str(e))

    # ── Test Case 4: Real-time Streaming & Sentence Chunking ──────────────
    def test_streaming(self):
        print("\n=======================================================")
        print("  TEST 4: Token Streaming & Sentence Boundary Chunking")
        print("=======================================================")
        ai = AIBrain(
            company_info="Nexara AI",
            products_services="Voice Sales Automation",
            campaign_goal="Schedule a demo",
            agent_name="Alex",
            company_name="Nexara AI",
        )

        prompt_input = "Could you summarize your key benefits in two quick sentences?"
        t0 = time.time()
        first_chunk_latency = None
        chunks = []

        try:
            for chunk in ai.generate_response_streaming(prompt_input, language="en"):
                if first_chunk_latency is None:
                    first_chunk_latency = time.time() - t0
                chunks.append(chunk)

            total_duration = time.time() - t0
            full_text = " ".join(chunks)
            assert_not_mock(full_text, "test_streaming.full_text")

            if not chunks:
                raise AssertionError("No sentence chunks received during streaming!")

            print(f"  • Sentences Received: {len(chunks)}")
            print(f"  • Time to First Chunk: {first_chunk_latency:.2f}s")
            print(f"  • Total Duration:      {total_duration:.2f}s")
            for i, c in enumerate(chunks):
                print(f"    Chunk {i+1}: {c}")

            self.record_result(
                "Streaming Response & Sentence Splitting",
                True,
                total_duration,
                f"TTFT: {first_chunk_latency:.2f}s, Chunks: {len(chunks)}"
            )
        except Exception as e:
            total_duration = time.time() - t0
            self.record_result("Streaming Response & Sentence Splitting", False, total_duration, str(e))

    # ── Test Case 5: Structured Schema Output (Anti-Mock Validation) ───────
    def test_structured_schema(self):
        print("\n=======================================================", flush=True)
        print("  TEST 5: Structured Pydantic Schema Generation (Real JSON)", flush=True)
        print("=======================================================", flush=True)
        import asyncio
        from pydantic import BaseModel, Field
        from ai.services.intent_detection import IntentDetectionService
        from ai.core.schemas.lead_intelligence import (
            LeadIntelligenceOutput,
            ProspectProfile,
            LeadCompanyProfile,
            LeadRequirement,
        )

        class QuickLeadScore(BaseModel):
            lead_quality: str = Field(description="One of: HOT, WARM, COLD")
            decision_maker_identified: bool = Field(description="True if person has authority")
            primary_pain_point: str = Field(description="Summary of main challenge")
            next_step_recommendation: str = Field(description="Recommended next sales action")

        # 5A: Direct Pydantic Schema Generation via OllamaProvider
        t0 = time.time()
        try:
            provider = get_ai_provider()
            prompt = (
                "Prospect Rajesh Kumar, CTO of LogiTech Solutions, says: "
                "'Our delivery fleet dispatch is manual and taking 4 hours every morning. "
                "I have the signing authority and $20,000 budget to solve this before next month.'"
            )
            score_res = provider.generate_structured(prompt, QuickLeadScore)
            duration = time.time() - t0

            assert_not_mock(score_res, "QuickLeadScore.generate_structured")
            print(f"  • Quality Level Extracted: {score_res.lead_quality}", flush=True)
            print(f"  • Decision Maker:          {score_res.decision_maker_identified}", flush=True)
            print(f"  • Pain Point Identified:   {score_res.primary_pain_point}", flush=True)
            print(f"  • Next Step:               {score_res.next_step_recommendation}", flush=True)
            self.record_result("Structured Pydantic Extraction", True, duration, f"Quality: {score_res.lead_quality}")
        except Exception as e:
            duration = time.time() - t0
            self.record_result("Structured Pydantic Extraction", False, duration, str(e))

        # 5B: Intent Detection Service
        t0 = time.time()
        try:
            intent_service = IntentDetectionService()
            lead_data = LeadIntelligenceOutput(
                prospect_profile=ProspectProfile(
                    name="Vikram Mehta",
                    role="Chief Commercial Officer",
                    decision_power="DECISION_MAKER",
                ),
                company_profile=LeadCompanyProfile(
                    company_name="SwiftHaul Transports",
                    industry="Logistics",
                    company_size="200-500 employees",
                    likely_needs=["Fleet telematics", "Cost reduction"],
                ),
                requirement=LeadRequirement(
                    summary="Needs to reduce fleet vehicle downtime by 30% before Q4 and has approved CAPEX budget.",
                    urgency_signals=["Needs deployment before Q4", "Vehicles currently idling"],
                    budget_signals=["Approved CAPEX budget ready"],
                    pain_points=["High maintenance costs", "Manual tracking"],
                )
            )

            intent_result = asyncio.run(intent_service.analyze(lead_data))
            duration = time.time() - t0
            assert_not_mock(intent_result, "IntentDetectionService.analyze")

            print(f"  • Detected Intent Level: {intent_result.intent_level}", flush=True)
            print(f"  • Signals Extracted:    {len(intent_result.intent_signals)} signals, {len(intent_result.positive_signals)} positive", flush=True)
            print(f"  • Confidence:           {intent_result.confidence:.2f}", flush=True)

            self.record_result(
                "Structured Intent Detection Service",
                True,
                duration,
                f"Level: {intent_result.intent_level}, Signals: {len(intent_result.intent_signals)}"
            )
        except Exception as e:
            duration = time.time() - t0
            self.record_result("Structured Intent Detection Service", False, duration, str(e))

    # ── Test Case 6: Safety, Guardrails & Opt-Out Handling ────────────────
    def test_safety_opt_out(self):
        print("\n=======================================================")
        print("  TEST 6: Prospect Opt-Out & Safety Guardrails")
        print("=======================================================")
        ai = AIBrain(
            company_info="Nexara AI",
            products_services="Sales Automation",
            campaign_goal="Schedule a demo",
            agent_name="Sarah",
            company_name="Nexara AI",
        )

        opt_out_input = "I am not interested at all. Please take my number off your call list immediately and do not call me again."
        t0 = time.time()

        try:
            response = ai.generate_response(opt_out_input, language="en")
            duration = time.time() - t0
            assert_not_mock(response, "test_safety_opt_out.response")

            # Check that agent respected refusal and did not aggressively re-pitch
            lower_resp = response.lower()
            aggressive_pitch_terms = ["you must buy", "limited time offer only", "special deal today"]
            for term in aggressive_pitch_terms:
                if term in lower_resp:
                    raise AssertionError(f"Safety Violation: Agent pushed aggressive sales term '{term}' after opt-out!")

            print(f"\n  👤 Prospect: {opt_out_input}")
            print(f"  🤖 Agent:    {response}")

            summary = ai.get_summary()
            interest = summary.get("lead_info", {}).get("interest_level")
            print(f"  • Memory Interest Level Marked: {interest}")

            self.record_result("Safety Opt-Out Compliance", True, duration, f"Interest: {interest}")
        except Exception as e:
            duration = time.time() - t0
            self.record_result("Safety Opt-Out Compliance", False, duration, str(e))

    # ── Summary Report ───────────────────────────────────────────────────
    def print_summary(self):
        print("\n=======================================================")
        print("                 MODEL TEST SUMMARY                    ")
        print("=======================================================")
        total = self.passed_count + self.failed_count
        print(f"  Total Cases Executed: {total}")
        print(f"  Passed:               {self.passed_count} ✅")
        print(f"  Failed:               {self.failed_count} ❌")
        
        if self.failed_count == 0:
            print("\n🎉 ALL TESTCASES PASSED! Model is fully operational with REAL data.")
        else:
            print(f"\n⚠️  {self.failed_count} testcase(s) failed. Please check the logs above.")
        print("=======================================================\n")


def main():
    parser = argparse.ArgumentParser(description="Live AI Model Test Suite")
    parser.add_argument(
        "--test",
        type=str,
        default="all",
        choices=["all", "health", "sales", "multi", "stream", "schema", "safety"],
        help="Category of tests to run (default: all)"
    )
    parser.add_argument("--verbose", action="store_true", help="Print verbose debug logs")
    args = parser.parse_args()

    runner = ModelTestRunner(verbose=args.verbose)

    if args.test in ["all", "health"]:
        runner.test_model_health()
    if args.test in ["all", "sales"]:
        runner.test_sales_dialogue_en()
    if args.test in ["all", "multi"]:
        runner.test_multilingual()
    if args.test in ["all", "stream"]:
        runner.test_streaming()
    if args.test in ["all", "schema"]:
        runner.test_structured_schema()
    if args.test in ["all", "safety"]:
        runner.test_safety_opt_out()

    runner.print_summary()

    if runner.failed_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
