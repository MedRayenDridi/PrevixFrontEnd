import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
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
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('token_type', response.data.token_type);
    }
    
    return response.data;
  },

  register: async ({ email, password, full_name, role_identity = 'client_previx', org_id }) => {
    // ONLY include org_id if given!
    const payload = { email, password, full_name, role_identity };
    if (org_id !== undefined && org_id !== null) {
      payload.org_id = org_id;
    }
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/users/me');
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/users/me', data);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  getUserRoles: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.user_roles || [];
  },

  hasRole: async (roleIdentity) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.user_roles) {
      return false;
    }
    return user.user_roles.some(ur => ur.role?.role_identity === roleIdentity);
  },

  isAdmin: async () => {
    return authService.hasRole('general_admin');
  },

  changePassword: async (current_password, new_password) => {
    const response = await api.post('/auth/change-password', {
      current_password,
      new_password,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getToken: () => {
    return localStorage.getItem('access_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export const projectService = {
  getProjects: async () => {
    try {
      const response = await api.get('/projects/');
      console.log('Raw response:', response.data);
      
      // Backend returns: { success, data: [...], total }
      if (response.data && Array.isArray(response.data.data)) {
        console.log('Returning data array:', response.data.data);
        return response.data.data;
      }
      
      // Fallback for other formats
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  getProject: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects/', projectData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  updateProject: async (projectId, projectData) => {
    try {
      const response = await api.put(`/projects/${projectId}`, projectData);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating project ${projectId}:`, error);
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting project ${projectId}:`, error);
      throw error;
    }
  },

  getAssets: async (projectId) => {
    try {
      const response = await api.get(`/assets?project_id=${projectId}`);
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error) {
      console.error(`Error fetching assets for project ${projectId}:`, error);
      throw error;
    }
  },

  getAsset: async (assetId) => {
    try {
      const response = await api.get(`/assets/${assetId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching asset ${assetId}:`, error);
      throw error;
    }
  },

  createAsset: async (assetData) => {
    try {
      const response = await api.post('/assets', assetData);
      return response.data;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  },

  updateAsset: async (assetId, assetData) => {
    try {
      const response = await api.put(`/assets/${assetId}`, assetData);
      return response.data;
    } catch (error) {
      console.error(`Error updating asset ${assetId}:`, error);
      throw error;
    }
  },

  deleteAsset: async (assetId) => {
    try {
      const response = await api.delete(`/assets/${assetId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting asset ${assetId}:`, error);
      throw error;
    }
  },

  getReport: async (projectId, format = 'pdf') => {
    try {
      const response = await api.get(`/report/${projectId}?format=${format}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching report for project ${projectId}:`, error);
      throw error;
    }
  },
};

export const organizationService = {
  getOrganizations: async () => {
    try {
      const response = await api.get('/organizations/');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  getOrganization: async (orgId) => {
    try {
      const response = await api.get(`/organizations/${orgId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching organization ${orgId}:`, error);
      throw error;
    }
  },

  createOrganization: async (orgData) => {
    try {
      const response = await api.post('/organizations/', orgData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  },

  updateOrganization: async (orgId, orgData) => {
    try {
      const response = await api.put(`/organizations/${orgId}`, orgData);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating organization ${orgId}:`, error);
      throw error;
    }
  },

  deleteOrganization: async (orgId) => {
    try {
      const response = await api.delete(`/organizations/${orgId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting organization ${orgId}:`, error);
      throw error;
    }
  },
};

export const userService = {
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users/');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  getUserByEmail: async (email) => {
    try {
      const response = await api.get(`/users/email/${email}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching user by email ${email}:`, error);
      throw error;
    }
  },
};

export const assetService = {
  uploadFiles: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const response = await api.post('/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
export const adminService = {
  // Get all users (admin only)
  getUsers: async () => {
    try {
      const response = await api.get('/admin/users/');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get all organizations (admin only)
  getOrganizations: async () => {
    try {
      const response = await api.get('/admin/organizations/');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  // Assign role to user
  assignRole: async (userId, roleId, orgId) => {
    try {
      const response = await api.post('/admin/assign-role', {
        user_id: userId,
        role_id: roleId,
        org_id: orgId,
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  },

  // Remove role from user
  removeRole: async (userRoleId) => {
    try {
      const response = await api.delete(`/admin/user-roles/${userRoleId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  },
  getAllClients: async () => {
    const users = await userService.getAllUsers();
    // if getAllUsers returns [{ user_id, roles: [...] }]
    // but likely it returns {user_id, ...}
    // so check with a second API if needed
    // But since you only have role_id:2 for client, filter by that from admin/users
    return users.filter(u =>
      (u.role && u.role.role_identity === 'client_previx') ||
      (u.user_roles && u.user_roles.some(r => r.role_id === 2 || r.role?.role_identity === 'client_previx'))
    );
  },

  // Get project files (admin only)
  getProjectFiles: async (projectId) => {
    try {
      const response = await api.get(`/admin/projects/${projectId}/files/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching files for project ${projectId}:`, error);
      throw error;
    }
  },

  // Run classification on a file (admin only)
  runClassification: async (projectId, fileId, autoImport = true) => {
    try {
      const response = await api.post(
        `/admin/projects/${projectId}/files/${fileId}/run-classification/`,
        null,
        {
          params: { auto_import: autoImport }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error running classification for file ${fileId}:`, error);
      throw error;
    }
  },
};

export const clientProjectService = {
  // Upload files to existing project
  uploadProjectFiles: async (projectId, files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      const response = await api.post(
        `/client/projects/${projectId}/files/upload/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error uploading files to project ${projectId}:`, error);
      throw error;
    }
  },

  // Upload files and create new project
  uploadFilesAndCreateProject: async (files, projectName = null, projectType = 'IFRS') => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      const response = await api.post(
        '/client/projects/upload-and-create/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params: {
            project_name: projectName,
            project_type: projectType,
            due_date_days: 90
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading files and creating project:', error);
      throw error;
    }
  },
};


export { api };
