#!/usr/bin/env python3
"""
FastAPI Server for AI Sales Voice Agent
Provides REST API and WebSocket endpoints for the frontend
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import asyncio
import json
import sys
import os
import time
import uuid

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config
from pipeline.orchestrator import PipelineOrchestrator
from ai.brain import AIBrain

app = FastAPI(title="AI Sales Voice Agent API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active call sessions
active_sessions: Dict[str, Dict] = {}

# Request/Response Models
class CallStartRequest(BaseModel):
    leadId: str
    companyName: str
    contactName: str
    contactRole: Optional[str] = "Decision Maker"
    contactPhone: Optional[str] = None
    language: str = "en"
    companyInfo: Optional[str] = None
    services: Optional[str] = None
    goal: Optional[str] = None

class CallStartResponse(BaseModel):
    sessionId: str
    status: str
    message: str

class TranscriptItem(BaseModel):
    speaker: str  # 'agent' or 'prospect'
    text: str
    timestamp: float
    language: str

class CallStatusResponse(BaseModel):
    sessionId: str
    status: str  # 'connecting', 'ringing', 'live', 'paused', 'completed', 'failed'
    duration: int
    transcript: List[TranscriptItem]
    currentObjective: Optional[str] = None

class MessageRequest(BaseModel):
    sessionId: str
    message: str
    language: Optional[str] = "en"

class MessageResponse(BaseModel):
    sessionId: str
    response: str
    language: str
    timestamp: float

# ─── Health Check ──────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "service": "AI Sales Voice Agent API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": time.time()}

# ─── Call Management ───────────────────────────────────────────────
@app.post("/api/call/start", response_model=CallStartResponse)
async def start_call(request: CallStartRequest):
    """
    Initialize a new call session.
    This creates the pipeline but doesn't start audio yet.
    """
    session_id = str(uuid.uuid4())
    
    try:
        # Create pipeline for this call
        company_info = request.companyInfo or f"{request.companyName} - Business prospect"
        services = request.services or "IT solutions and consulting services"
        goal = request.goal or "Schedule a product demo to show how our solutions can help their business"
        
        pipeline = PipelineOrchestrator(
            company_info=company_info,
            products_services=services,
            campaign_goal=goal,
            agent_name="Alex",  # Can be customized
            company_name=request.companyName,
        )
        
        # Store session
        active_sessions[session_id] = {
            "leadId": request.leadId,
            "companyName": request.companyName,
            "contactName": request.contactName,
            "contactRole": request.contactRole,
            "contactPhone": request.contactPhone,
            "language": request.language,
            "pipeline": pipeline,
            "status": "initialized",
            "created_at": time.time(),
            "transcript": [],
            "duration": 0,
        }
        
        return CallStartResponse(
            sessionId=session_id,
            status="initialized",
            message=f"Call session created for {request.companyName}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize call: {str(e)}")

@app.post("/api/call/{session_id}/connect")
async def connect_call(session_id: str):
    """
    Simulate connecting the call and get opening message.
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    try:
        # Get opening from AI
        pipeline = session["pipeline"]
        opening = pipeline.ai.get_opening(prospect_name=session["contactName"])
        
        # Update session
        session["status"] = "live"
        session["transcript"].append({
            "speaker": "agent",
            "text": opening,
            "timestamp": time.time(),
            "language": session["language"]
        })
        
        return {
            "sessionId": session_id,
            "status": "live",
            "opening": opening,
            "language": session["language"]
        }
        
    except Exception as e:
        session["status"] = "failed"
        raise HTTPException(status_code=500, detail=f"Failed to connect call: {str(e)}")

@app.get("/api/call/{session_id}/status", response_model=CallStatusResponse)
async def get_call_status(session_id: str):
    """Get current status of a call session."""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    return CallStatusResponse(
        sessionId=session_id,
        status=session["status"],
        duration=int(time.time() - session["created_at"]),
        transcript=session["transcript"],
        currentObjective=session.get("currentObjective")
    )

