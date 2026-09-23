# Vidur AI Sales Operating System 🎙️

Autonomous voice-driven AI sales platform with real-time speech calling, multi-channel lead discovery, CRM management, and compliance controls.

---

## 🚀 Quick Start (Linux)

```bash
# Make scripts executable
chmod +x run-all-linux.sh stop-all-linux.sh

# Start all services (Ollama, Backend API, Frontend UI, migrations)
./run-all-linux.sh
```

To stop all background services:
```bash
./stop-all-linux.sh
```

---

## 🌐 Access Points

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:3000](http://localhost:3000) | Vite + React Sales OS interface |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | FastAPI server & WebSocket engine |
| **Interactive API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI for exploring all endpoints |
| **ReDoc API Documentation** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | Alternative OpenAPI documentation |
| **Ollama LLM Engine** | [http://localhost:11434](http://localhost:11434) | Local Gemma 3 4B inference server |

---

## 🔑 Default Seeded User Credentials

The database is pre-seeded with administrator and sales representative accounts for testing:

| Name | Email | Password | Role | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Neel Agrawal** | `neel@vidur.in` | `neelit002` | `admin` | Pre-filled default on Login screen |
| **Megh Rana** | `megh@vidur.in` | `meghce099` | `admin` | Full administrator privileges |
| **Vidur Administrator** | `admin@vidur.in` | `admin@2026` | `admin` | Primary platform administrator |
| **Vidur Admin (v1)** | `admin@vidur.ai` | `Admin@Vidur2024!` | `admin` | Legacy admin account |
| **Test Rep** | `rep@vidur.ai` | `Rep@Vidur2024!` | `sales_rep` | Standard sales representative |

> **Note:** New users can also register self-serve at [http://localhost:3000/register](http://localhost:3000/register).

---

## ⚙️ AI Engine Configuration

- **LLM Provider:** Ollama (`gemma3:4b`, runs 100% locally with zero cloud API keys needed)
- **STT (Speech-to-Text):** Sarvam AI with local `faster-whisper` fallback
- **TTS (Text-to-Speech):** Sarvam AI with local `edge-tts` fallback
- **Database:** SQLite local storage (`sales_platform.db`) for development; PostgreSQL supported for production

---

## 📈 Scalability, Concurrency & High-Throughput Deployment

This section provides a rigorous technical analysis of the system's concurrency capacity, computational bottlenecks, and the step-by-step architectural blueprint to scale from local single-workstation testing to **1,000+ concurrent voice calls**.

### 1. Current Concurrency Capacity: How Many Calls Can Be Deployed at Once?

Unlike traditional web applications where a single server handles thousands of HTTP requests per second, **real-time voice AI requires sub-second roundtrip latency (<1.2s)** across three sequential compute-heavy steps: **STT (Speech-to-Text) ➔ LLM Inference ➔ TTS (Text-to-Speech)**. If processing latency exceeds 1.5 seconds, callers perceive silence as an awkward pause or dropped call.

| Deployment Profile | Compute Infrastructure | Max Concurrent Active Calls | Latency / Call | Key Limiting Bottleneck |
| :--- | :--- | :--- | :--- | :--- |
| **100% Local Inference** *(Current Dev)* | 1x Workstation GPU (RTX 4090 / RTX 3060 / A10G) + 8-core CPU | **3 – 5 calls** | 800ms – 1.4s | **GPU VRAM & Sequential LLM/STT queuing**: Ollama (`gemma3:4b`) and Faster-Whisper serialize prompt processing on a single GPU. |
| **Hybrid Cloud (API offload)** | 1x Standard Cloud VM (8 vCPU, 16GB RAM) + Cloud APIs (Sarvam/Deepgram STT + Groq/Claude 3.5 + Cartesia TTS) | **30 – 50 calls** | 500ms – 900ms | **FastAPI Async I/O & Network Sockets**: Bounded by Python asyncio event loop and WebSocket memory buffering. |
| **Dedicated GPU Inference Cluster** | 4x NVIDIA A10G / 2x H100 with vLLM + Triton Whisper | **150 – 300 calls** | 400ms – 750ms | **Continuous Batching limits** and audio transcoding bitrate. |
| **Distributed Enterprise Platform** | Kubernetes Autoscaling + LiveKit WebRTC SFU + vLLM cluster + SIP Trunking | **1,000 – 10,000+ calls** | 350ms – 600ms | **Carrier SIP trunk concurrency limits** & cloud quota. |

---

### 2. Deep Dive: Key Architectural Bottlenecks

1. **LLM Inference Queuing**:
   - *Current State*: Standard Ollama runs sequential inference. When 5 calls request conversational responses at the exact same sub-second window, requests 4 and 5 experience 2–4 seconds of queuing delay.
   - *Impact*: Prospect speaks, but hears silence while the agent queues on GPU.
2. **Audio Streaming & Transcoding Contention**:
   - *Current State*: Direct WebSockets connected into a single FastAPI Python process.
   - *Impact*: In Python, GIL and asyncio CPU spikes during audio encoding/decoding degrade audio streaming packet consistency, leading to jitter.
3. **Database Write Contention**:
   - *Current State*: SQLite local file storage (`sales_platform.db`).
   - *Impact*: SQLite relies on database-level write locks (`database is locked` error occurs when >10 calls attempt to flush transcript tokens and qualification states concurrently).
4. **Telephony & Network Signaling**:
   - *Current State*: Single-host WebSockets without SIP trunking or PSTN carrier connections.
   - *Impact*: Cannot scale to real telephone network numbers without a Session Border Controller (SBC) and elastic carrier trunks.

---

### 3. Target Scale Architecture: Blueprint for 1,000+ Concurrent Calls

To achieve high concurrency with five-nines (99.999%) reliability and sub-800ms conversational response times, the architecture must decouple into distributed, independently autoscaling tiers:

```
                                  [ Public Telephony / WebRTC ]
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                         [ Kamailio SIP Proxy ]   [ LiveKit WebRTC SFU ]
                         (Elastic Carrier Trunks) (Browser & WebRTC Audio)
                                    │                       │
                     ═══════════════╪═══════════════════════╪═══════════════
                               Distributed Redis Audio Streams / gRPC
                     ═══════════════╪═══════════════════════╪═══════════════
                                    ▼                       ▼
                     ┌─────────────────────────────┬─────────────────────────────┐
                     │     STT Worker Pool         │       TTS Worker Pool       │
                     │  (Deepgram Nova-2 / Whisper │   (Cartesia Sonic / Piper   │
                     │   Triton Inference Cluster) │    ONNX Streaming Workers)  │
                     └──────────────┬──────────────┴──────────────▲──────────────┘
                                    │                             │
                                    ▼                             │
                     ┌────────────────────────────────────────────┴──────────────┐
                     │                   Voice Agent Orchestrator                │
                     │            (Temporal.io / Celery State Machine)           │
                     └──────────────────────────────┬────────────────────────────┘
                                                    │
                                    ┌───────────────┴───────────────┐
                                    ▼                               ▼
                      [ High-Throughput LLM Cluster ]     [ Enterprise Data Tier ]
                      - vLLM with PagedAttention          - PostgreSQL Cluster
                      - Continuous Batching (A10G/H100)   - Redis In-Memory Cache
                      - Groq / Anthropic Cloud Fallback   - AWS S3 / Cloudflare R2
```

#### Layer 1: Telephony & Audio Signaling Tier
- **WebRTC SFU (LiveKit / Mediasoup)**: Replaces direct browser WebSockets with high-performance Selective Forwarding Units written in Go/Rust capable of handling 20,000+ simultaneous audio channels with built-in jitter buffer and adaptive bitrate control.
- **SIP Trunking & Media Gateways (Kamailio + FreeSWITCH / Asterisk)**: Connects to Tier-1 carrier trunks (Twilio Elastic SIP, Telnyx, Tata Communications, Bandwidth) with automatic carrier failover and CNAM caller ID reputation protection.

#### Layer 2: Decoupled Real-Time AI Pipeline
- **Distributed STT**: Stream incoming 16kHz PCM audio chunks to dedicated Triton Inference Server pods running GPU-optimized Whisper (TensorRT-LLM) or managed streaming STT (Deepgram Nova-2, Sarvam Saaras) over bidirectional gRPC (<150ms latency).
- **High-Throughput LLM Serving via vLLM**:
  - Replace Ollama with **vLLM** or **TensorRT-LLM** running on a multi-GPU cluster.
  - Utilizes **Continuous Batching** and **PagedAttention** to process prompt iterations concurrently rather than sequentially. A single 4x A10G (96GB VRAM) node can serve 80–120 concurrent conversational voice streams simultaneously without token degradation.
- **Streaming Low-Latency TTS**:
  - Implement chunk-by-chunk sentence streaming: as soon as the LLM generates the first 4–6 words, immediately send to TTS (Cartesia Sonic, ElevenLabs Flash, or local Piper ONNX).
  - Time-to-First-Audio-Byte (TTFB) drops to **<120ms**.

#### Layer 3: Campaign Orchestration & Predictive Pacing
- **Campaign Queue Engine (Temporal.io / Apache Kafka / Celery)**:
  - Manages outbound dialing campaigns across thousands of prospects.
  - **Predictive Dialing Pacing Algorithm**: Dynamically calculates the optimal dialing multiplier ($N$ dials per idle agent) based on live answer rates, voicemail detection (AMD), and current agent pool capacity.
- **Timezone & Compliance Guardrail Engine**:
  - Automatically queries the prospect's local timezone (e.g. US Pacific, Eastern, India IST, UK GMT).
  - Enforces TCPA & TRAI compliance rules: blocks calls between 8:00 PM and 8:00 AM local time and scrubs against National Do-Not-Call (DNC) registries before dial dispatch.

#### Layer 4: Enterprise State & Persistence Tier
- **PostgreSQL with PgBouncer**: Replaces SQLite with clustered relational storage for contacts, campaigns, and call analytics.
- **Redis Cluster**: Stores ephemeral in-call session states, partial transcripts, real-time BANT scores, and agent context memory.
- **Cloudflare R2 / AWS S3**: Stores compressed dual-channel call audio recordings and compliance artifacts.

---

### 4. Scalability Improvements Roadmap

| Phase | Timeline | Focus Areas | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1: Foundation** | 0 – 3 Months | Database & Session Decoupling | • Migrate from SQLite to **PostgreSQL + Redis**.<br>• Implement **Timezone & Quiet-Hours dialing engine** (9 AM–6 PM local window enforcement).<br>• Add **Gunicorn/Uvicorn multi-worker** process distribution behind Nginx.<br>• Introduce **Email-based pitch outreach** to complement voice dial attempts. |
| **Phase 2: Voice Throughput** | 3 – 6 Months | High-Capacity AI Inference | • Deploy **vLLM multi-GPU inference cluster** with continuous batching.<br>• Transition from local PyAudio to **LiveKit WebRTC SFU** for browser calling.<br>• Implement sentence-chunked streaming TTS (<150ms TTFB).<br>• Predictive dialer engine with Answering Machine Detection (AMD). |
| **Phase 3: Telco Scale** | 6 – 12 Months | Multi-Region Carrier Integration | • Connect **Kamailio SIP proxies** with elastic PSTN carrier trunks.<br>• Multi-region Kubernetes deployment (US East, US West, Europe, India) for sub-50ms network edge latency.<br>• STIR/SHAKEN A-level attestation & spam reputation monitoring.<br>• Automated post-call CRM sync (Salesforce, HubSpot, Zoho) via Kafka event stream. |

---

## 📋 Helpful Logs

```bash
# View live backend logs
tail -f logs/backend.log

# View live frontend logs
tail -f logs/frontend.log

# Follow all service logs
tail -f logs/*.log
```
