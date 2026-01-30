import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAppSelector } from '../store/hooks';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';
import Logo from '../components/Logo';
import CartIcon from '../components/CartIcon';
import productService, { Product } from '../services/productService';
import reviewService, { Review } from '../services/reviewService';

const ProductDetailScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { productId } = route.params;
  const { colors, theme } = useTheme();
  const { addToCart, getTotalItems, items: cartItems } = useCart();
  const { user } = useAppSelector((state) => state.auth);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  // All hooks must be called before any conditional returns
  const [expandedComments, setExpandedComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  
  // Fetch product details from backend
  useEffect(() => {
    loadProduct();
  }, [productId]);
  
  // Load reviews and related products when product loads
  useEffect(() => {
    if (product) {
      loadReviews();
      loadRelatedProducts();
      setCurrentImageIndex(0);
      scrollViewRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [product]);
  
  const loadProduct = async () => {
    try {
      const response = await productService.getProductById(productId);
     
      
      // API interceptor returns response.data directly
      // Backend returns: { success, statusCode, message, data: { product: {...} } }
      // So response structure is: { success, statusCode, message, data: { product: {...} } }
      const productData = response?.data?.product;
      
      if (productData && productData._id) {
        setProduct(productData);
      } else {
        console.error('Invalid product data structure. Response:', response);
        throw new Error('Product not found in response');
      }
    } catch (error: any) {
      console.error('Failed to load product:', error);
      const errorMessage = error?.message || error?.response?.message || 'Failed to load product details';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        visibilityTime: 2000,
      });
    }
  };

  const loadReviews = async () => {
    if (!product) return;
    try {
      setLoadingReviews(true);
      const response = await reviewService.getProductReviews(product._id, true);
      if (response.data && response.data.reviews) {
        setReviews(response.data.reviews);
        // Check if current user has a review
        if (user && user._id) {
          const userRev = response.data.reviews.find(
            (r: Review) => typeof r.user === 'object' && r.user._id === user._id
          );
          setUserReview(userRev || null);
        }
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadRelatedProducts = async () => {
    if (!product) return;
    
    // Check if product has a category
    if (!product.category) {
     
      setRelatedProducts([]);
      return;
    }
    
    try {
      setLoadingRelated(true);
     
      
      const response = await productService.getRelatedProducts(product.category, product._id, 4);
 
      
      // getRelatedProducts returns: { ...response, data: { ...response.data, products: [...] } }
      // response.data already contains the products array from getRelatedProducts
      let products = [];
      
      if (response?.data?.products) {
        products = response.data.products;
      } else if (response?.data?.data?.products) {
        products = response.data.data.products;
      } else if (response?.products) {
        products = response.products;
      }
      
   
      
      // Filter out the current product (should already be filtered, but double-check)
      const related = products.filter((p: Product) => {
        const isNotCurrent = p._id !== product._id;
      
        return isNotCurrent;
      });
      
     
      setRelatedProducts(related.slice(0, 4));
    } catch (error: any) {
      console.error('Failed to load related products:', error);
      console.error('Error details:', error.message, error.response);
      // Don't show error toast for related products, just log it
      setRelatedProducts([]); // Set empty array on error
    } finally {
      setLoadingRelated(false);
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

  // Show only first 3 reviews initially
  const visibleReviews = expandedComments ? reviews : reviews.slice(0, 3);

  const renderReview = ({ item }: { item: Review }) => {
    const reviewDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <View style={[styles.commentContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentUser, { color: colors.text }]}>
            {typeof item.user === 'object' ? item.user.name : 'Anonymous'}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={{ color: '#FFD700', fontSize: 16 }}>
              {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
            </Text>
            <Text style={[styles.commentDate, { color: colors.textSecondary, marginLeft: 8 }]}>
              {reviewDate}
            </Text>
          </View>
        </View>
        {item.comment && (
          <Text style={[styles.commentText, { color: colors.text }]}>{item.comment}</Text>
        )}
      </View>
    );
  };

  const renderRelatedProduct = ({ item }: { item: Product }) => {
    const isValidImageUrl = item.image && (
      item.image.startsWith('http://') || item.image.startsWith('https://')
    );

    return (
      <TouchableOpacity
        style={[styles.relatedProductCard, { backgroundColor: colors.surface }]}
        onPress={() => {
          navigation.replace('ProductDetail', { productId: item._id });
        }}
      >
        {isValidImageUrl ? (
          <Image source={{ uri: item.image }} style={styles.relatedProductImage} resizeMode="cover" />
        ) : (
          <View style={styles.relatedProductImagePlaceholder}>
            <Text style={styles.relatedProductImageEmoji}>{item.image || '🍫'}</Text>
          </View>
        )}
        <Text style={[styles.relatedProductName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.relatedProductPrice, { color: colors.primary }]}>
          ₹{item.price.toFixed(2)}
        </Text>
        <View style={styles.relatedProductRating}>
          <Text style={{ color: '#FFD700', fontSize: 12 }}>
            {'★'.repeat(Math.floor(item.rating))}{'☆'.repeat(5 - Math.floor(item.rating))}
          </Text>
          <Text style={[styles.relatedProductRatingText, { color: colors.textSecondary }]}>
            ({item.numReviews || 0})
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Helper function to check if string is a valid URL
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Get product images - use product.image and product.images array
  const getProductImages = (): string[] => {
    const images: string[] = [];
    if (product.image && isValidImageUrl(product.image)) {
      images.push(product.image);
    }
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && isValidImageUrl(img)) {
          images.push(img);
        }
      });
    }
    // Fallback to emoji if no valid images
    return images.length > 0 ? images : ['🍫'];
  };

  const productImages = getProductImages();

  const handlePageChange = (index: number) => {
    setCurrentImageIndex(index);
    // Scroll to the selected image
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    if (index !== currentImageIndex && index >= 0 && index < productImages.length) {
      setCurrentImageIndex(index);
    }
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

  const handleAddReview = async () => {
    if (!product) return;

    if (reviewStars === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a rating',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      if (editingReview) {
        // Update existing review
        await reviewService.updateReview(editingReview._id, {
          rating: reviewStars,
          comment: reviewComment.trim(),
        });
        Toast.show({
          type: 'success',
          text1: 'Review Updated',
          text2: 'Your review has been updated successfully',
          visibilityTime: 2000,
        });
      } else {
        // Create new review
        await reviewService.createReview({
          product: product._id,
          rating: reviewStars,
          comment: reviewComment.trim(),
        });
        Toast.show({
          type: 'success',
          text1: 'Review Submitted',
          text2: 'Thank you! Your review will be visible after approval.',
          visibilityTime: 3000,
        });
      }

      // Reset and reload
      setReviewStars(0);
      setReviewComment('');
      setEditingReview(null);
      setShowReviewModal(false);
      await loadProduct(); // Reload product to get updated rating
      await loadReviews(); // Reload reviews
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to submit review',
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
          <View style={styles.headerTitleContainer}>
            <Logo size={30} style={styles.headerLogo} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Product Detail</Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              navigation.navigate('Cart');
            }}
            style={styles.cartButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CartIcon size={24} focused={true} color={colors.primary} />
            {getTotalItems() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <ScrollView>
          {/* Product Images Carousel with Swipe */}
          <View style={styles.carouselContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.imageScrollView}
              contentContainerStyle={styles.imageScrollContent}
            >
              {productImages.map((imageUrl, index) => (
                <View key={index} style={[styles.imageContainer, { width: screenWidth }]}>
                  {isValidImageUrl(imageUrl) ? (
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.productImage}
                      resizeMode="cover"
                      onError={() => {
                       
                      }}
                    />
                  ) : (
                    <Text style={styles.productImageEmoji}>{imageUrl || '🍫'}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
            
            {/* Image indicators */}
            {productImages.length > 1 && (
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
            )}
          </View>

          {/* Product Info */}
          <View style={styles.infoContainer}>
            <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
            <Text style={[styles.productCategory, { color: colors.textSecondary }]}>
              {product.category}
            </Text>
            <View style={styles.ratingContainer}>
              <Text style={{ color: '#FFD700', fontSize: 18 }}>
                {'★'.repeat(Math.floor(product.rating || 0))}{'☆'.repeat(5 - Math.floor(product.rating || 0))}
              </Text>
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {product.rating ? product.rating.toFixed(1) : '0.0'} ({product.numReviews || 0} reviews)
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
            {/* Stock Status */}
            {product && (product.inStock === false || (product.stock !== undefined && product.stock <= 0)) && (
              <View style={[styles.stockStatusContainer, { backgroundColor: colors.error + '20' }]}>
                <Text style={[styles.stockStatusText, { color: colors.error }]}>
                  ⚠️ This product is currently out of stock
                </Text>
              </View>
            )}
            
            <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.addToCartButton, 
                { 
                  backgroundColor: (product && (product.inStock === false || (product.stock !== undefined && product.stock <= 0)))
                    ? colors.textSecondary 
                    : colors.primary 
                }
              ]}
              onPress={() => {
                if (product) {
                  // Check if product is out of stock
                  if (product.inStock === false || (product.stock !== undefined && product.stock <= 0)) {
                    Toast.show({
                      type: 'info',
                      text1: 'Out of Stock',
                      text2: `${product.name} is currently out of stock`,
                      visibilityTime: 2000,
                    });
                    return;
                  }
                  
                  // Check if requested quantity exceeds available stock
                  if (product.stock !== undefined && quantity > product.stock) {
                    Toast.show({
                      type: 'info',
                      text1: 'Insufficient Stock',
                      text2: `Only ${product.stock} item(s) available`,
                      visibilityTime: 2000,
                    });
                    return;
                  }
                  
                  // Check if product is already in cart
                  const isAlreadyInCart = cartItems.some(cartItem => cartItem.id === product._id);
                  
                  if (isAlreadyInCart) {
                    Toast.show({
                      type: 'info',
                      text1: 'Already Added',
                      text2: `${product.name} is already in your cart`,
                      visibilityTime: 2000,
                    });
                    return;
                  }
                  
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
              disabled={product ? (product.inStock === false || (product.stock !== undefined && product.stock <= 0)) : false}
            >
              <Text style={[styles.addToCartText, { color: colors.onPrimary }]}>
                {product && (product.inStock === false || (product.stock !== undefined && product.stock <= 0))
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
              
            <TouchableOpacity 
              style={[
                styles.buyNowButton, 
                { 
                  borderColor: (product && (product.inStock === false || (product.stock !== undefined && product.stock <= 0)))
                    ? colors.textSecondary 
                    : colors.primary, 
                  borderWidth: 1 
                }
              ]}
              onPress={() => {
                if (product) {
                  // Check if product is out of stock
                  if (product.inStock === false || (product.stock !== undefined && product.stock <= 0)) {
                    Toast.show({
                      type: 'info',
                      text1: 'Out of Stock',
                      text2: `${product.name} is currently out of stock`,
                      visibilityTime: 2000,
                    });
                    return;
                  }
                  
                  // Check if requested quantity exceeds available stock
                  if (product.stock !== undefined && quantity > product.stock) {
                    Toast.show({
                      type: 'info',
                      text1: 'Insufficient Stock',
                      text2: `Only ${product.stock} item(s) available`,
                      visibilityTime: 2000,
                    });
                    return;
                  }
                  
                    // Add item to cart and navigate to cart screen
                    const isAlreadyInCart = cartItems.some(cartItem => cartItem.id === product._id);
                    
                    if (!isAlreadyInCart) {
                      addToCart({
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                      }, quantity);
                    }
                    
                    // Navigate to cart screen
                    navigation.navigate('Cart');
                }
              }}
              disabled={product ? (product.inStock === false || (product.stock !== undefined && product.stock <= 0)) : false}
            >
              <Text style={[
                styles.buyNowText, 
                { 
                  color: (product && (product.inStock === false || (product.stock !== undefined && product.stock <= 0)))
                    ? colors.textSecondary 
                    : colors.primary 
                }
              ]}>
                Buy Now
              </Text>
            </TouchableOpacity>
            </View>
          </View>

          {/* Related Products Section */}
          {product && (
            <View style={styles.relatedProductsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Related Products</Text>
              {loadingRelated ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
              ) : relatedProducts.length > 0 ? (
                <FlatList
                  data={relatedProducts}
                  renderItem={renderRelatedProduct}
                  keyExtractor={(item) => item._id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedProductsList}
                />
              ) : (
                <View style={styles.noRelatedProducts}>
                  <Text style={[styles.noRelatedProductsText, { color: colors.textSecondary }]}>
                    No related products found
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.commentsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Customer Reviews ({reviews.length})
              </Text>
            </View>
            
            {loadingReviews ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : reviews.length > 0 ? (
              <>
                <FlatList
                  data={visibleReviews}
                  renderItem={renderReview}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                />
                
                {reviews.length > 3 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => setExpandedComments(!expandedComments)}
                  >
                    <Text style={[styles.showMoreText, { color: colors.primary }]}>
                      {expandedComments ? 'Show Less' : `Show More (${reviews.length - 3})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.noReviewsContainer}>
                <Text style={[styles.noReviewsText, { color: colors.textSecondary }]}>
                  No reviews yet. Be the first to review!
                </Text>
              </View>
            )}
            
            {/* Add Review Button - Only show if user is logged in */}
            {user && (
              <TouchableOpacity 
                style={[styles.addReviewButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  if (userReview) {
                    setEditingReview(userReview);
                    setReviewStars(userReview.rating);
                    setReviewComment(userReview.comment || '');
                  } else {
                    setEditingReview(null);
                    setReviewStars(0);
                    setReviewComment('');
                  }
                  setShowReviewModal(true);
                }}
              >
                <Text style={[styles.addReviewText, { color: colors.onPrimary }]}>
                  {userReview ? 'Edit Review' : 'Add Review'}
                </Text>
              </TouchableOpacity>
            )}
            {!user && (
              <View style={[styles.loginPrompt, { backgroundColor: colors.surface }]}>
                <Text style={[styles.loginPromptText, { color: colors.textSecondary }]}>
                  Please login to add a review
                </Text>
              </View>
            )}
          </View>
          
          {/* Review Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={showReviewModal}
            onRequestClose={() => setShowReviewModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
                <View style={styles.modalIconContainer}>
                  <Text style={styles.modalIcon}>⭐</Text>
                </View>
                
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingReview ? 'Edit Review' : 'Rate this product'}
                </Text>
                
                {/* Star Rating */}
                <View style={styles.starRatingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setReviewStars(star)}>
                      <Text style={[styles.star, { color: star <= reviewStars ? '#FFD700' : colors.textSecondary }]}>
                        {star <= reviewStars ? '★' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {reviewStars > 0 && (
                  <Text style={[styles.ratingText, { color: colors.textSecondary, textAlign: 'center', marginTop: 5, marginBottom: 20 }]}>
                    {reviewStars} out of 5 stars
                  </Text>
                )}
                
                {/* Review Comment */}
                <TextInput
                  style={[styles.reviewInput, { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.textSecondary
                  }]}
                  placeholder="Share your experience with this product... (Optional)"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  maxLength={500}
                />
                <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                  {reviewComment.length}/500
                </Text>
                
                {/* Buttons */}
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity 
                    style={[styles.modalCancelButton, { backgroundColor: colors.textSecondary + '20', borderColor: colors.textSecondary }]}
                    onPress={() => {
                      setShowReviewModal(false);
                      setReviewStars(0);
                      setReviewComment('');
                      setEditingReview(null);
                    }}
                  >
                    <Text style={[styles.modalCancelButtonText, { color: colors.text }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalConfirmButton, { backgroundColor: colors.primary }]}
                    onPress={handleAddReview}
                  >
                    <Text style={[styles.modalConfirmButtonText, { color: colors.onPrimary }]}>
                      {editingReview ? 'Update Review' : 'Submit Review'}
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
  imageScrollView: {
    flexGrow: 0,
  },
  imageScrollContent: {
    alignItems: 'center',
  },
  imageContainer: {
    height: 300,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImageEmoji: {
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
    padding: 20,
    paddingRight: 25,
    paddingBottom: 10,
  },
  buyNowSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stockStatusContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  stockStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
    minWidth: 40,
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
  relatedProductsSection: {
    padding: 20,
    paddingTop: 0,
  },
  relatedProductsList: {
    paddingVertical: 10,
  },
  relatedProductCard: {
    width: 150,
    marginRight: 15,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  relatedProductImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedProductImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  relatedProductImageEmoji: {
    fontSize: 50,
  },
  relatedProductName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    minHeight: 36,
  },
  relatedProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  relatedProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relatedProductRatingText: {
    fontSize: 12,
    marginLeft: 5,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  noReviewsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noReviewsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  star: {
    fontSize: 32,
    marginHorizontal: 5,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  loginPrompt: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginPromptText: {
    fontSize: 14,
    textAlign: 'center',
  },
  noRelatedProducts: {
    padding: 20,
    alignItems: 'center',
  },
  noRelatedProductsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default ProductDetailScreen;