@app.post("/api/call/{session_id}/message", response_model=MessageResponse)
async def send_message(session_id: str, request: MessageRequest):
    """
    Send a text message to the AI agent and get a response.
    Used for text-based interaction during calls.
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    pipeline = session["pipeline"]
    
    try:
        # Add prospect message to transcript
        session["transcript"].append({
            "speaker": "prospect",
            "text": request.message,
            "timestamp": time.time(),
            "language": request.language or session["language"]
        })
        
        # Generate AI response
        response = pipeline.ai.generate_response(
            request.message,
            request.language or session["language"]
        )
        
        # Add AI response to transcript
        timestamp = time.time()
        session["transcript"].append({
            "speaker": "agent",
            "text": response,
            "timestamp": timestamp,
            "language": request.language or session["language"]
        })
        
        return MessageResponse(
            sessionId=session_id,
            response=response,
            language=request.language or session["language"],
            timestamp=timestamp
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")

@app.post("/api/call/{session_id}/end")
async def end_call(session_id: str):
    """End a call session and get summary."""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    pipeline = session["pipeline"]
    
    try:
        # Get call summary
        summary = pipeline.ai.get_summary()
        
        # Update session
        session["status"] = "completed"
        session["summary"] = summary
        
        # Clean up (optional - keep for a while for status checks)
        # del active_sessions[session_id]
        
        return {
            "sessionId": session_id,
            "status": "completed",
            "summary": summary,
            "duration": int(time.time() - session["created_at"])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to end call: {str(e)}")

@app.delete("/api/call/{session_id}")
async def delete_session(session_id: str):
    """Delete a call session completely."""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    del active_sessions[session_id]
    
    return {"message": "Session deleted", "sessionId": session_id}

# ─── WebSocket for Real-Time Communication ────────────────────────
@app.websocket("/ws/call/{session_id}")
async def websocket_call(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time call interaction.
    Allows streaming audio and receiving real-time transcripts.
    """
    await websocket.accept()
    
    if session_id not in active_sessions:
        await websocket.send_json({"error": "Session not found"})
        await websocket.close()
        return
    
    session = active_sessions[session_id]
    
    try:
        await websocket.send_json({
            "type": "connected",
            "sessionId": session_id,
            "status": session["status"]
        })
        
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            if data.get("type") == "message":
                # Text message
                message = data.get("message", "")
                language = data.get("language", session["language"])
                
                # Process with AI
                pipeline = session["pipeline"]
                response = pipeline.ai.generate_response(message, language)
                
                # Send response
                await websocket.send_json({
                    "type": "response",
                    "text": response,
                    "language": language,
                    "timestamp": time.time()
                })
                
            elif data.get("type") == "end":
                # End call
                summary = session["pipeline"].ai.get_summary()
                await websocket.send_json({
                    "type": "ended",
                    "summary": summary
                })
                break
                
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        await websocket.send_json({"error": str(e)})
        await websocket.close()

# ─── Configuration ─────────────────────────────────────────────────
@app.get("/api/config")
async def get_config():
    """Get current configuration."""
    return {
        "supportedLanguages": config.SUPPORTED_LANGUAGES,
        "maxConversationTurns": config.MAX_CONVERSATION_TURNS,
        "streamingEnabled": config.STREAMING_PIPELINE,
        "sttProvider": config.STT_PROVIDER,
        "llmProvider": config.LLM_PROVIDER,
        "ttsProvider": "sarvam"
    }

# ─── Session Management ────────────────────────────────────────────
@app.get("/api/sessions")
async def list_sessions():
    """List all active sessions."""
    sessions = []
    for session_id, session in active_sessions.items():
        sessions.append({
            "sessionId": session_id,
            "leadId": session["leadId"],
            "companyName": session["companyName"],
            "contactName": session["contactName"],
            "status": session["status"],
            "duration": int(time.time() - session["created_at"]),
            "transcriptLength": len(session["transcript"])
        })
    return {"sessions": sessions, "count": len(sessions)}

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "=" * 60)
    print("  🚀 Starting AI Sales Voice Agent API Server")
    print("=" * 60)
    print(f"\n  API Documentation: http://localhost:8000/docs")
    print(f"  Health Check:      http://localhost:8000/health")
    print(f"  WebSocket:         ws://localhost:8000/ws/call/<session_id>")
    print("\n" + "=" * 60 + "\n")
    
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
