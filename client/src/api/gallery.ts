import apiClient from '../utils/apiClient';

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
  try {
    const url = category && category !== "all"
      ? `/gallery?category=${category}`
      : '/gallery';

    const response = await apiClient.get(url);
    return response.data.photos;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch gallery photos');
  }
}

// Admin API
export async function uploadGalleryPhoto(
  title: string,
  description: string,
  category: string,
  file: File
): Promise<GalleryPhoto> {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("photo", file);

    const response = await apiClient.post('/gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.photo;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to upload photo');
  }
}

export async function updateGalleryPhoto(
  id: string,
  updates: Partial<Pick<GalleryPhoto, 'title' | 'description' | 'category' | 'order'>>
): Promise<GalleryPhoto> {
  try {
    const response = await apiClient.patch(`/gallery/${id}`, updates);
    return response.data.photo;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update photo');
  }
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  try {
    await apiClient.delete(`/gallery/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete photo');
  }
}
