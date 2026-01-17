import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import ThemedLayout from '../components/ThemedLayout';

const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  const shipping = 248; // ~$2.99 * 83
  const tax = getTotalPrice() * 0.08;
  const total = getTotalPrice() + shipping + tax;

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={[styles.cartItem, { backgroundColor: colors.surface }]}>
      <View style={styles.itemImageContainer}>
        <Text style={styles.itemImage}>{item.image}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{(item.price * item.quantity)} ( ₹{item.price} × {item.quantity})</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={[styles.quantityButton, { backgroundColor: colors.primary }]}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={[styles.quantityButtonText, { color: colors.onPrimary }]}>-</Text>
          </TouchableOpacity>
          <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
          <TouchableOpacity 
            style={[styles.quantityButton, { backgroundColor: colors.primary }]}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={[styles.quantityButtonText, { color: colors.onPrimary }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Text style={{ color: colors.error }}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Cart</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      {items.length > 0 ? (
        <>
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
          
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
            
            <TouchableOpacity 
              style={[styles.buyNowButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Payment')}>
              <Text style={[styles.buyNowButtonText, { color: colors.onPrimary }]}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Add some delicious chocolates to your cart!
          </Text>
        </View>
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkoutButton: {
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyNowButton: {
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyNowButtonText: {
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
    marginTop: 20,
  },
});

export default CartScreen;