import api from './api';

export interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    inStock: boolean;
    stock: number;
  };
  quantity: number;
}

export interface CartApiResponse {
  success: boolean;
  message: string;
  data: {
    cart: CartItem[];
  };
}

class CartService {
  // Get user's cart from backend
  async getCart() {
    const response = await api.get('/cart');
    return response;
  }

  // Add item to cart
  async addToCart(productId: string, quantity: number = 1) {
    const response = await api.post('/cart/add', { productId, quantity });
    return response;
  }

  // Remove item from cart
  async removeFromCart(productId: string) {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response;
  }

  // Update cart item quantity
  async updateCartItemQuantity(productId: string, quantity: number) {
    const response = await api.put(`/cart/update/${productId}`, { quantity });
    return response;
  }

  // Clear cart
  async clearCart() {
    const response = await api.delete('/cart/clear');
    return response;
  }
}

export default new CartService();