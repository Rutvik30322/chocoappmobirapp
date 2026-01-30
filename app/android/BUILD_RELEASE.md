# Building Release APK - Windows Path Length Fix

## Problem
Windows has a 260-character path limit that causes React Native release builds to fail with errors like:
```
Filename longer than 260 characters
```

## Solution: Enable Windows Long Path Support

### Method 1: Using the Batch File (Easiest)

1. **Right-click** on `ENABLE_LONG_PATHS.bat`
2. Select **"Run as administrator"**
3. Follow the prompts
4. **Restart your computer**
5. After restart, build the release APK:
   ```powershell
   cd android
   .\gradlew assembleRelease
   ```

### Method 2: Manual Registry Edit

1. Press `Win + R`, type `regedit`, press Enter
2. Navigate to: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem`
3. Find or create `LongPathsEnabled` (DWORD)
4. Set its value to `1`
5. **Restart your computer**
6. Build the release APK

### Method 3: Using PowerShell (Run as Admin)

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

Then restart your computer.

## After Enabling Long Paths

Once you've enabled long paths and restarted:

```powershell
cd android
.\gradlew clean
.\gradlew assembleRelease
```

The release APK will be located at:
```
app/android/app/build/outputs/apk/release/app-release.apk
```

## Alternative: Use Debug APK

If you need an APK immediately without restarting, you can use the debug APK that was already built successfully:
```
app/android/app/build/outputs/apk/debug/app-debug.apk
```

Note: Debug APKs are not optimized for production but work fine for testing.

## Why This Happens

React Native's new architecture uses native C++ code that generates very long file paths during compilation. Windows' default 260-character path limit prevents these files from being created, causing the build to fail.

Enabling long path support allows Windows to handle paths up to 32,767 characters, which resolves this issue.
