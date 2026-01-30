# Move Project to Shorter Path

## Why Move?

Even with Windows long paths enabled, `ninja.exe` (the CMake build tool) doesn't support long paths. The only reliable solution is to move your project to a shorter path.

## Current Path
```
D:\Bss_Prpjects\Mern Pro\chocoapp-main\chocoapp-main
```
Length: ~70 characters

## Recommended New Path
```
D:\RN\chocoapp
```
Length: ~15 characters

This will reduce the total path length by ~55 characters, which should be enough to build successfully.

## How to Move

### Option 1: Manual Move (Recommended)

1. **Close all programs** using the project (VS Code, terminals, etc.)

2. **Move the entire project folder:**
   ```powershell
   # Create new directory
   New-Item -ItemType Directory -Path "D:\RN" -Force
   
   # Move the project
   Move-Item -Path "D:\Bss_Prpjects\Mern Pro\chocoapp-main\chocoapp-main" -Destination "D:\RN\chocoapp"
   ```

3. **Update any shortcuts or workspace files** that reference the old path

4. **Open the project from the new location:**
   ```powershell
   cd D:\RN\chocoapp\app\android
   .\gradlew clean assembleRelease
   ```

### Option 2: Copy Instead of Move

If you want to keep the original:
```powershell
# Create new directory
New-Item -ItemType Directory -Path "D:\RN" -Force

# Copy the project
Copy-Item -Path "D:\Bss_Prpjects\Mern Pro\chocoapp-main\chocoapp-main" -Destination "D:\RN\chocoapp" -Recurse
```

## After Moving

1. Navigate to the new location:
   ```powershell
   cd D:\RN\chocoapp\app\android
   ```

2. Clean and build:
   ```powershell
   .\gradlew clean
   .\gradlew assembleRelease
   ```

3. The release APK will be at:
   ```
   D:\RN\chocoapp\app\android\app\build\outputs\apk\release\app-release.apk
   ```

## Alternative: Use Debug APK

If you don't want to move the project right now, you can use the debug APK that was already built successfully:

**Location**: `D:\Bss_Prpjects\Mern Pro\chocoapp-main\chocoapp-main\app\android\app\build\outputs\apk\debug\app-debug.apk`

This works for testing, but is not optimized for production.
