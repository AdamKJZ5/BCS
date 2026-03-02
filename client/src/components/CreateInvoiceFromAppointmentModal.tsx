import React, { useState } from "react";
import useModal from "../hooks/useModal";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CreateInvoiceFromAppointmentModalProps {
  appointment: any;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

const CreateInvoiceFromAppointmentModal: React.FC<CreateInvoiceFromAppointmentModalProps> = ({
  appointment,
  onClose,
  onSuccess,
  token,
}) => {
  const modal = useModal();
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(10.5); // Default WA sales tax
  const [dueInDays, setDueInDays] = useState(30);
  const [notes, setNotes] = useState("");

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async () => {
    // Validate
    if (lineItems.some((item) => !item.description || item.unitPrice <= 0)) {
      modal.setError("Please fill in all line items with valid amounts");
      return;
    }

    await modal.handleSubmit(
      async () => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

        const response = await fetch(
          `${API_BASE}/appointments/${appointment._id}/create-invoice`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              lineItems,
              taxRate,
              dueInDays,
              notes,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create invoice");
        }

        alert("Invoice created successfully!");
        return response.json();
      },
      { onSuccess }
    );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create Invoice from Appointment</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.appointmentInfo}>
            <h3 style={styles.subtitle}>Appointment Details</h3>
            <div style={styles.infoRow}>
              <strong>Customer:</strong>
              <span>{appointment.customerId?.name}</span>
            </div>
            <div style={styles.infoRow}>
              <strong>Type:</strong>
              <span>{appointment.appointmentType.replace(/_/g, " ")}</span>
            </div>
            <div style={styles.infoRow}>
              <strong>Date:</strong>
              <span>{new Date(appointment.startTime).toLocaleDateString()}</span>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.subtitle}>Line Items</h3>
            {lineItems.map((item, index) => (
              <div key={index} style={styles.lineItem}>
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, "description", e.target.value)}
                  style={{ ...styles.input, flex: 2 }}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    updateLineItem(index, "quantity", parseInt(e.target.value) || 0)
                  }
                  min="1"
                  style={{ ...styles.input, width: "80px" }}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateLineItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="0.01"
                  style={{ ...styles.input, width: "120px" }}
                />
                <div style={styles.itemTotal}>
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </div>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addLineItem} style={styles.addButton}>
              + Add Line Item
            </button>
          </div>

          <div style={styles.section}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tax Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Due In (days)</label>
              <input
                type="number"
                value={dueInDays}
                onChange={(e) => setDueInDays(parseInt(e.target.value) || 30)}
                min="1"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{ ...styles.input, resize: "vertical" as const }}
                placeholder="Any additional notes for the invoice..."
              />
            </div>
          </div>

          <div style={styles.totals}>
            <div style={styles.totalRow}>
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div style={styles.totalRow}>
              <span>Tax ({taxRate}%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div style={styles.totalRowFinal}>
              <strong>Total:</strong>
              <strong>${calculateTotal().toFixed(2)}</strong>
            </div>
          </div>

          {modal.error && <div style={styles.error}>{modal.error}</div>}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={modal.loading}
            style={{
              ...styles.confirmButton,
              ...(modal.loading && styles.disabledButton),
            }}
          >
            {modal.loading ? "Creating Invoice..." : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    maxWidth: "800px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem",
    borderBottom: "1px solid #e0e0e0",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#0047AB",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: "#666",
    lineHeight: 1,
  },
  body: {
    padding: "1.5rem",
  },
  appointmentInfo: {
    backgroundColor: "#f8f9fa",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
  },
  subtitle: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: "0.75rem",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
    borderBottom: "1px solid #ddd",
  },
  section: {
    marginBottom: "1.5rem",
  },
  lineItem: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "0.5rem",
    alignItems: "center",
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    fontFamily: "inherit",
  },
  itemTotal: {
    minWidth: "100px",
    textAlign: "right",
    fontWeight: "bold",
    color: "#0047AB",
  },
  removeButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "1.5rem",
    lineHeight: 1,
  },
  addButton: {
    padding: "0.75rem 1rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    marginTop: "0.5rem",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "bold",
    color: "#333",
  },
  totals: {
    backgroundColor: "#f8f9fa",
    padding: "1rem",
    borderRadius: "8px",
    marginTop: "1.5rem",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
    fontSize: "1rem",
  },
  totalRowFinal: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1rem 0 0",
    fontSize: "1.25rem",
    borderTop: "2px solid #0047AB",
    marginTop: "0.5rem",
    color: "#0047AB",
  },
  error: {
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
    marginTop: "1rem",
  },
  footer: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
  },
  cancelButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  confirmButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#0047AB",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
};

export default CreateInvoiceFromAppointmentModal;
