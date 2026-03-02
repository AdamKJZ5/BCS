import { useState } from "react";
import { updateVehicle, deleteVehicle, setPrimaryVehicle, setSecondaryVehicle, Vehicle } from "../api/vehicles";
import useModal from "../hooks/useModal";

interface EditVehicleModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onUpdate: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
  token: string;
}

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({ vehicle, onClose, onUpdate, onDelete, token: _token }) => {
  const modal = useModal();
  const [formData, setFormData] = useState({
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color || "",
    vin: vehicle.vin || "",
    licensePlate: vehicle.licensePlate || "",
    nickname: vehicle.nickname || "",
    mileage: vehicle.mileage?.toString() || "",
    notes: vehicle.notes || "",
  });
  const [deleting, setDeleting] = useState(false);
  const [settingPrimary, setSettingPrimary] = useState(false);
  const [settingSecondary, setSettingSecondary] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.make || !formData.model || !formData.year) {
      modal.setError("Make, model, and year are required");
      return;
    }

    const result = await modal.handleSubmit(
      async () => {
        const vehicleData: any = {
          make: formData.make,
          model: formData.model,
          year: Number(formData.year),
        };

        if (formData.color) vehicleData.color = formData.color;
        if (formData.vin) vehicleData.vin = formData.vin;
        if (formData.licensePlate) vehicleData.licensePlate = formData.licensePlate;
        if (formData.nickname) vehicleData.nickname = formData.nickname;
        if (formData.mileage) vehicleData.mileage = Number(formData.mileage);
        if (formData.notes) vehicleData.notes = formData.notes;

        const updatedVehicle = await updateVehicle(vehicle._id, vehicleData);
        return updatedVehicle;
      }
    );

    if (result) {
      onUpdate(result);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteVehicle(vehicle._id);
      onDelete(vehicle._id);
      onClose();
    } catch (err: any) {
      modal.setError(err.message || "Failed to delete vehicle");
    } finally {
      setDeleting(false);
    }
  };

  const handleSetPrimary = async () => {
    setSettingPrimary(true);
    modal.setError("");
    try {
      const updatedVehicle = await setPrimaryVehicle(vehicle._id);
      onUpdate(updatedVehicle);
      onClose();
    } catch (err: any) {
      modal.setError(err.message || "Failed to set as primary");
    } finally {
      setSettingPrimary(false);
    }
  };

  const handleSetSecondary = async () => {
    setSettingSecondary(true);
    modal.setError("");
    try {
      const updatedVehicle = await setSecondaryVehicle(vehicle._id);
      onUpdate(updatedVehicle);
      onClose();
    } catch (err: any) {
      modal.setError(err.message || "Failed to set as secondary");
    } finally {
      setSettingSecondary(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Edit Vehicle</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        {modal.error && <div style={styles.error}>{modal.error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Make <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder="e.g., Toyota"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Model <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., Camry"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Year <span style={styles.required}>*</span>
              </label>
              <select name="year" value={formData.year} onChange={handleChange} style={styles.input} required>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g., Silver"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>VIN</label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                placeholder="17-character VIN"
                maxLength={17}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>License Plate</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                placeholder="e.g., ABC1234"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nickname</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="e.g., My Red Car"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mileage</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="e.g., 50000"
                min="0"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information..."
              rows={3}
              style={{ ...styles.input, resize: "vertical" as const }}
            />
          </div>

          <div style={styles.footer}>
            <div style={styles.leftActions}>
              <button
                type="button"
                onClick={handleDelete}
                style={styles.deleteButton}
                disabled={modal.loading || deleting || settingPrimary || settingSecondary}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              {!vehicle.isPrimary && (
                <button
                  type="button"
                  onClick={handleSetPrimary}
                  style={styles.primaryButton}
                  disabled={modal.loading || deleting || settingPrimary || settingSecondary}
                >
                  {settingPrimary ? "Setting..." : "⭐ Set as Primary"}
                </button>
              )}
              {!vehicle.isSecondary && !vehicle.isPrimary && (
                <button
                  type="button"
                  onClick={handleSetSecondary}
                  style={styles.secondaryButton}
                  disabled={modal.loading || deleting || settingPrimary || settingSecondary}
                >
                  {settingSecondary ? "Setting..." : "⭐ Set as Secondary"}
                </button>
              )}
            </div>
            <div style={styles.rightActions}>
              <button
                type="button"
                onClick={onClose}
                style={styles.cancelButton}
                disabled={modal.loading || deleting || settingPrimary || settingSecondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={modal.loading || deleting || settingPrimary || settingSecondary}
              >
                {modal.loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "700px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
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
    fontSize: "1.75rem",
    color: "#0047AB",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: "#666",
    padding: "0",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    margin: "1rem 1.5rem",
    padding: "1rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    border: "1px solid #f5c6cb",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    padding: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    padding: "0 1.5rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#333",
  },
  required: {
    color: "#dc3545",
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "1rem",
    fontFamily: "inherit",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1.5rem",
    borderTop: "1px solid #e0e0e0",
  },
  leftActions: {
    display: "flex",
    gap: "1rem",
  },
  rightActions: {
    display: "flex",
    gap: "1rem",
  },
  deleteButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  primaryButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#ffc107",
    color: "#333",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  secondaryButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#17a2b8",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  cancelButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  submitButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#0047AB",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
};

export default EditVehicleModal;
