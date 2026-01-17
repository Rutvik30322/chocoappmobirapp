import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemedLayout from '../components/ThemedLayout';

const HelpSupportScreen: React.FC = () => {
  const { colors, theme } = useTheme();

  const handleContactSupport = () => {
    // In a real app, this would open email or call
    Linking.openURL('mailto:support@ecomapp.com');
  };

  const handleFAQ = () => {
    // In a real app, this would navigate to FAQ screen
  };

  const handleTerms = () => {
    // In a real app, this would navigate to terms screen
  };

  const handlePrivacy = () => {
    // In a real app, this would navigate to privacy policy screen
  };

  return (
    <ThemedLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Help & Support</Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
        
        <TouchableOpacity 
          style={[styles.option, { backgroundColor: colors.surface, elevation: 2 }]}
          onPress={handleContactSupport}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>Email Support</Text>
          <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
            support@ecomapp.com
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.option, { backgroundColor: colors.surface, elevation: 2 }]}
          onPress={() => Linking.openURL('tel:+91-9876543210')}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>Phone Support</Text>
          <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
            +91-9876543210
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Help Resources</Text>
        
        <TouchableOpacity 
          style={[styles.option, { backgroundColor: colors.surface, elevation: 2 }]}
          onPress={handleFAQ}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>Frequently Asked Questions</Text>
          <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
            Get answers to common questions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.option, { backgroundColor: colors.surface, elevation: 2 }]}
          onPress={handleTerms}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>Terms & Conditions</Text>
          <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
            Our terms and conditions
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.option, { backgroundColor: colors.surface, elevation: 2 }]}
          onPress={handlePrivacy}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
            How we protect your data
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.contactInfo, { backgroundColor: colors.surface, elevation: 2 }]}>
        <Text style={[styles.contactTitle, { color: colors.text }]}>Business Hours</Text>
        <Text style={[styles.contactText, { color: colors.text }]}>Monday - Friday: 9:00 AM - 6:00 PM</Text>
        <Text style={[styles.contactText, { color: colors.text }]}>Saturday: 10:00 AM - 4:00 PM</Text>
        <Text style={[styles.contactText, { color: colors.text }]}>Sunday: Closed</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  optionSubtext: {
    fontSize: 14,
    marginTop: 5,
  },
  contactInfo: {
    padding: 15,
    borderRadius: 10,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default HelpSupportScreen;