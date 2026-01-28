import { useState, useEffect } from "react";
import AdminLayout from "../../components/Layout/AdminLayout";
import {
  getAllReviews,
  moderateReview,
  toggleFeatured,
  respondToReview,
  deleteReview,
  getReviewStats,
  Review,
  ReviewStats,
} from "../../api/reviews";

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    loadData();
  }, [statusFilter, ratingFilter, search]);

  const loadData = async () => {
    try {
      const [reviewData, statsData] = await Promise.all([
        getAllReviews({ status: statusFilter, rating: ratingFilter, search, limit: 50 }),
        getReviewStats(),
      ]);
      setReviews(reviewData.reviews);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, status: "approved" | "rejected") => {
    try {
      await moderateReview(id, status);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to moderate review");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleFeatured(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to toggle featured status");
    }
  };

  const handleRespond = async (id: string) => {
    if (!responseText.trim()) {
      alert("Please enter a response");
      return;
    }

    try {
      await respondToReview(id, responseText);
      setRespondingTo(null);
      setResponseText("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to respond to review");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review? This cannot be undone.")) {
      return;
    }

    try {
      await deleteReview(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete review");
    }
  };

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loading}>Loading reviews...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Reviews & Testimonials</h1>
          <p style={styles.subtitle}>Manage customer reviews and testimonials</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Stats */}
        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalReviews}</div>
              <div style={styles.statLabel}>Total Reviews</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.pendingReviews}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.approvedReviews}</div>
              <div style={styles.statLabel}>Approved</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.averageRating.toFixed(1)}</div>
              <div style={styles.statLabel}>Avg Rating</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={styles.filters}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={ratingFilter || ""}
            onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : undefined)}
            style={styles.select}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Reviews List */}
        <div style={styles.reviewsList}>
          {reviews.length === 0 && (
            <div style={styles.emptyState}>No reviews found</div>
          )}

          {reviews.map((review) => (
            <div key={review._id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div>
                  <div style={styles.customerName}>{review.customerId.name}</div>
                  <div style={styles.customerEmail}>{review.customerId.email}</div>
                  <div style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={styles.headerRight}>
                  <div style={styles.ratingStars}>{renderStars(review.rating)}</div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      ...(review.status === "pending" && styles.statusPending),
                      ...(review.status === "approved" && styles.statusApproved),
                      ...(review.status === "rejected" && styles.statusRejected),
                    }}
                  >
                    {review.status.toUpperCase()}
                  </div>
                  {review.featured && <div style={styles.featuredBadge}>⭐ FEATURED</div>}
                </div>
              </div>

              {review.title && <h3 style={styles.reviewTitle}>{review.title}</h3>}
              <p style={styles.reviewComment}>{review.comment}</p>

              {review.serviceType && (
                <div style={styles.serviceType}>Service: {review.serviceType}</div>
              )}

              {review.response && (
                <div style={styles.response}>
                  <strong>Your Response:</strong> {review.response.text}
                </div>
              )}

              {/* Respond Form */}
              {respondingTo === review._id && (
                <div style={styles.respondForm}>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                    style={styles.responseTextarea}
                    rows={3}
                  />
                  <div style={styles.respondActions}>
                    <button
                      onClick={() => handleRespond(review._id)}
                      style={styles.respondSubmit}
                    >
                      Submit Response
                    </button>
                    <button
                      onClick={() => {
                        setRespondingTo(null);
                        setResponseText("");
                      }}
                      style={styles.respondCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={styles.actions}>
                {review.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleModerate(review._id, "approved")}
                      style={styles.approveButton}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerate(review._id, "rejected")}
                      style={styles.rejectButton}
                    >
                      Reject
                    </button>
                  </>
                )}

                {review.status === "approved" && (
                  <button
                    onClick={() => handleToggleFeatured(review._id)}
                    style={styles.featureButton}
                  >
                    {review.featured ? "Unfeature" : "Feature"}
                  </button>
                )}

                {!review.response && (
                  <button
                    onClick={() => setRespondingTo(review._id)}
                    style={styles.respondButton}
                  >
                    Respond
                  </button>
                )}

                <button
                  onClick={() => handleDelete(review._id)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
  },
  loading: {
    textAlign: "center" as const,
    padding: "4rem",
    fontSize: "1.25rem",
    color: "#666",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#0047AB",
    margin: 0,
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#666",
    marginTop: "0.5rem",
  },
  error: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "2rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center" as const,
  },
  statValue: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#0047AB",
  },
  statLabel: {
    fontSize: "1rem",
    color: "#666",
    marginTop: "0.5rem",
  },
  filters: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap" as const,
  },
  select: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    minWidth: "150px",
  },
  searchInput: {
    flex: 1,
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    minWidth: "250px",
  },
  reviewsList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "4rem",
    fontSize: "1.25rem",
    color: "#666",
  },
  reviewCard: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "1rem",
  },
  customerName: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#333",
  },
  customerEmail: {
    fontSize: "0.9rem",
    color: "#666",
  },
  reviewDate: {
    fontSize: "0.85rem",
    color: "#999",
    marginTop: "0.25rem",
  },
  headerRight: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end",
    gap: "0.5rem",
  },
  ratingStars: {
    fontSize: "1.5rem",
    color: "#FFD700",
  },
  statusBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  statusPending: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  statusApproved: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  statusRejected: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  featuredBadge: {
    backgroundColor: "#FFD700",
    color: "#0047AB",
    padding: "0.25rem 0.75rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  reviewTitle: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#0047AB",
    marginBottom: "0.75rem",
  },
  reviewComment: {
    fontSize: "1rem",
    lineHeight: "1.6",
    color: "#333",
    marginBottom: "1rem",
  },
  serviceType: {
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "1rem",
  },
  response: {
    backgroundColor: "#e3f2fd",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    fontSize: "0.95rem",
  },
  respondForm: {
    backgroundColor: "#f8f9fa",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
  },
  responseTextarea: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
    marginBottom: "0.5rem",
    boxSizing: "border-box" as const,
  },
  respondActions: {
    display: "flex",
    gap: "0.5rem",
  },
  respondSubmit: {
    backgroundColor: "#0047AB",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  respondCancel: {
    backgroundColor: "#6c757d",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap" as const,
  },
  approveButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  rejectButton: {
    backgroundColor: "#dc3545",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  featureButton: {
    backgroundColor: "#FFD700",
    color: "#0047AB",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  respondButton: {
    backgroundColor: "#0047AB",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#6c757d",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default AdminReviews;
