import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, deleteProduct, setCurrentFilter } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingOverlay from './LoadingOverlay';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import styles from './Products.module.css';

const Products = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, loading, error, pagination, currentFilter } = useSelector(state => state.products);
  const { items: categories } = useSelector(state => state.categories);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    delete: false,
    pagination: false,
  });

  // Get unique categories from products for filter dropdown (fallback)
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  
  // Use all categories from store for filter dropdown (includes categories without products)
  const allCategories = Array.isArray(categories) ? categories : [];
  const categoryNames = allCategories.length > 0 
    ? allCategories.map(cat => cat.name).filter(Boolean)
    : uniqueCategories; // Fallback to uniqueCategories if categories not loaded yet

  useEffect(() => {
    // Fetch all categories (both active and inactive) for the filter dropdown
    dispatch(fetchCategories(false));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts(currentFilter));
  }, [dispatch, currentFilter]);

  const handleEdit = (product) => {
    if (!product) return;
    navigate(`/products/edit/${product._id}`);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        setActionLoading(prev => ({ ...prev, delete: true }));
        await dispatch(deleteProduct(productToDelete._id));
        // Refresh products after deletion
        await dispatch(fetchProducts(currentFilter));
        setShowDeleteModal(false);
        setProductToDelete(null);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + (error?.message || 'Unknown error'));
      } finally {
        setActionLoading(prev => ({ ...prev, delete: false }));
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setCurrentFilter({ [filterType]: value, page: 1 }));
  };

  const handlePageChange = async (newPage) => {
    setActionLoading(prev => ({ ...prev, pagination: true }));
    try {
    dispatch(setCurrentFilter({ page: newPage }));
      await dispatch(fetchProducts({ ...currentFilter, page: newPage }));
    } finally {
      setActionLoading(prev => ({ ...prev, pagination: false }));
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className={styles.dashboardContainer}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <LoadingOverlay 
        show={loading || actionLoading.delete || actionLoading.pagination}
        message={
          actionLoading.delete ? 'Deleting product...' :
          actionLoading.pagination ? 'Loading page...' :
          'Loading products...'
        }
      />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <main className={`${styles.mainContent} ${!sidebarOpen ? styles.mainContentExpanded : ''}`}>
        <Header 
          title="Product Management"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={styles.dashboardContent}>
          {loading && products.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              color: '#1e40af',
              fontSize: '0.9rem',
              fontWeight: '500',
              marginBottom: '1rem',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #3b82f6',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></div>
              <span>Refreshing products...</span>
            </div>
          )}
              <div className={styles.productsHeader}>
                <h2 className={styles.productsTitle}>All Products</h2>
            <button 
              className={styles.addProductBtn} 
              onClick={() => navigate('/products/add')}
            >
                  Add Product
                </button>
              </div>

          {/* Filters */}
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={currentFilter.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <select 
                value={currentFilter.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All Categories</option>
                {categoryNames.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <select 
                value={currentFilter.inStock || ''}
                onChange={(e) => handleFilterChange('inStock', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All Stock Status</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <select 
                value={currentFilter.sort || 'newest'}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

              {Array.isArray(products) && products.length === 0 ? (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '3rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0 }}>
                    No products found. Click "Add Product" to create your first product.
                  </p>
                </div>
              ) : (
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
                                const parent = e.target.parentElement;
                                if (parent && !parent.querySelector('.no-image-placeholder')) {
                                  const placeholder = document.createElement('span');
                                  placeholder.className = 'no-image-placeholder';
                                  placeholder.textContent = 'No Image';
                                  placeholder.style.cssText = 'color: #9ca3af; font-size: 0.75rem; font-style: italic;';
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontStyle: 'italic' }}>No Image</span>
                          )}
                        </td>
                        <td className={styles.td}>
                          <span style={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.8rem', 
                            color: '#6b7280',
                            background: '#f3f4f6',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}>
                            {product._id.substring(0, 8)}...
                          </span>
                        </td>
                        <td className={styles.td}>
                          <div style={{ 
                            fontWeight: '600', 
                            color: '#1f2937',
                            fontSize: '0.95rem',
                            marginBottom: '0.25rem'
                          }}>
                            {product.name}
                          </div>
                          {product.description && (
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: '#6b7280', 
                              marginTop: '0.25rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px',
                              lineHeight: '1.4'
                            }}>
                              {product.description}
                            </div>
                          )}
                        </td>
                        <td className={styles.td}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            backgroundColor: '#e0e7ff',
                            color: '#3730a3',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {product.category}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span style={{ 
                            fontWeight: '600', 
                            color: '#059669',
                            fontSize: '1rem'
                          }}>
                            ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.35rem 0.85rem',
                            borderRadius: '6px',
                            backgroundColor: product.stock > 10 ? '#dcfce7' : product.stock > 0 ? '#fef3c7' : '#fee2e2',
                            color: product.stock > 10 ? '#166534' : product.stock > 0 ? '#92400e' : '#991b1b',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            minWidth: '60px',
                            textAlign: 'center',
                            fontFamily: 'monospace'
                          }}>
                            {product.stock || 0}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {(() => {
                            const isActuallyInStock = product.inStock && product.stock > 0;
                            return (
                              <span style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '6px',
                                backgroundColor: isActuallyInStock ? '#dcfce7' : '#fee2e2',
                                color: isActuallyInStock ? '#166534' : '#991b1b',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                {isActuallyInStock ? '✓ Yes' : '✗ No'}
                              </span>
                            );
                          })()}
                        </td>
                        <td className={styles.actionsCell}>
                          <button 
                            className={styles.editBtn} 
                            onClick={() => handleEdit(product)}
                            disabled={loading || actionLoading.delete}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.deleteBtn} 
                            onClick={() => handleDelete(product)}
                            disabled={loading || actionLoading.delete}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                      </div>
                    )}
                    
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className={styles.paginationContainer}>
                        <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || actionLoading.pagination || loading}
                className={styles.paginationBtn}
                        >
                {actionLoading.pagination ? 'Loading...' : 'Previous'}
                        </button>
              
              <span className={styles.paginationInfo}>
                Page {pagination.page} of {pagination.pages} ({pagination.total || products.length} total)
              </span>
              
                                <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || actionLoading.pagination || loading}
                className={styles.paginationBtn}
              >
                {actionLoading.pagination ? 'Loading...' : 'Next'}
                  </button>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        itemName={productToDelete?.name}
        itemDetails={productToDelete ? [
          { label: 'ID', value: productToDelete._id.substring(0, 8) + '...' },
          { label: 'Category', value: productToDelete.category || 'N/A' },
          { label: 'Price', value: `₹${Number(productToDelete.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        ] : []}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={actionLoading.delete}
        confirmText="Delete Product"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Products;