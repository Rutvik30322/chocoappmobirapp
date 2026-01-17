import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../store/slices/productSlice';
import { uploadService } from '../services/api';
import { adminLogout } from '../store/slices/authSlice';
import styles from './Products.module.css';

const Products = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector(state => state.products);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Products', path: '/products', icon: '📦' },
    { name: 'Orders', path: '/orders', icon: '📋' },
    { name: 'Customers', path: '/customers', icon: '👥' },
    { name: 'Categories', path: '/categories', icon: '🏷️' },
    { name: 'Analytics', path: '/analytics', icon: '📊' },
  ];

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Skip updating the image field since it's now controlled by file upload only
    if (name === 'image') return;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Log the image URLs being sent to the backend
    console.log('Submitting product data with image URLs:', {
      image: formData.image,
      images: formData.images
    });
    
    try {
      if (editingProduct) {
        // Update existing product
        await dispatch(updateProduct({ id: editingProduct._id, productData: formData }));
      } else {
        // Create new product
        await dispatch(createProduct(formData));
      }

      // Reset form and close form
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
      setEditingProduct(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    if (!product) return;
    console.log('Loading product for edit:', {
      productId: product._id,
      productName: product.name,
      productImage: product.image,
      productImages: product.images
    });
    setEditingProduct(product);
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
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleCancel = () => {
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
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className={styles.loading}>Loading products...</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Admin Panel</h2>
          <button 
            className={styles.closeSidebarBtn} 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <nav className={styles.navMenu}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.path} className={styles.navItem}>
                <Link 
                  to={item.path} 
                  className={styles.navLink}
                  onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navText}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.dashboardHeader}>
          <button 
            className={styles.menuToggleBtn} 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 className={styles.dashboardTitle}>Product Management</h1>
          <button className={styles.logoutBtn} onClick={() => {
            dispatch(adminLogout());
            navigate('/login');
          }}>
            Logout
          </button>
        </header>
        
        <div className={styles.dashboardContent}>
          {!showForm ? (
            <>
              <div className={styles.productsHeader}>
                <h2 className={styles.productsTitle}>All Products</h2>
                <button className={styles.addProductBtn} onClick={() => {
                  setEditingProduct(null);
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
                  setShowForm(true);
                }}>
                  Add Product
                </button>
              </div>
    
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Image</th>
                      <th className={styles.th}>ID</th>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Category</th>
                      <th className={styles.th}>Price</th>
                      <th className={styles.th}>Stock</th>
                      <th className={styles.th}>In Stock</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(products) && products.map((product) => (
                      <tr key={product._id}>
                        <td className={styles.td}>
                          {product.image || product.images?.length > 0 ? (
                            <img 
                              src={product.image || product.images[0]} 
                              alt={product.name} 
                              className={styles.productImage} 
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </td>
                        <td className={styles.td}>{product._id.substring(0, 8)}...</td>
                        <td className={styles.td}>{product.name}</td>
                        <td className={styles.td}>{product.category}</td>
                        <td className={styles.td}>₹{product.price}</td>
                        <td className={styles.td}>{product.stock}</td>
                        <td className={styles.td}>{product.inStock ? 'Yes' : 'No'}</td>
                        <td className={styles.actionsCell}>
                          <button className={styles.editBtn} onClick={() => handleEdit(product)}>
                            Edit
                          </button>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(product._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className={styles.formContainer}>
              <h2 className={styles.formTitle}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Name:</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="category">Category:</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="price">Price:</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="stock">Stock:</label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="rating">Rating:</label>
                    <input
                      type="number"
                      id="rating"
                      name="rating"
                      step="0.1"
                      value={formData.rating}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="weight">Weight:</label>
                    <input
                      type="text"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                      />
                      &nbsp;In Stock
                    </label>
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="ingredients">Ingredients (comma separated):</label>
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
                              
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="mainImageUpload">Main Image:</label>
                    <input
                      type="file"
                      id="mainImageUpload"
                      name="mainImageUpload"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const uploadResponse = await uploadService.uploadProductImages([file]);
                            if (uploadResponse.data && uploadResponse.data.imageUrls && uploadResponse.data.imageUrls.length > 0) {
                              const imageUrl = uploadResponse.data.imageUrls[0];
                              
                              // Set the uploaded image as the main image and also add it to the images array
                              setFormData(prev => ({
                                ...prev,
                                image: imageUrl,
                                images: [...prev.images, imageUrl]
                              }));
                              
                              console.log('Main image uploaded:', {
                                imageUrl: imageUrl,
                                images: [...prev.images, imageUrl]
                              });
                              
                              // Clear the file input
                              e.target.value = '';
                              
                              alert('Main image uploaded successfully!');
                            }
                          } catch (error) {
                            console.error('Error uploading main image:', error);
                            // Check if it's a 401 error and redirect to login
                            if (error.response?.status === 401) {
                              alert('Session expired. Please log in again.');
                              localStorage.removeItem('adminToken');
                              window.location.href = '/login';
                            }
                          }
                        }
                      }}
                    />
                    <small className={styles.helpText}>Upload main product image (will be set automatically)</small>
                    
                    {/* Display the Cloudinary URL if available */}
                    {formData.image && formData.image !== '🍫' && (
                      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '12px', color: '#555' }}>Cloudinary Image URL:</p>
                        <p style={{ margin: '0', fontSize: '12px', wordBreak: 'break-all', color: '#666' }}>{formData.image}</p>
                      </div>
                    )}
                    
                    {formData.image && formData.image !== '🍫' && (
                      <div className={styles.imagePreview}>
                        <img 
                          src={formData.image} 
                          alt="Main Preview" 
                          style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                          onError={(e) => {
                            console.log('Image failed to load:', e.target.src);
                            // Replace with fallback content instead of hiding
                            e.target.style.display = 'none';
                            
                            // Find the parent container and add error message
                            const parentDiv = e.target.parentElement;
                            if (parentDiv) {
                              const errorDiv = document.createElement('div');
                              errorDiv.textContent = 'Failed to load image';
                              errorDiv.style.width = '200px';
                              errorDiv.style.height = '200px';
                              errorDiv.style.border = '1px solid #ddd';
                              errorDiv.style.borderRadius = '4px';
                              errorDiv.style.display = 'flex';
                              errorDiv.style.alignItems = 'center';
                              errorDiv.style.justifyContent = 'center';
                              errorDiv.style.backgroundColor = '#f9f9f9';
                              errorDiv.style.color = '#999';
                              errorDiv.style.marginTop = '10px';
                              parentDiv.appendChild(errorDiv);
                            }
                          }}
                        />
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                          Main image preview
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Display additional images */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Additional Images:</label>
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
                                // Remove image from images array
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
                    {formData.images.length === 0 && (
                      <p style={{ fontStyle: 'italic', color: '#666' }}>No additional images uploaded</p>
                    )}
                  </div>
                </div>
                              
                
                
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    {editingProduct ? 'Update Product' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      
      {/* Overlay for mobile */}
      {sidebarOpen && <div 
        className={styles.overlay} 
        onClick={() => setSidebarOpen(false)}
      />}
    </div>
  );
};

export default Products;