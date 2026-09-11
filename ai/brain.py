"""
AI Brain — LLM-powered sales conversation engine using Ollama.
Manages the conversational logic, qualification, and response generation.
"""

import time
import re
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from ai.prompts import (
    SALES_AGENT_SYSTEM_PROMPT,
    SALES_AGENT_SYSTEM_PROMPT_HI,
    OPENING_SCRIPT,
)
from ai.memory import ConversationMemory


class AIBrain:
    """LLM-powered sales conversation manager."""

    def __init__(
        self,
        company_info: str = "A technology solutions company",
        products_services: str = "IT consulting, cloud solutions, and digital transformation",
        campaign_goal: str = "Schedule a product demo meeting",
        agent_name: str = "Alex",
        company_name: str = "TechSolutions",
    ):
        self.company_info = company_info
        self.products_services = products_services
        self.campaign_goal = campaign_goal
        self.agent_name = agent_name
        self.company_name = company_name

        self.memory = ConversationMemory()
        self._client = None
        self._model_warmed = False

    def _get_client(self):
        """Lazy-load Ollama client."""
        if self._client is None:
            import ollama
            self._client = ollama.Client(host=config.OLLAMA_HOST)
        return self._client

    def _get_system_prompt(self, language: str = "en") -> str:
        """Get the appropriate system prompt based on language."""
        if language == "hi":
            template = SALES_AGENT_SYSTEM_PROMPT_HI
        else:
            template = SALES_AGENT_SYSTEM_PROMPT

        return template.format(
            company_info=self.company_info,
            products_services=self.products_services,
            campaign_goal=self.campaign_goal,
        )

    def warm_up(self):
        """Pre-load the model in Ollama to avoid cold start latency."""
        if self._model_warmed:
            return
        print(f"[AI] Warming up {config.OLLAMA_MODEL}...")
        t0 = time.time()
        client = self._get_client()
        # Send a dummy request to load model into VRAM
        client.chat(
            model=config.OLLAMA_MODEL,
            messages=[{"role": "user", "content": "Hello"}],
            options={"num_predict": 1, "num_gpu": config.OLLAMA_NUM_GPU},
        )
        self._model_warmed = True
        print(f"[AI] Model warmed up in {time.time() - t0:.1f}s")

    def get_opening(self, prospect_name: str = "", language: str = "en") -> str:
        """Get the opening line for the call."""
        lang = language if language in OPENING_SCRIPT else "en"
        # Make the reason natural for speech (lowercase, no "Schedule a..." prefix)
        reason = self.campaign_goal.lower().rstrip(".")
        opening = OPENING_SCRIPT[lang].format(
            agent_name=self.agent_name,
            company_name=self.company_name,
            reason=reason,
        )
        self.memory.add_turn("agent", opening, language)
        return opening

    def generate_response(self, prospect_text: str, language: str = "en") -> str:
        """
        Generate an AI response to the prospect's message.

        Args:
            prospect_text: what the prospect said (transcribed)
            language: detected language code

        Returns:
            AI response text (ready for TTS)
        """
        # Record prospect's turn
        self.memory.add_turn("prospect", prospect_text, language)

        # Build messages for LLM
        system_prompt = self._get_system_prompt(language)

        # Add conversation state hints
        state_hint = self._get_state_hint()
        if state_hint:
            system_prompt += f"\n\n**Current conversation state:** {state_hint}"

        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.memory.get_context_for_llm())

        # Note: /no_think was tested and causes empty output with qwen3 via Ollama
        # Instead, the system prompt explicitly instructs no XML tags/thinking

        # Call Ollama
        t0 = time.time()
        client = self._get_client()

        try:
            response = client.chat(
                model=config.OLLAMA_MODEL,
                messages=messages,
                options={
                    "temperature": config.OLLAMA_TEMPERATURE,
                    "num_predict": config.MAX_RESPONSE_TOKENS,
                    "num_ctx": config.OLLAMA_NUM_CTX,
                    "num_gpu": config.OLLAMA_NUM_GPU,
                },
            )
            raw_text = response["message"]["content"]
        except Exception as e:
            print(f"[AI] Error calling Ollama: {e}")
            raw_text = "I apologize, I'm having a technical issue. Could you repeat that?"

        # Clean up the response for TTS
        clean_text = self._clean_for_tts(raw_text)

        elapsed = time.time() - t0
        print(f"[AI] Generated response in {elapsed:.2f}s ({len(clean_text)} chars)")

        # If still empty after cleaning, use a context-aware fallback
        if not clean_text:
            print(f"[AI] WARNING: Empty response after cleaning. Raw: {raw_text[:200]}")
            clean_text = self._get_fallback_response(language)

        # Record agent's turn
        self.memory.add_turn("agent", clean_text, language)

        # Try to extract info from the conversation
        self._extract_info(prospect_text, clean_text)

        return clean_text

    def _get_fallback_response(self, language: str = "en") -> str:
        """Generate a fallback response when LLM output is empty."""
        fallbacks = {
            "en": [
                "That's a great point. Could you tell me more about what you're currently using?",
                "I understand. Let me share how we've helped similar companies in your industry.",
                "Absolutely. What would be the most important factor for you in evaluating a solution like ours?",
            ],
            "hi": [
                "बिल्कुल सही कहा आपने। क्या आप बता सकते हैं कि आप अभी क्या इस्तेमाल कर रहे हैं?",
                "मैं समझता हूँ। हमने आपकी तरह की कंपनियों की कैसे मदद की है, वो बताता हूँ।",
                "बिल्कुल। आपके लिए सबसे ज़रूरी बात क्या होगी इस समाधान में?",
            ],
        }
        import random
        lang_fallbacks = fallbacks.get(language, fallbacks["en"])
        return random.choice(lang_fallbacks)

    def _clean_for_tts(self, text: str) -> str:
        """Clean LLM output to be natural for TTS."""
        # Handle thinking tags (deepseek-r1, qwen3 in think mode)
        # First, try extracting content OUTSIDE think tags
        think_pattern = re.compile(r"<think>.*?</think>", flags=re.DOTALL)
        outside_think = think_pattern.sub("", text).strip()

        if outside_think:
            text = outside_think
        elif "<think>" in text:
            # If nothing outside think tags, extract the thinking content
            think_match = re.search(r"<think>(.*?)</think>", text, flags=re.DOTALL)
            if think_match:
                thinking = think_match.group(1).strip()
                # Split into lines/sentences, find the most "response-like" content
                # Look for quoted speech or the last substantial paragraph
                lines = [l.strip() for l in thinking.split("\n") if l.strip()]
                # Find lines that look like actual speech (contain quotes or are conversational)
                speech_lines = [l for l in lines if '"' in l or l.startswith('"')]
                if speech_lines:
                    # Extract quoted text
                    quotes = re.findall(r'"([^"]+)"', "\n".join(speech_lines))
                    if quotes:
                        text = " ".join(quotes)
                    else:
                        text = speech_lines[-1]
                elif lines:
                    # Take the last 2 substantial lines as the conclusion
                    substantial = [l for l in lines if len(l) > 20]
                    if substantial:
                        text = substantial[-1]
                    else:
                        text = lines[-1]
                else:
                    text = ""

        # Remove markdown formatting
        text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
        text = re.sub(r"\*(.+?)\*", r"\1", text)
        text = re.sub(r"#{1,6}\s+", "", text)
        text = re.sub(r"[-*]\s+", "", text)
        text = re.sub(r"\d+\.\s+", "", text)

        # Remove URLs
        text = re.sub(r"https?://\S+", "", text)

        # Remove extra whitespace
        text = re.sub(r"\n+", " ", text)
        text = re.sub(r"\s+", " ", text)

        return text.strip()


    def _get_state_hint(self) -> str:
        """Provide hints to the LLM about conversation state."""
        turns = self.memory.turn_count
        bant = self.memory.get_bant_score()

        hints = []
        if turns == 0:
            hints.append("This is the start of the call. Introduce yourself.")
        elif turns <= 2:
            hints.append("Early in the call. Build rapport and identify needs.")
        elif turns <= 6:
            hints.append(f"Mid-call. BANT score: {bant['score']}/4.")
            if not bant["need"]:
                hints.append("Try to identify their specific needs.")
            if not bant["authority"]:
                hints.append("Confirm if they're the decision maker.")
        elif turns <= 10:
            hints.append("Late in call. Start moving toward closing or scheduling follow-up.")
        else:
            hints.append("Call is running long. Wrap up naturally.")

        return " ".join(hints) if hints else ""

    def _extract_info(self, prospect_text: str, agent_text: str):
        """Attempt to extract useful info from the conversation."""
        lower = prospect_text.lower()

        # Simple keyword-based extraction (could use LLM for better results)
        if any(w in lower for w in ["not interested", "no thanks", "don't need", "नहीं चाहिए", "रुचि नहीं"]):
            self.memory.update_lead_info(interest_level="not_interested")
        elif any(w in lower for w in ["interested", "tell me more", "sounds good", "बताइए", "रुचि है", "अच्छा लगता"]):
            self.memory.update_lead_info(interest_level="interested")
        elif any(w in lower for w in ["maybe", "possibly", "let me think", "शायद", "सोचूंगा"]):
            self.memory.update_lead_info(interest_level="maybe")

        if any(w in lower for w in ["budget", "cost", "price", "बजट", "कीमत", "लागत"]):
            self.memory.update_lead_info(budget_discussed=True)
        if any(w in lower for w in ["i decide", "my team", "manager", "boss", "मैं फैसला", "मेरी टीम"]):
            self.memory.update_lead_info(authority_confirmed=True)
        if any(w in lower for w in ["we need", "looking for", "problem", "challenge", "हमें चाहिए", "ढूंढ रहे"]):
            self.memory.update_lead_info(need_identified=True)
        if any(w in lower for w in ["soon", "this month", "this quarter", "urgent", "जल्दी", "इस महीने"]):
            self.memory.update_lead_info(timeline_discussed=True)

        if any(w in lower for w in ["call back", "call later", "बाद में", "कॉल करें"]):
            self.memory.update_lead_info(callback_requested=True)
        if any(w in lower for w in ["schedule", "meeting", "demo", "मीटिंग", "डेमो"]):
            self.memory.update_lead_info(meeting_scheduled=True)

    def get_summary(self) -> dict:
        """Get the call summary."""
        self.memory.end_call()
        return self.memory.get_summary()

    @property
    def turn_count(self) -> int:
        return self.memory.turn_count
