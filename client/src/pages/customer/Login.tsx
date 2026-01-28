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
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div style={styles.container}>
        <div style={styles.formCard}>
          <h1 style={styles.title}>Customer Portal</h1>
          <p style={styles.subtitle}>Track your repair progress</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
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
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div style={styles.footer}>
            Don't have an account?{" "}
            <Link to="/customer/register" style={styles.link}>
              Register here
            </Link>
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
    padding: "2rem",
    backgroundColor: "#f5f5f5",
  },
  formCard: {
    backgroundColor: "#fff",
    padding: "3rem",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "450px",
    width: "100%",
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
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
  },
  submitButton: {
    backgroundColor: "#0047AB",
    color: "#fff",
    padding: "1rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    marginTop: "1rem",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  error: {
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
  },
  footer: {
    textAlign: "center" as const,
    marginTop: "2rem",
    color: "#666",
  },
  link: {
    color: "#0047AB",
    textDecoration: "none",
    fontWeight: "bold",
  },
  forgotLink: {
    color: "#0047AB",
    textDecoration: "none",
    fontSize: "0.9rem",
    textAlign: "right" as const,
    display: "block",
    marginTop: "0.5rem",
  },
};

export default Login;
