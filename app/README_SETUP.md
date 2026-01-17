# ChocoDelight - E-commerce Mobile App Setup Guide

## Prerequisites

Before running the application, ensure you have:

- Node.js (v16 or higher)
- Java Development Kit (JDK 11 or higher)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- React Native CLI installed globally

## Installation Steps

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Mobileapp
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### For Android:

1. Make sure you have an Android emulator running or a physical device connected
2. Run the application:
```bash
npm run android
```

### For iOS:

1. Navigate to the iOS directory and install pods:
```bash
cd ios && pod install && cd ..
```
2. Run the application:
```bash
npm run ios
```

## Troubleshooting Build Issues

### If you encounter disk space issues during build:

1. Clean the project:
```bash
npm run clean
```

2. Or manually clean:
```bash
cd android
./gradlew clean
cd ..
```

3. For persistent issues, increase available disk space on your system.

### If you encounter Gradle cache issues:

1. Stop Gradle daemons:
```bash
cd android
./gradlew --stop
```

2. Clean build:
```bash
./gradlew clean
```

## Available Scripts

- `npm start` - Start the Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run clean` - Clean build artifacts and caches
- `npm run build:android` - Clean and build for Android

## Features

- 🌗 Dark/Light theme toggle
- 🚀 Splash screen with 5-second delay
- 🔐 Login with mobile number and password
- 🏠 Home screen with product listings
- 🛒 Shopping cart functionality
- 📦 Order history tracking
- ⚙️ Settings screen
- 💬 Chatbot assistant
- 🛍️ Chocolate-focused e-commerce experience

## Demo Credentials

For testing purposes, use these demo credentials:
- Mobile: 1234567890, Password: password123
- Mobile: 9876543210, Password: chocolate
- Mobile: 5551234567, Password: sweet123

## Architecture

The application follows a modular architecture:

```
src/
├── context/
│   └── ThemeContext.tsx (Theme management)
├── screens/
│   ├── SplashScreen.tsx
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── CartScreen.tsx
│   ├── OrdersScreen.tsx
│   ├── SettingsScreen.tsx
│   └── ChatbotScreen.tsx
├── navigation/
│   ├── MainNavigator.tsx
│   └── BottomTabNavigator.tsx
└── utils/
    └── dummyData.ts (Sample chocolate products)
```

## Dependencies

- React Native (v0.83.1)
- React Navigation (stack and bottom-tabs)
- React Native Paper (theming)
- React Native Vector Icons
- React Native Gesture Handler
- React Native Safe Area Context
- React Native Screens

## Supported Platforms

- Android (API level 21+)
- iOS (iOS 11+)