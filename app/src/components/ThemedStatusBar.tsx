import React from 'react';
import { StatusBar, StatusBarProps, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedStatusBarProps extends Omit<StatusBarProps, 'barStyle' | 'backgroundColor'> {
  /**
   * Custom status bar style based on theme
   */
  lightThemeStyle?: 'default' | 'light-content' | 'dark-content';
  darkThemeStyle?: 'default' | 'light-content' | 'dark-content';
  /**
   * Custom background color for Android status bar
   */
  backgroundColor?: string;
}

/**
 * Reusable StatusBar component that automatically adapts to the current theme
 * Handles both light and dark themes with appropriate bar styles
 */
const ThemedStatusBar: React.FC<ThemedStatusBarProps> = ({
  lightThemeStyle = 'dark-content',
  darkThemeStyle = 'light-content',
  backgroundColor,
  ...props
}) => {
  const { theme, colors } = useTheme();

  // Determine bar style based on current theme
  const barStyle = theme === 'light' ? lightThemeStyle : darkThemeStyle;
  
  // Determine background color for Android
  const statusBarBackgroundColor = backgroundColor || 
    (Platform.OS === 'android' ? colors.surface : colors.background);

  return (
    <StatusBar
      barStyle={barStyle}
      backgroundColor={statusBarBackgroundColor}
      translucent={false}
      {...props}
    />
  );
};

export default ThemedStatusBar;