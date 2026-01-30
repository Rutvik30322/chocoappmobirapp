@echo off
REM This script enables Windows Long Path Support
REM Must be run as Administrator

echo ========================================
echo  Enable Windows Long Path Support
echo ========================================
echo.

REM Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Please:
    echo 1. Right-click this file
    echo 2. Select "Run as administrator"
    echo 3. Run it again
    echo.
    pause
    exit /b 1
)

echo Enabling Windows Long Path Support...
echo.

REM Enable long paths in registry
reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f >nul 2>&1

if %errorLevel% equ 0 (
    echo.
    echo ========================================
    echo  SUCCESS!
    echo ========================================
    echo.
    echo Long paths have been enabled.
    echo.
    echo IMPORTANT: You MUST RESTART YOUR COMPUTER
    echo            for the changes to take effect.
    echo.
    echo After restarting, you can build the release APK by running:
    echo   cd android
    echo   .\gradlew assembleRelease
    echo.
) else (
    echo.
    echo ERROR: Failed to enable long paths.
    echo Please check registry permissions.
    echo.
)

pause
