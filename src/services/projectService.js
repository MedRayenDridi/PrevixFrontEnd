import { api } from './api';

export const projectService = {
  // Create a new project
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects/', projectData);
      console.log('Create project response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Get all projects (filtered by backend based on user role)
  getProjects: async () => {
    try {
      const response = await api.get('/projects/');
      console.log('🔍 Raw API response:', response.data);
      
      // Backend returns: { success: true, data: [...], total: number }
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('✅ Extracted data array, count:', response.data.data.length);
        return response.data.data;
      }
      
      // Fallback: if response is already an array
      if (Array.isArray(response.data)) {
        console.log('✅ Response is array, count:', response.data.length);
        return response.data;
      }
      
      console.warn('⚠️ Unexpected format:', response.data);
      return [];
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      throw error;
    }
  },

  // Get a specific project by ID
  getProject: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      console.log('Get project response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
  },

  // Update a project
  updateProject: async (projectId, updateData) => {
    try {
      const response = await api.put(`/projects/${projectId}`, updateData);
      console.log('Update project response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating project ${projectId}:`, error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (projectId) => {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      console.log('Delete project response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting project ${projectId}:`, error);
      throw error;
    }
  },

  // Get assets for a project
  getAssets: async (projectId) => {
    try {
      const response = await api.get(`/assets?project_id=${projectId}`);
      console.log('Get assets response:', response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching assets for project ${projectId}:`, error);
      throw error;
    }
  },

  // Get a specific asset
  getAsset: async (assetId) => {
    try {
      const response = await api.get(`/assets/${assetId}`);
      console.log('Get asset response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching asset ${assetId}:`, error);
      throw error;
    }
  },

  // Create an asset
  createAsset: async (assetData) => {
    try {
      const response = await api.post('/assets', assetData);
      console.log('Create asset response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  },

  // Update an asset
  updateAsset: async (assetId, assetData) => {
    try {
      const response = await api.put(`/assets/${assetId}`, assetData);
      console.log('Update asset response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating asset ${assetId}:`, error);
      throw error;
    }
  },

  // Delete an asset
  deleteAsset: async (assetId) => {
    try {
      const response = await api.delete(`/assets/${assetId}`);
      console.log('Delete asset response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting asset ${assetId}:`, error);
      throw error;
    }
  },

  // Upload files to project
  uploadToProject: async (projectId, files) => {
    console.log('🚀 Starting upload to project:', projectId);
    console.log('📁 Total files:', files.length);

    const results = {
      excel_files: [],
      pdf_files: [],
      other_files: [],
      errors: [],
    };

    for (const file of files) {
      console.log('\n📄 Processing file:', file.name);
      console.log('   Type:', file.type);
      console.log('   Size:', file.size, 'bytes');

      try {
        const formData = new FormData();
        formData.append('file', file);

        if (
          file.type.includes('spreadsheet') ||
          file.type.includes('excel') ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls')
        ) {
          console.log('   ➡️ Detected as Excel file, calling /excel/lire_excel/');
          const response = await api.post('/excel/lire_excel/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log('   ✅ Excel response:', response.data);
          results.excel_files.push({
            file_name: file.name,
            data: response.data,
          });
        } else if (
          file.type === 'application/pdf' ||
          file.name.endsWith('.pdf')
        ) {
          console.log('   ➡️ Detected as PDF file, calling /pdf/extract_pdf/');
          const response = await api.post('/pdf/extract_pdf/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log('   ✅ PDF response:', response.data);
          results.pdf_files.push({
            file_name: file.name,
            data: response.data,
          });
        } else {
          console.log('   ➡️ Detected as other file type, calling /upload');
          const otherFormData = new FormData();
          otherFormData.append('files', file);
          const response = await api.post('/upload', otherFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          console.log('   ✅ Other file response:', response.data);
          results.other_files.push({
            file_name: file.name,
            data: response.data,
          });
        }
      } catch (error) {
        console.error('   ❌ Error processing file:', file.name);
        console.error('   Error details:', error.response?.data || error.message);
        results.errors.push({
          file_name: file.name,
          error: error.response?.data?.detail || error.message,
        });
      }
    }

    console.log('\n📊 Upload Summary:');
    console.log('   Excel files:', results.excel_files.length);
    console.log('   PDF files:', results.pdf_files.length);
    console.log('   Other files:', results.other_files.length);
    console.log('   Errors:', results.errors.length);

    if (
      results.excel_files.length > 0 ||
      results.pdf_files.length > 0 ||
      results.other_files.length > 0
    ) {
      try {
        console.log('\n💾 Saving assets to project...');
        const assetPayload = {
          project_id: projectId,
          excel_data: results.excel_files,
          pdf_data: results.pdf_files,
          other_data: results.other_files,
        };
        const saveResponse = await api.post(
          `/projects/${projectId}/assets`,
          assetPayload
        );
        console.log('   ✅ Assets saved successfully:', saveResponse.data);
      } catch (error) {
        console.error('   ❌ Failed to save assets to project:', error);
      }
    }

    console.log('\n✅ Upload complete, returning results');
    return results;
  },

  // Get project assets
  getProjectAssets: async (projectId) => {
    try {
      const response = await api.get(`/assets?project_id=${projectId}`);
      console.log('Get project assets response:', response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching project assets ${projectId}:`, error);
      throw error;
    }
  },

  // Get project report
  getReport: async (projectId, format = 'pdf') => {
    try {
      const response = await api.get(
        `/report/${projectId}?format=${format}`,
        {
          responseType: 'blob',
        }
      );
      console.log('Get report response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching report for project ${projectId}:`, error);
      throw error;
    }
  },

  // Get extracted images
  getExtractedImages: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/extracted-images`);
      console.log('Get extracted images response:', response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching extracted images for project ${projectId}:`, error);
      throw error;
    }
  },

  // Get extracted tables
  getExtractedTables: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/extracted-tables`);
      console.log('Get extracted tables response:', response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching extracted tables for project ${projectId}:`, error);
      throw error;
    }
  },

  // Get table preview
  getTablePreview: async (projectId, filename, rows = 10) => {
    try {
      const response = await api.get(
        `/projects/${projectId}/tables/${filename}/preview?rows=${rows}`
      );
      console.log('Get table preview response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching table preview for project ${projectId}:`, error);
      throw error;
    }
  },

  // Get evaluations for a project
  getEvaluations: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/evaluations`);
      console.log('Get evaluations response:', response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching evaluations for project ${projectId}:`, error);
      throw error;
    }
  },

  // Create evaluation
  createEvaluation: async (evaluationData) => {
    try {
      const response = await api.post('/evaluations', evaluationData);
      console.log('Create evaluation response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }
  },

  // Update evaluation
  updateEvaluation: async (evaluationId, evaluationData) => {
    try {
      const response = await api.put(`/evaluations/${evaluationId}`, evaluationData);
      console.log('Update evaluation response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating evaluation ${evaluationId}:`, error);
      throw error;
    }
  },

  // Delete evaluation
  deleteEvaluation: async (evaluationId) => {
    try {
      const response = await api.delete(`/evaluations/${evaluationId}`);
      console.log('Delete evaluation response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting evaluation ${evaluationId}:`, error);
      throw error;
    }
  },
};

export default projectService;
