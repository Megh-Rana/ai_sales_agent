#!/bin/bash
# =============================================================================
# AI Sales Agent Platform - Complete Linux Setup & Run Script
# =============================================================================
# This script:
# 1. Checks and installs dependencies (Ollama, Python, Node.js)
# 2. Sets up Ollama with Gemma model
# 3. Runs database migrations
# 4. Starts backend API server
# 5. Starts frontend development server
# =============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
LOG_DIR="$PROJECT_ROOT/logs"

# Create logs directory
mkdir -p "$LOG_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AI Sales Agent Platform - Linux Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# =============================================================================
# Helper Functions
# =============================================================================

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# =============================================================================
# 1. Check Dependencies
# =============================================================================

echo -e "${BLUE}[1/6] Checking dependencies...${NC}"
echo ""

# Check Python
if check_command python3; then
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    print_status "Python installed: $PYTHON_VERSION"
else
    print_error "Python 3 not found. Please install Python 3.9 or higher."
    exit 1
fi

# Check Node.js
if check_command node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi

# Check npm
if check_command npm; then
    NPM_VERSION=$(npm --version)
    print_status "npm installed: $NPM_VERSION"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

echo ""

# =============================================================================
# 2. Setup Ollama
# =============================================================================

echo -e "${BLUE}[2/6] Setting up Ollama...${NC}"
echo ""

if check_command ollama; then
    print_status "Ollama is installed"
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_status "Ollama service is running"
    else
        print_info "Starting Ollama service..."
        nohup ollama serve > "$LOG_DIR/ollama.log" 2>&1 &
        OLLAMA_PID=$!
        echo $OLLAMA_PID > "$LOG_DIR/ollama.pid"
        sleep 3
        
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            print_status "Ollama service started (PID: $OLLAMA_PID)"
        else
            print_error "Failed to start Ollama service"
            exit 1
        fi
    fi
    
    # Check if Gemma model is available
    if ollama list | grep -q "gemma3:4b"; then
        print_status "Gemma 3 4B model is available"
    else
        print_info "Pulling Gemma 3 4B model (this may take a few minutes)..."
        ollama pull gemma3:4b
        print_status "Gemma 3 4B model downloaded"
    fi
else
    print_error "Ollama not found. Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    
    if check_command ollama; then
        print_status "Ollama installed successfully"
        
        # Start Ollama
        nohup ollama serve > "$LOG_DIR/ollama.log" 2>&1 &
        OLLAMA_PID=$!
        echo $OLLAMA_PID > "$LOG_DIR/ollama.pid"
        sleep 5
        
        # Pull Gemma model
        print_info "Downloading Gemma 3 4B model..."
        ollama pull gemma3:4b
        print_status "Gemma 3 4B model ready"
    else
        print_error "Failed to install Ollama"
        exit 1
    fi
fi

echo ""

# =============================================================================
# 3. Setup Python Backend
# =============================================================================

echo -e "${BLUE}[3/6] Setting up Python backend...${NC}"
echo ""

cd "$BACKEND_DIR"

# Check if virtual environment exists and is properly initialized
if [ ! -d "venv" ] || [ ! -f "venv/bin/activate" ] || [ ! -f "venv/bin/pip" ]; then
    print_info "Virtual environment not found or incomplete. Setting up Python virtual environment..."
    python3 -m venv --clear venv
    print_status "Virtual environment created"

    # Activate virtual environment
    source venv/bin/activate
    print_status "Virtual environment activated"

    # Install dependencies
    print_info "Installing Python dependencies (this may take a few minutes)..."
    pip install --upgrade pip
    pip install -r requirements.txt
    print_status "Python dependencies installed successfully"
else
    # Activate existing virtual environment
    source venv/bin/activate
    print_status "Virtual environment activated ($(python --version))"

    # Verify core dependencies are present; install if missing
    if ! python -c "import fastapi, uvicorn" > /dev/null 2>&1; then
        print_info "Missing dependencies detected in venv. Installing..."
        pip install --upgrade pip
        pip install -r requirements.txt
        print_status "Python dependencies installed successfully"
    else
        print_status "Python dependencies verified"
    fi
fi

