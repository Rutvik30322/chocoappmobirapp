import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, TextInput, ScrollView, Modal, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { categories } from '../utils/dummyData';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';
import Logo from '../components/Logo';
import CartIcon from '../components/CartIcon';
import SearchIcon from '../components/SearchIcon';
import FilterIcon from '../components/FilterIcon';
import productService, { Product } from '../services/productService';

interface Category {
  _id: string;
  name: string;
  icon: string;
  description?: string;
  isActive: boolean;
}

const AllProductsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const { addToCart, getTotalItems } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priceSort, setPriceSort] = useState<string>('None');
  const [ratingFilter, setRatingFilter] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  
  // Fetch products and categories from backend
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);
  
  const loadProducts = async () => {
    try {
      // Fetch all products by using 'all' limit or a very high limit
      const response = await productService.getAllProducts({ limit: 'all' });
      if (response.data && response.data.data && response.data.data.products) {
        setAllProducts(response.data.data.products);
        applyFilters(response.data.data.products);
      } else if (response.data && response.data.products) {
        setAllProducts(response.data.products);
        applyFilters(response.data.products);
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

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      if (response.data && response.data.data && response.data.data.categories) {
        setCategories(response.data.data.categories);
      } else if (response.data && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
      setRefreshing(false);
  };

  // Apply filters to products
  const applyFilters = (productsToFilter: Product[] = allProducts) => {
    let filtered = [...productsToFilter];

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Rating filter
    if (ratingFilter !== 'All') {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(product => product.rating >= minRating);
    }

    // Stock filter
    if (stockFilter !== 'All') {
      if (stockFilter === 'In Stock') {
        filtered = filtered.filter(product => product.inStock === true && (product.stock === undefined || product.stock > 0));
      } else if (stockFilter === 'Out of Stock') {
        filtered = filtered.filter(product => product.inStock === false || (product.stock !== undefined && product.stock <= 0));
      }
    }

    // Price range filter
    if (minPrice && minPrice.trim() !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter(product => product.price >= min);
      }
    }
    if (maxPrice && maxPrice.trim() !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter(product => product.price <= max);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });
    }

    // Sort by price
    if (priceSort === 'Low to High') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'High to Low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (priceSort === 'Rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (priceSort === 'Name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setProducts(filtered);
  };

  // Update filters when filter states change
  useEffect(() => {
    if (allProducts.length > 0) {
      applyFilters();
    }
  }, [categoryFilter, priceSort, ratingFilter, stockFilter, searchQuery, minPrice, maxPrice, allProducts]);

  // Reset filters
  const resetFilters = () => {
    setCategoryFilter('All');
    setPriceSort('None');
    setRatingFilter('All');
    setStockFilter('All');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
  };

  // Check if any filter is active
  const hasActiveFilters = categoryFilter !== 'All' || priceSort !== 'None' || ratingFilter !== 'All' || stockFilter !== 'All' || searchQuery.trim() !== '' || (minPrice && minPrice.trim() !== '') || (maxPrice && maxPrice.trim() !== '');

  // Helper function to check if string is a valid URL
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Helper function to truncate description text
  const truncateText = (text: string | undefined, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={[styles.productCard, { backgroundColor: colors.surface }]}      
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
    >
      <View style={styles.productImageContainer}>
        {isValidImageUrl(item.image) ? (
          <Image 
            source={{ uri: item.image }} 
            style={styles.productImage}
            resizeMode="cover"
            onError={() => {
           
            }}
          />
        ) : (
          <Text style={styles.productImageEmoji}>{item.image || '🍫'}</Text>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
        <Text 
          style={[styles.productDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {truncateText(item.description, 60)}
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
        style={[
          styles.addButton, 
          { 
            backgroundColor: (item.inStock === false || (item.stock !== undefined && item.stock <= 0)) 
              ? colors.textSecondary 
              : colors.primary 
          }
        ]}
        onPress={(e) => {
          e.stopPropagation(); // Prevent navigating to product detail
          
          // Check if product is out of stock
          if (item.inStock === false || (item.stock !== undefined && item.stock <= 0)) {
            Toast.show({
              type: 'info',
              text1: 'Out of Stock',
              text2: `${item.name} is currently out of stock`,
              visibilityTime: 2000,
            });
            return;
          }
          
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
        disabled={item.inStock === false || (item.stock !== undefined && item.stock <= 0)}
      >
        <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>
          {(item.inStock === false || (item.stock !== undefined && item.stock <= 0)) ? 'Out of Stock' : 'Add'}
        </Text>
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
        <View style={styles.headerTitleContainer}>
          <Logo size={30} style={styles.headerLogo} />
        <Text style={[styles.headerTitleText, { color: colors.text }]}>All Products</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Cart')}
          style={styles.cartButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CartIcon size={24} color={colors.primary} />
          {getTotalItems() > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getTotalItems()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar and Filter Button */}
      <View style={styles.searchFilterContainer}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.searchIconContainer}>
            <SearchIcon size={18} color={colors.textSecondary} />
          </View>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search chocolates..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: hasActiveFilters ? colors.primary : colors.surface }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <View style={styles.filterButtonContent}>
            <FilterIcon size={16} color={hasActiveFilters ? colors.onPrimary : colors.text} />
            {hasActiveFilters && (
              <Text style={[styles.filterButtonText, { color: hasActiveFilters ? colors.onPrimary : colors.text }]}>
                ({products.length})
              </Text>
            )}
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
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContainer, { backgroundColor: colors.surface }]}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.textSecondary + '20' }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={styles.modalCloseButton}
              >
                <Text style={[styles.modalCloseText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Price Range Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>Price Range</Text>
                <View style={styles.priceRangeContainer}>
                  <View style={styles.priceInputContainer}>
                    <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Min Price</Text>
                    <TextInput
                      style={[styles.priceInput, { 
                        backgroundColor: colors.background, 
                        color: colors.text,
                        borderColor: colors.textSecondary + '40'
                      }]}
                      value={minPrice}
                      onChangeText={setMinPrice}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.priceInputContainer}>
                    <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Max Price</Text>
                    <TextInput
                      style={[styles.priceInput, { 
                        backgroundColor: colors.background, 
                        color: colors.text,
                        borderColor: colors.textSecondary + '40'
                      }]}
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      placeholder="10000"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: categoryFilter === 'All' ? colors.primary : colors.background,
                    borderColor: categoryFilter === 'All' ? colors.primary : colors.textSecondary + '40',
                  }
                ]}
                onPress={() => setCategoryFilter('All')}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: categoryFilter === 'All' ? colors.onPrimary : colors.text }
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: categoryFilter === category.name ? colors.primary : colors.background,
                      borderColor: categoryFilter === category.name ? colors.primary : colors.textSecondary + '40',
                    }
                  ]}
                  onPress={() => setCategoryFilter(category.name)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: categoryFilter === category.name ? colors.onPrimary : colors.text }
                  ]}>
                    {category.icon || '🍫'} {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

              {/* Sort By */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Sort By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              {['None', 'Low to High', 'High to Low', 'Rating', 'Name'].map((sort) => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: priceSort === sort ? colors.primary : colors.background,
                      borderColor: priceSort === sort ? colors.primary : colors.textSecondary + '40',
                    }
                  ]}
                  onPress={() => setPriceSort(sort)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: priceSort === sort ? colors.onPrimary : colors.text }
                  ]}>
                    {sort}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

              {/* Rating Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Rating</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              {['All', '4', '3', '2', '1'].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: ratingFilter === rating ? colors.primary : colors.background,
                      borderColor: ratingFilter === rating ? colors.primary : colors.textSecondary + '40',
                    }
                  ]}
                  onPress={() => setRatingFilter(rating)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: ratingFilter === rating ? colors.onPrimary : colors.text }
                  ]}>
                    {rating === 'All' ? 'All' : `⭐ ${rating}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

              {/* Stock Status Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Stock Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              {['All', 'In Stock', 'Out of Stock'].map((stock) => (
                <TouchableOpacity
                  key={stock}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: stockFilter === stock ? colors.primary : colors.background,
                      borderColor: stockFilter === stock ? colors.primary : colors.textSecondary + '40',
                    }
                  ]}
                  onPress={() => setStockFilter(stock)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: stockFilter === stock ? colors.onPrimary : colors.text }
                  ]}>
                    {stock}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={[styles.modalFooter, { borderTopColor: colors.textSecondary + '20' }]}>
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
        
      {hasActiveFilters && products.length > 0 && (
        <Text style={[styles.filterResultText, { color: colors.textSecondary }]}>
          Showing {products.length} of {allProducts.length} products
        </Text>
      )}
        
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyIcon, { fontSize: 64, marginBottom: 16 }]}>
              {hasActiveFilters ? '🔍' : '📦'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {hasActiveFilters ? 'No products match your filters' : 'No products available'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {hasActiveFilters 
                ? 'Try adjusting your filter criteria'
                : 'Check back later for new products'
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
        }
      />
      </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    gap: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  searchIconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productCard: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  headerTitleText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartButton: {
    position: 'relative',
    padding: 10,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  productImageEmoji: {
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
    lineHeight: 16,
    maxHeight: 32, // Allow for 2 lines (12px font * 2 lines with lineHeight)
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 5,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalContent: {
    maxHeight: Dimensions.get('window').height * 0.55,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  priceInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
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

export default AllProductsScreen;