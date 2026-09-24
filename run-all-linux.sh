#!/bin/bash
# =============================================================================
# AI Sales Agent Platform - Complete Linux Setup & Run Script
# =============================================================================
# This script:
# 1. Checks dependencies (Python, Node.js, npm)
# 2. Sets up Ollama with Gemma 3 model
# 3. Sets up Python virtual environment & dependencies
# 4. Configures database (PostgreSQL with seamless SQLite fallback)
# 5. Initializes database schema, default users, seeds & migrations
# 6. Starts backend API server
# 7. Starts frontend development server
# =============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
LOG_DIR="$PROJECT_ROOT/logs"

# Create logs directory
mkdir -p "$LOG_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}${BOLD}AI Sales Agent Platform - Linux Setup${NC}"
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
    echo -e "${CYAN}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
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

echo -e "${BLUE}[1/7] Checking dependencies...${NC}"
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

if check_command psql; then
    print_status "PostgreSQL client CLI (psql) is available"
else
    print_info "PostgreSQL client CLI (psql) not found (optional)"
fi

echo ""

# =============================================================================
# 2. Setup Ollama
# =============================================================================

echo -e "${BLUE}[2/7] Setting up Ollama...${NC}"
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
        
        # Wait up to 10 seconds for Ollama
        for i in {1..10}; do
            if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
                break
            fi
            sleep 1
        done
        
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            print_status "Ollama service started (PID: $OLLAMA_PID)"
        else
            print_warning "Failed to verify Ollama service startup. Continuing..."
        fi
    fi
    
    # Check if Gemma model is available
    if ollama list 2>/dev/null | grep -q "gemma3:4b"; then
        print_status "Gemma 3 4B model is available"
    else
        print_info "Pulling Gemma 3 4B model (this may take a few minutes)..."
        ollama pull gemma3:4b || print_warning "Failed to pull gemma3:4b. Continuing..."
        print_status "Gemma 3 4B model ready"
    fi
else
    print_info "Ollama not found. Attempting installation..."
    if curl -fsSL https://ollama.com/install.sh | sh 2>/dev/null; then
        print_status "Ollama installed successfully"
        nohup ollama serve > "$LOG_DIR/ollama.log" 2>&1 &
        OLLAMA_PID=$!
        echo $OLLAMA_PID > "$LOG_DIR/ollama.pid"
        sleep 4
        ollama pull gemma3:4b || true
    else
        print_warning "Could not auto-install Ollama. Local LLM will be skipped or will use fallback."
    fi
fi

echo ""

# =============================================================================
# 3. Setup Python Backend Environment
# =============================================================================

echo -e "${BLUE}[3/7] Setting up Python backend environment...${NC}"
echo ""

cd "$BACKEND_DIR"

# Check if virtual environment exists and is properly initialized
if [ ! -d "venv" ] || [ ! -f "venv/bin/activate" ] || [ ! -f "venv/bin/pip" ]; then
    print_info "Setting up Python virtual environment at backend/venv..."
    python3 -m venv --clear venv
    print_status "Virtual environment created"

    # Activate virtual environment
    source venv/bin/activate
    print_status "Virtual environment activated"

    # Install dependencies
    print_info "Installing Python dependencies (this may take a couple minutes)..."
    pip install --upgrade pip > /dev/null 2>&1 || pip install --upgrade pip
    pip install -r requirements.txt
    print_status "Python dependencies installed successfully"
else
    # Activate existing virtual environment
    source venv/bin/activate
    print_status "Virtual environment activated ($(python --version))"

    # Verify core dependencies are present; install if missing
    if ! python -c "import fastapi, uvicorn, bcrypt, sqlalchemy" > /dev/null 2>&1; then
        print_info "Missing dependencies detected in venv. Installing..."
        pip install --upgrade pip > /dev/null 2>&1 || true
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
# 4. Database Setup & Validation (PostgreSQL with SQLite Fallback)
# =============================================================================

echo -e "${BLUE}[4/7] Configuring Database...${NC}"
echo ""

# Ensure .env exists in project root
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    print_info "Creating .env configuration file from template..."
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
    sed -i 's|ENVIRONMENT=production|ENVIRONMENT=development|g' "$PROJECT_ROOT/.env"
    print_status ".env file created"
fi

# Read environment variables from .env
set -a
[ -f "$PROJECT_ROOT/.env" ] && source "$PROJECT_ROOT/.env"
set +a

