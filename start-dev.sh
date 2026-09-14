#!/bin/bash

# AI Sales Frontend + Backend - Auto-Setup & Development Server Launcher
# This script automatically installs all dependencies and starts both servers

set -e  # Exit on error
set -x  # Print each command before executing (verbose mode)

echo "🚀 AI Sales Voice Agent - Development Environment Setup"
echo "========================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Function to handle cleanup
cleanup() {
    echo -e "\n\n${RED}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    exit
}

trap cleanup INT TERM

# ============================================================
# 1. CHECK PREREQUISITES
# ============================================================

echo -e "\n${BLUE}[1/6] Checking Prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.10+"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
print_status "Python ${PYTHON_VERSION} found"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+"
    exit 1
fi
NODE_VERSION=$(node --version)
print_status "Node.js ${NODE_VERSION} found"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm --version)
print_status "npm ${NPM_VERSION} found"

# Check Ollama
if ! command -v ollama &> /dev/null; then
    print_warning "Ollama not found. Install from: https://ollama.ai"
    print_info "You need Ollama for the AI agent to work"
else
    print_status "Ollama found"
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_status "Ollama is running"
        
        # Check if gemma3:4b is installed
        if ollama list | grep -q "gemma3:4b"; then
            print_status "gemma3:4b model is installed"
        else
            print_warning "gemma3:4b model not found"
            print_info "Pulling gemma3:4b model... (this may take a few minutes)"
            ollama pull gemma3:4b || print_warning "Failed to pull model. Run 'ollama pull gemma3:4b' manually"
        fi
    else
        print_warning "Ollama is not running. Starting it..."
        print_info "Run 'ollama serve' in another terminal"
    fi
fi

# ============================================================
# 2. SETUP BACKEND VIRTUAL ENVIRONMENT
# ============================================================

echo -e "\n${BLUE}[2/6] Setting up Backend Python Environment...${NC}"

cd backend

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    print_status "Virtual environment created"
else
    print_status "Virtual environment already exists"
fi

# Activate venv
source venv/bin/activate

# Mark deps as already installed since we copied the venv
touch venv/.deps_installed 2>/dev/null || true

# Check if dependencies are installed
if [ ! -f "venv/.deps_installed" ]; then
    print_info "Installing backend dependencies... (this may take a few minutes)"
    
    # Upgrade pip first
    echo ">>> Upgrading pip..."
    pip install --upgrade pip
    
    # Install dependencies
    if [ -f "requirements.txt" ]; then
        echo ">>> Installing from requirements.txt..."
        pip install -r requirements.txt
        print_status "Backend dependencies installed"
        touch venv/.deps_installed
    else
        print_error "requirements.txt not found in backend/"
        exit 1
    fi
else
    print_status "Backend dependencies already installed"
    echo "    (Delete backend/venv/.deps_installed to force reinstall)"
fi

# Setup .env file
if [ ! -f ".env" ]; then
    print_warning ".env file not found, creating from template..."
    cat > .env << 'EOF'
# Sarvam AI API Key for multilingual voice (EN/HI/GU/MR)
# Get your key from: https://app.sarvam.ai/
SARVAM_API_KEY=your_sarvam_api_key_here

# Ollama Configuration (runs locally)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b

# Voice Configuration
TTS_GENDER=female

# API Configuration
API_PORT=8000
DEBUG=true
EOF
    print_warning "Please edit backend/.env and add your SARVAM_API_KEY"
    print_info "Get API key from: https://app.sarvam.ai/"
else
    print_status "Backend .env file exists"
fi

cd ..

# ============================================================
# 3. SETUP FRONTEND DEPENDENCIES
# ============================================================

echo -e "\n${BLUE}[3/6] Setting up Frontend Dependencies...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies... (this may take a few minutes)"
    echo ">>> Running npm install..."
    npm install
    print_status "Frontend dependencies installed"
else
    print_status "Frontend dependencies already installed"
    echo "    (Delete node_modules/ to force reinstall)"
fi

# Setup frontend .env
if [ ! -f ".env" ]; then
    print_info "Creating frontend .env file..."
    cat > .env << 'EOF'
# Backend API URL
VITE_API_URL=http://localhost:8000

# App Configuration
VITE_APP_NAME=AI Sales Voice Agent
VITE_APP_VERSION=1.0.0
EOF
    print_status "Frontend .env created"
else
    print_status "Frontend .env file exists"
fi

# ============================================================
# 4. VERIFY CONFIGURATION
# ============================================================

echo -e "\n${BLUE}[4/6] Verifying Configuration...${NC}"

# Check if Sarvam API key is configured
if grep -q "your_sarvam_api_key_here" backend/.env; then
    print_warning "Sarvam API key not configured in backend/.env"
    print_info "Voice calls will work but only in English without Sarvam"
    print_info "Get your key from: https://app.sarvam.ai/"
else
    print_status "Sarvam API key is configured"
fi

# Check audio system (Linux specific)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if ! dpkg -l | grep -q portaudio19-dev; then
        print_warning "portaudio19-dev not detected (needed for microphone)"
        print_info "Install with: sudo apt install portaudio19-dev python3-pyaudio"
    else
        print_status "Audio libraries detected"
    fi
fi

# ============================================================
# 5. START BACKEND SERVER
# ============================================================

echo -e "\n${BLUE}[5/6] Starting Backend API Server...${NC}"

cd backend
source venv/bin/activate

# Start backend in background
python api_server.py &
BACKEND_PID=$!

# Wait for backend to start
print_info "Waiting for backend to initialize..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_status "Backend is running at http://localhost:8000"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend failed to start after 30 seconds"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

cd ..

# ============================================================
# 6. START FRONTEND SERVER
# ============================================================

echo -e "\n${BLUE}[6/6] Starting Frontend Development Server...${NC}"

npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
print_info "Waiting for frontend to initialize..."
sleep 3

# ============================================================
# READY TO USE
# ============================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   ✅  AI SALES VOICE AGENT - READY TO USE                 ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  🎨 Frontend:      http://localhost:5173"
echo "  📡 Backend API:   http://localhost:8000"
echo "  📚 API Docs:      http://localhost:8000/docs"
echo "  🔍 Health Check:  http://localhost:8000/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  📖 HOW TO USE:"
echo ""
echo "  1. Open http://localhost:5173 in your browser"
echo "  2. Go to Dashboard → Lead Discovery"
echo "  3. Click 'AI Call' on any lead"
echo "  4. Click 'Start Call' to load AI models"
echo "  5. Click 'Launch' to begin REAL voice conversation"
echo "  6. Speak into your microphone - you're the customer!"
echo "  7. AI responds through your speakers"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ⚠️  IMPORTANT:"
echo ""
echo "  • Make sure your microphone is working"
echo "  • Grant browser microphone permissions if asked"
echo "  • Ollama must be running (ollama serve)"
echo "  • For multilingual voice, configure Sarvam API key in backend/.env"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🛑 Press Ctrl+C to stop both servers"
echo ""

# Wait for processes
wait
