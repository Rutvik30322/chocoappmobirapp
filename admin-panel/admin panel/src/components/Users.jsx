import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  setCurrentFilter,
  clearError
} from '../store/slices/userSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingOverlay from './LoadingOverlay';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import dashboardStyles from './Dashboard.module.css';
import styles from './Users.module.css';

const Users = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: users, loading, error, pagination, currentFilter } = useSelector(state => state.users);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    delete: false,
    toggleStatus: false,
    pagination: false,
  });


  // Fetch users when component mounts or filters change
  useEffect(() => {
    const loadUsers = async () => {
      try {
        await dispatch(fetchUsers(currentFilter)).unwrap();
      } catch (error) {
        // If it's a duplicate request error, retry after a short delay
        if (error === 'Duplicate request prevented' || error?.includes?.('Duplicate request prevented')) {
          setTimeout(() => {
            dispatch(fetchUsers(currentFilter));
          }, 500);
        }
      }
    };
    
    loadUsers();
  }, [dispatch, currentFilter]);

  const handleEdit = (user) => {
    if (!user) return;
    navigate(`/users/edit/${user._id}`);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        setActionLoading(prev => ({ ...prev, delete: true }));
        await dispatch(deleteUser(userToDelete._id));
        // Refresh users after deletion
        await dispatch(fetchUsers(currentFilter));
        setShowDeleteModal(false);
        setUserToDelete(null);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user: ' + (error?.message || 'Unknown error'));
      } finally {
        setActionLoading(prev => ({ ...prev, delete: false }));
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, toggleStatus: true }));
      await dispatch(toggleUserStatus(userId));
      await dispatch(fetchUsers(currentFilter));
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status: ' + (error?.message || 'Unknown error'));
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
      await dispatch(fetchUsers({ ...currentFilter, page: newPage }));
    } finally {
      setActionLoading(prev => ({ ...prev, pagination: false }));
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className={dashboardStyles.dashboardContainer}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <LoadingOverlay 
        show={loading || actionLoading.delete || actionLoading.toggleStatus || actionLoading.pagination}
        message={
          actionLoading.delete ? 'Deleting user...' :
          actionLoading.toggleStatus ? 'Updating user status...' :
          actionLoading.pagination ? 'Loading page...' :
          'Loading users...'
        }
      />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <main className={`${dashboardStyles.mainContent} ${!sidebarOpen ? dashboardStyles.mainContentExpanded : ''}`}>
        <Header 
          title="User Management"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={dashboardStyles.dashboardContent}>
          {loading && users.length > 0 && (
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
              <span>Refreshing users...</span>
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
            <h2 className={styles.usersTitle}>All Users</h2>
            <button 
              className={styles.addUserBtn}
              onClick={() => navigate('/users/add')}
            >
              Add User
            </button>
          </div>

          {/* Filters */}
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <input 
                type="text" 
                placeholder="Search users..." 
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
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
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

          {/* Users Table */}
          {Array.isArray(users) && users.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                No users found.
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
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className={styles.td}>
                          <div className={styles.userInfo}>
                            {user.profilePicture ? (
                              <img 
                                src={user.profilePicture} 
                                alt={user.name}
                                className={styles.userAvatar}
                              />
                            ) : (
                              <div className={styles.userAvatarPlaceholder}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className={styles.userName}>{user.name}</span>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.userEmail}>{user.email}</div>
                        </td>
                        <td className={`${styles.td} ${styles.userMobile}`}>{user.mobile}</td>
                        <td className={styles.td}>
                          <span className={`${styles.roleBadge} ${styles[`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`]}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${user.isActive ? styles.statusActive : styles.statusInactive}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className={`${styles.td} ${styles.dateCell}`}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className={styles.actionsCell}>
                          <button 
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => handleEdit(user)}
                            disabled={loading || actionLoading.delete || actionLoading.toggleStatus}
                          >
                            Edit
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${user.isActive ? styles.toggleBtn : styles.toggleBtnActive}`}
                            onClick={() => handleToggleStatus(user._id)}
                            disabled={loading || actionLoading.delete || actionLoading.toggleStatus}
                          >
                            {actionLoading.toggleStatus ? 'Updating...' : (user.isActive ? 'Deactivate' : 'Activate')}
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(user)}
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
                    Page {pagination.page} of {pagination.pages} ({pagination.total || users.length} total)
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
        title="Delete User"
        message="Are you sure you want to delete this user?"
        itemName={userToDelete?.name}
        itemDetails={userToDelete ? [
          { label: 'Email', value: userToDelete.email || 'N/A' },
          { label: 'Role', value: userToDelete.role || 'N/A' },
          { label: 'Status', value: userToDelete.isActive ? 'Active' : 'Inactive' },
        ] : []}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={actionLoading.delete}
        confirmText="Delete User"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Users;