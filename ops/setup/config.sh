#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables from .env file in the same directory as this script
if [ -f "${SCRIPT_DIR}/../.env" ]; then
	set -a
	source "${SCRIPT_DIR}/../.env"
	set +a
else
	echo "Error: .env file not found in ${SCRIPT_DIR}/../"
	exit 1
fi
