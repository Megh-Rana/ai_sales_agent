#!/bin/bash
# Root shortcut launcher for Vidur AI Sales Platform
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/start-dev.sh" "$@"
