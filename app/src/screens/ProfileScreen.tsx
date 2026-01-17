import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateProfile } from '../store/slices/authSlice';

const ProfileScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  // State for user data
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    avatar: user?.profilePicture || '👤',
  });
  
  // Sync user data when Redux state changes
  useEffect(() => {
    setUserData({
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      avatar: user?.profilePicture || '👤',
    });
  }, [user]);
  
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
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
    } catch (error) {
      console.error('Profile update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Could not update profile. Please try again.',
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
      avatar: user?.profilePicture || '👤',
    });
    setIsEditing(false);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{userData.avatar}</Text>
        </View>
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
      </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  },
  avatar: {
    fontSize: 50,
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
});

export default ProfileScreen;