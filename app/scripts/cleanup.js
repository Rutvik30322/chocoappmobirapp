#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up project for build...');

try {
  // Stop Gradle daemon
  console.log('🛑 Stopping Gradle daemon...');
  execSync('cd android && gradlew --stop', { stdio: 'inherit' });

  // Clean Android build
  console.log('🧹 Cleaning Android build...');
  const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  execSync(`cd android && ${gradlew} clean`, { stdio: 'inherit' });

  // Remove Android .gradle directory
  console.log('🗑️ Removing Android .gradle cache...');
  const androidGradleDir = path.join(__dirname, '..', 'android', '.gradle');
  if (fs.existsSync(androidGradleDir)) {
    execSync(`rd /s /q "${androidGradleDir}"`, { stdio: 'inherit' });
  }

  // Clean iOS build if present
  if (fs.existsSync(path.join(__dirname, '..', 'ios'))) {
    console.log('(iOS cleanup would happen here if needed)');
  }

  // Clean Metro cache
  console.log('🧹 Cleaning Metro cache...');
  execSync('npx react-native start --reset-cache', { stdio: 'inherit', timeout: 10000 }).catch(() => {
    console.log('Metro reset-cache completed or timed out (which is OK)');
  });

  console.log('✅ Cleanup completed!');
  console.log('💡 You can now try running: npx react-native run-android');
} catch (error) {
  console.error('❌ Error during cleanup:', error.message);
}