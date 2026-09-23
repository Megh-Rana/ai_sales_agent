#!/bin/bash
# Run script for AI Sales Voice Agent
# Sets up CUDA library paths needed by faster-whisper (CTranslate2)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"

# Setup virtual environment if it doesn't exist already
if [ ! -d "$VENV_DIR" ] || [ ! -f "$VENV_DIR/bin/activate" ] || [ ! -f "$VENV_DIR/bin/pip" ]; then
    echo "Virtual environment not found or incomplete at $VENV_DIR. Setting up venv..."
    if ! command -v python3 &> /dev/null; then
        echo "Error: Python 3 is not installed or not in PATH."
        exit 1
    fi
    python3 -m venv --clear "$VENV_DIR"
    "$VENV_DIR/bin/pip" install --upgrade pip
    "$VENV_DIR/bin/pip" install -r "$SCRIPT_DIR/requirements.txt"
    echo "Virtual environment setup completed."
fi

# Activate venv
source "$VENV_DIR/bin/activate"

# Build LD_LIBRARY_PATH from all nvidia lib directories if available
SITE_PACKAGES=$(python -c "import site; print(site.getsitepackages()[0])" 2>/dev/null || echo "")
NVIDIA_LIBS=""
if [ -n "$SITE_PACKAGES" ] && [ -d "$SITE_PACKAGES/nvidia" ]; then
    for dir in "$SITE_PACKAGES"/nvidia/*/lib; do
        if [ -d "$dir" ]; then
            NVIDIA_LIBS="$dir:$NVIDIA_LIBS"
        fi
    done
fi
export LD_LIBRARY_PATH="$NVIDIA_LIBS${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

# Run the agent (default to api_server.py for full service, or main.py if --cli is passed)
cd "$SCRIPT_DIR"
if [ "$1" == "--cli" ]; then
    shift
    python main.py "$@"
else
    python api_server.py "$@"
fi
