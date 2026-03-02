import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "../../components/Layout/PublicLayout";
import { register as registerApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Password validation
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    let score = 0;

    if (password.length < 8) {
      errors.push("At least 8 characters");
    } else {
      score += 20;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    } else {
      score += 20;
    }

    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    } else {
      score += 20;
    }

    if (!/[0-9]/.test(password)) {
      errors.push("One number");
    } else {
      score += 20;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("One special character (!@#$%^&*)");
    } else {
      score += 20;
    }

    // Check for common passwords
    const commonWords = ['password', 'admin', 'test', 'welcome', 'qwerty', '12345'];
    if (commonWords.some(word => password.toLowerCase().includes(word))) {
      errors.push("Avoid common words (password, admin, test, etc.)");
      score = Math.max(0, score - 40);
    }

    let label = "";
    let color = "";
    if (score === 0) {
      label = "";
      color = "";
    } else if (score < 40) {
      label = "Weak";
      color = "#dc3545";
    } else if (score < 60) {
      label = "Fair";
      color = "#ffc107";
    } else if (score < 80) {
      label = "Good";
      color = "#17a2b8";
    } else {
      label = "Strong";
      color = "#28a745";
    }

    return { errors, score, label, color };
  };

  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password);
      setValidationErrors(validation.errors);
      setPasswordStrength({ score: validation.score, label: validation.label, color: validation.color });
    } else {
      setValidationErrors([]);
      setPasswordStrength({ score: 0, label: "", color: "" });
    }
  }, [formData.password]);

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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (validationErrors.length > 0) {
      setError("Please fix the password requirements below");
      setLoading(false);
      return;
    }

    try {
      const response = await registerApi({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      login(response.token, response.user);
      navigate("/customer/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your password requirements.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div style={styles.container}>
        <div style={styles.formCard}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Track your vehicle repairs & service history</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.errorAlert}>
                <strong>⚠️ Error:</strong> {error}
              </div>
            )}

            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.label}>
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="phone" style={styles.label}>
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="(555) 123-4567"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Password *
              </label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a strong password"
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.togglePassword}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div style={styles.strengthContainer}>
                  <div style={styles.strengthBar}>
                    <div
                      style={{
                        ...styles.strengthFill,
                        width: `${passwordStrength.score}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                  {passwordStrength.label && (
                    <span style={{ ...styles.strengthLabel, color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  )}
                </div>
              )}

              {/* Password Requirements */}
              {validationErrors.length > 0 && (
                <div style={styles.requirements}>
                  <div style={styles.requirementsTitle}>Password must have:</div>
                  {validationErrors.map((err, idx) => (
                    <div key={idx} style={styles.requirementItem}>
                      ❌ {err}
                    </div>
                  ))}
                </div>
              )}

              {validationErrors.length === 0 && formData.password.length > 0 && (
                <div style={styles.successBox}>
                  ✅ Password meets all requirements!
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirm Password *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter your password"
                style={{
                  ...styles.input,
                  ...(formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? styles.inputError
                    : formData.confirmPassword && formData.password === formData.confirmPassword
                    ? styles.inputSuccess
                    : {}),
                }}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <span style={styles.errorText}>❌ Passwords do not match</span>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <span style={styles.successText}>✅ Passwords match</span>
              )}
            </div>

            <div style={styles.helpText}>
              💡 <strong>Tip:</strong> Use a unique password like: BlueSky#456, CarFix!2026
            </div>

            <button
              type="submit"
              disabled={loading || validationErrors.length > 0}
              style={{
                ...styles.submitButton,
                ...(loading || validationErrors.length > 0 ? styles.disabledButton : {}),
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div style={styles.footer}>
            Already have an account?{" "}
            <Link to="/customer/login" style={styles.link}>
              Login here
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
    padding: "2rem 1rem",
    backgroundColor: "#f5f5f5",
  },
  formCard: {
    backgroundColor: "#fff",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    maxWidth: "500px",
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
  inputError: {
    borderColor: "#dc3545",
  },
  inputSuccess: {
    borderColor: "#28a745",
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
  strengthContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "5px",
  },
  strengthBar: {
    flex: 1,
    height: "6px",
    backgroundColor: "#e0e0e0",
    borderRadius: "3px",
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    transition: "width 0.3s, background-color 0.3s",
  },
  strengthLabel: {
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  requirements: {
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "6px",
    padding: "0.75rem",
    marginTop: "0.5rem",
  },
  requirementsTitle: {
    fontWeight: "600",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
  },
  requirementItem: {
    fontSize: "0.85rem",
    marginBottom: "0.25rem",
    color: "#856404",
  },
  successBox: {
    backgroundColor: "#d4edda",
    border: "1px solid #28a745",
    borderRadius: "6px",
    padding: "0.75rem",
    marginTop: "0.5rem",
    color: "#155724",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  errorText: {
    fontSize: "0.85rem",
    color: "#dc3545",
    marginTop: "0.25rem",
  },
  successText: {
    fontSize: "0.85rem",
    color: "#28a745",
    marginTop: "0.25rem",
  },
  helpText: {
    backgroundColor: "#e7f3ff",
    border: "1px solid #b3d9ff",
    borderRadius: "6px",
    padding: "0.75rem",
    fontSize: "0.9rem",
    color: "#004085",
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
  },
  disabledButton: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  errorAlert: {
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "6px",
    border: "1px solid #f5c6cb",
    fontSize: "0.95rem",
  },
  footer: {
    textAlign: "center" as const,
    marginTop: "2rem",
    color: "#666",
    fontSize: "0.95rem",
  },
  link: {
    color: "#0047AB",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Register;
