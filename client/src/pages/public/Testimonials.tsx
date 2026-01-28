import { useState, useEffect } from "react";
import PublicLayout from "../../components/Layout/PublicLayout";
import { getPublicReviews, Review } from "../../api/reviews";

const Testimonials = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await getPublicReviews({ rating: 4, limit: 50 });
      setReviews(data);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <PublicLayout>
        <div style={styles.loading}>Loading testimonials...</div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Customer Testimonials</h1>
          <p style={styles.subtitle}>
            See what our customers are saying about Bellevue Collision Services
          </p>
          {reviews.length > 0 && (
            <div style={styles.statsCard}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{averageRating}</div>
                <div style={styles.statLabel}>Average Rating</div>
                <div style={styles.stars}>{renderStars(Math.round(parseFloat(averageRating)))}</div>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{reviews.length}</div>
                <div style={styles.statLabel}>Total Reviews</div>
              </div>
            </div>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {reviews.length === 0 && !loading && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💬</div>
            <h2>No reviews yet</h2>
            <p>Be the first to leave a review!</p>
          </div>
        )}

        <div style={styles.reviewsGrid}>
          {reviews.map((review) => (
            <div
              key={review._id}
              style={{
                ...styles.reviewCard,
                ...(review.featured ? styles.featuredCard : {}),
              }}
            >
              {review.featured && (
                <div style={styles.featuredBadge}>⭐ Featured</div>
              )}

              <div style={styles.reviewHeader}>
                <div>
                  <div style={styles.customerName}>{review.customerId.name}</div>
                  <div style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div style={styles.ratingStars}>{renderStars(review.rating)}</div>
              </div>

              {review.title && <h3 style={styles.reviewTitle}>{review.title}</h3>}

              <p style={styles.reviewComment}>{review.comment}</p>

              {review.serviceType && (
                <div style={styles.serviceType}>
                  <span style={styles.serviceLabel}>Service:</span> {review.serviceType}
                </div>
              )}

              {review.response && (
                <div style={styles.response}>
                  <div style={styles.responseHeader}>Response from Bellevue Collision Services:</div>
                  <p style={styles.responseText}>{review.response.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
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
    textAlign: "center" as const,
    marginBottom: "3rem",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "#0047AB",
    marginBottom: "1rem",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#666",
    marginBottom: "2rem",
  },
  statsCard: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    backgroundColor: "#f8f9fa",
    padding: "2rem",
    borderRadius: "8px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  statItem: {
    textAlign: "center" as const,
  },
  statValue: {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "#0047AB",
  },
  statLabel: {
    fontSize: "1rem",
    color: "#666",
    marginTop: "0.5rem",
  },
  stars: {
    fontSize: "1.5rem",
    color: "#FFD700",
    marginTop: "0.5rem",
  },
  statDivider: {
    width: "2px",
    height: "80px",
    backgroundColor: "#ddd",
  },
  error: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "2rem",
    textAlign: "center" as const,
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "4rem 2rem",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  reviewsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "2rem",
  },
  reviewCard: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    position: "relative" as const,
  },
  featuredCard: {
    border: "2px solid #FFD700",
    boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
  },
  featuredBadge: {
    position: "absolute" as const,
    top: "-10px",
    right: "20px",
    backgroundColor: "#FFD700",
    color: "#0047AB",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "bold",
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
  reviewDate: {
    fontSize: "0.9rem",
    color: "#666",
    marginTop: "0.25rem",
  },
  ratingStars: {
    fontSize: "1.5rem",
    color: "#FFD700",
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
    padding: "0.5rem 0",
    borderTop: "1px solid #e0e0e0",
  },
  serviceLabel: {
    fontWeight: "bold",
  },
  response: {
    backgroundColor: "#e3f2fd",
    padding: "1rem",
    borderRadius: "4px",
    marginTop: "1rem",
    borderLeft: "4px solid #0047AB",
  },
  responseHeader: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#0047AB",
    marginBottom: "0.5rem",
  },
  responseText: {
    fontSize: "0.95rem",
    color: "#333",
    margin: 0,
  },
};

export default Testimonials;
