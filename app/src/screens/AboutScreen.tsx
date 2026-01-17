import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemedLayout from '../components/ThemedLayout';

const AboutScreen: React.FC = () => {
  const { colors, theme } = useTheme();

  const handlePrivacyPolicy = () => {
    // In a real app, this would navigate to privacy policy
  };

  const handleTermsOfService = () => {
    // In a real app, this would navigate to terms of service
  };

  const handleRateApp = () => {
    // In a real app, this would open app store
  };

  return (
    <ThemedLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.appName, { color: colors.text }]}>EcomApp</Text>
        <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0</Text>
      </View>
      
      <View style={[styles.infoCard, { backgroundColor: colors.surface, elevation: 3 }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>
          EcomApp is a premium e-commerce platform specializing in high-quality chocolates and confectionery products. 
          Our mission is to deliver the finest chocolate experience directly to your doorstep.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About Our Company</Text>
        
        <View style={[styles.aboutItem, { backgroundColor: colors.surface, elevation: 2 }]}>
          <Text style={[styles.aboutTitle, { color: colors.text }]}>Our Story</Text>
          <Text style={[styles.aboutContent, { color: colors.textSecondary }]}>
            Founded in 2023, we started with a simple mission to bring premium chocolates to chocolate lovers everywhere.
          </Text>
        </View>
        
        <View style={[styles.aboutItem, { backgroundColor: colors.surface, elevation: 2 }]}>
          <Text style={[styles.aboutTitle, { color: colors.text }]}>Our Mission</Text>
          <Text style={[styles.aboutContent, { color: colors.textSecondary }]}>
            To provide the highest quality chocolates with exceptional service and fast delivery.
          </Text>
        </View>
        
        <View style={[styles.aboutItem, { backgroundColor: colors.surface, elevation: 2 }]}>
          <Text style={[styles.aboutTitle, { color: colors.text }]}>Our Values</Text>
          <Text style={[styles.aboutContent, { color: colors.textSecondary }]}>
            Quality, sustainability, and customer satisfaction are at the core of everything we do.
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>More Information</Text>
        
        <TouchableOpacity 
          style={[styles.option, { backgroundColor: colors.surface, elevation: 2 }]}
          onPress={handlePrivacyPolicy}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.option, { backgroundColor: colors.surface, elevation: 2 }]}
          onPress={handleTermsOfService}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>Terms of Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.option, { backgroundColor: colors.surface, elevation: 2 }]}
          onPress={handleRateApp}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>Rate Our App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.option, { backgroundColor: colors.surface, elevation: 2 }]}
          onPress={() => Linking.openURL('https://www.ecomapp.com')}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>Visit Our Website</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  version: {
    fontSize: 16,
    marginTop: 5,
  },
  infoCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  aboutItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  aboutContent: {
    fontSize: 14,
  },
  option: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AboutScreen;