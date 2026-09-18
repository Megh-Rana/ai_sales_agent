@echo off
setlocal enabledelayedexpansion

title Vidur Sales OS - Runner
cd /d "%~dp0"

echo ===================================================
echo               VIDUR SALES OS
echo ===================================================
echo.

:: 1. Check Node.js installation
echo [*] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js is not installed or not found in PATH!
    echo     Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [*] Detected Node.js: %NODE_VER%

:: 2. Check dependencies (node_modules)
if not exist "node_modules\" (
    echo [*] 'node_modules' folder not found. Installing dependencies...
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo.
        echo [!] Failed to install dependencies. Check your internet connection or npm setup.
        pause
        exit /b %errorlevel%
    )
    echo [*] Dependencies installed successfully.
) else (
    echo [*] Dependencies already installed.
)

:: 3. Launch Backend Voice API Server (Port 8000)
echo [*] Starting Backend Voice Agent API on port 8000...
start "Vidur Backend Voice API" /min cmd /c "python backend\api_server.py"
timeout /t 2 /nobreak >nul

:: 4. Launch browser in the background
echo.
echo [*] Opening application in browser (http://localhost:3000)...
start "" "http://localhost:3000"

:: 5. Start Vite development server
echo [*] Starting Vite development server...
echo     Press Ctrl+C to stop the server anytime.
echo.
echo ===================================================
call npm.cmd run dev

if %errorlevel% neq 0 (
    echo.
    echo [!] Vite server exited with error code %errorlevel%.
    pause
)

