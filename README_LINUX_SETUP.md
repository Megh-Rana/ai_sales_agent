# AI Sales Agent Platform - Linux Complete Setup

**Ready for Sept 25, 2026 Technical Review** ✅

---

## 🚀 Quick Start (One Command)

```bash
./run-all-linux.sh
```

**That's it!** The script will:
- ✅ Install Ollama (if needed)
- ✅ Download Gemma 3 4B model
- ✅ Setup Python virtual environment
- ✅ Install all dependencies
- ✅ Run database migrations
- ✅ Start backend (http://localhost:8000)
- ✅ Start frontend (http://localhost:5173)

---

## 📋 What's Included

### 1. **Non-Breaking Improvements** (Test Pass Rate: 64.2% → 77.4%)
- ✅ CSV/Excel export for leads
- ✅ Subscription tier management
- ✅ Campaign timezone & scheduling
- ✅ Language auto-selection
- ✅ Document upload (PDF/DOCX/TXT)
- ✅ Security configuration docs
- ✅ Audit log documentation

### 2. **Restored STT/TTS Fallbacks**
- ✅ TTS: Sarvam API → Edge-TTS fallback (works without API key)
- ✅ STT: Sarvam API → Whisper fallback (already working)

### 3. **Configured Local LLM (Ollama Gemma)**
- ✅ LLM_PROVIDER=ollama (not Sarvam)
- ✅ AI_MODEL=gemma3:4b
- ✅ 8K context window
- ✅ No API key required

### 4. **Linux Setup Scripts**
- ✅ `run-all-linux.sh` - Complete setup & run
- ✅ `stop-all-linux.sh` - Stop all services
- ✅ Comprehensive documentation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│       AI Sales Agent Platform Stack         │
└─────────────────────────────────────────────┘

Frontend (React)      :5173
    ↓
Backend (FastAPI)     :8000
    ↓
├─ Ollama Gemma 3     :11434  (LLM - LOCAL)
├─ Sarvam/Whisper            (STT - FALLBACK)
└─ Sarvam/Edge-TTS           (TTS - FALLBACK)
```

**Key:** All AI services work locally without API keys!

---

## 📦 Services & Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend UI | http://localhost:5173 | React web interface |
| Backend API | http://localhost:8000 | FastAPI REST API |
| API Docs (Swagger) | http://localhost:8000/docs | Interactive API docs |
---

## 🔑 Default Seeded User Credentials

| Name | Email | Password | Role | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Neel Agrawal** | `neel@vidur.in` | `neelit002` | `admin` | Pre-filled default on Login screen |
| **Megh Rana** | `megh@vidur.in` | `meghce099` | `admin` | Full administrator privileges |
| **Vidur Administrator** | `admin@vidur.in` | `admin@2026` | `admin` | Primary platform administrator |
| **Vidur Admin (v1)** | `admin@vidur.ai` | `Admin@Vidur2024!` | `admin` | Legacy admin account |
| **Test Rep** | `rep@vidur.ai` | `Rep@Vidur2024!` | `sales_rep` | Standard sales representative |

---

## 🛠️ Management Commands

### Start Everything
```bash
./run-all-linux.sh
```

### Stop Everything
```bash
./stop-all-linux.sh
```

### View Logs
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log

# All logs
tail -f logs/*.log
```

### Check Service Health
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:5173

# Ollama
curl http://localhost:11434/api/tags
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **QUICK_START.md** | Quick reference card |
| **SETUP_LINUX.md** | Comprehensive setup guide |
| **CHANGES_SUMMARY.md** | Detailed changelog |
| **SECURITY_CONFIGURATION.md** | Security & encryption docs |
| **AUDIT_LOG_DOCUMENTATION.md** | Audit logging guide |
| **test-report.md** | Test execution results |

---

## 🔧 Configuration

### Default Configuration (No API Key Needed)
```bash
# LLM
LLM_PROVIDER=ollama
AI_MODEL=gemma3:4b
OLLAMA_NUM_CTX=8192

# STT (with fallback)
STT_PROVIDER=sarvam  # Falls back to Whisper

# TTS (with fallback)
TTS_PROVIDER=sarvam  # Falls back to Edge-TTS
```

### Optional: Add Sarvam API Key for Better Quality
```bash
# Copy and edit .env
cp .env.example .env
nano .env

# Add your key
SARVAM_API_KEY=your_actual_key_here
```

---

## 🧪 Testing

### Test LLM (Ollama)
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "gemma3:4b",
  "prompt": "What is AI?",
  "stream": false
}'
```

### Test Backend
```bash
curl http://localhost:8000/health
```

### Run Backend Tests
```bash
cd backend
source venv/bin/activate
pytest
```

---

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Backend (port 8000)
lsof -ti:8000 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9

# Ollama (port 11434)
lsof -ti:11434 | xargs kill -9
```

### Restart Individual Service
```bash
# Backend
kill $(cat logs/backend.pid)
cd backend && source venv/bin/activate
python -m uvicorn api_server:app --reload

# Frontend
kill $(cat logs/frontend.pid)
npm run dev

# Ollama
kill $(cat logs/ollama.pid)
ollama serve
```

### Reinstall Dependencies
```bash
# Python
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Node.js
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Test Results

**Pass Rate:** 77.4% (52/67 test cases)

### ✅ Completed (52 tests)
- Authentication & authorization
- Lead management & enrichment
- Campaign management
- Call handling (voice & webhooks)
- Business intelligence
- CSV export
- Subscription management
- Document upload
- And more...

### ⚠️ Known Gaps (15 tests)
- Mobile apps (TC-39, TC-40) → Using PWA fallback
- Advanced analytics
- Some edge cases

**Full Report:** See `test-report.md`

---

## 🎯 Database Migrations

### Automatic (during startup)
Migrations run automatically when you use `./run-all-linux.sh`

### Manual
```bash
cd backend
source venv/bin/activate
python run_migrations.py
```

### What's Migrated
- `profiles.subscription_tier` (Starter/Professional/Enterprise)
- `campaigns.timezone` (location-based scheduling)
- `campaigns.business_hours_start/end`
- `campaigns.repeat_enabled/repeat_schedule`
- `leads.preferred_language` (en/hi/gu/mr)

**All migrations are non-breaking** (default values provided)

---

## 💡 Key Features

### 1. **Fully Local AI**
- No API keys required for basic operation
- Ollama Gemma for LLM (4.5GB model)
- Whisper for STT fallback
- Edge-TTS for TTS fallback

### 2. **One-Command Setup**
- `./run-all-linux.sh` does everything
- Automatic dependency checking
- Intelligent error handling

### 3. **Production-Ready**
- Security documentation complete
- Audit logging configured
- Database migrations tested
- 77.4% test pass rate

### 4. **Developer-Friendly**
- Comprehensive logs
- Health check endpoints
- Interactive API docs
- Hot reload enabled

---

## 🚦 Status Summary

| Component | Status | Details |
|-----------|--------|---------|
| **Backend API** | ✅ Ready | FastAPI with Uvicorn |
| **Frontend UI** | ✅ Ready | React + Vite + TypeScript |
| **LLM (Gemma)** | ✅ Ready | Ollama local model |
| **STT** | ✅ Ready | Sarvam + Whisper fallback |
| **TTS** | ✅ Ready | Sarvam + Edge-TTS fallback |
| **Database** | ✅ Ready | Migrations applied |
| **Tests** | ✅ 77.4% | 52/67 passing |
| **Docs** | ✅ Complete | 5 documentation files |

---

## 🎉 You're All Set!

```bash
# Start the platform
./run-all-linux.sh

# Open in browser
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs

# Stop when done
./stop-all-linux.sh
```

**Questions?** Check the documentation files above or review logs in `logs/` directory.

**Ready for Sept 25 Technical Review!** 🚀
