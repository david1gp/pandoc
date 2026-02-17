#!/usr/bin/env bash
set -x
set -e

pkill -f "bun run src/server/server.ts" || true
