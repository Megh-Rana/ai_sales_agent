#!/bin/bash

# ==============================================================================
# 🚀 VIDUR | B2B AI SALES OPERATING SYSTEM - UNIFIED SERVICE LAUNCHER
# Launches all services at once: Backend Voice Agent, CRM API & Frontend UI
# ==============================================================================

set -e

# Color definitions
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
VENV_PYTHON="$BACKEND_DIR/venv/bin/python"

print_status()  { echo -e "  ${GREEN}✓${NC} $1"; }
print_warning() { echo -e "  ${YELLOW}⚠${NC} $1"; }
print_error()   { echo -e "  ${RED}✗${NC} $1"; }
print_info()    { echo -e "  ${CYAN}ℹ${NC} $1"; }

PIDS=()

cleanup() {
    echo -e "\n\n${RED}🛑 Stopping all Vidur services...${NC}"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
        fi
    done
    kill $(jobs -p) 2>/dev/null || true
    echo -e "${GREEN}✓ All services stopped cleanly.${NC}"
    exit 0
}

trap cleanup INT TERM EXIT

echo ""
echo -e "${PURPLE}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}${BOLD}║       🎙️  VIDUR AI SALES OPERATING SYSTEM LAUNCHER           ║${NC}"
echo -e "${PURPLE}${BOLD}║       Autonomous Voice Calling • Local CRM • PWA Ready       ║${NC}"
echo -e "${PURPLE}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==============================================================================
# 1. PREREQUISITE & ENVIRONMENT CHECKS
# ==============================================================================
echo -e "${BLUE}[1/4] Checking Environments & Dependencies...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+"
    exit 1
fi
print_status "Node.js $(node --version) found"

# Check Python in venv
if [ ! -f "$VENV_PYTHON" ] || [ ! -f "$BACKEND_DIR/venv/bin/activate" ] || [ ! -f "$BACKEND_DIR/venv/bin/pip" ]; then
    print_warning "Backend virtualenv not found or incomplete at backend/venv. Creating..."
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.9+"
        exit 1
    fi
    python3 -m venv --clear "$BACKEND_DIR/venv"
    "$VENV_PYTHON" -m pip install --upgrade pip
    "$VENV_PYTHON" -m pip install -r "$BACKEND_DIR/requirements.txt"
fi
print_status "Python virtualenv verified ($("$VENV_PYTHON" --version))"

# Setup CUDA Library Paths for faster-whisper CTranslate2 (if available)
SITE_PACKAGES=$("$VENV_PYTHON" -c "import site; print(site.getsitepackages()[0])" 2>/dev/null || echo "")
NVIDIA_LIBS=""
if [ -n "$SITE_PACKAGES" ] && [ -d "$SITE_PACKAGES/nvidia" ]; then
    for dir in "$SITE_PACKAGES"/nvidia/*/lib; do
        if [ -d "$dir" ]; then
            NVIDIA_LIBS="$dir:$NVIDIA_LIBS"
        fi
    done
fi
export LD_LIBRARY_PATH="$NVIDIA_LIBS${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

# Check Frontend node_modules
if [ ! -d "$ROOT_DIR/node_modules" ]; then
    print_info "Installing frontend npm dependencies..."
    npm install
fi
print_status "Frontend packages verified"

# ==============================================================================
# 2. LOCAL DATABASE VERIFICATION
# ==============================================================================
echo -e "\n${BLUE}[2/4] Verifying Local Database...${NC}"
if [ ! -f "$BACKEND_DIR/sales_platform.db" ]; then
    print_info "Initializing local SQLite database with demo data..."
    (cd "$BACKEND_DIR" && "$VENV_PYTHON" seed.py)
    print_status "Local database seeded successfully"
else
    print_status "Local database ready: $BACKEND_DIR/sales_platform.db"
fi

# ==============================================================================
# 3. START BACKEND SERVICES (Voice Engine, CRM API, WebSocket)
# ==============================================================================
echo -e "\n${BLUE}[3/4] Launching Backend Services on port 8000...${NC}"

# Kill any lingering process on port 8000 if present
fuser -k 8000/tcp 2>/dev/null || true

cd "$BACKEND_DIR"
"$VENV_PYTHON" api_server.py > /dev/null 2>&1 &
BACKEND_PID=$!
PIDS+=($BACKEND_PID)
cd "$ROOT_DIR"

# Wait for backend health check
print_info "Waiting for Backend API to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_status "Backend API & Voice Agent online at http://localhost:8000"
        break
    fi
    if [ "$i" -eq 30 ]; then
        print_error "Backend failed to initialize. Check terminal logs."
        exit 1
    fi
    sleep 0.5
done

# ==============================================================================
# 4. START FRONTEND APPLICATION
# ==============================================================================
echo -e "\n${BLUE}[4/4] Launching Frontend Development Server...${NC}"

# Clear any dead process on ports 3000 & 5173
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

npm run dev -- --host > /dev/null 2>&1 &
FRONTEND_PID=$!
PIDS+=($FRONTEND_PID)

# Dynamically determine the active frontend port
FRONTEND_PORT=3000
print_info "Waiting for Frontend to be ready..."
for i in {1..25}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        FRONTEND_PORT=3000
        print_status "Frontend server ready on port 3000"
        break
    elif curl -s http://localhost:5173 > /dev/null 2>&1; then
        FRONTEND_PORT=5173
        print_status "Frontend server ready on port 5173"
        break
    elif curl -s http://localhost:3001 > /dev/null 2>&1; then
        FRONTEND_PORT=3001
        print_status "Frontend server ready on port 3001"
        break
    fi
    sleep 0.5
done

# ==============================================================================
# 🎉 SYSTEM READY - SHOW URLS
# ==============================================================================

echo ""
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}  ✨ ALL VIDUR SERVICES ARE RUNNING AND READY FOR USE!          ${NC}"
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo ""
echo -e "  ${CYAN}${BOLD}👉 FRONTEND APPLICATION URL:${NC}  ${BOLD}${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
echo ""
echo -e "  📡 Backend API Server:     ${CYAN}http://localhost:8000${NC}"
echo -e "  📚 Interactive API Docs:   ${CYAN}http://localhost:8000/docs${NC}"
echo -e "  🩺 Health Telemetry:       ${CYAN}http://localhost:8000/health${NC}"
echo -e "  💾 Database Mode:          ${CYAN}Local SQLite (100% Offline / Zero Cloud)${NC}"
echo ""
echo -e "  ${YELLOW}💡 QUICK DEMO INSTRUCTIONS:${NC}"
echo -e "  1. Click or open: ${BOLD}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "  2. Go to ${BOLD}AI Calling${NC} or click 'AI Call' on any pre-seeded Lead"
echo -e "  3. Click 'Start AI Call' → Microphone activates"
echo -e "  4. ${BOLD}You act as the Customer!${NC} Speak into your mic to test real voice"
echo -e "  5. Real-time STT and LLM speech stream live into the transcript"
echo -e "  6. Click 'Export PDF' on any completed call or analytics view"
echo ""
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e "  ${YELLOW}Press Ctrl+C to gracefully stop all services.${NC}"
echo ""

# Optional browser auto-open if --open is passed
if [[ "$*" == *"--open"* ]]; then
    xdg-open "http://localhost:${FRONTEND_PORT}" 2>/dev/null || true
fi

# Wait for processes
wait
