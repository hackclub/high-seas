Write-Host "Starting Hackatime setup..."

# Check if BEARER_TOKEN is set
if (-not $env:BEARER_TOKEN) {
    Write-Host "Error: BEARER_TOKEN environment variable is not set"
    exit 1
}

# Step 1: Add settings to the WakaTime config file
$bearerToken = $env:BEARER_TOKEN
$configContent = @"
[settings]
api_url = https://waka.hackclub.com/api
api_key = $bearerToken
"@
$configPath = "$HOME\.wakatime.cfg"

# Create or update the WakaTime config file
Write-Host "Configuring WakaTime settings..."
Set-Content -Path $configPath -Value $configContent
Write-Host "$([char]9830) Wrote config to $configPath"
Write-Host ""


# Step 2: Check if VS Code is installed
Write-Host "Checking for VS Code installation..."
if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
    Write-Host "Error: VS Code is not installed. You can install it at https://code.visualstudio.com/Download"
    Write-Host "(If you're certain it is, open vscode, hit Ctrl+Shift+P and type `"Shell Command: Install 'code' command in PATH`") then press enter. After doing that come back here, close and reopen this powershell window and rerun the setup command"
    exit 1
}

# Install the WakaTime extension in VS Code
Write-Host "Installing the WakaTime extension in VS Code..."
try {
    & code --install-extension WakaTime.vscode-wakatime
    Write-Host "$([char]9830) VS Code extension installed successfully"
} catch {
    Write-Host "Error: Failed to install WakaTime extension"
    exit 1
}
Write-Host ""

Write-Host "Sending test heartbeats to verify setup..."
# Step 3: Run the curl command twice with a conditional sleep
for ($i = 1; $i -le 2; $i++) {
    Write-Host "Sending heartbeat $i/2..."
    
    $time = (Get-Date -UFormat %s0000)
    $jsonData = @{
        branch = "master"
        category = "coding"
        cursorpos = 1
        entity = "welcome.txt"
        type = "file"
        lineno = 1
        lines = 1
        project = "welcome"
        time = $time
        user_agent = "wakatime/v1.102.1 (windows) go1.22.5 vscode/1.94.2 vscode-wakatime/24.6.2"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "https://waka.hackclub.com/api/heartbeat" `
                                      -Method Post `
                                      -Headers @{
                                          Authorization = "Bearer $bearerToken"
                                          "Content-Type" = "application/json"
                                      } `
                                      -Body $jsonData
        # Success message for each heartbeat
        Write-Host "$([char]9830) Heartbeat $i sent successfully"
    } catch {
        Write-Host "Error: Heartbeat $i failed with HTTP status $($_.Exception.Response.StatusCode)"
        exit 1
    }

    # Sleep for 1 second only if this is not the last iteration
    if ($i -lt 2) {
        Start-Sleep -Seconds 1
    }
}

Write-Host ""
Write-Host "$([char]8730) Hackatime setup completed successfully!"
Write-Host "You can now return to the setup page for further instructions."