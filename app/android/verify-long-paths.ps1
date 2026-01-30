# Verify if Windows Long Path Support is active
Write-Host "Checking Windows Long Path Support..." -ForegroundColor Cyan
Write-Host ""

# Check registry setting
$regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
$regName = "LongPathsEnabled"

if (Test-Path $regPath) {
    $value = Get-ItemProperty -Path $regPath -Name $regName -ErrorAction SilentlyContinue
    
    if ($value -and $value.LongPathsEnabled -eq 1) {
        Write-Host "✓ Registry Setting: ENABLED" -ForegroundColor Green
    } else {
        Write-Host "✗ Registry Setting: DISABLED" -ForegroundColor Red
        Write-Host "  Run ENABLE_LONG_PATHS.bat as Administrator" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✗ Registry path not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test if long paths actually work (requires restart if just enabled)
Write-Host "Testing if long paths are active in current session..." -ForegroundColor Cyan

$testPath = "D:\Bss_Prpjects\Mern Pro\chocoapp-main\chocoapp-main\app\android\app\.cxx\RelWithDebInfo\5c576o3x\arm64-v8a\safeareacontext_autolinked_build\CMakeFiles\react_codegen_safeareacontext.dir\D_\Bss_Prpjects\Mern_Pro\chocoapp-main\chocoapp-main\app\node_modules\react-native-safe-area-context\common\cpp\react\renderer\components\safeareacontext\RNCSafeAreaViewShadowNode.cpp.o"

try {
    # Try to create a test file with a long path
    $testDir = Split-Path $testPath -Parent
    if (-not (Test-Path $testDir)) {
        New-Item -ItemType Directory -Path $testDir -Force | Out-Null
    }
    
    $testFile = New-Item -ItemType File -Path $testPath -Force -ErrorAction Stop
    Remove-Item $testFile -Force
    Write-Host "✓ Long paths are ACTIVE - You can build now!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Run: .\gradlew assembleRelease" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Long paths are NOT ACTIVE in current session" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠ ACTION REQUIRED:" -ForegroundColor Yellow
    Write-Host "   You MUST RESTART your computer for long paths to work." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   The registry setting is enabled, but Windows only loads" -ForegroundColor Yellow
    Write-Host "   this setting at boot time. After restart, the build will work." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   After restart, run this script again to verify." -ForegroundColor Cyan
}
