# LxNodes Installation Script for Windows
# This script installs the LxNodes package for n8n (WebRequest and WebRequestPro nodes)

Write-Host "Installing LxNodes for n8n..." -ForegroundColor Cyan

# Check if n8n is installed
try {
    $n8nVersion = n8n --version
    Write-Host "Found n8n version $n8nVersion" -ForegroundColor Green
} catch {
    Write-Host "n8n is not installed! Please install n8n first." -ForegroundColor Red
    Write-Host "You can install n8n globally with: npm install n8n -g" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js and npm/pnpm are installed
try {
    $nodeVersion = node --version
    Write-Host "Found Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed! Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Try to use pnpm, fall back to npm
$packageManager = "npm"
try {
    $pnpmVersion = pnpm --version
    Write-Host "Found pnpm $pnpmVersion" -ForegroundColor Green
    $packageManager = "pnpm"
} catch {
    try {
        $npmVersion = npm --version
        Write-Host "Found npm $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "Neither pnpm nor npm is installed! Please install a package manager." -ForegroundColor Red
        exit 1
    }
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
if ($packageManager -eq "pnpm") {
    pnpm install
} else {
    npm install
}

# Build the nodes
Write-Host "Building nodes..." -ForegroundColor Cyan
if ($packageManager -eq "pnpm") {
    pnpm build
} else {
    npm run build
}

# Create n8n custom directory if it doesn't exist
$customDir = "$env:USERPROFILE\.n8n\custom"
if (-not (Test-Path $customDir)) {
    Write-Host "Creating n8n custom directory..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $customDir -Force | Out-Null
}

# Create symbolic link
$currentPath = (Get-Location).Path
$linkPath = "$customDir\n8n-nodes-lx"

# Remove existing link if it exists
if (Test-Path $linkPath) {
    Write-Host "Removing existing installation..." -ForegroundColor Yellow
    Remove-Item -Path $linkPath -Force -Recurse -ErrorAction SilentlyContinue
}

Write-Host "Creating symbolic link..." -ForegroundColor Cyan
try {
    New-Item -ItemType SymbolicLink -Path $linkPath -Target $currentPath -Force | Out-Null
    Write-Host "Symbolic link created successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to create symbolic link. Trying to copy files instead..." -ForegroundColor Yellow
    Copy-Item -Path $currentPath -Destination $linkPath -Recurse -Force
    Write-Host "Files copied successfully!" -ForegroundColor Green
}

Write-Host "`nInstallation completed!" -ForegroundColor Green
Write-Host "Please restart n8n to use the LxNodes package." -ForegroundColor Cyan
Write-Host "You can start n8n with: n8n start" -ForegroundColor Cyan 