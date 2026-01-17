import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';

const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, theme, toggleTheme } = useTheme();
  
  // Function to get themed icons
  const getThemedIcon = (iconType: string) => {
    if (theme === 'light') {
      switch (iconType) {
        case 'profile': return '👤';
        case 'notifications': return '🔔';
        case 'payment': return '💳';
        case 'delivery': return '📍';
        case 'password': return '🔒';
        case 'help': return '❓';
        case 'about': return 'ℹ️';
        default: return '❓';
      }
    } else {
      switch (iconType) {
        case 'profile': return '👤';
        case 'notifications': return '📢';
        case 'payment': return '💸';
        case 'delivery': return '🚚';
        case 'password': return '🔑';
        case 'help': return '💡';
        case 'about': return '📖';
        default: return '❓';
      }
    }
  };
  
  const settingsOptions = [
    { id: '1', title: 'Profile', iconType: 'profile', screen: 'Profile' },
    { id: '2', title: 'Notifications', iconType: 'notifications', screen: 'Notifications' },
    { id: '3', title: 'Payment Methods', iconType: 'payment', screen: 'PaymentMethods' },
    { id: '4', title: 'Delivery Address', iconType: 'delivery', screen: 'DeliveryAddress' },
    { id: '5', title: 'Change Password', iconType: 'password', screen: 'ChangePassword' },
    { id: '6', title: 'Help & Support', iconType: 'help', screen: 'HelpSupport' },
    { id: '7', title: 'About', iconType: 'about', screen: 'About' },
  ];

  const handleOptionPress = (screenName: string) => {
    // Show toast message for payment methods and navigate
    if (screenName === 'PaymentMethods') {
      Toast.show({
        type: 'success',
        text1: 'Payment Methods',
        text2: 'Navigating to payment methods screen',
        visibilityTime: 2000,
      });
    }
    
    navigation.navigate(screenName);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
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
              <Text style={[styles.optionIcon, { color: colors.primary }]}>{getThemedIcon(option.iconType)}</Text>
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
            <Text style={[styles.optionIcon, { color: colors.primary }]}>
              {theme === 'light' ? '🌙' : '☀️'}
            </Text>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Logout */}
        <TouchableOpacity 
          style={[styles.logoutOption, { backgroundColor: colors.error }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.logoutText, { color: colors.onPrimary }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
  optionTitle: {
    fontSize: 16,
  },
  logoutOption: {
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;