import axios from 'axios';

/**
 * When the SPA is served over HTTPS, never call the API over plain HTTP (browsers block mixed content).
 * Render / env often set VITE_API_BASE_URL with http:// — upgrade at runtime (and in the axios interceptor
 * so every request is safe even if baseURL was wrong when the module first loaded).
 */
export function upgradeHttpToHttpsIfNeeded(url) {
  if (typeof url !== 'string' || !url) return url;
  const trimmed = url.trim();
  if (typeof window === 'undefined' || window.location?.protocol !== 'https:') return trimmed;
  if (!/^http:\/\//i.test(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('http://localhost') || lower.startsWith('http://127.0.0.1')) return trimmed;
  return trimmed.replace(/^http:\/\//i, 'https://');
}

const RAW_API_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000').trim();
export const API_URL = upgradeHttpToHttpsIfNeeded(RAW_API_URL);

// Default API timeout. Chat calls through Ollama tunnels can take >30s on first token.
// Override with VITE_API_TIMEOUT_MS when needed.
const API_TIMEOUT_MS = Number(import.meta.env?.VITE_API_TIMEOUT_MS) || 120000;
// Timeout for AutoCAD describe endpoint. Extraction + AI interpretation can be slow.
// Override with VITE_AUTOCAD_DESCRIBE_TIMEOUT_MS when needed.
const AUTOCAD_DESCRIBE_TIMEOUT_MS =
  Number(import.meta.env?.VITE_AUTOCAD_DESCRIBE_TIMEOUT_MS) || 300000;

// Timeout for long-running Manus report generation (large files). Default 30 min; override with VITE_MANUS_REPORT_TIMEOUT_MS.
const MANUS_REPORT_TIMEOUT_MS = Number(import.meta.env?.VITE_MANUS_REPORT_TIMEOUT_MS) || 30 * 60 * 1000;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT_MS,
});

// Keep baseURL aligned with page scheme (covers edge cases where defaults were set before window existed).
api.defaults.baseURL = upgradeHttpToHttpsIfNeeded(api.defaults.baseURL);

