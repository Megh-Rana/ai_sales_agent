# AI Sales Voice Agent - Backend

Real voice interaction backend for the AI Sales Frontend MVP. When you click "Start Call" in the frontend, this launches an actual AI voice agent that you can talk to through your microphone.

## What This Does

This is **NOT** a simulation. When you start a call:
1. Frontend sends your lead details to this backend
2. Backend loads AI models (STT, TTS, LLM)
3. Backend starts listening to your **microphone**
4. You speak as the "customer" 
5. AI agent responds through your **speakers**
6. Real conversation happens with voice recognition and synthesis

## Prerequisites

1. **Python 3.10+** with virtual environment
2. **Ollama** running locally with `gemma3:4b` model
3. **Sarvam AI API Key** for multilingual voice (EN/HI/GU/MR)
4. **Working microphone and speakers**

## Quick Start

### 1. Setup Environment

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure API Keys

Create `.env` file:

```bash
# Required for multilingual voice
SARVAM_API_KEY=your_sarvam_api_key_here

# Ollama should be running on localhost:11434
# Start it with: ollama serve
```

Get Sarvam API key from: https://app.sarvam.ai/

### 3. Verify Ollama

```bash
# Make sure Ollama is running
ollama serve

# In another terminal, verify the model
ollama pull gemma3:4b
ollama list  # Should show gemma3:4b
```

### 4. Test Your Audio

```bash
# Test microphone (should record and play back)
python audio/test_audio.py
```

If audio doesn't work:
- **Linux**: Install `portaudio19-dev` and `python3-pyaudio`
- **Mac**: `brew install portaudio`
- **Windows**: PyAudio should work out of the box

### 5. Start Backend Server

```bash
python api_server.py
```

You should see:
```
🎙️  AI Sales Voice Agent API Server - MVP MODE
API:               http://localhost:8000
API Documentation: http://localhost:8000/docs
```

### 6. Start Frontend

In another terminal:

```bash
cd ..  # Go back to frontend root
npm run dev
```

Visit http://localhost:5173

## How to Use

### Making a Real Voice Call

1. **Go to any lead** in the frontend (Dashboard → Lead Discovery)
2. **Click "AI Call"** button
3. **Click "Start Call"** - Backend loads AI models (takes ~10 seconds)
4. **Click "Launch"** - Voice interaction starts
5. **Speak into your microphone** - You are now the customer!
6. **AI responds through speakers** - Real conversation
7. **Click "End Call"** when done

### What You'll Experience

- **Opening**: AI greets you by name and introduces itself
- **Your Turn**: Speak naturally into your mic (e.g., "Hi, what can you help me with?")
- **AI Turn**: AI responds through your speakers
- **Back and forth**: Continue the conversation
- **Transcript**: See everything in real-time on screen

## API Endpoints

- `POST /api/call/start` - Initialize call, load models
- `POST /api/call/{id}/launch` - Start REAL voice interaction
- `GET /api/call/{id}/status` - Get transcript and status
- `POST /api/call/{id}/end` - End call, get summary
- `DELETE /api/call/{id}` - Cleanup session

Full API docs: http://localhost:8000/docs

## Configuration

Edit `config.py` to customize:

```python
# STT Provider
STT_PROVIDER = "sarvam"  # or "whisper" for local

# LLM Provider  
LLM_PROVIDER = "ollama"  # uses gemma3:4b

# Ollama Model
OLLAMA_MODEL = "gemma3:4b"  # Fast, lightweight model for sales conversations

# Voice Gender
TTS_SPEAKER = "ishita"  # or "shubh" (male)

# Languages
SUPPORTED_LANGUAGES = ["en", "hi", "gu", "mr"]

# Max conversation turns
MAX_CONVERSATION_TURNS = 20
```

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.10+)
- Check Ollama: `ollama list` (should show gemma3:4b)
- Check dependencies: `pip list`

### No audio input
- Test mic: `python audio/test_audio.py`
- Linux: `sudo apt install portaudio19-dev python3-pyaudio`
- Check system mic permissions

### AI not responding
- Check Ollama: `curl http://localhost:11434/api/tags`
- Check Sarvam key in `.env`
- Check logs in terminal where you ran `python api_server.py`

### Call gets stuck on "Connecting"
- Backend might not be running (check http://localhost:8000/health)
- Check browser console for errors
- Verify CORS is not blocking (should be allowed for localhost)

## Architecture

```
Frontend (React)
    ↓ HTTP REST API
Backend (FastAPI)
    ↓
PipelineOrchestrator
    ├── STT (Sarvam) - Your voice → text
    ├── LLM (Ollama gemma3:4b) - Conversation logic
    └── TTS (Sarvam) - Text → voice
    ↓
Your Microphone & Speakers
```

## Development

Run with auto-reload:
```bash
python api_server.py  # Already has reload enabled for dev
```

View API docs:
```
http://localhost:8000/docs
```

Check active sessions:
```bash
curl http://localhost:8000/api/sessions
```
