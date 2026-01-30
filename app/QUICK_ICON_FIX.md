# Quick Fix: App Icon Not Showing

## The Problem
Your logo.png exists but the APK still shows the default Android icon.

## The Solution (5 Minutes)

### Option 1: Online Tool (Recommended - Easiest)

1. **Visit:** https://www.appicon.co/
2. **Upload:** `app/src/assets/logo.png`
3. **Select:** Android only
4. **Download:** The generated zip file
5. **Extract** and copy all `ic_launcher.png` and `ic_launcher_round.png` files
6. **Replace** files in these folders:
   ```
   app/android/app/src/main/res/mipmap-mdpi/
   app/android/app/src/main/res/mipmap-hdpi/
   app/android/app/src/main/res/mipmap-xhdpi/
   app/android/app/src/main/res/mipmap-xxhdpi/
   app/android/app/src/main/res/mipmap-xxxhdpi/
   ```

7. **Clean and rebuild:**
   ```bash
   cd app/android
   ./gradlew clean
   cd ../..
   npm run android
   ```

8. **Uninstall old app** from device, then install new one

### Option 2: Manual Copy (If you have the logo ready)

If you already have properly sized icons:

1. Copy your logo to all mipmap folders
2. Name them: `ic_launcher.png` and `ic_launcher_round.png`
3. Clean and rebuild (see step 7 above)

## Why It's Not Showing

- Android caches app icons
- Old app must be uninstalled first
- Build must be cleaned before rebuilding
- Icons must be in correct size for each density

## After Fix

The Cremio logo will appear:
- ✅ In app drawer
- ✅ On home screen when installed
- ✅ In app switcher
- ✅ In app settings
