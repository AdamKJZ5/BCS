import { useState, FormEvent } from "react";
import { createReview, CreateReviewData } from "../api/reviews";

interface ReviewModalProps {
  onClose: () => void;
  onSuccess: () => void;
  leadId?: string;
  appointmentId?: string;
}

const ReviewModal = ({ onClose, onSuccess, leadId, appointmentId }: ReviewModalProps) => {
  const [formData, setFormData] = useState<CreateReviewData>({
    rating: 5,
    title: "",
    comment: "",
    serviceType: "",
    leadId,
    appointmentId,
    displayOnWebsite: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.comment.trim()) {
      setError("Please write a comment");
      return;
    }

    setSubmitting(true);

    try {
      await createReview(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Write a Review</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Rating</label>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => handleStarClick(star)}
                  style={{
                    ...styles.star,
                    color: star <= formData.rating ? "#FFD700" : "#ddd",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Title (optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={styles.input}
              placeholder="Great service!"
              maxLength={100}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Your Review</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              style={styles.textarea}
              placeholder="Tell us about your experience..."
              required
              maxLength={1000}
              rows={5}
            />
            <div style={styles.charCount}>{formData.comment.length}/1000</div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Service Type (optional)</label>
            <input
              type="text"
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              style={styles.input}
              placeholder="e.g., Collision Repair, Paint Work"
            />
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.displayOnWebsite}
                onChange={(e) => setFormData({ ...formData, displayOnWebsite: e.target.checked })}
                style={styles.checkbox}
              />
              Allow this review to be displayed on your website
            </label>
          </div>

          <div style={styles.actions}>
            <button type="submit" disabled={submitting} style={styles.submitButton}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem",
    borderBottom: "1px solid #e0e0e0",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#0047AB",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: "#666",
    padding: "0",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "1rem",
    margin: "1rem 1.5rem 0",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
  },
  form: {
    padding: "1.5rem",
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "bold",
    color: "#333",
  },
  stars: {
    display: "flex",
    gap: "0.25rem",
  },
  star: {
    fontSize: "2.5rem",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  },
  charCount: {
    fontSize: "0.85rem",
    color: "#666",
    marginTop: "0.25rem",
    textAlign: "right" as const,
  },
  checkboxGroup: {
    marginBottom: "1.5rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
  },
  submitButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    color: "#fff",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ReviewModal;
