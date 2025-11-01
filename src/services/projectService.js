import { api } from './api';

export const projectService = {
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  updateProject: async (projectId, updateData) => {
    const response = await api.put(`/projects/${projectId}`, updateData);
    return response.data;
  },

  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  uploadToProject: async (projectId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const response = await api.post(`/projects/${projectId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProjectAssets: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/assets`);
    return response.data;
  },

  getProjectReport: async (projectId, format = 'pdf') => {
    const response = await api.get(`/projects/${projectId}/report?format=${format}&lang=fr`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
