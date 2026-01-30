import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://172.16.10.248:5000/api',  // Updated to match actual backend address from logs
  timeout: 60000, // 60 seconds timeout to accommodate Cloudinary uploads
});

// Request queue to prevent duplicate requests (only for same request within 500ms)
const pendingRequests = new Map();
const REQUEST_DEBOUNCE_TIME = 500; // 500ms - only prevent rapid double-clicks

// Add request interceptor to include token and prevent duplicate requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Create a unique key for this request
    const requestKey = `${config.method.toUpperCase()}_${config.url}_${JSON.stringify(config.params || {})}`;
    
    // Check if this request is already pending and was made very recently (within 500ms)
    const existingRequest = pendingRequests.get(requestKey);
    const now = Date.now();
    
    if (existingRequest && (now - existingRequest) < REQUEST_DEBOUNCE_TIME) {
      // Only prevent if it's within 500ms - this prevents rapid duplicate clicks/refreshes
      // But allows normal page reloads and legitimate retries
      if (process.env.NODE_ENV === 'development') {
        console.warn('Duplicate request prevented (within 500ms):', requestKey);
      }
      return Promise.reject(new Error('Duplicate request prevented'));
    }
    
    // Mark request as pending
    pendingRequests.set(requestKey, now);
    
    // Remove from pending after 1 second (cleanup)
    setTimeout(() => {
      pendingRequests.delete(requestKey);
    }, 1000);
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
     
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Remove from pending requests on success
    if (response.config) {
      const requestKey = `${response.config.method.toUpperCase()}_${response.config.url}_${JSON.stringify(response.config.params || {})}`;
      pendingRequests.delete(requestKey);
    }
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
     
    }
    return response;
  },
  (error) => {
    // Remove from pending requests on error
    if (error.config) {
      const requestKey = `${error.config.method.toUpperCase()}_${error.config.url}_${JSON.stringify(error.config.params || {})}`;
      pendingRequests.delete(requestKey);
    }
    
    // Handle 429 Too Many Requests - silently handle without alert
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || error.response.headers['ratelimit-reset'] || 1;
      
      // Log in development only
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
      }
      
      // Return error without showing alert - let components handle it
      return Promise.reject({
        ...error,
        message: `Too many requests. Please wait ${retryAfter} seconds before trying again.`,
        retryAfter: parseInt(retryAfter) || 1,
        isRateLimit: true
      });
    }
    
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.status, error.config?.url, error.message);
    }
    return Promise.reject(error);
  }
);

