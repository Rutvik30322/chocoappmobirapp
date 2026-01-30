import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';
import Logo from '../components/Logo';
import DeleteIcon from '../components/DeleteIcon';
import orderService from '../services/orderService';

interface OrderItem {
  product: string | {
    _id: string;
    name: string;
    image?: string;
    price?: number;
  };
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: string;
  isPaid: boolean;
  createdAt: string;
}

const OrderDetailScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { colors, theme } = useTheme();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(orderId);
      if (response.data && response.data.order) {
        setOrder(response.data.order);
      }
    } catch (error: any) {
      console.error('Failed to load order details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load order details',
        visibilityTime: 2000,
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Render individual order item
  const renderOrderItem = ({ item }: { item: OrderItem }) => {
    const productName = typeof item.product === 'object' 
      ? item.product.name 
      : item.name;
    const productImage = typeof item.product === 'object' 
      ? item.product.image 
      : item.image;
    const productPrice = typeof item.product === 'object' && item.product.price
      ? item.product.price
      : item.price;
    
    const isValidImageUrl = productImage && (
      productImage.startsWith('http://') || 
      productImage.startsWith('https://')
    );

    return (
      <View style={[styles.orderItem, { backgroundColor: colors.surface, elevation: 2 }]}>
        <View style={styles.itemImageContainer}>
          {isValidImageUrl ? (
            <Image 
              source={{ uri: productImage }} 
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.itemImagePlaceholder}>
              {productImage || '📦'}
            </Text>
          )}
        </View>
        <View style={styles.itemDetails}>
          <Text style={[styles.itemName, { color: colors.text }]}>{productName}</Text>
          <View style={styles.itemInfoRow}>
            <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
              Quantity: {item.quantity}
            </Text>
            <Text style={[styles.itemPrice, { color: colors.primary }]}>
              ₹{item.price.toFixed(2)} each
            </Text>
          </View>
          <Text style={[styles.itemTotal, { color: colors.text, fontWeight: 'bold' }]}>
            Total: ₹{(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  // Handle order cancellation
  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  // Confirm order cancellation
  const confirmCancelOrder = async () => {
    if (order) {
      try {
        await orderService.cancelOrder(order._id);
        Toast.show({
          type: 'success',
          text1: 'Order Cancelled',
          text2: 'Your order has been cancelled successfully.',
          visibilityTime: 2000,
        });
        setShowCancelModal(false);
        navigation.goBack();
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to cancel order',
          visibilityTime: 2000,
        });
      }
    }
  };

  // Cancel order cancellation (close modal)
  const cancelCancelOrder = () => {
    setShowCancelModal(false);
  };

  if (loading) {
    return (
      <ThemedLayout edges={['top']}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading order details...
            </Text>
          </View>
        </View>
      </ThemedLayout>
    );
  }

  if (!order) {
    return (
      <ThemedLayout edges={['top']}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>Order not found</Text>
          </View>
        </View>
      </ThemedLayout>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return '#4CAF50';
      case 'Shipped':
        return '#2196F3';
      case 'Processing':
        return '#FF9800';
      case 'Cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <ThemedLayout edges={['top']}>
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Order Details</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>Order Details</Text>
        
        {/* Order Info */}
        <View style={[styles.orderInfo, { backgroundColor: colors.surface, elevation: 3 }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Order ID:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              #{order._id.slice(-8).toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{orderDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Status:</Text>
            <Text style={[styles.statusValue, { color: getStatusColor(order.orderStatus) }]}>
              {order.orderStatus}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Payment:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {order.paymentMethod} {order.isPaid ? '✓ Paid' : '(Pending)'}
            </Text>
          </View>
        </View>
        
        {/* Shipping Address */}
        <View style={[styles.addressCard, { backgroundColor: colors.surface, elevation: 2 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 10 }]}>
            Delivery Address
          </Text>
          <Text style={[styles.addressText, { color: colors.text }]}>
            {order.shippingAddress.addressLine}
          </Text>
          <Text style={[styles.addressText, { color: colors.text }]}>
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </Text>
        </View>
        
        {/* Order Items */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20, marginBottom: 10 }]}>
          Items Ordered ({order.orderItems.length})
        </Text>
        <FlatList
          data={order.orderItems}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => `${typeof item.product === 'object' ? item.product._id : item.product}-${index}`}
          scrollEnabled={false}
        />
        
        {/* Order Summary */}
        <View style={[styles.summary, { backgroundColor: colors.surface, elevation: 3, marginTop: 10 }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>₹{order.itemsPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>₹{order.shippingPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Tax</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>₹{order.taxPrice.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: colors.textSecondary, paddingTop: 10, marginTop: 10 }]}>
            <Text style={[styles.totalLabel, { color: colors.text, fontWeight: 'bold' }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary, fontWeight: 'bold' }]}>
              ₹{order.totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
        
        {/* Cancel Order Button - Only show for orders that can be cancelled */}
        {(order.orderStatus === 'Pending' || order.orderStatus === 'Processing') && (
          <TouchableOpacity 
            style={[styles.cancelButton, { backgroundColor: colors.error }]}
            onPress={handleCancelOrder}
          >
            <Text style={[styles.cancelButtonText, { color: colors.onPrimary }]}>
              Cancel Order
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* Custom Cancel Order Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCancelModal}
        onRequestClose={cancelCancelOrder}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.modalIconContainer}>
              <DeleteIcon size={48} color={colors.error} />
            </View>
            
            <Text style={[styles.modalTitle, { color: colors.text }]}>Cancel Order</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Are you sure you want to cancel this order? This action cannot be undone.
            </Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { backgroundColor: colors.textSecondary + '20', borderColor: colors.textSecondary }]}
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
                <View style={styles.modalButtonContent}>
                  <View style={styles.iconWrapper}>
                    <DeleteIcon size={18} color={colors.onPrimary} />
                  </View>
                  <Text style={[styles.modalConfirmButtonText, { color: colors.onPrimary }]}>
                    Cancel Order
                  </Text>
                </View>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Extra padding at bottom to ensure cancel button is visible
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
    marginBottom: 15,
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
  addressCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemImagePlaceholder: {
    fontSize: 28,
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
  itemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemTotal: {
    fontSize: 16,
  },
  summary: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
    includeFontPadding: false,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
  },
});

export default OrderDetailScreen;
