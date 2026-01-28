import { useState, useEffect } from "react";
import AdminLayout from "../../components/Layout/AdminLayout";
import {
  getGalleryPhotos,
  uploadGalleryPhoto,
  deleteGalleryPhoto,
  GalleryPhoto,
} from "../../api/gallery";

const GalleryManagement = () => {
  const [images, setImages] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newImage, setNewImage] = useState({
    title: "",
    description: "",
    category: "collision",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const photos = await getGalleryPhotos();
      setImages(photos);
    } catch (error) {
      console.error("Failed to load gallery:", error);
      alert("Failed to load gallery photos");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setNewImage({
      ...newImage,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a photo to upload");
      return;
    }

    setUploading(true);

    try {
      await uploadGalleryPhoto(
        newImage.title,
        newImage.description,
        newImage.category,
        selectedFile
      );

      setNewImage({ title: "", description: "", category: "collision" });
      setSelectedFile(null);
      setShowUploadForm(false);
      alert("Photo uploaded successfully!");
      loadGallery();
    } catch (error: any) {
      alert(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      await deleteGalleryPhoto(id);
      setImages(images.filter((img) => img._id !== id));
      alert("Photo deleted successfully!");
    } catch (error) {
      alert("Failed to delete photo");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loading}>Loading gallery...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.header}>
        <h1 style={styles.title}>Gallery Management</h1>
        <p style={styles.subtitle}>
          Manage before/after photos displayed on your website
        </p>
      </div>

      <div style={styles.actions}>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          style={styles.uploadButton}
        >
          {showUploadForm ? "Cancel" : "+ Upload New Photo"}
        </button>
      </div>

      {showUploadForm && (
        <div style={styles.uploadForm}>
          <h2 style={styles.formTitle}>Upload New Photo</h2>
          <form onSubmit={handleUpload}>
            <div style={styles.formGroup}>
              <label htmlFor="title" style={styles.label}>
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newImage.title}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="e.g., Front Bumper Repair"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="description" style={styles.label}>
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={newImage.description}
                onChange={handleInputChange}
                required
                rows={3}
                style={{ ...styles.input, resize: "vertical" as const }}
                placeholder="Describe the work done..."
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="category" style={styles.label}>
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={newImage.category}
                onChange={handleInputChange}
                style={styles.input}
              >
                <option value="collision">Collision Repair</option>
                <option value="painting">Painting</option>
                <option value="dent">Dent Repair</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="photo" style={styles.label}>
                Photo *
              </label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handleFileChange}
                required
                style={styles.fileInput}
              />
              {selectedFile && (
                <div style={styles.fileInfo}>{selectedFile.name}</div>
              )}
            </div>

            <button type="submit" disabled={uploading} style={styles.submitButton}>
              {uploading ? "Uploading..." : "Upload Photo"}
            </button>
          </form>
        </div>
      )}

      <div style={styles.galleryGrid}>
        {images.length > 0 ? (
          images.map((image) => (
            <div key={image._id} style={styles.imageCard}>
              <div style={styles.imageContainer}>
                <img
                  src={image.url}
                  alt={image.title}
                  style={styles.image}
                />
              </div>

              <div style={styles.imageInfo}>
                <h3 style={styles.imageTitle}>{image.title}</h3>
                <p style={styles.imageDescription}>{image.description}</p>
                <div style={styles.imageCategory}>
                  Category:{" "}
                  <span style={styles.categoryBadge}>{image.category}</span>
                </div>

                <div style={styles.imageActions}>
                  <button
                    onClick={() => handleDelete(image._id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🖼️</div>
            <h3 style={styles.emptyTitle}>No photos yet</h3>
            <p style={styles.emptyText}>
              Upload your first before/after photo to get started
            </p>
          </div>
        )}
      </div>

      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>Tips for Great Gallery Photos</h3>
        <ul style={styles.infoList}>
          <li>Use high-resolution images (at least 1200px wide)</li>
          <li>Include both "before" and "after" shots when possible</li>
          <li>Ensure good lighting and clear visibility of the work</li>
          <li>Add descriptive titles and details about the repair</li>
          <li>Categorize photos correctly for easy filtering</li>
        </ul>
      </div>
    </AdminLayout>
  );
};

const styles = {
  loading: {
    textAlign: "center" as const,
    padding: "4rem",
    fontSize: "1.25rem",
    color: "#666",
  },
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
  actions: {
    marginBottom: "2rem",
  },
  uploadButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  uploadForm: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  formTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  fileInput: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  fileInfo: {
    fontSize: "0.9rem",
    color: "#666",
    marginTop: "0.5rem",
  },
  submitButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "2rem",
    marginBottom: "2rem",
  },
  imageCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: "250px",
    overflow: "hidden",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
  },
  imageInfo: {
    padding: "1.5rem",
  },
  imageTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem",
  },
  imageDescription: {
    fontSize: "0.95rem",
    color: "#666",
    marginBottom: "1rem",
  },
  imageCategory: {
    fontSize: "0.9rem",
    color: "#555",
    marginBottom: "1rem",
  },
  categoryBadge: {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  imageActions: {
    display: "flex",
    gap: "0.5rem",
  },
  deleteButton: {
    width: "100%",
    backgroundColor: "#dc3545",
    color: "#fff",
    padding: "0.5rem 1rem",
    fontSize: "0.95rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  emptyState: {
    gridColumn: "1 / -1",
    textAlign: "center" as const,
    padding: "4rem 2rem",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem",
  },
  emptyText: {
    fontSize: "1rem",
    color: "#666",
  },
  infoBox: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  infoTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  infoList: {
    fontSize: "1rem",
    lineHeight: "1.8",
    color: "#555",
    paddingLeft: "1.5rem",
  },
};

export default GalleryManagement;
