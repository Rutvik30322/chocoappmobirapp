import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Alert, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import ThemedLayout from '../components/ThemedLayout';
import Logo from '../components/Logo';
import DeleteIcon from '../components/DeleteIcon';
import SearchIcon from '../components/SearchIcon';
import productService from '../services/productService';
import Toast from 'react-native-toast-message';

const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [productStocks, setProductStocks] = useState<Record<string, { stock: number; inStock: boolean }>>({});

  // Fetch stock information for cart items
  useEffect(() => {
    const fetchProductStocks = async () => {
      const stockMap: Record<string, { stock: number; inStock: boolean }> = {};
      
      for (const item of items) {
        // If stock info already exists in cart item, use it
        if (item.stock !== undefined && item.inStock !== undefined) {
          stockMap[item.id] = { stock: item.stock, inStock: item.inStock };
        } else {
          // Otherwise fetch from API
          try {
            const response = await productService.getProductById(item.id);
            if (response.data && response.data.product) {
              const product = response.data.product;
              stockMap[item.id] = {
                stock: product.stock || 0,
                inStock: product.inStock !== false && (product.stock === undefined || product.stock > 0)
              };
            }
          } catch (error) {
            console.error(`Failed to fetch stock for product ${item.id}:`, error);
            // Default to available if fetch fails
            stockMap[item.id] = { stock: 999, inStock: true };
          }
        }
      }
      
      setProductStocks(stockMap);
    };

    if (items.length > 0) {
      fetchProductStocks();
    }
  }, [items]);

  const shipping = 248; // ~$2.99 * 83
  const tax = getTotalPrice() * 0.08;
  const total = getTotalPrice() + shipping + tax;

  // Handle remove item with confirmation
  const handleRemoveItem = (item: any) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Helper function to check if string is a valid URL
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const renderCartItem = ({ item }: { item: any }) => {
    const stockInfo = productStocks[item.id] || { stock: item.stock || 999, inStock: item.inStock !== false };
    const maxQuantity = stockInfo.stock || 999;
    const isMinQuantity = item.quantity <= 1;
    const isMaxQuantity = item.quantity >= maxQuantity || !stockInfo.inStock;
    
    const handleDecrease = () => {
      if (item.quantity > 1) {
        updateQuantity(item.id, item.quantity - 1);
      }
    };

    const handleIncrease = () => {
      if (item.quantity < maxQuantity && stockInfo.inStock) {
        updateQuantity(item.id, item.quantity + 1);
      } else {
        Toast.show({
          type: 'info',
          text1: 'Stock Limit',
          text2: `Only ${maxQuantity} item(s) available in stock`,
          visibilityTime: 2000,
        });
      }
    };

    return (
      <View style={[styles.cartItem, { backgroundColor: colors.surface }]}>
        <View style={styles.itemImageContainer}>
          {isValidImageUrl(item.image) ? (
            <Image 
              source={{ uri: item.image }} 
              style={styles.itemImage}
              resizeMode="cover"
              onError={() => {
                // Fallback to emoji if image fails to load
              }}
            />
          ) : (
            <Text style={styles.itemImageEmoji}>{item.image || '🍫'}</Text>
          )}
        </View>
        <View style={styles.itemDetails}>
          <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{(item.price * item.quantity)} ( ₹{item.price} × {item.quantity})</Text>
          {!stockInfo.inStock && (
            <Text style={[styles.stockWarning, { color: colors.error }]}>Out of Stock</Text>
          )}
          {stockInfo.inStock && maxQuantity < 10 && (
            <Text style={[styles.stockInfo, { color: colors.textSecondary }]}>
              {maxQuantity} available
            </Text>
          )}
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={[
                styles.quantityButton, 
                { 
                  backgroundColor: isMinQuantity ? colors.textSecondary + '40' : colors.primary,
                  opacity: isMinQuantity ? 0.5 : 1
                }
              ]}
              onPress={handleDecrease}
              disabled={isMinQuantity}
            >
              <Text style={[
                styles.quantityButtonText, 
                { color: isMinQuantity ? colors.textSecondary : colors.onPrimary }
              ]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
            <TouchableOpacity 
              style={[
                styles.quantityButton, 
                { 
                  backgroundColor: isMaxQuantity ? colors.textSecondary + '40' : colors.primary,
                  opacity: isMaxQuantity ? 0.5 : 1
                }
              ]}
              onPress={handleIncrease}
              disabled={isMaxQuantity}
            >
              <Text style={[
                styles.quantityButtonText, 
                { color: isMaxQuantity ? colors.textSecondary : colors.onPrimary }
              ]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item)}
        >
          <DeleteIcon size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedLayout edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack() || navigation.navigate('HomeTabs')}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Logo size={30} style={styles.headerLogo} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Cart</Text>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          activeOpacity={0.7}
        >
          {/* <SearchIcon size={22} color={colors.primary} /> */}
        </TouchableOpacity>
      </View>
      
      {items.length > 0 ? (
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
          showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContainer}
          ListFooterComponent={
            <>
          <View style={[styles.summary, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₹{Math.round(getTotalPrice())}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₹{Math.round(shipping)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Tax</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₹{Math.round(tax)}</Text>
            </View>
            <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: colors.textSecondary }]}>
              <Text style={[styles.totalLabel, { color: colors.text, fontWeight: 'bold' }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary, fontWeight: 'bold' }]}>₹{Math.round(total)}</Text>
            </View>
          </View>
          
          <View style={styles.checkoutContainer}>
            <TouchableOpacity 
              style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Payment')}>
              <Text style={[styles.checkoutButtonText, { color: colors.onPrimary }]}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Add some delicious chocolates to your cart!
          </Text>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.modalIconContainer}>
              <DeleteIcon size={48} color={colors.error} />
            </View>
            
            <Text style={[styles.modalTitle, { color: colors.text }]}>Remove Item</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Are you sure you want to remove "{itemToDelete?.name}" from your cart?
            </Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { backgroundColor: colors.textSecondary + '20', borderColor: colors.textSecondary }]}
                onPress={cancelDelete}
              >
                <Text style={[styles.modalCancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: colors.error }]}
                onPress={confirmDelete}
              >
                <View style={styles.modalButtonContent}>
                  <DeleteIcon size={18} color={colors.onPrimary} />
                  <Text style={[styles.modalConfirmButtonText, { color: colors.onPrimary }]}>Remove</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  searchButton: {
    padding: 10,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: 5,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemImageEmoji: {
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
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  stockWarning: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 4,
  },
  stockInfo: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 4,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  summary: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
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
  checkoutContainer: {
    width: '100%',
  },
  checkoutButton: {
    width: '100%',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
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
  listContainer: {
    padding: 20,
    paddingBottom: 100,
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
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
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
    gap: 8,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;