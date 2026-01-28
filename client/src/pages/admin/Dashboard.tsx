import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/Layout/AdminLayout";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

interface Stats {
  total: number;
  new: number;
  contacted: number;
  closed: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

interface AppointmentStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byStatus: {
    scheduled: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
}

interface InvoiceStats {
  total: number;
  byStatus: {
    draft: number;
    sent: number;
    viewed: number;
    paid: number;
    partially_paid: number;
    overdue: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    monthly: number;
    yearly: number;
    pending: number;
    overdue: number;
    averageInvoiceValue: number;
  };
  counts: {
    today: number;
    thisMonth: number;
    thisYear: number;
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    new: 0,
    contacted: 0,
    closed: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byStatus: {
      scheduled: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    },
  });
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats>({
    total: 0,
    byStatus: {
      draft: 0,
      sent: 0,
      viewed: 0,
      paid: 0,
      partially_paid: 0,
      overdue: 0,
      cancelled: 0,
    },
    revenue: {
      total: 0,
      monthly: 0,
      yearly: 0,
      pending: 0,
      overdue: 0,
      averageInvoiceValue: 0,
    },
    counts: {
      today: 0,
      thisMonth: 0,
      thisYear: 0,
    },
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/leads?page=1&limit=5`,
        { headers }
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setRecentLeads(data.data || []);

      // Calculate stats from leads
      const allLeadsResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/leads?page=1&limit=1000`,
        { headers }
      );

      if (allLeadsResponse.ok) {
        const allData = await allLeadsResponse.json();
        const leads = allData.data || [];

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const calculatedStats = {
          total: leads.length,
          new: leads.filter((l: Lead) => l.status === "new").length,
          contacted: leads.filter((l: Lead) => l.status === "contacted").length,
          closed: leads.filter((l: Lead) => l.status === "closed").length,
          today: leads.filter(
            (l: Lead) => new Date(l.createdAt) >= today
          ).length,
          thisWeek: leads.filter(
            (l: Lead) => new Date(l.createdAt) >= weekAgo
          ).length,
          thisMonth: leads.filter(
            (l: Lead) => new Date(l.createdAt) >= monthStart
          ).length,
        };

        setStats(calculatedStats);
      }

      // Fetch appointment stats
      const appointmentStatsResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/appointments/stats`,
        { headers }
      );

      if (appointmentStatsResponse.ok) {
        const apptStats = await appointmentStatsResponse.json();
        setAppointmentStats(apptStats);
      }

      // Fetch invoice stats
      const invoiceStatsResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/invoices/stats`,
        { headers }
      );

