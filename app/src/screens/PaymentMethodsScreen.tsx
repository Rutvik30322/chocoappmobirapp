import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';

const PaymentMethodsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();

  const handleAddPaymentMethod = () => {
    Toast.show({
      type: 'info',
      text1: 'Feature Coming Soon',
      text2: 'Payment methods feature will be available soon.',
      visibilityTime: 2000,
    });
  };

  return (
    <ThemedLayout edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>  
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>  
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Methods</Text>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Payment Methods</Text>
      
      <View style={[styles.messageContainer, { backgroundColor: colors.surface, elevation: 3 }]}>
        <Text style={[styles.messageText, { color: colors.text }]}>
          Payment methods management is not available right now.
        </Text>
        <Text style={[styles.messageSubtext, { color: colors.textSecondary }]}>
          We're working on this feature and it will be available soon.
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAddPaymentMethod}
      >
        <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>Add Payment Method</Text>
      </TouchableOpacity>
      
      <View style={styles.paymentMethodsList}>
        <View style={[styles.methodCard, { backgroundColor: colors.surface, elevation: 2 }]}>
          <Text style={[styles.methodTitle, { color: colors.text }]}>Credit/Debit Card</Text>
          <Text style={[styles.methodSubtext, { color: colors.textSecondary }]}>Not set up</Text>
        </View>
        
        <View style={[styles.methodCard, { backgroundColor: colors.surface, elevation: 2 }]}>
          <Text style={[styles.methodTitle, { color: colors.text }]}>UPI</Text>
          <Text style={[styles.methodSubtext, { color: colors.textSecondary }]}>Not set up</Text>
        </View>
        
        <View style={[styles.methodCard, { backgroundColor: colors.surface, elevation: 2 }]}>
          <Text style={[styles.methodTitle, { color: colors.text }]}>Net Banking</Text>
          <Text style={[styles.methodSubtext, { color: colors.textSecondary }]}>Not set up</Text>
        </View>
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
  messageContainer: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
  },
  messageSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentMethodsList: {
    flex: 1,
  },
  methodCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  methodSubtext: {
    fontSize: 14,
    marginTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
});

export default PaymentMethodsScreen;