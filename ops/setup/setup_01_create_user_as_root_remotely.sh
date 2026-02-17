#!/usr/bin/env bash
set -x
set -e

REMOTE_USER="$1"

echo "Creating user ${REMOTE_USER}..."
id ${REMOTE_USER} &>/dev/null || useradd -m -s /bin/bash ${REMOTE_USER}

echo "Copying SSH keys from root to user..."
mkdir -p /home/${REMOTE_USER}/.ssh
if [ ! -f /home/${REMOTE_USER}/.ssh/authorized_keys ]; then
	cp /root/.ssh/authorized_keys /home/${REMOTE_USER}/.ssh/authorized_keys
fi
chown ${REMOTE_USER}:${REMOTE_USER} -R /home/${REMOTE_USER}/.ssh
chmod 600 /home/${REMOTE_USER}/.ssh/authorized_keys 2>/dev/null || true
chmod 755 /home/${REMOTE_USER}/.ssh

echo "Enabling lingering for user..."
loginctl enable-linger ${REMOTE_USER} 2>/dev/null || true

echo "Setting shell to bash..."
chsh -s /bin/bash ${REMOTE_USER}

echo "User ${REMOTE_USER} created successfully"
