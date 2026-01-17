import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import ThemedStatusBar from './ThemedStatusBar';

interface ThemedLayoutProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  withStatusBar?: boolean;
  statusBarProps?: React.ComponentProps<typeof ThemedStatusBar>;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

/**
 * Reusable layout component that provides themed status bar and safe area handling
 * Works across iOS and Android with proper spacing for notches and home indicators
 */
const ThemedLayout: React.FC<ThemedLayoutProps> = ({
  children,
  style,
  withStatusBar = true,
  statusBarProps,
  edges = ['right', 'left', 'bottom'],
}) => {
  const { colors } = useTheme();

  return (
    <>
      {withStatusBar && <ThemedStatusBar {...statusBarProps} />}
      <SafeAreaView 
        style={[
          { 
            flex: 1, 
            backgroundColor: colors.background 
          },
          style
        ]}
        edges={edges}
      >
        {children}
      </SafeAreaView>
    </>
  );
};

export default ThemedLayout;