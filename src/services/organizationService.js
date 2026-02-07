import { api } from './api';

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const organizationService = {
  // Get all organizations
  getAllOrganizations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data: data.data || [], error: data.detail };
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Get single organization by ID
  getOrganizationById: async (orgId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data: data.data, error: data.detail };
    } catch (error) {
      console.error('Error fetching organization:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Create new organization
  createOrganization: async (organizationData) => {
    try {
      // Clean data - convert empty strings to null
      const cleanedData = {};
      for (const [key, value] of Object.entries(organizationData)) {
        cleanedData[key] = (typeof value === 'string' && value.trim() === '') ? null : value;
      }

      const response = await fetch(`${API_BASE_URL}/organizations/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cleanedData),
      });
      
      const data = await response.json();
      return { 
        success: response.ok, 
        data: data.data, 
        error: data.detail,
        message: data.message 
      };
    } catch (error) {
      console.error('Error creating organization:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Update organization
  updateOrganization: async (orgId, organizationData) => {
    try {
      const cleanedData = {};
      for (const [key, value] of Object.entries(organizationData)) {
        cleanedData[key] = (typeof value === 'string' && value.trim() === '') ? null : value;
      }

      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cleanedData),
      });
      
      const data = await response.json();
      return { 
        success: response.ok, 
        data: data.data, 
        error: data.detail,
        message: data.message 
      };
    } catch (error) {
      console.error('Error updating organization:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Delete organization
  deleteOrganization: async (orgId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      return { 
        success: response.ok || response.status === 204,
        error: response.ok ? null : 'Failed to delete organization'
      };
    } catch (error) {
      console.error('Error deleting organization:', error);
      return { success: false, error: error.message };
    }
  },

  // Get users in organization
  getOrganizationUsers: async (orgId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/users`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data: data.data || [], error: data.detail };
    } catch (error) {
      console.error('Error fetching organization users:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Assign user to organization
  assignUserToOrganization: async (orgId, userId, roleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId, role_id: roleId }),
      });
      
      const data = await response.json();
      return { 
        success: response.ok, 
        data: data.data, 
        error: data.detail,
        message: data.message 
      };
    } catch (error) {
      console.error('Error assigning user:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Remove user from organization
  removeUserFromOrganization: async (orgId, userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      return { 
        success: response.ok || response.status === 204,
        error: response.ok ? null : 'Failed to remove user'
      };
    } catch (error) {
      console.error('Error removing user:', error);
      return { success: false, error: error.message };
    }
  },
  getOrganizationMembers: async (orgId) => {
    const response = await api.get(`/organizations/${orgId}/users`);
    return response.data.data || [];
  },

  // Assign client to organization
  assignClientToOrganization: async (orgId, userId, roleId = 2) => {
    const response = await api.post(`/organizations/${orgId}/users`, {
      user_id: userId,
      role_id: roleId,
    });
    return response.data;
  },

  // Remove client from organization
  removeClientFromOrganization: async (orgId, userId) => {
    const response = await api.delete(`/organizations/${orgId}/users/${userId}`);
    return response.data;
  },
};

export default organizationService;
