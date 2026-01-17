import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import ThemedLayout from '../components/ThemedLayout';

const AddAddressScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { colors, theme } = useTheme();

  // Check if editing existing address
  const isEditing = route?.params?.addressData ? true : false;
  const existingAddress = route?.params?.addressData || {};
  
  // State for address form
  const [addressForm, setAddressForm] = useState({
    name: existingAddress.name || '',
    address: existingAddress.address || '',
    city: existingAddress.city || '',
    state: existingAddress.state || '',
    pincode: existingAddress.pincode || '',
    phone: existingAddress.phone || '',
    type: existingAddress.type || 'Home', // Default type
    isDefault: existingAddress.isDefault || false,
  });

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle address type selection
  const handleTypeSelect = (type: string) => {
    setAddressForm(prev => ({
      ...prev,
      type: type
    }));
  };

  // Handle default address toggle
  const handleToggleDefault = () => {
    setAddressForm(prev => ({
      ...prev,
      isDefault: !prev.isDefault
    }));
  };

  // Handle save address
  const handleSaveAddress = () => {
    // Validate inputs
    if (!addressForm.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a name for this address',
        visibilityTime: 2000,
      });
      return;
    }

    if (!addressForm.address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter the address',
        visibilityTime: 2000,
      });
      return;
    }

    if (!addressForm.city.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter the city',
        visibilityTime: 2000,
      });
      return;
    }

    if (!addressForm.state.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter the state',
        visibilityTime: 2000,
      });
      return;
    }

    if (!addressForm.pincode.trim() || addressForm.pincode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid 6-digit pincode',
        visibilityTime: 2000,
      });
      return;
    }

    if (!addressForm.phone.trim() || addressForm.phone.length !== 10) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid 10-digit phone number',
        visibilityTime: 2000,
      });
      return;
    }

    // Show success message
    Toast.show({
      type: 'success',
      text1: isEditing ? 'Address Updated' : 'Address Added',
      text2: isEditing 
        ? 'Your address has been updated successfully!' 
        : 'Your new address has been saved successfully!',
      visibilityTime: 2000,
    });

    // Navigate back to delivery address screen
    if (isEditing) {
      // Pass the updated address data back to the previous screen
      navigation.navigate('DeliveryAddress', { 
        updatedAddress: { 
          ...addressForm, 
          id: existingAddress.id 
        } 
      });
    } else {
      navigation.goBack();
    }
  };

  // Get title based on whether editing or adding
  const screenTitle = isEditing ? 'Edit Address' : 'Add New Address';
  const buttonText = isEditing ? 'Update Address' : 'Save Address';
  
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>{screenTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{screenTitle}</Text>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.inputGroup, { backgroundColor: colors.surface, elevation: 2 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
            value={addressForm.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 15 }]}>Address *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
            value={addressForm.address}
            onChangeText={(text) => handleInputChange('address', text)}
            placeholder="Enter your full address"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 15 }]}>City *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
            value={addressForm.city}
            onChangeText={(text) => handleInputChange('city', text)}
            placeholder="Enter city"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 15 }]}>State *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
            value={addressForm.state}
            onChangeText={(text) => handleInputChange('state', text)}
            placeholder="Enter state"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 15 }]}>Pincode *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
            value={addressForm.pincode}
            onChangeText={(text) => handleInputChange('pincode', text)}
            placeholder="Enter 6-digit pincode"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            maxLength={6}
          />

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 15 }]}>Phone Number *</Text>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surface }]}
            value={addressForm.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            placeholder="Enter 10-digit phone number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Address Type Selection */}
        <View style={[styles.section, { backgroundColor: colors.surface, elevation: 2, marginTop: 15 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Address Type</Text>
          
          <View style={styles.typeOptions}>
            {['Home', 'Office', 'Other'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  { 
                    backgroundColor: addressForm.type === type ? colors.primary : colors.surface,
                    borderColor: addressForm.type === type ? colors.primary : colors.textSecondary,
                    borderWidth: 1
                  }
                ]}
                onPress={() => handleTypeSelect(type)}
              >
                <Text style={[
                  styles.typeOptionText, 
                  { 
                    color: addressForm.type === type ? colors.onPrimary : colors.text 
                  }
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Set as Default */}
        <View style={[styles.section, { backgroundColor: colors.surface, elevation: 2, marginTop: 15 }]}>
          <TouchableOpacity 
            style={styles.defaultOption}
            onPress={handleToggleDefault}
          >
            <View style={[
              styles.checkbox,
              { 
                backgroundColor: addressForm.isDefault ? colors.primary : colors.surface,
                borderColor: addressForm.isDefault ? colors.primary : colors.textSecondary,
                borderWidth: 1
              }
            ]}>
              {addressForm.isDefault && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={[styles.defaultOptionText, { color: colors.text }]}>Set as Default Address</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSaveAddress}
      >
        <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>{buttonText}</Text>
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
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    padding: 20,
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 5,
  },
  section: {
    padding: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  typeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  defaultOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  defaultOptionText: {
    fontSize: 16,
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
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

export default AddAddressScreen;