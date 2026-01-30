# Troubleshooting App Crash Issue

## Problem
App flashes and closes immediately after installation/launch.

## Root Cause
The app name was changed from "Mobileapp" to "Cremio", but there was a mismatch between:
- JavaScript registration (`index.js` uses `app.json` name: "Cremio")
- Native code references (was "Mobileapp", now updated to "Cremio")
- Package name (changed from "com.mobileapp" to "com.cremio")

## Fixes Applied

### ✅ 1. Updated App Name Configuration
- `app.json` - name: "Cremio"
- `package.json` - name: "Cremio"
- `strings.xml` - app_name: "Cremio"
- `Info.plist` - CFBundleDisplayName: "Cremio"

### ✅ 2. Updated Native Code
- `MainActivity.kt` - package: "com.cremio", component: "Cremio"
- `MainApplication.kt` - package: "com.cremio"
- `AppDelegate.swift` - moduleName: "Cremio"
- `build.gradle` - applicationId: "com.cremio"

### ✅ 3. Created New Package Structure
- Created `app/android/app/src/main/java/com/cremio/` directory
- Moved Kotlin files to new package location

### ✅ 4. Added Error Boundary
- Added error handling in `App.tsx` to catch and display errors instead of crashing

## Next Steps to Fix

### Option 1: Clean Build (Recommended)

1. **Delete old package directory:**
   ```bash
   # Windows PowerShell
   Remove-Item "app\android\app\src\main\java\com\mobileapp" -Recurse -Force
   ```

2. **Clean Android build:**
   ```bash
   cd app/android
   ./gradlew clean
   cd ../..
   ```

3. **Clear Metro bundler cache:**
   ```bash
   cd app
   npm start -- --reset-cache
   ```

4. **Rebuild the app:**
   ```bash
   npm run android
   ```

### Option 2: Check Logs

If the app still crashes, check the logs:

```bash
# Android
adb logcat | grep -i "react\|error\|exception"

# Or view full logs
adb logcat > app_logs.txt
```

Look for:
- "Unable to load script"
- "Module not found"
- "Package name mismatch"
- Any red error messages

### Option 3: Verify Configuration

Check that all files are consistent:

1. **Verify app.json:**
   ```json
   {
     "name": "Cremio",
     "displayName": "Cremio"
   }
   ```

2. **Verify MainActivity.kt:**
   ```kotlin
   package com.cremio
   override fun getMainComponentName(): String = "Cremio"
   ```

3. **Verify index.js:**
   ```javascript
   import { name as appName } from './app.json';
   AppRegistry.registerComponent(appName, () => App);
   ```

### Option 4: Revert Package Name (If Issues Persist)

If moving files causes issues, you can revert the package name:

1. **Revert build.gradle:**
   ```gradle
   namespace "com.mobileapp"
   applicationId "com.mobileapp"
   ```

2. **Revert Kotlin files:**
   - Move files back to `com/mobileapp/`
   - Change package back to `com.mobileapp`
   - Change component name to "Cremio" (this is what matters for display)

3. **Keep app name as "Cremio"** in:
   - `app.json`
   - `strings.xml`
   - `Info.plist`

## Common Issues

### Issue: "Unable to load script"
**Solution:** Make sure Metro bundler is running:
```bash
npm start
```

### Issue: "Module not found"
**Solution:** Clear cache and reinstall:
```bash
npm start -- --reset-cache
# Or
rm -rf node_modules
npm install
```

### Issue: "Package name mismatch"
**Solution:** Ensure all package references match:
- `build.gradle` applicationId
- Kotlin file package declarations
- AndroidManifest.xml references

## Testing

After applying fixes:

1. **Uninstall old app** from device/emulator
2. **Clean build:**
   ```bash
   cd app/android
   ./gradlew clean
   ```
3. **Rebuild and install:**
   ```bash
   npm run android
   ```

The app should now:
- Install successfully
- Launch without crashing
- Display "Cremio" as the app name
- Show the splash screen
- Navigate to login screen
