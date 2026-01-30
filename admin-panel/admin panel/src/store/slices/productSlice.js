import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/api';

// Async thunk for fetching all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getAllProducts(params);
      
      // Handle response structure: { success, message, data: { products, pagination } }
      if (response.data && response.data.data) {
        if (response.data.data.products && response.data.data.pagination) {
          // New structure with pagination
          return {
            products: response.data.data.products || [],
            pagination: response.data.data.pagination || { page: 1, pages: 1, total: 0 }
          };
        } else if (Array.isArray(response.data.data.products)) {
          return {
            products: response.data.data.products,
            pagination: response.data.data.pagination || { page: 1, pages: 1, total: 0 }
          };
        } else if (Array.isArray(response.data.data)) {
          // Fallback for different response structure
          return {
            products: response.data.data,
            pagination: { page: 1, pages: 1, total: response.data.data.length }
          };
        }
      }
      return { products: [], pagination: { page: 1, pages: 1, total: 0 } };
    } catch (error) {
      console.error('Error fetching products:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for creating a product
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
   
    try {
      const response = await productService.createProduct(productData);
     
      return response.data.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for updating a product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
   
    try {
      const response = await productService.updateProduct(id, productData);
    
      return response.data.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for deleting a product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentProduct: null,
    pagination: {
      total: 0,
      page: 1,
      pages: 1,
    },
    currentFilter: {
      search: '',
      category: '',
      inStock: '',
      sort: 'newest',
      page: 1,
      limit: 10,
    }
  },
  reducers: {
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentFilter: (state, action) => {
      state.currentFilter = { ...state.currentFilter, ...action.payload };
    },
    resetPagination: (state) => {
      state.pagination = {
        total: 0,
        page: 1,
        pages: 1,
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.products) {
          state.items = action.payload.products;
          state.pagination = action.payload.pagination || { page: 1, pages: 1, total: 0 };
        } else {
          // Fallback for old structure
          state.items = Array.isArray(action.payload) ? action.payload : [];
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentProduct = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentProduct, clearError, setCurrentFilter, resetPagination } = productSlice.actions;
export default productSlice.reducer;