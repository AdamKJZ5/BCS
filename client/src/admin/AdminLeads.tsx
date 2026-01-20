import { useEffect, useState } from "react";
import Modal from "../../components/Modal";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos: string[];
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Modal state
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [page]);

  async function fetchLeads() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/leads?page=${page}&limit=10`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch leads");
      }

      const json = await res.json();

      setLeads(json.data);
      setPagination(json.pagination);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function archiveLead(id: string) {
    const confirmed = confirm("Archive this lead?");
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/leads/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to archive lead");
      }

      setLeads((prev) => prev.filter((lead) => lead._id !== id));
    } catch (err) {
      alert("Error archiving lead");
    }
  }

  if (loading) return <p>Loading leads...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Leads</h1>

      {leads.length === 0 && <p>No leads found.</p>}

      {leads.map((lead) => (
        <div
          key={lead._id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "6px",
          }}
        >
          <p><strong>Name:</strong> {lead.name}</p>
          <p><strong>Email:</strong> {lead.email}</p>
          <p><strong>Phone:</strong> {lead.phone}</p>
          <p><strong>Message:</strong> {lead.message}</p>

          {lead.damageDescription && (
            <p><strong>Damage:</strong> {lead.damageDescription}</p>
          )}

          {lead.photos.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              {lead.photos.map((photo) => (
                <img
                  key={photo}
                  src={photo}
                  alt="Damage"
                  width={60}
                  height={60}
                  style={{ objectFit: "cover", cursor: "pointer" }}
                  onClick={() => {
                    setSelectedPhotos(lead.photos);
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => archiveLead(lead._id)}
            style={{ marginTop: "0.75rem" }}
          >
            Archive
          </button>
        </div>
      ))}

      {pagination && (
        <div style={{ marginTop: "1rem" }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          <span style={{ margin: "0 1rem" }}>
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {selectedPhotos.map((photo) => (
            <img
              key={photo}
              src={photo}
              alt="Damage"
              style={{ maxWidth: "400px", maxHeight: "400px" }}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}
