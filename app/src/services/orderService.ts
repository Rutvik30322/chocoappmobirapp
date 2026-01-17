import api from './api';

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface ShippingAddress {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CreateOrderData {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

class OrderService {
  // Create new order
  async createOrder(data: CreateOrderData) {
    const response = await api.post('/orders', data);
    return response;
  }

  // Get user's orders
  async getMyOrders() {
    const response = await api.get('/orders/my-orders');
    return response;
  }

  // Get order by ID
  async getOrderById(id: string) {
    const response = await api.get(`/orders/${id}`);
    return response;
  }

  // Update order to paid
  async updateOrderToPaid(id: string, paymentResult: any) {
    const response = await api.put(`/orders/${id}/pay`, paymentResult);
    return response;
  }

  // Get all orders (Admin only)
  async getAllOrders(status?: string, page?: number) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', page.toString());
    const response = await api.get(`/orders?${params.toString()}`);
    return response;
  }

  // Update order status (Admin only)
  async updateOrderStatus(id: string, orderStatus: string) {
    const response = await api.put(`/orders/${id}/status`, { orderStatus });
    return response;
  }

  // Get dashboard stats (Admin only)
  async getDashboardStats() {
    const response = await api.get('/orders/admin/stats');
    return response;
  }
}

export default new OrderService();
