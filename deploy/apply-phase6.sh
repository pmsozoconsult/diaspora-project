#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "Applying Phase 6 hardening..."

# Certbot renewal uses pip-installed binary (system certbot is broken)
mkdir -p /etc/systemd/system/certbot.service.d
cp systemd/certbot-override.conf /etc/systemd/system/certbot.service.d/override.conf
systemctl daemon-reload

# fail2ban
apt-get install -y fail2ban
cp fail2ban/nginx-req-limit.conf /etc/fail2ban/filter.d/nginx-req-limit.conf
cp fail2ban/jail.local /etc/fail2ban/jail.local
systemctl enable fail2ban
systemctl restart fail2ban

# SSH key-only (requires authorized_keys)
cp ssh/99-diaspora-hardening.conf /etc/ssh/sshd_config.d/99-diaspora-hardening.conf
sshd -t
systemctl reload sshd

echo "Phase 6 applied."
