import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import PublicLayout from "../../components/Layout/PublicLayout";
import { useAuth } from "../../context/AuthContext";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid password reset link");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      // Log the user in with the returned token
      login(data.token, data.user);

      // Redirect to dashboard
      navigate("/customer/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <PublicLayout>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconContainer}>
              <div style={styles.errorIcon}>❌</div>
            </div>
            <h1 style={styles.title}>Invalid Link</h1>
            <p style={styles.message}>
              This password reset link is invalid or has expired.
            </p>
            <div style={styles.actions}>
              <Link to="/customer/forgot-password" style={styles.button}>
                Request New Link
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
            <div style={styles.lockIcon}>🔑</div>
          </div>
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>Enter your new password below.</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
                style={styles.input}
                minLength={6}
              />
              <div style={styles.hint}>Minimum 6 characters</div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
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
              {loading ? "Resetting..." : "Reset Password"}
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
  errorIcon: {
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
  },
  message: {
    textAlign: "center" as const,
    color: "#666",
    marginBottom: "2rem",
    lineHeight: "1.6",
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
  hint: {
    fontSize: "0.85rem",
    color: "#999",
    marginTop: "0.25rem",
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
  button: {
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

export default ResetPassword;
