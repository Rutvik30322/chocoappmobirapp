import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { chocolateProducts } from '../utils/dummyData';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';
import productService, { Product } from '../services/productService';

const ProductDetailScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { productId } = route.params;
  const { colors, theme } = useTheme();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  
  // Fetch product details from backend
  useEffect(() => {
    loadProduct();
  }, [productId]);
  
  const loadProduct = async () => {
    try {
      const response = await productService.getProductById(productId);
      if (response.data && response.data.product) {
        setProduct(response.data.product);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load product details',
        visibilityTime: 2000,
      });
    }
  };
  
  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>  
        <View style={[styles.header, { backgroundColor: colors.surface }]}>  
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Loading...</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 50 }}>Loading product...</Text>
      </View>
    );
  }
  const [expandedComments, setExpandedComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  // Sample comments data
  const comments = [
    { id: '1', user: 'John Doe', rating: 5, comment: 'Amazing chocolate! So rich and creamy.', date: '2023-05-15' },
    { id: '2', user: 'Jane Smith', rating: 4, comment: 'Very good quality, loved the taste.', date: '2023-06-20' },
    { id: '3', user: 'Bob Johnson', rating: 5, comment: 'Best chocolate I\'ve ever tasted!', date: '2023-07-10' },
    { id: '4', user: 'Alice Brown', rating: 4, comment: 'Good value for money, will buy again.', date: '2023-08-05' },
    { id: '5', user: 'Charlie Wilson', rating: 3, comment: 'Okay taste, but a bit pricey.', date: '2023-09-12' },
  ];

  // Show only first 3 comments initially
  const visibleComments = expandedComments ? comments : comments.slice(0, 3);

  const renderComment = ({ item }: { item: any }) => (
    <View style={[styles.commentContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.commentHeader}>
        <Text style={[styles.commentUser, { color: colors.text }]}>{item.user}</Text>
        <View style={styles.ratingContainer}>
          <Text style={{ color: colors.text }}>
            {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
          </Text>
          <Text style={[styles.commentDate, { color: colors.textSecondary }]}>{item.date}</Text>
        </View>
      </View>
      <Text style={[styles.commentText, { color: colors.text }]}>{item.comment}</Text>
    </View>
  );

  // Product images (using emojis as placeholders)
  const productImages = ['🍫', '🍫', '🍫'];

  const handlePageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const calculateTotalPrice = () => {
    return (product.price * quantity).toFixed(2);
  };

  const handleAddReview = () => {
    if (reviewStars > 0 && reviewComment.trim() !== '') {
      // Here you would typically send the review to your backend
      // For now, just show a toast
      Toast.show({
        type: 'success',
        text1: 'Review Submitted',
        text2: 'Thank you for your review!',
        visibilityTime: 2000,
      });
      
      // Reset the review modal
      setReviewStars(0);
      setReviewComment('');
      setShowReviewModal(false);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select stars and add a comment',
        visibilityTime: 2000,
      });
    }
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Product Detail</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView>
          {/* Product Images Carousel */}
          <View style={styles.carouselContainer}>
            <View style={styles.imageContainer}>
              <Text style={styles.productImage}>{productImages[currentImageIndex]}</Text>
            </View>
            
            {/* Image indicators */}
            <View style={styles.indicatorContainer}>
              {productImages.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicator,
                    { backgroundColor: index === currentImageIndex ? colors.primary : colors.textSecondary }
                  ]}
                  onPress={() => handlePageChange(index)}
                />
              ))}
            </View>
          </View>

          {/* Product Info */}
          <View style={styles.infoContainer}>
            <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
            <Text style={[styles.productCategory, { color: colors.textSecondary }]}>
              {product.category}
            </Text>
            <View style={styles.ratingContainer}>
              <Text style={{ color: colors.text }}>
                {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
              </Text>
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {product.rating} ({comments.length} reviews)
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.productPrice, { color: colors.primary, fontSize: 24, fontWeight: 'bold' }]}>
                ₹{calculateTotalPrice()}
              </Text>
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                ₹{product.price} × {quantity}
              </Text>
            </View>
            <Text style={[styles.productDescription, { color: colors.text }]}>
              {product.description}
            </Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={[styles.quantityLabel, { color: colors.text }]}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={[styles.quantityButton, { backgroundColor: colors.primary }]} 
                onPress={decrementQuantity}
              >
                <Text style={[styles.quantityButtonText, { color: colors.onPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity 
                style={[styles.quantityButton, { backgroundColor: colors.primary }]} 
                onPress={incrementQuantity}
              >
                <Text style={[styles.quantityButtonText, { color: colors.onPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart Section */}
          <View style={styles.addToCartSection}>
            <TouchableOpacity 
              style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (product) {
                  // Add item to cart with specified quantity
                  addToCart({
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  }, quantity);
                  
                  Toast.show({
                    type: 'success',
                    text1: 'Added to Cart',
                    text2: `${quantity} ${product.name}(s) added to your cart`,
                    visibilityTime: 2000,
                  });
                }
              }}
            >
              <Text style={[styles.addToCartText, { color: colors.onPrimary }]}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.buyNowButton, { borderColor: colors.primary, borderWidth: 1 }]}
              onPress={() => {
                // Handle buy now functionality
                Toast.show({
                  type: 'success',
                  text1: 'Purchase Initiated',
                  text2: `Buying ${quantity} ${product.name}(s) for $${calculateTotalPrice()}`,
                  visibilityTime: 2000,
                });
              }}
            >
              <Text style={[styles.buyNowText, { color: colors.primary }]}>Buy Now</Text>
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Reviews</Text>
            <FlatList
              data={visibleComments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
            
            {comments.length > 3 && (
              <TouchableOpacity 
                style={styles.showMoreButton}
                onPress={() => setExpandedComments(!expandedComments)}
              >
                <Text style={[styles.showMoreText, { color: colors.primary }]}>
                  {expandedComments ? 'Show Less' : `Show More (${comments.length - 3})`}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Add Review Button */}
            <TouchableOpacity 
              style={[styles.addReviewButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowReviewModal(true)}
            >
              <Text style={[styles.addReviewText, { color: colors.onPrimary }]}>
                Add Review
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Review Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showReviewModal}
            onRequestClose={() => setShowReviewModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Rate this product</Text>
                
                {/* Star Rating */}
                <View style={styles.starRatingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setReviewStars(star)}>
                      <Text style={styles.star}>
                        {star <= reviewStars ? '★' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Review Comment */}
                <TextInput
                  style={[styles.reviewInput, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.textSecondary
                  }]}
                  placeholder="Share your experience with this product..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                />
                
                {/* Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.cancelButton, { backgroundColor: colors.error }]}
                    onPress={() => {
                      setShowReviewModal(false);
                      setReviewStars(0);
                      setReviewComment('');
                    }}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.onPrimary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    onPress={handleAddReview}
                  >
                    <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>
                      Submit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselContainer: {
    marginVertical: 10,
  },
  imageContainer: {
    height: 300,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    fontSize: 100,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  infoContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 16,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingText: {
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productPrice: {
    marginTop: 10,
  },
  originalPrice: {
    fontSize: 14,
    marginLeft: 10,
    textDecorationLine: 'line-through',
  },
  productDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 15,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  quantityLabel: {
    fontSize: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  addToCartSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  addToCartButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyNowButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  commentContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 12,
    marginLeft: 10,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  showMoreButton: {
    alignItems: 'center',
    padding: 10,
  },
  showMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addReviewButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addReviewText: {
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  star: {
    fontSize: 30,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
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

export default ProductDetailScreen;