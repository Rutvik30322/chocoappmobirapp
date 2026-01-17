import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { categories } from '../utils/dummyData';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';
import productService, { Product } from '../services/productService';

const AllProductsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const { addToCart } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Fetch products from backend
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      if (response.data && response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load products',
        visibilityTime: 2000,
      });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={[styles.productCard, { backgroundColor: colors.surface }]}      
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
    >
      <View style={styles.productImageContainer}>
        <Text style={styles.productImage}>{item.image}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.productDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={[styles.productPrice, { color: colors.primary }]}>
            ₹{item.price}
          </Text>
          <Text style={[styles.productRating, { color: colors.textSecondary }]}>
            ⭐ {item.rating}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={(e) => {
          e.stopPropagation(); // Prevent navigating to product detail
          addToCart({
            id: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
          });
          
          Toast.show({
            type: 'success',
            text1: 'Added to Cart',
            text2: `${item.name} added to your cart`,
            visibilityTime: 2000,
          });
        }}
      >
        <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemedLayout edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>      
      {/* Header with back button */}
      <View style={[styles.headerContainer, { backgroundColor: colors.surface }]}>  
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitleText, { color: colors.text }]}>All Products</Text>
        <View style={styles.headerSpacer} />
      </View>
        
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />
      </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFF8F0', // Light cream background for the header
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitleText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  productCard: {
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
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productImage: {
    fontSize: 30,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    marginBottom: 10,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productRating: {
    fontSize: 12,
  },
  addButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
    marginTop: 20,
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default AllProductsScreen;