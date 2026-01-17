import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemedLayout from '../components/ThemedLayout';

/**
 * Demo screen to showcase the ThemedLayout component
 * This demonstrates how to use the layout with various options
 */
const ThemedLayoutDemoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <ThemedLayout>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Themed Layout Demo
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            This screen uses the ThemedLayout component which handles:
          </Text>
          
          <View style={styles.featuresContainer}>
            <Text style={[styles.feature, { color: colors.text }]}>• Automatic status bar theming</Text>
            <Text style={[styles.feature, { color: colors.text }]}>• Safe area handling for notch devices</Text>
            <Text style={[styles.feature, { color: colors.text }]}>• Dynamic background colors</Text>
            <Text style={[styles.feature, { color: colors.text }]}>• Platform-specific behavior</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.themeButton, { backgroundColor: colors.primary }]}
            onPress={toggleTheme}
          >
            <Text style={[styles.themeButtonText, { color: colors.onPrimary }]}>
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            The status bar icons should change color based on the theme
          </Text>
        </View>
      </ScrollView>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  feature: {
    fontSize: 16,
    marginBottom: 8,
  },
  themeButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ThemedLayoutDemoScreen;