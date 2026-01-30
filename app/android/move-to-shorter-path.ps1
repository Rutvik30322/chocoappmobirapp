# Script to move project to a shorter path to fix build issues
# Run this script from the project root or android directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Move Project to Shorter Path" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$currentPath = "D:\Bss_Prpjects\Mern Pro\chocoapp-main\chocoapp-main"
$newPath = "D:\RN\chocoapp"

Write-Host "Current path: $currentPath" -ForegroundColor Yellow
Write-Host "Path length: $($currentPath.Length) characters" -ForegroundColor Yellow
Write-Host ""
Write-Host "New path: $newPath" -ForegroundColor Green
Write-Host "Path length: $($newPath.Length) characters" -ForegroundColor Green
Write-Host "Savings: $($currentPath.Length - $newPath.Length) characters" -ForegroundColor Green
Write-Host ""

# Check if current path exists
if (-not (Test-Path $currentPath)) {
    Write-Host "ERROR: Current path not found: $currentPath" -ForegroundColor Red
    exit 1
}

# Check if new path already exists
if (Test-Path $newPath) {
    Write-Host "WARNING: New path already exists: $newPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Cancelled." -ForegroundColor Yellow
        exit 0
    }
    Remove-Item -Path $newPath -Recurse -Force
}

Write-Host "This will MOVE (not copy) your project." -ForegroundColor Yellow
Write-Host "Make sure all programs using this project are closed!" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue? (y/n)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Creating directory..." -ForegroundColor Cyan
$newParent = Split-Path $newPath -Parent
if (-not (Test-Path $newParent)) {
    New-Item -ItemType Directory -Path $newParent -Force | Out-Null
}

Write-Host "Moving project..." -ForegroundColor Cyan
Write-Host "This may take a few minutes depending on project size..." -ForegroundColor Yellow

try {
    Move-Item -Path $currentPath -Destination $newPath -Force
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Project moved successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "New location: $newPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open your project from: $newPath" -ForegroundColor White
    Write-Host "2. Navigate to: $newPath\app\android" -ForegroundColor White
    Write-Host "3. Build: .\gradlew assembleRelease" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to move project: $_" -ForegroundColor Red
    Write-Host "You may need to run this script as Administrator" -ForegroundColor Yellow
    exit 1
}
