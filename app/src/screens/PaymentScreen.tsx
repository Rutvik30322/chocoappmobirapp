import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import RazorpayCheckout from 'react-native-razorpay';
import { useCart } from '../context/CartContext';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';

const PaymentScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { colors, theme } = useTheme();
  const { items, getTotalPrice, clearCart } = useCart();
  
  const shipping = 248; // INR
  const tax = Math.round(getTotalPrice() * 0.08);
  const total = getTotalPrice() + shipping + tax;

  // Function to handle payment
  const handlePayment = async () => {
    try {
      const options = {
        description: 'Chocolate Purchase',
        image: 'https://your-logo-url.com/your_logo.png', // Replace with your logo URL
        currency: 'INR',
        key: 'rzp_test_1DP5mmOlF5G5ag', // Test key - replace with your actual test key
        amount: total * 100, // Amount in paisa (multiply by 100 to convert to paisa)
        name: 'EcomApp Chocolate Store',
        prefill: {
          email: 'customer@example.com',
          contact: '9999999999',
          name: 'Customer Name'
        },
        theme: { color: colors.primary }
      };

      const data = await RazorpayCheckout.open(options);
      
      // Payment successful
      console.log(data);
      
      // Clear cart after successful payment
      clearCart();
      
      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Payment Successful!',
        text2: 'Your order has been placed successfully.',
        visibilityTime: 3000,
      });
      
      // Navigate to home tabs screen
      navigation.navigate('HomeTabs');
    } catch (error: any) {
      console.log(error);
      
      // Check if it's a user cancellation
      if (error.code === 'payment_cancelled') {
        Toast.show({
          type: 'error',
          text1: 'Payment Cancelled',
          text2: 'Your payment was cancelled.',
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: error.message || 'An error occurred during payment',
          visibilityTime: 2000,
        });
      }
    }
  };

  // Function to handle cash on delivery
  const handleCashOnDelivery = () => {
    setShowCodModal(true);
  };

  // State for COD confirmation modal
  const [showCodModal, setShowCodModal] = useState(false);
  
  // Confirm COD
  const confirmCod = () => {
    // Clear cart after COD order
    clearCart();
    
    Toast.show({
      type: 'success',
      text1: 'Order Placed!',
      text2: 'Your order has been placed successfully with Cash on Delivery.',
      visibilityTime: 3000,
    });
    
    navigation.navigate('HomeTabs');
    setShowCodModal(false);
  };
  
  // Cancel COD
  const cancelCod = () => {
    setShowCodModal(false);
  };
  
  return (
    <ThemedLayout edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>  
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>  
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Options</Text>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Payment Options</Text>
      
      {/* Order Summary */}
      <View style={[styles.summary, { backgroundColor: colors.surface, elevation: 3 }]}>
        <Text style={[styles.summaryTitle, { color: colors.text, fontWeight: 'bold', marginBottom: 15 }]}>
          Order Summary
        </Text>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{getTotalPrice()}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Shipping</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{shipping}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Tax</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{tax}</Text>
        </View>
        
        <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: colors.textSecondary, paddingTop: 10, marginTop: 10 }]}>
          <Text style={[styles.totalLabel, { color: colors.text, fontWeight: 'bold' }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.primary, fontWeight: 'bold' }]}>₹{total}</Text>
        </View>
      </View>
      
      {/* Payment Options */}
      <View style={styles.paymentOptions}>
        <TouchableOpacity 
          style={[styles.paymentOption, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 }]}
          onPress={handlePayment}
        >
          <Text style={[styles.paymentOptionText, { color: colors.primary, fontWeight: 'bold' }]}>
            Pay with Razorpay
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.paymentOption, { backgroundColor: colors.surface, borderColor: colors.textSecondary, borderWidth: 1 }]}
          onPress={handleCashOnDelivery}
        >
          <Text style={[styles.paymentOptionText, { color: colors.text }]}>
            Cash on Delivery
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Security Info */}
      <View style={styles.securityInfo}>
        <Text style={[styles.securityText, { color: colors.textSecondary }]}>
          Your payment details are secured with 256-bit encryption
        </Text>
        <Text style={[styles.securityText, { color: colors.textSecondary, marginTop: 5 }]}>
          Powered by Razorpay
        </Text>
      </View>
      
      </View>
      {/* COD Confirmation Modal */}
      {showCodModal && (
        <View style={styles.codModalOverlay}>
          <View style={[styles.codModalContent, { backgroundColor: colors.surface }]}>  
            <Text style={[styles.codModalTitle, { color: colors.text }]}>Cash on Delivery</Text>
            <Text style={[styles.codModalMessage, { color: colors.text }]}>Are you sure you want to place this order with Cash on Delivery?</Text>
            
            <View style={styles.codModalButtons}>
              <TouchableOpacity 
                style={[styles.codModalCancelButton, { backgroundColor: colors.textSecondary }]}
                onPress={cancelCod}
              >
                <Text style={[styles.codModalButtonText, { color: colors.background }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.codModalConfirmButton, { backgroundColor: colors.primary }]}
                onPress={confirmCod}
              >
                <Text style={[styles.codModalConfirmButtonText, { color: colors.onPrimary }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    textAlign: 'center',
  },
  summary: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 18,
  },
  totalValue: {
    fontSize: 18,
  },
  paymentOptions: {
    marginBottom: 20,
  },
  paymentOption: {
    padding: 18,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  paymentOptionText: {
    fontSize: 16,
  },
  securityInfo: {
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    textAlign: 'center',
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
  codModalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  codModalContent: {
    width: '80%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  codModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  codModalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  codModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codModalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 5,
  },
  codModalConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 5,
  },
  codModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  codModalConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;