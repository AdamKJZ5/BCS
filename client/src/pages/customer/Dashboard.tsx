import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/Layout/PublicLayout";
import { getMyRepairs, Repair } from "../../api/customer";
import { getMyInvoices, markInvoiceViewed, Invoice } from "../../api/invoices";
import { getMyAppointments, cancelAppointment, Appointment, exportAppointmentToCalendar, exportMyAppointmentsToCalendar } from "../../api/appointments";
import { getMyVehicles, Vehicle } from "../../api/vehicles";
import { getMyServiceRecords, ServiceRecord } from "../../api/serviceRecords";
import { useAuth } from "../../context/AuthContext";
import PaymentModal from "../../components/PaymentModal";
import RescheduleModal from "../../components/RescheduleModal";
import AddVehicleModal from "../../components/AddVehicleModal";
import EditVehicleModal from "../../components/EditVehicleModal";
import AppointmentPhotoUpload from "../../components/AppointmentPhotoUpload";
import AppointmentsCalendar from "../../components/AppointmentsCalendar";

const Dashboard = () => {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"repairs" | "invoices" | "appointments" | "vehicles" | "service-history">("repairs");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState<string | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [appointmentsView, setAppointmentsView] = useState<'list' | 'calendar'>('list');
  const navigate = useNavigate();
  const { token, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/customer/login");
      return;
    }

    fetchData();
  }, [navigate, isAuthenticated, token]);

  const fetchData = async () => {
    try {
      const [repairsData, invoicesData, appointmentsData, vehiclesData, serviceRecordsData] = await Promise.all([
        getMyRepairs(),
        getMyInvoices(),
        getMyAppointments(),
        getMyVehicles(),
        getMyServiceRecords()
      ]);
      setRepairs(repairsData);
      setInvoices(invoicesData);
      setAppointments(appointmentsData);
      setVehicles(vehiclesData);
      setServiceRecords(serviceRecordsData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      if (err.message.includes("401") || err.message.includes("token")) {
        logout();
        navigate("/customer/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/customer/login");
  };

  const handleViewInvoice = async (invoice: Invoice) => {
    if (invoice.status === "sent") {
      try {
        await markInvoiceViewed(invoice._id);
        // Update local state
        setInvoices(prev =>
          prev.map(inv =>
            inv._id === invoice._id ? { ...inv, status: "viewed" } : inv
          )
        );
      } catch (err) {
        console.error("Failed to mark invoice as viewed:", err);
      }
    }
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    // Refresh invoices
    fetchData();
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const reason = prompt("Please provide a reason for cancellation:");
    if (!reason) return;

    setCancellingAppointment(appointmentId);
    try {
      await cancelAppointment(appointmentId, reason);
      // Refresh appointments
      await fetchData();
      alert("Appointment cancelled successfully");
    } catch (err: any) {
      alert(err.message || "Failed to cancel appointment");
    } finally {
      setCancellingAppointment(null);
    }
  };

  const handleExportAppointment = (appointmentId: string) => {
    try {
      exportAppointmentToCalendar(appointmentId, token!);
    } catch (err: any) {
      alert(err.message || "Failed to export appointment");
    }
  };

  const handleExportAllAppointments = () => {
    try {
      exportMyAppointmentsToCalendar(token!);
    } catch (err: any) {
      alert(err.message || "Failed to export appointments");
    }
  };

  const getRepairStageLabel = (stage?: string) => {
    const labels: Record<string, string> = {
      pending: "Pending Assessment",
      assessment: "Being Assessed",
      parts_ordered: "Parts Ordered",
      in_progress: "Repair In Progress",
      quality_check: "Quality Check",
      completed: "Completed",
    };
    return labels[stage || "pending"] || "Pending";
  };

  const getPartsStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      not_needed: "Not Needed",
      ordering: "Ordering",
      ordered: "Ordered",
      in_transit: "In Transit",
      received: "Received",
      installed: "Installed",
    };
    return labels[status || "not_needed"] || "Not Needed";
  };

  const getStageColor = (stage?: string) => {
    const colors: Record<string, string> = {
      pending: "#ffc107",
      assessment: "#17a2b8",
      parts_ordered: "#6c757d",
      in_progress: "#007bff",
      quality_check: "#28a745",
      completed: "#28a745",
    };
    return colors[stage || "pending"] || "#6c757d";
  };

  if (loading) {
    return (
      <PublicLayout>
        <div style={styles.container}>
          <div style={styles.loading}>Loading your repairs...</div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Customer Dashboard</h1>
            <p style={styles.subtitle}>Track your repairs and manage invoices</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab("repairs")}
            style={{
              ...styles.tab,
              ...(activeTab === "repairs" ? styles.tabActive : {}),
            }}
          >
            🚗 My Repairs ({repairs.length})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            style={{
              ...styles.tab,
              ...(activeTab === "invoices" ? styles.tabActive : {}),
            }}
          >
            💰 My Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            style={{
              ...styles.tab,
              ...(activeTab === "appointments" ? styles.tabActive : {}),
            }}
          >
            📅 My Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab("vehicles")}
            style={{
              ...styles.tab,
              ...(activeTab === "vehicles" ? styles.tabActive : {}),
            }}
          >
            🚙 My Vehicles ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab("service-history")}
            style={{
              ...styles.tab,
              ...(activeTab === "service-history" ? styles.tabActive : {}),
            }}
          >
            🔧 Service History ({serviceRecords.length})
          </button>
        </div>

        {activeTab === "repairs" && repairs.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🚗</div>
            <h2 style={styles.emptyTitle}>No Repairs Yet</h2>
            <p style={styles.emptyText}>
              You don't have any repairs tracked. Contact us to get started!
            </p>
          </div>
        )}

        {activeTab === "repairs" && repairs.length > 0 && (
          <div style={styles.repairsGrid}>
            {repairs.map((repair) => (
              <div key={repair._id} style={styles.repairCard}>
                <div
                  style={{
                    ...styles.stageIndicator,
                    backgroundColor: getStageColor(repair.repairStage),
                  }}
                >
                  {getRepairStageLabel(repair.repairStage)}
                </div>

                {repair.vehicleInfo?.make && (
                  <div style={styles.vehicleInfo}>
                    <h3 style={styles.vehicleName}>
                      {repair.vehicleInfo.year} {repair.vehicleInfo.make}{" "}
                      {repair.vehicleInfo.model}
                    </h3>
                    {repair.vehicleInfo.color && (
                      <span style={styles.vehicleDetail}>
                        Color: {repair.vehicleInfo.color}
                      </span>
                    )}
                  </div>
                )}

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Submitted</div>
                    <div style={styles.infoValue}>
                      {new Date(repair.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {repair.estimatedCompletionDate && (
                    <div style={styles.infoItem}>
                      <div style={styles.infoLabel}>Est. Completion</div>
                      <div style={styles.infoValue}>
                        {new Date(
                          repair.estimatedCompletionDate
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {repair.partsStatus && repair.partsStatus !== "not_needed" && (
                    <div style={styles.infoItem}>
                      <div style={styles.infoLabel}>Parts Status</div>
                      <div style={styles.infoValue}>
                        {getPartsStatusLabel(repair.partsStatus)}
                      </div>
                    </div>
                  )}

                  {repair.estimateAmount && (
                    <div style={styles.infoItem}>
                      <div style={styles.infoLabel}>Estimate</div>
                      <div style={styles.infoValue}>
                        ${repair.estimateAmount.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {repair.insuranceClaimNumber && (
                    <div style={styles.infoItem}>
                      <div style={styles.infoLabel}>Claim #</div>
                      <div style={styles.infoValue}>
                        {repair.insuranceClaimNumber}
                      </div>
                    </div>
                  )}
                </div>

                {repair.damageDescription && (
                  <div style={styles.description}>
                    <div style={styles.descriptionLabel}>Damage Description:</div>
                    <div style={styles.descriptionText}>
                      {repair.damageDescription}
                    </div>
                  </div>
                )}

                {repair.progressNotes && repair.progressNotes.length > 0 && (
                  <div style={styles.notesSection}>
                    <div style={styles.notesHeader}>Progress Updates:</div>
                    <div style={styles.notesList}>
                      {repair.progressNotes.map((note, idx) => (
                        <div key={idx} style={styles.note}>
                          <div style={styles.noteText}>{note.note}</div>
                          <div style={styles.noteFooter}>
                            <span style={styles.noteAuthor}>{note.createdBy}</span>
                            {" • "}
                            <span style={styles.noteDate}>
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {repair.photos && repair.photos.length > 0 && (
                  <div style={styles.photosSection}>
                    <div style={styles.photosLabel}>Photos:</div>
                    <div style={styles.photosGrid}>
                      {repair.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Damage ${idx + 1}`}
                          style={styles.photo}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "invoices" && invoices.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💰</div>
            <h2 style={styles.emptyTitle}>No Invoices Yet</h2>
            <p style={styles.emptyText}>
              You don't have any invoices. They will appear here once created.
            </p>
          </div>
        )}

        {activeTab === "invoices" && invoices.length > 0 && (
          <div style={styles.repairsGrid}>
            {invoices.map((invoice) => {
              const leadInfo = typeof invoice.leadId === 'object' ? invoice.leadId : null;
              return (
                <div
                  key={invoice._id}
                  style={styles.repairCard}
                  onClick={() => handleViewInvoice(invoice)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.5rem" }}>{invoice.invoiceNumber}</h3>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "0.5rem",
                          padding: "0.375rem 0.75rem",
                          backgroundColor:
                            invoice.status === "paid" ? "#28a745" :
                            invoice.status === "partially_paid" ? "#ffc107" :
                            invoice.status === "sent" || invoice.status === "viewed" ? "#007bff" :
                            invoice.status === "overdue" ? "#dc3545" :
                            "#6c757d",
                          color: "white",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          fontWeight: "bold",
                        }}
                      >
                        {invoice.status.toUpperCase().replace("_", " ")}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#0047AB" }}>
                        ${invoice.total.toFixed(2)}
                      </div>
                      {invoice.amountDue > 0 && (
                        <div style={{ fontSize: "1rem", color: "#dc3545", fontWeight: "bold" }}>
                          Due: ${invoice.amountDue.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {leadInfo && leadInfo.vehicleInfo && (
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                        {leadInfo.vehicleInfo.year} {leadInfo.vehicleInfo.make} {leadInfo.vehicleInfo.model}
                      </div>
                    </div>
                  )}

                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <div style={styles.infoLabel}>Issue Date</div>
                      <div style={styles.infoValue}>
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={styles.infoItem}>
                      <div style={styles.infoLabel}>Due Date</div>
                      <div style={styles.infoValue}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    {invoice.paidDate && (
                      <div style={styles.infoItem}>
                        <div style={styles.infoLabel}>Paid Date</div>
                        <div style={styles.infoValue}>
                          {new Date(invoice.paidDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    <div style={styles.infoItem}>
                      <div style={styles.infoLabel}>Amount Paid</div>
                      <div style={styles.infoValue}>
                        ${invoice.amountPaid.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                      Line Items:
                    </div>
                    {invoice.lineItems.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.5rem",
                          backgroundColor: idx % 2 === 0 ? "#f8f9fa" : "transparent",
                          fontSize: "0.95rem",
                        }}
                      >
                        <div>
                          {item.description} ({item.quantity} × ${item.unitPrice.toFixed(2)})
                        </div>
                        <div style={{ fontWeight: "bold" }}>${item.total.toFixed(2)}</div>
                      </div>
                    ))}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.5rem",
                        marginTop: "0.5rem",
                        borderTop: "2px solid #ddd",
                        fontWeight: "bold",
                      }}
                    >
                      <div>Subtotal:</div>
                      <div>${invoice.subtotal.toFixed(2)}</div>
                    </div>
                    {invoice.taxRate > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.5rem",
                        }}
                      >
                        <div>Tax ({invoice.taxRate}%):</div>
                        <div>${invoice.taxAmount.toFixed(2)}</div>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.5rem",
                        borderTop: "2px solid #0047AB",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        color: "#0047AB",
                      }}
                    >
                      <div>Total:</div>
                      <div>${invoice.total.toFixed(2)}</div>
                    </div>
                  </div>

                  {invoice.payments.length > 0 && (
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                        Payment History:
                      </div>
                      {invoice.payments.map((payment, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "0.5rem",
                            backgroundColor: "#d4edda",
                            borderRadius: "4px",
                            marginBottom: "0.25rem",
                            fontSize: "0.9rem",
                          }}
                        >
                          ${payment.amount.toFixed(2)} via {payment.method} on{" "}
                          {new Date(payment.paidAt).toLocaleDateString()}
                          {payment.transactionId && <div style={{ fontSize: "0.8rem", color: "#666" }}>Transaction: {payment.transactionId}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {invoice.notes && (
                    <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#e3f2fd", borderRadius: "4px" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                        Notes:
                      </div>
                      <div style={{ fontSize: "0.95rem" }}>{invoice.notes}</div>
                    </div>
                  )}

                  {invoice.status !== "paid" && invoice.amountDue > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayInvoice(invoice);
                      }}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      💳 Pay ${invoice.amountDue.toFixed(2)} Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && appointments.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📅</div>
            <h2 style={styles.emptyTitle}>No Appointments Yet</h2>
            <p style={styles.emptyText}>
              You don't have any scheduled appointments. Book one through our contact form!
            </p>
          </div>
        )}

        {activeTab === "appointments" && appointments.length > 0 && (
          <div style={styles.repairsGrid}>
            {/* View Toggle and Export Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setAppointmentsView('list')}
                  style={{
                    ...styles.viewToggleButton,
                    ...(appointmentsView === 'list' ? styles.viewToggleButtonActive : {}),
                  }}
                >
                  📋 List View
                </button>
                <button
                  onClick={() => setAppointmentsView('calendar')}
                  style={{
                    ...styles.viewToggleButton,
                    ...(appointmentsView === 'calendar' ? styles.viewToggleButtonActive : {}),
                  }}
                >
                  📅 Calendar View
                </button>
              </div>
              <button
                onClick={handleExportAllAppointments}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                📥 Export All to Calendar
              </button>
            </div>

            {/* Calendar View */}
            {appointmentsView === 'calendar' && (
              <AppointmentsCalendar
                appointments={appointments}
                onSelectAppointment={() => {
                  // Show appointment details - switch to list view
                  setAppointmentsView('list');
                }}
              />
            )}

            {/* List View */}
            {appointmentsView === 'list' && (
              <>
                {/* Upcoming Appointments */}
                {appointments.filter((apt) => ["scheduled", "confirmed", "in_progress"].includes(apt.status)).length > 0 && (
              <div>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#0047AB" }}>
                  Upcoming Appointments
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {appointments
                    .filter((apt) => ["scheduled", "confirmed", "in_progress"].includes(apt.status))
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map((apt) => (
                      <div key={apt._id} style={styles.repairCard}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                          <div>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "0.5rem 1rem",
                                borderRadius: "20px",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                backgroundColor:
                                  apt.status === "confirmed" ? "#28a745" :
                                  apt.status === "in_progress" ? "#ffc107" :
                                  "#007bff",
                              }}
                            >
                              {apt.status.toUpperCase().replace("_", " ")}
                            </span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#0047AB" }}>
                              {apt.appointmentType.replace(/_/g, " ").toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div style={styles.infoGrid}>
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>Date</div>
                            <div style={styles.infoValue}>
                              {new Date(apt.startTime).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>Time</div>
                            <div style={styles.infoValue}>
                              {new Date(apt.startTime).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </div>
                          </div>
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>Duration</div>
                            <div style={styles.infoValue}>{apt.duration} minutes</div>
                          </div>
                          {apt.assignedTo && (
                            <div style={styles.infoItem}>
                              <div style={styles.infoLabel}>Technician</div>
                              <div style={styles.infoValue}>{apt.assignedTo.name}</div>
                            </div>
                          )}
                        </div>

                        {apt.vehicleInfo && (
                          <div style={{ marginBottom: "1rem" }}>
                            <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                              {apt.vehicleInfo.year} {apt.vehicleInfo.make} {apt.vehicleInfo.model}
                            </div>
                          </div>
                        )}

                        {apt.description && (
                          <div style={styles.description}>
                            <div style={styles.descriptionLabel}>Details:</div>
                            <div style={styles.descriptionText}>{apt.description}</div>
                          </div>
                        )}

                        {apt.notes && (
                          <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#e3f2fd", borderRadius: "4px" }}>
                            <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                              Notes:
                            </div>
                            <div style={{ fontSize: "0.95rem" }}>{apt.notes}</div>
                          </div>
                        )}

                        <AppointmentPhotoUpload
                          appointmentId={apt._id}
                          photos={apt.photos}
                          token={token!}
                          onPhotosUpdate={(newPhotos) => {
                            setAppointments((prev) =>
                              prev.map((a) =>
                                a._id === apt._id ? { ...a, photos: newPhotos } : a
                              )
                            );
                          }}
                          readOnly={apt.status === "completed" || apt.status === "cancelled"}
                        />

                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleExportAppointment(apt._id)}
                            style={{
                              flex: "1 1 200px",
                              padding: "0.75rem",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "1rem",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                          >
                            📅 Add to Calendar
                          </button>
                          {apt.status === "scheduled" && (
                            <>
                              <button
                                onClick={() => setReschedulingAppointment(apt)}
                                style={{
                                  flex: "1 1 150px",
                                  padding: "0.75rem",
                                  backgroundColor: "#0047AB",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  fontSize: "1rem",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                }}
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(apt._id)}
                                disabled={cancellingAppointment === apt._id}
                                style={{
                                  flex: "1 1 150px",
                                  padding: "0.75rem",
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  fontSize: "1rem",
                                  fontWeight: "bold",
                                  cursor: cancellingAppointment === apt._id ? "not-allowed" : "pointer",
                                  opacity: cancellingAppointment === apt._id ? 0.6 : 1,
                                }}
                              >
                                {cancellingAppointment === apt._id ? "Cancelling..." : "Cancel"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {appointments.filter((apt) => ["completed", "cancelled", "no_show"].includes(apt.status)).length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#666" }}>
                  Past Appointments
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {appointments
                    .filter((apt) => ["completed", "cancelled", "no_show"].includes(apt.status))
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                    .map((apt) => (
                      <div key={apt._id} style={{ ...styles.repairCard, opacity: 0.8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                          <div>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "0.5rem 1rem",
                                borderRadius: "20px",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                backgroundColor:
                                  apt.status === "completed" ? "#6c757d" :
                                  apt.status === "cancelled" ? "#dc3545" :
                                  "#6c757d",
                              }}
                            >
                              {apt.status.toUpperCase().replace("_", " ")}
                            </span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#666" }}>
                              {apt.appointmentType.replace(/_/g, " ").toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div style={styles.infoGrid}>
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>Date</div>
                            <div style={styles.infoValue}>
                              {new Date(apt.startTime).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={styles.infoItem}>
                            <div style={styles.infoLabel}>Time</div>
                            <div style={styles.infoValue}>
                              {new Date(apt.startTime).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </div>
                          </div>
                        </div>

                        {apt.cancellationReason && (
                          <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f8d7da", borderRadius: "4px" }}>
                            <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: "0.25rem", color: "#721c24" }}>
                              Cancellation Reason:
                            </div>
                            <div style={{ fontSize: "0.95rem", color: "#721c24" }}>{apt.cancellationReason}</div>
                          </div>
                        )}

                        <AppointmentPhotoUpload
                          appointmentId={apt._id}
                          photos={apt.photos}
                          token={token!}
                          onPhotosUpdate={(newPhotos) => {
                            setAppointments((prev) =>
                              prev.map((a) =>
                                a._id === apt._id ? { ...a, photos: newPhotos } : a
                              )
                            );
                          }}
                          readOnly={true}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
              </>
            )}
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === "vehicles" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.75rem", color: "#0047AB", margin: 0 }}>My Vehicles</h2>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#0047AB",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                + Add Vehicle
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🚙</div>
                <h2 style={styles.emptyTitle}>No Vehicles Yet</h2>
                <p style={styles.emptyText}>
                  Add your vehicles to make booking appointments faster and easier.
                </p>
                <button
                  onClick={() => setShowAddVehicleModal(true)}
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#0047AB",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Add Your First Vehicle
                </button>
              </div>
            ) : (
              <div style={styles.vehicleGrid}>
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    style={styles.vehicleCard}
                    onClick={() => setEditingVehicle(vehicle)}
                  >
                    {vehicle.isPrimary && (
                      <div style={styles.primaryBadge}>⭐ Primary Vehicle</div>
                    )}
                    {vehicle.isSecondary && (
                      <div style={styles.secondaryBadge}>⭐ Secondary Vehicle</div>
                    )}

                    <div style={styles.vehicleHeader}>
                      <h3 style={styles.vehicleTitle}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      {vehicle.nickname && (
                        <div style={styles.vehicleNickname}>"{vehicle.nickname}"</div>
                      )}
                    </div>

                    <div style={styles.vehicleDetails}>
                      {vehicle.color && (
                        <div style={styles.vehicleDetailItem}>
                          <span style={styles.vehicleDetailLabel}>Color:</span>
                          <span style={styles.vehicleDetailValue}>{vehicle.color}</span>
                        </div>
                      )}
                      {vehicle.licensePlate && (
                        <div style={styles.vehicleDetailItem}>
                          <span style={styles.vehicleDetailLabel}>License Plate:</span>
                          <span style={styles.vehicleDetailValue}>{vehicle.licensePlate}</span>
                        </div>
                      )}
                      {vehicle.vin && (
                        <div style={styles.vehicleDetailItem}>
                          <span style={styles.vehicleDetailLabel}>VIN:</span>
                          <span style={styles.vehicleDetailValue}>{vehicle.vin}</span>
                        </div>
                      )}
                      {vehicle.mileage && (
                        <div style={styles.vehicleDetailItem}>
                          <span style={styles.vehicleDetailLabel}>Mileage:</span>
                          <span style={styles.vehicleDetailValue}>
                            {vehicle.mileage.toLocaleString()} miles
                          </span>
                        </div>
                      )}
                    </div>

                    {vehicle.notes && (
                      <div style={styles.vehicleNotes}>
                        <div style={styles.vehicleNotesLabel}>Notes:</div>
                        <div style={styles.vehicleNotesText}>{vehicle.notes}</div>
                      </div>
                    )}

                    <div style={styles.vehicleFooter}>
                      <div style={styles.vehicleDate}>
                        Added {new Date(vehicle.createdAt).toLocaleDateString()}
                      </div>
                      <div style={styles.editHint}>Click to edit</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "service-history" && (
          <div>
            <h2 style={{ fontSize: "1.75rem", color: "#0047AB", marginBottom: "2rem" }}>
              Service History
            </h2>

            {serviceRecords.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🔧</div>
                <h2 style={styles.emptyTitle}>No Service Records Yet</h2>
                <p style={styles.emptyText}>
                  Your vehicle service history will appear here once services are completed.
                </p>
              </div>
            ) : (
              <div style={styles.serviceRecordsGrid}>
                {serviceRecords.map((record) => {
                  const vehicle = typeof record.vehicleId === "object" ? record.vehicleId : null;
                  return (
                    <div key={record._id} style={styles.serviceCard}>
                      <div style={styles.serviceHeader}>
                        <div>
                          <h3 style={styles.serviceTitle}>
                            {record.serviceType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </h3>
                          {vehicle && (
                            <div style={styles.serviceVehicle}>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                              {vehicle.nickname && ` (${vehicle.nickname})`}
                            </div>
                          )}
                        </div>
                        <div style={styles.serviceDate}>
                          {new Date(record.serviceDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={styles.serviceDescription}>
                        {record.description}
                      </div>

                      <div style={styles.serviceDetails}>
                        {record.providedBy === "bellevue_collision" ? (
                          <div style={styles.serviceProvider}>
                            <span style={{ ...styles.serviceProviderBadge, backgroundColor: "#0047AB" }}>
                              Bellevue Collision
                            </span>
                          </div>
                        ) : (
                          <div style={styles.serviceProvider}>
                            <span style={{ ...styles.serviceProviderBadge, backgroundColor: "#6c757d" }}>
                              {record.providerName || "External Provider"}
                            </span>
                          </div>
                        )}

                        {record.mileageAtService && (
                          <div style={styles.serviceDetail}>
                            📊 {record.mileageAtService.toLocaleString()} miles
                          </div>
                        )}

                        {record.cost && (
                          <div style={styles.serviceCost}>
                            ${record.cost.toFixed(2)}
                          </div>
                        )}
                      </div>

                      {record.partsUsed && record.partsUsed.length > 0 && (
                        <div style={styles.serviceParts}>
                          <div style={styles.servicePartsLabel}>Parts Used:</div>
                          <div style={styles.servicePartsList}>
                            {record.partsUsed.map((part, idx) => (
                              <div key={idx} style={styles.servicePart}>
                                • {part.partName} (x{part.quantity})
                                {part.cost && ` - $${part.cost.toFixed(2)}`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.notes && (
                        <div style={styles.serviceNotes}>
                          <div style={styles.serviceNotesLabel}>Notes:</div>
                          <div style={styles.serviceNotesText}>{record.notes}</div>
                        </div>
                      )}

                      {record.recommendations && (
                        <div style={styles.serviceRecommendations}>
                          <div style={styles.serviceRecommendationsLabel}>Recommendations:</div>
                          <div style={styles.serviceRecommendationsText}>{record.recommendations}</div>
                        </div>
                      )}

                      {record.nextServiceDue && (
                        <div style={styles.serviceNextDue}>
                          Next service recommended: {new Date(record.nextServiceDue).toLocaleDateString()}
                        </div>
                      )}

                      {record.warrantyExpirationDate && (
                        <div style={styles.serviceWarranty}>
                          🛡️ Warranty until: {new Date(record.warrantyExpirationDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {showPaymentModal && selectedInvoice && (
          <PaymentModal
            invoice={selectedInvoice}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedInvoice(null);
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {reschedulingAppointment && (
          <RescheduleModal
            appointment={reschedulingAppointment}
            onClose={() => setReschedulingAppointment(null)}
            onSuccess={fetchData}
            token={token!}
          />
        )}

        {showAddVehicleModal && (
          <AddVehicleModal
            onClose={() => setShowAddVehicleModal(false)}
            onSuccess={(newVehicle) => {
              setVehicles((prev) => [...prev, newVehicle]);
              setShowAddVehicleModal(false);
            }}
            token={token!}
          />
        )}

        {editingVehicle && (
          <EditVehicleModal
            vehicle={editingVehicle}
            onClose={() => setEditingVehicle(null)}
            onUpdate={(updatedVehicle) => {
              setVehicles((prev) =>
                prev.map((v) => (v._id === updatedVehicle._id ? updatedVehicle : v))
              );
              // If the updated vehicle is now primary, unset primary/secondary for others
              if (updatedVehicle.isPrimary) {
                setVehicles((prev) =>
                  prev.map((v) =>
                    v._id === updatedVehicle._id ? v : { ...v, isPrimary: false }
                  )
                );
              }
              // If the updated vehicle is now secondary, unset secondary/primary for others
              if (updatedVehicle.isSecondary) {
                setVehicles((prev) =>
                  prev.map((v) =>
                    v._id === updatedVehicle._id ? v : { ...v, isSecondary: false }
                  )
                );
              }
              setEditingVehicle(null);
            }}
            onDelete={(vehicleId) => {
              setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
              setEditingVehicle(null);
            }}
            token={token!}
          />
        )}
      </div>
    </PublicLayout>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    minHeight: "calc(100vh - 400px)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    margin: 0,
    color: "#0047AB",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#666",
    margin: "0.5rem 0 0",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    color: "#fff",
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  },
  loading: {
    textAlign: "center" as const,
    padding: "4rem",
    fontSize: "1.25rem",
    color: "#666",
  },
  error: {
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
    marginBottom: "2rem",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "4rem 2rem",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.75rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  emptyText: {
    fontSize: "1.1rem",
    color: "#666",
  },
  repairsGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2rem",
  },
  repairCard: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
  },
  stageIndicator: {
    display: "inline-block",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
  },
  vehicleInfo: {
    marginBottom: "1.5rem",
  },
  vehicleName: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem 0",
  },
  vehicleDetail: {
    fontSize: "0.95rem",
    color: "#666",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  },
  infoLabel: {
    fontSize: "0.85rem",
    color: "#666",
    fontWeight: "bold",
    textTransform: "uppercase" as const,
  },
  infoValue: {
    fontSize: "1rem",
    color: "#333",
  },
  description: {
    marginBottom: "1.5rem",
  },
  descriptionLabel: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#666",
    marginBottom: "0.5rem",
  },
  descriptionText: {
    fontSize: "1rem",
    color: "#333",
    lineHeight: "1.6",
  },
  notesSection: {
    marginBottom: "1.5rem",
  },
  notesHeader: {
    fontSize: "1rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  notesList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },
  note: {
    padding: "1rem",
    backgroundColor: "#e3f2fd",
    borderRadius: "4px",
    borderLeft: "4px solid #0047AB",
  },
  noteText: {
    fontSize: "0.95rem",
    marginBottom: "0.5rem",
    color: "#333",
  },
  noteFooter: {
    fontSize: "0.8rem",
    color: "#666",
  },
  noteAuthor: {
    fontWeight: "bold",
  },
  noteDate: {},
  photosSection: {
    marginTop: "1.5rem",
  },
  photosLabel: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#666",
    marginBottom: "0.75rem",
  },
  photosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "1rem",
  },
  photo: {
    width: "100%",
    height: "150px",
    objectFit: "cover" as const,
    borderRadius: "4px",
    border: "1px solid #ddd",
    cursor: "pointer",
  },
  tabs: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    borderBottom: "2px solid #e0e0e0",
  },
  tab: {
    padding: "1rem 1.5rem",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#666",
    transition: "all 0.3s",
  },
  tabActive: {
    color: "#0047AB",
    borderBottomColor: "#0047AB",
  },
  vehicleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1.5rem",
  },
  vehicleCard: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    position: "relative" as const,
  },
  primaryBadge: {
    position: "absolute" as const,
    top: "1rem",
    right: "1rem",
    backgroundColor: "#ffc107",
    color: "#333",
    padding: "0.375rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  secondaryBadge: {
    position: "absolute" as const,
    top: "1rem",
    right: "1rem",
    backgroundColor: "#17a2b8",
    color: "#fff",
    padding: "0.375rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  viewToggleButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#fff",
    color: "#666",
    border: "2px solid #e0e0e0",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "all 0.3s",
  },
  viewToggleButtonActive: {
    backgroundColor: "#0047AB",
    color: "#fff",
    borderColor: "#0047AB",
  },
  vehicleHeader: {
    marginBottom: "1rem",
  },
  vehicleTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem 0",
    color: "#0047AB",
  },
  vehicleNickname: {
    fontSize: "1rem",
    color: "#666",
    fontStyle: "italic" as const,
  },
  vehicleDetails: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    marginBottom: "1rem",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  },
  vehicleDetailItem: {
    display: "flex",
    justifyContent: "space-between",
  },
  vehicleDetailLabel: {
    fontSize: "0.9rem",
    color: "#666",
    fontWeight: "bold",
  },
  vehicleDetailValue: {
    fontSize: "0.9rem",
    color: "#333",
  },
  vehicleNotes: {
    marginBottom: "1rem",
    padding: "1rem",
    backgroundColor: "#e3f2fd",
    borderRadius: "4px",
  },
  vehicleNotesLabel: {
    fontSize: "0.85rem",
    fontWeight: "bold",
    color: "#0047AB",
    marginBottom: "0.5rem",
  },
  vehicleNotesText: {
    fontSize: "0.9rem",
    color: "#333",
    lineHeight: "1.5",
  },
  vehicleFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "1rem",
    borderTop: "1px solid #e0e0e0",
  },
  vehicleDate: {
    fontSize: "0.85rem",
    color: "#666",
  },
  editHint: {
    fontSize: "0.85rem",
    color: "#0047AB",
    fontWeight: "bold",
  },
  serviceRecordsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1.5rem",
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  },
  serviceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #e0e0e0",
  },
  serviceTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 0.5rem 0",
  },
  serviceVehicle: {
    fontSize: "0.9rem",
    color: "#666",
    fontStyle: "italic" as const,
  },
  serviceDate: {
    fontSize: "0.9rem",
    color: "#0047AB",
    fontWeight: "bold",
    whiteSpace: "nowrap" as const,
  },
  serviceDescription: {
    fontSize: "1rem",
    color: "#333",
    lineHeight: "1.5",
    marginBottom: "1rem",
  },
  serviceDetails: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.75rem",
    alignItems: "center",
    marginBottom: "1rem",
  },
  serviceProvider: {
    flex: "1 1 auto",
  },
  serviceProviderBadge: {
    padding: "0.4rem 0.8rem",
    borderRadius: "4px",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  serviceDetail: {
    fontSize: "0.9rem",
    color: "#666",
  },
  serviceCost: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#28a745",
  },
  serviceParts: {
    marginBottom: "1rem",
    padding: "0.75rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  },
  servicePartsLabel: {
    fontSize: "0.85rem",
    fontWeight: "bold",
    color: "#0047AB",
    marginBottom: "0.5rem",
  },
  servicePartsList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  },
  servicePart: {
    fontSize: "0.9rem",
    color: "#333",
  },
  serviceNotes: {
    marginBottom: "1rem",
    padding: "0.75rem",
    backgroundColor: "#fff3cd",
    borderRadius: "4px",
    borderLeft: "4px solid #ffc107",
  },
  serviceNotesLabel: {
    fontSize: "0.85rem",
    fontWeight: "bold",
    color: "#856404",
    marginBottom: "0.5rem",
  },
  serviceNotesText: {
    fontSize: "0.9rem",
    color: "#333",
    lineHeight: "1.5",
  },
  serviceRecommendations: {
    marginBottom: "1rem",
    padding: "0.75rem",
    backgroundColor: "#d4edda",
    borderRadius: "4px",
    borderLeft: "4px solid #28a745",
  },
  serviceRecommendationsLabel: {
    fontSize: "0.85rem",
    fontWeight: "bold",
    color: "#155724",
    marginBottom: "0.5rem",
  },
  serviceRecommendationsText: {
    fontSize: "0.9rem",
    color: "#333",
    lineHeight: "1.5",
  },
  serviceNextDue: {
    marginTop: "0.75rem",
    padding: "0.5rem",
    backgroundColor: "#e3f2fd",
    borderRadius: "4px",
    fontSize: "0.9rem",
    color: "#0047AB",
    fontWeight: "bold",
    textAlign: "center" as const,
  },
  serviceWarranty: {
    marginTop: "0.75rem",
    padding: "0.5rem",
    backgroundColor: "#e8f5e9",
    borderRadius: "4px",
    fontSize: "0.9rem",
    color: "#2e7d32",
    fontWeight: "bold",
    textAlign: "center" as const,
  },
};

export default Dashboard;
