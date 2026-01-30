import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bannerService, uploadService } from '../services/api';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingOverlay from './LoadingOverlay';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import styles from './Banners.module.css';

const Banners = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    offer: '',
    link: '',
    order: 0,
    isActive: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    save: false,
    delete: false,
    toggleStatus: false,
  });

  useEffect(() => {
    const loadBannersData = async () => {
      try {
        await loadBanners();
      } catch (error) {
        // If it's a duplicate request error, retry after a short delay
        if (error === 'Duplicate request prevented' || error?.message?.includes?.('Duplicate request prevented')) {
          setTimeout(() => {
            loadBanners();
          }, 500);
        }
      }
    };
    
    loadBannersData();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getAllBanners({ active: 'false' });
      if (response.data && response.data.data && response.data.data.banners) {
        setBanners(response.data.data.banners);
      } else if (response.data && response.data.banners) {
        setBanners(response.data.banners);
      }
    } catch (error) {
      // Don't show error for duplicate request prevention
      if (error === 'Duplicate request prevented' || error?.message?.includes?.('Duplicate request prevented')) {
        // Silently handle duplicate request - will retry automatically
        return;
      }
      console.error('Error loading banners:', error);
      // Only show alert for actual errors, not duplicate request prevention
      if (error.response?.data?.message || (error.message && !error.message.includes('Duplicate request prevented'))) {
        alert('Error loading banners: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('images', file);
      
      const response = await uploadService.uploadProductImages([file]);
      if (response.data && response.data.data && response.data.data.imageUrls) {
        const imageUrl = response.data.data.imageUrls[0];
        setFormData(prev => ({ ...prev, image: imageUrl }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setActionLoading(prev => ({ ...prev, save: true }));
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner._id, formData);
      } else {
        await bannerService.createBanner(formData);
      }
      
      setShowAddModal(false);
      setEditingBanner(null);
      setFormData({
        title: '',
        description: '',
        image: '',
        offer: '',
        link: '',
        order: 0,
        isActive: true,
      });
      // Retry if duplicate request error
      try {
        await loadBanners();
      } catch (retryError) {
        if (retryError === 'Duplicate request prevented' || retryError?.message?.includes?.('Duplicate request prevented')) {
          setTimeout(() => {
            loadBanners();
          }, 500);
        }
      }
    } catch (error) {
      // Don't show error for duplicate request prevention
      if (error === 'Duplicate request prevented' || error?.message?.includes?.('Duplicate request prevented')) {
        // Retry after delay
        setTimeout(() => {
          loadBanners();
        }, 500);
        // Still close modal on duplicate request
        setShowAddModal(false);
        setEditingBanner(null);
        return;
      }
      console.error('Error saving banner:', error);
      alert('Error saving banner: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      image: banner.image || '',
      offer: banner.offer || '',
      link: banner.link || '',
      order: banner.order || 0,
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    });
    setShowAddModal(true);
  };

  const handleDelete = (banner) => {
    setBannerToDelete(banner);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (bannerToDelete) {
      try {
        setActionLoading(prev => ({ ...prev, delete: true }));
        await bannerService.deleteBanner(bannerToDelete._id);
        // Retry if duplicate request error
        try {
          await loadBanners();
        } catch (retryError) {
          if (retryError === 'Duplicate request prevented' || retryError?.message?.includes?.('Duplicate request prevented')) {
            setTimeout(() => {
              loadBanners();
            }, 500);
          }
        }
        setShowDeleteModal(false);
        setBannerToDelete(null);
      } catch (error) {
        // Don't show error for duplicate request prevention
        if (error === 'Duplicate request prevented' || error?.message?.includes?.('Duplicate request prevented')) {
          // Retry after delay
          setTimeout(() => {
            loadBanners();
          }, 500);
          return;
        }
        console.error('Error deleting banner:', error);
        alert('Error deleting banner: ' + (error.response?.data?.message || error.message));
      } finally {
        setActionLoading(prev => ({ ...prev, delete: false }));
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBannerToDelete(null);
  };

  const handleToggleStatus = async (banner) => {
    try {
      setActionLoading(prev => ({ ...prev, toggleStatus: true }));
      await bannerService.updateBanner(banner._id, {
        ...banner,
        isActive: !banner.isActive,
      });
      // Retry if duplicate request error
      try {
        await loadBanners();
      } catch (retryError) {
        if (retryError === 'Duplicate request prevented' || retryError?.message?.includes?.('Duplicate request prevented')) {
          setTimeout(() => {
            loadBanners();
          }, 500);
        }
      }
    } catch (error) {
      // Don't show error for duplicate request prevention
      if (error === 'Duplicate request prevented' || error?.message?.includes?.('Duplicate request prevented')) {
        // Retry after delay
        setTimeout(() => {
          loadBanners();
        }, 500);
        return;
      }
      console.error('Error updating banner status:', error);
      alert('Error updating banner status: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(prev => ({ ...prev, toggleStatus: false }));
    }
  };

  if (loading && banners.length === 0) {
    return (
      <div className={styles.dashboardContainer}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Loading banners...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <LoadingOverlay 
        show={loading || actionLoading.save || actionLoading.delete || actionLoading.toggleStatus || uploadingImage}
        message={
          uploadingImage ? 'Uploading image...' :
          actionLoading.save ? 'Saving banner...' :
          actionLoading.delete ? 'Deleting banner...' :
          actionLoading.toggleStatus ? 'Updating banner status...' :
          'Loading banners...'
        }
      />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className={`${styles.mainContent} ${!sidebarOpen ? styles.mainContentExpanded : ''}`}>
        <Header 
          title="Banner Management"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={styles.dashboardContent}>
          {loading && banners.length > 0 && (
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
              <span>Refreshing banners...</span>
            </div>
          )}
          <div className={styles.bannersHeader}>
            <h2 className={styles.bannersTitle}>All Banners</h2>
            <button 
              className={styles.addBannerBtn} 
              onClick={() => {
                setEditingBanner(null);
                setFormData({
                  title: '',
                  description: '',
                  image: '',
                  offer: '',
                  link: '',
                  order: 0,
                  isActive: true,
                });
                setShowAddModal(true);
              }}
            >
              Add Banner
            </button>
          </div>

          {banners.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '3rem',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0 }}>
                No banners found. Click "Add Banner" to create your first banner.
              </p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Image</th>
                    <th className={styles.th}>ID</th>
                    <th className={styles.th}>Title</th>
                    <th className={styles.th}>Description</th>
                    <th className={styles.th}>Offer</th>
                    <th className={styles.th}>Order</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr key={banner._id}>
                      <td className={styles.td}>
                        {banner.image ? (
                          <img 
                            src={banner.image} 
                            alt={banner.title} 
                            className={styles.bannerImage} 
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
                          {banner._id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#1f2937',
                          fontSize: '0.95rem',
                          marginBottom: '0.25rem'
                        }}>
                          {banner.title}
                        </div>
                      </td>
                      <td className={styles.td}>
                        {banner.description ? (
                          <div style={{ 
                            fontSize: '0.85rem', 
                            color: '#6b7280', 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px'
                          }}>
                            {banner.description}
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.85rem' }}>No description</span>
                        )}
                      </td>
                      <td className={styles.td}>
                        {banner.offer ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {banner.offer}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.85rem' }}>-</span>
                        )}
                      </td>
                      <td className={styles.td}>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.9rem', 
                          color: '#374151',
                          fontWeight: '500'
                        }}>
                          {banner.order || 0}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.bannerStatus} ${banner.isActive ? styles.active : styles.inactive}`}>
                          {banner.isActive ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <button 
                          className={styles.editBtn}
                          onClick={() => handleEdit(banner)}
                          disabled={loading || actionLoading.save || actionLoading.delete || actionLoading.toggleStatus}
                        >
                          Edit
                        </button>
                        <button 
                          className={styles.toggleBtn}
                          onClick={() => handleToggleStatus(banner)}
                          disabled={loading || actionLoading.save || actionLoading.delete || actionLoading.toggleStatus}
                        >
                          {actionLoading.toggleStatus ? 'Updating...' : (banner.isActive ? 'Deactivate' : 'Activate')}
                        </button>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(banner)}
                          disabled={loading || actionLoading.save || actionLoading.delete || actionLoading.toggleStatus}
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
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h3>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && <p className={styles.uploading}>Uploading...</p>}
                {formData.image && (
                  <div className={styles.imagePreview}>
                    <img src={formData.image} alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className={styles.removeImageBtn}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Offer Text</label>
                <input
                  type="text"
                  name="offer"
                  value={formData.offer}
                  onChange={handleInputChange}
                  placeholder="e.g., 20% OFF"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Link URL</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
              <div className={styles.formGroup}>
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className={styles.cancelBtn}
                  disabled={actionLoading.save || uploadingImage}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.saveBtn} 
                  disabled={uploadingImage || actionLoading.save}
                >
                  {actionLoading.save ? (
                    <>
                      <span style={{
                        display: 'inline-block',
                        width: '14px',
                        height: '14px',
                        border: '2px solid currentColor',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        marginRight: '0.5rem',
                        verticalAlign: 'middle'
                      }}></span>
                      {editingBanner ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    `${editingBanner ? 'Update' : 'Create'} Banner`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        title="Delete Banner"
        message="Are you sure you want to delete this banner?"
        itemName={bannerToDelete?.title}
        itemDetails={bannerToDelete ? [
          { label: 'ID', value: bannerToDelete._id.substring(0, 8) + '...' },
          { label: 'Status', value: bannerToDelete.isActive ? 'Active' : 'Inactive' },
          { label: 'Order', value: bannerToDelete.order || 0 },
        ] : []}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={actionLoading.delete}
        confirmText="Delete Banner"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Banners;
