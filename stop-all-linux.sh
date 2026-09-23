#!/bin/bash
# =============================================================================
# AI Sales Agent Platform - Stop All Services Script
# =============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$PROJECT_ROOT/logs"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Stopping AI Sales Agent Platform${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Stop Backend
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        print_info "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm "$LOG_DIR/backend.pid"
        print_status "Backend server stopped"
    else
        print_info "Backend server not running"
        rm "$LOG_DIR/backend.pid"
    fi
else
    print_info "No backend PID file found"
fi

# Stop Frontend
if [ -f "$LOG_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        print_info "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm "$LOG_DIR/frontend.pid"
        print_status "Frontend server stopped"
    else
        print_info "Frontend server not running"
        rm "$LOG_DIR/frontend.pid"
    fi
else
    print_info "No frontend PID file found"
fi

# Stop Ollama (optional - you may want to keep it running)
if [ -f "$LOG_DIR/ollama.pid" ]; then
    OLLAMA_PID=$(cat "$LOG_DIR/ollama.pid")
    if ps -p $OLLAMA_PID > /dev/null 2>&1; then
        print_info "Ollama is running (PID: $OLLAMA_PID)"
        read -p "Do you want to stop Ollama? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill $OLLAMA_PID
            rm "$LOG_DIR/ollama.pid"
            print_status "Ollama service stopped"
        else
            print_info "Keeping Ollama running"
        fi
    else
        rm "$LOG_DIR/ollama.pid"
    fi
fi

echo ""
echo -e "${GREEN}All services stopped successfully!${NC}"
echo ""