ACTIVE_DB_URL="${DATABASE_URL:-}"
USE_SQLITE=false

# If configured for PostgreSQL, test connection
if [[ "$ACTIVE_DB_URL" == postgresql* ]] || [[ "$ACTIVE_DB_URL" == postgres* ]]; then
    print_info "PostgreSQL URL configured: $ACTIVE_DB_URL"
    
    # Check if PostgreSQL service is running without requiring sudo
    if systemctl is-active --quiet postgresql 2>/dev/null; then
        print_status "PostgreSQL service is running"
    elif check_command pg_isready && pg_isready -q 2>/dev/null; then
        print_status "PostgreSQL service is accepting connections"
    else
        print_info "PostgreSQL service not active. Attempting start..."
        systemctl start postgresql 2>/dev/null || (sudo -n systemctl start postgresql 2>/dev/null) || true
    fi
    
    # Test connection using Python psycopg2
    PG_CONNECT_OK=false
    if python -c "import psycopg2; conn = psycopg2.connect('$ACTIVE_DB_URL'); conn.close()" > /dev/null 2>&1; then
        PG_CONNECT_OK=true
    fi
    
    # If connection failed and passwordless sudo is available, try auto-creating user/db
    if [ "$PG_CONNECT_OK" = false ] && sudo -n true 2>/dev/null; then
        print_info "Attempting PostgreSQL user & database setup..."
        sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='vidur_user'" 2>/dev/null | grep -q 1 || \
            sudo -u postgres psql -c "CREATE USER vidur_user WITH PASSWORD 'vidur_password';" 2>/dev/null || true

        sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw vidur_sales || \
            sudo -u postgres psql -c "CREATE DATABASE vidur_sales OWNER vidur_user;" 2>/dev/null || true

        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vidur_sales TO vidur_user;" 2>/dev/null || true
        
        if python -c "import psycopg2; conn = psycopg2.connect('$ACTIVE_DB_URL'); conn.close()" > /dev/null 2>&1; then
            PG_CONNECT_OK=true
        fi
    fi
    
    if [ "$PG_CONNECT_OK" = true ]; then
        print_status "PostgreSQL database connected successfully"
        DB_ENGINE_NAME="PostgreSQL"
    else
        print_warning "Could not connect to PostgreSQL ($ACTIVE_DB_URL)."
        print_info "Falling back seamlessly to local SQLite database ($BACKEND_DIR/sales_platform.db)..."
        print_info "(To set up PostgreSQL fully, run: ./setup-postgres.sh)"
        ACTIVE_DB_URL="sqlite:///$BACKEND_DIR/sales_platform.db"
        export DATABASE_URL="$ACTIVE_DB_URL"
        USE_SQLITE=true
        DB_ENGINE_NAME="SQLite"
    fi
else
    ACTIVE_DB_URL="sqlite:///$BACKEND_DIR/sales_platform.db"
    export DATABASE_URL="$ACTIVE_DB_URL"
    USE_SQLITE=true
    DB_ENGINE_NAME="SQLite"
    print_status "Using local SQLite database: $ACTIVE_DB_URL"
fi

echo ""

# =============================================================================
# 5. Database Schema Initialization, Seeds & Migrations
# =============================================================================

echo -e "${BLUE}[5/7] Initializing database schema & migrations...${NC}"
echo ""

cd "$BACKEND_DIR"

# 1. Initialize schema tables
python -c "import sys; sys.path.insert(0, '.'); from app.db.database import init_db; init_db()"
print_status "Database schema tables verified"

# 2. Seed default authentication users
if [ -f "$BACKEND_DIR/seed_users.py" ]; then
    python seed_users.py > /dev/null 2>&1 || python seed_users.py
    print_status "Default system user accounts verified"
fi

# 3. Seed discovery leads and demo entities
if [ -f "$BACKEND_DIR/seed_discovery_leads.py" ]; then
    python seed_discovery_leads.py > /dev/null 2>&1 || true
    print_status "Discovery leads & demo organizations verified"
fi

# 4. Apply schema migrations
if [ -f "$BACKEND_DIR/run_migrations.py" ]; then
    print_info "Applying schema migrations..."
    python run_migrations.py
    print_status "Database migrations completed successfully"
fi

echo ""

# =============================================================================
# 6. Start Backend Server
# =============================================================================

