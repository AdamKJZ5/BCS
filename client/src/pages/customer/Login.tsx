import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "../../components/Layout/PublicLayout";
import { login as loginApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginApi(formData);
      login(response.token, response.user);
      navigate("/customer/dashboard");
    } catch (err: any) {
      const errorMessage = err.message || "Login failed. Please try again.";

      // Provide helpful error messages
      if (errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("incorrect")) {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (errorMessage.toLowerCase().includes("not found")) {
        setError("No account found with this email. Please register first.");
      } else if (errorMessage.toLowerCase().includes("rate limit")) {
        setError("Too many login attempts. Please wait a few minutes and try again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div style={styles.container}>
        <div style={styles.formCard}>
          <div style={styles.iconContainer}>
            🔐
          </div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to access your repair dashboard</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.errorAlert}>
                <strong>⚠️ Error:</strong> {error}
              </div>
            )}

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                autoComplete="email"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.togglePassword}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <Link to="/customer/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.disabledButton : {}),
              }}
            >
              {loading ? (
                <>
                  <span style={styles.spinner}>⏳</span> Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or</span>
          </div>

          <div style={styles.registerBox}>
            <div style={styles.registerIcon}>✨</div>
            <div>
              <div style={styles.registerTitle}>New to Bellevue Collision?</div>
              <div style={styles.registerText}>
                Create an account to track your repairs, view service history, and more.
              </div>
            </div>
            <Link to="/customer/register" style={styles.registerButton}>
              Create Account
            </Link>
          </div>

          <div style={styles.helpBox}>
            <div style={styles.helpTitle}>💡 Having trouble logging in?</div>
            <div style={styles.helpText}>
              • Make sure you're using the correct email address<br />
              • Password is case-sensitive<br />
              • Try resetting your password if you've forgotten it
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

const styles = {
  container: {
    minHeight: "calc(100vh - 400px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    backgroundColor: "#f5f5f5",
  },
  formCard: {
    backgroundColor: "#fff",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    maxWidth: "480px",
    width: "100%",
  },
  iconContainer: {
    textAlign: "center" as const,
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center" as const,
    marginBottom: "0.5rem",
    color: "#0047AB",
  },
  subtitle: {
    textAlign: "center" as const,
    color: "#666",
    marginBottom: "2rem",
    fontSize: "0.95rem",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#333",
  },
  passwordContainer: {
    position: "relative" as const,
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "2px solid #ddd",
    borderRadius: "6px",
    fontFamily: "inherit",
    transition: "border-color 0.3s, box-shadow 0.3s",
    outline: "none",
  },
  togglePassword: {
    position: "absolute" as const,
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    padding: "5px",
  },
  submitButton: {
    backgroundColor: "#0047AB",
    color: "#fff",
    padding: "1rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.1s",
    marginTop: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  spinner: {
    display: "inline-block",
    animation: "spin 1s linear infinite",
  },
  errorAlert: {
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "6px",
    border: "1px solid #f5c6cb",
    fontSize: "0.95rem",
  },
  forgotLink: {
    color: "#0047AB",
    textDecoration: "none",
    fontSize: "0.9rem",
    textAlign: "right" as const,
    display: "block",
    marginTop: "0.25rem",
    fontWeight: "500",
  },
  divider: {
    position: "relative" as const,
    textAlign: "center" as const,
    margin: "2rem 0",
    borderTop: "1px solid #ddd",
  },
  dividerText: {
    position: "relative" as const,
    top: "-12px",
    backgroundColor: "#fff",
    padding: "0 1rem",
    color: "#999",
    fontSize: "0.9rem",
  },
  registerBox: {
    backgroundColor: "#f8f9fa",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    padding: "1.5rem",
    textAlign: "center" as const,
  },
  registerIcon: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },
  registerTitle: {
    fontWeight: "600",
    color: "#333",
    marginBottom: "0.5rem",
    fontSize: "1.05rem",
  },
  registerText: {
    color: "#666",
    fontSize: "0.9rem",
    marginBottom: "1rem",
    lineHeight: "1.5",
  },
  registerButton: {
    display: "inline-block",
    backgroundColor: "#0047AB",
    color: "#fff",
    padding: "0.75rem 2rem",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "600",
    transition: "background-color 0.3s",
  },
  helpBox: {
    marginTop: "1.5rem",
    backgroundColor: "#e7f3ff",
    border: "1px solid #b3d9ff",
    borderRadius: "6px",
    padding: "1rem",
  },
  helpTitle: {
    fontWeight: "600",
    color: "#004085",
    marginBottom: "0.5rem",
    fontSize: "0.95rem",
  },
  helpText: {
    color: "#004085",
    fontSize: "0.85rem",
    lineHeight: "1.6",
  },
};

export default Login;
