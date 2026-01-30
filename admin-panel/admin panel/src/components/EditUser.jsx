import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, createUser, updateUser } from '../store/slices/userSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingOverlay from './LoadingOverlay';
import styles from './Users.module.css';
import dashboardStyles from './Dashboard.module.css';

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items: users, loading } = useSelector(state => state.users);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'customer',
    isActive: true,
    profilePicture: '',
    addresses: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = id && id !== 'new';

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchUsers({}));
    }
  }, [dispatch, isEditMode]);

  useEffect(() => {
    if (isEditMode && users.length > 0) {
      const user = users.find(u => u._id === id);
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          mobile: user.mobile || '',
          password: '',
          role: user.role || 'customer',
          isActive: typeof user.isActive !== 'undefined' ? user.isActive : true,
          profilePicture: user.profilePicture || '',
          addresses: Array.isArray(user.addresses) ? [...user.addresses] : []
        });
      }
    } else if (!isEditMode) {
      // Reset form for new user
      setFormData({
        name: '',
        email: '',
        mobile: '',
        password: '',
        role: 'customer',
        isActive: true,
        profilePicture: '',
        addresses: []
      });
    }
  }, [id, users, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle mobile number input - restrict to 10 digits only
    if (name === 'mobile') {
      const mobileValue = value.replace(/[^0-9]/g, '').substring(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: mobileValue
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userData = { ...formData };
      
      // Validation
      if (!isEditMode && (!userData.password || userData.password.trim() === '')) {
        alert('Password is required for new users');
        setIsLoading(false);
        return;
      }
      
      if (!isEditMode && userData.password && userData.password.length < 6) {
        alert('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
      
      if (isEditMode) {
        // Remove password if not changing it
        if (!userData.password || userData.password.trim() === '') {
          delete userData.password;
        }
        
        // Ensure role is included (explicitly set it) - always send role even if unchanged
        const updateData = {
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          role: userData.role || 'customer', // Explicitly include role, default to customer
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          ...(userData.password && userData.password.trim() !== '' && { password: userData.password }),
          ...(userData.profilePicture && { profilePicture: userData.profilePicture }),
          ...(userData.addresses && Array.isArray(userData.addresses) && { addresses: userData.addresses })
        };
        
       
        
        const result = await dispatch(updateUser({ id, userData: updateData })).unwrap();
      
      } else {
        await dispatch(createUser(userData)).unwrap();
      }

      // Navigate back to users list
      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error?.message || error?.payload || 'Unknown error';
      alert('Error saving user: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || (isEditMode && users.length === 0)) {
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
        message={isEditMode ? 'Updating user...' : 'Creating user...'}
      />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className={`${dashboardStyles.mainContent} ${!sidebarOpen ? dashboardStyles.mainContentExpanded : ''}`}>
        <Header 
          title={isEditMode ? 'Edit User' : 'Add New User'}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={dashboardStyles.dashboardContent}>
          <div className={styles.formPageContainer}>
            {/* Back Button */}
            <button 
              className={styles.backButton}
              onClick={() => navigate('/users')}
            >
              ← Back to Users
            </button>

            <div className={styles.formContainer}>
              <h2 className={styles.formTitle}>
                {isEditMode ? 'Edit User' : 'Add New User'}
              </h2>
              
              <form onSubmit={handleSubmit} className={styles.userForm}>
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
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="mobile">Mobile Number *</label>
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="role">Role *</label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role || 'customer'}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Security</h3>
                  <div className={styles.formGroup}>
                    <label htmlFor="password">
                      {isEditMode ? 'New Password (leave blank to keep current)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      {...(!isEditMode && { required: true })}
                      minLength="6"
                      placeholder={isEditMode ? "Enter new password (optional)" : "Enter password (min 6 characters)"}
                    />
                    <small className={styles.helpText}>
                      {isEditMode ? 'Leave blank if you don\'t want to change the password' : 'Password must be at least 6 characters long'}
                    </small>
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
                      <span>User is active</span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    className={styles.cancelBtn} 
                    onClick={() => navigate('/users')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.saveBtn}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
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

export default EditUser;
