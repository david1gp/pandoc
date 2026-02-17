#!/usr/bin/env bash
set -x
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"

echo "Installing texlive..."

ssh root@${REMOTE_HOST} "apt-get update && apt-get install -y texlive"

echo "Texlive installed successfully."
