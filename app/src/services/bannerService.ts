import api from './api';

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  image: string;
  offer?: string;
  link?: string;
  order: number;
  isActive: boolean;
}

class BannerService {
  // Get all active banners
  async getAllBanners() {
    const response = await api.get('/banners?active=true');
    return response;
  }
}

export default new BannerService();
