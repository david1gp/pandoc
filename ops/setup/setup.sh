#!/usr/bin/env bash
set -x
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Running setup scripts..."

bash "${SCRIPT_DIR}/setup_01_create_user.sh"
bash "${SCRIPT_DIR}/setup_02_install_bun.sh"
bash "${SCRIPT_DIR}/setup_03_install_pandoc.sh"
bash "${SCRIPT_DIR}/setup_04_install_texlive_as_root.sh"
bash "${SCRIPT_DIR}/setup_05_systemd_service.sh"

echo "All setup scripts completed."
