#!/usr/bin/env bash
set -x
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/setup/config.sh"

echo "Creating directory ${REMOTE_DIR} on remote..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_DIR}"

echo "Syncing source code to remote..."
rsync -avz --exclude='.git' --exclude='dist' \
	${SOURCE_DIR}/ \
	${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

echo "Syncing scripts to remote..."
rsync -avz \
	${SCRIPT_DIR}/../scripts/start.sh \
	${SCRIPT_DIR}/../scripts/stop.sh \
	${SCRIPT_DIR}/../scripts/logs.sh \
	${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

echo "Setting ownership and permissions..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "chmod +x ${REMOTE_DIR}/*.sh"

echo "Creating systemd directory on remote..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${SYSTEMD_DIR}"

echo "Syncing systemd service file to remote..."
rsync -avz "${SCRIPT_DIR}/${SERVICE_NAME}" ${REMOTE_USER}@${REMOTE_HOST}:${SYSTEMD_DIR}/${SERVICE_NAME}

echo "Setting permissions on service file..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "chmod 644 ${SYSTEMD_DIR}/${SERVICE_NAME}"

echo "Reloading and enabling service..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user daemon-reload"
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user stop ${SERVICE_NAME} || true"
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user enable ${SERVICE_NAME}"
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user start ${SERVICE_NAME}"
ssh ${REMOTE_USER}@${REMOTE_HOST} "systemctl --user status ${SERVICE_NAME}"
