#!/bin/bash
# Run script for AI Sales Voice Agent
# Sets up CUDA library paths needed by faster-whisper (CTranslate2)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
SITE_PACKAGES="$VENV_DIR/lib/python3.14/site-packages"

# Build LD_LIBRARY_PATH from all nvidia lib directories
NVIDIA_LIBS=""
for dir in "$SITE_PACKAGES"/nvidia/*/lib; do
    if [ -d "$dir" ]; then
        NVIDIA_LIBS="$dir:$NVIDIA_LIBS"
    fi
done
export LD_LIBRARY_PATH="$NVIDIA_LIBS${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

# Activate venv
source "$VENV_DIR/bin/activate"

# Run the agent (default to api_server.py for full service, or main.py if --cli is passed)
cd "$SCRIPT_DIR"
if [ "$1" == "--cli" ]; then
    shift
    python main.py "$@"
else
    python api_server.py "$@"
fi