// Add token to requests if available
api.interceptors.request.use((config) => {
  const base = config.baseURL ?? api.defaults.baseURL;
  const safeBase = upgradeHttpToHttpsIfNeeded(base);
  if (safeBase !== base) {
    config.baseURL = safeBase;
    api.defaults.baseURL = safeBase;
  }

  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // If a caller passes an absolute HTTP URL while the app is on HTTPS, upgrade it.
  if (
    typeof window !== 'undefined' &&
    window.location?.protocol === 'https:' &&
    typeof config.url === 'string' &&
    /^http:\/\//i.test(config.url)
  ) {
    config.url = config.url.replace(/^http:\/\//i, 'https://');
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
      const response = await api.get('/admin/users');
      return response.data.data ?? response.data;
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
      const response = await api.delete(`/admin/users/${userId}`);
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
      const response = await api.get('/admin/users');
      return response.data.data ?? response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get all organizations (admin only)
  getOrganizations: async () => {
    try {
      const response = await api.get('/admin/organizations');
      return response.data.data ?? response.data;
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
  getClassificationStatus: async (projectId, fileId) => {
    try {
      const response = await api.get(`/admin/projects/${projectId}/files/${fileId}/classification-status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classification status:', error);
      throw error;
    }
  },

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
  // Upload files to existing project (supports optional onUploadProgress callback)
  uploadProjectFiles: async (projectId, files, onUploadProgress = null) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      if (typeof onUploadProgress === 'function') {
        config.onUploadProgress = (progressEvent) => {
          try { onUploadProgress(progressEvent); } catch (e) { /* ignore */ }
        };
      }

      const response = await api.post(
        `/client/projects/${projectId}/files/upload/`,
        formData,
        config
      );
      return response.data;
    } catch (error) {
      console.error(`Error uploading files to project ${projectId}:`, error);
      throw error;
    }
  },

  // Upload files and create new project
  uploadFilesAndCreateProject: async (files, projectName = null, projectType = 'IFRS', onUploadProgress = null) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: {
          project_name: projectName,
          project_type: projectType,
          due_date_days: 90
        }
      };
      if (typeof onUploadProgress === 'function') {
        config.onUploadProgress = onUploadProgress;
      }

      const response = await api.post(
        '/client/projects/upload-and-create/',
        formData,
        config
      );
        return response.data;
      } catch (error) {
        console.error('Error uploading files and creating project:', error);
        throw error;
      }
    },

    // Get project files for client users
    getProjectFiles: async (projectId) => {
      try {
        const response = await api.get(`/client/projects/${projectId}/files/`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching client files for project ${projectId}:`, error);
        throw error;
      }
    },
  };

// AI Assistant Service
export const aiAssistantService = {
  sendMessage: async (message, files = [], conversationHistory = null, conversationId = null) => {
    try {
      const formData = new FormData();
      formData.append('message', message);
      if (conversationId != null) formData.append('conversation_id', String(conversationId));
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file.file || file);
        });
      }
      if (conversationHistory && conversationHistory.length > 0) {
        formData.append('conversation_history', JSON.stringify(
          conversationHistory.map(msg => ({ role: msg.role, content: msg.content }))
        ));
      }
      const response = await api.post('/ai-assistant/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message to AI Assistant:', error);
      const status = error.response?.status;
      if (status === 502 || status === 503 || status === 504) {
        error.userMessage =
          'Le service d\'assistant IA est temporairement indisponible (Bad Gateway). Vérifiez que RAGPrevix est démarré et que RAGPREVIX_URL est correct sur le backend, puis réessayez.';
      } else if (status === 404) {
        error.userMessage = 'Le service d\'assistant IA n\'est pas configuré sur ce serveur.';
      } else if (error.message) {
        error.userMessage = error.message;
      }
      throw error;
    }
  },

  checkHealth: async () => {
    try {
      const response = await api.get('/ai-assistant/health');
      return response.data;
    } catch (error) {
      console.error('Error checking AI Assistant health:', error);
      return { status: 'error', error: error.message };
    }
  },

  /** Get current user's chat history for one conversation (legacy: single thread). */
  getHistory: async (conversationId = null) => {
    try {
      if (conversationId == null) return [];
      const response = await api.get(`/ai-assistant/conversations/${conversationId}/messages`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error loading AI Assistant history:', error);
      return [];
    }
  },

  /** List current user's conversations (for history sidebar). */
  getConversations: async () => {
    try {
      const response = await api.get('/ai-assistant/conversations');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error loading AI Assistant conversations:', error);
      return [];
    }
  },

  /** Get messages for one conversation. */
  getConversationMessages: async (conversationId) => {
    try {
      const response = await api.get(`/ai-assistant/conversations/${conversationId}/messages`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      return [];
    }
  },

  /** Update conversation (e.g. rename title). */
  updateConversation: async (conversationId, { title }) => {
    const response = await api.patch(`/ai-assistant/conversations/${conversationId}`, { title });
    return response.data;
  },

  /** Delete a conversation and all its messages. */
  deleteConversation: async (conversationId) => {
    await api.delete(`/ai-assistant/conversations/${conversationId}`);
  },
};

export const manusService = {
  /**
   * Generate Valuation IA Excel report from uploaded files
   * @param {File[]} files - Array of files (PDF, Excel, AutoCAD)
   * @param {string} projectName - Optional project name
   * @param {number} projectId - Optional project ID
   * @returns {Promise<Blob>} Excel file blob
   */
  generateReport: async (files, projectName = null, projectId = null) => {
    try {
      const formData = new FormData();
      
      // Add all files
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      // Add optional parameters
      if (projectName) {
        formData.append('project_name', projectName);
      }
      if (projectId) {
        formData.append('project_id', projectId.toString());
      }
      
      const response = await api.post('/manus/report-from-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
        timeout: MANUS_REPORT_TIMEOUT_MS, // 30 min default for large files; set VITE_MANUS_REPORT_TIMEOUT_MS to override
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating Valuation IA report:', error);
      if (error?.code === 'ECONNABORTED' && error?.message?.includes('timeout')) {
        error.message = `La génération du rapport a dépassé le temps imparti (${MANUS_REPORT_TIMEOUT_MS / 60000} min). Fichiers très volumineux : essayez avec moins de fichiers ou des fichiers plus petits, ou augmentez VITE_MANUS_REPORT_TIMEOUT_MS.`;
      }
      throw error;
    }
  },

  /**
   * List past Valuation IA Excel reports stored on the backend (newest first).
   * @returns {Promise<{ reports: Array }>}
   */
  listReportHistory: async () => {
    const response = await api.get('/manus/report-history');
    return response.data;
  },

  /**
   * Download a previously generated Excel by report id from server history.
   * @returns {Promise<{ blob: Blob, filename: string }>}
   */
  downloadHistoryReport: async (reportId) => {
    const response = await api.get(
      `/manus/report-history/${encodeURIComponent(reportId)}/download`,
      { responseType: 'blob' }
    );
    let filename = `rapport_valuation_${reportId}.xlsx`;
    const cd = response.headers['content-disposition'];
    if (cd && typeof cd === 'string') {
      const starMatch = cd.match(/filename\*=UTF-8''([^;\n]+)/i);
      const plainMatch = cd.match(/filename="?([^";\n]+)"?/);
      const raw = starMatch ? starMatch[1] : plainMatch ? plainMatch[1] : null;
      if (raw) {
        try {
          filename = decodeURIComponent(raw.trim());
        } catch {
          filename = raw.trim();
        }
      }
    }
    return { blob: response.data, filename };
  },

  /** Link a history Excel report to a DB project (or clear with null). */
  patchReportProject: async (reportId, projectId) => {
    const response = await api.patch(
      `/manus/report-history/${encodeURIComponent(reportId)}/project`,
      { project_id: projectId }
    );
    return response.data;
  },

  /** Load workbook as JSON grids for the in-app editor. */
  getReportWorkbook: async (reportId) => {
    const response = await api.get(
      `/manus/report-history/${encodeURIComponent(reportId)}/workbook`
    );
    return response.data;
  },

  /** Save edited grids back to the stored .xlsx. */
  saveReportWorkbook: async (reportId, payload) => {
    const response = await api.put(
      `/manus/report-history/${encodeURIComponent(reportId)}/workbook`,
      payload
    );
    return response.data;
  },

  /**
   * Generate Valuation IA PDF report from uploaded files
   * @param {File[]} files
   * @param {string} projectName
   * @param {string} projectType
   * @param {string} orgName
   * @param {string} orgIndustry
   * @returns {Promise<Blob>} PDF file blob
   */
  /**
   * Generate Word report (same endpoint as before; server returns .docx).
   * @returns {{ blob: Blob, filename?: string }} blob and optional filename from Content-Disposition
   */
  generatePdfReport: async (files, projectName = null, projectType = null, orgName = null, orgIndustry = null) => {
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      if (projectName) {
        formData.append('project_name', projectName);
      }
      if (projectType) {
        formData.append('project_type', projectType);
      }
      if (orgName) {
        formData.append('org_name', orgName);
      }
      if (orgIndustry) {
        formData.append('org_industry', orgIndustry);
      }

      const response = await api.post('/manus/from-files-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
        timeout: MANUS_REPORT_TIMEOUT_MS,
      });

      let filename = null;
      const cd = response.headers['content-disposition'];
      if (cd && typeof cd === 'string') {
        const match = cd.match(/filename="?([^";\n]+)"?/);
        if (match) filename = match[1].trim();
      }
      return { blob: response.data, filename: filename || undefined };
    } catch (error) {
      console.error('Error generating Valuation IA Word report:', error);
      if (error?.code === 'ECONNABORTED' && error?.message?.includes('timeout')) {
        error.message = `La génération du rapport Word a dépassé le temps imparti (${MANUS_REPORT_TIMEOUT_MS / 60000} min). Réduisez la taille des fichiers ou augmentez VITE_MANUS_REPORT_TIMEOUT_MS.`;
      }
      throw error;
    }
  },

  /**
   * Check Valuation IA service health
   */
  checkHealth: async () => {
    try {
      const response = await api.get('/manus/health');
      return response.data;
    } catch (error) {
      console.error('Error checking Valuation IA health:', error);
      return { status: 'error', error: error.message };
    }
  },

  /**
   * Describe an AutoCAD file: code extraction (geometry, dimensions, annotations, layers)
   * then LLM interpretation. Returns detailed French description.
   * @param {File} file - Single .dwg or .dxf file
   * @returns {Promise<{ description: string, metadata?: object }>}
   */
  describeAutocad: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/manus/autocad-describe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: AUTOCAD_DESCRIBE_TIMEOUT_MS,
    });
    return response.data;
  },
};

export { api };
