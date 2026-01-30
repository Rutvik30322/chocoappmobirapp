import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, createProduct, updateProduct } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { uploadService } from '../services/api';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingOverlay from './LoadingOverlay';
import styles from './Products.module.css';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector(state => state.products);
  const { items: categoriesFromStore } = useSelector(state => state.categories);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    rating: '',
    inStock: true,
    stock: '',
    weight: '',
    ingredients: '',
    image: '',
    images: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingAdditionalImages, setUploadingAdditionalImages] = useState(false);

  const isEditMode = id && id !== 'new';
  const isUploading = uploadingMainImage || uploadingAdditionalImages;

  useEffect(() => {
    // Fetch all categories (both active and inactive) for product creation/edit
    dispatch(fetchCategories(false));
    if (isEditMode) {
      dispatch(fetchProducts());
    }
  }, [dispatch, isEditMode]);

  useEffect(() => {
    if (categoriesFromStore && categoriesFromStore.length > 0) {
      setCategories(categoriesFromStore);
    }
  }, [categoriesFromStore]);

  useEffect(() => {
    if (isEditMode && products.length > 0) {
      const product = products.find(p => p._id === id);
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          category: product.category || '',
          rating: product.rating || '',
          inStock: typeof product.inStock !== 'undefined' ? product.inStock : true,
          stock: product.stock || '',
          weight: product.weight || '',
          ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : (product.ingredients || ''),
          image: product.image || '',
          images: Array.isArray(product.images) ? [...product.images] : []
        });
      }
    } else if (!isEditMode) {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        rating: '',
        inStock: true,
        stock: '',
        weight: '',
        ingredients: '',
        image: '',
        images: []
      });
    }
  }, [id, products, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const productData = { ...formData };
      
      if (productData.ingredients && typeof productData.ingredients === 'string') {
        productData.ingredients = productData.ingredients.split(',').map(item => item.trim()).filter(item => item);
      }
      
      const imageValue = productData.image;
      const isValidImageUrl = imageValue && 
                              typeof imageValue === 'string' && 
                              imageValue.trim() !== '' && 
                              imageValue.trim() !== '🍫' &&
                              (imageValue.startsWith('http://') || imageValue.startsWith('https://'));
      
      if (isValidImageUrl) {
        productData.image = imageValue.trim();
      } else {
        delete productData.image;
      }
      
      if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
        const validImages = productData.images.filter(img => 
          img && 
          typeof img === 'string' && 
          img.trim() !== '' && 
          img.trim() !== '🍫' &&
          (img.startsWith('http://') || img.startsWith('https://'))
        );
        
        if (validImages.length > 0) {
          productData.images = validImages;
        } else {
          delete productData.images;
        }
      } else {
        delete productData.images;
      }
      
      if (isEditMode) {
        await dispatch(updateProduct({ id, productData }));
      } else {
        await dispatch(createProduct(productData));
      }

      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdditionalImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadingAdditionalImages(true);
    try {
      const uploadResponse = await uploadService.uploadProductImages(files);
      
      if (uploadResponse.data && 
          uploadResponse.data.data && 
          uploadResponse.data.data.imageUrls && 
          uploadResponse.data.data.imageUrls.length > 0) {
        const imageUrls = uploadResponse.data.data.imageUrls;
        
        const validImageUrls = imageUrls.filter(url => 
          url && typeof url === 'string' && 
          (url.startsWith('http://') || url.startsWith('https://'))
        );
        
        if (validImageUrls.length > 0) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...validImageUrls]
          }));
          e.target.value = '';
          alert(`${validImageUrls.length} additional image(s) uploaded successfully!`);
        } else {
          alert('Error: No valid image URLs received from server');
        }
      } else {
        alert('Error: No image URLs received from server');
      }
    } catch (error) {
      console.error('Error uploading additional images:', error);
      alert('Error uploading images: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingAdditionalImages(false);
    }
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingMainImage(true);
      try {
        const uploadResponse = await uploadService.uploadProductImages([file]);
        
        if (uploadResponse.data && 
            uploadResponse.data.data && 
            uploadResponse.data.data.imageUrls && 
            uploadResponse.data.data.imageUrls.length > 0) {
          const imageUrl = uploadResponse.data.data.imageUrls[0];
          
          if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            setFormData(prev => ({
              ...prev,
              image: imageUrl
            }));
            e.target.value = '';
            alert('Main image uploaded successfully!');
          } else {
            alert('Error: Invalid image URL received from server');
          }
        } else {
          alert('Error: No image URL received from server');
        }
      } catch (error) {
        console.error('Error uploading main image:', error);
        alert('Error uploading image: ' + (error.response?.data?.message || error.message));
      } finally {
        setUploadingMainImage(false);
      }
    }
  };

  if (loading && !isEditMode) {
    return (
      <div className={styles.dashboardContainer}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={styles.mainContent}>
          <div className={styles.loading}>Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <LoadingOverlay 
        show={isLoading || uploadingMainImage || uploadingAdditionalImages}
        message={
          uploadingMainImage ? 'Uploading main image...' :
          uploadingAdditionalImages ? 'Uploading images...' :
          isLoading ? (isEditMode ? 'Updating product...' : 'Creating product...') :
          'Loading...'
        }
      />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className={`${styles.mainContent} ${!sidebarOpen ? styles.mainContentExpanded : ''}`}>
        <Header 
          title={isEditMode ? 'Edit Product' : 'Add New Product'}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={styles.dashboardContent}>
          <div className={styles.formPageContainer}>
            {/* Back Button */}
            <button 
              className={styles.backButton}
              onClick={() => navigate('/products')}
            >
              ← Back to Products
            </button>

            <div className={styles.formContainer}>
              <h2 className={styles.formTitle}>
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form onSubmit={handleSubmit} className={styles.productForm}>
                {/* Basic Information Section */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Basic Information</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name">Product Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter product name"
                      />
                    </div>
                    
                    <div className={styles.formGroup} style={{ marginLeft: '0.5rem' }}>
                      <label htmlFor="category">Category *</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                      {categories.length === 0 && (
                        <small className={styles.helpText}>
                          No categories available. Please add categories first.
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product description"
                    rows="4"
                  />
                </div>

                {/* Pricing & Stock Section */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Pricing & Stock</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="price">Price (₹) *</label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="stock">Stock Quantity *</label>
                      <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="rating">Rating</label>
                      <input
                        type="number"
                        id="rating"
                        name="rating"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={handleInputChange}
                        placeholder="0.0"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="weight">Weight</label>
                      <input
                        type="text"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="e.g., 100g"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                      />
                      <span>Product is in stock</span>
                    </label>
                  </div>
                </div>

                {/* Additional Details Section */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Additional Details</h3>
                  <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
                    <label htmlFor="ingredients">Ingredients (comma separated)</label>
                    <input
                      type="text"
                      id="ingredients"
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleInputChange}
                      placeholder="e.g., Cocoa beans, Sugar, Milk"
                    />
                  </div>
                </div>

                {/* Images Section */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Product Images</h3>
                  
                  {/* Main Image */}
                  <div className={styles.formGroup} style={{ marginBottom: '2rem' }}>
                    <label htmlFor="mainImageUpload">Main Image *</label>
                    <input
                      type="file"
                      id="mainImageUpload"
                      name="mainImageUpload"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      disabled={uploadingMainImage || uploadingAdditionalImages}
                    />
                    {uploadingMainImage && (
                      <div className={styles.uploadingIndicator}>
                        <span className={styles.spinner}></span>
                        <span>Uploading main image...</span>
                      </div>
                    )}
                    <small className={styles.helpText}>
                      Upload the main product image (will be set automatically)
                    </small>
                    
                    {formData.image && formData.image !== '🍫' && (
                      <div className={styles.imagePreviewContainer}>
                        <div className={styles.imagePreview}>
                          <img 
                            src={formData.image} 
                            alt="Main Preview" 
                            className={styles.previewImage}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, image: '' }));
                            }}
                            className={styles.removeImageButton}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Images */}
                  <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                    <label htmlFor="additionalImagesUpload">Additional Images</label>
                    <input
                      type="file"
                      id="additionalImagesUpload"
                      name="additionalImagesUpload"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImageUpload}
                      disabled={uploadingMainImage || uploadingAdditionalImages}
                    />
                    {uploadingAdditionalImages && (
                      <div className={styles.uploadingIndicator}>
                        <span className={styles.spinner}></span>
                        <span>Uploading additional images...</span>
                      </div>
                    )}
                    <small className={styles.helpText}>
                      Upload additional product images (multiple selection allowed)
                    </small>
                    
                    {formData.images.length > 0 && (
                      <div className={styles.additionalImagesContainer}>
                        {formData.images.map((imgUrl, index) => (
                          <div key={index} className={styles.additionalImageWrapper}>
                            <img 
                              src={imgUrl} 
                              alt={`Additional ${index + 1}`} 
                              className={styles.additionalImage}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }));
                              }}
                              className={styles.removeImageButton}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    className={styles.cancelBtn} 
                    onClick={() => navigate('/products')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.saveBtn}
                    disabled={isLoading || isUploading}
                  >
                    {isLoading ? 'Saving...' : isUploading ? 'Uploading Images...' : (isEditMode ? 'Update Product' : 'Save Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProduct;
