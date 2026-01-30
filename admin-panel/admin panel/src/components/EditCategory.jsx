import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories, createCategory, updateCategory } from '../store/slices/categorySlice';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingOverlay from './LoadingOverlay';
import styles from './Categories.module.css';
import dashboardStyles from './Dashboard.module.css';

const EditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items: categories, loading } = useSelector(state => state.categories);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🍫',
    description: '',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = id && id !== 'new';

  useEffect(() => {
    dispatch(fetchCategories(true));
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode && categories.length > 0) {
      const category = categories.find(c => c._id === id);
      if (category) {
        setFormData({
          name: category.name || '',
          icon: category.icon || '🍫',
          description: category.description || '',
          isActive: typeof category.isActive !== 'undefined' ? category.isActive : true,
        });
      }
    } else if (!isEditMode) {
      // Reset form for new category
      setFormData({
        name: '',
        icon: '🍫',
        description: '',
        isActive: true,
      });
    }
  }, [id, categories, isEditMode]);

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
      const categoryData = { ...formData };
      
      if (isEditMode) {
        await dispatch(updateCategory({ id, categoryData }));
      } else {
        await dispatch(createCategory(categoryData));
      }

      // Navigate back to categories list
      navigate('/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || (isEditMode && categories.length === 0)) {
    return (
      <div className={dashboardStyles.dashboardContainer}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={dashboardStyles.mainContent}>
          <div className={dashboardStyles.loading}>Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <LoadingOverlay 
        show={isLoading}
        message={isEditMode ? 'Updating category...' : 'Creating category...'}
      />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className={`${dashboardStyles.mainContent} ${!sidebarOpen ? dashboardStyles.mainContentExpanded : ''}`}>
        <Header 
          title={isEditMode ? 'Edit Category' : 'Add New Category'}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={dashboardStyles.dashboardContent}>
          <div className={styles.formPageContainer}>
            {/* Back Button */}
            <button 
              className={styles.backButton}
              onClick={() => navigate('/categories')}
            >
              ← Back to Categories
            </button>

            <div className={styles.formContainer}>
              <h2 className={styles.formTitle}>
                {isEditMode ? 'Edit Category' : 'Add New Category'}
              </h2>
              
              <form onSubmit={handleSubmit} className={styles.categoryForm}>
                {/* Basic Information Section */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Basic Information</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name">Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Bars, Truffles"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="icon">Icon (Emoji) *</label>
                      <div className={styles.iconInputWrapper}>
                        <input
                          type="text"
                          id="icon"
                          name="icon"
                          value={formData.icon}
                          onChange={handleInputChange}
                          maxLength={10}
                          placeholder="🍫"
                          required
                        />
                        <span className={styles.iconPreview}>{formData.icon || '🍫'}</span>
                      </div>
                      <small className={styles.helpText}>
                        Enter an emoji (max 10 characters). Preview shown on the right.
                      </small>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Description</h3>
                  <div className={styles.formGroup}>
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Brief description of the category"
                    />
                  </div>
                </div>

                {/* Status Section */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Status</h3>
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <span>Category is active (will be visible in product selection)</span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    className={styles.cancelBtn} 
                    onClick={() => navigate('/categories')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.saveBtn}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : (isEditMode ? 'Update Category' : 'Save Category')}
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

export default EditCategory;
