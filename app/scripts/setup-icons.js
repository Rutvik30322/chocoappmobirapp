/**
 * Icon Setup Helper Script
 * 
 * This script helps you understand what needs to be done to set up the app icon.
 * 
 * To actually generate the icons, use an online tool:
 * 1. Go to https://www.appicon.co/
 * 2. Upload app/src/assets/logo.png
 * 3. Download Android icons
 * 4. Copy to the folders listed below
 */

const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../src/assets/logo.png');
const androidResPath = path.join(__dirname, '../android/app/src/main/res');

const mipmapFolders = [
  'mipmap-mdpi',    // 48x48
  'mipmap-hdpi',    // 72x72
  'mipmap-xhdpi',   // 96x96
  'mipmap-xxhdpi',  // 144x144
  'mipmap-xxxhdpi', // 192x192
];

console.log('📱 Cremio App Icon Setup Helper\n');
console.log('='.repeat(50));

// Check if logo exists
if (fs.existsSync(logoPath)) {
  console.log('✅ Logo file found:', logoPath);
} else {
  console.log('❌ Logo file NOT found:', logoPath);
  console.log('   Please ensure logo.png exists at this location.');
  process.exit(1);
}

// Check mipmap folders
console.log('\n📁 Checking mipmap folders:');
mipmapFolders.forEach(folder => {
  const folderPath = path.join(androidResPath, folder);
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath);
    const hasLauncher = files.includes('ic_launcher.png');
    const hasRound = files.includes('ic_launcher_round.png');
    
    if (hasLauncher && hasRound) {
      console.log(`   ✅ ${folder}/ - Icons exist`);
    } else {
      console.log(`   ⚠️  ${folder}/ - Missing icons`);
    }
  } else {
    console.log(`   ❌ ${folder}/ - Folder not found`);
  }
});

console.log('\n📋 Next Steps:');
console.log('1. Go to: https://www.appicon.co/');
console.log('2. Upload:', logoPath);
console.log('3. Select: Android platform');
console.log('4. Download the generated icons');
console.log('5. Copy ic_launcher.png and ic_launcher_round.png to each mipmap folder');
console.log('6. Run: cd android && ./gradlew clean && cd .. && npm run android');
console.log('7. Uninstall old app from device, then install new one\n');

console.log('📂 Icon locations:');
mipmapFolders.forEach(folder => {
  console.log(`   - ${path.join(androidResPath, folder)}/ic_launcher.png`);
  console.log(`   - ${path.join(androidResPath, folder)}/ic_launcher_round.png`);
});

console.log('\n' + '='.repeat(50));
