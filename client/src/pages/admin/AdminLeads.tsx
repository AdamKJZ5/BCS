import { useEffect, useState } from "react";
import { fetchLeads } from "../../api/adminLeads";

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetchLeads(page, 10)
      .then((res) => {
        setLeads(res.data);
        setPages(res.pagination.pages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <p>Loading leads...</p>;

  return (
    <div>
      <h1>Admin Leads</h1>

      {leads.map((lead) => (
        <div key={lead._id} style={{ borderBottom: "1px solid #ccc" }}>
          <p><strong>{lead.name}</strong></p>
          <p>{lead.email}</p>
          <p>Status: {lead.status}</p>
        </div>
      ))}

      <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
        Prev
      </button>

      <span> Page {page} of {pages} </span>

      <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </div>
  );
}
