import apiClient from '../utils/apiClient';

export interface Review {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email?: string;
  };
  leadId?: string;
  appointmentId?: string;
  rating: number;
  title?: string;
  comment: string;
  serviceType?: string;
  photos?: string[];
  status: "pending" | "approved" | "rejected";
  moderatedBy?: {
    _id: string;
    name: string;
  };
  moderatedAt?: string;
  moderationNote?: string;
  featured: boolean;
  displayOnWebsite: boolean;
  helpfulCount: number;
  response?: {
    text: string;
    respondedBy: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  rating: number;
  title?: string;
  comment: string;
  serviceType?: string;
  leadId?: string;
  appointmentId?: string;
  displayOnWebsite?: boolean;
}

export interface ReviewStats {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

/**
 * Create a new review (customer)
 */
export async function createReview(data: CreateReviewData): Promise<Review> {
  try {
    const response = await apiClient.post('/reviews', data);
    return response.data.review;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create review');
  }
}

/**
 * Get customer's own reviews
 */
export async function getMyReviews(): Promise<Review[]> {
  try {
    const response = await apiClient.get('/reviews/my-reviews');
    return response.data.reviews;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
  }
}

/**
 * Get all reviews (admin)
 */
export async function getAllReviews(filters: {
  status?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ reviews: Review[]; pagination: any }> {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.rating) params.append('rating', filters.rating.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/reviews?${params.toString()}`);
    return {
      reviews: response.data.reviews,
      pagination: response.data.pagination,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
  }
}

/**
 * Get public reviews
 */
export async function getPublicReviews(filters: {
  featured?: boolean;
  rating?: number;
  limit?: number;
}): Promise<Review[]> {
  try {
    const params = new URLSearchParams();

    if (filters.featured) params.append('featured', 'true');
    if (filters.rating) params.append('rating', filters.rating.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/reviews/public?${params.toString()}`);
    return response.data.reviews;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch public reviews');
  }
}

/**
 * Moderate review (admin)
 */
export async function moderateReview(
  id: string,
  status: "approved" | "rejected",
  moderationNote?: string
): Promise<Review> {
  try {
    const response = await apiClient.patch(`/reviews/${id}/moderate`, { status, moderationNote });
    return response.data.review;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to moderate review');
  }
}

/**
 * Toggle featured status (admin)
 */
export async function toggleFeatured(id: string): Promise<Review> {
  try {
    const response = await apiClient.patch(`/reviews/${id}/featured`);
    return response.data.review;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to toggle featured status');
  }
}

/**
 * Respond to review (admin)
 */
export async function respondToReview(id: string, text: string): Promise<Review> {
  try {
    const response = await apiClient.post(`/reviews/${id}/respond`, { text });
    return response.data.review;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to respond to review');
  }
}

/**
 * Delete review (admin)
 */
export async function deleteReview(id: string): Promise<void> {
  try {
    await apiClient.delete(`/reviews/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete review');
  }
}

/**
 * Get review statistics (admin)
 */
export async function getReviewStats(): Promise<ReviewStats> {
  try {
    const response = await apiClient.get('/reviews/stats');
    return response.data.stats;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch review stats');
  }
}