echo -e "${BLUE}[6/7] Starting backend API server...${NC}"
echo ""

cd "$BACKEND_DIR"

# Kill existing backend process if running
if [ -f "$LOG_DIR/backend.pid" ]; then
    OLD_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        print_info "Stopping existing backend server (PID: $OLD_PID)..."
        kill $OLD_PID 2>/dev/null || true
        sleep 1
    fi
    rm -f "$LOG_DIR/backend.pid"
fi

# Ensure port 8000 is free
fuser -k 8000/tcp 2>/dev/null || true
sleep 1

# Start backend server
print_info "Starting FastAPI backend on http://localhost:8000..."

nohup python -m uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$LOG_DIR/backend.pid"

# Wait and poll for backend health check
print_info "Waiting for backend server to initialize..."
BACKEND_STARTED=false
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        BACKEND_STARTED=true
        break
    fi
    # If the process terminated unexpectedly, break early
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        break
    fi
    sleep 1
done

if [ "$BACKEND_STARTED" = true ]; then
    print_status "Backend server started successfully (PID: $BACKEND_PID)"
    print_info "Backend logs: $LOG_DIR/backend.log"
else
    print_error "Backend server failed to start within timeout. Recent logs:"
    echo "--------------------------------------------------"
    tail -n 25 "$LOG_DIR/backend.log" 2>/dev/null || true
    echo "--------------------------------------------------"
    exit 1
fi

echo ""

# =============================================================================
# 6.5. Start Twilio Carrier Webhooks Tunnel (Cloudflare / localhost.run)
# =============================================================================

echo -e "${BLUE}Configuring Twilio PSTN audio webhook tunnel...${NC}"

# Kill existing tunnel if running
if [ -f "$LOG_DIR/tunnel.pid" ]; then
    OLD_TUNNEL_PID=$(cat "$LOG_DIR/tunnel.pid")
    if ps -p $OLD_TUNNEL_PID > /dev/null 2>&1; then
        kill $OLD_TUNNEL_PID 2>/dev/null || true
        sleep 1
    fi
    rm -f "$LOG_DIR/tunnel.pid"
fi
pkill -f "ssh.*localhost.run" 2>/dev/null || true
pkill -f "cloudflared" 2>/dev/null || true
rm -f "$LOG_DIR/tunnel_url.txt"

CLOUDFLARED_BIN=""
if command -v cloudflared &>/dev/null; then
    CLOUDFLARED_BIN="cloudflared"
elif [ -x "$HOME/.local/bin/cloudflared" ]; then
    CLOUDFLARED_BIN="$HOME/.local/bin/cloudflared"
fi

