#!/bin/bash

set -o errexit -o nounset -o pipefail

VERBOSE=${VERBOSE:-false}

trap 'error "An unexpected error occurred."' ERR

log() {
    if [ "$VERBOSE" = true ]; then
        printf '%s [INFO] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
    fi
}

error() {
    printf '%s [ERROR] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >&2
}

check_command() {
    if ! command -v code &>/dev/null; then
        if [[ -d "/Applications/Visual Studio Code.app" ]]; then
            echo "The 'code' command is not found although VS code is installed. This is probably because it is not added to your path. Would you like to add it to your PATH? (y/n)"
            read -r answer
            if [[ "$answer" =~ ^[Yy]$ ]]; then
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    echo 'export PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin:$PATH"' >> ~/.zshrc
                    source ~/.zshrc
                elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                    echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
                    source ~/.bashrc
                fi
                echo "The 'code' command has been added to your PATH. Please restart your terminal."
            fi
        else
             echo "$1 is not installed. Please install it before running this script."
        fi
    fi
}

configure_wakatime() {
    log "Configuring WakaTime settings..."
    WAKATIME_CONFIG_FILE="$HOME/.wakatime.cfg"
    {
        echo "[settings]"
        echo "api_url = https://waka.hackclub.com/api"
        echo "api_key = $BEARER_TOKEN"
    } >"$WAKATIME_CONFIG_FILE"
    chmod 600 "$WAKATIME_CONFIG_FILE"
    echo "✓ Wrote config to $WAKATIME_CONFIG_FILE"
    echo
}

check_vscode() {
    log "Checking for VS Code installation..."
    if ! command -v code &>/dev/null; then
        error "VS Code is not installed. Install it from https://code.visualstudio.com/Download"
        if [ "$VERBOSE" = true ]; then
            case "$OSTYPE" in
            darwin*)
                error "(In VS Code, press ⌘⇧P and type \"Shell Command: Install 'code' command in PATH\".)"
                ;;
            msys* | win32*)
                error "(In VS Code, press Ctrl+Shift+P and type \"Shell Command: Install 'code' command in PATH\".)"
                ;;
            *)
                error "(In VS Code, press Ctrl+Shift+P and type \"Shell Command: Install 'code' command in PATH\".)"
                ;;
            esac
        fi
        exit 1
    fi
}

install_wakatime_extension() {
    log "Installing the WakaTime extension in VS Code..."
    if ! code --install-extension WakaTime.vscode-wakatime; then
        error "Failed to install WakaTime extension. Ensure you have network access and VS Code is in PATH."
        exit 1
    fi
    echo "✓ VS Code extension installed successfully"
    echo
}

send_heartbeat() {
    log "Sending test heartbeats to verify setup..."
    for i in {1..2}; do
        log "Sending heartbeat $i/2..."
        CURRENT_TIME=$(date +%s)

        case "$OSTYPE" in
        darwin*) OS_NAME="macOS" ;;
        linux*) OS_NAME="Linux" ;;
        msys* | win32*) OS_NAME="Windows" ;;
        *) OS_NAME="Unix" ;;
        esac

        HEARTBEAT_DATA=$(
            cat <<EOF
{
    "branch": "master",
    "category": "coding",
    "cursorpos": 1,
    "entity": "welcome.txt",
    "type": "file",
    "lineno": 1,
    "lines": 1,
    "project": "welcome",
    "time": $CURRENT_TIME,
    "user_agent": "wakatime/v1.102.1 ($OS_NAME)"
}
EOF
        )

        if [ "$VERBOSE" = true ]; then
            response=$(curl -s -w "%{http_code}" -X POST "https://waka.hackclub.com/api/heartbeat" \
                -H "Authorization: Bearer $BEARER_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$HEARTBEAT_DATA")
            http_code="${response: -3}"
            response_body="${response%???}"
        else
            http_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://waka.hackclub.com/api/heartbeat" \
                -H "Authorization: Bearer $BEARER_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$HEARTBEAT_DATA")
        fi

        if [ "$http_code" -eq 201 ]; then
            log "✓ Heartbeat $i sent successfully"
        else
            error_msg="Heartbeat $i failed with HTTP status $http_code."
            [ "$VERBOSE" = true ] && error_msg+=" Response: $response_body"
            error "$error_msg"
            exit 1
        fi

        [ "$i" -lt 2 ] && sleep 1
    done
    echo
}

main() {
    log "Starting Hackatime setup..."

    check_command "curl"

    if [ -z "${BEARER_TOKEN:-}" ]; then
        error "BEARER_TOKEN environment variable is not set. Please set it before running this script."
        exit 1
    fi

    configure_wakatime
    check_vscode
    install_wakatime_extension
    send_heartbeat

    echo "✨ Hackatime setup completed successfully!"
    echo "You can now return to the setup page for further instructions."
}

main "$@"
