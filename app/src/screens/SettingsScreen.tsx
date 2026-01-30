import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { useCart } from '../context/CartContext';
import Logo from '../components/Logo';
import ProfileIcon from '../components/ProfileIcon';
import DeliveryIcon from '../components/DeliveryIcon';
import HelpIcon from '../components/HelpIcon';
import AboutIcon from '../components/AboutIcon';
import MoonIcon from '../components/MoonIcon';
import SunIcon from '../components/SunIcon';
import LogoutIcon from '../components/LogoutIcon';

const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { clearCart } = useCart();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Function to get themed icons
  const getThemedIcon = (iconType: string) => {
    if (theme === 'light') {
      switch (iconType) {
        case 'notifications': return '🔔';
        case 'payment': return '💳';
        case 'password': return '🔒';
        default: return '❓';
      }
    } else {
      switch (iconType) {
        case 'notifications': return '📢';
        case 'payment': return '💸';
        case 'password': return '🔑';
        default: return '❓';
      }
    }
  };
  
  const settingsOptions = [
    { id: '1', title: 'Profile', iconType: 'profile', screen: 'Profile' },
    { id: '2', title: 'Delivery Address', iconType: 'delivery', screen: 'DeliveryAddress' },
    { id: '3', title: 'Help & Support', iconType: 'help', screen: 'HelpSupport' },
    { id: '4', title: 'About', iconType: 'about', screen: 'About' },
  ];

  const handleOptionPress = (screenName: string) => {
    navigation.navigate(screenName);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setShowLogoutModal(false);
      
      // Clear local cart first (this always works)
      // The CartContext's clearCart will also try to clear backend cart,
      // but we'll handle any errors silently
      clearCart();
      
      // Dispatch logout action to clear Redux state and AsyncStorage
      await dispatch(logout());
      
      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully',
        visibilityTime: 2000,
      });
      
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: error.message || 'Failed to logout. Please try again.',
        visibilityTime: 2000,
      });
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <ThemedLayout edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack() || navigation.navigate('HomeTabs')}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Logo size={30} style={styles.headerLogo} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.settingsList}>
        {settingsOptions.map((option) => (
          <TouchableOpacity 
            key={option.id} 
            style={[styles.option, { borderBottomColor: colors.textSecondary }]}
            onPress={() => handleOptionPress(option.screen)}
          >
            <View style={styles.optionContent}>
              {option.iconType === 'profile' ? (
                <View style={styles.iconContainer}>
                  <ProfileIcon size={24} focused={true} color={colors.primary} />
                </View>
              ) : option.iconType === 'delivery' ? (
                <View style={styles.iconContainer}>
                  <DeliveryIcon size={24} focused={true} color={colors.primary} />
                </View>
              ) : option.iconType === 'help' ? (
                <View style={styles.iconContainer}>
                  <HelpIcon size={24} focused={true} color={colors.primary} />
                </View>
              ) : option.iconType === 'about' ? (
                <View style={styles.iconContainer}>
                  <AboutIcon size={24} focused={true} color={colors.primary} />
                </View>
              ) : (
              <Text style={[styles.optionIcon, { color: colors.primary }]}>{getThemedIcon(option.iconType)}</Text>
              )}
              <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
            </View>
            <Text style={{ color: colors.textSecondary }}>›</Text>
          </TouchableOpacity>
        ))}
        
        {/* Theme Toggle */}
        <TouchableOpacity 
          style={[styles.option, { borderBottomColor: colors.textSecondary }]}
          onPress={toggleTheme}
        >
          <View style={styles.optionContent}>
            <View style={styles.iconContainer}>
              {theme === 'light' ? (
                <MoonIcon size={24} color={colors.primary} />
              ) : (
                <SunIcon size={24} color={colors.primary} />
              )}
            </View>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Logout */}
        <TouchableOpacity 
          style={[styles.logoutOption, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <View style={styles.logoutButtonContent}>
            <LogoutIcon size={20} color={colors.onPrimary} />
          <Text style={[styles.logoutText, { color: colors.onPrimary }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.modalIconContainer}>
              <LogoutIcon size={48} color={colors.error} />
            </View>
            
            <Text style={[styles.modalTitle, { color: colors.text }]}>Logout</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Are you sure you want to logout?
            </Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { backgroundColor: colors.textSecondary + '20', borderColor: colors.textSecondary }]}
                onPress={cancelLogout}
              >
                <Text style={[styles.modalCancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: colors.error }]}
                onPress={confirmLogout}
              >
                <View style={styles.modalButtonContent}>
                  <LogoutIcon size={18} color={colors.onPrimary} />
                <Text style={[styles.modalConfirmButtonText, { color: colors.onPrimary }]}>Logout</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  backButton: {
    padding: 5,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingsList: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  iconContainer: {
    marginRight: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
  },
  logoutOption: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;