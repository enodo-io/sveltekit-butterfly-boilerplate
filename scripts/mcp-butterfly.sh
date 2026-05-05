#!/bin/sh
# Wrapper for butterfly-mcp that loads .env from the project root.
#
# Why this exists: Claude Code spawns MCP subprocesses with its own
# parent-shell env inherited. Any stale/empty PRIVATE_API_KEY in that
# parent env silently overrides dotenv's .env loading inside the MCP
# (dotenv does not override existing process.env values by default).
# This wrapper fixes that by loading .env into the current shell with
# `set -a` (export all), so the spawned butterfly-mcp sees the right
# values regardless of what Claude Code passed.
#
# Usage (from .mcp.json):
#   { "mcpServers": { "butterfly": { "command": "./scripts/mcp-butterfly.sh" } } }

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

if [ ! -f .env ]; then
  echo "mcp-butterfly.sh: .env not found in $PROJECT_ROOT" >&2
  exit 1
fi

set -a
. ./.env
set +a

exec npx -y @enodo/butterfly-mcp@latest
