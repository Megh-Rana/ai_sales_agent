# -*- coding: utf-8 -*-
"""
AI Brain - LLM-powered sales conversation engine.
Manages the conversational logic, qualification, and response generation.

Supports:
- Streaming LLM output (Param-1-7B / Ollama / Sarvam)
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


class ParamEngine:
    """HuggingFace Transformers engine for Param-1-7B (4-bit)."""

    def __init__(self, model_id: str):
        self.model_id = model_id
        self.tokenizer = None
        self.model = None
        self._loaded = False

    def load(self):
        if self._loaded:
            return
        from typing import TypedDict
        import transformers.utils
        class LossKwargs(TypedDict, total=False):
            num_items_in_batch: int
        transformers.utils.LossKwargs = LossKwargs

        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM

        print(f"[AI] Loading local model {self.model_id}...")
        t0 = time.time()
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_id, trust_remote_code=True)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_id,
            trust_remote_code=True,
            device_map="cuda",
        )
        self._loaded = True
        print(f"[AI] {self.model_id} loaded on {self.model.device} in {time.time() - t0:.1f}s")

    def format_messages(self, messages: list[dict]) -> str:
        prompt = ""
        for m in messages:
            role = m["role"]
            content = m["content"]
            if role == "system":
                prompt += f"System: {content}\n\n"
            elif role == "user":
                prompt += f"User: {content}\n"
            elif role == "assistant":
                prompt += f"Assistant: {content}\n"
        prompt += "Assistant: "
        return prompt

    def stream_chat(self, messages: list[dict], max_tokens=256, temperature=0.7) -> Generator[str, None, None]:
        self.load()
        import torch
        import threading
        from transformers import TextIteratorStreamer

        prompt = self.format_messages(messages)
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        inputs.pop("token_type_ids", None)
        streamer = TextIteratorStreamer(self.tokenizer, skip_prompt=True, skip_special_tokens=True)

        kwargs = dict(
            **inputs,
            streamer=streamer,
            max_new_tokens=max_tokens,
            temperature=temperature,
            do_sample=True,
        )
        thread = threading.Thread(target=self.model.generate, kwargs=kwargs, daemon=True)
        thread.start()

        for token in streamer:
            yield token


class AIBrain:
    """LLM-powered sales conversation manager."""

    def __init__(
        self,
        company_info: str = "A technology solutions company",
        products_services: str = "IT consulting, cloud solutions, and digital transformation",
        campaign_goal: str = "Schedule a product demo meeting",
        agent_name: str = "Alex",
        company_name: str = "TechSolutions",
        default_language: str = "en",
    ):
        self.company_info = company_info
        self.products_services = products_services
        self.campaign_goal = campaign_goal
        self.agent_name = agent_name
        self.company_name = company_name

        self.memory = ConversationMemory()
        self._client = None
        self._param_engine = None
        self._model_warmed = False

        # Track previous language to detect switches; seed with session language
        self._prev_language: str = default_language

    def _get_client(self):
        """Lazy-load Ollama client."""
        if self._client is None:
            import ollama
            self._client = ollama.Client(host=config.OLLAMA_HOST)
        return self._client

    def _get_param_engine(self):
        """Lazy-load Param-1-7B HF engine."""
        if self._param_engine is None:
            self._param_engine = ParamEngine(config.PARAM_MODEL_ID)
        return self._param_engine

    def _get_system_prompt(self, language: str = "en") -> str:
        """
        Select the system prompt for the detected language.
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
        """Pre-load the model or verify cloud connection to avoid cold-start latency."""
        if self._model_warmed:
            return
        provider = getattr(config, "LLM_PROVIDER", "ollama")
        if provider == "sarvam" and getattr(config, "HAS_SARVAM_KEY", False):
            try:
                model_name = getattr(config, "SARVAM_LLM_MODEL", "sarvam-105b")
                print(f"[AI] Warming up Sarvam AI Cloud ({model_name})...")
                t0 = time.time()
                from sarvamai import SarvamAI
                client = SarvamAI(api_subscription_key=config.SARVAM_API_KEY)
                client.chat.completions(
                    model=model_name,
                    messages=[{"role": "user", "content": "ping"}],
                    max_tokens=1,
                    reasoning_effort=None,
                )
                self._model_warmed = True
                print(f"[AI] Sarvam AI Cloud warmed up in {time.time() - t0:.1f}s")
            except Exception as e:
                print(f"[AI] Sarvam warm-up notice ({e}). Client ready for interactive calls.")
                self._model_warmed = True
        elif provider == "param":
            print(f"[AI] Warming up local model {config.PARAM_MODEL_ID}...")
            engine = self._get_param_engine()
            engine.load()
            self._model_warmed = True
            print(f"[AI] Local model warmed up.")
        elif provider == "ollama":
            try:
                print(f"[AI] Warming up {config.OLLAMA_MODEL}...")
                t0 = time.time()
                client = self._get_client()
                client.chat(
                    model=config.OLLAMA_MODEL,
                    messages=[{"role": "user", "content": "Hello"}],
                    keep_alive=-1,
                    options={"num_predict": 1, "num_gpu": config.OLLAMA_NUM_GPU},
                )
                self._model_warmed = True
                print(f"[AI] Model warmed up in {time.time() - t0:.1f}s")
            except Exception as e:
                print(f"[AI] Ollama warm-up notice ({e}). Will connect when Ollama is running.")

    def _clean_pitch_text(self, text: str) -> str:
        """Strip formatting, thinking tags, labels, and outer quotes from generated pitch."""
        clean = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
        clean = re.sub(r"^(Alex|Agent|Vidur|Assistant|Sales Rep):\s*", "", clean.strip(), flags=re.IGNORECASE)
        clean = clean.strip("\"'“”«»` \n\t")
        clean = re.sub(r"\s+", " ", clean).strip()
        return clean

    def _fallback_pitch(self, contact: str, company: str, language: str) -> str:
        """Personalized multilingual fallback pitch if LLM is offline or times out."""
        c = contact.strip() if contact and contact.strip() != "there" else ""
        if language == "hi":
            greeting = f"नमस्ते {c} जी, " if c else "नमस्ते, "
            return f"{greeting}मैं {self.agent_name}, Vidur AI से बोल रहा हूँ। {company} के संबंध में बात करने के लिए क्या आपके पास एक मिनट है?"
        elif language == "gu":
            greeting = f"નમસ્તે {c}ભાઈ, " if c else "નમસ્તે, "
            return f"{greeting}હું {self.agent_name}, Vidur AI તરફથી. {company} માટે એક મિનિટ સમય મળી શકે છે?"
        elif language == "mr":
            greeting = f"नमस्कार {c}, " if c else "नमस्कार, "
            return f"{greeting}मी {self.agent_name}, Vidur AI कडून. {company} च्या संदर्भात बोलायला एक मिनिट आहे का?"
        else:
            greeting = f"Hi {c}, " if c else "Hello, "
            return f"{greeting}this is {self.agent_name} from Vidur AI following up regarding {company}. Do you have a quick minute?"

    def generate_dynamic_opening_pitch(
        self,
        prospect_name: str = "",
        company_name: str = "",
        company_info: str = "",
        products_services: str = "",
        language: str = "en",
        requirement: str = "",
        buying_signals: str = "",
    ) -> str:
        """
        Dynamically generate a personalized opening pitch using Ollama LLM based on
        company details, specific requirements, and the selected language.
        """
        company = company_name or self.company_name or "your company"
        contact = prospect_name.strip() if prospect_name else ""
        info = company_info or self.company_info or f"{company} operations"
        req = requirement or self.campaign_goal or "business automation and process efficiency"
        signals = buying_signals or ""
        services = products_services or self.products_services or "AI sales intelligence and autonomous voice systems"

        lang_names = {
            "en": "English",
            "hi": "Hindi (in Devanagari script)",
            "mr": "Marathi (in Devanagari script)",
            "gu": "Gujarati (in Gujarati script)",
        }
        target_lang = lang_names.get(language, "English")
        contact_ref = f"{contact} at {company}" if contact else f"the operations lead at {company}"

        prompt = (
            f"You are {self.agent_name}, a friendly, professional AI sales representative from Vidur AI calling {contact_ref}.\n"
            f"Target Prospect Context:\n"
            f"- Company: {company}\n"
            f"- Industry / Context: {info}\n"
            f"- Specific Requirement / Pain Point: {req}\n"
            f"- Buying Signal / Event Trigger: {signals}\n"
            f"- Our Solution: {services}\n\n"
            f"Task: Generate a natural, engaging 1-2 sentence spoken opening pitch greeting in {target_lang}.\n"
            f"Guidelines:\n"
            f"1. Greet {contact or 'the prospect'} professionally and introduce yourself as {self.agent_name} from Vidur AI.\n"
            f"2. Concretely reference {company}'s specific requirement or recent initiative to show direct relevance.\n"
            f"3. End with a polite, natural conversational question asking if they have a brief minute to connect.\n"
            f"4. Keep it strictly to 1 or 2 spoken sentences (under 35 words).\n"
            f"5. IMPORTANT: Output ONLY the spoken dialogue. Do NOT include quotes, prefixes like '{self.agent_name}:', or explanations."
        )

        provider = getattr(config, "LLM_PROVIDER", "ollama")
        if provider == "ollama":
            try:
                client = self._get_client()
                resp = client.chat(
                    model=config.OLLAMA_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    options={
                        "temperature": 0.7,
                        "num_predict": 90,
                        "num_gpu": config.OLLAMA_NUM_GPU,
                    },
                )
                raw = resp.get("message", {}).get("content", "").strip()
                cleaned = self._clean_pitch_text(raw)
                if cleaned and len(cleaned) > 15:
                    print(f"[AI] Dynamically generated pitch ({language}): {cleaned}")
                    return cleaned
            except Exception as e:
                print(f"[AI] Dynamic pitch generation notice ({e}), using personalized fallback.")

        return self._fallback_pitch(contact, company, language)

    def get_opening(
        self,
        prospect_name: str = "",
        language: str = "en",
        requirement: str = "",
        buying_signals: str = "",
    ) -> str:
        """Get the opening line for the call (dynamically generated via Ollama with fallback)."""
        return self.generate_dynamic_opening_pitch(
            prospect_name=prospect_name,
            company_name=self.company_name,
            company_info=self.company_info,
            products_services=self.products_services,
            language=language,
            requirement=requirement or self.campaign_goal,
            buying_signals=buying_signals,
        )

    def think(self, user_text: str, detected_language: str = "en") -> Generator[str, None, None]:
        """
        Process user speech, update conversation history, and yield response sentences.
        """
        # Record user turn
        self.memory.add_turn("user", user_text, language=detected_language)

        # Detect language switch
        switch_hint = self._language_switch_hint(detected_language, self._prev_language)
        self._prev_language = detected_language

        # Build messages for LLM
        system_prompt = self._get_system_prompt(detected_language)
        messages = [{"role": "system", "content": system_prompt}]

        if switch_hint:
            messages.append({"role": "system", "content": switch_hint})

        # Add recent conversation history (last N turns)
        history = self.memory.get_recent_history(n=6)
        for turn in history:
            content = turn.get("content") if "content" in turn else turn.get("text", "")
            messages.append({"role": turn["role"], "content": content})

        # Sentence buffer for streaming TTS
        sentence_buffer = ""
        full_response = ""

        # Stream tokens from LLM and segment into complete sentences
        for token in self._stream_raw_tokens(messages):
            sentence_buffer += token
            full_response += token

            # Check if we have reached a sentence boundary
            sentence = self._extract_sentence(sentence_buffer)
            if sentence:
                yield sentence
                sentence_buffer = sentence_buffer[len(sentence):].lstrip()

        # Yield any remaining text as the final sentence
        remaining = sentence_buffer.strip()
        if remaining:
            yield remaining

        # Clean and save the assistant's turn in memory
        cleaned = self._clean_llm_response(full_response)
        self.memory.add_turn("assistant", cleaned, language=detected_language)

    def _extract_sentence(self, text: str) -> str | None:
        """Extract the first complete sentence from buffered text, if any."""
        import re
        # Match common sentence terminators (. ! ? or Hindi purna viram ।)
        match = re.search(r"([.!?।])(\s+|$)", text)
        if match:
            end_pos = match.end()
            sentence = text[:end_pos].strip()
            # Only return if it meets minimum character length
            if len(sentence) >= getattr(config, "STREAM_MIN_CHARS", 30):
                return sentence
        return None

    def _clean_llm_response(self, text: str) -> str:
        """Strip formatting, thinking tokens, and extra whitespace."""
        import re
        clean_text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
        clean_text = re.sub(r"[\*\_#`]", "", clean_text)
        clean_text = re.sub(r"\s+", " ", clean_text).strip()
        return clean_text

    def _stream_raw_tokens(self, messages: list[dict]) -> Generator[str, None, None]:
        """Stream raw tokens from the selected LLM provider (Ollama by default)."""
        provider = getattr(config, "LLM_PROVIDER", "ollama")

        if provider == "sarvam" and getattr(config, "HAS_SARVAM_KEY", False):
            from sarvamai import SarvamAI
            client = SarvamAI(api_subscription_key=config.SARVAM_API_KEY)
            model_name = getattr(config, "SARVAM_LLM_MODEL", "sarvam-105b")
            try:
                stream = client.chat.completions(
                    model=model_name,
                    messages=messages,
                    reasoning_effort=None,
                    stream=True,
                )
                for chunk in stream:
                    if hasattr(chunk, "choices") and chunk.choices and len(chunk.choices) > 0:
                        delta = chunk.choices[0].delta
                        if hasattr(delta, "content") and delta.content:
                            yield delta.content
                return
            except Exception as e:
                print(f"[AI] Sarvam 105B API error ({e}).")

        elif provider == "param":
            engine = self._get_param_engine()
            for token in engine.stream_chat(messages):
                yield token

        else:  # "ollama" fallback
            client = self._get_client()
            stream = client.chat(
                model=config.OLLAMA_MODEL,
                messages=messages,
                stream=True,
                keep_alive=-1,
                options={
                    "temperature": config.OLLAMA_TEMPERATURE,
                    "num_predict": config.MAX_RESPONSE_TOKENS,
                    "num_ctx": config.OLLAMA_NUM_CTX,
                    "num_gpu": config.OLLAMA_NUM_GPU,
                },
            )
            for chunk in stream:
                token = chunk["message"]["content"]
                if token:
                    yield token

    # ─── Streaming response (main voice pipeline) ────────────────────

    def generate_response_streaming(
        self,
        prospect_text: str,
        language: str = "en",
    ) -> Generator[str, None, None]:
        """
        Stream the AI response token-by-token via the configured LLM provider.

        Yields complete sentences/phrases as they accumulate so the caller
        can pipe each one immediately to TTS without waiting for the full response.
        """
        self.memory.add_turn("prospect", prospect_text, language)

        system_prompt = self._build_system_prompt(language)
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.memory.get_context_for_llm())

        full_response = ""
        buffer = ""
        t0 = time.time()
        first_chunk_time = None

        try:
            for token in self._stream_raw_tokens(messages):
                if not token:
                    continue

                if first_chunk_time is None:
                    first_chunk_time = time.time() - t0
                    print(f"[AI] First token in {first_chunk_time:.2f}s")

                full_response += token
                buffer += token

                # Yield a sentence whenever we hit a sentence boundary
                sentence, buffer = self._split_on_sentence_boundary(buffer)
                if sentence:
                    clean = self._clean_for_tts(sentence)
                    if clean:
                        yield clean

        except Exception as e:
            print(f"[AI] Streaming error: {e}")
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
        1. It ends with a sentence-ending punctuation (. ! ?) or Devanagari danda
        2. OR the buffer exceeds STREAM_MIN_CHARS and contains a clause break (, ; :)

        Returns ("", text) if no ready sentence is found yet.
        """
        # Sentence-ending characters including Devanagari danda (\u0964) and double danda (\u0965)
        sentence_end = re.compile(r'[.!?\u0964\u0965]+\s*')

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
            # Incomplete think block - extract the last substantive line inside it
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
        """Keyword-based BANT signal extraction - covers EN, HI, MR, GU."""
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
