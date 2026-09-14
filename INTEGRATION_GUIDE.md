# AI Sales Frontend + Backend Integration Guide

This guide explains how the frontend and backend are integrated and how to run the full stack.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Sales System                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (React + TypeScript)                               │
│  ├── UI Components (Dashboard, Calls, Leads)                │
│  ├── i18n (EN/HI/GU/MR)                                     │
│  ├── Call Service (API Client)                              │
│  └── WebSocket Client                                        │
│                        │                                      │
│                        ▼                                      │
│               REST API / WebSocket                            │
│                        │                                      │
│                        ▼                                      │
│  Backend (FastAPI + Python)                                  │
│  ├── API Server (api_server.py)                             │
│  ├── Pipeline Orchestrator                                   │
│  ├── AI Brain (LLM - Ollama/Sarvam)                        │
│  ├── STT Engine (Sarvam/Whisper)                           │
│  └── TTS Engine (Sarvam Bulbul)                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env and add your SARVAM_API_KEY

# 2. Start both services
docker-compose up

# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements-api.txt

# Configure environment
cp .env.example .env
# Add your SARVAM_API_KEY to .env

# Start the API server
python api_server.py
```

The backend will be available at `http://localhost:8000`

#### Frontend Setup

```bash
# In the root directory
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Integration Points

### 1. Call Service Integration

The frontend uses `callService.ts` to communicate with the backend:

```typescript
import { callService } from '../services/callService';

// Start a call
const response = await callService.startCall({
  leadId: 'lead-123',
  companyName: 'Acme Corp',
  contactName: 'John Doe',
  language: 'en'
});

// Connect and get opening
const { opening } = await callService.connectCall(response.sessionId);

// Send message
const aiResponse = await callService.sendMessage({
  sessionId: response.sessionId,
  message: 'Tell me more about your services',
  language: 'en'
});

// End call
const summary = await callService.endCall(response.sessionId);
```

### 2. Real-Time Communication (WebSocket)

For real-time updates during calls:

```typescript
const ws = callService.createWebSocket(sessionId);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'connected':
      console.log('WebSocket connected');
      break;
    case 'response':
      console.log('AI Response:', data.text);
      break;
    case 'ended':
      console.log('Call ended:', data.summary);
      break;
  }
};

// Send message
ws.send(JSON.stringify({
  type: 'message',
  message: 'Hello',
  language: 'en'
}));
```

### 3. Existing Frontend Components Integration

Update `AICalling.tsx` to use the real backend:

```typescript
// Before (mock data)
const session = createMockCallSession(leadId);

// After (real API)
const startCallSession = async () => {
  const response = await callService.startCall({
    leadId,
    companyName: lead.companyName,
    contactName: lead.decisionMaker?.name,
    language: selectedLanguage
  });
  
  const connected = await callService.connectCall(response.sessionId);
  setSession({
    ...session,
    sessionId: response.sessionId,
    opening: connected.opening
  });
};
```

## API Endpoints

### Call Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/call/start` | Initialize new call session |
| POST | `/api/call/{id}/connect` | Connect call & get opening |
| GET | `/api/call/{id}/status` | Get current call status |
| POST | `/api/call/{id}/message` | Send text message |
| POST | `/api/call/{id}/end` | End call & get summary |
| DELETE | `/api/call/{id}` | Delete session |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/api/config` | Get configuration |
| GET | `/api/sessions` | List active sessions |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `WS /ws/call/{id}` | Real-time call communication |

## Environment Variables

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### Backend (backend/.env)

```bash
# Required
SARVAM_API_KEY=your_api_key_here

# Optional (has defaults)
STT_PROVIDER=sarvam
LLM_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
STREAMING_PIPELINE=true
```

## Configuration

### Backend Configuration (backend/config.py)

Key settings:

```python
# Speech-to-Text
STT_PROVIDER = "sarvam"  # or "whisper"
SARVAM_STT_MODEL = "saaras:v3"

# Language Model
LLM_PROVIDER = "ollama"  # or "sarvam", "param"
OLLAMA_MODEL = "gemma3:4b"

# Text-to-Speech
TTS_SPEAKER = "ishita"  # Sarvam voice

# Streaming
STREAMING_PIPELINE = True

# Languages
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "gu": "Gujarati",
}
```

## Development Workflow

### 1. Start Backend

```bash
cd backend
source venv/bin/activate
python api_server.py
```

Watch for:
- `✅ All models loaded` - Models are ready
- `INFO:     Uvicorn running` - Server is running

### 2. Start Frontend

```bash
npm run dev
```

### 3. Test Integration

Visit `http://localhost:5173` and:
1. Navigate to a lead details page
2. Click "Start AI Call"
3. Messages sent should go to backend
4. Responses come from actual AI

### 4. Monitor

- **Frontend**: Browser console for client-side logs
- **Backend**: Terminal for API logs and AI processing
- **API Docs**: `http://localhost:8000/docs` for testing endpoints

## Troubleshooting

### Backend Issues

**Models not loading:**
```bash
# Check GPU
python -c "import torch; print(torch.cuda.is_available())"

# Check Ollama
curl http://localhost:11434/api/tags
```

**API Key issues:**
```bash
# Test Sarvam API
curl -H "api-subscription-key: YOUR_KEY" https://api.sarvam.ai/voices
```

### Frontend Issues

**Cannot connect to backend:**
- Check backend is running: `curl http://localhost:8000/health`
- Verify `.env` has correct `VITE_API_URL`
- Check CORS settings in `api_server.py`

**WebSocket connection fails:**
- Ensure WS URL uses `ws://` not `http://`
- Check firewall/proxy settings

### Integration Issues

**Calls not working:**
1. Check browser console for errors
2. Check backend logs for exceptions
3. Verify session is created: `curl http://localhost:8000/api/sessions`
4. Test API directly: `http://localhost:8000/docs`

**Language switching not working:**
- Verify language code matches: `en`, `hi`, `gu`, `mr`
- Check backend config has language enabled
- Monitor backend logs for language detection

## Testing

### Backend Tests

```bash
cd backend
pytest test_components.py
```

### Frontend Tests

```bash
npm test
```

### Integration Tests

```bash
# Test API health
curl http://localhost:8000/health

# Start a test call
curl -X POST http://localhost:8000/api/call/start \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "test-123",
    "companyName": "Test Corp",
    "contactName": "Test User",
    "language": "en"
  }'
```

## Deployment

### Production Checklist

- [ ] Set `VITE_API_URL` to production backend URL
- [ ] Configure CORS in backend for production domain
- [ ] Set secure API keys in environment
- [ ] Use production-grade server (Gunicorn for backend)
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set up proper logging and monitoring
- [ ] Configure rate limiting on API
- [ ] Set up backup for recordings/sessions

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Next Steps

1. **Update AICalling.tsx** to use `callService`
2. **Add WebSocket support** for real-time transcripts
3. **Handle errors** gracefully in UI
4. **Add call recording** playback
5. **Implement call analytics** dashboard

## Support

- **Backend Docs**: `/backend/README.md`
- **API Docs**: `http://localhost:8000/docs`
- **Frontend Docs**: `/docs/DESIGN_SYSTEM.md`

## License

See LICENSE file in project root.
