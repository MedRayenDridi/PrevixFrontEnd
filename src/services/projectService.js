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
    console.log('🚀 Starting upload to project:', projectId);
    console.log('📁 Total files:', files.length);
    
    const results = {
      excel_files: [],
      pdf_files: [],
      other_files: [],
      errors: []
    };

    for (const file of files) {
      console.log('\n📄 Processing file:', file.name);
      console.log('   Type:', file.type);
      console.log('   Size:', file.size, 'bytes');
      
      try {
        const formData = new FormData();
        formData.append('file', file);

        if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          console.log('   ➡️ Detected as Excel file, calling /excel/lire_excel/');
          const response = await api.post('/excel/lire_excel/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('   ✅ Excel response:', response.data);
          results.excel_files.push({
            file_name: file.name,
            data: response.data
          });
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          console.log('   ➡️ Detected as PDF file, calling /pdf/extract_pdf/');
          console.log('   📍 Base URL:', api.defaults.baseURL);
          console.log('   📍 Full URL:', api.defaults.baseURL + '/pdf/extract_pdf/');
          console.log('   📍 FormData contents:', formData.get('file'));
          const response = await api.post('/pdf/extract_pdf/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('   ✅ PDF response:', response.data);
          results.pdf_files.push({
            file_name: file.name,
            data: response.data
          });
        } else {
          console.log('   ➡️ Detected as other file type, calling /upload');
          const otherFormData = new FormData();
          otherFormData.append('files', file);
          const response = await api.post('/upload', otherFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('   ✅ Other file response:', response.data);
          results.other_files.push({
            file_name: file.name,
            data: response.data
          });
        }
      } catch (error) {
        console.error('   ❌ Error processing file:', file.name);
        console.error('   Error details:', error.response?.data || error.message);
        console.error('   Full error:', error);
        results.errors.push({
          file_name: file.name,
          error: error.response?.data?.detail || error.message
        });
      }
    }

    console.log('\n📊 Upload Summary:');
    console.log('   Excel files:', results.excel_files.length);
    console.log('   PDF files:', results.pdf_files.length);
    console.log('   Other files:', results.other_files.length);
    console.log('   Errors:', results.errors.length);

    if (results.excel_files.length > 0 || results.pdf_files.length > 0 || results.other_files.length > 0) {
      try {
        console.log('\n💾 Saving assets to project...');
        const assetPayload = {
          project_id: projectId,
          excel_data: results.excel_files,
          pdf_data: results.pdf_files,
          other_data: results.other_files
        };
        console.log('   Payload:', assetPayload);
        
        const saveResponse = await api.post(`/projects/${projectId}/assets`, assetPayload);
        console.log('   ✅ Assets saved successfully:', saveResponse.data);
      } catch (error) {
        console.error('   ❌ Failed to save assets to project:', error);
        console.error('   Error response:', error.response?.data);
        console.error('   Full error:', error);
      }
    }

    console.log('\n✅ Upload complete, returning results');
    return results;
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

  getExtractedImages: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/extracted-images`);
    return response.data;
  },

  getExtractedTables: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/extracted-tables`);
    return response.data;
  },

  getTablePreview: async (projectId, filename, rows = 10) => {
    const response = await api.get(`/projects/${projectId}/tables/${filename}/preview?rows=${rows}`);
    return response.data;
  },
};
