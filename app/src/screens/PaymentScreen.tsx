import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import RazorpayCheckout from 'react-native-razorpay';
import { useCart } from '../context/CartContext';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';
import Logo from '../components/Logo';
import addressService, { Address } from '../services/addressService';
import orderService from '../services/orderService';

const PaymentScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { colors, theme } = useTheme();
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  
  const shipping = 248; // INR
  const tax = Math.round(getTotalPrice() * 0.08);
  const total = getTotalPrice() + shipping + tax;

  // Load default address on mount
  useEffect(() => {
    loadDefaultAddress();
  }, []);

  // Reload address when screen comes into focus (e.g., after adding/editing address)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDefaultAddress();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadDefaultAddress = async () => {
    try {
      setLoadingAddress(true);
      const response = await addressService.getAddresses();
      if (response.data && response.data.addresses) {
        const addresses: Address[] = response.data.addresses;
        const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0];
        setDefaultAddress(defaultAddr || null);
        
        if (!defaultAddr) {
          Toast.show({
            type: 'error',
            text1: 'No Address Found',
            text2: 'Please add a delivery address before placing an order',
            visibilityTime: 3000,
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading address:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load address',
        visibilityTime: 2000,
      });
    } finally {
      setLoadingAddress(false);
    }
  };

  const createOrder = async (paymentMethod: string, paymentResult?: any) => {
    if (!defaultAddress) {
      Toast.show({
        type: 'error',
        text1: 'No Address',
        text2: 'Please add a delivery address',
        visibilityTime: 2000,
      });
      navigation.navigate('DeliveryAddress');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare order items
      const orderItems = items.map(item => ({
        product: item.id, // item.id is the product ID
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      }));

      // Prepare shipping address
      const shippingAddress = {
        addressLine: defaultAddress.addressLine,
        city: defaultAddress.city,
        state: defaultAddress.state,
        pincode: defaultAddress.pincode,
      };

      // Create order
      const orderData = {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: getTotalPrice(),
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
      };

      const response = await orderService.createOrder(orderData);
      
      // If payment was successful, update order to paid
      if (paymentMethod !== 'COD' && paymentResult) {
        await orderService.updateOrderToPaid(response.data.order._id, paymentResult);
      }

      // Clear cart (both local and backend)
      // Note: Backend cart is already cleared in orderController, but we clear local cart here
      await clearCart();
      
      Toast.show({
        type: 'success',
        text1: 'Order Placed!',
        text2: 'Your order has been placed successfully.',
        visibilityTime: 3000,
      });
      
      // Navigate to orders screen
      navigation.navigate('HomeTabs', { screen: 'Orders' });
    } catch (error: any) {
      console.error('Error creating order:', error);
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: error.message || 'Failed to place order',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle payment
  const handlePayment = async () => {
    if (!defaultAddress) {
      Toast.show({
        type: 'error',
        text1: 'No Address',
        text2: 'Please add a delivery address',
        visibilityTime: 2000,
      });
      navigation.navigate('DeliveryAddress');
      return;
    }

    try {
      const options = {
        description: 'Chocolate Purchase',
        image: 'https://your-logo-url.com/your_logo.png', // Replace with your logo URL
        currency: 'INR',
        key: 'rzp_test_S1IoKwDjSAj21I', // Test key - replace with your actual test key
        amount: total * 100, // Amount in paisa (multiply by 100 to convert to paisa)
        name: 'EcomApp Chocolate Store',
        prefill: {
          email: 'customer@example.com',
          contact: defaultAddress.phone || '9999999999',
          name: defaultAddress.name || 'Customer Name'
        },
        theme: { color: colors.primary }
      };

      const data = await RazorpayCheckout.open(options);
      
      // Payment successful - create order
      await createOrder('Razorpay', {
        id: data.razorpay_payment_id,
        status: 'success',
        updateTime: new Date().toISOString(),
        emailAddress: data.razorpay_email || '',
      });
    } catch (error: any) {
    
      
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
  const confirmCod = async () => {
    if (!defaultAddress) {
      Toast.show({
        type: 'error',
        text1: 'No Address',
        text2: 'Please add a delivery address',
        visibilityTime: 2000,
      });
      setShowCodModal(false);
      navigation.navigate('DeliveryAddress');
      return;
    }

    setShowCodModal(false);
    await createOrder('COD');
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
        <View style={styles.headerTitleContainer}>
          <Logo size={30} style={styles.headerLogo} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Options</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Payment Options</Text>
      
      {/* Address Display */}
      {loadingAddress ? (
        <View style={[styles.addressCard, { backgroundColor: colors.surface, padding: 15 }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.addressText, { color: colors.textSecondary, marginTop: 10 }]}>
            Loading address...
          </Text>
        </View>
      ) : defaultAddress ? (
        <View style={[styles.addressCard, { backgroundColor: colors.surface, elevation: 2 }]}>
          <Text style={[styles.addressTitle, { color: colors.text, fontWeight: 'bold', marginBottom: 8 }]}>
            Delivery Address
          </Text>
          <Text style={[styles.addressText, { color: colors.text }]}>
            {defaultAddress.addressLine}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
          </Text>
          {defaultAddress.phone && (
            <Text style={[styles.addressPhone, { color: colors.textSecondary, marginTop: 5 }]}>
              📞 {defaultAddress.phone}
            </Text>
          )}
          <TouchableOpacity 
            onPress={() => navigation.navigate('DeliveryAddress')}
            style={{ marginTop: 10 }}
          >
            <Text style={[styles.changeAddressText, { color: colors.primary }]}>
              Change Address
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.addressCard, { backgroundColor: colors.error + '20', padding: 15 }]}>
          <Text style={[styles.addressText, { color: colors.error, fontWeight: 'bold' }]}>
            ⚠️ No delivery address found
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('DeliveryAddress')}
            style={{ marginTop: 10 }}
          >
            <Text style={[styles.changeAddressText, { color: colors.primary }]}>
              Add Address
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
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
          style={[
            styles.paymentOption, 
            { 
              backgroundColor: colors.surface, 
              borderColor: colors.primary, 
              borderWidth: 1,
              opacity: (!defaultAddress || loading) ? 0.5 : 1
            }
          ]}
          onPress={handlePayment}
          disabled={!defaultAddress || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.paymentOptionText, { color: colors.primary, fontWeight: 'bold' }]}>
              Pay with Razorpay
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.paymentOption, 
            { 
              backgroundColor: colors.surface, 
              borderColor: colors.textSecondary, 
              borderWidth: 1,
              opacity: (!defaultAddress || loading) ? 0.5 : 1
            }
          ]}
          onPress={handleCashOnDelivery}
          disabled={!defaultAddress || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={[styles.paymentOptionText, { color: colors.text }]}>
              Cash on Delivery
            </Text>
          )}
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerLogo: {
    marginRight: 8,
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
  addressCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  addressTitle: {
    fontSize: 16,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 12,
  },
  changeAddressText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PaymentScreen;