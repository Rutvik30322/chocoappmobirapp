import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  clearError
} from '../store/slices/categorySlice';
import { categoryService } from '../services/api';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingOverlay from './LoadingOverlay';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import dashboardStyles from './Dashboard.module.css';
import styles from './Categories.module.css';

const Categories = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categories, loading, error } = useSelector(state => state.categories);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showPdfImportModal, setShowPdfImportModal] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedCategories, setExtractedCategories] = useState([]);
  const [extractedProducts, setExtractedProducts] = useState([]);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    delete: false,
    import: false,
    createProducts: false,
  });
  const [createProductsMode, setCreateProductsMode] = useState(false);


  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Fetch all categories, we'll filter client-side
        await dispatch(fetchCategories(false)).unwrap();
      } catch (error) {
        // If it's a duplicate request error, retry after a short delay
        if (error === 'Duplicate request prevented' || error?.includes?.('Duplicate request prevented')) {
          setTimeout(() => {
            dispatch(fetchCategories(false));
          }, 500);
        }
      }
    };
    
    loadCategories();
  }, [dispatch]);

  // Filter categories based on status
  const filteredCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    if (statusFilter === 'all') return categories;
    if (statusFilter === 'active') return categories.filter(cat => cat.isActive);
    if (statusFilter === 'inactive') return categories.filter(cat => !cat.isActive);
    return categories;
  }, [categories, statusFilter]);

  const handleEdit = (category) => {
    if (!category) return;
    navigate(`/categories/edit/${category._id}`);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        setActionLoading(prev => ({ ...prev, delete: true }));
        await dispatch(deleteCategory(categoryToDelete._id));
        // Refresh categories after deletion
        await dispatch(fetchCategories(true));
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      } catch (error) {
        // Don't show error for duplicate request prevention
        if (error.payload && error.payload !== 'Duplicate request prevented' && !error.payload.includes('Duplicate request prevented')) {
        console.error('Error deleting category:', error);
          alert(error.payload);
        }
      } finally {
        setActionLoading(prev => ({ ...prev, delete: false }));
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  // Extract category names from PDF text
  const extractCategoryNames = (text) => {
    // Split by newlines and filter out empty lines
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    
    // Common patterns for category extraction:
    // 1. Each line is a category name
    // 2. Categories might be numbered (1. Category, 2. Category, etc.)
    // 3. Categories might have bullet points (• Category, - Category, etc.)
    
    const categories = [];
    
    for (const line of lines) {
      // Remove common prefixes
      let categoryName = line
        .replace(/^\d+[\.\)]\s*/, '') // Remove numbering like "1. " or "1) "
        .replace(/^[•\-\*]\s*/, '') // Remove bullet points
        .replace(/^Category\s*:\s*/i, '') // Remove "Category: " prefix
        .trim();
      
      // Skip if too short or too long (likely not a category name)
      if (categoryName.length >= 2 && categoryName.length <= 50) {
        // Skip common non-category words
        const skipWords = ['page', 'table of contents', 'index', 'contents', 'introduction', 'summary'];
        const lowerName = categoryName.toLowerCase();
        if (!skipWords.some(word => lowerName.includes(word))) {
          categories.push(categoryName);
        }
      }
    }
    
    // Remove duplicates while preserving order
    const uniqueCategories = Array.from(new Set(categories));
    
    return uniqueCategories;
  };

  // Parse PDF file using backend API
  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file');
      return;
    }

    setPdfFile(file);
    setParsingPdf(true);
    setExtractedCategories([]);
    setExtractedProducts([]);

    try {
      // Use backend API to parse PDF
      const response = await categoryService.parsePdfForCategories(file);
      const extractedCategoriesData = response.data?.data?.categories || [];
      const extractedProductsData = response.data?.data?.products || [];
      const productCount = response.data?.data?.productCount || 0;
      const usedAI = response.data?.data?.usedAI || false;
      
      if (extractedCategoriesData.length === 0) {
        alert(`No categories could be extracted from the PDF.\n\nFound ${productCount} product(s) but couldn't determine categories.`);
      } else {
        setExtractedCategories(extractedCategoriesData.map(cat => ({
          ...cat,
          aiGenerated: usedAI
        })));
        setExtractedProducts(extractedProductsData);
      }
    } catch (error) {
      console.error('Error parsing PDF:', error);
      let errorMessage = 'Error parsing PDF: ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error. Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setParsingPdf(false);
    }
  };

  // Create products directly from PDF with AI-generated details
  const handleCreateProductsFromPdf = async () => {
    if (!pdfFile) {
      alert('Please upload a PDF file first');
      return;
    }

    setActionLoading(prev => ({ ...prev, createProducts: true }));

    try {
      const response = await categoryService.parsePdfAndCreateProducts(pdfFile);
      const result = response.data?.data || {};
      
      const categoriesCreated = result.categoriesCreated || 0;
      const productsCreated = result.productsCreated || 0;
      const productsSkipped = result.productsSkipped || 0;
      const productsFailed = result.productsFailed || 0;
      const usedAI = result.usedAI || false;

      let message = `✅ Products Created Successfully!\n\n`;
      message += `📦 Categories Created: ${categoriesCreated}\n`;
      message += `🛍️ Products Created: ${productsCreated}\n`;
      
      if (productsSkipped > 0) {
        message += `⏭️ Products Skipped (already exist): ${productsSkipped}\n`;
      }
      if (productsFailed > 0) {
        message += `❌ Products Failed: ${productsFailed}\n`;
      }
      
      message += `\n${usedAI ? '🤖 AI was used to generate product details.' : '📋 Keyword matching was used.'}`;

      if (result.skipped && result.skipped.length > 0) {
        message += `\n\nSkipped Products:\n`;
        result.skipped.slice(0, 5).forEach(item => {
          message += `- ${item.name}\n`;
        });
        if (result.skipped.length > 5) {
          message += `... and ${result.skipped.length - 5} more\n`;
        }
      }

      if (result.failed && result.failed.length > 0) {
        message += `\n\nFailed Products:\n`;
        result.failed.forEach(item => {
          message += `- ${item.name}: ${item.error}\n`;
        });
      }

      alert(message);

      // Refresh categories list
      await dispatch(fetchCategories(false));
      
      // Close modal and reset
      setShowPdfImportModal(false);
      setPdfFile(null);
      setExtractedCategories([]);
      setExtractedProducts([]);
      setCreateProductsMode(false);
    } catch (error) {
      console.error('Error creating products:', error);
      let errorMessage = 'Error creating products: ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error. Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, createProducts: false }));
    }
  };

  // Import categories from PDF
  const handleImportCategories = async () => {
    if (extractedCategories.length === 0) {
      alert('No categories to import');
      return;
    }

    setActionLoading(prev => ({ ...prev, import: true }));

    try {
      const results = {
        success: [],
        skipped: [],
        failed: [],
      };

      // Get existing categories to check for duplicates
      const existingCategoriesResponse = await categoryService.getAllCategories(false);
      const existingCategoryNames = new Set(
        (existingCategoriesResponse.data?.data?.categories || []).map(cat => cat.name.toLowerCase().trim())
      );

      // Import categories one by one
      for (const category of extractedCategories) {
        const categoryNameLower = category.name.toLowerCase().trim();
        
        // Check if category already exists (case-insensitive)
        if (existingCategoryNames.has(categoryNameLower)) {
          results.skipped.push({ name: category.name, reason: 'Already exists' });
          continue;
        }

        try {
          await categoryService.createCategory(category);
          results.success.push(category.name);
          // Add to existing set to prevent duplicates in same import
          existingCategoryNames.add(categoryNameLower);
        } catch (error) {
          // Category might already exist (race condition or case sensitivity)
          if (error.response?.status === 400 || 
              error.response?.data?.message?.includes('already exists') ||
              error.response?.data?.message?.includes('duplicate')) {
            results.skipped.push({ name: category.name, reason: 'Already exists' });
          } else {
            results.failed.push({ name: category.name, reason: error.response?.data?.message || 'Unknown error' });
          }
        }
      }

      // Show results
      let message = `Import completed!\n\n`;
      message += `✅ Successfully imported: ${results.success.length}\n`;
      if (results.skipped.length > 0) {
        message += `⏭️ Skipped (already exist): ${results.skipped.length}\n`;
      }
      if (results.failed.length > 0) {
        message += `❌ Failed: ${results.failed.length}\n`;
      }

      if (results.skipped.length > 0 || results.failed.length > 0) {
        message += `\nDetails:\n`;
        if (results.skipped.length > 0) {
          message += `\nSkipped:\n`;
          results.skipped.slice(0, 10).forEach(item => {
            message += `- ${item.name}\n`;
          });
          if (results.skipped.length > 10) {
            message += `... and ${results.skipped.length - 10} more\n`;
          }
        }
        if (results.failed.length > 0) {
          message += `\nFailed:\n`;
          results.failed.forEach(item => {
            message += `- ${item.name}: ${item.reason}\n`;
          });
        }
      }
      alert(message);

      // Refresh categories list
      await dispatch(fetchCategories(false));
      
      // Close modal and reset
      setShowPdfImportModal(false);
      setPdfFile(null);
      setExtractedCategories([]);
      setExtractedProducts([]);
    } catch (error) {
      console.error('Error importing categories:', error);
      alert('Error importing categories: ' + (error.message || 'Unknown error'));
    } finally {
      setActionLoading(prev => ({ ...prev, import: false }));
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className={dashboardStyles.dashboardContainer}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Loading categories...
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <LoadingOverlay 
        show={loading || actionLoading.delete || actionLoading.import || actionLoading.createProducts || parsingPdf}
        message={
          parsingPdf ? 'Parsing PDF...' :
          actionLoading.createProducts ? 'Creating products with AI... This may take a few minutes...' :
          actionLoading.import ? 'Importing categories...' :
          actionLoading.delete ? 'Deleting category...' :
          'Loading categories...'
        }
      />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <main className={`${dashboardStyles.mainContent} ${!sidebarOpen ? dashboardStyles.mainContentExpanded : ''}`}>
        <Header 
          title="Category Management"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={dashboardStyles.dashboardContent}>
          {loading && categories.length > 0 && (
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
              <span>Refreshing categories...</span>
            </div>
          )}
          {error && error !== 'Duplicate request prevented' && !error.includes('Duplicate request prevented') && (
            <div className={styles.errorAlert}>
              <span>{error}</span>
              <button onClick={() => dispatch(clearError())} aria-label="Close error">✕</button>
            </div>
          )}

              <div className={styles.categoriesHeader}>
                <h2 className={styles.categoriesTitle}>All Categories</h2>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    className={styles.importPdfBtn} 
                    onClick={() => setShowPdfImportModal(true)}
                  >
                    📄 Import from PDF
                  </button>
                  <button 
                    className={styles.addCategoryBtn} 
                    onClick={() => navigate('/categories/add')}
                  >
                    Add Category
                  </button>
                </div>
              </div>

          {/* Filters */}
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <label htmlFor="statusFilter">Status:</label>
              <select 
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Categories</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>🏷️</div>
              <div className={styles.emptyStateText}>No categories found</div>
              <div className={styles.emptyStateSubtext}>
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} categories found.` 
                  : 'Add your first category to get started!'}
              </div>
            </div>
          ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Icon</th>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Description</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                  {filteredCategories.map((category) => (
                      <tr key={category._id}>
                        <td className={`${styles.td} ${styles.iconCell}`}>
                        <span style={{ fontSize: '2rem' }}>{category.icon || '🍫'}</span>
                        </td>
                        <td className={`${styles.td} ${styles.nameCell}`}>
                          <strong>{category.name}</strong>
                        </td>
                        <td className={`${styles.td} ${styles.descriptionCell}`} title={category.description || ''}>
                          {category.description || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No description</span>}
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${category.isActive ? styles.statusActive : styles.statusInactive}`}>
                            {category.isActive ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <button 
                            className={styles.editBtn} 
                            onClick={() => handleEdit(category)}
                            disabled={loading || actionLoading.delete}
                          >
                          Edit
                          </button>
                          <button 
                            className={styles.deleteBtn} 
                            onClick={() => handleDelete(category)}
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
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products using this category will need to be updated first."
        itemName={categoryToDelete?.name}
        itemDetails={categoryToDelete ? [
          { label: 'Icon', value: categoryToDelete.icon || '🍫' },
          { label: 'Status', value: categoryToDelete.isActive ? 'Active' : 'Inactive' },
        ] : []}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={actionLoading.delete}
        confirmText="Delete Category"
        cancelText="Cancel"
      />

      {/* PDF Import Modal */}
      {showPdfImportModal && (
        <div className={styles.modalOverlay} onClick={() => !parsingPdf && !actionLoading.import && setShowPdfImportModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {createProductsMode ? 'Create Products from PDF' : 'Import Categories from PDF'}
              </h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => {
                  if (!parsingPdf && !actionLoading.import && !actionLoading.createProducts) {
                    setShowPdfImportModal(false);
                    setPdfFile(null);
                    setExtractedCategories([]);
                    setExtractedProducts([]);
                    setCreateProductsMode(false);
                  }
                }}
                disabled={parsingPdf || actionLoading.import || actionLoading.createProducts}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.pdfUploadSection}>
                <label className={styles.fileInputLabel}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={parsingPdf || actionLoading.import}
                    style={{ display: 'none' }}
                  />
                  <span className={styles.fileInputButton}>
                    {parsingPdf ? 'Parsing PDF...' : pdfFile ? pdfFile.name : '📄 Choose PDF File'}
                  </span>
                </label>
                {pdfFile && !parsingPdf && (
                  <p className={styles.fileInfo}>Selected: {pdfFile.name}</p>
                )}
              </div>

              {extractedProducts.length > 0 && (
                <div className={styles.extractedProductsSection} style={{ marginBottom: '1.5rem' }}>
                  <h4 className={styles.sectionTitle}>
                    Found {extractedProducts.length} Product(s):
                  </h4>
                  <div className={styles.productsPreview} style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.85rem', color: '#6b7280' }}>
                    {extractedProducts.slice(0, 10).map((product, index) => (
                      <div key={index} style={{ padding: '0.25rem 0', borderBottom: '1px solid #e5e7eb' }}>
                        {index + 1}. {product}
                      </div>
                    ))}
                    {extractedProducts.length > 10 && (
                      <div style={{ padding: '0.5rem 0', fontStyle: 'italic', color: '#9ca3af' }}>
                        ... and {extractedProducts.length - 10} more products
                      </div>
                    )}
                  </div>
                </div>
              )}

              {extractedCategories.length > 0 && (
                <div className={styles.extractedCategoriesSection}>
                  <h4 className={styles.sectionTitle}>
                    Intelligently Extracted {extractedCategories.length} Category/Categories:
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
                    {extractedCategories[0]?.aiGenerated 
                      ? '🤖 Categories were created using AI analysis of product names.'
                      : '📋 Categories were created by analyzing product names using keyword matching.'}
                  </p>
                  <div className={styles.categoriesPreview}>
                    {extractedCategories.map((category, index) => (
                      <div key={index} className={styles.categoryPreviewItem}>
                        <span className={styles.categoryIcon}>{category.icon}</span>
                        <span className={styles.categoryName}>{category.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {extractedCategories.length === 0 && !parsingPdf && pdfFile && (
                <p className={styles.noCategoriesMessage}>
                  No categories found in the PDF. Please ensure the PDF contains category names (one per line or numbered list).
                </p>
              )}
            </div>
            <div className={styles.modalActions}>
              {!createProductsMode ? (
                <>
                  <button
                    className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                    onClick={handleImportCategories}
                    disabled={extractedCategories.length === 0 || parsingPdf || actionLoading.import}
                  >
                    {actionLoading.import ? (
                      <>
                        <span className={styles.spinner}></span> Importing...
                      </>
                    ) : (
                      `Import ${extractedCategories.length} Categories`
                    )}
                  </button>
                  {extractedProducts.length > 0 && (
                    <button
                      className={`${styles.modalBtn}`}
                      style={{ backgroundColor: '#10b981', color: 'white' }}
                      onClick={handleCreateProductsFromPdf}
                      disabled={!pdfFile || parsingPdf || actionLoading.createProducts || actionLoading.import}
                    >
                      {actionLoading.createProducts ? (
                        <>
                          <span className={styles.spinner}></span> Creating Products...
                        </>
                      ) : (
                        `🚀 Create ${extractedProducts.length} Products with AI`
                      )}
                    </button>
                  )}
                </>
              ) : (
                <button
                  className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                  onClick={handleCreateProductsFromPdf}
                  disabled={!pdfFile || parsingPdf || actionLoading.createProducts}
                >
                  {actionLoading.createProducts ? (
                    <>
                      <span className={styles.spinner}></span> Creating Products with AI...
                    </>
                  ) : (
                    `🚀 Create Products from PDF`
                  )}
                </button>
              )}
              <button
                className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
                onClick={() => {
                  if (!parsingPdf && !actionLoading.import && !actionLoading.createProducts) {
                    setShowPdfImportModal(false);
                    setPdfFile(null);
                    setExtractedCategories([]);
                    setExtractedProducts([]);
                    setCreateProductsMode(false);
                  }
                }}
                disabled={parsingPdf || actionLoading.import || actionLoading.createProducts}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
