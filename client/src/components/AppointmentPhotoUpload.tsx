import { useRef } from "react";
import { uploadAppointmentPhotos, deleteAppointmentPhoto } from "../api/appointments";
import useModal from "../hooks/useModal";

interface AppointmentPhotoUploadProps {
  appointmentId: string;
  photos?: string[];
  token: string;
  onPhotosUpdate: (photos: string[]) => void;
  readOnly?: boolean;
}

const AppointmentPhotoUpload: React.FC<AppointmentPhotoUploadProps> = ({
  appointmentId,
  photos = [],
  token: _token,
  onPhotosUpdate,
  readOnly = false,
}) => {
  const modal = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const result = await modal.handleSubmit(
      async () => {
        const fileArray = Array.from(files);

        // Validate file types and sizes
        for (const file of fileArray) {
          if (!file.type.startsWith("image/")) {
            throw new Error(`${file.name} is not an image file`);
          }
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`${file.name} exceeds 10MB limit`);
          }
        }

        const uploadResult = await uploadAppointmentPhotos(appointmentId, fileArray);
        return uploadResult;
      },
      {
        onSuccess: () => {
          // Clear file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }
    );

    if (result) {
      onPhotosUpdate(result.appointment.photos || []);
    }
  };

  const handleDeletePhoto = async (index: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    const result = await modal.handleSubmit(
      async () => {
        const deleteResult = await deleteAppointmentPhoto(appointmentId, index);
        return deleteResult;
      }
    );

    if (result) {
      onPhotosUpdate(result.appointment.photos || []);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Photos</h3>
        {!readOnly && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={modal.loading}
            style={styles.uploadButton}
          >
            {modal.loading ? "Uploading..." : "+ Add Photos"}
          </button>
        )}
      </div>

      {modal.error && <div style={styles.error}>{modal.error}</div>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {photos.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📷</div>
          <p style={styles.emptyText}>
            {readOnly ? "No photos uploaded yet" : "No photos yet. Click 'Add Photos' to upload."}
          </p>
        </div>
      ) : (
        <div style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <div key={index} style={styles.photoCard}>
              <img
                src={`${API_BASE}${photo}`}
                alt={`Appointment photo ${index + 1}`}
                style={styles.photo}
                onClick={() => window.open(`${API_BASE}${photo}`, "_blank")}
              />
              {!readOnly && (
                <button
                  onClick={() => handleDeletePhoto(index)}
                  style={styles.deleteButton}
                  title="Delete photo"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && photos.length > 0 && (
        <div style={styles.info}>
          <small style={styles.infoText}>
            {photos.length} photo{photos.length !== 1 ? "s" : ""} uploaded. Click a photo to view full size.
          </small>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginTop: "1.5rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  title: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "bold" as const,
    color: "#0047AB",
  },
  uploadButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#0047AB",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "bold" as const,
    cursor: "pointer",
  },
  error: {
    padding: "0.75rem",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    borderRadius: "4px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "2rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    border: "2px dashed #ddd",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "0.5rem",
  },
  emptyText: {
    margin: 0,
    color: "#666",
    fontSize: "0.95rem",
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "1rem",
  },
  photoCard: {
    position: "relative" as const,
    borderRadius: "4px",
    overflow: "hidden",
    border: "1px solid #ddd",
  },
  photo: {
    width: "100%",
    height: "150px",
    objectFit: "cover" as const,
    cursor: "pointer",
    display: "block",
  },
  deleteButton: {
    position: "absolute" as const,
    top: "0.25rem",
    right: "0.25rem",
    width: "28px",
    height: "28px",
    backgroundColor: "rgba(220, 53, 69, 0.9)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    fontSize: "1.5rem",
    fontWeight: "bold" as const,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: "1",
    padding: "0",
  },
  info: {
    marginTop: "0.75rem",
    textAlign: "center" as const,
  },
  infoText: {
    color: "#666",
    fontSize: "0.85rem",
  },
};

export default AppointmentPhotoUpload;
