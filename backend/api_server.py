#!/usr/bin/env python3
"""
FastAPI Server for AI Sales Voice Agent - MVP with Real Voice Interaction
When user clicks "Start Call", this actually runs the voice agent so they can talk to it
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import asyncio
import json
import sys
import os
import time
import uuid
import threading
import queue

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config
from pipeline.orchestrator import PipelineOrchestrator

app = FastAPI(title="AI Sales Voice Agent API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active call sessions with their pipelines and threads
active_sessions: Dict[str, Dict] = {}

# Request/Response Models
class CallStartRequest(BaseModel):
    leadId: str
    companyName: str
    contactName: str
    contactRole: Optional[str] = "Decision Maker"
    contactPhone: Optional[str] = "+91 98765 43210"
    language: str = "en"
    companyInfo: Optional[str] = None
    services: Optional[str] = None
    goal: Optional[str] = None
    agentName: Optional[str] = "Alex"
    agentGender: Optional[str] = "female"

class CallStartResponse(BaseModel):
    sessionId: str
    status: str
    message: str
    instruction: str

# ─── Health Check ──────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "service": "AI Sales Voice Agent API - MVP",
        "version": "1.0.0",
        "status": "running",
        "mode": "voice_interactive"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": time.time()}

# ─── Real Voice Call Management ───────────────────────────────────
@app.post("/api/call/start", response_model=CallStartResponse)
async def start_call(request: CallStartRequest, background_tasks: BackgroundTasks):
    """
    Start a REAL voice call - launches the AI agent with your microphone.
    YOU become the customer and can actually talk to the AI agent.
    """
    session_id = str(uuid.uuid4())
    
    try:
        # Prepare company context
        company_info = request.companyInfo or f"{request.companyName} — a business prospect interested in our solutions"
        services = request.services or "AI-powered sales automation, voice agents, and CRM integration"
        goal = request.goal or f"Understand {request.contactName}'s requirements and schedule a product demo"
        
        # Create the actual voice pipeline
        pipeline = PipelineOrchestrator(
            company_info=company_info,
            products_services=services,
            campaign_goal=goal,
            agent_name=request.agentName or "Alex",
            company_name=request.companyName,
        )
        
        # Set voice gender
        pipeline.tts.set_gender(request.agentGender or "female")
        
        # Load all models (STT, TTS, LLM)
        print(f"\n[Session {session_id}] Loading AI models for {request.companyName}...")
        pipeline.load_all()
        
        # Create message queue for real-time updates
        message_queue = queue.Queue()
        
        # Store session
        active_sessions[session_id] = {
            "leadId": request.leadId,
            "companyName": request.companyName,
            "contactName": request.contactName,
            "contactRole": request.contactRole,
            "contactPhone": request.contactPhone,
            "language": request.language,
            "pipeline": pipeline,
            "status": "ready",  # ready -> connecting -> live -> completed
            "created_at": time.time(),
            "transcript": [],
            "duration": 0,
            "message_queue": message_queue,
            "call_thread": None,
        }
        
        return CallStartResponse(
            sessionId=session_id,
            status="ready",
            message=f"Voice agent ready for {request.companyName}",
            instruction="Click 'Connect' to start talking to the AI agent. Make sure your microphone is working!"
        )
        
    except Exception as e:
        print(f"[ERROR] Failed to initialize call: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize call: {str(e)}")

@app.post("/api/call/{session_id}/launch")
async def launch_voice_call(session_id: str):
    """
    LAUNCH THE ACTUAL VOICE CALL
    This starts the interactive voice conversation where you talk through your mic
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    if session["status"] != "ready":
        raise HTTPException(status_code=400, detail=f"Call already {session['status']}")
    
    try:
        session["status"] = "connecting"
        
        # Function to run the voice pipeline in background thread
        def run_voice_interaction():
            try:
                pipeline = session["pipeline"]
                contact_name = session["contactName"]
                
                print(f"\n{'='*60}")
                print(f"  🎙️  LIVE CALL: {session['companyName']}")
                print(f"  Customer: {contact_name}")
                print(f"  Session: {session_id}")
                print(f"{'='*60}\n")
                
                session["status"] = "live"
                session["start_time"] = time.time()
                
                # Get opening message
                opening = pipeline.ai.get_opening(prospect_name=contact_name)
                print(f"🤖 Agent: {opening}\n")
                
                # Add to transcript
                session["transcript"].append({
                    "speaker": "agent",
                    "text": opening,
                    "timestamp": time.time(),
                    "language": session["language"]
                })
                
                # Speak opening
                pipeline._speak_text(opening, session["language"])
                
                # Start the interactive voice loop
                # This will use your microphone and speakers
                pipeline._running = True
                pipeline.audio.start_recording()
                pipeline.vad.reset()
                
                print("🎤 Listening for your voice... (You are now the customer)")
                print("   Speak into your microphone")
                print("   Press Ctrl+C in terminal to end call\n")
                
                # Main conversation loop
                while pipeline._running and session["status"] == "live":
                    try:
                        pipeline._conversation_loop()
                        
                        # Check if we hit turn limit
                        if pipeline._turn_count >= config.MAX_CONVERSATION_TURNS:
                            wrap_up = pipeline._get_wrap_up(session["language"])
                            print(f"\n🤖 Agent: {wrap_up}")
                            pipeline._speak_text(wrap_up, session["language"])
                            break
                            
                    except KeyboardInterrupt:
                        break
                    except Exception as e:
                        print(f"[ERROR in conversation loop] {e}")
                        break
                
                # Call ended
                pipeline.audio.stop_recording()
                session["status"] = "completed"
                session["end_time"] = time.time()
                session["duration"] = int(session["end_time"] - session["start_time"])
                
                # Get summary
                summary = pipeline.ai.get_summary()
                session["summary"] = summary
                
                print(f"\n{'='*60}")
                print(f"  📊 Call Completed")
                print(f"  Duration: {session['duration']}s")
                print(f"  Turns: {summary['total_turns']}")
                print(f"  Interest: {summary['lead_info']['interest_level']}")
                print(f"{'='*60}\n")
                
            except Exception as e:
                print(f"[ERROR in voice thread] {e}")
                session["status"] = "failed"
                session["error"] = str(e)
        
        # Start voice interaction in background thread
        call_thread = threading.Thread(target=run_voice_interaction, daemon=True)
        call_thread.start()
        session["call_thread"] = call_thread
        
        # Wait a moment for it to actually start
        await asyncio.sleep(2)
        
        return {
            "sessionId": session_id,
            "status": "live",
            "message": "Voice call is now LIVE! You can talk through your microphone.",
            "instruction": "Speak into your microphone as the customer. The AI agent will respond through your speakers."
        }
        
    except Exception as e:
        session["status"] = "failed"
        print(f"[ERROR] Failed to launch call: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to launch call: {str(e)}")

