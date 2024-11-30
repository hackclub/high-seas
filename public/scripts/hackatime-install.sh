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
    if ! command -v "$1" &>/dev/null; then
        error "$1 is not installed. Please install it before running this script."
        exit 1
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

install_code_command() {
    log "Attempting to install 'code' command..."

    case "$OSTYPE" in
    darwin*)
        VSCODE_APP="/Applications/Visual Studio Code.app"
        if [ -d "$VSCODE_APP" ]; then
            CODE_BIN_PATH="$VSCODE_APP/Contents/Resources/app/bin/code"
            if [ -f "$CODE_BIN_PATH" ]; then
                echo "Choose how to install the 'code' command:"
                echo "1) Create a symbolic link in /usr/local/bin (requires sudo)"
                echo "2) Manually add 'code' to PATH by modifying shell profile"
                read -rp "Enter choice [1 or 2]: " choice

                case "$choice" in
                1)
                    if [ ! -d "/usr/local/bin" ]; then
                        sudo mkdir -p /usr/local/bin
                        log "Created /usr/local/bin directory."
                    fi
                    # Create symlink
                    sudo ln -sf "$CODE_BIN_PATH" /usr/local/bin/code
                    if command -v code &>/dev/null; then
                        log "'code' command installed successfully via symlink."
                    else
                        error "Failed to install 'code' command via symlink."
                        exit 1
                    fi
                    ;;
                2)
                    SHELL_NAME="$(basename "$SHELL")"
                    if [ "$SHELL_NAME" = "zsh" ]; then
                        PROFILE_FILE="$HOME/.zprofile"
                    else
                        PROFILE_FILE="$HOME/.bash_profile"
                    fi

                    # Add the export line to the profile file if not already present
                    EXPORT_LINE='export PATH="$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"'
                    if ! grep -Fxq "$EXPORT_LINE" "$PROFILE_FILE" 2>/dev/null; then
                        cat <<EOF >>"$PROFILE_FILE"
# Add Visual Studio Code (code) to PATH
$EXPORT_LINE
EOF
                        log "Added 'code' to PATH in $PROFILE_FILE."
                        echo "✓ 'code' command added to PATH. Please start a new terminal session or run 'source $PROFILE_FILE' to apply changes."
                    else
                        log "'code' is already in PATH in $PROFILE_FILE."
                    fi
                    ;;
                *)
                    error "Invalid choice. Please run the script again and choose either option 1 or 2."
                    exit 1
                    ;;
                esac

                # First verification
                if ! command -v code &>/dev/null; then
                    log "'code' command not found after primary installation method. Attempting backup method via symlink."

                    # Backup method - create symlink
                    if [ -d "/usr/local/bin" ]; then
                        sudo ln -sf "$CODE_BIN_PATH" /usr/local/bin/code
                        if command -v code &>/dev/null; then
                            log "'code' command installed successfully via symlink (backup method)."
                        else
                            error "Failed to install 'code' command via symlink (backup method)."
                            exit 1
                        fi
                    else
                        error "/usr/local/bin directory does not exist and failed to create symlink as backup."
                        exit 1
                    fi
                else
                    log "'code' command is available."
                fi

            else
                error "'code' binary not found at expected location: $CODE_BIN_PATH."
                error "Please ensure VS Code is installed correctly."
                exit 1
            fi
        else
            error "VS Code is not installed at $VSCODE_APP."
            error "Please install VS Code from https://code.visualstudio.com/Download."
            exit 1
        fi
        ;;
    linux*)
        if [ -f "/usr/share/code/bin/code" ]; then
            VSCODE_BIN="/usr/share/code/bin/code"
        elif [ -f "/usr/bin/code" ]; then
            VSCODE_BIN="/usr/bin/code"
        else
            error "VS Code is not installed in standard locations."
            error "Please install VS Code from https://code.visualstudio.com/Download."
            exit 1
        fi

        sudo ln -sf "$VSCODE_BIN" /usr/local/bin/code
        if command -v code &>/dev/null; then
            log "'code' command installed successfully."
        else
            error "Failed to install 'code' command even after creating symlink."
            error "Please install it manually."
            exit 1
        fi
        ;;
    msys* | win32*)
        error "Automatic installation of 'code' command is not supported on Windows."
        error "(In VS Code, press Ctrl+Shift+P and type \"Shell Command: Install 'code' command in PATH\" and press 'Enter'.)"
        error "Once that's done, restart this script."
        exit 1
        ;;
    *)
        error "Unsupported OS type: $OSTYPE"
        exit 1
        ;;
    esac
}

check_vscode() {
    log "Checking for VS Code installation..."
    if ! command -v code &>/dev/null; then
        log "'code' command not found."
        install_code_command
    else
        log "'code' command is available."
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

install_code_symlink_backup() {
    log "Attempting to install 'code' command via symlink as a backup..."

    VSCODE_APP="/Applications/Visual Studio Code.app"
    CODE_BIN_PATH="$VSCODE_APP/Contents/Resources/app/bin/code"

    if [ -d "$VSCODE_APP" ] && [ -f "$CODE_BIN_PATH" ]; then
        if [ ! -d "/usr/local/bin" ]; then
            sudo mkdir -p /usr/local/bin
            log "Created /usr/local/bin directory."
        fi

        sudo ln -sf "$CODE_BIN_PATH" /usr/local/bin/code
        if command -v code &>/dev/null; then
            log "'code' command installed successfully via symlink (backup method)."
        else
            error "Failed to install 'code' command via symlink (backup method)."
            exit 1
        fi
    else
        error "VS Code is not installed at $VSCODE_APP or 'code' binary not found."
        exit 1
    fi
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

    # Final verification
    if ! command -v code &>/dev/null; then
        log "'code' command not found after initial installation attempts. Trying backup symlink method."
        install_code_symlink_backup
    fi

    # Final Check
    if command -v code &>/dev/null; then
        echo "✓ 'code' command is available in your PATH."
    else
        error "'code' command is still not available in your PATH. Please add it manually or rerun the script."
        exit 1
    fi

    echo "✨ Hackatime setup completed successfully!"
    echo "You can now return to the setup page for further instructions."
}

main "$@"
