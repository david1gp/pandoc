#!/usr/bin/env bash
set -x
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"

echo "Installing texlive and poppler-utils..."

ssh root@${REMOTE_HOST} "apt-get update && apt-get install -y texlive poppler-utils"

echo "Texlive and poppler-utils installed successfully."
ssh root@${REMOTE_HOST} "bash -lc 'pdftotext -v | head -n 1'"
