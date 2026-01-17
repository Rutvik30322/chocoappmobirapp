import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { chocolateProducts } from '../utils/dummyData';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';

const OrderDetailScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { colors, theme } = useTheme();
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Import the dummy data
  const { dummyOrders } = require('../utils/dummyData');
  
  // Find the order from dummy data
  const order = dummyOrders.find((o: any) => o.id === orderId);
  
  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Order not found</Text>
      </View>
    );
  }
  
  // Get order products
  const orderProducts = order.products.map((productId: string) => 
    chocolateProducts.find((p: any) => p.id === productId)
  ).filter(Boolean);
  
  const shipping = 248; // INR
  const tax = Math.round(order.total * 0.08);
  const calculatedTotal = orderProducts.reduce((sum: number, product: any) => sum + product.price, 0) + shipping;
  
  // Render individual order item
  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={[styles.orderItem, { backgroundColor: colors.surface, elevation: 2 }]}>
      <View style={styles.itemImageContainer}>
        <Text style={styles.itemImage}>{item.image}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{item.price}</Text>
      </View>
    </View>
  );
  
  // Handle order cancellation
  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };
  
  // Confirm order cancellation
  const confirmCancelOrder = () => {
    // In a real app, this would call an API to cancel the order
    Toast.show({
      type: 'success',
      text1: 'Order Cancelled',
      text2: 'Your order has been cancelled successfully.',
      visibilityTime: 2000,
    });
    // Close modal
    setShowCancelModal(false);
    // Navigate back to orders screen
    navigation.goBack();
  };
  
  // Cancel order cancellation (close modal)
  const cancelCancelOrder = () => {
    setShowCancelModal(false);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order Details</Text>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Order Details</Text>
      
      {/* Order Info */}
      <View style={[styles.orderInfo, { backgroundColor: colors.surface, elevation: 3 }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Order ID:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{order.id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date:</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{new Date(order.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Status:</Text>
          <Text style={[
            styles.statusValue, 
            { 
              color: order.status === 'Delivered' ? '#4CAF50' : 
                     order.status === 'Shipped' ? '#2196F3' : 
                     order.status === 'Processing' ? '#FF9800' : '#F44336' 
            }
          ]}>
            {order.status}
          </Text>
        </View>
      </View>
      
      {/* Order Items */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20, marginBottom: 10 }]}>
        Items Ordered
      </Text>
      <FlatList
        data={orderProducts}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />
      
      {/* Order Summary */}
      <View style={[styles.summary, { backgroundColor: colors.surface, elevation: 3, marginTop: 10 }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{calculatedTotal - shipping}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Shipping</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{shipping}</Text>
        </View>
        <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: colors.textSecondary, paddingTop: 10, marginTop: 10 }]}>
          <Text style={[styles.totalLabel, { color: colors.text, fontWeight: 'bold' }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.primary, fontWeight: 'bold' }]}>₹{order.total}</Text>
        </View>
      </View>
      
      {/* Cancel Order Button - Only show for orders that can be cancelled */}
      {(order.status === 'Processing' || order.status === 'Shipped') && (
        <TouchableOpacity 
          style={[styles.cancelButton, { backgroundColor: colors.error }]}
          onPress={handleCancelOrder}
        >
          <Text style={[styles.cancelButtonText, { color: colors.onPrimary }]}>
            Cancel Order
          </Text>
        </TouchableOpacity>
      )}
      
      </View>
      {/* Custom Cancel Order Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCancelModal}
        onRequestClose={cancelCancelOrder}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Cancel Order</Text>
            <Text style={[styles.modalMessage, { color: colors.text }]}>
              Are you sure you want to cancel this order? This action cannot be undone.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalCancelButton, { borderColor: colors.textSecondary, borderWidth: 1 }]}
                onPress={cancelCancelOrder}
              >
                <Text style={[styles.modalCancelButtonText, { color: colors.text }]}>
                  Keep Order
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalConfirmButton, { backgroundColor: colors.error }]}
                onPress={confirmCancelOrder}
              >
                <Text style={[styles.modalConfirmButtonText, { color: colors.onPrimary }]}>
                  Yes, Cancel Order
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 90, // Extra space at bottom to avoid overlapping with tab navigator
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  orderInfo: {
    padding: 15,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderItem: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  itemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemImage: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summary: {
    padding: 20,
    borderRadius: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
  },
  totalLabel: {
    fontSize: 18,
  },
  totalValue: {
    fontSize: 18,
  },
  cancelButton: {
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    marginRight: 5,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    marginLeft: 5,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
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

export default OrderDetailScreen;