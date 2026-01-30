import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator, Image, RefreshControl, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';
import Logo from '../components/Logo';
import DeleteIcon from '../components/DeleteIcon';
import FilterIcon from '../components/FilterIcon';
import orderService from '../services/orderService';

interface OrderItem {
  product: string | {
    _id: string;
    name: string;
    image?: string;
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

const OrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Store all orders for filtering
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderIdToCancel, setOrderIdToCancel] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  // Reload orders when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadOrders();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      if (response.data && response.data.orders) {
        setAllOrders(response.data.orders);
        applyFilters(response.data.orders);
      }
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load orders',
        visibilityTime: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to orders
  const applyFilters = (ordersToFilter: Order[]) => {
    let filtered = [...ordersToFilter];

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'All') {
      if (paymentFilter === 'Paid') {
        filtered = filtered.filter(order => order.isPaid === true);
      } else if (paymentFilter === 'Unpaid') {
        filtered = filtered.filter(order => order.isPaid === false);
      }
    }

    // Date filter
    if (dateFilter !== 'All') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === 'Last 7 days') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'Last 30 days') {
        filterDate.setDate(now.getDate() - 30);
      } else if (dateFilter === 'Last 3 months') {
        filterDate.setMonth(now.getMonth() - 3);
      } else if (dateFilter === 'This year') {
        filterDate.setMonth(0, 1);
        filterDate.setHours(0, 0, 0, 0);
      }

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= filterDate;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setOrders(filtered);
  };

  // Update filters when filter states change
  useEffect(() => {
    if (allOrders.length > 0) {
      applyFilters(allOrders);
    }
  }, [statusFilter, paymentFilter, dateFilter, allOrders]);

  // Reset filters
  const resetFilters = () => {
    setStatusFilter('All');
    setPaymentFilter('All');
    setDateFilter('All');
  };

  // Check if any filter is active
  const hasActiveFilters = statusFilter !== 'All' || paymentFilter !== 'All' || dateFilter !== 'All';

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const orderDate = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const canCancel = item.orderStatus === 'Pending' || item.orderStatus === 'Processing';
    
    return (
      <View style={[styles.orderCard, { backgroundColor: colors.surface, elevation: 2 }]}>
        {/* Compact Header with Order ID, Date, Status, and Total */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={[styles.orderId, { color: colors.text }]}>
              #{item._id.slice(-8).toUpperCase()}
            </Text>
            <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
              {orderDate}
            </Text>
          </View>
          <View style={styles.orderHeaderRight}>
            <Text style={[
              styles.statusBadge,
              { 
                backgroundColor: item.orderStatus === 'Delivered' ? '#4CAF5020' : 
                                 item.orderStatus === 'Shipped' ? '#2196F320' : 
                                 item.orderStatus === 'Processing' ? '#FF980020' : 
                                 item.orderStatus === 'Cancelled' ? '#F4433620' : '#9E9E9E20',
                color: item.orderStatus === 'Delivered' ? '#4CAF50' : 
                       item.orderStatus === 'Shipped' ? '#2196F3' : 
                       item.orderStatus === 'Processing' ? '#FF9800' : 
                       item.orderStatus === 'Cancelled' ? '#F44336' : '#9E9E9E'
              }
            ]}>
              {item.orderStatus}
            </Text>
            <Text style={[styles.orderTotal, { color: colors.primary }]}>
              ₹{item.totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
        
        {/* Compact Products - Show only 2 items */}
        <View style={styles.productsContainer}>
          {item.orderItems.slice(0, 2).map((orderItem, index) => {
            const productName = typeof orderItem.product === 'object' 
              ? orderItem.product.name 
              : orderItem.name;
            const productImage = typeof orderItem.product === 'object' 
              ? orderItem.product.image 
              : orderItem.image;
            
            return (
              <View key={index} style={styles.productItem}>
                <View style={styles.productImageContainer}>
                  {productImage && (productImage.startsWith('http://') || productImage.startsWith('https://')) ? (
                    <Image 
                      source={{ uri: productImage }} 
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.productImagePlaceholder}>
                      {productImage || '📦'}
                    </Text>
                  )}
                </View>
                <View style={styles.productDetails}>
                  <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                    {productName}
                  </Text>
                  <Text style={[styles.productQuantity, { color: colors.textSecondary }]}>
                    {orderItem.quantity} × ₹{orderItem.price}
                  </Text>
                </View>
              </View>
            );
          })}
          {item.orderItems.length > 2 && (
            <Text style={[styles.moreItemsText, { color: colors.primary }]}>
              +{item.orderItems.length - 2} more
            </Text>
          )}
        </View>
        
        {/* Compact Info Row - Address, Payment, Items Count */}
        <View style={styles.orderInfoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Items:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{item.orderItems.length}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Payment:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {item.paymentMethod} {item.isPaid ? '✓' : '⏳'}
            </Text>
          </View>
        </View>
        
        {/* Compact Address */}
        <View style={styles.orderAddress}>
          <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={1}>
            📍 {item.shippingAddress.city}, {item.shippingAddress.state}
          </Text>
        </View>
        
        {/* Actions */}
        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}>
            <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
              View Details
            </Text>
          </TouchableOpacity>
          
          {canCancel && (
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: colors.error }]}
              onPress={() => handleShowCancelModal(item._id)}>
              <Text style={[styles.cancelButtonText, { color: colors.onPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleShowCancelModal = (orderId: string) => {
    setOrderIdToCancel(orderId);
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (orderIdToCancel) {
      try {
        await orderService.cancelOrder(orderIdToCancel);
        
        Toast.show({
          type: 'success',
          text1: 'Order Cancelled',
          text2: 'Your order has been successfully cancelled.',
          visibilityTime: 2000,
        });
        
        // Reload orders
        await loadOrders();
        
        // Close modal
        setShowCancelModal(false);
        setOrderIdToCancel(null);
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
        <View style={styles.headerTitleContainer}>
          <Logo size={30} style={styles.headerLogo} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>My Orders</Text>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: hasActiveFilters ? colors.primary : colors.surface }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <View style={styles.filterButtonContent}>
            <FilterIcon size={16} color={hasActiveFilters ? colors.onPrimary : colors.text} />
            <Text style={[styles.filterButtonText, { color: hasActiveFilters ? colors.onPrimary : colors.text }]}>
              Filters {hasActiveFilters ? `(${orders.length})` : ''}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableOpacity 
          style={styles.filterModalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.filterModalContainer, { backgroundColor: colors.surface }]}
          >
            {/* Modal Header */}
            <View style={[styles.filterModalHeader, { borderBottomColor: colors.textSecondary + '20' }]}>
              <Text style={[styles.filterModalTitle, { color: colors.text }]}>Filters</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={styles.filterModalCloseButton}
              >
                <Text style={[styles.filterModalCloseText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView style={styles.filterModalContent} showsVerticalScrollIndicator={false}>
              {/* Order Status Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Order Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: statusFilter === status ? colors.primary : colors.background,
                      borderColor: statusFilter === status ? colors.primary : colors.textSecondary + '40',
                    }
                  ]}
                  onPress={() => setStatusFilter(status)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: statusFilter === status ? colors.onPrimary : colors.text }
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

              {/* Payment Status Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Payment Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              {['All', 'Paid', 'Unpaid'].map((payment) => (
                <TouchableOpacity
                  key={payment}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: paymentFilter === payment ? colors.primary : colors.background,
                      borderColor: paymentFilter === payment ? colors.primary : colors.textSecondary + '40',
                    }
                  ]}
                  onPress={() => setPaymentFilter(payment)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: paymentFilter === payment ? colors.onPrimary : colors.text }
                  ]}>
                    {payment}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

              {/* Date Range Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Date Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              {['All', 'Last 7 days', 'Last 30 days', 'Last 3 months', 'This year'].map((date) => (
                <TouchableOpacity
                  key={date}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: dateFilter === date ? colors.primary : colors.background,
                      borderColor: dateFilter === date ? colors.primary : colors.textSecondary + '40',
                    }
                  ]}
                  onPress={() => setDateFilter(date)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: dateFilter === date ? colors.onPrimary : colors.text }
                  ]}>
                    {date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={[styles.filterModalFooter, { borderTopColor: colors.textSecondary + '20' }]}>
          {hasActiveFilters && (
            <TouchableOpacity
                  style={[styles.resetButton, { backgroundColor: colors.error + '20', marginRight: 10 }]}
              onPress={resetFilters}
            >
              <Text style={[styles.resetButtonText, { color: colors.error }]}>
                    Reset
              </Text>
            </TouchableOpacity>
          )}
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={[styles.applyButtonText, { color: colors.onPrimary }]}>
                  Apply Filters
                </Text>
              </TouchableOpacity>
        </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading orders...</Text>
        </View>
      ) : orders.length > 0 ? (
        <>
          {hasActiveFilters && (
            <Text style={[styles.filterResultText, { color: colors.textSecondary }]}>
              Showing {orders.length} of {allOrders.length} orders
            </Text>
          )}
          <FlatList
            data={orders}
            renderItem={renderOrder}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon, { fontSize: 64, marginBottom: 16 }]}>
            {hasActiveFilters ? '🔍' : '📦'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {hasActiveFilters ? 'No orders match your filters' : 'No orders yet'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {hasActiveFilters 
              ? 'Try adjusting your filter criteria'
              : 'Your order history will appear here'
            }
          </Text>
          {hasActiveFilters && (
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: colors.primary, marginTop: 16 }]}
              onPress={resetFilters}
            >
              <Text style={[styles.resetButtonText, { color: colors.onPrimary }]}>
                Clear Filters
              </Text>
            </TouchableOpacity>
          )}
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
                onPress={handleCancelOrder}
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
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterSection: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterResultText: {
    fontSize: 12,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  listContainer: {
    paddingBottom: 100,
  },
  orderCard: {
    padding: 12,
    marginBottom: 12,
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
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
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  viewDetailsButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '500',
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
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderAddress: {
    marginBottom: 6,
  },
  addressText: {
    fontSize: 11,
    lineHeight: 14,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  productsContainer: {
    marginTop: 6,
    marginBottom: 6,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productImageContainer: {
    width: 35,
    height: 35,
    borderRadius: 6,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: 35,
    height: 35,
    borderRadius: 6,
  },
  productImagePlaceholder: {
    fontSize: 18,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 1,
  },
  productQuantity: {
    fontSize: 11,
  },
  moreItemsText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContainer: {
    maxHeight: Dimensions.get('window').height * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    width: '100%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterModalCloseButton: {
    padding: 5,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalCloseText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterModalContent: {
    maxHeight: Dimensions.get('window').height * 0.55,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  filterModalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrdersScreen;