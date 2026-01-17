import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemedLayout from '../components/ThemedLayout';

const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();

  useEffect(() => {
    // Navigate to login screen after 5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ThemedLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* App Logo/Icon */}
        <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.logoText, { color: colors.primary }]}>🍫</Text>
        </View>
        
        {/* App Title */}
        <Text style={[styles.title, { color: colors.text }]}>ChocoDelight</Text>
        
        {/* Tagline */}
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Premium Chocolate Experience
        </Text>
        
        {/* Loading indicator */}
        <ActivityIndicator 
          size="large" 
          color={colors.primary} 
          style={styles.loader}
        />
      </View>
      
      {/* Footer */}
      <Text style={[styles.footer, { color: colors.textSecondary }]}>
        Made with ❤️ for chocolate lovers
      </Text>
    </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoText: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  footer: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default SplashScreen;