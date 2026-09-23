# Quick Start Guide

## Setup (First Time)

```bash
# Make scripts executable
chmod +x run-all-linux.sh stop-all-linux.sh

# Run everything (installs Ollama, dependencies, starts all services)
./run-all-linux.sh
```

## Daily Usage

```bash
# Start all services
./run-all-linux.sh

# Stop all services
./stop-all-linux.sh
```

## Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Ollama:** http://localhost:11434

## View Logs

```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log

# All logs
tail -f logs/*.log
```

## Configuration

**LLM:** Ollama Gemma 3 4B (local, no API key needed)  
**STT:** Sarvam → Whisper fallback  
**TTS:** Sarvam → Edge-TTS fallback

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

**Restart individual service:**
```bash
# Backend
kill $(cat logs/backend.pid)
cd backend && source venv/bin/activate
python -m uvicorn api_server:app --reload

# Frontend
kill $(cat logs/frontend.pid)
npm run dev
```

**Check service status:**
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:5173

# Ollama
curl http://localhost:11434/api/tags
```

## Full Documentation

- **Setup Guide:** SETUP_LINUX.md
- **Changes Log:** CHANGES_SUMMARY.md
- **Test Report:** test-report.md
- **Improvements:** IMPLEMENTATION_IMPROVEMENTS_SUMMARY.md
