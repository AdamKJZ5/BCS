import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../../components/Layout/PublicLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PublicLayout>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconContainer}>
              <div style={styles.successIcon}>✅</div>
            </div>
            <h1 style={styles.title}>Check Your Email</h1>
            <p style={styles.message}>
              If an account exists with <strong>{email}</strong>, you will receive a
              password reset link shortly.
            </p>
            <p style={styles.note}>
              The link will expire in 1 hour for security reasons.
            </p>
            <div style={styles.actions}>
              <Link to="/customer/login" style={styles.backButton}>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconContainer}>
            <div style={styles.lockIcon}>🔒</div>
          </div>
          <h1 style={styles.title}>Forgot Password?</h1>
          <p style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {}),
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div style={styles.footer}>
            <Link to="/customer/login" style={styles.link}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    padding: "3rem",
    maxWidth: "500px",
    width: "100%",
  },
  iconContainer: {
    textAlign: "center" as const,
    marginBottom: "1.5rem",
  },
  lockIcon: {
    fontSize: "4rem",
  },
  successIcon: {
    fontSize: "4rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center" as const,
    marginBottom: "1rem",
    color: "#0047AB",
  },
  subtitle: {
    textAlign: "center" as const,
    color: "#666",
    marginBottom: "2rem",
    lineHeight: "1.5",
  },
  message: {
    textAlign: "center" as const,
    color: "#333",
    marginBottom: "1rem",
    lineHeight: "1.6",
  },
  note: {
    textAlign: "center" as const,
    color: "#999",
    fontSize: "0.9rem",
    marginBottom: "2rem",
  },
  form: {
    width: "100%",
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1.5rem",
    border: "1px solid #fcc",
  },
  submitButton: {
    width: "100%",
    padding: "1rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#0047AB",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  footer: {
    marginTop: "2rem",
    textAlign: "center" as const,
  },
  link: {
    color: "#0047AB",
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  actions: {
    textAlign: "center" as const,
  },
  backButton: {
    display: "inline-block",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#0047AB",
    textDecoration: "none",
    borderRadius: "4px",
    transition: "background-color 0.3s",
  },
};

export default ForgotPassword;
