import apiClient from '../utils/apiClient';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: string;
  };
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

export const getMe = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch user");
  }
};
