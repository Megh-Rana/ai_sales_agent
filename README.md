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

## 📋 Helpful Logs

```bash
# View live backend logs
tail -f logs/backend.log

# View live frontend logs
tail -f logs/frontend.log

# Follow all service logs
tail -f logs/*.log
```
