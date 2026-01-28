import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../NotificationBell";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={styles.title}>Admin Panel</h2>
          {token && <NotificationBell token={token} />}
        </div>
      </div>

      <nav style={styles.nav}>
        <Link
          to="/admin/dashboard"
          style={{
            ...styles.link,
            ...(isActive("/admin/dashboard") ? styles.activeLink : {}),
          }}
        >
          <span style={styles.icon}>📊</span>
          Dashboard
        </Link>

        <Link
          to="/admin/leads"
          style={{
            ...styles.link,
            ...(isActive("/admin/leads") ? styles.activeLink : {}),
          }}
        >
          <span style={styles.icon}>📋</span>
          Leads
        </Link>

        <Link
          to="/admin/calendar"
          style={{
            ...styles.link,
            ...(isActive("/admin/calendar") ? styles.activeLink : {}),
          }}
        >
          <span style={styles.icon}>📅</span>
          Calendar
        </Link>

        <Link
          to="/admin/reviews"
          style={{
            ...styles.link,
            ...(isActive("/admin/reviews") ? styles.activeLink : {}),
          }}
        >
          <span style={styles.icon}>⭐</span>
          Reviews
        </Link>

        <Link
          to="/admin/gallery"
          style={{
            ...styles.link,
            ...(isActive("/admin/gallery") ? styles.activeLink : {}),
          }}
        >
          <span style={styles.icon}>🖼️</span>
          Gallery
        </Link>

        <Link
          to="/admin/settings"
          style={{
            ...styles.link,
            ...(isActive("/admin/settings") ? styles.activeLink : {}),
          }}
        >
          <span style={styles.icon}>⚙️</span>
          Settings
        </Link>
      </nav>

      <div style={styles.footer}>
        {user && (
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userEmail}>{user.email}</div>
          </div>
        )}
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
        <Link to="/" style={styles.backLink}>
          ← Back to Website
        </Link>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "250px",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
  },
  header: {
    padding: "2rem 1.5rem",
    borderBottom: "1px solid #333",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  nav: {
    flex: 1,
    padding: "1rem 0",
    display: "flex",
    flexDirection: "column" as const,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem 1.5rem",
    color: "#ccc",
    textDecoration: "none",
    transition: "all 0.3s",
    fontSize: "1rem",
  },
  activeLink: {
    backgroundColor: "#007bff",
    color: "#fff",
    borderLeft: "4px solid #fff",
  },
  icon: {
    fontSize: "1.25rem",
  },
  footer: {
    padding: "1.5rem",
    borderTop: "1px solid #333",
  },
  userInfo: {
    marginBottom: "1rem",
    padding: "0.75rem",
    backgroundColor: "#2a2a2a",
    borderRadius: "4px",
  },
  userName: {
    fontSize: "0.95rem",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: "0.25rem",
  },
  userEmail: {
    fontSize: "0.8rem",
    color: "#999",
  },
  logoutButton: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.95rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s",
    marginBottom: "1rem",
  },
  backLink: {
    display: "block",
    color: "#ccc",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "color 0.3s",
    textAlign: "center" as const,
  },
};

export default AdminSidebar;
