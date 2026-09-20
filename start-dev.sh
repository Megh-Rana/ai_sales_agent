#!/bin/bash

# ==============================================================================
# 🚀 VIDUR | AI SALES PLATFORM - DEV LAUNCHER
# Kills old processes, starts Backend API + Frontend UI
# ==============================================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
VENV_PYTHON="$BACKEND_DIR/venv/bin/python"

PIDS=()

cleanup() {
    echo -e "\n${RED}🛑 Stopping all services...${NC}"
    for pid in "${PIDS[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
    # Kill any remaining child processes
    kill $(jobs -p) 2>/dev/null || true
    # Free ports
    fuser -k 8000/tcp 2>/dev/null || true
    fuser -k 3000/tcp 2>/dev/null || true
    fuser -k 5173/tcp 2>/dev/null || true
    echo -e "${GREEN}✓ All services stopped.${NC}"
    exit 0
}

trap cleanup INT TERM EXIT

echo ""
echo -e "${PURPLE}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}${BOLD}║       🎙️  VIDUR AI SALES PLATFORM - DEV LAUNCHER             ║${NC}"
echo -e "${PURPLE}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==============================================================================
# 1. KILL OLD PROCESSES & FREE PORTS
# ==============================================================================
echo -e "${BLUE}[1/4] Cleaning up old processes...${NC}"
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
sleep 0.5
echo -e "  ${GREEN}✓${NC} Ports 8000, 3000, 5173 freed"

# ==============================================================================
# 2. CHECK DEPENDENCIES
# ==============================================================================
echo -e "\n${BLUE}[2/4] Checking dependencies...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "  ${RED}✗${NC} Node.js not found. Install Node.js 18+"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Node.js $(node --version)"

if [ ! -f "$VENV_PYTHON" ]; then
    echo -e "  ${YELLOW}⚠${NC} Python venv not found. Creating..."
    python3 -m venv "$BACKEND_DIR/venv"
    "$VENV_PYTHON" -m pip install --upgrade pip -q
    "$VENV_PYTHON" -m pip install -r "$BACKEND_DIR/requirements-api.txt" -q
    "$VENV_PYTHON" -m pip install ddgs beautifulsoup4 lxml -q
fi
echo -e "  ${GREEN}✓${NC} Python venv OK"

# Ensure ddgs and bs4 are installed
"$VENV_PYTHON" -m pip install ddgs beautifulsoup4 lxml -q 2>/dev/null || true

if [ ! -d "$ROOT_DIR/node_modules" ]; then
    echo -e "  ${CYAN}ℹ${NC} Installing npm packages..."
    cd "$ROOT_DIR" && npm install
fi
echo -e "  ${GREEN}✓${NC} Frontend packages OK"

# ==============================================================================
# 3. CLEAR PYTHON CACHE & START BACKEND
# ==============================================================================
echo -e "\n${BLUE}[3/4] Starting Backend API (port 8000)...${NC}"

# Clear __pycache__ so Python picks up latest code
find "$BACKEND_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# Set up CUDA libs if available
SITE_PACKAGES=$(find "$BACKEND_DIR/venv/lib/" -maxdepth 1 -type d -name "python*" | head -1)/site-packages
NVIDIA_LIBS=""
if [ -d "$SITE_PACKAGES/nvidia" ]; then
    for dir in "$SITE_PACKAGES"/nvidia/*/lib; do
        [ -d "$dir" ] && NVIDIA_LIBS="$dir:$NVIDIA_LIBS"
    done
fi
export LD_LIBRARY_PATH="$NVIDIA_LIBS${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

cd "$BACKEND_DIR"
"$VENV_PYTHON" -m uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
PIDS+=($BACKEND_PID)
cd "$ROOT_DIR"

# Wait for backend health
for i in {1..20}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Backend API online at ${CYAN}http://localhost:8000${NC}"
        break
    fi
    if [ "$i" -eq 20 ]; then
        echo -e "  ${RED}✗${NC} Backend failed to start. Check logs."
        exit 1
    fi
    sleep 0.5
done

# ==============================================================================
# 4. START FRONTEND
# ==============================================================================
echo -e "\n${BLUE}[4/4] Starting Frontend (port 3000 or 5173)...${NC}"

npm run dev -- --host &
FRONTEND_PID=$!
PIDS+=($FRONTEND_PID)

# Detect frontend port
FRONTEND_PORT=""
for i in {1..20}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        FRONTEND_PORT=3000; break
    elif curl -s http://localhost:5173 > /dev/null 2>&1; then
        FRONTEND_PORT=5173; break
    fi
    sleep 0.5
done

if [ -z "$FRONTEND_PORT" ]; then
    FRONTEND_PORT="3000"
    echo -e "  ${YELLOW}⚠${NC} Frontend may still be starting..."
else
    echo -e "  ${GREEN}✓${NC} Frontend online at ${CYAN}http://localhost:${FRONTEND_PORT}${NC}"
fi

# ==============================================================================
# 🎉 READY
# ==============================================================================
echo ""
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}  ✨ ALL SERVICES RUNNING!                                      ${NC}"
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo ""
echo -e "  ${BOLD}Frontend:${NC}  ${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "  ${BOLD}Backend:${NC}   ${CYAN}http://localhost:8000${NC}"
echo -e "  ${BOLD}API Docs:${NC}  ${CYAN}http://localhost:8000/docs${NC}"
echo ""
echo -e "  ${YELLOW}How to demo Lead Discovery:${NC}"
echo -e "  1. Open ${BOLD}http://localhost:${FRONTEND_PORT}/leads/discover${NC}"
echo -e "  2. Type a query like ${BOLD}\"sell milk\"${NC} or ${BOLD}\"Microsoft 365 SharePoint\"${NC}"
echo -e "  3. Leads are fetched from real web search (DuckDuckGo)"
echo -e "  4. Click any lead → view details → Start AI Call"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo ""

# Auto-open browser
if [[ "$*" == *"--open"* ]]; then
    xdg-open "http://localhost:${FRONTEND_PORT}" 2>/dev/null || true
fi

wait
