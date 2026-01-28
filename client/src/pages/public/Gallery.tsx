import { useState, useEffect } from "react";
import PublicLayout from "../../components/Layout/PublicLayout";
import Modal from "../../components/Modal";
import SEO from "../../components/SEO";
import { getGalleryPhotos, GalleryPhoto } from "../../api/gallery";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [images, setImages] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, [filter]);

  const loadGallery = async () => {
    try {
      const photos = await getGalleryPhotos(filter);
      setImages(photos);
    } catch (error) {
      console.error("Failed to load gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <SEO
        title="Our Work Gallery - Before & After Auto Body Repairs"
        description="View our portfolio of collision repairs, auto painting, and body work. See the quality of our craftsmanship at Bellevue Collision Services."
        keywords="auto body repair gallery, before after collision repair, car painting examples, Bellevue auto body work, collision repair portfolio"
        url="http://www.bellevuecollisionservices.com/gallery"
      />
      <div style={styles.pageHeader}>
        <div style={styles.container}>
          <h1 style={styles.pageTitle}>Our Work</h1>
          <p style={styles.pageSubtitle}>
            See the quality of our craftsmanship
          </p>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.filterSection}>
          <button
            onClick={() => setFilter("all")}
            style={{
              ...styles.filterButton,
              ...(filter === "all" ? styles.activeFilter : {}),
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter("collision")}
            style={{
              ...styles.filterButton,
              ...(filter === "collision" ? styles.activeFilter : {}),
            }}
          >
            Collision Repair
          </button>
          <button
            onClick={() => setFilter("painting")}
            style={{
              ...styles.filterButton,
              ...(filter === "painting" ? styles.activeFilter : {}),
            }}
          >
            Painting
          </button>
          <button
            onClick={() => setFilter("dent")}
            style={{
              ...styles.filterButton,
              ...(filter === "dent" ? styles.activeFilter : {}),
            }}
          >
            Dent Repair
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <p>Loading gallery photos...</p>
          </div>
        ) : (
          <>
            <div style={styles.galleryGrid}>
              {images.map((image) => (
                <div
                  key={image._id}
                  style={styles.galleryItem}
                  className="card-hover"
                  onClick={() => setSelectedImage(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    style={styles.galleryImage}
                  />
                  <div style={styles.imageOverlay}>
                    <span style={styles.viewText}>Click to View</span>
                  </div>
                </div>
              ))}
            </div>

            {images.length === 0 && (
              <div style={styles.emptyState}>
                <p>No images found for this category.</p>
              </div>
            )}
          </>
        )}

        <div style={styles.noteSection}>
          <p style={styles.noteText}>
            Note: Gallery images are placeholder content. Actual before/after
            photos can be managed through the admin panel.
          </p>
        </div>
      </div>

      {selectedImage && (
        <Modal open={!!selectedImage} onClose={() => setSelectedImage(null)}>
          <div style={styles.modalContent}>
            <img
              src={selectedImage}
              alt="Gallery photo"
              style={styles.modalImage}
            />
          </div>
        </Modal>
      )}
    </PublicLayout>
  );
};

const styles = {
  pageHeader: {
    background: "linear-gradient(135deg, #0047AB 0%, #0066CC 100%)",
    color: "#fff",
    padding: "4rem 2rem",
    textAlign: "center" as const,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
  },
  pageTitle: {
    fontSize: "3rem",
    fontWeight: "bold",
    margin: "0 0 1rem",
  },
  pageSubtitle: {
    fontSize: "1.25rem",
    opacity: 0.9,
    margin: 0,
  },
  filterSection: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    padding: "3rem 0 2rem",
    flexWrap: "wrap" as const,
  },
  filterButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#fff",
    border: "2px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  activeFilter: {
    backgroundColor: "#0047AB",
    color: "#fff",
    borderColor: "#0047AB",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "2rem",
    padding: "2rem 0",
  },
  galleryItem: {
    position: "relative" as const,
    cursor: "pointer",
    overflow: "hidden",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.3s",
    aspectRatio: "4/3",
    backgroundColor: "#000",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
  },
  loadingState: {
    textAlign: "center" as const,
    padding: "3rem",
    fontSize: "1.1rem",
    color: "#666",
  },
  imageOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 123, 255, 0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s",
  },
  viewText: {
    color: "#fff",
    fontSize: "1.25rem",
    fontWeight: "bold",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "3rem",
    fontSize: "1.1rem",
    color: "#666",
  },
  noteSection: {
    padding: "2rem",
    margin: "2rem 0",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    textAlign: "center" as const,
  },
  noteText: {
    margin: 0,
    color: "#666",
    fontSize: "0.95rem",
  },
  modalContent: {
    padding: "1rem",
    maxWidth: "90vw",
    maxHeight: "90vh",
  },
  modalImage: {
    maxWidth: "100%",
    maxHeight: "85vh",
    objectFit: "contain" as const,
    display: "block",
    margin: "0 auto",
  },
};

export default Gallery;
