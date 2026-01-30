# Fix App Crash Issue - Package Name Mismatch

## Problem
The app crashes immediately after installation because the package name was changed from "com.mobileapp" to "com.cremio" in build.gradle, but the Kotlin files are still in the old package directory.

## Solution

You need to move the Kotlin files to the new package directory structure:

### Steps:

1. **Create the new package directory:**
   ```bash
   mkdir -p app/android/app/src/main/java/com/cremio
   ```

2. **Move the Kotlin files:**
   ```bash
   # Windows PowerShell
   Move-Item "app\android\app\src\main\java\com\mobileapp\*.kt" "app\android\app\src\main\java\com\cremio\"
   
   # Or manually:
   # Copy MainActivity.kt and MainApplication.kt from:
   # app/android/app/src/main/java/com/mobileapp/
   # to:
   # app/android/app/src/main/java/com/cremio/
   ```

3. **Delete the old directory:**
   ```bash
   Remove-Item "app\android\app\src\main\java\com\mobileapp" -Recurse
   ```

4. **Clean and rebuild:**
   ```bash
   cd app/android
   ./gradlew clean
   cd ../..
   npm run android
   ```

## Alternative: Manual Fix

If the above doesn't work, you can:

1. **Revert the package name change** in `app/android/app/build.gradle`:
   ```gradle
   namespace "com.mobileapp"
   defaultConfig {
       applicationId "com.mobileapp"
   ```

2. **Keep the app name as "Cremio"** in:
   - `app.json`
   - `strings.xml`
   - `Info.plist`

This way the app will still show as "Cremio" but use the existing package structure.

## Current Status

✅ Updated files:
- `app.json` - name: "Cremio"
- `package.json` - name: "Cremio"
- `strings.xml` - app_name: "Cremio"
- `Info.plist` - CFBundleDisplayName: "Cremio"
- `build.gradle` - applicationId: "com.cremio"
- `MainActivity.kt` - package: "com.cremio", component: "Cremio"
- `MainApplication.kt` - package: "com.cremio"
- `AppDelegate.swift` - moduleName: "Cremio"

⚠️ **Action Required:**
- Move Kotlin files to new package directory OR revert package name change
