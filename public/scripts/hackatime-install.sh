#!/bin/bash

# Exit on any error
set -e

echo "Starting Hackatime setup..."

# Step 1: Check if config directory exists and create if needed
WAKATIME_CONFIG_DIR="$HOME"
WAKATIME_CONFIG_FILE="$WAKATIME_CONFIG_DIR/.wakatime.cfg"

# Check if BEARER_TOKEN is set
if [ -z "$BEARER_TOKEN" ]; then
    echo "Error: BEARER_TOKEN environment variable is not set"
    exit 1
fi

# Create or update the WakaTime config file
echo "Configuring WakaTime settings..."
echo -e "[settings]\napi_url = https://waka.hackclub.com/api\napi_key = $BEARER_TOKEN" > "$WAKATIME_CONFIG_FILE"
echo "✓ Wrote config to $WAKATIME_CONFIG_FILE"
echo

# Step 2: Check if VS Code is installed
echo "Checking for VS Code installation..."
if ! command -v code &> /dev/null; then
    # Detect OS for appropriate keyboard shortcut in message
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Error: VS Code is not installed. You can install it at https://code.visualstudio.com/Download\n(If you're certain it is, hit ⌘⇧P and type \"Shell Command: Install 'code' command in PATH\")"
    else
        # Linux/Windows
        echo "Error: VS Code is not installed. You can install it at https://code.visualstudio.com/Download\n(If you're certain it is, hit Ctrl+Shift+P and type \"Shell Command: Install 'code' command in PATH\")"
    fi
    exit 1
fi

# Install the WakaTime extension in VS Code
echo "Installing the WakaTime extension in VS Code..."
code --install-extension WakaTime.vscode-wakatime || {
    echo "Error: Failed to install WakaTime extension"
    exit 1
}
echo "✓ VS Code extension installed successfully"
echo

# Step 3: Send test heartbeats
echo "Sending test heartbeats to verify setup..."
for i in {1..2}; do
   echo "Sending heartbeat $i/2..."
   CURRENT_TIME=$(date +%s)
   response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://waka.hackclub.com/api/heartbeat" \
       -H "Authorization: Bearer $BEARER_TOKEN" \
       -H "Content-Type: application/json" \
       -d '{
           "branch": "master",
           "category": "coding",
           "cursorpos": 1,
           "entity": "welcome.txt",
           "type": "file",
           "lineno": 1,
           "lines": 1,
           "project": "welcome",
           "time": '"$CURRENT_TIME"',
           "user_agent": "wakatime/v1.102.1 (darwin-x86_64) go1.22.5 vscode/1.94.2 vscode-wakatime/24.6.2"
       }')
   
   if [ "$response" -eq 201 ]; then
       echo "✓ Heartbeat $i sent successfully"
   else
       echo "Error: Heartbeat $i failed with HTTP status $response"
       exit 1
   fi
   
   [ $i -lt 2 ] && sleep 1
done

echo
echo "✨ Hackatime setup completed successfully!"
echo "You can now return to the setup page for further instructions."