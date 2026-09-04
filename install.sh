#!/usr/bin/env bash
set -e

REPO="letsmakepact/PortSide"
DEST_DIR="$HOME/Portside"
UPDATES_DIR="$DEST_DIR/updates"

mkdir -p "$DEST_DIR" "$UPDATES_DIR"

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
  x86_64|amd64)
    ARCH="amd64"
    ;;
  arm64|aarch64)
    ARCH="arm64"
    ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

echo "=================================================================="
echo "           PORTSIDE - Name Your Localhost (Port 80)               "
echo "             Created by pact (@pactwithdevil)                     "
echo "             Target Platform: $OS/$ARCH                           "
echo "=================================================================="
echo ""

BINARY_NAME="Portside-Launcher-${OS}-${ARCH}"
DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/${BINARY_NAME}"

echo "Fetching latest launcher binary..."
if curl -fsSL -o "$DEST_DIR/Portside" "$DOWNLOAD_URL" 2>/dev/null; then
  chmod +x "$DEST_DIR/Portside"
  echo "✓ Successfully installed launcher to: $DEST_DIR/Portside"
  echo "Running Portside..."
  "$DEST_DIR/Portside"
else
  echo "Note: Release binary not found yet on GitHub. Cloning repository..."
  cd "$DEST_DIR"
  if [ ! -d "$DEST_DIR/.git" ]; then
    git clone "https://github.com/${REPO}.git" .
  else
    git pull
  fi
  npm install
  npm run db:push
  npm run dev
fi
