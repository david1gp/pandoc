#!/usr/bin/env bash
set -x
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"

echo "Installing bun for user ${REMOTE_USER}..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "curl -fsSL https://bun.sh/install -o /tmp/bun_install.sh && chmod +x /tmp/bun_install.sh && /tmp/bun_install.sh"

echo "Adding .bin to PATH..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "echo 'export PATH=\"\$HOME/.bin:\$PATH\"' >> ~/.bashrc"
ssh root@${REMOTE_HOST} "ln -s /home/${REMOTE_USER}/.bun/bin/bun /usr/local/bin/bun"
