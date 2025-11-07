import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const projectsArray = await projectService.getProjects();
      
      console.log('ProjectContext - Fetched:', projectsArray);
      console.log('Is Array?', Array.isArray(projectsArray));
      console.log('Count:', projectsArray?.length);
      
      setProjects(Array.isArray(projectsArray) ? projectsArray : []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await projectService.createProject(projectData);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (projectId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await projectService.updateProject(projectId, updateData);
      setProjects((prev) =>
        prev.map((project) =>
          project.project_id === projectId ? updatedProject : project
        )
      );
      if (currentProject && currentProject.project_id === projectId) {
        setCurrentProject(updatedProject);
      }
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  const deleteProject = useCallback(async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      await projectService.deleteProject(projectId);
      setProjects((prev) =>
        prev.filter((project) => project.project_id !== projectId)
      );
      if (currentProject && currentProject.project_id === projectId) {
        setCurrentProject(null);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  const getProject = useCallback(async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const project = await projectService.getProject(projectId);
      setCurrentProject(project);
      return project;
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjectAssets = useCallback(async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const assetsData = await projectService.getAssets(projectId);
      return Array.isArray(assetsData) ? assetsData : [];
    } catch (err) {
      console.error('Error fetching project assets:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch project assets');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAsset = useCallback(async (projectId, assetData) => {
    try {
      setLoading(true);
      setError(null);
      const newAsset = await projectService.createAsset({
        ...assetData,
        project_id: projectId,
      });
      return newAsset;
    } catch (err) {
      console.error('Error creating asset:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to create asset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAsset = useCallback(async (assetId, assetData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedAsset = await projectService.updateAsset(assetId, assetData);
      return updatedAsset;
    } catch (err) {
      console.error('Error updating asset:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to update asset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAsset = useCallback(async (assetId) => {
    try {
      setLoading(true);
      setError(null);
      await projectService.deleteAsset(assetId);
    } catch (err) {
      console.error('Error deleting asset:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to delete asset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectReport = useCallback(async (projectId, format = 'pdf') => {
    try {
      setLoading(true);
      setError(null);
      const report = await projectService.getReport(projectId, format);
      return report;
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch projects only when user changes
  useEffect(() => {
    if (user && user.user_id) {
      fetchProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [user?.user_id, fetchProjects]);

  const value = {
    projects,
    currentProject,
    setCurrentProject,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    fetchProjectAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    getProjectReport,
    clearError,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
