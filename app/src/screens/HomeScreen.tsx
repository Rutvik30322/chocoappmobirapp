import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image, RefreshControl, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { categories } from '../utils/dummyData';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';
import { useAppSelector } from '../store/hooks';
import productService, { Product } from '../services/productService';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme, toggleTheme } = useTheme();
  const { addToCart, getTotalItems } = useCart();
  const { user } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
  
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    <ThemedLayout edges={['top'] /* Exclude bottom edge to avoid conflict with tab navigator */}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Hello, {user?.name || 'User'}!</Text>
          <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
            Discover delicious chocolates
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Cart')}
            style={styles.cartButton}
          >
            <Text style={{ color: colors.primary }}>🛒</Text>
            {getTotalItems() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <Text style={{ color: colors.primary }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search chocolates..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
        >
          <TouchableOpacity 
            style={[
              styles.categoryItem, 
              selectedCategory === null && { backgroundColor: colors.primary }
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text 
              style={[
                styles.categoryText, 
                selectedCategory === null && { color: colors.onPrimary }
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.name && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category.name && { color: colors.onPrimary }
                ]}
              >
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory ? selectedCategory : 'All Products'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllProducts')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      </View>
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
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 14,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    marginRight: 15,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  themeToggle: {
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingVertical: 10,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
  },
  categoryText: {
    fontSize: 14,
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

export default HomeScreen;