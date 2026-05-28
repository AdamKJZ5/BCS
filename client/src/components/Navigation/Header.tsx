import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../NotificationBell";

const Header = () => {
  const { isAuthenticated, logout, token } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <img
            src="/assets/images/logo.png"
            alt="Bellevue Collision Services"
            style={styles.logoImage}
          />
        </Link>

        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/services" style={styles.navLink}>Services</Link>
          <Link to="/gallery" style={styles.navLink}>Gallery</Link>
          <Link to="/testimonials" style={styles.navLink}>Testimonials</Link>
          <Link to="/about" style={styles.navLink}>About</Link>
          <Link to="/contact" style={styles.contactButton}>Book Now / Get a Quote</Link>

          <div style={styles.divider}></div>

          {isAuthenticated ? (
            <>
              {token && <NotificationBell token={token} />}
              <Link to="/customer/dashboard" style={styles.dashboardLink}>
                My Dashboard
              </Link>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/customer/login" style={styles.loginLink}>Login</Link>
              <Link to="/customer/register" style={styles.registerLink}>Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: "#0047AB",
    padding: "1rem 0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    textDecoration: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
  },
  logoImage: {
    height: "80px",
    width: "auto",
    objectFit: "contain" as const,
  },
  nav: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
  },
  navLink: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "1.125rem",
    transition: "color 0.3s, transform 0.2s",
    display: "inline-block",
  },
  contactButton: {
    backgroundColor: "#FFD700",
    color: "#0047AB",
    textDecoration: "none",
    padding: "0.5rem 1.5rem",
    borderRadius: "4px",
    fontSize: "1.125rem",
    fontWeight: "bold",
    transition: "all 0.3s",
    display: "inline-block",
  },
  loginLink: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "1.125rem",
    transition: "color 0.3s",
    display: "inline-block",
  },
  registerLink: {
    backgroundColor: "transparent",
    color: "#FFD700",
    textDecoration: "none",
    padding: "0.5rem 1.5rem",
    borderRadius: "4px",
    fontSize: "1.125rem",
    fontWeight: "bold",
    border: "2px solid #FFD700",
    transition: "all 0.3s",
    display: "inline-block",
  },
  dashboardLink: {
    color: "#FFD700",
    textDecoration: "none",
    fontSize: "1.125rem",
    fontWeight: "bold",
    transition: "color 0.3s",
    display: "inline-block",
  },
  logoutButton: {
    backgroundColor: "transparent",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "1px solid #fff",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  divider: {
    width: "1px",
    height: "30px",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
};

export default Header;
