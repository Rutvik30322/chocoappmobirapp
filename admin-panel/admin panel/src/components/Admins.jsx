import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchAdmins, 
  createAdmin, 
  updateAdmin, 
  deleteAdmin, 
  toggleAdminStatus,
  setCurrentFilter,
  clearError
} from '../store/slices/adminSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingOverlay from './LoadingOverlay';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import dashboardStyles from './Dashboard.module.css';
import styles from './Users.module.css';

const Admins = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: admins, loading, error, pagination, currentFilter } = useSelector(state => state.admins);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    delete: false,
    toggleStatus: false,
    pagination: false,
  });

  // Fetch admins when component mounts or filters change
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        await dispatch(fetchAdmins(currentFilter)).unwrap();
      } catch (error) {
        // If it's a duplicate request error, retry after a short delay
        if (error === 'Duplicate request prevented' || error?.includes?.('Duplicate request prevented')) {
          setTimeout(() => {
            dispatch(fetchAdmins(currentFilter));
          }, 500);
        }
      }
    };
    
    loadAdmins();
  }, [dispatch, currentFilter]);

  const handleEdit = (admin) => {
    if (!admin) return;
    navigate(`/admins/edit/${admin._id}`);
  };

  const handleDelete = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (adminToDelete) {
      try {
        setActionLoading(prev => ({ ...prev, delete: true }));
        await dispatch(deleteAdmin(adminToDelete._id));
        // Refresh admins after deletion
        await dispatch(fetchAdmins(currentFilter));
        setShowDeleteModal(false);
        setAdminToDelete(null);
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert('Failed to delete admin: ' + (error?.message || 'Unknown error'));
      } finally {
        setActionLoading(prev => ({ ...prev, delete: false }));
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };

  const handleToggleStatus = async (adminId) => {
    try {
      setActionLoading(prev => ({ ...prev, toggleStatus: true }));
      await dispatch(toggleAdminStatus(adminId));
      await dispatch(fetchAdmins(currentFilter));
    } catch (error) {
      console.error('Error toggling admin status:', error);
      alert('Failed to update admin status: ' + (error?.message || 'Unknown error'));
    } finally {
      setActionLoading(prev => ({ ...prev, toggleStatus: false }));
    }
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setCurrentFilter({ [filterType]: value, page: 1 }));
  };

  const handlePageChange = async (newPage) => {
    setActionLoading(prev => ({ ...prev, pagination: true }));
    try {
      dispatch(setCurrentFilter({ page: newPage }));
      await dispatch(fetchAdmins({ ...currentFilter, page: newPage }));
    } finally {
      setActionLoading(prev => ({ ...prev, pagination: false }));
    }
  };

  if (loading && admins.length === 0) {
    return (
      <div className={dashboardStyles.dashboardContainer}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Loading admins...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <LoadingOverlay 
        show={loading || actionLoading.delete || actionLoading.toggleStatus || actionLoading.pagination}
        message={
          actionLoading.delete ? 'Deleting admin...' :
          actionLoading.toggleStatus ? 'Updating admin status...' :
          actionLoading.pagination ? 'Loading page...' :
          'Loading admins...'
        }
      />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <main className={`${dashboardStyles.mainContent} ${!sidebarOpen ? dashboardStyles.mainContentExpanded : ''}`}>
        <Header 
          title="Admin Management"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={dashboardStyles.dashboardContent}>
          {loading && admins.length > 0 && (
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
              <span>Refreshing admins...</span>
            </div>
          )}
          {/* Error Message */}
          {error && error !== 'Duplicate request prevented' && !error.includes('Duplicate request prevented') && (
            <div className={styles.errorAlert}>
              <span>{error}</span>
              <button onClick={() => dispatch(clearError())} aria-label="Close error">✕</button>
            </div>
          )}
          
          {/* Header */}
          <div className={styles.usersHeader}>
            <h2 className={styles.usersTitle}>All Admins</h2>
            <button 
              className={styles.addUserBtn}
              onClick={() => navigate('/admins/add')}
            >
              Add Admin
            </button>
          </div>

          {/* Filters */}
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <input 
                type="text" 
                placeholder="Search admins..." 
                value={currentFilter.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <select 
                value={currentFilter.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <select 
                value={currentFilter.isActive || ''}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="email_asc">Email A-Z</option>
                <option value="email_desc">Email Z-A</option>
              </select>
            </div>
          </div>

          {/* Admins Table */}
          {Array.isArray(admins) && admins.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                No admins found.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Email</th>
                      <th className={styles.th}>Mobile</th>
                      <th className={styles.th}>Role</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Created</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin._id}>
                        <td className={styles.td}>
                          <div className={styles.userInfo}>
                            {admin.profilePicture ? (
                              <img 
                                src={admin.profilePicture} 
                                alt={admin.name}
                                className={styles.userAvatar}
                              />
                            ) : (
                              <div className={styles.userAvatarPlaceholder}>
                                {admin.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className={styles.userName}>{admin.name}</span>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.userEmail}>{admin.email}</div>
                        </td>
                        <td className={`${styles.td} ${styles.userMobile}`}>{admin.mobile || 'N/A'}</td>
                        <td className={styles.td}>
                          <span className={`${styles.roleBadge} ${admin.role === 'superadmin' ? styles.roleSuperadmin : styles.roleAdmin}`}>
                            {admin.role === 'superadmin' ? '👑 Super Admin' : 'Admin'}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${admin.isActive ? styles.statusActive : styles.statusInactive}`}>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className={`${styles.td} ${styles.dateCell}`}>
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </td>
                        <td className={styles.actionsCell}>
                          <button 
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => handleEdit(admin)}
                            disabled={loading || actionLoading.delete || actionLoading.toggleStatus}
                          >
                            Edit
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${admin.isActive ? styles.toggleBtn : styles.toggleBtnActive}`}
                            onClick={() => handleToggleStatus(admin._id)}
                            disabled={loading || actionLoading.delete || actionLoading.toggleStatus}
                          >
                            {actionLoading.toggleStatus ? 'Updating...' : (admin.isActive ? 'Deactivate' : 'Activate')}
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(admin)}
                            disabled={loading || actionLoading.delete || actionLoading.toggleStatus}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className={styles.paginationContainer}>
                  <button
                    className={styles.paginationBtn}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || actionLoading.pagination || loading}
                  >
                    {actionLoading.pagination ? 'Loading...' : 'Previous'}
                  </button>
                  
                  <span className={styles.paginationInfo}>
                    Page {pagination.page} of {pagination.pages} ({pagination.total || admins.length} total)
                  </span>
                  
                  <button
                    className={styles.paginationBtn}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages || actionLoading.pagination || loading}
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
        title="Delete Admin"
        message="Are you sure you want to delete this admin?"
        itemName={adminToDelete?.name}
        itemDetails={adminToDelete ? [
          { label: 'Email', value: adminToDelete.email || 'N/A' },
          { label: 'Role', value: adminToDelete.role || 'N/A' },
          { label: 'Status', value: adminToDelete.isActive ? 'Active' : 'Inactive' },
        ] : []}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={actionLoading.delete}
        confirmText="Delete Admin"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Admins;
