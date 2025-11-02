import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://prevex.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  register: async ({ email, password, name, picture }) => {
    const params = new URLSearchParams({ email, password, name });
    if (picture) {
      params.append('picture', picture);
    }
    const response = await api.post(`/auth/register?${params.toString()}`);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },
};

export const assetService = {
  uploadFiles: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getAssets: async (fileId) => {
    const response = await api.get(`/assets/${fileId}`);
    return response.data;
  },
  getReport: async (fileId, format = 'pdf') => {
    const response = await api.get(`/report/${fileId}?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const adminService = {
  getUsers: async () => {
    const response = await api.get('/admin/users');
    // Handle both formats: { users: [...] } or [...]
    return response.data.users || response.data;
  },
  getClients: async () => {
    const response = await api.get('/admin/clients');
    // Extract the clients array from the response object
    return response.data.clients || response.data;
  },
};

export { api };
