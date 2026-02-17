#!/usr/bin/env bash
set -x
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"

echo "Installing systemd service..."

scp "${SCRIPT_DIR}/pandoc.service" ${REMOTE_USER}@${REMOTE_HOST}:${SYSTEMD_DIR}/${SERVICE_NAME}

ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user daemon-reload"
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user enable ${SERVICE_NAME}"

echo "Systemd service installed and enabled."
