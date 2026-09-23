# AI Sales Agent Platform - Linux Setup Guide

Complete setup guide for running the AI Sales Agent Platform on Linux with local Ollama Gemma model.

---

## Quick Start

### Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **Ollama** (will be installed automatically)
- **8GB RAM minimum** (16GB recommended)

### One-Command Setup

```bash
./run-all-linux.sh
```

This script will:
1. ✅ Check and install dependencies (Ollama, Python, Node.js)
2. ✅ Download and setup Ollama with Gemma 3 4B model
3. ✅ Install Python and Node.js dependencies
4. ✅ Run database migrations
5. ✅ Start backend API server (http://localhost:8000)
6. ✅ Start frontend UI (http://localhost:5173)

---

## Configuration

### Environment Variables

The platform uses Ollama Gemma for LLM by default:

```bash
# Copy example config
cp .env.example .env

# Edit .env to add your Sarvam API key (optional, has fallbacks)
nano .env
```

**Default Configuration:**
- **LLM:** Ollama Gemma 3 4B (local, no API key needed)
- **STT:** Sarvam Cloud API → Whisper fallback (local)
- **TTS:** Sarvam Cloud API → Edge-TTS fallback (local)

**Sarvam API Key (Optional):**
- If you have a Sarvam API key, add it to `.env`
- Without it, platform uses local Whisper (STT) and Edge-TTS (TTS) as fallbacks
- LLM always uses local Ollama Gemma regardless

---

## Services

### Backend API
- **URL:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Frontend UI
- **URL:** http://localhost:5173
- **Technology:** React + Vite + TypeScript + Tailwind CSS

### Ollama (LLM)
- **URL:** http://localhost:11434
- **Model:** Gemma 3 4B (lightweight, fast, 4.5GB download)
- **Context:** 8K tokens

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Sales Agent Platform                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│   Ollama     │
│   (React)    │     │  (FastAPI)   │     │  (Gemma 3)   │
│              │     │              │     │              │
│ :5173        │     │ :8000        │     │ :11434       │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  PostgreSQL  │
                     │  (Database)  │
                     └──────────────┘
```

**AI Provider Configuration:**
- **LLM (Conversation AI):** Ollama Gemma 3 4B (local)
- **STT (Speech-to-Text):** Sarvam Cloud API with Whisper fallback
- **TTS (Text-to-Speech):** Sarvam Cloud API with Edge-TTS fallback

---

## Managing Services

### Start All Services
```bash
./run-all-linux.sh
```

### Stop All Services
```bash
./stop-all-linux.sh
```

### View Logs
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log

# Ollama logs
tail -f logs/ollama.log

# All logs together
tail -f logs/*.log
```

### Restart Individual Service

**Backend:**
```bash
kill $(cat logs/backend.pid)
cd backend
source venv/bin/activate
python -m uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
kill $(cat logs/frontend.pid)
npm run dev
```

**Ollama:**
```bash
kill $(cat logs/ollama.pid)
ollama serve
```

---

## Database Migrations

Migrations run automatically during startup. To run manually:

```bash
cd backend
source venv/bin/activate
python run_migrations.py
```

**Migrations include:**
- ✅ subscription_tier field in profiles
- ✅ timezone/scheduling fields in campaigns
- ✅ preferred_language field in leads

---

## Testing

### Test Individual Components

**Test LLM (Ollama Gemma):**
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "gemma3:4b",
  "prompt": "Hello, how are you?",
  "stream": false
}'
```

**Test Backend Health:**
```bash
curl http://localhost:8000/health
```

**Test Frontend:**
Open browser to http://localhost:5173

### Test STT/TTS (Optional)
```bash
cd backend
source venv/bin/activate
python test_components.py --test stt  # Test Speech-to-Text
python test_components.py --test tts  # Test Text-to-Speech
```

---

## Troubleshooting

### Ollama Not Starting

**Check if Ollama is installed:**
```bash
ollama --version
```

**Install Ollama manually:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Pull Gemma model manually:**
```bash
ollama pull gemma3:4b
```

### Backend Port Already in Use

**Find and kill process on port 8000:**
```bash
lsof -ti:8000 | xargs kill -9
```

### Frontend Port Already in Use

**Find and kill process on port 5173:**
```bash
lsof -ti:5173 | xargs kill -9
```

### Python Dependencies Issues

**Reinstall dependencies:**
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Database Connection Error

**Check DATABASE_URL in .env:**
```bash
# Default SQLite (no setup needed)
DATABASE_URL=sqlite:///./sales_platform.db

# Or PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/vidur_sales
```

### Sarvam API Errors (STT/TTS)

**Without API key:**
- STT automatically falls back to local Whisper
- TTS automatically falls back to Edge-TTS
- No errors, just warnings in logs

**With invalid API key:**
- Check `.env` file has correct `SARVAM_API_KEY`
- Fallbacks still work if API fails

---

## Performance Optimization

### For Better LLM Speed
```bash
# Use smaller Gemma model
ollama pull gemma3:2b

# Update .env
AI_MODEL=gemma3:2b
OLLAMA_MODEL=gemma3:2b
```

### For Better STT/TTS Quality
```bash
# Add Sarvam API key to .env
SARVAM_API_KEY=your_actual_key_here
```

### For Lower Memory Usage
```bash
# Reduce Ollama context window in .env
OLLAMA_NUM_CTX=4096  # Default: 8192
```

---

## Development

### Backend Development
```bash
cd backend
source venv/bin/activate

# Run with auto-reload
python -m uvicorn api_server:app --reload

# Run tests
pytest

# Check code style
black .
flake8
```

### Frontend Development
```bash
# Install dependencies
npm install

# Run dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Production Deployment

### Using Docker
```bash
docker-compose up -d
```

### Manual Deployment
1. Set `ENVIRONMENT=production` in `.env`
2. Build frontend: `npm run build`
3. Run backend with gunicorn: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker api_server:app`
4. Serve frontend build with Nginx

---

## Support

**Issues?** Check logs in `logs/` directory

**Questions?** Review test-report.md for feature status

**Contributions?** See IMPLEMENTATION_IMPROVEMENTS_SUMMARY.md

---

## Summary

✅ **One-command setup:** `./run-all-linux.sh`  
✅ **Local LLM:** Ollama Gemma 3 4B (no API key needed)  
✅ **Fallback STT/TTS:** Works without Sarvam API key  
✅ **Auto-migrations:** Database schema updated automatically  
✅ **Full-stack:** Backend + Frontend + AI in one script  

**Enjoy building with the AI Sales Agent Platform!** 🚀
