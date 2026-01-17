import api from './api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  rating: number;
  numReviews: number;
  inStock: boolean;
  stock: number;
  weight?: string;
  ingredients?: string[];
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

class ProductService {
  // Get all products
  async getAllProducts(filters?: ProductFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/products?${params.toString()}`);
    return response;
  }

  // Get product by ID
  async getProductById(id: string) {
    const response = await api.get(`/products/${id}`);
    return response;
  }

  // Get categories
  async getCategories() {
    const response = await api.get('/products/categories/all');
    return response;
  }

  // Create product (Admin only)
  async createProduct(data: Partial<Product>) {
    const response = await api.post('/products', data);
    return response;
  }

  // Update product (Admin only)
  async updateProduct(id: string, data: Partial<Product>) {
    const response = await api.put(`/products/${id}`, data);
    return response;
  }

  // Delete product (Admin only)
  async deleteProduct(id: string) {
    const response = await api.delete(`/products/${id}`);
    return response;
  }
}

export default new ProductService();
