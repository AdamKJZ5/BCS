const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export interface GalleryPhoto {
  _id: string;
  title: string;
  description: string;
  category: "collision" | "painting" | "dent";
  filename: string;
  url: string;
  order: number;
  createdAt: string;
}

// Public API
export async function getGalleryPhotos(category?: string): Promise<GalleryPhoto[]> {
  const url = category && category !== "all"
    ? `${API_BASE}/api/gallery?category=${category}`
    : `${API_BASE}/api/gallery`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Failed to fetch gallery photos');
  }

  const data = await res.json();
  return data.photos;
}

// Admin API
export async function uploadGalleryPhoto(
  title: string,
  description: string,
  category: string,
  file: File
): Promise<GalleryPhoto> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("photo", file);

  const res = await fetch(`${API_BASE}/api/gallery`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to upload photo');
  }

  const data = await res.json();
  return data.photo;
}

export async function updateGalleryPhoto(
  id: string,
  updates: Partial<Pick<GalleryPhoto, 'title' | 'description' | 'category' | 'order'>>
): Promise<GalleryPhoto> {
  const res = await fetch(`${API_BASE}/api/gallery/${id}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error('Failed to update photo');
  }

  const data = await res.json();
  return data.photo;
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/gallery/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to delete photo');
  }
}
