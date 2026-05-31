#!/bin/zsh

set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f ".env" ]; then
  echo "Missing .env file."
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo "Missing package.json."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting JBSapp on http://localhost:8888 ..."
exec npx netlify-cli dev
