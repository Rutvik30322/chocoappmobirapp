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
  limit?: number | string; // Allow 'all' string or number
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

  // Get categories (using new categories endpoint)
  async getCategories() {
    const response = await api.get('/categories?active=true');
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

  // Get related products (same category, exclude current product)
  async getRelatedProducts(category: string, excludeProductId: string, limit: number = 4) {
  
    
    // Encode category to handle special characters
    const encodedCategory = encodeURIComponent(category);
    const response = await api.get(`/products?category=${encodedCategory}&limit=${limit + 1}&page=1`);
    
    
    // API interceptor returns response.data directly
    // Backend returns: { success, statusCode, message, data: { products: [...], pagination: {...} } }
    // So response structure is: { success, statusCode, message, data: { products: [...], pagination: {...} } }
    let products = [];
    
    if (response?.data?.products) {
      products = response.data.products;
    } else if (response?.data?.data?.products) {
      products = response.data.data.products;
    } else if (response?.products) {
      products = response.products;
    }
    
    
    // Filter out the current product
    const related = products.filter((p: Product) => {
      const isNotExcluded = p._id !== excludeProductId;
      return isNotExcluded;
    });
    
    
    return { 
      ...response, 
      data: { 
        ...response.data, 
        products: related.slice(0, limit) 
      } 
    };
  }
}

export default new ProductService();
