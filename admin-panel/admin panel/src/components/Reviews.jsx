import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReviews, approveReview, deleteReview, clearError, setFilter } from '../store/slices/reviewSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingOverlay from './LoadingOverlay';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import dashboardStyles from './Dashboard.module.css';
import styles from './Reviews.module.css';

const Reviews = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: reviews, loading, error, pagination, filters } = useSelector(state => state.reviews);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [approvedFilter, setApprovedFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    approve: false,
    delete: false,
    pagination: false,
  });


  useEffect(() => {
    const loadReviews = async () => {
      try {
        // When "All Reviews" is selected (empty string), pass undefined to fetch all
        const approvedParam = approvedFilter === '' ? undefined : approvedFilter === 'true';
        await dispatch(fetchReviews({ product: filters.product, approved: approvedParam, page: 1 })).unwrap();
      } catch (error) {
        // If it's a duplicate request error, retry after a short delay
        if (error === 'Duplicate request prevented' || error?.includes?.('Duplicate request prevented')) {
          setTimeout(() => {
            const approvedParam = approvedFilter === '' ? undefined : approvedFilter === 'true';
            dispatch(fetchReviews({ product: filters.product, approved: approvedParam, page: 1 }));
          }, 500);
        }
      }
    };
    
    loadReviews();
  }, [dispatch, approvedFilter, filters.product]);

  const handleApproveChange = (e) => {
    setApprovedFilter(e.target.value);
    dispatch(setFilter({ approved: e.target.value }));
  };

  const handleApprove = async (reviewId, isApproved) => {
    try {
      setActionLoading(prev => ({ ...prev, approve: true }));
      await dispatch(approveReview({ id: reviewId, isApproved }));
      const approvedParam = approvedFilter === '' ? undefined : approvedFilter === 'true';
      await dispatch(fetchReviews({ product: filters.product, approved: approvedParam, page: filters.page }));
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to update review: ' + (error?.message || 'Unknown error'));
    } finally {
      setActionLoading(prev => ({ ...prev, approve: false }));
    }
  };

  const handleDelete = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (reviewToDelete) {
      try {
        setActionLoading(prev => ({ ...prev, delete: true }));
        await dispatch(deleteReview(reviewToDelete._id));
        const approvedParam = approvedFilter === '' ? undefined : approvedFilter === 'true';
        await dispatch(fetchReviews({ product: filters.product, approved: approvedParam, page: filters.page }));
        setShowDeleteModal(false);
        setReviewToDelete(null);
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review: ' + (error?.message || 'Unknown error'));
      } finally {
        setActionLoading(prev => ({ ...prev, delete: false }));
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading && reviews.length === 0) {
    return (
      <div className={dashboardStyles.dashboardContainer}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Loading reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <LoadingOverlay 
        show={loading || actionLoading.approve || actionLoading.delete || actionLoading.pagination}
        message={
          actionLoading.approve ? 'Updating review...' :
          actionLoading.delete ? 'Deleting review...' :
          actionLoading.pagination ? 'Loading page...' :
          'Loading reviews...'
        }
      />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <main className={`${dashboardStyles.mainContent} ${!sidebarOpen ? dashboardStyles.mainContentExpanded : ''}`}>
        <Header 
          title="Review Management"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={dashboardStyles.dashboardContent}>
          {loading && reviews.length > 0 && (
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
              <span>Refreshing reviews...</span>
            </div>
          )}
          {error && error !== 'Duplicate request prevented' && !error.includes('Duplicate request prevented') && (
            <div className={styles.errorAlert}>
              <span>{error}</span>
              <button onClick={() => dispatch(clearError())} aria-label="Close error">✕</button>
            </div>
          )}

          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>All Reviews</h2>
          </div>

          {/* Filters */}
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <select 
                value={approvedFilter}
                onChange={handleApproveChange}
                className={styles.filterSelect}
              >
                <option value="">All Reviews</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>
            </div>
          </div>
          
          {Array.isArray(reviews) && reviews.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                No reviews found.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Product</th>
                      <th className={styles.th}>User</th>
                      <th className={styles.th}>Rating</th>
                      <th className={styles.th}>Comment</th>
                      <th className={styles.th}>Date</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(reviews) && reviews.map((review) => {
                      const productName = typeof review.product === 'object' 
                        ? review.product.name 
                        : 'N/A';
                      const userName = typeof review.user === 'object' 
                        ? review.user.name 
                        : 'Anonymous';
                      const userEmail = typeof review.user === 'object' && review.user.email
                        ? review.user.email
                        : null;
                      
                      return (
                        <tr key={review._id}>
                          <td className={styles.td}>
                            <div className={styles.productName}>{productName}</div>
                          </td>
                          <td className={styles.td}>
                            <div className={styles.userInfo}>
                              <div className={styles.userName}>{userName}</div>
                              {userEmail && (
                                <div className={styles.userEmail}>{userEmail}</div>
                              )}
                            </div>
                          </td>
                          <td className={styles.td}>
                            <div className={styles.ratingDisplay}>
                              <span className={styles.stars}>
                                {renderStars(review.rating)}
                              </span>
                              <span className={styles.ratingValue}>
                                ({review.rating}/5)
                              </span>
                            </div>
                          </td>
                          <td className={`${styles.td} ${styles.commentCell}`} title={review.comment || 'No comment'}>
                            {review.comment || <span className={styles.commentEmpty}>No comment</span>}
                          </td>
                          <td className={`${styles.td} ${styles.dateCell}`}>
                            {formatDate(review.createdAt)}
                          </td>
                          <td className={styles.td}>
                            <span className={`${styles.statusBadge} ${review.isApproved ? styles.statusApproved : styles.statusPending}`}>
                              {review.isApproved ? '✓ Approved' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className={styles.actionsCell}>
                            {!review.isApproved ? (
                              <button 
                                className={`${styles.actionBtn} ${styles.approveBtn}`}
                                onClick={() => handleApprove(review._id, true)}
                                disabled={loading || actionLoading.approve || actionLoading.delete}
                              >
                                {actionLoading.approve ? 'Updating...' : 'Approve'}
                              </button>
                            ) : (
                              <button 
                                className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                onClick={() => handleApprove(review._id, false)}
                                disabled={loading || actionLoading.approve || actionLoading.delete}
                              >
                                {actionLoading.approve ? 'Updating...' : 'Reject'}
                              </button>
                            )}
                            <button 
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => handleDelete(review)}
                              disabled={loading || actionLoading.approve || actionLoading.delete}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className={styles.paginationContainer}>
                  <button
                    className={styles.paginationBtn}
                    disabled={pagination.page === 1 || actionLoading.pagination || loading}
                    onClick={async () => {
                      setActionLoading(prev => ({ ...prev, pagination: true }));
                      try {
                        const approvedParam = approvedFilter === '' ? undefined : approvedFilter === 'true';
                        await dispatch(fetchReviews({ product: filters.product, approved: approvedParam, page: pagination.page - 1 }));
                      } finally {
                        setActionLoading(prev => ({ ...prev, pagination: false }));
                      }
                    }}
                  >
                    {actionLoading.pagination ? 'Loading...' : 'Previous'}
                  </button>
                  <span className={styles.paginationInfo}>
                    Page {pagination.page} of {pagination.pages} ({pagination.total || reviews.length} total)
                  </span>
                  <button
                    className={styles.paginationBtn}
                    disabled={pagination.page === pagination.pages || actionLoading.pagination || loading}
                    onClick={async () => {
                      setActionLoading(prev => ({ ...prev, pagination: true }));
                      try {
                        const approvedParam = approvedFilter === '' ? undefined : approvedFilter === 'true';
                        await dispatch(fetchReviews({ product: filters.product, approved: approvedParam, page: pagination.page + 1 }));
                      } finally {
                        setActionLoading(prev => ({ ...prev, pagination: false }));
                      }
                    }}
                  >
                    {actionLoading.pagination ? 'Loading...' : 'Next'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        title="Delete Review"
        message="Are you sure you want to delete this review?"
        itemName={reviewToDelete ? (typeof reviewToDelete.product === 'object' ? reviewToDelete.product.name : 'N/A') : ''}
        itemDetails={reviewToDelete ? [
          { label: 'User', value: typeof reviewToDelete.user === 'object' ? reviewToDelete.user.name : 'Anonymous' },
          { label: 'Rating', value: `${reviewToDelete.rating}/5` },
          { label: 'Status', value: reviewToDelete.isApproved ? 'Approved' : 'Pending' },
        ] : []}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={actionLoading.delete}
        confirmText="Delete Review"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Reviews;
