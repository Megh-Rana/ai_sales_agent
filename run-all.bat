@echo off
title Vidur AI Sales OS - Full Stack Launcher
cd /d "%~dp0"

echo ===================================================
echo     VIDUR AI SALES OS - LOCAL RUNNER (Ollama)
echo ===================================================
echo.
echo [*] Checking Ollama with gemma3:4b...
ollama list | findstr "gemma3:4b" >nul
if %errorlevel% neq 0 (
    echo [!] WARNING: gemma3:4b not found in Ollama!
    echo     Run: ollama pull gemma3:4b
    echo.
) else (
    echo [*] Found local model: gemma3:4b
)

echo.
echo [*] Starting Backend API Server (Port 8000)...
start "Vidur Backend (FastAPI + Ollama)" cmd /k "cd backend && python api_server.py"

timeout /t 2 /nobreak >nul

echo [*] Starting Frontend UI (Port 3000)...
start "Vidur Frontend (Vite)" cmd /k "npm.cmd run dev"

echo.
echo ===================================================
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo ===================================================
echo.
echo Opening browser...
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"