if [ -n "$CLOUDFLARED_BIN" ]; then
    print_info "Using Cloudflare Tunnel (persistent, zero inactivity timeout)..."
    nohup "$CLOUDFLARED_BIN" tunnel --url http://localhost:8000 --no-autoupdate > "$LOG_DIR/tunnel.log" 2>&1 &
    TUNNEL_PID=$!
    echo $TUNNEL_PID > "$LOG_DIR/tunnel.pid"

    TUNNEL_URL=""
    for i in {1..30}; do
        if [ -f "$LOG_DIR/tunnel.log" ]; then
            TUNNEL_URL=$(grep -o -E 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$LOG_DIR/tunnel.log" | head -n 1)
            if [ -n "$TUNNEL_URL" ]; then
                echo "$TUNNEL_URL" > "$LOG_DIR/tunnel_url.txt"
                export TWILIO_WEBHOOK_BASE_URL="$TUNNEL_URL"
                print_status "Twilio Carrier Public Tunnel active: $TUNNEL_URL"
                break
            fi
        fi
        sleep 0.5
    done
else
    print_info "Using localhost.run SSH reverse tunnel..."
    nohup ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ServerAliveInterval=15 -R 80:localhost:8000 nokey@localhost.run -- --output json > "$LOG_DIR/tunnel.log" 2>&1 &
    TUNNEL_PID=$!
    echo $TUNNEL_PID > "$LOG_DIR/tunnel.pid"

    TUNNEL_URL=""
    for i in {1..20}; do
        if [ -f "$LOG_DIR/tunnel.log" ]; then
            TUNNEL_URL=$(grep -o -E 'https://[a-zA-Z0-9.-]+\.lhr\.life' "$LOG_DIR/tunnel.log" | tail -n 1)
            if [ -n "$TUNNEL_URL" ]; then
                echo "$TUNNEL_URL" > "$LOG_DIR/tunnel_url.txt"
                export TWILIO_WEBHOOK_BASE_URL="$TUNNEL_URL"
                print_status "Twilio Carrier Public Tunnel active: $TUNNEL_URL"
                break
            fi
        fi
        sleep 0.5
    done
fi

if [ -z "$TUNNEL_URL" ]; then
    print_info "Public tunnel running in background (PID: $TUNNEL_PID). See logs: $LOG_DIR/tunnel.log"
fi

echo ""

# =============================================================================
# 7. Start Frontend Server
# =============================================================================

echo -e "${BLUE}[7/7] Starting frontend development server...${NC}"
echo ""

cd "$PROJECT_ROOT"

# Kill existing frontend process if running
if [ -f "$LOG_DIR/frontend.pid" ]; then
    OLD_PID=$(cat "$LOG_DIR/frontend.pid")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        print_info "Stopping existing frontend server (PID: $OLD_PID)..."
        kill $OLD_PID 2>/dev/null || true
        sleep 1
    fi
    rm -f "$LOG_DIR/frontend.pid"
fi

# Clear common dev ports
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
sleep 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm install > /dev/null 2>&1 || npm install
    print_status "Frontend dependencies installed"
fi

# Start frontend server
print_info "Starting Vite frontend server..."
nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$LOG_DIR/frontend.pid"

# Wait and poll for frontend server
print_info "Waiting for frontend server to initialize..."
FRONTEND_STARTED=false
FRONTEND_PORT=3000
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        FRONTEND_STARTED=true
        FRONTEND_PORT=3000
        break
    elif curl -s http://localhost:5173 > /dev/null 2>&1; then
        FRONTEND_STARTED=true
        FRONTEND_PORT=5173
        break
    elif curl -s http://localhost:3001 > /dev/null 2>&1; then
        FRONTEND_STARTED=true
        FRONTEND_PORT=3001
        break
    fi
    if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
        break
    fi
    sleep 1
done

if [ "$FRONTEND_STARTED" = true ]; then
    print_status "Frontend server started successfully (PID: $FRONTEND_PID)"
    print_info "Frontend logs: $LOG_DIR/frontend.log"
else
    print_error "Frontend server failed to start. Recent logs:"
    echo "--------------------------------------------------"
    tail -n 25 "$LOG_DIR/frontend.log" 2>/dev/null || true
    echo "--------------------------------------------------"
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
echo -e "  Database:             ${GREEN}$DB_ENGINE_NAME${NC} ($ACTIVE_DB_URL)"
echo -e "  Ollama (Gemma 3 4B):  ${GREEN}Running${NC} at http://localhost:11434"
echo -e "  Backend API:          ${GREEN}Running${NC} at http://localhost:8000"
echo -e "  Frontend UI:          ${GREEN}Running${NC} at http://localhost:$FRONTEND_PORT"
echo -e "  Twilio Carrier Tunnel:${GREEN} ${TUNNEL_URL:-"Active (PID: $TUNNEL_PID)"}${NC} (localhost.run)"
echo ""
echo -e "${BLUE}API Documentation:${NC}"
echo -e "  Swagger UI:           http://localhost:8000/docs"
echo -e "  ReDoc:                http://localhost:8000/redoc"
echo ""
echo -e "${BLUE}Default User Credentials:${NC}"
echo -e "  Neel Agrawal:         ${YELLOW}neel@vidur.in${NC} / ${YELLOW}neelit002${NC} (Admin - default)"
echo -e "  Megh Rana:            ${YELLOW}megh@vidur.in${NC} / ${YELLOW}meghce099${NC} (Admin)"
echo -e "  Vidur Administrator:  ${YELLOW}admin@vidur.in${NC} / ${YELLOW}admin@2026${NC} (Admin)"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  Backend:              $LOG_DIR/backend.log"
echo -e "  Frontend:             $LOG_DIR/frontend.log"
echo -e "  Twilio Tunnel:        $LOG_DIR/tunnel.log"
echo ""
echo -e "${YELLOW}To stop all services, run:${NC}"
echo -e "  ./stop-all-linux.sh"
echo ""
echo -e "${GREEN}Following real-time logs (Press Ctrl+C to detach)...${NC}"
echo ""

# Follow logs
sleep 1
tail -f "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log"
