import { useEffect, useState } from "react";
import { fetchLeads, updateLeadStatus, archiveLead, updateRepairTracking, addProgressNote, resendSignupEmail, Lead, LeadFilters } from "../../api/adminLeads";
import {
  getInvoicesByLead,
  createInvoice,
  sendInvoice,
  recordPayment,
  deleteInvoice,
  Invoice,
  ILineItem
} from "../../api/invoices";
import Modal from "../../components/Modal";
import AdminLayout from "../../components/Layout/AdminLayout";
import SearchAndFilter from "../../components/SearchAndFilter";

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 10,
    search: "",
    status: "all",
    repairStage: "all",
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("");
  const [showInvoices, setShowInvoices] = useState<{ [leadId: string]: boolean }>({});
  const [invoices, setInvoices] = useState<{ [leadId: string]: Invoice[] }>({});
  const [creatingInvoice, setCreatingInvoice] = useState<string | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    lineItems: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
    taxRate: 0,
    dueDate: "",
    notes: "",
    internalNotes: ""
  });

  useEffect(() => {
    loadLeads();
  }, [page, filters]);

  const loadLeads = () => {
    setLoading(true);

    fetchLeads({ ...filters, page })
      .then((res) => {
        setLeads(res.data);
        setPages(res.pagination.pages);
        setTotal(res.pagination.total);
      })
      .catch(() => {
        alert("Failed to load leads");
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page on new search
  };

  function handleStatusChange(id: string, newStatus: "new" | "contacted" | "closed") {
    updateLeadStatus(id, newStatus)
      .then(() => {
        setLeads((prev) =>
          prev.map((lead) =>
            lead._id === id ? { ...lead, status: newStatus } : lead
          )
        );
      })
      .catch(() => {
        alert("Failed to update status");
      });
  }

  function handleArchive(id: string) {
    const confirmed = window.confirm("Are you sure you want to archive this lead?");
    if (!confirmed) return;

    archiveLead(id)
      .then(() => {
        setLeads((prev) => prev.filter((lead) => lead._id !== id));
      })
      .catch(() => {
        alert("Failed to archive lead");
      });
  }

  function handleTrackingUpdate(id: string, field: string, value: any) {
    const updateData: any = {};

    if (field.startsWith('vehicleInfo.')) {
      const lead = leads.find(l => l._id === id);
      updateData.vehicleInfo = { ...lead?.vehicleInfo, [field.split('.')[1]]: value };
    } else {
      updateData[field] = value;
    }

    updateRepairTracking(id, updateData)
      .then((updatedLead) => {
        setLeads((prev) =>
          prev.map((lead) =>
            lead._id === id ? updatedLead : lead
          )
        );
      })
      .catch(() => {
        alert("Failed to update tracking");
      });
  }

  function handleAddNote(id: string) {
    if (!newNote.trim() || !noteAuthor.trim()) {
      alert("Please enter both note and author name");
      return;
    }

    addProgressNote(id, newNote, noteAuthor)
      .then((updatedLead) => {
        setLeads((prev) =>
          prev.map((lead) =>
            lead._id === id ? updatedLead : lead
          )
        );
        setNewNote("");
      })
      .catch(() => {
        alert("Failed to add note");
      });
  }

  function handleResendSignup(id: string, email: string) {
    const confirmed = window.confirm(`Resend signup invitation email to ${email}?`);
    if (!confirmed) return;

    resendSignupEmail(id)
      .then(() => {
        alert("Signup email resent successfully!");
      })
      .catch((err) => {
        alert(err.message || "Failed to resend signup email");
      });
  }

  async function loadInvoices(leadId: string) {
    try {
      const leadInvoices = await getInvoicesByLead(leadId);
      setInvoices(prev => ({ ...prev, [leadId]: leadInvoices }));
    } catch (err) {
      alert("Failed to load invoices");
    }
  }

  function toggleInvoices(leadId: string) {
    const isShowing = showInvoices[leadId];
    setShowInvoices(prev => ({ ...prev, [leadId]: !isShowing }));

    if (!isShowing && !invoices[leadId]) {
      loadInvoices(leadId);
    }
  }

  function handleLineItemChange(index: number, field: keyof ILineItem, value: string | number) {
    const newLineItems = [...invoiceForm.lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };

    // Recalculate total for this line item
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? Number(value) : newLineItems[index].quantity;
      const price = field === 'unitPrice' ? Number(value) : newLineItems[index].unitPrice;
      newLineItems[index].total = qty * price;
    }

    setInvoiceForm(prev => ({ ...prev, lineItems: newLineItems }));
  }

  function addLineItem() {
    setInvoiceForm(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: "", quantity: 1, unitPrice: 0, total: 0 }]
    }));
  }

  function removeLineItem(index: number) {
    setInvoiceForm(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  }

  async function handleCreateInvoice(leadId: string) {
    if (invoiceForm.lineItems.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
      alert("Please fill in all line item fields with valid values");
      return;
    }

    if (!invoiceForm.dueDate) {
      alert("Please select a due date");
      return;
    }

    try {
      await createInvoice({
        leadId,
        lineItems: invoiceForm.lineItems,
        taxRate: invoiceForm.taxRate,
        dueDate: invoiceForm.dueDate,
        notes: invoiceForm.notes || undefined,
        internalNotes: invoiceForm.internalNotes || undefined
      });

      alert("Invoice created successfully!");
      setCreatingInvoice(null);
      setInvoiceForm({
        lineItems: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
        taxRate: 0,
        dueDate: "",
        notes: "",
        internalNotes: ""
      });
      loadInvoices(leadId);
    } catch (err: any) {
      alert(err.message || "Failed to create invoice");
    }
  }

  async function handleSendInvoice(invoiceId: string, leadId: string) {
    const confirmed = window.confirm("Send this invoice to the customer?");
    if (!confirmed) return;

    try {
      await sendInvoice(invoiceId);
      alert("Invoice sent successfully!");
      loadInvoices(leadId);
    } catch (err: any) {
      alert(err.message || "Failed to send invoice");
    }
  }

  async function handleRecordPayment(invoiceId: string, leadId: string) {
    const amount = prompt("Enter payment amount:");
    if (!amount) return;

    const method = prompt("Payment method (cash/check/crypto):") as "cash" | "check" | "crypto";
    if (!method || !["cash", "check", "crypto"].includes(method)) {
      alert("Invalid payment method");
      return;
    }

    const transactionId = prompt("Transaction ID (optional):");
    const notes = prompt("Payment notes (optional):");

    try {
      await recordPayment(invoiceId, {
        amount: parseFloat(amount),
        method,
        transactionId: transactionId || undefined,
        notes: notes || undefined
      });
      alert("Payment recorded successfully!");
      loadInvoices(leadId);
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    }
  }

  async function handleDeleteInvoice(invoiceId: string, leadId: string) {
    const confirmed = window.confirm("Delete this draft invoice?");
    if (!confirmed) return;

    try {
      await deleteInvoice(invoiceId);
      alert("Invoice deleted successfully!");
      loadInvoices(leadId);
    } catch (err: any) {
      alert(err.message || "Failed to delete invoice");
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: "2rem" }}>Loading leads...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: "2rem" }}>Leads Management</h1>

      <SearchAndFilter
        onSearch={handleSearch}
        showFilters={{
          search: true,
          status: true,
          dateRange: true,
          sortBy: true,
          customFilters: [
            {
              name: "repairStage",
              label: "Repair Stage",
              options: [
                { value: "all", label: "All Stages" },
                { value: "pending", label: "Pending" },
                { value: "assessment", label: "Assessment" },
                { value: "parts_ordered", label: "Parts Ordered" },
                { value: "in_progress", label: "In Progress" },
                { value: "quality_check", label: "Quality Check" },
                { value: "completed", label: "Completed" },
              ],
            },
          ],
        }}
        statusOptions={[
          { value: "all", label: "All Status" },
          { value: "new", label: "New" },
          { value: "contacted", label: "Contacted" },
          { value: "closed", label: "Closed" },
        ]}
        sortByOptions={[
          { value: "createdAt", label: "Date Created" },
          { value: "name", label: "Name" },
          { value: "email", label: "Email" },
        ]}
        placeholder="Search by name, email, phone, or message..."
      />

      <div style={{ marginBottom: "1rem", color: "#666" }}>
        Showing {leads.length} of {total} leads
      </div>

      {leads.length === 0 && <p>No leads found.</p>}

      {leads.map((lead) => (
        <div
          key={lead._id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            backgroundColor: "#fff",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>{lead.name}</h3>
            <p style={{ margin: "0.25rem 0", color: "#666" }}>
              <strong>Email:</strong> {lead.email}
            </p>
            <p style={{ margin: "0.25rem 0", color: "#666" }}>
              <strong>Phone:</strong> {lead.phone}
            </p>
            <p style={{ margin: "0.25rem 0", color: "#666" }}>
              <strong>Date:</strong> {new Date(lead.createdAt).toLocaleString()}
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <p style={{ margin: "0.5rem 0" }}>
              <strong>Message:</strong>
            </p>
            <p style={{ margin: "0.5rem 0", color: "#333" }}>{lead.message}</p>
          </div>

          {lead.damageDescription && (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ margin: "0.5rem 0" }}>
                <strong>Damage Description:</strong>
              </p>
              <p style={{ margin: "0.5rem 0", color: "#333" }}>
                {lead.damageDescription}
              </p>
            </div>
          )}

          {lead.photos && lead.photos.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ margin: "0.5rem 0" }}>
                <strong>Photos:</strong>
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {lead.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Damage ${idx + 1}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      cursor: "pointer",
                      border: "1px solid #ddd",
                    }}
                    onClick={() => {
                      setSelectedPhotos(lead.photos);
                      setModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
            <div>
              <label style={{ marginRight: "0.5rem" }}>
                <strong>Status:</strong>
              </label>
              <select
                value={lead.status}
                onChange={(e) =>
                  handleStatusChange(
                    lead._id,
                    e.target.value as "new" | "contacted" | "closed"
                  )
                }
                style={{ padding: "0.25rem 0.5rem" }}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <button
              onClick={() => setExpandedLead(expandedLead === lead._id ? null : lead._id)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#0047AB",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {expandedLead === lead._id ? "Hide Tracking" : "Manage Tracking"}
            </button>

            <button
              onClick={() => toggleInvoices(lead._id)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {showInvoices[lead._id] ? "Hide Invoices" : "Manage Invoices"}
            </button>

            <button
              onClick={() => handleResendSignup(lead._id, lead.email)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#FFD700",
                color: "#0047AB",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Resend Signup Email
            </button>

            <button
              onClick={() => handleArchive(lead._id)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Archive
            </button>
          </div>

          {expandedLead === lead._id && (
            <div style={{
              borderTop: "2px solid #0047AB",
              paddingTop: "1.5rem",
              marginTop: "1rem"
            }}>
              <h4 style={{ marginBottom: "1rem", color: "#0047AB" }}>Repair Tracking</h4>

              {/* Vehicle Information */}
              <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <h5 style={{ marginBottom: "0.75rem" }}>Vehicle Information</h5>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Make:</label>
                    <input
                      type="text"
                      value={lead.vehicleInfo?.make || ""}
                      onChange={(e) => handleTrackingUpdate(lead._id, "vehicleInfo.make", e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Model:</label>
                    <input
                      type="text"
                      value={lead.vehicleInfo?.model || ""}
                      onChange={(e) => handleTrackingUpdate(lead._id, "vehicleInfo.model", e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Year:</label>
                    <input
                      type="number"
                      value={lead.vehicleInfo?.year || ""}
                      onChange={(e) => handleTrackingUpdate(lead._id, "vehicleInfo.year", parseInt(e.target.value))}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Color:</label>
                    <input
                      type="text"
                      value={lead.vehicleInfo?.color || ""}
                      onChange={(e) => handleTrackingUpdate(lead._id, "vehicleInfo.color", e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>VIN:</label>
                    <input
                      type="text"
                      value={lead.vehicleInfo?.vin || ""}
                      onChange={(e) => handleTrackingUpdate(lead._id, "vehicleInfo.vin", e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                  </div>
                </div>
              </div>

              {/* Repair Progress */}
              <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <h5 style={{ marginBottom: "0.75rem" }}>Repair Progress</h5>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Repair Stage:</label>
                    <select
                      value={lead.repairStage || "pending"}
                      onChange={(e) => handleTrackingUpdate(lead._id, "repairStage", e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                    >
                      <option value="pending">Pending Assessment</option>
                      <option value="assessment">Being Assessed</option>
                      <option value="parts_ordered">Parts Ordered</option>
                      <option value="in_progress">Repair In Progress</option>
                      <option value="quality_check">Quality Check</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Parts Status:</label>
                    <select
                      value={lead.partsStatus || "not_needed"}
                      onChange={(e) => handleTrackingUpdate(lead._id, "partsStatus", e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                    >
                      <option value="not_needed">Not Needed</option>
                      <option value="ordering">Ordering</option>
                      <option value="ordered">Ordered</option>
                      <option value="in_transit">In Transit</option>
                      <option value="received">Received</option>
                      <option value="installed">Installed</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Est. Completion:</label>
                    <input
                      type="date"
                      value={lead.estimatedCompletionDate ? lead.estimatedCompletionDate.split('T')[0] : ""}
                      onChange={(e) => handleTrackingUpdate(lead._id, "estimatedCompletionDate", e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                  </div>
                  {lead.actualCompletionDate && (
                    <div>
                      <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Actual Completion:</label>
                      <input
                        type="text"
                        value={new Date(lead.actualCompletionDate).toLocaleDateString()}
                        disabled
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd", backgroundColor: "#e9ecef" }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <h5 style={{ marginBottom: "0.75rem" }}>Financial Information</h5>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Estimate Amount:</label>
                    <input
                      type="number"
                      value={lead.estimateAmount || ""}
                      onChange={(e) => handleTrackingUpdate(lead._id, "estimateAmount", parseFloat(e.target.value))}
                      placeholder="$"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Final Amount:</label>
                    <input
                      type="number"
                      value={lead.finalAmount || ""}
                      onChange={(e) => handleTrackingUpdate(lead._id, "finalAmount", parseFloat(e.target.value))}
                      placeholder="$"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Insurance Claim #:</label>
                    <input
                      type="text"
                      value={lead.insuranceClaimNumber || ""}
                      onChange={(e) => handleTrackingUpdate(lead._id, "insuranceClaimNumber", e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress Notes */}
              <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <h5 style={{ marginBottom: "0.75rem" }}>Progress Notes</h5>

                {lead.progressNotes && lead.progressNotes.length > 0 && (
                  <div style={{ marginBottom: "1rem", maxHeight: "200px", overflowY: "auto" }}>
                    {lead.progressNotes.map((note, idx) => (
                      <div key={idx} style={{
                        padding: "0.75rem",
                        marginBottom: "0.5rem",
                        backgroundColor: "#fff",
                        borderLeft: "3px solid #0047AB",
                        borderRadius: "4px"
                      }}>
                        <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem" }}>{note.note}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#666" }}>
                          <strong>{note.createdBy}</strong> • {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Your Name:</label>
                  <input
                    type="text"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    placeholder="Enter your name"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd", marginBottom: "0.5rem" }}
                  />
                  <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Add Note:</label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter progress update..."
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd", minHeight: "80px", fontFamily: "inherit" }}
                  />
                  <button
                    onClick={() => handleAddNote(lead._id)}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem 1rem",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          )}

          {showInvoices[lead._id] && (
            <div style={{
              borderTop: "2px solid #28a745",
              paddingTop: "1.5rem",
              marginTop: "1rem"
            }}>
              <h4 style={{ marginBottom: "1rem", color: "#28a745" }}>Invoice Management</h4>

              {/* Existing Invoices */}
              {invoices[lead._id] && invoices[lead._id].length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h5 style={{ marginBottom: "0.75rem" }}>Existing Invoices</h5>
                  {invoices[lead._id].map((invoice) => (
                    <div key={invoice._id} style={{
                      padding: "1rem",
                      marginBottom: "0.75rem",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                      borderLeft: `4px solid ${
                        invoice.status === "paid" ? "#28a745" :
                        invoice.status === "partially_paid" ? "#ffc107" :
                        invoice.status === "overdue" ? "#dc3545" :
                        "#6c757d"
                      }`
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                        <div>
                          <strong>{invoice.invoiceNumber}</strong>
                          <span style={{
                            marginLeft: "0.5rem",
                            padding: "0.25rem 0.5rem",
                            backgroundColor:
                              invoice.status === "paid" ? "#28a745" :
                              invoice.status === "partially_paid" ? "#ffc107" :
                              invoice.status === "sent" || invoice.status === "viewed" ? "#007bff" :
                              invoice.status === "overdue" ? "#dc3545" :
                              "#6c757d",
                            color: "white",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "bold"
                          }}>
                            {invoice.status.toUpperCase().replace("_", " ")}
                          </span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#0047AB" }}>
                            ${invoice.total.toFixed(2)}
                          </div>
                          <div style={{ fontSize: "0.875rem", color: "#666" }}>
                            Due: ${invoice.amountDue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>
                        <div>Issued: {new Date(invoice.issueDate).toLocaleDateString()}</div>
                        <div>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                        {invoice.paidDate && <div>Paid: {new Date(invoice.paidDate).toLocaleDateString()}</div>}
                      </div>
                      <div style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        <strong>Items:</strong>
                        {invoice.lineItems.map((item, idx) => (
                          <div key={idx} style={{ marginLeft: "1rem", marginTop: "0.25rem" }}>
                            {item.description} - {item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}
                          </div>
                        ))}
                      </div>
                      {invoice.payments.length > 0 && (
                        <div style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                          <strong>Payments:</strong>
                          {invoice.payments.map((payment, idx) => (
                            <div key={idx} style={{ marginLeft: "1rem", marginTop: "0.25rem" }}>
                              ${payment.amount.toFixed(2)} via {payment.method} on {new Date(payment.paidAt).toLocaleDateString()}
                              {payment.transactionId && ` (${payment.transactionId})`}
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                        {invoice.status === "draft" && (
                          <>
                            <button
                              onClick={() => handleSendInvoice(invoice._id, lead._id)}
                              style={{
                                padding: "0.375rem 0.75rem",
                                backgroundColor: "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.875rem"
                              }}
                            >
                              Send to Customer
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(invoice._id, lead._id)}
                              style={{
                                padding: "0.375rem 0.75rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.875rem"
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {invoice.status !== "paid" && invoice.status !== "draft" && (
                          <button
                            onClick={() => handleRecordPayment(invoice._id, lead._id)}
                            style={{
                              padding: "0.375rem 0.75rem",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.875rem"
                            }}
                          >
                            Record Payment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create New Invoice */}
              {creatingInvoice === lead._id ? (
                <div style={{ padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                  <h5 style={{ marginBottom: "0.75rem" }}>Create New Invoice</h5>

                  {/* Line Items */}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                      Line Items:
                    </label>
                    {invoiceForm.lineItems.map((item, index) => (
                      <div key={index} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                          min="1"
                          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                        />
                        <input
                          type="number"
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) => handleLineItemChange(index, "unitPrice", e.target.value)}
                          min="0"
                          step="0.01"
                          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                        />
                        <input
                          type="text"
                          value={`$${item.total.toFixed(2)}`}
                          disabled
                          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd", backgroundColor: "#e9ecef" }}
                        />
                        {invoiceForm.lineItems.length > 1 && (
                          <button
                            onClick={() => removeLineItem(index)}
                            style={{
                              padding: "0.5rem",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addLineItem}
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.375rem 0.75rem",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.875rem"
                      }}
                    >
                      + Add Line Item
                    </button>
                  </div>

                  {/* Tax Rate and Due Date */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Tax Rate (%):</label>
                      <input
                        type="number"
                        value={invoiceForm.taxRate}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        max="100"
                        step="0.01"
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Due Date:</label>
                      <input
                        type="date"
                        value={invoiceForm.dueDate}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Customer Notes:</label>
                    <textarea
                      value={invoiceForm.notes}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Visible to customer..."
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd", minHeight: "60px", fontFamily: "inherit" }}
                    />
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>Internal Notes:</label>
                    <textarea
                      value={invoiceForm.internalNotes}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, internalNotes: e.target.value }))}
                      placeholder="Internal use only..."
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd", minHeight: "60px", fontFamily: "inherit" }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleCreateInvoice(lead._id)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Create Invoice
                    </button>
                    <button
                      onClick={() => {
                        setCreatingInvoice(null);
                        setInvoiceForm({
                          lineItems: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
                          taxRate: 0,
                          dueDate: "",
                          notes: "",
                          internalNotes: ""
                        });
                      }}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setCreatingInvoice(lead._id)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  + Create New Invoice
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: page <= 1 ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: page <= 1 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>

        <span>
          Page {page} of {pages}
        </span>

        <button
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: page >= pages ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: page >= pages ? "not-allowed" : "pointer",
          }}
        >
          Next
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {selectedPhotos.map((photo, idx) => (
            <img
              key={idx}
              src={photo}
              alt={`Full size ${idx + 1}`}
              style={{ maxWidth: "500px", maxHeight: "500px" }}
            />
          ))}
        </div>
      </Modal>
    </AdminLayout>
  );
}
