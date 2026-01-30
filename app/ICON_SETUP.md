# App Icon Setup Guide for Cremio

This guide will help you set up the Cremio logo as the app icon for both Android and iOS.

## Prerequisites

You need to have the logo image at: `app/src/assets/logo.png`

## Android Icon Setup

Android requires icons in multiple sizes for different screen densities. You need to replace the icons in these folders:

1. `app/android/app/src/main/res/mipmap-mdpi/` - 48x48 pixels
2. `app/android/app/src/main/res/mipmap-hdpi/` - 72x72 pixels
3. `app/android/app/src/main/res/mipmap-xhdpi/` - 96x96 pixels
4. `app/android/app/src/main/res/mipmap-xxhdpi/` - 144x144 pixels
5. `app/android/app/src/main/res/mipmap-xxxhdpi/` - 192x192 pixels

### Steps:

1. **Resize your logo.png** to the required sizes for each density folder
2. **Replace both files** in each folder:
   - `ic_launcher.png` (square icon)
   - `ic_launcher_round.png` (round icon - same image, but Android will apply round mask)

### Quick Method (Using Online Tools):

1. Go to https://www.appicon.co/ or https://makeappicon.com/
2. Upload your `logo.png` file
3. Download the generated Android icons
4. Copy the generated icons to the respective mipmap folders

### Manual Method:

1. Use an image editor (Photoshop, GIMP, or online tools like Photopea)
2. Resize your logo to each required size
3. Save as PNG with transparent background
4. Copy to the respective folders

## iOS Icon Setup

iOS uses an asset catalog system. You need to update the icons in:

`app/ios/Mobileapp/Images.xcassets/AppIcon.appiconset/`

### Steps:

1. Open Xcode
2. Navigate to `ios/Mobileapp.xcodeproj`
3. Open `Images.xcassets` > `AppIcon`
4. Drag and drop your logo in the required sizes:
   - 20x20 (@2x = 40x40, @3x = 60x60)
   - 29x29 (@2x = 58x58, @3x = 87x87)
   - 40x40 (@2x = 80x80, @3x = 120x120)
   - 60x60 (@2x = 120x120, @3x = 180x180)
   - 1024x1024 (App Store icon)

### Alternative Method (Using Online Tools):

1. Use https://www.appicon.co/ or https://makeappicon.com/
2. Upload your `logo.png` file
3. Download the generated iOS icons
4. Replace the files in `AppIcon.appiconset/` folder

## After Setup

1. **Clean the build:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Rebuild the app:**
   ```bash
   npm run android
   ```

3. **For iOS:**
   ```bash
   cd ios
   pod install
   cd ..
   npm run ios
   ```

## Notes

- Icons should have transparent backgrounds (PNG format)
- Square icons work best (Android will apply round mask automatically)
- Ensure icons are high quality and not pixelated
- The app name "Cremio" has already been configured in the app

## Current Configuration

- **App Name**: Cremio (configured in all necessary files)
- **Package Name**: com.cremio (Android)
- **Logo Location**: app/src/assets/logo.png
