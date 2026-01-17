import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';

const DeliveryAddressScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { colors, theme } = useTheme();
  
  // Mock addresses data
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      name: 'Home Address',
      address: '123 Main Street, New York, NY 10001',
      type: 'Home',
      isDefault: true,
    },
    {
      id: '2',
      name: 'Office Address',
      address: '456 Business Ave, New York, NY 10002',
      type: 'Office',
      isDefault: false,
    },
    {
      id: '3',
      name: 'Other Address',
      address: '789 Residential Road, New York, NY 10003',
      type: 'Other',
      isDefault: false,
    },
  ]);
  
  // Handle address updates from AddAddress screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Check if there's updated address data in route params
      if (route.params?.updatedAddress) {
        const updatedAddress = route.params.updatedAddress;
        
        // Update the address in the list
        setAddresses(prev => 
          prev.map(addr => 
            addr.id === updatedAddress.id ? updatedAddress : addr
          )
        );
        
        // Show success message
        Toast.show({
          type: 'success',
          text1: 'Address Updated',
          text2: 'The address has been updated successfully!',
          visibilityTime: 2000,
        });
        
        // Remove the param to avoid re-updating
        navigation.setParams({ updatedAddress: undefined });
      }
    });
    
    return unsubscribe;
  }, [navigation, route.params]);

  // Handle edit address
  const handleEditAddress = (address: any) => {
    // Navigate to AddAddress screen with address data for editing
    navigation.navigate('AddAddress', { addressData: address });
  };
    
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [deleteAddressName, setDeleteAddressName] = useState('');
    
  // Handle delete address
  const handleDeleteAddress = (addressId: string, addressName: string) => {
    setDeleteAddressId(addressId);
    setDeleteAddressName(addressName);
    setShowDeleteModal(true);
  };
    
  // Confirm delete address
  const confirmDeleteAddress = () => {
    if (deleteAddressId) {
      // Remove the address from the list
      setAddresses(prev => prev.filter(addr => addr.id !== deleteAddressId));
        
      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Address Deleted',
        text2: `The address "${deleteAddressName}" has been deleted successfully.`,
        visibilityTime: 2000,
      });
        
      // Close modal
      setShowDeleteModal(false);
      setDeleteAddressId(null);
      setDeleteAddressName('');
    }
  };
    
  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteAddressId(null);
    setDeleteAddressName('');
  };
    
  const renderAddress = ({ item }: { item: any }) => (
    <View style={[styles.addressCard, { backgroundColor: colors.surface, elevation: 2 }]}>  
      <View style={styles.addressHeader}>
        <Text style={[styles.addressName, { color: colors.text }]}>{item.name}</Text>
        {item.isDefault && (
          <Text style={[styles.defaultBadge, { backgroundColor: colors.primary, color: colors.onPrimary }]}>Default</Text>
        )}
      </View>
      <Text style={[styles.addressText, { color: colors.text }]}>{item.address}</Text>
      <View style={styles.addressActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditAddress(item)}
        >
          <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteAddress(item.id, item.name)}
        >
          <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Delivery Addresses</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>  
            <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm Delete</Text>
            <Text style={[styles.modalMessage, { color: colors.text }]}>Are you sure you want to delete the address "{deleteAddressName}"?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalCancelButton, { backgroundColor: colors.textSecondary }]}
                onPress={cancelDelete}
              >
                <Text style={[styles.modalButtonText, { color: colors.background }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalDeleteButton, { backgroundColor: colors.error }]}
                onPress={confirmDeleteAddress}
              >
                <Text style={[styles.modalButtonText, { color: colors.onPrimary }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <Text style={[styles.title, { color: colors.text }]}>Delivery Addresses</Text>
      
      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddAddress')}>
        <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>Add New Address</Text>
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
  addressCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '500',
  },
  defaultBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 15,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 5,
  },
  modalDeleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 5,
  },
  modalButtonText: {
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

export default DeliveryAddressScreen;