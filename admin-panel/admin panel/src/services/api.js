import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://172.16.10.248:5000/api',
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API functions
export const productService = {
  // Get all products
  getAllProducts: () => apiClient.get('/products'),

  // Get single product by ID
  getProductById: (id) => apiClient.get(`/products/${id}`),

  // Create new product
  createProduct: (productData) => apiClient.post('/products', productData),

  // Update existing product
  updateProduct: (id, productData) => apiClient.put(`/products/${id}`, productData),

  // Delete product
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),
};

export const uploadService = {
  // Upload product images
  uploadProductImages: (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    
    // Note: We're not setting Content-Type header manually as it will be set by the browser
    // when FormData is sent, including the boundary parameter
    return apiClient.post('/upload/product-images', formData);
  },

  // Delete product image
  deleteProductImage: (publicId) => apiClient.delete(`/upload/product-image/${publicId}`),
};

export default apiClient;