# Script to enable Windows Long Path Support and build Release APK
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  React Native Release APK Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# Check if long paths are enabled
$regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
$regName = "LongPathsEnabled"
$longPathsEnabled = $false

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name $regName -ErrorAction SilentlyContinue
    if ($value -and $value.LongPathsEnabled -eq 1) {
        $longPathsEnabled = $true
        Write-Host "✓ Windows Long Path Support is already enabled" -ForegroundColor Green
    }
}

if (-not $longPathsEnabled) {
    Write-Host "⚠ Windows Long Path Support is NOT enabled" -ForegroundColor Yellow
    Write-Host ""
    
    if ($isAdmin) {
        Write-Host "Enabling Windows Long Path Support..." -ForegroundColor Yellow
        try {
            Set-ItemProperty -Path $regPath -Name $regName -Value 1 -Type DWORD -Force
            Write-Host "✓ Long paths enabled successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "⚠ IMPORTANT: You need to RESTART YOUR COMPUTER for changes to take effect." -ForegroundColor Red
            Write-Host "   After restart, run this script again to build the APK." -ForegroundColor Yellow
            Write-Host ""
            $restart = Read-Host "Do you want to restart now? (y/n)"
            if ($restart -eq "y" -or $restart -eq "Y") {
                Restart-Computer -Force
            }
            exit 0
        } catch {
            Write-Host "✗ ERROR: Failed to enable long paths: $_" -ForegroundColor Red
            Write-Host "   Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "✗ ERROR: Administrator privileges required to enable long paths!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please:" -ForegroundColor Yellow
        Write-Host "1. Right-click PowerShell" -ForegroundColor Yellow
        Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Yellow
        Write-Host "3. Run this script again" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Alternatively, you can manually enable it:" -ForegroundColor Yellow
        Write-Host "1. Press Win+R, type 'regedit', press Enter" -ForegroundColor Yellow
        Write-Host "2. Navigate to: HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem" -ForegroundColor Yellow
        Write-Host "3. Set 'LongPathsEnabled' (DWORD) to 1" -ForegroundColor Yellow
        Write-Host "4. Restart your computer" -ForegroundColor Yellow
        exit 1
    }
}

# Long paths are enabled, proceed with build
Write-Host "Building Release APK..." -ForegroundColor Cyan
Write-Host ""

# Navigate to android directory
$androidDir = Join-Path $PSScriptRoot "."
if (-not (Test-Path (Join-Path $androidDir "gradlew.bat"))) {
    Write-Host "✗ ERROR: gradlew.bat not found in $androidDir" -ForegroundColor Red
    exit 1
}

Set-Location $androidDir

# Clean previous build
Write-Host "Cleaning previous build..." -ForegroundColor Yellow
& .\gradlew.bat clean | Out-Null

# Build release APK for arm64-v8a (most common architecture)
Write-Host "Building Release APK (arm64-v8a)..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Yellow
Write-Host ""

$buildResult = & .\gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    $apkPath = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "Release APK Location:" -ForegroundColor Cyan
        Write-Host "  $apkPath" -ForegroundColor White
        Write-Host ""
        Write-Host "APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "You can now install this APK on Android devices!" -ForegroundColor Green
    } else {
        Write-Host "⚠ WARNING: APK file not found at expected location" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ BUILD FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Build output:" -ForegroundColor Yellow
    Write-Host $buildResult
    exit 1
}
