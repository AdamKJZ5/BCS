import { useEffect, useState } from "react";
import { fetchLeads, updateLeadStatus, archiveLead } from "../../api/adminLeads";
import Modal from "../../components/Modal";

type Lead = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos: string[];
  status: "new" | "contacted" | "closed";
  createdAt: string;
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetchLeads(page, 10)
      .then((res) => {
        setLeads(res.data);
        setPages(res.pagination.pages);
      })
      .catch(() => {
        alert("Failed to load leads");
      })
      .finally(() => setLoading(false));
  }, [page]);

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

  if (loading) return <div style={{ padding: "2rem" }}>Loading leads...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Admin Leads Dashboard</h1>

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

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
    </div>
  );
}
