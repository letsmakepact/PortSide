#!/usr/bin/env bash
set -e

echo "=== Deploying PortSide Primary Relay to Mail Server (37.221.67.247) ==="

# Create runtime directory
mkdir -p /opt/portside-relay

# Move binary
cp ./relay-server-linux-amd64 /opt/portside-relay/portsided-relay
chmod +x /opt/portside-relay/portsided-relay

# Install systemd service
cp ./portsided-relay.service /etc/systemd/system/portsided-relay.service
systemctl daemon-reload
systemctl enable portsided-relay
systemctl restart portsided-relay

# Check status
systemctl status portsided-relay --no-pager

# Install Nginx configuration
if [ -d /etc/nginx/sites-available ]; then
    cp ../config/nginx-portside-relay.conf /etc/nginx/sites-available/portside-relay.conf
    ln -sf /etc/nginx/sites-available/portside-relay.conf /etc/nginx/sites-enabled/portside-relay.conf
    nginx -t && systemctl reload nginx
elif [ -d /etc/nginx/conf.d ]; then
    cp ../config/nginx-portside-relay.conf /etc/nginx/conf.d/portside-relay.conf
    nginx -t && systemctl reload nginx
fi

echo "=== Primary Relay successfully deployed! Wildcard *.portside.lol is live! ==="
