import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, Platform, PermissionsAndroid, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';
import Logo from '../components/Logo';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateProfile } from '../store/slices/authSlice';
import authService from '../services/authService';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';

const ProfileScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  // State for user data
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    profilePicture: user?.profilePicture || null,
  });
  
  // Fetch latest user data from backend when screen mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authService.getMe();
        // API interceptor returns response.data directly
        // Backend returns: { success, statusCode, message, data: { user } }
        const userDataFromAPI = (response as any)?.data?.user || (response as any)?.user;
        if (userDataFromAPI) {
          // Update AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(userDataFromAPI));
          // Update local state
          setUserData({
            name: userDataFromAPI.name || '',
            email: userDataFromAPI.email || '',
            mobile: userDataFromAPI.mobile || '',
            profilePicture: userDataFromAPI.profilePicture || null,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If API call fails, use Redux state as fallback
        if (user) {
          setUserData({
            name: user.name || '',
            email: user.email || '',
            mobile: user.mobile || '',
            profilePicture: user.profilePicture || null,
          });
        }
      }
    };
    
    fetchUserData();
  }, []); // Only run once on mount

  // Sync user data when Redux state changes (as backup)
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        profilePicture: user.profilePicture || null,
      });
    }
  }, [user]);
  
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // State for change password
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Request camera permission for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  // Request storage permission for Android
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to select photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  // Handle image picker
  const pickImage = async () => {
    try {
      // Show options for camera or gallery
      Alert.alert(
        'Select Profile Picture',
        'Choose an option',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              const hasPermission = await requestStoragePermission();
              if (!hasPermission) {
                Toast.show({
                  type: 'error',
                  text1: 'Permission Denied',
                  text2: 'Storage permission is required to select images',
                  visibilityTime: 2000,
                });
                return;
              }
              
              launchImageLibrary(
                {
                  mediaType: 'photo' as MediaType,
                  quality: 0.8,
                  maxWidth: 1024,
                  maxHeight: 1024,
                },
                (response: ImagePickerResponse) => {
                  if (response.didCancel) {
                   
                  } else if (response.errorMessage) {
                    console.error('ImagePicker Error: ', response.errorMessage);
                    Toast.show({
                      type: 'error',
                      text1: 'Error',
                      text2: response.errorMessage || 'Failed to pick image',
                      visibilityTime: 2000,
                    });
                  } else if (response.assets && response.assets.length > 0) {
                    const imageUri = response.assets[0].uri;
                    if (imageUri) {
                      setSelectedImage(imageUri);
                      uploadProfileImage(imageUri);
                    }
                  }
                }
              );
            },
          },
          {
            text: 'Take Photo',
            onPress: async () => {
              const hasPermission = await requestCameraPermission();
              if (!hasPermission) {
                Toast.show({
                  type: 'error',
                  text1: 'Permission Denied',
                  text2: 'Camera permission is required to take photos',
                  visibilityTime: 2000,
                });
                return;
              }
              
              launchCamera(
                {
                  mediaType: 'photo' as MediaType,
                  quality: 0.8,
                  maxWidth: 1024,
                  maxHeight: 1024,
                },
                (response: ImagePickerResponse) => {
                  if (response.didCancel) {
                    
                  } else if (response.errorMessage) {
                    console.error('Camera Error: ', response.errorMessage);
                    Toast.show({
                      type: 'error',
                      text1: 'Error',
                      text2: response.errorMessage || 'Failed to take photo',
                      visibilityTime: 2000,
                    });
                  } else if (response.assets && response.assets.length > 0) {
                    const imageUri = response.assets[0].uri;
                    if (imageUri) {
                      setSelectedImage(imageUri);
                      uploadProfileImage(imageUri);
                    }
                  }
                }
              );
            },
          },
          {
            text: 'Enter Image URL',
            onPress: () => handleImageUrlInput(),
          },
        ],
        { cancelable: true }
      );
    } catch (error: any) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to pick image',
        visibilityTime: 2000,
      });
    }
  };

  // Alternative: Direct image upload from URL (for testing)
  const handleImageUrlInput = () => {
    Alert.prompt(
      'Enter Image URL',
      'Paste the Cloudinary image URL',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Upload',
          onPress: async (url: string | undefined) => {
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
              setSelectedImage(url);
              // Update profile picture directly via API
              try {
                setUploadingImage(true);
              // Update profile picture URL directly
              await dispatch(updateProfile({ profilePicture: url }));
              // Update local state
              setUserData(prev => ({
                ...prev,
                profilePicture: url,
              }));
              Toast.show({
                type: 'success',
                text1: 'Profile Picture Updated',
                text2: 'Your profile picture has been updated!',
                visibilityTime: 2000,
              });
              } catch (error: any) {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: error.message || 'Failed to update profile picture',
                  visibilityTime: 2000,
                });
              } finally {
                setUploadingImage(false);
              }
            } else {
              Toast.show({
                type: 'error',
                text1: 'Invalid URL',
                text2: 'Please enter a valid image URL',
                visibilityTime: 2000,
              });
            }
          },
        },
      ],
      'plain-text'
    );
  };

  // Upload profile image from file
  const uploadProfileImage = async (imageUri: string) => {
    try {
      setUploadingImage(true);
      const response = await authService.uploadProfilePicture(imageUri);
      
    
      
      // Handle response structure - API interceptor returns response.data directly
      // Backend returns: { success, statusCode, message, data: { profilePicture: url } }
      // So response structure is: { success, statusCode, message, data: { profilePicture: url } }
      const profilePictureUrl = (response as any)?.data?.profilePicture || (response as any)?.profilePicture;
      
      if (profilePictureUrl) {
        // Update local state
        setUserData(prev => ({
          ...prev,
          profilePicture: profilePictureUrl,
        }));
        
        // Refresh user data from backend to update Redux store
        try {
          const userResponse = await authService.getMe();
          // API interceptor returns response.data directly
          // Backend returns: { success, statusCode, message, data: { user } }
          const userData = (userResponse as any)?.data?.user || (userResponse as any)?.user;
          if (userData) {
            // Update AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            // Update Redux store by dispatching updateProfile with empty object to trigger refresh
            // The Redux slice will update from the response
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
        
        Toast.show({
          type: 'success',
          text1: 'Profile Picture Updated',
          text2: 'Your profile picture has been updated successfully!',
          visibilityTime: 2000,
        });
        
        setSelectedImage(null); // Clear selected image after successful upload
      } else {
        throw new Error('No profile picture URL received from server');
      }
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error.message || 'Failed to upload profile picture',
        visibilityTime: 2000,
      });
      setSelectedImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    // Validate inputs
    if (!userData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }
    
    if (!userData.email.trim() || !isValidEmail(userData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }
    
    if (!userData.mobile.trim()) {
      Alert.alert('Validation Error', 'Mobile number is required');
      return;
    }
    
    try {
      // Dispatch update profile action
      await dispatch(updateProfile({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
      }));
      
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully!',
        visibilityTime: 2000,
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message || 'Could not update profile. Please try again.',
        visibilityTime: 2000,
      });
    }
  };
  
  // Validate email function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset to original data
    setUserData({
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      profilePicture: user?.profilePicture || null,
    });
    setSelectedImage(null);
    setIsEditing(false);
  };

  // Handle change password
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your current password',
        visibilityTime: 2000,
      });
      return;
    }

    if (!newPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a new password',
        visibilityTime: 2000,
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'New password must be at least 6 characters long',
        visibilityTime: 2000,
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'New passwords do not match',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      setChangingPassword(true);
      await authService.changePassword(currentPassword, newPassword);
      
      Toast.show({
        type: 'success',
        text1: 'Password Changed',
        text2: 'Your password has been changed successfully!',
        visibilityTime: 3000,
      });

      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowChangePassword(false);
    } catch (error: any) {
      console.error('Password change error:', error);
      Toast.show({
        type: 'error',
        text1: 'Change Password Failed',
        text2: error.message || 'Failed to change password. Please try again.',
        visibilityTime: 2000,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle cancel change password
  const handleCancelChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowChangePassword(false);
  };

  // Check if profile picture is a valid URL
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Get display image (URL or selected image or emoji)
  const getDisplayImage = (): string => {
    if (selectedImage) return selectedImage;
    if (userData.profilePicture && isValidImageUrl(userData.profilePicture)) {
      return userData.profilePicture;
    }
    return '';
  };
  
  return (
    <ThemedLayout edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>  
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>  
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Logo size={30} style={styles.headerLogo} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileHeader}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={isEditing ? pickImage : undefined}
          disabled={!isEditing || uploadingImage}
        >
          {uploadingImage ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : getDisplayImage() ? (
            <Image 
              source={{ uri: getDisplayImage() }} 
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.avatar}>👤</Text>
          )}
          {isEditing && !uploadingImage && (
            <View style={[styles.editImageOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <Text style={styles.editImageText}>📷</Text>
            </View>
          )}
        </TouchableOpacity>
        {isEditing && (
          <View style={styles.changePhotoContainer}>
            <TouchableOpacity 
              onPress={pickImage}
              disabled={uploadingImage}
              style={styles.changePhotoButton}
            >
              <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                {uploadingImage ? 'Uploading...' : 'Change Photo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleImageUrlInput}
              disabled={uploadingImage}
              style={styles.changePhotoButton}
            >
              <Text style={[styles.changePhotoText, { color: colors.textSecondary, fontSize: 12 }]}>
                Or Enter URL
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={[styles.profileName, { color: colors.text }]}>{userData.name}</Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{userData.email}</Text>
        <Text style={[styles.profileMobile, { color: colors.textSecondary }]}>{userData.mobile}</Text>
      </View>
      
      <View style={[styles.profileCard, { backgroundColor: colors.surface, elevation: 3 }]}>
        <View style={styles.profileRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
              value={userData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Enter your name"
            />
          ) : (
            <Text style={[styles.value, { color: colors.text }]}>{userData.name}</Text>
          )}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.profileRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
              value={userData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          ) : (
            <Text style={[styles.value, { color: colors.text }]}>{userData.email}</Text>
          )}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.profileRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Mobile</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
              value={userData.mobile}
              onChangeText={(text) => handleInputChange('mobile', text)}
              placeholder="Enter your mobile"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={[styles.value, { color: colors.text }]}>{userData.mobile}</Text>
          )}
        </View>
      </View>
      
      {/* Change Password Section */}
      <View style={[styles.changePasswordCard, { backgroundColor: colors.surface, elevation: 3 }]}>
        <TouchableOpacity
          style={styles.changePasswordHeader}
          onPress={() => setShowChangePassword(!showChangePassword)}
        >
          <Text style={[styles.changePasswordTitle, { color: colors.text }]}>Change Password</Text>
          <Text style={[styles.changePasswordToggle, { color: colors.primary }]}>
            {showChangePassword ? '−' : '+'}
          </Text>
        </TouchableOpacity>
        
        {showChangePassword && (
          <View style={styles.changePasswordForm}>
            <View style={styles.passwordInputContainer}>
              <Text style={[styles.passwordLabel, { color: colors.textSecondary }]}>Current Password</Text>
              <TextInput
                style={[styles.passwordInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.textSecondary }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Enter current password"
                placeholderTextColor={colors.textSecondary}
                editable={!changingPassword}
              />
            </View>

            <View style={styles.passwordInputContainer}>
              <Text style={[styles.passwordLabel, { color: colors.textSecondary }]}>New Password</Text>
              <TextInput
                style={[styles.passwordInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.textSecondary }]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Enter new password (min 6 characters)"
                placeholderTextColor={colors.textSecondary}
                editable={!changingPassword}
              />
            </View>

            <View style={styles.passwordInputContainer}>
              <Text style={[styles.passwordLabel, { color: colors.textSecondary }]}>Confirm New Password</Text>
              <TextInput
                style={[styles.passwordInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.textSecondary }]}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
                placeholder="Confirm new password"
                placeholderTextColor={colors.textSecondary}
                editable={!changingPassword}
              />
            </View>

            <View style={styles.passwordButtonContainer}>
              <TouchableOpacity
                style={[styles.passwordCancelButton, { backgroundColor: colors.error }]}
                onPress={handleCancelChangePassword}
                disabled={changingPassword}
              >
                <Text style={[styles.passwordButtonText, { color: colors.onPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.passwordSaveButton, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <Text style={[styles.passwordButtonText, { color: colors.onPrimary }]}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
        {isEditing ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: colors.error }]} 
              onPress={handleCancelEdit}
            >
              <Text style={[styles.editButtonText, { color: colors.onPrimary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]} 
              onPress={handleSaveProfile}
            >
              <Text style={[styles.editButtonText, { color: colors.onPrimary }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]} onPress={() => setIsEditing(true)}>
            <Text style={[styles.editButtonText, { color: colors.onPrimary }]}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    fontSize: 50,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  editImageText: {
    fontSize: 24,
  },
  changePhotoContainer: {
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 10,
  },
  changePhotoButton: {
    padding: 5,
    marginVertical: 2,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 5,
  },
  profileMobile: {
    fontSize: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  editButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    textAlign: 'right',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerLogo: {
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  changePasswordCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  changePasswordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changePasswordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  changePasswordToggle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  changePasswordForm: {
    marginTop: 20,
  },
  passwordInputContainer: {
    marginBottom: 15,
  },
  passwordLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  passwordButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  passwordCancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  passwordSaveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  passwordButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;