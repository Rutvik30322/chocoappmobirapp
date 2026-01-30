# Setup Cremio App Icon - Quick Guide

## Problem
The app icon (logo) is not showing in the APK. You need to replace the default Android icons with your Cremio logo.

## Solution - Use Online Icon Generator (Easiest Method)

### Step 1: Generate Icons
1. Go to **https://www.appicon.co/** or **https://makeappicon.com/**
2. Upload your logo: `app/src/assets/logo.png`
3. Select **Android** platform
4. Download the generated icons

### Step 2: Replace Icons
After downloading, you'll get folders like:
- `android/mipmap-mdpi/`
- `android/mipmap-hdpi/`
- `android/mipmap-xhdpi/`
- `android/mipmap-xxhdpi/`
- `android/mipmap-xxxhdpi/`

**Copy the files to your project:**
- Copy `ic_launcher.png` and `ic_launcher_round.png` from each folder
- Paste them into: `app/android/app/src/main/res/mipmap-*/` (replace existing files)

### Step 3: Clean and Rebuild
```bash
cd app/android
./gradlew clean
cd ../..
npm run android
```

### Step 4: Uninstall Old App
**Important:** Uninstall the old app from your device/emulator first, then install the new one.

## Alternative: Manual Method

If you prefer to do it manually:

1. **Resize your logo.png** to these sizes:
   - `mipmap-mdpi`: 48x48 pixels
   - `mipmap-hdpi`: 72x72 pixels
   - `mipmap-xhdpi`: 96x96 pixels
   - `mipmap-xxhdpi`: 144x144 pixels
   - `mipmap-xxxhdpi`: 192x192 pixels

2. **Save as PNG** with transparent background (if your logo has transparency)

3. **Copy to each folder:**
   - `app/android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
   - `app/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png`
   - (Repeat for all density folders)

4. **Clean and rebuild** (see Step 3 above)

## Current Icon Locations

Your icons need to be in:
- `app/android/app/src/main/res/mipmap-mdpi/`
- `app/android/app/src/main/res/mipmap-hdpi/`
- `app/android/app/src/main/res/mipmap-xhdpi/`
- `app/android/app/src/main/res/mipmap-xxhdpi/`
- `app/android/app/src/main/res/mipmap-xxxhdpi/`

## Notes

- Icons should be **square** (Android will apply round mask automatically)
- Use **PNG format** with transparent background
- Ensure icons are **high quality** and not pixelated
- **Round icons** (`ic_launcher_round.png`) can be the same as square icons - Android applies the mask

## Verification

After setup, the app icon should show:
- ✅ Cremio logo in app drawer
- ✅ Cremio logo on home screen
- ✅ Cremio logo in app switcher
