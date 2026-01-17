#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🏥 Running health check for ChocoDelight app...\n');

const checks = [
  {
    name: '📁 Project Structure',
    check: () => {
      const requiredDirs = [
        'src/context',
        'src/screens',
        'src/navigation',
        'src/utils'
      ];
      
      const missingDirs = requiredDirs.filter(dir => 
        !fs.existsSync(path.join(__dirname, '..', dir))
      );
      
      if (missingDirs.length > 0) {
        return { status: '❌', message: `Missing directories: ${missingDirs.join(', ')}` };
      }
      return { status: '✅', message: 'All required directories present' };
    }
  },
  {
    name: '🔑 Core Files',
    check: () => {
      const requiredFiles = [
        'src/context/ThemeContext.tsx',
        'src/screens/SplashScreen.tsx',
        'src/screens/LoginScreen.tsx',
        'src/screens/HomeScreen.tsx',
        'src/navigation/MainNavigator.tsx',
        'src/utils/dummyData.ts'
      ];
      
      const missingFiles = requiredFiles.filter(file => 
        !fs.existsSync(path.join(__dirname, '..', file))
      );
      
      if (missingFiles.length > 0) {
        return { status: '❌', message: `Missing files: ${missingFiles.join(', ')}` };
      }
      return { status: '✅', message: 'All core files present' };
    }
  },
  {
    name: '🎨 Theme Context',
    check: () => {
      const themeFile = path.join(__dirname, '..', 'src', 'context', 'ThemeContext.tsx');
      if (!fs.existsSync(themeFile)) {
        return { status: '❌', message: 'ThemeContext.tsx not found' };
      }
      
      const content = fs.readFileSync(themeFile, 'utf8');
      if (!content.includes('ThemeProvider') || !content.includes('useTheme')) {
        return { status: '❌', message: 'Theme context implementation incomplete' };
      }
      
      return { status: '✅', message: 'Theme context properly implemented' };
    }
  },
  {
    name: '📱 Navigation Structure',
    check: () => {
      const navFile = path.join(__dirname, '..', 'src', 'navigation', 'MainNavigator.tsx');
      if (!fs.existsSync(navFile)) {
        return { status: '❌', message: 'MainNavigator.tsx not found' };
      }
      
      const content = fs.readFileSync(navFile, 'utf8');
      if (!content.includes('Splash') || !content.includes('Login') || !content.includes('HomeTabs')) {
        return { status: '❌', message: 'Navigation structure incomplete' };
      }
      
      return { status: '✅', message: 'Navigation structure properly configured' };
    }
  },
  {
    name: '🍫 Dummy Data',
    check: () => {
      const dataFile = path.join(__dirname, '..', 'src', 'utils', 'dummyData.ts');
      if (!fs.existsSync(dataFile)) {
        return { status: '❌', message: 'dummyData.ts not found' };
      }
      
      const content = fs.readFileSync(dataFile, 'utf8');
      if (!content.includes('chocolateProducts') || !content.includes('dummyUsers')) {
        return { status: '❌', message: 'Dummy data incomplete' };
      }
      
      return { status: '✅', message: 'Chocolate-related dummy data present' };
    }
  },
  {
    name: '🎨 Screens Implementation',
    check: () => {
      const screens = [
        { name: 'SplashScreen', path: 'src/screens/SplashScreen.tsx' },
        { name: 'LoginScreen', path: 'src/screens/LoginScreen.tsx' },
        { name: 'HomeScreen', path: 'src/screens/HomeScreen.tsx' },
        { name: 'CartScreen', path: 'src/screens/CartScreen.tsx' },
        { name: 'OrdersScreen', path: 'src/screens/OrdersScreen.tsx' },
        { name: 'SettingsScreen', path: 'src/screens/SettingsScreen.tsx' },
        { name: 'ChatbotScreen', path: 'src/screens/ChatbotScreen.tsx' },
        { name: 'ForgotPasswordScreen', path: 'src/screens/ForgotPasswordScreen.tsx' },
        { name: 'SignUpScreen', path: 'src/screens/SignUpScreen.tsx' }
      ];
      
      const missingScreens = screens.filter(screen => 
        !fs.existsSync(path.join(__dirname, '..', screen.path))
      );
      
      if (missingScreens.length > 0) {
        return { status: '❌', message: `Missing screens: ${missingScreens.map(s => s.name).join(', ')}` };
      }
      
      return { status: '✅', message: `${screens.length} screens implemented` };
    }
  }
];

let allPassed = true;

checks.forEach(check => {
  const result = check.check();
  console.log(`${result.status} ${check.name}: ${result.message}`);
  if (result.status === '❌') {
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! The application is ready for testing.');
  console.log('\n💡 Next steps:');
  console.log('   1. Ensure you have sufficient disk space (> 2GB free)');
  console.log('   2. Run: npm run clean');
  console.log('   3. Run: npm run android');
  console.log('   4. Or: npm run ios');
} else {
  console.log('⚠️  Some checks failed. Please review the issues above.');
  process.exit(1);
}