@app.get("/api/call/{session_id}/status")
async def get_call_status(session_id: str):
    """Get current status of the voice call"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    # Calculate duration
    if session["status"] == "live" and "start_time" in session:
        duration = int(time.time() - session["start_time"])
    else:
        duration = session.get("duration", 0)
    
    return {
        "sessionId": session_id,
        "status": session["status"],
        "duration": duration,
        "transcript": session["transcript"],
        "turns": len([t for t in session["transcript"] if t["speaker"] == "prospect"]),
        "companyName": session["companyName"],
        "contactName": session["contactName"]
    }

@app.post("/api/call/{session_id}/end")
async def end_call(session_id: str):
    """End the voice call and get summary"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    try:
        # Stop the pipeline if it's running
        if session["status"] == "live":
            pipeline = session["pipeline"]
            pipeline._running = False
            pipeline.audio.stop_recording()
            
            # Wait a moment for thread to finish
            await asyncio.sleep(1)
        
        # Get summary if available
        summary = session.get("summary")
        if not summary and session["status"] == "live":
            summary = session["pipeline"].ai.get_summary()
            session["summary"] = summary
        
        session["status"] = "completed"
        
        return {
            "sessionId": session_id,
            "status": "completed",
            "summary": summary,
            "duration": session.get("duration", 0),
            "transcript": session["transcript"]
        }
        
    except Exception as e:
        print(f"[ERROR] Failed to end call: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to end call: {str(e)}")

@app.delete("/api/call/{session_id}")
async def delete_session(session_id: str):
    """Delete a call session and cleanup"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    # Make sure call is stopped
    if session["status"] == "live":
        pipeline = session["pipeline"]
        pipeline._running = False
        pipeline.audio.stop_recording()
    
    # Unload models to free GPU memory
    if "pipeline" in session:
        try:
            session["pipeline"].unload_all()
        except:
            pass
    
    del active_sessions[session_id]
    
    return {"message": "Session deleted", "sessionId": session_id}

# ─── Session Management ────────────────────────────────────────────
@app.get("/api/sessions")
async def list_sessions():
    """List all active sessions"""
    sessions = []
    for session_id, session in active_sessions.items():
        sessions.append({
            "sessionId": session_id,
            "leadId": session["leadId"],
            "companyName": session["companyName"],
            "contactName": session["contactName"],
            "status": session["status"],
            "duration": session.get("duration", 0),
            "transcriptLength": len(session["transcript"])
        })
    return {"sessions": sessions, "count": len(sessions)}

@app.get("/api/config")
async def get_config():
    """Get current configuration"""
    return {
        "supportedLanguages": config.SUPPORTED_LANGUAGES,
        "maxConversationTurns": config.MAX_CONVERSATION_TURNS,
        "streamingEnabled": config.STREAMING_PIPELINE,
        "sttProvider": config.STT_PROVIDER,
        "llmProvider": config.LLM_PROVIDER,
        "ttsProvider": "sarvam",
        "mode": "voice_interactive",
        "instruction": "This is a real voice agent. You will talk through your microphone."
    }

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "=" * 70)
    print("  🎙️  AI Sales Voice Agent API Server - MVP MODE")
    print("=" * 70)
    print("\n  This server launches REAL voice calls where you can talk to the AI.")
    print("  You become the customer and speak through your microphone!")
    print(f"\n  API:               http://localhost:8000")
    print(f"  API Documentation: http://localhost:8000/docs")
    print(f"  Health Check:      http://localhost:8000/health")
    print("\n  Steps:")
    print("  1. Frontend clicks 'Start Call' → Loads AI models")
    print("  2. Frontend clicks 'Launch' → Starts voice interaction")  
    print("  3. You speak into mic → AI responds through speakers")
    print("  4. Conversation continues until you end it")
    print("\n" + "=" * 70 + "\n")
    
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Don't reload in voice mode
        log_level="info"
    )
