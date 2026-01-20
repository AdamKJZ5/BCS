import { useEffect, useState } from "react";
import {
  fetchLeads,
  updateLeadStatus,
  archiveLead,
} from "../../api/adminLeads";

type Lead = {
  _id: string;
  name: string;
  email: string;
  status: "new" | "contacted" | "closed";
  photos: string[];
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch leads when page changes
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

  // Update lead status
  function handleStatusChange(
    id: string,
    newStatus: "new" | "contacted" | "closed"
  ) {
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

  // Archive lead
  function handleArchive(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to archive this lead?"
    );

    if (!confirmed) return;

    archiveLead(id)
      .then(() => {
        setLeads((prev) => prev.filter((lead) => lead._id !== id));
      })
      .catch(() => {
        alert("Failed to archive lead");
      });
  }

  if (loading) return <p>Loading leads...</p>;

  return (
    <div>
      <h1>Admin Leads</h1>

      {leads.map((lead) => (
        <div
          key={lead._id}
          style={{
            borderBottom: "1px solid #ccc",
            paddingBottom: "1rem",
            marginBottom: "1rem",
          }}
        >
          <p>
            <strong>{lead.name}</strong>
          </p>
          <p>{lead.email}</p>

          <p>
            Status:{" "}
            <select
              value={lead.status}
              onChange={(e) =>
                handleStatusChange(
                  lead._id,
                  e.target.value as "new" | "contacted" | "closed"
                )
              }
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </p>

          <button
            onClick={() => handleArchive(lead._id)}
            style={{ color: "red" }}
          >
            Archive
          </button>
        </div>
      ))}

      <div style={{ marginTop: "1rem" }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>

        <span style={{ margin: "0 1rem" }}>
          Page {page} of {pages}
        </span>

        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
