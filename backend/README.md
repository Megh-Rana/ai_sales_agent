# AI Sales Voice Agent - Backend API

This is the FastAPI backend server that powers the AI Sales Voice Agent functionality.

## Features

- **REST API**: Complete REST API for call management
- **WebSocket Support**: Real-time communication during calls
- **Multilingual**: Supports English, Hindi, Gujarati, and Marathi
- **Streaming**: LLM streaming for faster responses
- **Voice & Text**: Both voice and text-based interactions

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-api.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `SARVAM_API_KEY`: Your Sarvam AI API key for STT/TTS
- Other optional configurations in `config.py`

### 3. Start the Server

```bash
# Development mode with auto-reload
python api_server.py

# Or with uvicorn directly
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- WebSocket: `ws://localhost:8000/ws/call/<session_id>`

## API Endpoints

### Health & Config
- `GET /` - API info
- `GET /health` - Health check
- `GET /api/config` - Get configuration

### Call Management
- `POST /api/call/start` - Start a new call session
- `POST /api/call/{session_id}/connect` - Connect the call
- `GET /api/call/{session_id}/status` - Get call status
- `POST /api/call/{session_id}/message` - Send text message
- `POST /api/call/{session_id}/end` - End the call
- `DELETE /api/call/{session_id}` - Delete session

### Session Management
- `GET /api/sessions` - List all active sessions

### WebSocket
- `WS /ws/call/{session_id}` - Real-time call interaction

## Usage Example

### Starting a Call

```python
import requests

# 1. Start call session
response = requests.post("http://localhost:8000/api/call/start", json={
    "leadId": "lead-123",
    "companyName": "Acme Corp",
    "contactName": "John Doe",
    "contactRole": "CTO",
    "language": "en",
    "companyInfo": "Enterprise software company",
    "services": "IT consulting and cloud solutions",
    "goal": "Schedule a demo"
})

session_id = response.json()["sessionId"]

# 2. Connect the call
response = requests.post(f"http://localhost:8000/api/call/{session_id}/connect")
opening = response.json()["opening"]
print(f"Agent: {opening}")

# 3. Send messages
response = requests.post(
    f"http://localhost:8000/api/call/{session_id}/message",
    json={
        "sessionId": session_id,
        "message": "I'm interested in your cloud solutions",
        "language": "en"
    }
)
print(f"Agent: {response.json()['response']}")

# 4. End call
response = requests.post(f"http://localhost:8000/api/call/{session_id}/end")
summary = response.json()["summary"]
```

### Using WebSocket

```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/call/${sessionId}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Send message
ws.send(JSON.stringify({
  type: 'message',
  message: 'Hello, I want to know more about your services',
  language: 'en'
}));

// End call
ws.send(JSON.stringify({
  type: 'end'
}));
```

## Architecture

```
backend/
├── api_server.py          # FastAPI application
├── config.py              # Configuration
├── requirements-api.txt   # Python dependencies
├── ai/                    # AI Brain (LLM logic)
│   ├── brain.py
│   ├── memory.py
│   └── prompts.py
├── pipeline/              # Orchestrator
│   ├── orchestrator.py
│   └── audio_io.py
├── stt/                   # Speech-to-Text
│   ├── engine.py
│   └── vad.py
└── tts/                   # Text-to-Speech
    └── engine.py
```

## Configuration

Key configuration options in `config.py`:

- **STT_PROVIDER**: `"sarvam"` or `"whisper"`
- **LLM_PROVIDER**: `"ollama"`, `"sarvam"`, or `"param"`
- **STREAMING_PIPELINE**: Enable/disable LLM streaming
- **SUPPORTED_LANGUAGES**: Languages for voice interaction
- **MAX_CONVERSATION_TURNS**: Maximum turns per call

## Development

### Running Tests

```bash
pytest test_components.py
```

### Hot Reload

The server automatically reloads on code changes when run with `--reload` flag.

### Debugging

Enable debug logging:

```bash
LOG_LEVEL=debug python api_server.py
```

## Production Deployment

### Using Gunicorn

```bash
gunicorn api_server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker

```bash
docker build -t ai-sales-backend .
docker run -p 8000:8000 --env-file .env ai-sales-backend
```

### Environment Variables for Production

- Set `CORS_ORIGINS` to your frontend domain
- Configure `SARVAM_API_KEY`
- Set appropriate `LOG_LEVEL`
- Configure `MAX_WORKERS` for gunicorn

## Troubleshooting

### GPU Issues
If GPU is not available, models will fall back to CPU. Check:
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

### Audio Issues
For voice mode, ensure:
- Microphone permissions are granted
- Audio devices are properly configured
- Run `python -m sounddevice` to list devices

### API Key Issues
Verify Sarvam API key:
```bash
curl -H "api-subscription-key: YOUR_KEY" https://api.sarvam.ai/voices
```

## Support

For issues or questions:
1. Check the logs in console output
2. Review FastAPI automatic docs at `/docs`
3. Check configuration in `config.py`
4. Verify `.env` file is properly configured
