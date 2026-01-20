const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY;

export async function fetchLeads(page = 1, limit = 10) {
  const res = await fetch(
    `${API_BASE}/api/admin/leads?page=${page}&limit=${limit}`,
    {
      headers: {
        "x-api-key": ADMIN_KEY,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch leads");
  }

  return res.json();
}

export async function updateLeadStatus(
  id: string,
  status: "new" | "contacted" | "closed"
) {
  const res = await fetch(
    `${API_BASE}/api/admin/leads/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ADMIN_KEY,
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update status");
  }
}

export async function archiveLead(id: string) {
  const res = await fetch(
    `${API_BASE}/api/admin/leads/${id}`,
    {
      method: "DELETE",
      headers: {
        "x-api-key": ADMIN_KEY,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to archive lead");
  }
}
