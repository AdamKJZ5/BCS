import axios from 'axios';

// Centralized API base URL - no more duplicates!
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5138/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor: Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to appropriate login page based on current path
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else if (window.location.pathname.startsWith('/customer')) {
        window.location.href = '/customer/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data?.message);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - server may be down');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function for file uploads
export const createFormDataRequest = (files: Record<string, File | File[]>, data?: Record<string, any>) => {
  const formData = new FormData();

  // Add files
  Object.entries(files).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(file => formData.append(key, file));
    } else {
      formData.append(key, value);
    }
  });

  // Add other data
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    });
  }

  return formData;
};

// Export API_BASE for components that need it
export { API_BASE };
