#!/usr/bin/env bash
set -x
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/config.sh"

SSH_USER="root"
APP_USER="${REMOTE_USER}"

ssh ${SSH_USER}@${REMOTE_HOST} 'bash -s' "${APP_USER}" <"${SCRIPT_DIR}/setup_01_create_user_as_root_remotely.sh"