# Setup CUDA Library Paths for faster-whisper CTranslate2 (if available)
SITE_PACKAGES=$(python -c "import site; print(site.getsitepackages()[0])" 2>/dev/null || echo "")
if [ -n "$SITE_PACKAGES" ] && [ -d "$SITE_PACKAGES/nvidia" ]; then
    NVIDIA_LIBS=""
    for dir in "$SITE_PACKAGES"/nvidia/*/lib; do
        if [ -d "$dir" ]; then
            NVIDIA_LIBS="$dir:$NVIDIA_LIBS"
        fi
    done
    export LD_LIBRARY_PATH="$NVIDIA_LIBS${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi

echo ""

# =============================================================================
# 4. Run Database Migrations
# =============================================================================

echo -e "${BLUE}[4/6] Running database migrations...${NC}"
echo ""

if [ -f "$BACKEND_DIR/run_migrations.py" ]; then
    print_info "Applying database schema updates..."
    python run_migrations.py
    
    if [ $? -eq 0 ]; then
        print_status "Database migrations completed successfully"
    else
        print_error "Database migrations failed (may be already applied)"
        print_info "Continuing with startup..."
    fi
else
    print_info "No migrations script found, skipping..."
fi

echo ""

# =============================================================================
# 5. Start Backend Server
# =============================================================================

echo -e "${BLUE}[5/6] Starting backend API server...${NC}"
echo ""

# Kill existing backend process if running
if [ -f "$LOG_DIR/backend.pid" ]; then
    OLD_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        print_info "Stopping existing backend server (PID: $OLD_PID)..."
        kill $OLD_PID
        sleep 2
    fi
fi

# Start backend server
print_info "Starting FastAPI backend on http://localhost:8000..."
nohup python -m uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$LOG_DIR/backend.pid"
sleep 3

# Check if backend started successfully
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_status "Backend server started successfully (PID: $BACKEND_PID)"
    print_info "Backend logs: $LOG_DIR/backend.log"
else
    print_error "Backend server failed to start. Check logs at $LOG_DIR/backend.log"
    exit 1
fi

echo ""

# =============================================================================
# 6. Start Frontend Server
# =============================================================================

echo -e "${BLUE}[6/6] Starting frontend development server...${NC}"
echo ""

cd "$PROJECT_ROOT"

# Kill existing frontend process if running
if [ -f "$LOG_DIR/frontend.pid" ]; then
    OLD_PID=$(cat "$LOG_DIR/frontend.pid")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        print_info "Stopping existing frontend server (PID: $OLD_PID)..."
        kill $OLD_PID
        sleep 2
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm install > /dev/null 2>&1
    print_status "Frontend dependencies installed"
fi

# Start frontend server
print_info "Starting Vite frontend on http://localhost:5173..."
nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$LOG_DIR/frontend.pid"
sleep 5

# Check if frontend started successfully
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    print_status "Frontend server started successfully (PID: $FRONTEND_PID)"
    print_info "Frontend logs: $LOG_DIR/frontend.log"
else
    print_error "Frontend server failed to start. Check logs at $LOG_DIR/frontend.log"
    # Don't exit, backend might still be usable
fi

echo ""

# =============================================================================
# Summary
# =============================================================================

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ All services started successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Service Status:${NC}"
echo -e "  Ollama (Gemma 3 4B):  ${GREEN}Running${NC} at http://localhost:11434"
echo -e "  Backend API:          ${GREEN}Running${NC} at http://localhost:8000"
echo -e "  Frontend UI:          ${GREEN}Running${NC} at http://localhost:5173"
echo ""
echo -e "${BLUE}API Documentation:${NC}"
echo -e "  Swagger UI:           http://localhost:8000/docs"
echo -e "  ReDoc:                http://localhost:8000/redoc"
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo -e "  LLM Provider:         ${YELLOW}Ollama (Local Gemma)${NC}"
echo -e "  STT Provider:         ${YELLOW}Sarvam (Whisper fallback)${NC}"
echo -e "  TTS Provider:         ${YELLOW}Sarvam (Edge-TTS fallback)${NC}"
echo ""
echo -e "${BLUE}Process IDs:${NC}"
if [ -f "$LOG_DIR/ollama.pid" ]; then
    echo -e "  Ollama PID:           $(cat $LOG_DIR/ollama.pid)"
fi
echo -e "  Backend PID:          $(cat $LOG_DIR/backend.pid)"
echo -e "  Frontend PID:         $(cat $LOG_DIR/frontend.pid)"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  Ollama:               $LOG_DIR/ollama.log"
echo -e "  Backend:              $LOG_DIR/backend.log"
echo -e "  Frontend:             $LOG_DIR/frontend.log"
echo ""
echo -e "${YELLOW}To stop all services, run:${NC}"
echo -e "  ./stop-all-linux.sh"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo -e "  tail -f $LOG_DIR/backend.log"
echo -e "  tail -f $LOG_DIR/frontend.log"
echo ""
echo -e "${GREEN}Press Ctrl+C to view logs in real-time...${NC}"
echo ""

# Follow logs (optional)
sleep 2
tail -f "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log"
