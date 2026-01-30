import api from './api';

export interface Address {
  _id: string;
  name?: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  type?: 'Home' | 'Office' | 'Other';
  isDefault: boolean;
}

export interface CreateAddressData {
  name?: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  type?: 'Home' | 'Office' | 'Other';
  isDefault?: boolean;
}

class AddressService {
  // Get all addresses for current user
  async getAddresses() {
    const response = await api.get('/addresses');
    return response;
  }

  // Add new address
  async addAddress(data: CreateAddressData) {
    const response = await api.post('/addresses', data);
    return response;
  }

  // Update address
  async updateAddress(addressId: string, data: Partial<CreateAddressData>) {
    const response = await api.put(`/addresses/${addressId}`, data);
    return response;
  }

  // Delete address
  async deleteAddress(addressId: string) {
    const response = await api.delete(`/addresses/${addressId}`);
    return response;
  }

  // Set address as default
  async setDefaultAddress(addressId: string) {
    const response = await api.put(`/addresses/${addressId}/set-default`);
    return response;
  }
}

export default new AddressService();
