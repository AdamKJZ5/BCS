import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../Navigation/AdminSidebar";
import { useAuth } from "../../context/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate("/admin/login");
      } else if (user?.role !== "admin") {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div style={styles.wrapper}>
      <AdminSidebar />
      <main style={styles.main} className="page-transition-fast">
        {children}
      </main>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
  },
  main: {
    flex: 1,
    padding: "2rem",
    backgroundColor: "#f5f5f5",
    overflowY: "auto" as const,
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: "1.25rem",
    color: "#666",
  },
};

export default AdminLayout;
