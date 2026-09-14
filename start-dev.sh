#!/bin/bash

# Start AI Sales Frontend + Backend Development Servers

echo "🚀 Starting AI Sales Development Environment"
echo "============================================"

# Check if backend venv exists
if [ ! -d "backend/venv" ]; then
    echo "❌ Backend virtual environment not found"
    echo "   Run: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements-api.txt"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Node modules not found"
    echo "   Run: npm install"
    exit 1
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env not found, copying from example..."
    cp backend/.env.example backend/.env
    echo "   Please edit backend/.env and add your SARVAM_API_KEY"
fi

if [ ! -f ".env" ]; then
    echo "⚠️  Frontend .env not found, copying from example..."
    cp .env.example .env
fi

# Function to handle cleanup
cleanup() {
    echo "\n\n🛑 Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup INT TERM

# Start backend
echo "\n📡 Starting Backend API Server..."
cd backend
source venv/bin/activate
python api_server.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend running at http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "\n🎨 Starting Frontend Development Server..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 3

echo "\n✅ Development Environment Ready!"
echo "=================================="
echo "Frontend:  http://localhost:5173"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo "=================================="
echo "\nPress Ctrl+C to stop both servers"

# Wait for processes
wait
