"""
AI Brain — LLM-powered sales conversation engine using Ollama.
Manages the conversational logic, qualification, and response generation.

Supports:
- Streaming LLM output (yields text chunks for real-time sentence pipeline)
- Seamless multilingual switching (en / hi / mr / gu / mixed)
- Automatic language-transition acknowledgment
"""

import time
import re
import sys
import os
from typing import Generator

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from ai.prompts import (
    SALES_AGENT_SYSTEM_PROMPT,
    SALES_AGENT_SYSTEM_PROMPT_HI,
    SALES_AGENT_SYSTEM_PROMPT_MR,
    SALES_AGENT_SYSTEM_PROMPT_GU,
    SALES_AGENT_SYSTEM_PROMPT_MULTILINGUAL,
    OPENING_SCRIPT,
)
from ai.memory import ConversationMemory


# Languages that get dedicated native-language system prompts
_NATIVE_PROMPT_LANGS = {"hi", "mr", "gu"}


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

        # Track previous language to detect switches
        self._prev_language: str = "en"

    def _get_client(self):
        """Lazy-load Ollama client."""
        if self._client is None:
            import ollama
            self._client = ollama.Client(host=config.OLLAMA_HOST)
        return self._client

    def _get_system_prompt(self, language: str = "en") -> str:
        """
        Select the system prompt for the detected language.

        - "hi" → Hindi prompt
        - "mr" → Marathi prompt
        - "gu" → Gujarati prompt
        - "en" → English prompt
        - anything else / mixed → multilingual prompt (mirrors prospect style)
        """
        template_map = {
            "en": SALES_AGENT_SYSTEM_PROMPT,
            "hi": SALES_AGENT_SYSTEM_PROMPT_HI,
            "mr": SALES_AGENT_SYSTEM_PROMPT_MR,
            "gu": SALES_AGENT_SYSTEM_PROMPT_GU,
        }
        template = template_map.get(language, SALES_AGENT_SYSTEM_PROMPT_MULTILINGUAL)

        return template.format(
            company_info=self.company_info,
            products_services=self.products_services,
            campaign_goal=self.campaign_goal,
        )

    def _language_switch_hint(self, new_lang: str, prev_lang: str) -> str | None:
        """
        Return an extra system hint when the prospect switches language mid-call,
        so the model acknowledges and follows the switch naturally.
        """
        if new_lang == prev_lang:
            return None
        lang_names = config.SUPPORTED_LANGUAGES
        new_name = lang_names.get(new_lang, new_lang.upper())
        prev_name = lang_names.get(prev_lang, prev_lang.upper())
        return (
            f"The prospect just switched from {prev_name} to {new_name}. "
            f"Seamlessly continue in {new_name} without commenting on the switch."
        )

    def warm_up(self):
        """Pre-load the model in Ollama to avoid cold-start latency."""
        if self._model_warmed:
            return
        print(f"[AI] Warming up {config.OLLAMA_MODEL}...")
        t0 = time.time()
        client = self._get_client()
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
        reason = self.campaign_goal.lower().rstrip(".")
        opening = OPENING_SCRIPT[lang].format(
            agent_name=self.agent_name,
            company_name=self.company_name,
            reason=reason,
        )
        self.memory.add_turn("agent", opening, language)
        self._prev_language = language
        return opening

    # ─── Non-streaming response (text mode / fallback) ───────────────

    def generate_response(self, prospect_text: str, language: str = "en") -> str:
        """
        Generate a complete AI response (blocking).

        Args:
            prospect_text: what the prospect said (transcribed)
            language: detected language code

        Returns:
            AI response text (ready for TTS)
        """
        self.memory.add_turn("prospect", prospect_text, language)

        system_prompt = self._build_system_prompt(language)
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.memory.get_context_for_llm())

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
            raw_text = self._get_fallback_response(language)

        clean_text = self._clean_for_tts(raw_text)
        if not clean_text:
            print(f"[AI] WARNING: Empty response after cleaning. Raw: {raw_text[:200]}")
            clean_text = self._get_fallback_response(language)

        elapsed = time.time() - t0
        print(f"[AI] Generated response in {elapsed:.2f}s ({len(clean_text)} chars)")

        self.memory.add_turn("agent", clean_text, language)
        self._extract_info(prospect_text, clean_text)
        self._prev_language = language

        return clean_text

    # ─── Streaming response (main voice pipeline) ────────────────────

    def generate_response_streaming(
        self,
        prospect_text: str,
        language: str = "en",
    ) -> Generator[str, None, None]:
        """
        Stream the AI response token-by-token via Ollama's streaming API.

        Yields complete sentences/phrases as they accumulate so the caller
        can pipe each one immediately to TTS without waiting for the full response.

        Usage:
            for sentence in brain.generate_response_streaming(text, lang):
                audio = tts.synthesize_sentence(sentence, lang)
                audio_io.play_audio(audio)

        The full assembled response is saved to memory after the generator is exhausted.
        """
        self.memory.add_turn("prospect", prospect_text, language)

        system_prompt = self._build_system_prompt(language)
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.memory.get_context_for_llm())

        client = self._get_client()
        full_response = ""
        buffer = ""
        t0 = time.time()
        first_chunk_time = None

        try:
            stream = client.chat(
                model=config.OLLAMA_MODEL,
                messages=messages,
                stream=True,
                options={
                    "temperature": config.OLLAMA_TEMPERATURE,
                    "num_predict": config.MAX_RESPONSE_TOKENS,
                    "num_ctx": config.OLLAMA_NUM_CTX,
                    "num_gpu": config.OLLAMA_NUM_GPU,
                },
            )

            for chunk in stream:
                token = chunk["message"]["content"]
                if not token:
                    continue

                if first_chunk_time is None:
                    first_chunk_time = time.time() - t0
                    print(f"[AI] First token in {first_chunk_time:.2f}s")

                full_response += token
                buffer += token

                # Yield a sentence whenever we hit a sentence boundary
                # and have accumulated enough content to be worth synthesizing.
                sentence, buffer = self._split_on_sentence_boundary(buffer)
                if sentence:
                    clean = self._clean_for_tts(sentence)
                    if clean:
                        yield clean

        except Exception as e:
            print(f"[AI] Streaming error: {e}")
            # Yield a fallback so TTS doesn't go silent
            yield self._get_fallback_response(language)
            full_response = self._get_fallback_response(language)

        # Flush any remaining buffer content
        if buffer.strip():
            clean = self._clean_for_tts(buffer)
            if clean:
                yield clean

        # Commit the full response to memory
        final_text = self._clean_for_tts(full_response)
        if not final_text:
            final_text = self._get_fallback_response(language)

        elapsed = time.time() - t0
        print(f"[AI] Full response in {elapsed:.2f}s ({len(final_text)} chars)")

        self.memory.add_turn("agent", final_text, language)
        self._extract_info(prospect_text, final_text)
        self._prev_language = language

    # ─── Helpers ─────────────────────────────────────────────────────

    def _build_system_prompt(self, language: str) -> str:
        """Build the full system prompt including state hints and language-switch notice."""
        system_prompt = self._get_system_prompt(language)

        # Inject language-switch hint when prospect changes language
        switch_hint = self._language_switch_hint(language, self._prev_language)
        if switch_hint:
            system_prompt += f"\n\n**Language switch note:** {switch_hint}"

        # Inject conversation state hints
        state_hint = self._get_state_hint()
        if state_hint:
            system_prompt += f"\n\n**Current conversation state:** {state_hint}"

        return system_prompt

    def _split_on_sentence_boundary(self, text: str) -> tuple[str, str]:
        """
        Split `text` into (ready_sentence, remainder).

        A sentence is considered ready when:
        1. It ends with a sentence-ending punctuation (. ! ? । ॥ ઃ ।)
        2. OR the buffer exceeds STREAM_MIN_CHARS and contains a clause break (, ; :)

        Returns ("", text) if no ready sentence is found yet.
        """
        # Sentence-ending characters including Devanagari danda (।) and double danda (॥)
        sentence_end = re.compile(r'[.!?।॥]+\s*')

        match = sentence_end.search(text)
        if match:
            end_pos = match.end()
            sentence = text[:end_pos].strip()
            remainder = text[end_pos:]
            return sentence, remainder

        # Clause break flush when buffer is long enough
        if len(text) >= config.STREAM_MIN_CHARS:
            clause_break = re.compile(r'[,;:]\s+')
            match = clause_break.search(text)
            if match:
                end_pos = match.end()
                sentence = text[:end_pos].strip()
                remainder = text[end_pos:]
                return sentence, remainder

        return "", text

    def _get_fallback_response(self, language: str = "en") -> str:
        """Fallback when LLM output is empty."""
        import random
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
            "mr": [
                "बरोबर आहे. तुम्ही सध्या काय वापरत आहात ते सांगाल का?",
                "मला समजते. आमच्या कंपनीने अशाच व्यवसायांना कशी मदत केली ते सांगतो.",
            ],
            "gu": [
                "બિલકુલ સાચી વાત છે. તમે અત્યારે શું ઉપયોગ કરો છો એ જણાવશો?",
                "હું સમજું છું. અમે આવી કંપनियોને કેવી રીતે મદદ કરી છે એ જણાવું?",
            ],
        }
        lang_fallbacks = fallbacks.get(language, fallbacks["en"])
        return random.choice(lang_fallbacks)

    def _clean_for_tts(self, text: str) -> str:
        """Clean LLM output to be natural for TTS."""
        # Strip <think>...</think> reasoning tags (deepseek-r1, qwen3 think mode)
        think_pattern = re.compile(r"<think>.*?</think>", flags=re.DOTALL)
        outside_think = think_pattern.sub("", text).strip()

        if outside_think:
            text = outside_think
        elif "<think>" in text:
            # Incomplete think block — extract the last substantive line inside it
            think_match = re.search(r"<think>(.*)", text, flags=re.DOTALL)
            if think_match:
                thinking = think_match.group(1).strip()
                lines = [l.strip() for l in thinking.split("\n") if l.strip()]
                quotes = re.findall(r'"([^"]+)"', thinking)
                if quotes:
                    text = " ".join(quotes)
                elif lines:
                    substantial = [l for l in lines if len(l) > 20]
                    text = substantial[-1] if substantial else lines[-1]
                else:
                    text = ""

        # Remove markdown
        text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
        text = re.sub(r"\*(.+?)\*", r"\1", text)
        text = re.sub(r"#{1,6}\s+", "", text)
        text = re.sub(r"[-*]\s+", "", text)
        text = re.sub(r"\d+\.\s+", "", text)

        # Remove URLs
        text = re.sub(r"https?://\S+", "", text)

        # Collapse whitespace
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
        """Keyword-based BANT signal extraction — covers EN, HI, MR, GU."""
        lower = prospect_text.lower()

        # Interest level
        not_interested_kw = [
            "not interested", "no thanks", "don't need",
            "नहीं चाहिए", "रुचि नहीं",
            "नको आहे", "रस नाही",      # Marathi
            "નથી જોઈતું", "રુચિ નથી",   # Gujarati
        ]
        interested_kw = [
            "interested", "tell me more", "sounds good",
            "बताइए", "रुचि है", "अच्छा लगता",
            "सांगा", "रस आहे",           # Marathi
            "જણાવો", "રુચિ છે",          # Gujarati
        ]
        maybe_kw = [
            "maybe", "possibly", "let me think",
            "शायद", "सोचूंगा",
            "कदाचित", "विचार करतो",      # Marathi
            "કદાચ", "વિચાર કરું",        # Gujarati
        ]

        if any(w in lower for w in not_interested_kw):
            self.memory.update_lead_info(interest_level="not_interested")
        elif any(w in lower for w in interested_kw):
            self.memory.update_lead_info(interest_level="interested")
        elif any(w in lower for w in maybe_kw):
            self.memory.update_lead_info(interest_level="maybe")

        budget_kw = ["budget", "cost", "price", "बजट", "कीमत", "लागत",
                     "बजेट", "किंमत", "बজેટ", "કિંમત"]
        authority_kw = ["i decide", "my team", "manager", "boss",
                        "मैं फैसला", "मेरी टीम", "मी ठरवतो", "माझी टीम",
                        "હું નક્કી", "મારી ટીમ"]
        need_kw = ["we need", "looking for", "problem", "challenge",
                   "हमें चाहिए", "ढूंढ रहे", "आम्हाला हवे", "शोधत आहोत",
                   "અમારે જોઈએ", "શોધી રહ્યા"]
        timeline_kw = ["soon", "this month", "this quarter", "urgent",
                       "जल्दी", "इस महीने", "लवकर", "या महिन्यात",
                       "જલ્દી", "આ મહિને"]
        callback_kw = ["call back", "call later", "बाद में", "कॉल करें",
                       "नंतर फोन", "बाद में कॉल", "પછી ફોન"]
        meeting_kw = ["schedule", "meeting", "demo", "मीटिंग", "डेमो",
                      "मीटिंग", "डेमो", "मीटिंग ठरवू", "મીટિંગ", "ડૅમો"]

        if any(w in lower for w in budget_kw):
            self.memory.update_lead_info(budget_discussed=True)
        if any(w in lower for w in authority_kw):
            self.memory.update_lead_info(authority_confirmed=True)
        if any(w in lower for w in need_kw):
            self.memory.update_lead_info(need_identified=True)
        if any(w in lower for w in timeline_kw):
            self.memory.update_lead_info(timeline_discussed=True)
        if any(w in lower for w in callback_kw):
            self.memory.update_lead_info(callback_requested=True)
        if any(w in lower for w in meeting_kw):
            self.memory.update_lead_info(meeting_scheduled=True)

    def get_summary(self) -> dict:
        """Get the call summary."""
        return self.memory.get_summary()
