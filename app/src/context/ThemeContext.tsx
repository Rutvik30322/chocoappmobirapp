import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName, StatusBar, Platform } from 'react-native';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    onPrimary: string;
    onSecondary: string;
    onBackground: string;
    onSurface: string;
  };
}

const lightColors = {
  primary: '#6B46C1', // Purple
  secondary: '#F59E0B', // Amber
  background: '#F9FAFB', // Light gray
  surface: '#FFFFFF', // White
  text: '#1F2937', // Dark gray
  textSecondary: '#6B7280', // Medium gray
  error: '#EF4444', // Red
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#1F2937',
  onSurface: '#1F2937',
};

const darkColors = {
  primary: '#8B5CF6', // Lighter purple
  secondary: '#FBBF24', // Lighter amber
  background: '#111827', // Dark
  surface: '#1F2937', // Darker gray
  text: '#F9FAFB', // Light
  textSecondary: '#D1D5DB', // Lighter gray
  error: '#F87171', // Light red
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#F9FAFB',
  onSurface: '#F9FAFB',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Initialize theme based on system preference
  useEffect(() => {
    const colorScheme = Appearance.getColorScheme();
    setTheme((colorScheme === 'dark' || colorScheme === 'light') ? colorScheme : 'light');
    
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme((colorScheme === 'dark' || colorScheme === 'light') ? colorScheme : 'light');
    });
    
    return () => subscription?.remove();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  // Update status bar based on theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.surface);
      StatusBar.setBarStyle(theme === 'light' ? 'dark-content' : 'light-content');
    } else {
      StatusBar.setBarStyle(theme === 'light' ? 'dark-content' : 'light-content');
    }
    
    // Set status bar translucent and hidden for iOS if needed
    StatusBar.setTranslucent(false);
  }, [theme, colors]);

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};