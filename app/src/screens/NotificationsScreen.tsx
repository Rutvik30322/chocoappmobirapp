import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemedLayout from '../components/ThemedLayout';

const NotificationsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotional: false,
    productUpdates: true,
    specialOffers: true,
  });

  const toggleNotification = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <ThemedLayout edges={['top']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>  
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>  
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Notification Settings</Text>
      
      <View style={[styles.card, { backgroundColor: colors.surface, elevation: 3 }]}>
        <View style={styles.row}>
          <View>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Order Updates</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
              Get notified about your order status
            </Text>
          </View>
          <Switch
            value={notifications.orderUpdates}
            onValueChange={() => toggleNotification('orderUpdates')}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={notifications.orderUpdates ? colors.onPrimary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <View>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Promotional Offers</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
              Special deals and offers
            </Text>
          </View>
          <Switch
            value={notifications.promotional}
            onValueChange={() => toggleNotification('promotional')}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={notifications.promotional ? colors.onPrimary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <View>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Product Updates</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
              New products and features
            </Text>
          </View>
          <Switch
            value={notifications.productUpdates}
            onValueChange={() => toggleNotification('productUpdates')}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={notifications.productUpdates ? colors.onPrimary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <View>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Special Offers</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
              Exclusive discounts and promotions
            </Text>
          </View>
          <Switch
            value={notifications.specialOffers}
            onValueChange={() => toggleNotification('specialOffers')}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={notifications.specialOffers ? colors.onPrimary : '#f4f3f4'}
          />
        </View>
      </View>
      
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>Save Settings</Text>
      </TouchableOpacity>
      </View>
    </ThemedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default NotificationsScreen;