// API functions
export const productService = {
  // Get all products with filters and pagination
  getAllProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    
    if (process.env.NODE_ENV === 'development') {
    
    }
    return apiClient.get(url);
  },

  // Get single product by ID
  getProductById: (id) => apiClient.get(`/products/${id}`),

  // Create new product - supports both form data and JSON
  createProduct: (productData) => {
    // If we have image URLs (from Cloudinary), send as JSON
    if (productData.image || (productData.images && productData.images.length > 0)) {
      if (process.env.NODE_ENV === 'development') {
       
      }
      return apiClient.post('/products', productData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      // For new file uploads, we'd typically send as form data
      // But since we're uploading images separately first, we send as JSON
      if (process.env.NODE_ENV === 'development') {
       
      }
      return apiClient.post('/products', productData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  },

  // Update existing product - supports both form data and JSON
  updateProduct: (id, productData) => {
    // If we have image URLs (from Cloudinary), send as JSON
    if (productData.image || (productData.images && productData.images.length > 0)) {
      if (process.env.NODE_ENV === 'development') {
      
      }
      return apiClient.put(`/products/${id}`, productData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      // For new file uploads, we'd typically send as form data
      // But since we're uploading images separately first, we send as JSON
      if (process.env.NODE_ENV === 'development') {
       
      }
      return apiClient.put(`/products/${id}`, productData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  },

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
    if (process.env.NODE_ENV === 'development') {
     
    }
    return apiClient.post('/upload/product-images', formData, {
      timeout: 60000, // Increased timeout for file uploads
    });
  },

  // Delete product image
  deleteProductImage: (publicId) => apiClient.delete(`/upload/product-image/${publicId}`),

  // Upload profile picture
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    if (process.env.NODE_ENV === 'development') {
     
    }
    return apiClient.post('/upload/profile-picture', formData, {
      timeout: 60000, // Increased timeout for file uploads
    });
  },

  // Delete profile picture
  deleteProfilePicture: () => apiClient.delete('/upload/profile-picture'),
};

export const bannerService = {
  // Get all banners
  getAllBanners: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `/banners?${queryString}` : '/banners';
    return apiClient.get(url);
  },

  // Get single banner by ID
  getBannerById: (id) => apiClient.get(`/banners/${id}`),

  // Create new banner
  createBanner: (bannerData) => {
    return apiClient.post('/banners', bannerData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  // Update existing banner
  updateBanner: (id, bannerData) => {
    return apiClient.put(`/banners/${id}`, bannerData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  // Delete banner
  deleteBanner: (id) => apiClient.delete(`/banners/${id}`),
};

export const userService = {
  // Get all users with filters
  getAllUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== undefined) {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    
    if (process.env.NODE_ENV === 'development') {
   
    }
    return apiClient.get(url);
  },

  // Get single user by ID
  getUserById: (id) => apiClient.get(`/users/${id}`),

  // Create new user
  createUser: (userData) => {
    if (process.env.NODE_ENV === 'development') {
     
    }
    return apiClient.post('/users', userData);
  },

  // Update existing user
  updateUser: (id, userData) => {
    if (process.env.NODE_ENV === 'development') {
    
    }
    return apiClient.put(`/users/${id}`, userData);
  },

  // Delete user
  deleteUser: (id) => {
    if (process.env.NODE_ENV === 'development') {
   
    }
    return apiClient.delete(`/users/${id}`);
  },

  // Toggle user active status
  toggleUserStatus: (id) => {
    if (process.env.NODE_ENV === 'development') {
  
    }
    return apiClient.put(`/users/${id}/toggle-status`);
  },
};

export const categoryService = {
  // Get all categories
  getAllCategories: (active = true) => {
    const url = active ? '/categories?active=true' : '/categories';
    return apiClient.get(url);
  },

  // Get single category by ID
  getCategoryById: (id) => apiClient.get(`/categories/${id}`),

  // Create new category
  createCategory: (categoryData) => {
    if (process.env.NODE_ENV === 'development') {
    
    }
    return apiClient.post('/categories', categoryData);
  },

  // Update existing category
  updateCategory: (id, categoryData) => {
    if (process.env.NODE_ENV === 'development') {
     
    }
    return apiClient.put(`/categories/${id}`, categoryData);
  },

  // Delete category
  deleteCategory: (id) => {
    if (process.env.NODE_ENV === 'development') {
   
    }
    return apiClient.delete(`/categories/${id}`);
  },

  // Parse PDF for categories
  parsePdfForCategories: (pdfFile) => {
    const formData = new FormData();
    formData.append('pdfFile', pdfFile);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Parsing PDF for categories');
    }
    return apiClient.post('/categories/parse-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for PDF parsing
    });
  },

  // Parse PDF and create products with AI-generated details
  parsePdfAndCreateProducts: (pdfFile) => {
    const formData = new FormData();
    formData.append('pdfFile', pdfFile);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Parsing PDF and creating products');
    }
    return apiClient.post('/categories/parse-pdf-create-products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for AI processing multiple products
    });
  },
};

export const orderService = {
  // Get all orders
  getAllOrders: (status, page = 1) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    return apiClient.get(`/orders?${params.toString()}`);
  },

  // Get single order by ID
  getOrderById: (id) => apiClient.get(`/orders/${id}`),

  // Update order status
  updateOrderStatus: (id, orderStatus) => {
    if (process.env.NODE_ENV === 'development') {
   
    }
    return apiClient.put(`/orders/${id}/status`, { orderStatus });
  },

  // Update order payment status
  updateOrderPayment: (id, isPaid, paymentResult) => {
    if (process.env.NODE_ENV === 'development') {
     
    }
    return apiClient.put(`/orders/${id}/payment`, { isPaid, paymentResult });
  },

  // Get dashboard stats
  getDashboardStats: () => apiClient.get('/orders/admin/stats'),

  // Delete order (Admin only)
  deleteOrder: (id) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Deleting order:', id);
    }
    return apiClient.delete(`/orders/${id}`);
  },
};

export const adminService = {
  // Get all admins (Super admin only)
  getAllAdmins: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    const url = `/admins${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiClient.get(url);
  },

  // Get single admin by ID
  getAdminById: (id) => apiClient.get(`/admins/${id}`),

  // Create new admin
  createAdmin: (adminData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Creating admin:', adminData);
    }
    return apiClient.post('/admins', adminData);
  },

  // Update existing admin
  updateAdmin: (id, adminData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Updating admin:', id, adminData);
    }
    return apiClient.put(`/admins/${id}`, adminData);
  },

  // Delete admin
  deleteAdmin: (id) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Deleting admin:', id);
    }
    return apiClient.delete(`/admins/${id}`);
  },

  // Toggle admin active status
  toggleAdminStatus: (id) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Toggling admin status:', id);
    }
    return apiClient.put(`/admins/${id}/toggle-status`);
  },
};

export const reviewService = {
  // Get all reviews
  getAllReviews: (product, approved, page = 1) => {
    const params = new URLSearchParams();
    if (product) params.append('product', product);
    if (approved !== undefined) params.append('approved', approved);
    params.append('page', page.toString());
    return apiClient.get(`/reviews?${params.toString()}`);
  },

  // Get review by ID
  getReviewById: (id) => apiClient.get(`/reviews/${id}`),

  // Approve/Reject review
  approveReview: (id, isApproved) => {
    if (process.env.NODE_ENV === 'development') {
   
    }
    return apiClient.put(`/reviews/${id}/approve`, { isApproved });
  },

  // Delete review (Admin)
  deleteReview: (id) => {
    if (process.env.NODE_ENV === 'development') {
   
    }
    return apiClient.delete(`/reviews/${id}/admin`);
  },
};

export default apiClient;