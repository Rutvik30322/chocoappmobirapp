import api from './api';

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  product: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CreateReviewData {
  product: string;
  rating: number;
  comment?: string;
}

class ReviewService {
  // Get reviews for a product
  async getProductReviews(productId: string, approved: boolean = true) {
    const params = approved ? '?approved=true' : '';
    const response = await api.get(`/reviews/product/${productId}${params}`);
    return response;
  }

  // Create new review
  async createReview(data: CreateReviewData) {
    const response = await api.post('/reviews', data);
    return response;
  }

  // Update review
  async updateReview(reviewId: string, data: Partial<CreateReviewData>) {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response;
  }

  // Delete review
  async deleteReview(reviewId: string) {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response;
  }

  // Get user's reviews
  async getMyReviews() {
    const response = await api.get('/reviews/my-reviews');
    return response;
  }
}

export default new ReviewService();
