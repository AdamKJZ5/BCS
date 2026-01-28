const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

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
  const res = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create review');
  }

  const result = await res.json();
  return result.review;
}

/**
 * Get customer's own reviews
 */
export async function getMyReviews(): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/api/reviews/my-reviews`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch reviews');
  }

  const result = await res.json();
  return result.reviews;
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
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.rating) params.append('rating', filters.rating.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const res = await fetch(`${API_BASE}/api/reviews?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch reviews');
  }

  const result = await res.json();
  return {
    reviews: result.reviews,
    pagination: result.pagination,
  };
}

/**
 * Get public reviews
 */
export async function getPublicReviews(filters: {
  featured?: boolean;
  rating?: number;
  limit?: number;
}): Promise<Review[]> {
  const params = new URLSearchParams();

  if (filters.featured) params.append('featured', 'true');
  if (filters.rating) params.append('rating', filters.rating.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const res = await fetch(`${API_BASE}/api/reviews/public?${params.toString()}`);

  if (!res.ok) {
    throw new Error('Failed to fetch public reviews');
  }

  const result = await res.json();
  return result.reviews;
}

/**
 * Moderate review (admin)
 */
export async function moderateReview(
  id: string,
  status: "approved" | "rejected",
  moderationNote?: string
): Promise<Review> {
  const res = await fetch(`${API_BASE}/api/reviews/${id}/moderate`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, moderationNote }),
  });

  if (!res.ok) {
    throw new Error('Failed to moderate review');
  }

  const result = await res.json();
  return result.review;
}

/**
 * Toggle featured status (admin)
 */
export async function toggleFeatured(id: string): Promise<Review> {
  const res = await fetch(`${API_BASE}/api/reviews/${id}/featured`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to toggle featured status');
  }

  const result = await res.json();
  return result.review;
}

/**
 * Respond to review (admin)
 */
export async function respondToReview(id: string, text: string): Promise<Review> {
  const res = await fetch(`${API_BASE}/api/reviews/${id}/respond`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error('Failed to respond to review');
  }

  const result = await res.json();
  return result.review;
}

/**
 * Delete review (admin)
 */
export async function deleteReview(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/reviews/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to delete review');
  }
}

/**
 * Get review statistics (admin)
 */
export async function getReviewStats(): Promise<ReviewStats> {
  const res = await fetch(`${API_BASE}/api/reviews/stats`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch review stats');
  }

  const result = await res.json();
  return result.stats;
}