      if (invoiceStatsResponse.ok) {
        const invStats = await invoiceStatsResponse.json();
        setInvoiceStats(invStats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loading}>Loading dashboard...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Overview of your auto body business</p>
      </div>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.totalCard }}>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Total Leads</div>
        </div>

        <div style={{ ...styles.statCard, ...styles.newCard }}>
          <div style={styles.statNumber}>{stats.new}</div>
          <div style={styles.statLabel}>New Leads</div>
        </div>

        <div style={{ ...styles.statCard, ...styles.contactedCard }}>
          <div style={styles.statNumber}>{stats.contacted}</div>
          <div style={styles.statLabel}>Contacted</div>
        </div>

        <div style={{ ...styles.statCard, ...styles.closedCard }}>
          <div style={styles.statNumber}>{stats.closed}</div>
          <div style={styles.statLabel}>Closed</div>
        </div>
      </div>

      <div style={styles.timeStatsGrid}>
        <div style={styles.timeStatCard}>
          <div style={styles.timeStatNumber}>{stats.today}</div>
          <div style={styles.timeStatLabel}>Today</div>
        </div>

        <div style={styles.timeStatCard}>
          <div style={styles.timeStatNumber}>{stats.thisWeek}</div>
          <div style={styles.timeStatLabel}>This Week</div>
        </div>

        <div style={styles.timeStatCard}>
          <div style={styles.timeStatNumber}>{stats.thisMonth}</div>
          <div style={styles.timeStatLabel}>This Month</div>
        </div>
      </div>

      {/* Appointment Statistics */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>📅 Appointments</h2>
          <Link to="/admin/calendar" style={styles.viewAllLink}>
            View Calendar →
          </Link>
        </div>

        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #007bff" }}>
            <div style={styles.statNumber}>{appointmentStats.total}</div>
            <div style={styles.statLabel}>Total Appointments</div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: "4px solid #28a745" }}>
            <div style={styles.statNumber}>{appointmentStats.byStatus.confirmed}</div>
            <div style={styles.statLabel}>Confirmed</div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: "4px solid #ffc107" }}>
            <div style={styles.statNumber}>{appointmentStats.byStatus.in_progress}</div>
            <div style={styles.statLabel}>In Progress</div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: "4px solid #6c757d" }}>
            <div style={styles.statNumber}>{appointmentStats.byStatus.completed}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
        </div>

        <div style={{ ...styles.timeStatsGrid, marginTop: "1.5rem" }}>
          <div style={styles.timeStatCard}>
            <div style={styles.timeStatNumber}>{appointmentStats.today}</div>
            <div style={styles.timeStatLabel}>Today</div>
          </div>

          <div style={styles.timeStatCard}>
            <div style={styles.timeStatNumber}>{appointmentStats.thisWeek}</div>
            <div style={styles.timeStatLabel}>This Week</div>
          </div>

          <div style={styles.timeStatCard}>
            <div style={styles.timeStatNumber}>{appointmentStats.thisMonth}</div>
            <div style={styles.timeStatLabel}>This Month</div>
          </div>

          <div style={styles.timeStatCard}>
            <div style={styles.timeStatNumber}>{appointmentStats.byStatus.scheduled}</div>
            <div style={styles.timeStatLabel}>Scheduled</div>
          </div>
        </div>
      </div>

      {/* Revenue & Invoices Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>💰 Revenue & Invoices</h2>
        </div>

        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #28a745" }}>
            <div style={styles.statNumber}>${invoiceStats.revenue.total.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Revenue</div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: "4px solid #007bff" }}>
            <div style={styles.statNumber}>${invoiceStats.revenue.monthly.toLocaleString()}</div>
            <div style={styles.statLabel}>This Month</div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: "4px solid #ffc107" }}>
            <div style={styles.statNumber}>${invoiceStats.revenue.pending.toLocaleString()}</div>
            <div style={styles.statLabel}>Pending Payments</div>
          </div>

          <div style={{ ...styles.statCard, borderLeft: "4px solid #dc3545" }}>
            <div style={styles.statNumber}>${invoiceStats.revenue.overdue.toLocaleString()}</div>
            <div style={styles.statLabel}>Overdue</div>
          </div>
        </div>

        <div style={{ ...styles.timeStatsGrid, marginTop: "1.5rem" }}>
          <div style={styles.timeStatCard}>
            <div style={styles.timeStatNumber}>{invoiceStats.total}</div>
            <div style={styles.timeStatLabel}>Total Invoices</div>
          </div>

          <div style={styles.timeStatCard}>
            <div style={styles.timeStatNumber}>{invoiceStats.byStatus.paid}</div>
            <div style={styles.timeStatLabel}>Paid</div>
          </div>

          <div style={styles.timeStatCard}>
            <div style={styles.timeStatNumber}>{invoiceStats.byStatus.sent + invoiceStats.byStatus.viewed}</div>
            <div style={styles.timeStatLabel}>Awaiting Payment</div>
          </div>

          <div style={styles.timeStatCard}>
            <div style={styles.timeStatNumber}>${invoiceStats.revenue.averageInvoiceValue.toLocaleString()}</div>
            <div style={styles.timeStatLabel}>Avg Invoice Value</div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Leads</h2>
          <Link to="/admin/leads" style={styles.viewAllLink}>
            View All →
          </Link>
        </div>

        {recentLeads.length > 0 ? (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={styles.tableHeaderCell}>Name</div>
              <div style={styles.tableHeaderCell}>Email</div>
              <div style={styles.tableHeaderCell}>Phone</div>
              <div style={styles.tableHeaderCell}>Status</div>
              <div style={styles.tableHeaderCell}>Date</div>
            </div>
            {recentLeads.map((lead) => (
              <div key={lead._id} style={styles.tableRow}>
                <div style={styles.tableCell}>{lead.name}</div>
                <div style={styles.tableCell}>{lead.email}</div>
                <div style={styles.tableCell}>{lead.phone}</div>
                <div style={styles.tableCell}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(lead.status === "new"
                        ? styles.statusNew
                        : lead.status === "contacted"
                        ? styles.statusContacted
                        : styles.statusClosed),
                    }}
                  >
                    {lead.status}
                  </span>
                </div>
                <div style={styles.tableCell}>
                  {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>No leads yet</div>
        )}
      </div>

      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <Link to="/admin/leads" style={styles.actionCard} className="card-hover">
            <div style={styles.actionIcon}>📋</div>
            <div style={styles.actionTitle}>View All Leads</div>
            <div style={styles.actionDescription}>
              Manage and respond to customer inquiries
            </div>
          </Link>

          <Link to="/admin/calendar" style={styles.actionCard} className="card-hover">
            <div style={styles.actionIcon}>📅</div>
            <div style={styles.actionTitle}>Appointment Calendar</div>
            <div style={styles.actionDescription}>
              View and manage all appointments
            </div>
          </Link>

          <Link to="/admin/gallery" style={styles.actionCard} className="card-hover">
            <div style={styles.actionIcon}>🖼️</div>
            <div style={styles.actionTitle}>Manage Gallery</div>
            <div style={styles.actionDescription}>
              Upload before/after photos
            </div>
          </Link>

          <Link to="/admin/settings" style={styles.actionCard} className="card-hover">
            <div style={styles.actionIcon}>⚙️</div>
            <div style={styles.actionTitle}>Settings</div>
            <div style={styles.actionDescription}>
              Configure business information
            </div>
          </Link>

          <Link to="/" style={styles.actionCard} className="card-hover">
            <div style={styles.actionIcon}>🌐</div>
            <div style={styles.actionTitle}>View Website</div>
            <div style={styles.actionDescription}>
              See your public-facing site
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

const styles = {
  header: {
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#666",
    margin: 0,
  },
  loading: {
    textAlign: "center" as const,
    padding: "4rem",
    fontSize: "1.25rem",
    color: "#666",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  statCard: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center" as const,
  },
  totalCard: {
    borderLeft: "4px solid #007bff",
  },
  newCard: {
    borderLeft: "4px solid #28a745",
  },
  contactedCard: {
    borderLeft: "4px solid #ffc107",
  },
  closedCard: {
    borderLeft: "4px solid #6c757d",
  },
  statNumber: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  statLabel: {
    fontSize: "1rem",
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  },
  timeStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginBottom: "3rem",
  },
  timeStatCard: {
    backgroundColor: "#f8f9fa",
    padding: "1.5rem",
    borderRadius: "8px",
    textAlign: "center" as const,
  },
  timeStatNumber: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: "0.5rem",
  },
  timeStatLabel: {
    fontSize: "0.9rem",
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.75rem",
    fontWeight: "bold",
    margin: 0,
  },
  viewAllLink: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1.5fr 2fr 1.5fr 1fr 1fr",
    gap: "1rem",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  tableHeaderCell: {
    fontSize: "0.9rem",
    color: "#666",
    textTransform: "uppercase" as const,
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "1.5fr 2fr 1.5fr 1fr 1fr",
    gap: "1rem",
    padding: "1rem",
    borderBottom: "1px solid #eee",
    alignItems: "center",
  },
  tableCell: {
    fontSize: "0.95rem",
  },
  statusBadge: {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    textTransform: "capitalize" as const,
  },
  statusNew: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  statusContacted: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  statusClosed: {
    backgroundColor: "#e2e3e5",
    color: "#383d41",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "3rem",
    color: "#666",
    fontSize: "1.1rem",
  },
  quickActions: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    marginTop: "1.5rem",
  },
  actionCard: {
    backgroundColor: "#f8f9fa",
    padding: "1.5rem",
    borderRadius: "8px",
    textAlign: "center" as const,
    textDecoration: "none",
    color: "inherit",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  actionIcon: {
    fontSize: "2.5rem",
    marginBottom: "0.75rem",
  },
  actionTitle: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#333",
  },
  actionDescription: {
    fontSize: "0.9rem",
    color: "#666",
  },
};

export default Dashboard;
