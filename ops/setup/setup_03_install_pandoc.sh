#!/usr/bin/env bash
set -x
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"

echo "Installing latest pandoc for user ${REMOTE_USER}..."

LATEST_VERSION=$(ssh ${REMOTE_USER}@${REMOTE_HOST} "curl -sL https://api.github.com/repos/jgm/pandoc/releases/latest | grep '"tag_name"' | cut -d'\"' -f4")

ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ~/.bin && cd /tmp && curl -sL \"https://github.com/jgm/pandoc/releases/download/${LATEST_VERSION}/pandoc-${LATEST_VERSION#v}-linux-arm64.tar.gz\" -o pandoc.tar.gz && tar -xzf pandoc.tar.gz && cp pandoc-${LATEST_VERSION#v}/bin/pandoc ~/.bin/ && rm -rf /tmp/pandoc.tar.gz /tmp/pandoc-${LATEST_VERSION#v}"

echo "Adding ~/.bin to PATH..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "echo 'export PATH=\"\$HOME/.bin:\$PATH\"' >> ~/.bashrc"

echo "Pandoc ${LATEST_VERSION} installed successfully."

ssh ${REMOTE_USER}@${REMOTE_HOST} "bash -c 'pandoc -v'"
