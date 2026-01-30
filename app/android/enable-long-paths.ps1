# Script to enable Windows Long Path Support
# Run this script as Administrator

Write-Host "Enabling Windows Long Path Support..." -ForegroundColor Yellow
Write-Host "This requires Administrator privileges." -ForegroundColor Yellow

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator', then run this script again." -ForegroundColor Yellow
    exit 1
}

try {
    # Enable long paths in registry
    $regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
    $regName = "LongPathsEnabled"
    $regValue = 1
    
    # Check if the key exists
    if (Test-Path $regPath) {
        Set-ItemProperty -Path $regPath -Name $regName -Value $regValue -Type DWORD -Force
        Write-Host "Long paths enabled successfully!" -ForegroundColor Green
        Write-Host "You need to RESTART YOUR COMPUTER for the changes to take effect." -ForegroundColor Yellow
        Write-Host "After restart, you can build the release APK." -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: Registry path not found!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Failed to enable long paths: $_" -ForegroundColor Red
    exit 1
}
