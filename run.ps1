# Vidur Sales OS - PowerShell Runner Script
$Host.UI.RawUI.WindowTitle = "Vidur Sales OS - Runner"
Set-Location -Path $PSScriptRoot

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "              VIDUR SALES OS                      " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
Write-Host "[*] Checking Node.js installation..." -ForegroundColor Yellow
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    Write-Host "[!] Node.js is not installed or not found in PATH!" -ForegroundColor Red
    Write-Host "    Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

$nodeVersion = & node -v
Write-Host "[*] Detected Node.js: $nodeVersion" -ForegroundColor Green

# 2. Check dependencies
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "[*] 'node_modules' not found. Installing dependencies..." -ForegroundColor Yellow
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Dependency installation failed." -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit $LASTEXITCODE
    }
    Write-Host "[*] Dependencies installed successfully." -ForegroundColor Green
} else {
    Write-Host "[*] Dependencies already installed." -ForegroundColor Green
}

# 3. Check and Start Backend Voice API (Port 8000)
Write-Host "[*] Checking Python and Backend Voice API..." -ForegroundColor Yellow
$backendConn = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if (-not $backendConn) {
    Write-Host "[*] Starting Python Voice Agent API Server on http://localhost:8000..." -ForegroundColor Green
    Start-Process -FilePath "python" -ArgumentList "backend\api_server.py" -WindowStyle Minimized
    Start-Sleep -Seconds 2
} else {
    Write-Host "[*] Backend Voice API already running on port 8000." -ForegroundColor Green
}

# 4. Open browser
Write-Host ""
Write-Host "[*] Opening application in browser (http://localhost:3000)..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

# 5. Start Vite Dev Server
Write-Host "[*] Starting Vite development server..." -ForegroundColor Green
Write-Host "    Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host "===================================================" -ForegroundColor Cyan

& npm.cmd run dev
