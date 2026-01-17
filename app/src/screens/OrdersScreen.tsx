import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { dummyOrders } from '../utils/dummyData';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';

const OrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const [orders, setOrders] = useState(dummyOrders);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderIdToCancel, setOrderIdToCancel] = useState<string | null>(null);

  const renderOrder = ({ item }: { item: any }) => (
    <View style={[styles.orderCard, { backgroundColor: colors.surface }]}>
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, { color: colors.text }]}>
          Order ID: {item.id}
        </Text>
        <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={[styles.orderTotal, { color: colors.primary }]}>
        ₹{item.total}
      </Text>
      
      <View style={styles.orderProducts}>
        <Text style={[styles.orderProductsTitle, { color: colors.text }]}>
          Products: {item.products.length}
        </Text>
        
        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
            <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
              View Details
            </Text>
          </TouchableOpacity>
          
          {(item.status === 'Processing' || item.status === 'Shipped') && (
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: colors.error }]}
              onPress={() => handleShowCancelModal(item.id)}>
              <Text style={[styles.cancelButtonText, { color: colors.onPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.orderStatus}>
        <Text style={[
          styles.statusText,
          { 
            color: item.status === 'Delivered' ? '#4CAF50' : 
                   item.status === 'Shipped' ? '#2196F3' : 
                   item.status === 'Processing' ? '#FF9800' : 
                   item.status === 'Cancelled' ? '#F44336' : '#9E9E9E'
          }
        ]}>
          Status: {item.status}
        </Text>
      </View>
    </View>
  );

  const handleShowCancelModal = (orderId: string) => {
    setOrderIdToCancel(orderId);
    setShowCancelModal(true);
  };

  const handleCancelOrder = () => {
    if (orderIdToCancel) {
      // In a real app, this would update the order status via API
      // For now, we'll just show a success message
      Toast.show({
        type: 'success',
        text1: 'Order Cancelled',
        text2: 'Your order has been successfully cancelled.',
      });
      
      // Update the order status in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderIdToCancel ? { ...order, status: 'Cancelled' } : order
        )
      );
      
      // Close modal
      setShowCancelModal(false);
      setOrderIdToCancel(null);
    }
  };

  const cancelCancelOrder = () => {
    setShowCancelModal(false);
    setOrderIdToCancel(null);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>My Orders</Text>
      
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No orders yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Your order history will appear here
          </Text>
        </View>
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
                onPress={handleCancelOrder}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderCard: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderProducts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  orderProductsTitle: {
    fontSize: 14,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsButton: {
    padding: 5,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 5,
    marginLeft: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderStatus: {
    marginTop: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
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

export default OrdersScreen;