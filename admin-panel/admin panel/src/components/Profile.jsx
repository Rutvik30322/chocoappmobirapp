import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, updateAdminProfile, changeAdminPassword } from '../services/authService';
import { uploadService } from '../services/api';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';

const Profile = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobile: '',
    profilePicture: '',
  });

  // Admin details state (read-only)
  const [adminDetails, setAdminDetails] = useState({
    role: '',
    isActive: true,
    permissions: [],
    createdAt: '',
    updatedAt: '',
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector(state => state.auth);


  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getMe();
      if (response.admin) {
        setProfileData({
          name: response.admin.name || '',
          email: response.admin.email || '',
          mobile: response.admin.mobile || '',
          profilePicture: response.admin.profilePicture || '',
        });
        
        // Set admin details (read-only)
        setAdminDetails({
          role: response.admin.role || 'admin',
          isActive: response.admin.isActive !== undefined ? response.admin.isActive : true,
          permissions: response.admin.permissions || [],
          createdAt: response.admin.createdAt || '',
          updatedAt: response.admin.updatedAt || '',
        });
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // Handle mobile number input - restrict to 10 digits only
    if (name === 'mobile') {
      const mobileValue = value.replace(/[^0-9]/g, '').substring(0, 10);
      setProfileData(prev => ({ ...prev, [name]: mobileValue }));
      return;
    }
    
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');
    setSuccess('');

    try {
      const uploadResponse = await uploadService.uploadProfilePicture(file);
      
      if (uploadResponse.data && 
          uploadResponse.data.data && 
          uploadResponse.data.data.profilePicture) {
        const imageUrl = uploadResponse.data.data.profilePicture;
        
        setProfileData(prev => ({
          ...prev,
          profilePicture: imageUrl
        }));
        
        setSuccess('Profile picture uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
        e.target.value = ''; // Reset file input
      } else {
        setError('Error: No image URL received from server');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError('Error uploading image: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await updateAdminProfile(profileData);
      setSuccess('Profile updated successfully!');
      
      // Reload profile to get updated details
      if (response && response.admin) {
        setAdminDetails({
          role: response.admin.role || adminDetails.role,
          isActive: response.admin.isActive !== undefined ? response.admin.isActive : adminDetails.isActive,
          permissions: response.admin.permissions || adminDetails.permissions,
          createdAt: response.admin.createdAt || adminDetails.createdAt,
          updatedAt: response.admin.updatedAt || new Date().toISOString(),
        });
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await changeAdminPassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <main className={`${styles.mainContent} ${!sidebarOpen ? styles.mainContentExpanded : ''}`}>
        <Header 
          title="Profile Settings"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={styles.dashboardContent}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'profile' ? '3px solid #6b46c1' : '3px solid transparent',
                color: activeTab === 'profile' ? '#6b46c1' : '#6b7280',
                cursor: 'pointer',
                fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
                fontSize: '16px',
              }}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'password' ? '3px solid #6b46c1' : '3px solid transparent',
                color: activeTab === 'password' ? '#6b46c1' : '#6b7280',
                cursor: 'pointer',
                fontWeight: activeTab === 'password' ? 'bold' : 'normal',
                fontSize: '16px',
              }}
            >
              Change Password
            </button>
          </div>

          {error && (
            <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '1rem', background: '#d1fae5', color: '#059669', borderRadius: '8px', marginBottom: '1rem' }}>
              {success}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '800px' }}>
              {/* Account Details Section */}
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{ 
                  margin: '0 0 1.5rem 0', 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  Account Details
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '1.5rem' 
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#6b7280', 
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      Name
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '1rem',
                      color: '#1f2937',
                      fontWeight: '600'
                    }}>
                      {profileData.name || 'N/A'}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#6b7280', 
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      Mobile Number
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '1rem',
                      color: '#1f2937',
                      fontWeight: '600'
                    }}>
                      {profileData.mobile || 'Not set'}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#6b7280', 
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      Role
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '1rem',
                      color: '#1f2937',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {adminDetails.role === 'superadmin' ? '👑 Super Admin' : '👤 Admin'}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#6b7280', 
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      Account Status
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '1rem',
                      color: adminDetails.isActive ? '#059669' : '#dc2626',
                      fontWeight: '600'
                    }}>
                      {adminDetails.isActive ? '✅ Active' : '❌ Inactive'}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#6b7280', 
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      Member Since
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.95rem',
                      color: '#1f2937'
                    }}>
                      {adminDetails.createdAt 
                        ? new Date(adminDetails.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#6b7280', 
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      Last Updated
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.95rem',
                      color: '#1f2937'
                    }}>
                      {adminDetails.updatedAt 
                        ? new Date(adminDetails.updatedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                {adminDetails.permissions && adminDetails.permissions.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      color: '#6b7280', 
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      Permissions
                    </label>
                    <div style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {adminDetails.permissions.map((permission, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: '#ede9fe',
                            color: '#6b46c1',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Edit Form */}
              <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={profileData.mobile}
                  onChange={handleProfileChange}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
                  Enter your 10-digit mobile number
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Profile Picture
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {profileData.profilePicture && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={profileData.profilePicture}
                        alt="Profile"
                        style={{ 
                          width: '120px', 
                          height: '120px', 
                          borderRadius: '50%', 
                          objectFit: 'cover',
                          border: '3px solid #e5e7eb'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        borderRadius: '8px', 
                        border: '1px solid #d1d5db', 
                        fontSize: '16px',
                        cursor: uploadingImage ? 'not-allowed' : 'pointer',
                        opacity: uploadingImage ? 0.6 : 1
                      }}
                    />
                    {uploadingImage && (
                      <div style={{ 
                        marginTop: '0.5rem', 
                        padding: '0.5rem', 
                        background: '#f3f4f6', 
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        ⏳ Uploading image...
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.5rem' }}>
                      Upload an image file (JPG, PNG, WEBP). Max size: 5MB
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || uploadingImage}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#6b46c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: (loading || uploadingImage) ? 'not-allowed' : 'pointer',
                  opacity: (loading || uploadingImage) ? 0.6 : 1,
                }}
              >
                {loading ? 'Updating...' : uploadingImage ? 'Uploading Image...' : 'Update Profile'}
              </button>
            </form>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} style={{ maxWidth: '600px' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  minLength={6}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                  required
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
                  Password must be at least 6 characters long
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  minLength={6}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  background: '#6b46c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
