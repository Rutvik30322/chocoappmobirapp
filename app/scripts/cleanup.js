#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');



try {
  // Stop Gradle daemon
  
  execSync('cd android && gradlew --stop', { stdio: 'inherit' });

  // Clean Android build
  
  const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  execSync(`cd android && ${gradlew} clean`, { stdio: 'inherit' });

  // Remove Android .gradle directory
  
  const androidGradleDir = path.join(__dirname, '..', 'android', '.gradle');
  if (fs.existsSync(androidGradleDir)) {
    execSync(`rd /s /q "${androidGradleDir}"`, { stdio: 'inherit' });
  }

  // Clean iOS build if present
  if (fs.existsSync(path.join(__dirname, '..', 'ios'))) {
    
  }

  // Clean Metro cache
  
  execSync('npx react-native start --reset-cache', { stdio: 'inherit', timeout: 10000 }).catch(() => {
    
  });

  
} catch (error) {
  
}